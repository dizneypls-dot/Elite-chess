"""MotoGP schedule and results for the app's Sport screen, written to sports/motogp.json on the website.
MotoGP's results service only answers servers (not web pages), so a scheduled GitHub workflow runs this every
15 minutes on race weekends and once a day otherwise. usage: python3 tools/motogp.py OUT.json"""
import json, sys, urllib.request, datetime

API = 'https://api.motogp.pulselive.com/motogp/v1/results'
LABEL = {'FP': 'Practice', 'PR': 'Practice', 'Q': 'Qualifying', 'SPR': 'Sprint', 'WUP': 'Warm Up', 'RAC': 'Race'}

def get(path):
    req = urllib.request.Request(API + path, headers={'User-Agent': 'EliteChess/1.0 (+https://elitechess.online)', 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def when(s):
    return datetime.datetime.fromisoformat(s.replace('Z', '+00:00'))

def rows(session_id, n):
    try:
        data = get(f'/session/{session_id}/classification?test=false').get('classification') or []
    except Exception:
        return []
    out = []
    for r in data[:n]:
        gap = (r.get('gap') or {}).get('first')
        out.append({'pos': r.get('position'), 'name': (r.get('rider') or {}).get('full_name', ''),
                    'country': ((r.get('rider') or {}).get('country') or {}).get('iso', ''),
                    'team': (r.get('team') or {}).get('name', ''),
                    'time': r.get('time') if r.get('position') == 1 else (f'+{gap}' if gap and gap != '0.000' else r.get('status', ''))})
    return out

def event_info(e, cat, with_results):
    sessions = []
    try:
        for s in get(f"/sessions?eventUuid={e['id']}&categoryUuid={cat}"):
            label = LABEL.get(s['type'], s['type']) + (f" {s['number']}" if s.get('number') and s['type'] in ('FP', 'Q') else '')
            item = {'type': s['type'], 'label': label, 'date': s['date'], 'status': s.get('status', '')}
            if with_results and s.get('status') != 'NOT-STARTED' and s['type'] in ('RAC', 'SPR', 'Q', 'PR', 'FP', 'WUP'):
                item['results'] = rows(s['id'], 10 if s['type'] in ('RAC', 'SPR') else 5)
            sessions.append(item)
    except Exception:
        pass
    return {'name': e.get('sponsored_name') or e.get('name'), 'short': e.get('name'), 'circuit': (e.get('circuit') or {}).get('name', ''),
            'country': (e.get('country') or {}).get('iso', ''), 'start': e['date_start'], 'end': e['date_end'], 'sessions': sessions}

def main(out):
    season = next(s for s in get('/seasons') if s.get('current'))
    cat = next(c['id'] for c in get(f"/categories?seasonUuid={season['id']}") if 'MotoGP' in c['name'])
    races = lambda fin: sorted([e for e in get(f"/events?seasonUuid={season['id']}&isFinished={fin}") if not e.get('test')], key=lambda e: e['date_start'])
    upcoming, finished = races('false'), races('true')
    today = datetime.datetime.now(datetime.timezone.utc).date()
    events = []
    for e in upcoming[:3]:
        live = when(e['date_start']).date() - datetime.timedelta(days=1) <= today <= when(e['date_end']).date() + datetime.timedelta(days=1)
        events.append(event_info(e, cat, live))
    last = event_info(finished[-1], cat, True) if finished else None
    data = {'season': season['year'], 'events': events, 'last': last}
    try:
        old = json.load(open(out))
    except Exception:
        old = {}
    # only rewrite when something changed, so quiet days add no commits
    if {k: v for k, v in old.items() if k != 'updated'} != data:
        data['updated'] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
        json.dump(data, open(out, 'w'), separators=(',', ':'))
        print('updated', out)
    else:
        print('no change')

if __name__ == '__main__':
    main(sys.argv[1])
