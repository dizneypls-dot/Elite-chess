"""Build one self-contained HTML file of the app (all scripts inlined, Stockfish embedded) for offline use.
Usage: python3 -I tools/bundle.py OUT.html [STAMP.json]
STAMP.json (optional) gets the build id the Android app checks for updates: the start of the file's SHA-256,
the time it was built, and the oldest app version (versionCode) that can run it.
Works from the app's source folder and from the website repo (whose index.html has the full document around it)."""
import re, sys, os, base64, hashlib, json, time
MIN_APP = 17   # raise when the page needs something new from the Android wrapper (MainActivity.java)
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
page = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
if page.lstrip().lower().startswith('<!doctype'):   # the website's copy: keep only what tools/site.py wrapped
    page = page.split('<body>\n', 1)[1].rsplit('\n</body></html>', 1)[0]
def js(name):
    t = open(os.path.join(root, name), encoding='utf-8').read()
    return t.replace('</script', '<\\/script')
# Opened from a file there is no server, so the engine loads from the embedded copy instead of fetching stockfish.js
shim = ("<script>(()=>{const f=window.fetch.bind(window);window.fetch=(u,...a)=>String(u).endsWith('stockfish.js')"
        "?Promise.resolve(new Response(document.getElementById('sf-src').textContent,{status:200,headers:{'Content-Type':'text/javascript'}})):f(u,...a);})();</script>")
def inline(m):
    name = m.group(1)
    return f'<script>/* {name} */\n{js(name)}\n</script>'
body = re.sub(r'<script src="([\w.-]+\.js)"></script>', inline, page)
# the app icon used as the logo travels inside the file
body = body.replace('src="icon-192.png"', 'src="data:image/png;base64,' + base64.b64encode(open(os.path.join(root, 'icon-192.png'), 'rb').read()).decode() + '"')
body = body.replace("<script>if('serviceWorker'", "<script>if(false&&'serviceWorker'")
manifest = '<link rel="manifest" href="manifest.json">'
body = body.replace(manifest, '').replace('<link rel="apple-touch-icon" href="apple-touch-icon.png">', '')
import base64
sf = f'<script type="text/plain" id="sf-src">{js("stockfish.js")}</script>'
# Stockfish 17.1 (the rated bots) runs from an embedded copy: its script and its WebAssembly as base64
sf += f'<script type="text/plain" id="sf17-src">{js("sf17-lite.js")}</script>'
sf += '<script type="text/plain" id="sf17-wasm">' + base64.b64encode(open(os.path.join(root, 'sf17-lite.wasm'), 'rb').read()).decode() + '</script>'
html = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n'
        + sf + '\n' + shim + '\n' + body + '\n</body></html>\n')
data = html.encode('utf-8')
open(sys.argv[1], 'wb').write(data)
print(sys.argv[1], round(len(data) / 1e6, 2), 'MB')
if len(sys.argv) > 2:
    build = hashlib.sha256(data).hexdigest()[:16]
    try: old = json.load(open(sys.argv[2]))
    except Exception: old = {}
    # an unchanged app keeps its stamp, so rebuilding never looks like an update
    if old.get('build') != build or old.get('minApp') != MIN_APP:
        json.dump({'build': build, 'time': int(time.time()), 'minApp': MIN_APP, 'size': len(data)}, open(sys.argv[2], 'w'))
    print(sys.argv[2], build)
