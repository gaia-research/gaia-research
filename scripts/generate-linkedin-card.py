#!/usr/bin/env python3
"""Render the dedicated Capability Amplification LinkedIn card with Pillow.

Setup: pip install pillow fonttools brotli
In a scratch font directory, npm pack @fontsource/bebas-neue
@fontsource/eb-garamond @fontsource/jetbrains-mono and extract each archive
into its own directory. Then pass that directory via --font-dir.
Only published numbers are typeset; architecture is conceptual, not a chart.
"""
from argparse import ArgumentParser
from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT.parent / "marketing-tasks/assets/media/2026-10-05-capability-amplification-linkedin-card.png"
BG, PANEL, RULE = "#05060a", "#0b0c13", "#1c1f2f"
INK, DIM = "#f0f1f5", "#9aa0bb"
PINK, GOLD, BLUE = "#ec4899", "#fbbf24", "#38bdf8"


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--font-dir", required=True, type=Path)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    image = Image.new("RGB", (1200, 1200), BG)
    draw = ImageDraw.Draw(image)
    font_bytes = {}

    def font(face, size):
        filename = f"{face}-latin-400-normal.woff2"
        if face not in font_bytes:
            candidates = list(args.font_dir.rglob(filename))
            if not candidates:
                raise FileNotFoundError(f"Missing {filename} under {args.font_dir}")
            source = TTFont(candidates[0])
            source.flavor = None
            buffer = BytesIO()
            source.save(buffer)
            font_bytes[face] = buffer.getvalue()
        return ImageFont.truetype(BytesIO(font_bytes[face]), size)

    def text(x, y, content, face="jetbrains-mono", size=22, fill=INK, max_width=None):
        selected = font(face, size)
        if max_width is not None and draw.textlength(content, font=selected) > max_width:
            raise ValueError(f"Text exceeds intended width: {content}")
        draw.text((x, y), content, font=selected, fill=fill, anchor="lt")

    def box(bounds):
        draw.rectangle(bounds, fill=PANEL, outline=RULE, width=2)

    def connector(x1, y, x2, color=BLUE):
        draw.line((x1, y, x2, y), fill=color, width=3)
        draw.polygon([(x2, y), (x2 - 10, y - 6), (x2 - 10, y + 6)], fill=color)

    draw.ellipse((64, 58, 78, 72), fill=PINK)
    text(94, 55, "GAIA RESEARCH  /  FIELD NOTE  /  OCT 5, 2026", size=21, fill=DIM)
    text(64, 110, "CAPABILITY AMPLIFICATION", face="bebas-neue", size=106, max_width=1072)
    text(64, 226, "WHEN BETTER SCAFFOLDING BEATS A BIGGER MODEL", face="bebas-neue", size=43, max_width=1072)
    text(64, 291, "System structure can buy task-level reliability", face="eb-garamond", size=38)
    text(64, 337, "more cheaply than model scale.", face="eb-garamond", size=38)
    draw.line((64, 397, 1136, 397), fill=RULE, width=2)

    # Architectural comparison, not measured compute or accuracy bars.
    box((64, 429, 578, 788))
    box((602, 429, 1136, 788))
    text(88, 454, "01 FRONTIER MONOLITH", size=24, fill=PINK)
    text(626, 454, "02 STRUCTURED ECONOMY", size=24, fill=BLUE)
    text(88, 501, "High inference on trivial steps", face="eb-garamond", size=29)
    text(626, 501, "Reasoning placed where it matters", face="eb-garamond", size=29)
    for index, label in enumerate(("PLAN", "FORMAT", "CHECK")):
        x = 88 + index * 158
        draw.rectangle((x, 558, x + 142, 655), outline=PINK, width=2)
        text(x + 13, 578, "FRONTIER", size=20)
        text(x + 13, 614, label, size=20, fill=DIM)
        if index < 2:
            connector(x + 142, 605, x + 158, PINK)
    text(88, 698, "One expensive model", face="eb-garamond", size=32)
    text(88, 737, "at every step.", face="eb-garamond", size=32, fill=DIM)

    steps = [(626, "CHEAP", "WORKER"), (794, "DETERMINISTIC", "CHECK"), (962, "INDEPENDENT", "REVIEW")]
    for index, (x, first, second) in enumerate(steps):
        draw.rectangle((x, 558, x + 150, 655), outline=BLUE, width=2)
        text(x + 9, 580, first, size=16)
        text(x + 9, 612, second, size=20)
        if index < 2:
            connector(x + 150, 605, x + 168)
    draw.line((1037, 655, 1037, 686, 969, 686), fill=GOLD, width=3)
    draw.rectangle((626, 690, 1112, 764), outline=GOLD, width=2)
    text(646, 703, "ESCALATE ONLY WHEN NEEDED", size=21, fill=GOLD)
    text(646, 736, "Disputed or high-risk work", size=18, fill=DIM)

    stats = [
        (64, "51%", "SPURIOUS MISTAKES", "METR: workflow, not scale", PINK),
        (430, "72%", "COST REDUCTION", "AgentRouter: 97.3% quality", GOLD),
        (796, "+16.7 pts", "SUB-GOAL LIFT", "ScienceWorld:", BLUE),
    ]
    for x, value, label, note, accent in stats:
        box((x, 821, x + 340, 1024))
        text(x + 20, 839, value, face="bebas-neue", size=65, fill=accent)
        text(x + 20, 920, label, size=20)
        text(x + 20, 959, note, size=18, fill=DIM, max_width=302)
        if value == "+16.7 pts":
            text(x + 20, 985, "planning structure", size=18, fill=DIM)

    draw.line((64, 1053, 1136, 1053), fill=RULE, width=2)
    text(64, 1078, "Literature findings from separate evaluations. Diagram is conceptual.", size=21, fill=DIM, max_width=1072)
    text(64, 1134, "research.gaiaskilltree.com/blog/capability-amplification", size=25, max_width=1072)
    for x, accent in [(0, PINK), (400, GOLD), (800, BLUE)]:
        draw.rectangle((x, 1194, x + 399, 1199), fill=accent)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.output, optimize=True)
    print(args.output)


if __name__ == "__main__":
    main()
