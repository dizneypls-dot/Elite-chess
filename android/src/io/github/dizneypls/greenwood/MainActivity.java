/* © 2026 Elite Chess. All rights reserved. Proprietary: no copying, reuse or AI training without written permission. See terms.html. */
package io.github.dizneypls.greenwood;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.concurrent.atomic.AtomicBoolean;

/* Elite Chess for Android: one full-screen WebView running the single-file app (Elite-Chess.html).
   The copy built into the APK (assets/index.html) is used until a newer one has been downloaded from
   elitechess.online into files/web/; app-version.json says which build each copy is. Web links open in the browser.
   The page talks to the app through window.EliteApp (Bridge) and hears back through GW.appUpdate(state, how). */
public class MainActivity extends Activity {
    private static final String SITE = "https://elitechess.online/";
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final AtomicBoolean checking = new AtomicBoolean(false);
    private WebView web;
    private JSONObject running;
    private boolean started = false, usingDownloaded = false;

    interface Source { InputStream open() throws Exception; }

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        int bg = Color.parseColor("#12112a");
        getWindow().setStatusBarColor(bg);
        getWindow().setNavigationBarColor(bg);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        web = new WebView(this);
        web.setBackgroundColor(bg);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String scheme = u.getScheme();
                if ("file".equals(scheme) || "about".equals(scheme) || "data".equals(scheme) || "blob".equals(scheme)) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) {}
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "EliteApp");
        setContentView(web);
        hideSystemBars();
        load();
    }

    // Full screen: the status bar and navigation bar stay hidden; a swipe from the edge shows them for a moment
    private void hideSystemBars() {
        Window w = getWindow();
        if (Build.VERSION.SDK_INT >= 30) {
            w.setDecorFitsSystemWindows(false);
            WindowInsetsController c = w.getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            w.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private File dir() { return new File(getFilesDir(), "web"); }

    private void load() {
        JSONObject built = readJson(() -> getAssets().open("app-version.json"));
        File page = new File(dir(), "index.html");
        JSONObject got = page.exists() ? readJson(() -> new FileInputStream(new File(dir(), "app-version.json"))) : null;
        usingDownloaded = got != null && got.optLong("time") > (built == null ? 0 : built.optLong("time"));
        running = usingDownloaded ? got : built;
        started = false;
        web.loadUrl(usingDownloaded ? Uri.fromFile(page).toString() : "file:///android_asset/index.html");
        // a downloaded copy that never says it started is broken: drop it and go back to the built-in one
        if (usingDownloaded) ui.postDelayed(() -> {
            if (started || !usingDownloaded) return;
            new File(dir(), "index.html").delete();
            new File(dir(), "app-version.json").delete();
            load();
        }, 30000);
    }

    private JSONObject newest() {
        JSONObject built = readJson(() -> getAssets().open("app-version.json"));
        JSONObject got = new File(dir(), "index.html").exists() ? readJson(() -> new FileInputStream(new File(dir(), "app-version.json"))) : null;
        if (got == null) return built;
        if (built == null) return got;
        return got.optLong("time") > built.optLong("time") ? got : built;
    }

    private void runUpdateCheck(boolean manual) {
        if (!checking.compareAndSet(false, true)) return;
        if (manual) tellPage("checking", true);
        new Thread(() -> {
            try {
                JSONObject latest = new JSONObject(new String(fetch(SITE + "app-version.json?t=" + System.currentTimeMillis()), "UTF-8"));
                String build = latest.getString("build");
                long time = latest.getLong("time");
                int mine = getPackageManager().getPackageInfo(getPackageName(), 0).versionCode;
                JSONObject have = newest();
                if (latest.optInt("minApp", 0) > mine) { tellPage("apk", manual); return; }
                if (have != null && (build.equals(have.optString("build")) || time <= have.optLong("time"))) {
                    // already have it: if it is downloaded but not running yet, offer the restart
                    tellPage(running != null && !build.equals(running.optString("build")) && build.equals(have.optString("build")) ? "ready" : "latest", manual);
                    return;
                }
                if (manual) tellPage("downloading", true);
                File d = dir();
                d.mkdirs();
                File next = new File(d, "next.html");
                if (!download(SITE + "Elite-Chess.html?v=" + build, next).startsWith(build)) { next.delete(); tellPage("failed", manual); return; }
                File page = new File(d, "index.html");
                page.delete();
                if (!next.renameTo(page)) { tellPage("failed", manual); return; }
                try (OutputStream o = new FileOutputStream(new File(d, "app-version.json"))) { o.write(latest.toString().getBytes("UTF-8")); }
                tellPage("ready", manual);
            } catch (Exception e) {
                tellPage("failed", manual);
            } finally {
                checking.set(false);
            }
        }).start();
    }

    private void tellPage(String state, boolean manual) {
        ui.post(() -> web.evaluateJavascript("try{GW.appUpdate(" + JSONObject.quote(state) + "," + JSONObject.quote(manual ? "manual" : "auto") + ")}catch(e){}", null));
    }

    private static HttpURLConnection open(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(15000);
        c.setReadTimeout(60000);
        c.setUseCaches(false);
        c.setRequestProperty("Cache-Control", "no-cache");
        if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
        return c;
    }

    private static byte[] fetch(String url) throws Exception {
        HttpURLConnection c = open(url);
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return out.toByteArray();
        } finally { c.disconnect(); }
    }

    // saves url to file and returns the SHA-256 of what was saved, in hex
    private static String download(String url, File to) throws Exception {
        HttpURLConnection c = open(url);
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(to)) {
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) { out.write(buf, 0, n); sha.update(buf, 0, n); }
        } finally { c.disconnect(); }
        StringBuilder hex = new StringBuilder();
        for (byte b : sha.digest()) hex.append(String.format("%02x", b));
        return hex.toString();
    }

    private static JSONObject readJson(Source src) {
        try (InputStream in = src.open()) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return new JSONObject(out.toString("UTF-8"));
        } catch (Exception e) { return null; }
    }

    @Override public void onBackPressed() {
        web.evaluateJavascript("(function(){try{return GW.hardwareBack();}catch(e){return 'exit';}})()", v -> {
            if (v != null && v.contains("exit")) finishAndRemoveTask();
        });
    }

    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); hideSystemBars(); }

    private class Bridge {
        @JavascriptInterface public void ready() { started = true; runUpdateCheck(false); }
        @JavascriptInterface public void checkUpdate() { runUpdateCheck(true); }
        @JavascriptInterface public void exit() { ui.post(MainActivity.this::finishAndRemoveTask); }
        @JavascriptInterface public void restart() { ui.post(MainActivity.this::load); }
        @JavascriptInterface public String info() {
            try {
                JSONObject o = new JSONObject();
                o.put("app", getPackageManager().getPackageInfo(getPackageName(), 0).versionName);
                o.put("build", running == null ? "" : running.optString("build"));
                o.put("time", running == null ? 0 : running.optLong("time"));
                o.put("downloaded", usingDownloaded);
                return o.toString();
            } catch (Exception e) { return "{}"; }
        }
    }
}
