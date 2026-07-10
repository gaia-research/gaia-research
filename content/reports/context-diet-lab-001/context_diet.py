#!/usr/bin/env python3
"""
context_diet.py — measure and compact an oversized agent-context file.

Context Diet / Lab 001 — the analyzer core.

An agent-context file (CLAUDE.md, .cursorrules, a system prompt, AGENTS.md, …)
has a hard budget. Claude Code warns past 40,000 characters and may truncate
beyond it — silently disabling whatever rules fell off the end. This tool
measures where the budget goes, section by section, and reports the delta to a
configurable limit. With --json it emits a machine-readable baseline other
tooling (the bake-off workflow, the chart generator) consumes.

Char count is authoritative: the Claude Code limit is expressed in characters,
and tiktoken is not assumed present. An approximate token figure (chars / 4) is
reported alongside as a convenience only.

Usage:
    python3 context_diet.py CLAUDE.md
    python3 context_diet.py CLAUDE.md --limit 40000 --json
    python3 context_diet.py path/to/.cursorrules
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

DEFAULT_LIMIT = 40_000
TOKENS_PER_CHAR = 0.25  # chars/4 heuristic; count of record is chars, not tokens

HEADING = re.compile(r"^(#{1,6})\s+(.*)$")


@dataclass
class Section:
    title: str
    level: int
    chars: int
    approxTokens: int
    lineStart: int


def approxTokens(chars: int) -> int:
    return int(round(chars * TOKENS_PER_CHAR))


def splitSections(text: str, atLevel: int = 2) -> list[Section]:
    """Split on headings at `atLevel` (default ##). Content above the first
    such heading is bucketed as a synthetic 'preamble' section so every byte is
    accounted for and the section chars sum to the file total."""
    lines = text.splitlines(keepends=True)
    sections: list[Section] = []
    curTitle = "(preamble)"
    curLevel = 0
    curLines: list[str] = []
    curStart = 1

    def flush(title: str, level: int, buf: list[str], start: int) -> None:
        body = "".join(buf)
        if body == "" and not sections:
            return  # skip an empty leading preamble
        sections.append(
            Section(
                title=title,
                level=level,
                chars=len(body),
                approxTokens=approxTokens(len(body)),
                lineStart=start,
            )
        )

    for idx, line in enumerate(lines, start=1):
        m = HEADING.match(line)
        if m and len(m.group(1)) == atLevel:
            flush(curTitle, curLevel, curLines, curStart)
            curTitle = m.group(2).strip()
            curLevel = len(m.group(1))
            curLines = [line]
            curStart = idx
        else:
            curLines.append(line)
    flush(curTitle, curLevel, curLines, curStart)
    return sections


def measure(path: Path, limit: int, atLevel: int = 2) -> dict:
    text = path.read_text(encoding="utf-8")
    totalChars = len(text)
    sections = splitSections(text, atLevel=atLevel)
    ranked = sorted(sections, key=lambda s: s.chars, reverse=True)
    overBy = max(0, totalChars - limit)
    return {
        "file": str(path),
        "totalChars": totalChars,
        "approxTokens": approxTokens(totalChars),
        "limit": limit,
        "overLimit": totalChars > limit,
        "overBy": overBy,
        "headroom": max(0, limit - totalChars),
        "sectionCount": len(sections),
        "sections": [asdict(s) for s in sections],
        "ranked": [asdict(s) for s in ranked],
    }


def renderReport(data: dict) -> str:
    out: list[str] = []
    W = 64
    out.append(f"Context Diet Report — {Path(data['file']).name}")
    out.append("═" * W)
    out.append("")
    status = "OVER LIMIT" if data["overLimit"] else "within limit"
    out.append(
        f"Total: {data['totalChars']:,} chars "
        f"(~{data['approxTokens']:,} tok)  ·  limit {data['limit']:,}  ·  {status}"
    )
    if data["overLimit"]:
        out.append(
            f"Over by {data['overBy']:,} chars — must shed at least this to fit."
        )
    else:
        out.append(f"Headroom: {data['headroom']:,} chars.")
    out.append(f"Sections: {data['sectionCount']}")
    out.append("")
    out.append("Largest sections (compaction targets)")
    out.append("─" * W)
    out.append(f"{'chars':>7}  {'~tok':>6}  {'ln':>5}  section")
    out.append(f"{'─'*7}  {'─'*6}  {'─'*5}  {'─'*30}")
    for s in data["ranked"][:15]:
        title = s["title"]
        if len(title) > 38:
            title = title[:37] + "…"
        out.append(
            f"{s['chars']:>7,}  {s['approxTokens']:>6,}  {s['lineStart']:>5}  {title}"
        )
    out.append("")
    return "\n".join(out)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Measure an oversized agent-context file.")
    ap.add_argument("file", help="path to the context file (CLAUDE.md, .cursorrules, …)")
    ap.add_argument("--limit", type=int, default=DEFAULT_LIMIT,
                    help=f"char budget (default {DEFAULT_LIMIT})")
    ap.add_argument("--level", type=int, default=2,
                    help="heading level to split on (default 2 = ##)")
    ap.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = ap.parse_args(argv)

    # Windows consoles default to cp1252 and choke on box-drawing glyphs.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

    path = Path(args.file)
    if not path.is_file():
        print(f"error: {path} not found", file=sys.stderr)
        return 2

    data = measure(path, args.limit, atLevel=args.level)
    if args.json:
        print(json.dumps(data, indent=2))
    else:
        print(renderReport(data))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
