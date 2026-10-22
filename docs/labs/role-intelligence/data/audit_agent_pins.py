#!/usr/bin/env python3
"""Audit every pi agent definition for (a) an explicit reasoning effort and
(b) an effort the provider actually advertises.

Sources (authoritative):
  * model existence  : `pi --offline --list-models` (live catalog)
  * effort support   : @earendil-works/pi-ai providers/data/*.json `thinkingLevelMap`
  * antigravity map  : pi-antigravity src/models/models.ts (Gemini slugs embed effort)
  * bunny virtual    : ~/.pi/agent/extensions/bunny-route.mjs BUNNY_THINKING_LEVELS
"""
import json, os, re, glob, subprocess

AGENTS = os.path.expanduser("~/.pi/agent/agents")
DATA = os.path.expanduser(
    "~/.pi/agent/install/releases/1.3.0/node_modules/@earendil-works/pi-ai/dist/providers/data")
AGY = os.path.expanduser("~/.pi/agent/npm/node_modules/pi-antigravity/src/models/models.ts")
BUNNY_ROUTE = os.path.expanduser("~/.pi/agent/extensions/bunny-route.mjs")
LEVELS = ("off", "minimal", "low", "medium", "high", "xhigh", "max")

# ---- live model list ------------------------------------------------------
live = set()
try:
    out = subprocess.run(["pi", "--offline", "--list-models"], capture_output=True,
                         text=True, timeout=120).stdout
    for line in out.splitlines()[1:]:
        parts = line.split()
        if len(parts) >= 2:
            live.add(f"{parts[0]}/{parts[1]}")
except Exception as exc:  # pragma: no cover
    print(f"warn: live model list unavailable ({exc})", file=__import__("sys").stderr)

# ---- effort support maps --------------------------------------------------
catalog = {}
for f in glob.glob(os.path.join(DATA, "*.json")):
    try:
        d = json.load(open(f))
    except Exception:
        continue
    for _api, payload in d.items():
        if not isinstance(payload, dict):
            continue
        for _k, m in payload.items():
            if not isinstance(m, dict) or not m.get("id") or not m.get("thinkingLevelMap"):
                continue
            prov = m.get("provider") or os.path.basename(f)[:-5]
            catalog.setdefault(prov, {})[m["id"]] = {
                lv: bool(v) for lv, v in m["thinkingLevelMap"].items()}

agy = open(AGY, encoding="utf-8").read()
lvl_maps = {}
for name in ("lowMediumHigh", "lowHigh", "thinking", "medium"):
    m = re.search(rf"\b{name}: \{{(.*?)\n  \}}", agy, re.S)
    if m:
        lvl_maps[name] = {lv: (v.strip() != "null") for lv, v in
                          re.findall(r"(\w+): (null|\"[^\"]*\")", m.group(1))}
for mid, expr in re.findall(
        r'id: "([^"]+)",\s*\n\s*name: "[^"]*",\s*\n\s*reasoning: true,\s*\n\s*thinkingLevelMap: (.+?),\n',
        agy, re.S):
    expr = expr.strip()
    if expr.startswith("{ ..."):
        base = re.search(r"thinkingLevelMaps\.(\w+)", expr).group(1)
        lv = dict(lvl_maps.get(base, {}))
        if 'max: "high"' in expr:
            lv["max"] = True
    else:
        base = re.search(r"thinkingLevelMaps\.(\w+)", expr).group(1)
        lv = dict(lvl_maps.get(base, {}))
    catalog.setdefault("antigravity", {})[mid] = lv

bunny = {}
btext = open(BUNNY_ROUTE, encoding="utf-8").read()
m = re.search(r"BUNNY_THINKING_LEVELS = \[([^\]]*)\]", btext)
if m:
    bunny = {lv.strip().strip('"'): True for lv in m.group(1).split(",") if lv.strip()}

# ---- audit ----------------------------------------------------------------
rows = []
for path in sorted(glob.glob(os.path.join(AGENTS, "*.md"))):
    name = os.path.basename(path)
    text = open(path, encoding="utf-8").read()
    fm = re.match(r"^---\n(.*?)\n---", text, re.S)
    body = fm.group(1) if fm else ""
    m_model = re.search(r"^model:\s*(\S+)", body, re.M)
    m_think = re.search(r"^thinking:\s*(\S+)", body, re.M)
    raw = m_model.group(1) if m_model else None
    eff = m_think.group(1) if m_think else None
    prov = model_id = None
    if raw and "/" in raw:
        prov, rest = raw.split("/", 1)
        if ":" in rest:
            head, _, tail = rest.rpartition(":")
            if tail in LEVELS:
                model_id, eff = head, eff or tail
            else:
                model_id = rest
        else:
            model_id = rest
    support = None
    support_source = "none"
    if prov == "bunny":
        support = bunny
        support_source = "bunny-extension"
    elif prov and model_id:
        support = catalog.get(prov, {}).get(model_id)
        if support is not None:
            support_source = "provider-catalog"
        if support is None and prov == "antigravity":
            # antigravity slugs embed effort: gemini-3.8-flash-high etc.
            base = model_id.split("-")[0:3]
            for cand in catalog.get("antigravity", {}):
                if cand == model_id or cand.startswith("-".join(base)):
                    support = catalog["antigravity"][cand]
                    support_source = "inferred-from-sibling-model"
                    break
    exists = (f"{prov}/{model_id}" in live) if (prov and model_id) else None
    if eff is None:
        status = "NO-EFFORT-PINNED"
    elif support is None:
        status = "EFFORT-SUPPORT-UNKNOWN"
    elif not support.get(eff):
        status = ("UNSUPPORTED-EFFORT" if support_source == "provider-catalog"
                  else "EFFORT-SUPPORT-UNCONFIRMED")
    else:
        status = "ok"
    rows.append({
        "agent": name, "provider": prov, "model": model_id, "effort": eff,
        "model_in_live_catalog": exists, "status": status, "support_source": support_source,
        "supported_efforts": sorted([k for k, v in (support or {}).items() if v]) or None,
        "unsupported_efforts": sorted([k for k, v in (support or {}).items() if not v]) or None,
        "raw_model_pin": raw,
    })

bad = [r for r in rows if r["status"] != "ok"]
print(f"agents scanned: {len(rows)}  ok: {len(rows)-len(bad)}  flagged: {len(bad)}")
for r in bad:
    print(f"  {r['status']:24s} {r['agent']:26s} pin={r['raw_model_pin']} "
          f"supported={r['supported_efforts']}")
with open("agent-pin-audit.json", "w", encoding="utf-8") as fh:
    json.dump(rows, fh, indent=2)
