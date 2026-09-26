import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions
W, H = 1200, 1200
img = Image.new("RGBA", (W, H), "#05060a")
draw = ImageDraw.Draw(img)

# Hunter's Atlas Palette
GROUND = "#05060a"
PANEL = "#0b0c13"
PANEL_BORDER = "#1c1f2f"
INK = "#f0f1f5"
DIM = "#9aa0bb"
FAINT = "#6a7092"
PINK = "#ec4899"
GOLD = "#fbbf24"
BLUE = "#38bdf8"
GREEN = "#34d399"

# Font paths
BEBAS_PATH = "/tmp/BebasNeue-Regular.ttf"
GARAMOND_PATH = "/tmp/EBGaramond.ttf"
MONO_PATH = "/Users/marcotiongson/Library/Fonts/JetBrainsMono-Bold.ttf"
MONO_REG_PATH = "/Users/marcotiongson/Library/Fonts/JetBrainsMono-Regular.ttf"

font_eyebrow = ImageFont.truetype(MONO_PATH, 24)
font_title = ImageFont.truetype(BEBAS_PATH, 72)
font_subtitle = ImageFont.truetype(GARAMOND_PATH, 32)
font_section = ImageFont.truetype(MONO_PATH, 22)
font_stat_num = ImageFont.truetype(BEBAS_PATH, 70)
font_stat_label = ImageFont.truetype(MONO_PATH, 20)
font_stat_desc = ImageFont.truetype(GARAMOND_PATH, 21)
font_chart_label = ImageFont.truetype(MONO_PATH, 22)
font_chart_sub = ImageFont.truetype(GARAMOND_PATH, 20)
font_chart_val = ImageFont.truetype(BEBAS_PATH, 36)
font_honesty = ImageFont.truetype(MONO_REG_PATH, 19)
font_receipt = ImageFont.truetype(MONO_PATH, 22)

# 1. Top Eyebrow with pink dot
margin_x = 80
y = 56
dot_r = 6
draw.ellipse([margin_x, y + 6, margin_x + dot_r * 2, y + 6 + dot_r * 2], fill=PINK)
draw.text((margin_x + 22, y), "GAIA RESEARCH · ARCHITECTURAL NOTE · SEP 26, 2026", font=font_eyebrow, fill=DIM)

# 2. Main Headline (Bebas Neue)
y += 50
draw.text((margin_x, y), "THE RETURN OF THE SIMPLE REFLEX AGENT", font=font_title, fill=INK)
y += 74
draw.text((margin_x, y), "WHY JEV IS A CLASSIFIER — AND WHY THAT MATTERS", font=font_title, fill=GOLD)

# 3. Subtitle / Thesis (EB Garamond)
y += 82
draw.text((margin_x, y), "A fast typed decision interface is an architectural blessing. It is not a new class of AI.", font=font_subtitle, fill=DIM)

# 4. Top Divider Rule
y += 48
draw.line([(margin_x, y), (W - margin_x, y)], fill=PANEL_BORDER, width=2)

# 5. Benchmarks Panel (The Empirical Comparison)
y += 28
panel_x0 = margin_x
panel_x1 = W - margin_x
panel_h = 360
draw.rounded_rectangle([panel_x0, y, panel_x1, y + panel_h], radius=16, fill=PANEL, outline=PANEL_BORDER, width=2)

# Inside Panel: Title
py = y + 25
draw.text((panel_x0 + 35, py), "EMPIRICAL ACCURACY VS. DEPLOYMENT REALITY", font=font_section, fill=BLUE)
draw.text((panel_x1 - 330, py + 2), "Janardhan Benchmark (200 items)", font=font_stat_label, fill=FAINT)

# Bars
bar_y = py + 55
bars = [
    {
        "name": "CUSTOM 310M ENCODER",
        "sub": "In-domain fine-tuned (ikkun1222 test) · 0.1s CPU local",
        "val": 88.8,
        "color": GREEN,
        "note": "88.8%  (+12.0 vs Jev)",
        "width_ratio": 0.888
    },
    {
        "name": "CLAUDE FABLE 5.1",
        "sub": "Frontier deliberative LLM · 3–300s · high token cost",
        "val": 84.0,
        "color": PINK,
        "note": "84.0%  (baseline leader)",
        "width_ratio": 0.840
    },
    {
        "name": "TYPESAFE JEV (1.13)",
        "sub": "Zero-shot prompt classifier · 70–500ms · $0.042/M tokens",
        "val": 72.5,
        "color": BLUE,
        "note": "72.5%  (-11.5 vs Fable)",
        "width_ratio": 0.725
    }
]

