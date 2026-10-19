#!/usr/bin/env bash
# Builds the Elite Chess APK without Gradle: aapt2 → javac → d8 → zipalign → apksigner.
# Needs ANDROID_HOME (the GitHub runners have it) and, for signing, the key and certificate:
#   ANDROID_SIGNING_KEY / ANDROID_SIGNING_CERT = base64 of the PKCS#8 key (DER) and the X.509 certificate.
# Usage: android/build.sh OUT.apk   (run from the repo root after tools/bundle.py has made Elite-Chess.html)
set -euo pipefail
out=$(realpath -m "$1"); here=$(cd "$(dirname "$0")" && pwd); root=$here/..
read -r code name < "$here/version"
bt=$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)
jar=$(ls -d "$ANDROID_HOME"/platforms/android-* | sort -V | tail -1)/android.jar
w=$(mktemp -d); trap 'rm -rf "$w"' EXIT
mkdir -p "$w/assets" "$w/classes" "$w/res"
cp "$root/Elite-Chess.html" "$w/assets/index.html"
cp "$root/app-version.json" "$w/assets/app-version.json"
"$bt/aapt2" compile --dir "$here/res" -o "$w/res.zip"
"$bt/aapt2" link -o "$w/base.apk" -I "$jar" --manifest "$here/AndroidManifest.xml" -A "$w/assets" \
  --version-code "$code" --version-name "$name" --min-sdk-version 24 --target-sdk-version 34 "$w/res.zip"
javac -source 11 -target 11 -encoding UTF-8 -Xlint:-options -classpath "$jar" -d "$w/classes" $(find "$here/src" -name '*.java')
"$bt/d8" --release --min-api 24 --lib "$jar" --output "$w" $(find "$w/classes" -name '*.class')
(cd "$w" && zip -q -j base.apk classes.dex)
"$bt/zipalign" -f -p 4 "$w/base.apk" "$w/aligned.apk"
echo "$ANDROID_SIGNING_KEY" | base64 -d > "$w/key.pk8"
echo "$ANDROID_SIGNING_CERT" | base64 -d > "$w/cert.der"
"$bt/apksigner" sign --key "$w/key.pk8" --cert "$w/cert.der" --out "$out" "$w/aligned.apk"
"$bt/apksigner" verify --print-certs "$out" | head -3
echo "$out: Elite Chess $name ($code), $(du -h "$out" | cut -f1)"