max_bar_w = 460
bar_start_x = panel_x0 + 320

for b in bars:
    # Model name & subtext
    draw.text((panel_x0 + 35, bar_y), b["name"], font=font_chart_label, fill=INK)
    draw.text((panel_x0 + 35, bar_y + 26), b["sub"], font=font_chart_sub, fill=DIM)
    
    # Progress track
    track_w = max_bar_w
    track_h = 24
    draw.rounded_rectangle([bar_start_x, bar_y + 4, bar_start_x + track_w, bar_y + 4 + track_h], radius=4, fill="#131622")
    # Active bar
    act_w = int(track_w * b["width_ratio"])
    draw.rounded_rectangle([bar_start_x, bar_y + 4, bar_start_x + act_w, bar_y + 4 + track_h], radius=4, fill=b["color"])
    
    # Value text
    draw.text((bar_start_x + track_w + 20, bar_y - 4), b["note"], font=font_chart_val, fill=INK)
    
    bar_y += 82

# 6. Stat Tiles (Three metric cards)
y += panel_h + 28
tile_w = (panel_x1 - panel_x0 - 40) // 3
tile_h = 185

tiles = [
    {
        "num": "88.8%",
        "color": GREEN,
        "title": "CUSTOM ENCODER",
        "desc": "Trained on 200 rows. Beats Jev by 12.0 pts on news topics with 0.1s CPU local inference."
    },
    {
        "num": "72.5%",
        "color": BLUE,
        "title": "JEV CLASSIFIER",
        "desc": "Prompt-based System 1 model. Trails frontier LLMs by 11.5 pts on 200-item suite."
    },
    {
        "num": "32.5%",
        "color": PINK,
        "title": "LABEL SENSITIVITY",
        "desc": "Decisions flipped when yes/no definitions were swapped (Shi et al. arXiv 2609.26758)."
    }
]

for idx, t in enumerate(tiles):
    tx = panel_x0 + idx * (tile_w + 20)
    draw.rounded_rectangle([tx, y, tx + tile_w, y + tile_h], radius=12, fill=PANEL, outline=PANEL_BORDER, width=2)
    
    # Number
    draw.text((tx + 24, y + 14), t["num"], font=font_stat_num, fill=t["color"])
    # Label
    draw.text((tx + 24, y + 80), t["title"], font=font_stat_label, fill=INK)
    
    # Description lines with textwrap
    lines = textwrap.wrap(t["desc"], width=27)
    desc_y = y + 108
    for line in lines:
        draw.text((tx + 24, desc_y), line, font=font_stat_desc, fill=DIM)
        desc_y += 24

# 7. Bottom Divider Rule
y += tile_h + 28
draw.line([(margin_x, y), (W - margin_x, y)], fill=PANEL_BORDER, width=2)

# 8. Honesty Line & Receipt
y += 22
draw.text((margin_x, y), "METHOD: Janardhan 200-item suite · ikkun1222 750-row study · Ibrahim & Zaki arXiv 2609.24574", font=font_honesty, fill=FAINT)
y += 28
draw.text((margin_x, y), "RECEIPT -> research.gaiaskilltree.com/blog/reflex-agents-and-classifiers", font=font_receipt, fill=GOLD)

# 9. Pink / Gold / Blue Spine across bottom 6px
spine_h = 6
spine_y = H - spine_h
seg_w = W // 3
draw.rectangle([0, spine_y, seg_w, H], fill=PINK)
draw.rectangle([seg_w, spine_y, seg_w * 2, H], fill=GOLD)
draw.rectangle([seg_w * 2, spine_y, W, H], fill=BLUE)

out_path = "/Users/marcotiongson/marketing-tasks-wt-reflex/assets/media/2026-09-26-reflex-agents-linkedin-card.png"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
img.save(out_path, "PNG")

# Also save copy to marketing-tasks
main_out_path = "/Users/marcotiongson/marketing-tasks/assets/media/2026-09-26-reflex-agents-linkedin-card.png"
os.makedirs(os.path.dirname(main_out_path), exist_ok=True)
img.save(main_out_path, "PNG")
print("Saved polished card to:", out_path)
