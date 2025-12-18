#!/usr/bin/env python3
"""
Generate themed background images for Sudoku-Labs using Google Gemini Imagen via REST API.
- Iterates over assets/themes/<visual>/<audio>/
- Builds a prompt from the combo description with tailored style hints
- Saves output to background.png (or background.jpg) inside each folder
- Graceful fallback: if GEMINI_API_KEY is missing or API fails, writes a procedural SVG placeholder (background.svg)

Prereqs:
- pip install requests pillow
- export GEMINI_API_KEY=... (Google AI Studio key)

Run:
- python3 scripts/generate_backgrounds.py --format png --model "imagen-4.0-fast-generate-001" --dry-run
- python3 scripts/generate_backgrounds.py --format png --model "imagen-4.0-fast-generate-001"

"""
import os
import sys
import argparse
import base64
import io
import json
import random
import math
from pathlib import Path

# Pillow is required for local generation
PIL_AVAILABLE = False
try:
    from PIL import Image, ImageDraw, ImageFilter
    PIL_AVAILABLE = True
except Exception:
    PIL_AVAILABLE = False

VISUALS = [
    "default","ocean","forest","sunset","midnight","sakura","volcano","arctic"
]
AUDIOS = [
    "classic","zen","funfair","retro","space","nature","crystal","minimal"
]

# Load theme combo descriptions
def load_theme_combos():
    combo_file = Path(__file__).parent / "theme_combos.json"
    if combo_file.exists():
        with open(combo_file) as f:
            return json.load(f)
    return {}

THEME_COMBOS = load_theme_combos()

DEFAULT_MODEL = "local-procedural"

STYLE_HINTS = {
    "ocean": "Underwater ambience with soft cyan-blue gradients, gentle waves, light caustics",
    "forest": "Organic greens, leaf textures, dappled light, soft bokeh",
    "sunset": "Warm orange-pink gradients, twilight glow, subtle rays",
    "sakura": "Delicate pink hues, blossom petals, airy spring atmosphere",
    "volcano": "Fiery reds and oranges, molten glow, dramatic contrast",
    "arctic": "Cool blue crystalline textures, frosty shimmer, ice facets",
    "default": "Clean soft blue gradients, minimal abstract shapes"
}

AUDIO_HINTS = {
    "classic": "balanced, minimal UI-friendly",
    "zen": "calming, soft blur and gentle flow",
    "funfair": "playful, vibrant, festive",
    "retro": "8-bit inspired, pixel motif subtle",
    "space": "cosmic, starfield or nebulous accents",
    "nature": "organic, natural textures",
    "crystal": "crisp, faceted, luminous",
    "minimal": "high simplicity, low-detail"
}

def build_prompt(visual: str, audio: str) -> str:
    combo_key = f"{visual}_{audio}"
    combo = THEME_COMBOS.get(combo_key, {})
    name = combo.get('name', f"{visual.title()} {audio.title()}")
    description = combo.get('description', f"{visual} + {audio}")
    return (
        f"Context: This will be a background image for a Sudoku puzzle app UI (not a poster or title). "
        f"Theme name: {name}. "
        f"Creative direction: {description}. "
        f"Design goals: subtle, abstract, non-figurative visuals using gradients, soft shapes, and light textures. "
        f"Absolutely do NOT render any text: no letters, numbers, words, logos, watermarks, symbols, or typographic marks. "
        f"Strictly exclude lifelike elements, real-world objects, humans, faces, animals, and photorealism. "
        f"Keep it mood-evoking but non-literal; suitable for overlaying a Sudoku grid and numerals. "
        f"Composition guidance: keep center low-contrast for readability; place richer texture near edges. "
        f"Color and style should reflect the theme’s mood, but remain calm and non-distracting. "
        f"Output: one seamless 16:9 image optimized for an app background (no captions, no text)."
    )

def write_placeholder_svg(out_path: Path, visual: str):
    # Improved procedural SVG patterns matching src/constants.js
    
    # Default theme
    svg_default = """<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#4f46e5' stop-opacity='0.03'/><stop offset='100%' stop-color='#2563eb' stop-opacity='0.01'/></linearGradient><pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'><path d='M 40 0 L 0 0 0 40' fill='none' stroke='#4f46e5' stroke-width='0.5' opacity='0.05'/></pattern></defs><rect width='1920' height='1080' fill='url(#grad)'/><rect width='1920' height='1080' fill='url(#grid)'/><circle cx='960' cy='540' r='400' fill='none' stroke='#4f46e5' stroke-width='2' opacity='0.03'/><circle cx='200' cy='200' r='100' fill='#4f46e5' opacity='0.02'/><circle cx='1700' cy='900' r='150' fill='#2563eb' opacity='0.02'/></svg>"""

    # Ocean theme
    svg_ocean = """<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><linearGradient id='oceanGrad' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#06b6d4' stop-opacity='0.08'/><stop offset='100%' stop-color='#0369a1' stop-opacity='0.04'/></linearGradient><radialGradient id='bubbleGrad' cx='30%' cy='30%' r='70%'><stop offset='0%' stop-color='white' stop-opacity='0.2'/><stop offset='100%' stop-color='white' stop-opacity='0'/></radialGradient></defs><rect width='1920' height='1080' fill='url(#oceanGrad)'/><path d='M0,300 Q480,150 960,300 T1920,300' stroke='#0ea5e9' stroke-width='4' fill='none' opacity='0.1'/><path d='M0,600 Q480,450 960,600 T1920,600' stroke='#0284c7' stroke-width='4' fill='none' opacity='0.08'/><path d='M0,900 Q480,750 960,900 T1920,900' stroke='#0369a1' stroke-width='4' fill='none' opacity='0.06'/><circle cx='200' cy='900' r='40' fill='url(#bubbleGrad)' opacity='0.3'/><circle cx='600' cy='700' r='60' fill='url(#bubbleGrad)' opacity='0.2'/><circle cx='1200' cy='400' r='30' fill='url(#bubbleGrad)' opacity='0.25'/><circle cx='1600' cy='200' r='80' fill='url(#bubbleGrad)' opacity='0.15'/></svg>"""

    # Forest theme
    svg_forest = """<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><linearGradient id='forestGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#10b981' stop-opacity='0.08'/><stop offset='100%' stop-color='#047857' stop-opacity='0.05'/></linearGradient></defs><rect width='1920' height='1080' fill='url(#forestGrad)'/><path d='M-200,1080 Q480,800 960,1080 T1920,1080' fill='none' stroke='#059669' stroke-width='100' opacity='0.05'/><path d='M960,0 Q1440,300 960,600 T960,1080' fill='none' stroke='#34d399' stroke-width='5' opacity='0.1'/><circle cx='480' cy='300' r='200' fill='#10b981' opacity='0.05'/><circle cx='1440' cy='800' r='250' fill='#047857' opacity='0.05'/><path d='M200,200 L280,360 L120,360 Z' fill='#34d399' opacity='0.1' transform='rotate(15 200 280)'/><path d='M1700,500 L1780,660 L1620,660 Z' fill='#10b981' opacity='0.08' transform='rotate(-10 1700 580)'/></svg>"""

    # Sunset theme
    svg_sunset = """<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><linearGradient id='sunsetGrad' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#f97316' stop-opacity='0.1'/><stop offset='100%' stop-color='#ec4899' stop-opacity='0.08'/></linearGradient><radialGradient id='sunGlow' cx='50%' cy='100%' r='80%'><stop offset='0%' stop-color='#fbbf24' stop-opacity='0.2'/><stop offset='100%' stop-color='#f97316' stop-opacity='0'/></radialGradient></defs><rect width='1920' height='1080' fill='url(#sunsetGrad)'/><circle cx='960' cy='1080' r='600' fill='url(#sunGlow)'/><path d='M0,800 Q480,750 960,800 T1920,800' stroke='#f97316' stroke-width='5' fill='none' opacity='0.15'/><path d='M0,600 Q480,550 960,600 T1920,600' stroke='#fb923c' stroke-width='4' fill='none' opacity='0.1'/><path d='M960,1080 L480,0' stroke='#fbbf24' stroke-width='50' opacity='0.03'/><path d='M960,1080 L1440,0' stroke='#fbbf24' stroke-width='50' opacity='0.03'/></svg>"""

    # Midnight theme
    svg_midnight = """<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><radialGradient id='starGlow' r='50%'><stop offset='0%' stop-color='white' stop-opacity='0.8'/><stop offset='100%' stop-color='white' stop-opacity='0'/></radialGradient><radialGradient id='nebula' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='#6366f1' stop-opacity='0.1'/><stop offset='100%' stop-color='#111827' stop-opacity='0'/></radialGradient></defs><rect width='1920' height='1080' fill='#111827' opacity='0.05'/><circle cx='960' cy='540' r='800' fill='url(#nebula)'/><circle cx='200' cy='200' r='4' fill='url(#starGlow)'/><circle cx='1700' cy='300' r='6' fill='url(#starGlow)'/><circle cx='500' cy='900' r='5' fill='url(#starGlow)'/><circle cx='1400' cy='800' r='3' fill='url(#starGlow)'/><circle cx='960' cy='100' r='4' fill='url(#starGlow)'/><circle cx='100' cy='1000' r='5' fill='url(#starGlow)'/><circle cx='1800' cy='100' r='4' fill='url(#starGlow)'/></svg>"""

    # Sakura theme
    svg_sakura = """<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><linearGradient id='sakuraGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#ec4899' stop-opacity='0.08'/><stop offset='100%' stop-color='#be185d' stop-opacity='0.04'/></linearGradient><path id='petal' d='M0,0 C5,-5 10,0 10,5 C10,10 5,15 0,10 C-5,15 -10,10 -10,5 C-10,0 -5,-5 0,0' fill='#f472b6' opacity='0.15'/></defs><rect width='1920' height='1080' fill='url(#sakuraGrad)'/><use href='#petal' x='200' y='200' transform='rotate(45 200 200) scale(4)'/><use href='#petal' x='1700' y='300' transform='rotate(-30 1700 300) scale(3)'/><use href='#petal' x='600' y='900' transform='rotate(90 600 900) scale(2.5)'/><use href='#petal' x='1200' y='700' transform='rotate(180 1200 700) scale(2)'/><circle cx='960' cy='540' r='400' fill='#fbcfe8' opacity='0.05'/></svg>"""

    # Volcano theme
    svg_volcano = """<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><linearGradient id='volcanoGrad' x1='0%' y1='100%' x2='100%' y2='0%'><stop offset='0%' stop-color='#dc2626' stop-opacity='0.1'/><stop offset='100%' stop-color='#991b1b' stop-opacity='0.05'/></linearGradient><pattern id='heat' width='40' height='40' patternUnits='userSpaceOnUse'><path d='M0,20 Q20,0 40,20' fill='none' stroke='#f97316' stroke-width='2' opacity='0.1'/></pattern></defs><rect width='1920' height='1080' fill='url(#volcanoGrad)'/><rect width='1920' height='1080' fill='url(#heat)'/><path d='M0,1080 L480,800 L960,1000 L1440,700 L1920,1080 Z' fill='#7f1d1d' opacity='0.05'/><circle cx='1440' cy='300' r='150' fill='#ef4444' opacity='0.05'/></svg>"""

    # Arctic theme
    svg_arctic = """<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><defs><linearGradient id='arcticGrad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='#0ea5e9' stop-opacity='0.08'/><stop offset='100%' stop-color='#0369a1' stop-opacity='0.04'/></linearGradient></defs><rect width='1920' height='1080' fill='url(#arcticGrad)'/><path d='M400,200 L600,600 L200,600 Z' fill='#e0f2fe' opacity='0.1'/><path d='M1400,800 L1600,1200 L1200,1200 Z' fill='#bae6fd' opacity='0.08' transform='rotate(180 1400 1000)'/><path d='M960,400 L1160,800 L760,800 Z' fill='#7dd3fc' opacity='0.05' transform='rotate(45 960 600)'/><circle cx='200' cy='900' r='100' fill='white' opacity='0.05'/></svg>"""

    svg_map = {
        "ocean": svg_ocean,
        "forest": svg_forest,
        "sunset": svg_sunset,
        "midnight": svg_midnight,
        "sakura": svg_sakura,
        "volcano": svg_volcano,
        "arctic": svg_arctic,
        "default": svg_default
    }

    svg = svg_map.get(visual, svg_default)
    out_path.write_text(svg)


def lerp(c1, c2, t):
    return tuple(int(a + (b - a) * t) for a, b in zip(c1, c2))


def generate_local_background(visual: str, audio: str, out_img: Path, width=1920, height=1080):
    seed = f"{visual}-{audio}"
    rng = random.Random(seed)

    base_palettes = {
        "default": ((59,130,246), (96,165,250)),
        "ocean": ((6,182,212), (103,232,249)),
        "forest": ((16,185,129), (110,231,183)),
        "sunset": ((249,115,22), (251,191,36)),
        "midnight": ((99,102,241), (165,180,252)),
        "sakura": ((236,72,153), (244,114,182)),
        "volcano": ((220,38,38), (249,115,22)),
        "arctic": ((14,165,233), (125,211,252)),
    }

    audio_overlays = {
        "classic": (255, 255, 255, 22),
        "zen": (255, 255, 255, 28),
        "funfair": (255, 214, 102, 36),
        "retro": (255, 102, 204, 32),
        "space": (160, 196, 255, 28),
        "nature": (182, 255, 182, 26),
        "crystal": (200, 255, 255, 34),
        "minimal": (255, 255, 255, 18),
    }

    c1, c2 = base_palettes.get(visual, base_palettes["default"])
    base = Image.new("RGB", (width, height), c1)
    draw = ImageDraw.Draw(base)

    # Gradient background
    for y in range(height):
        t = y / (height - 1)
        color = lerp(c1, c2, t)
        draw.line([(0, y), (width, y)], fill=color)

    # Soft blobs
    blob_count = 6
    for _ in range(blob_count):
        bx = rng.uniform(-0.1, 1.1) * width
        by = rng.uniform(-0.1, 1.1) * height
        br = rng.uniform(0.15, 0.35) * min(width, height)
        opacity = rng.randint(30, 70)
        hue_shift = rng.uniform(-0.08, 0.08)
        blob_c = lerp(c1, c2, rng.random())
        blob_c = tuple(max(0, min(255, int(ch * (1 + hue_shift)))) for ch in blob_c)
        blob = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        bdraw = ImageDraw.Draw(blob)
        bdraw.ellipse([(bx - br, by - br), (bx + br, by + br)], fill=blob_c + (opacity,))
        blob = blob.filter(ImageFilter.GaussianBlur(radius=br * 0.4))
        base = Image.alpha_composite(base.convert("RGBA"), blob).convert("RGB")

    # Audio-tinted veil
    overlay_color = audio_overlays.get(audio, (255, 255, 255, 20))
    veil = Image.new("RGBA", (width, height), overlay_color)
    base = Image.alpha_composite(base.convert("RGBA"), veil).convert("RGB")

    # Get combo description for context
    combo_key = f"{visual}_{audio}"
    combo = THEME_COMBOS.get(combo_key, {})
    description = combo.get('description', '').lower()

    # Themed motif overlays (subtle, description-aware)
    motif = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(motif)

    # Audio style modifiers
    pixelated = audio == "retro"
    minimal_style = audio == "minimal"
    flowing = audio == "zen"
    playful = audio == "funfair"
    geometric = audio == "crystal"

    def draw_ocean(pixelated=False):
        # Draw waves
        for i in range(8):
            y = rng.uniform(0.2, 0.9) * height
            amp = rng.uniform(15, 40)
            freq = rng.uniform(2, 4)
            phase = rng.uniform(0, 6.28)
            pts = []
            step = 32 if pixelated else 12
            for x in range(0, width, step):
                t = x / width
                yy = y + amp * (rng.uniform(0.8,1.2)) * (math.sin(freq * t * 3.14 + phase))
                if pixelated:
                    yy = int(yy / 16) * 16
                pts.append((x, yy))
            width_line = 4 if pixelated else 2
            alpha = 35 if pixelated else (18 if minimal_style else 28)
            mdraw.line(pts, fill=(255, 255, 255, alpha), width=width_line)
        
        # Draw fish or bubbles
        creature_count = 8 if pixelated else 12
        if not minimal_style:
            for _ in range(creature_count):
                x = rng.uniform(0.1, 0.9) * width
                y = rng.uniform(0.3, 0.8) * height
                size = rng.randint(12, 24) if pixelated else rng.randint(8, 16)
                alpha = rng.randint(40, 80)
                if pixelated:
                    # 8-bit fish
                    x = int(x / 16) * 16
                    y = int(y / 16) * 16
                    mdraw.rectangle([(x, y), (x+size*2, y+size)], fill=(255,255,255,alpha))
                    mdraw.polygon([(x+size*2, y), (x+size*3, y+size//2), (x+size*2, y+size)], fill=(255,255,255,alpha))
                else:
                    # Bubbles
                    mdraw.ellipse([(x-size//2, y-size//2), (x+size//2, y+size//2)], fill=(255,255,255,alpha))

    def draw_midnight(pixelated=False, playful=False):
        # Draw moon
        moon_x = width * rng.uniform(0.7, 0.85)
        moon_y = height * rng.uniform(0.15, 0.3)
        moon_r = rng.uniform(60, 100)
        
        if pixelated:
            # 8-bit moon
            moon_x = int(moon_x / 16) * 16
            moon_y = int(moon_y / 16) * 16
            moon_r = max(16, int(moon_r / 16) * 16)
            for i in range(max(1, int(moon_r // 16))):
                offset = i * 16
                size = max(8, moon_r - offset * 2)
                x1 = moon_x - size // 2
                y1 = moon_y - size // 2
                x2 = moon_x + size // 2
                y2 = moon_y + size // 2
                mdraw.rectangle([(x1, y1), (x2, y2)], fill=(255,255,255,60+i*10))
        else:
            # Smooth moon with glow
            for i in range(5):
                r = moon_r + i * 15
                alpha = 80 - i * 15
                mdraw.ellipse([(moon_x-r, moon_y-r), (moon_x+r, moon_y+r)], fill=(255,255,255,alpha))
        
        # Draw stars and constellations
        star_count = 80 if minimal_style else 150
        for _ in range(star_count):
            x = rng.randint(0, width-1)
            y = rng.randint(0, height-1)
            if pixelated:
                x = (x // 8) * 8
                y = (y // 8) * 8
                size = rng.choice([4, 8, 12])
                alpha = rng.randint(50, 120)
                mdraw.rectangle([(x, y), (x+size, y+size)], fill=(255,255,255,alpha))
            elif playful:
                r = rng.choice([2,3,4,5])
                alpha = rng.randint(50, 130)
                color = (255, rng.randint(200,255), rng.randint(180,255), alpha)
                mdraw.ellipse([(x-r, y-r), (x+r, y+r)], fill=color)
                # Sparkle effect
                if rng.random() < 0.15:
                    mdraw.line([(x-r*2, y), (x+r*2, y)], fill=color, width=1)
                    mdraw.line([(x, y-r*2), (x, y+r*2)], fill=color, width=1)
            else:
                r = rng.choice([1,1,1,2,3])
                alpha = rng.randint(40, 100)
                mdraw.ellipse([(x-r, y-r), (x+r, y+r)], fill=(255,255,255,alpha))
        
        # Draw constellation lines
        if not minimal_style:
            constellation_count = 3
            for _ in range(constellation_count):
                cx = rng.uniform(0.2, 0.8) * width
                cy = rng.uniform(0.2, 0.7) * height
                points = []
                for i in range(rng.randint(4, 7)):
                    px = cx + rng.uniform(-150, 150)
                    py = cy + rng.uniform(-150, 150)
                    if pixelated:
                        px = int(px / 16) * 16
                        py = int(py / 16) * 16
                    points.append((px, py))
                for i in range(len(points)-1):
                    mdraw.line([points[i], points[i+1]], fill=(255,255,255,25), width=2 if pixelated else 1)

    def draw_sakura(pixelated=False, flowing=False):
        # Draw tree branches
        branch_count = 2 if minimal_style else 3
        for _ in range(branch_count):
            x_start = rng.uniform(0.1, 0.9) * width
            y_start = height * rng.uniform(0.6, 1.0)
            if pixelated:
                x_start = int(x_start / 16) * 16
                y_start = int(y_start / 16) * 16
                # 8-bit branch
                branch_len = rng.randint(8, 16)
                for i in range(branch_len):
                    x = x_start + i * 16 * rng.uniform(-0.3, 0.3)
                    y = y_start - i * 24
                    mdraw.rectangle([(x, y), (x+12, y+12)], fill=(255,255,255,60))
            else:
                # Curved branch
                for i in range(15):
                    t = i / 15
                    x = x_start + (t * 200 * rng.uniform(-1, 1))
                    y = y_start - (t * 300)
                    mdraw.ellipse([(x-3, y-3), (x+3, y+3)], fill=(255,255,255,50))
        
        # Draw blossoms/petals
        petal_count = 30 if minimal_style else 60
        for _ in range(petal_count):
            cx = rng.uniform(-0.1,1.1)*width
            cy = rng.uniform(0,0.8)*height
            if pixelated:
                # 8-bit pixel blossom
                size = rng.choice([8, 12, 16])
                cx = int(cx / size) * size
                cy = int(cy / size) * size
                alpha = rng.randint(60,120)
                # Draw pixelated flower shape
                center = size // 2
                mdraw.rectangle([(cx-center, cy-center), (cx+center, cy+center)], fill=(255,220,240,alpha))
                mdraw.rectangle([(cx-size, cy-center//2), (cx+size, cy+center//2)], fill=(255,200,230,alpha))
                mdraw.rectangle([(cx-center//2, cy-size), (cx+center//2, cy+size)], fill=(255,200,230,alpha))
            else:
                rx = rng.uniform(12,32)
                ry = rx * rng.uniform(0.5,0.8)
                rot = rng.uniform(0,3.14)
                alpha = rng.randint(50,100)
                petal = Image.new("RGBA", (width, height), (0,0,0,0))
                pdraw = ImageDraw.Draw(petal)
                # 5-petal flower
                for i in range(5):
                    angle = (i / 5) * 6.28
                    px = cx + rx * 0.7 * math.cos(angle)
                    py = cy + ry * 0.7 * math.sin(angle)
                    pdraw.ellipse([(px-rx*0.5, py-ry*0.5), (px+rx*0.5, py+ry*0.5)], fill=(255,220,240,alpha))
                if not flowing:
                    petal = petal.rotate(rot*57.3, resample=Image.BICUBIC, center=(cx, cy))
                blur_radius = 1 if minimal_style else 3
                petal = petal.filter(ImageFilter.GaussianBlur(radius=blur_radius))
                motif.alpha_composite(petal)

    def draw_arctic(geometric=True, pixelated=False):
        # Draw ice formations/icicles
        ice_count = 4 if minimal_style else 6
        for _ in range(ice_count):
            x = rng.uniform(0.1, 0.9) * width
            top_y = height * rng.uniform(0, 0.3)
            height_ice = rng.uniform(150, 300)
            width_ice = rng.uniform(40, 80)
            
            if pixelated:
                # 8-bit icicle
                x = int(x / 16) * 16
                top_y = int(top_y / 16) * 16
                width_ice = int(width_ice / 16) * 16
                height_ice = int(height_ice / 16) * 16
                
                steps = int(height_ice / 16)
                for i in range(steps):
                    t = i / steps
                    y = top_y + i * 16
                    w = width_ice * (1 - t * 0.7)
                    x1 = x - w // 2
                    x2 = x + w // 2
                    x1 = int(x1 / 8) * 8
                    x2 = int(x2 / 8) * 8
                    mdraw.rectangle([(x1, y), (x2, y+16)], fill=(255,255,255,50+i*3))
            else:
                # Smooth icicle
                poly = [
                    (x, top_y),
                    (x - width_ice//2, top_y + height_ice * 0.3),
                    (x, top_y + height_ice),
                    (x + width_ice//2, top_y + height_ice * 0.3)
                ]
                mdraw.polygon(poly, fill=(255,255,255,45))
        
        # Draw snowflakes/crystals
        crystal_count = 20 if minimal_style else 40
        for _ in range(crystal_count):
            cx = rng.uniform(0,1)*width
            cy = rng.uniform(0,1)*height
            size = rng.uniform(20,50) if not pixelated else rng.choice([16, 24, 32])
            alpha = rng.randint(45,90)
            
            if pixelated:
                # 8-bit snowflake
                cx = int(cx / 8) * 8
                cy = int(cy / 8) * 8
                s = int(size / 8) * 8
                # Cross pattern
                mdraw.rectangle([(cx-s, cy-s//4), (cx+s, cy+s//4)], fill=(255,255,255,alpha))
                mdraw.rectangle([(cx-s//4, cy-s), (cx+s//4, cy+s)], fill=(255,255,255,alpha))
                # Diagonal arms
                for i in range(-s//2, s//2, 8):
                    mdraw.rectangle([(cx+i-4, cy+i-4), (cx+i+4, cy+i+4)], fill=(255,255,255,alpha-20))
                    mdraw.rectangle([(cx+i-4, cy-i-4), (cx+i+4, cy-i+4)], fill=(255,255,255,alpha-20))
            elif geometric:
                # 6-pointed snowflake
                for i in range(6):
                    angle = (i / 6) * 6.28
                    x1, y1 = cx, cy
                    x2 = cx + size * math.cos(angle)
                    y2 = cy + size * math.sin(angle)
                    mdraw.line([(x1, y1), (x2, y2)], fill=(255,255,255,alpha), width=2)
                    # Side branches
                    for t in [0.4, 0.7]:
                        bx = cx + size * t * math.cos(angle)
                        by = cy + size * t * math.sin(angle)
                        for ba in [angle - 0.5, angle + 0.5]:
                            bx2 = bx + size * 0.2 * math.cos(ba)
                            by2 = by + size * 0.2 * math.sin(ba)
                            mdraw.line([(bx, by), (bx2, by2)], fill=(255,255,255,alpha-20), width=1)
            else:
                # Simple crystal
                poly = []
                for i in range(6):
                    angle = (i / 6) * 6.28
                    radius = size * rng.uniform(0.7,1.0)
                    poly.append((cx + radius*math.cos(angle), cy + radius*math.sin(angle)))
                mdraw.polygon(poly, fill=(255,255,255,alpha))

        # Add polar animals for nature/space moods (shape-based silhouettes)
        if audio in ("nature", "space"):
            animal_count = 1 if minimal_style else 2
            for i in range(animal_count):
                ax = width * rng.uniform(0.15, 0.85)
                ay = height * rng.uniform(0.65, 0.85)
                scale = rng.uniform(50, 90)
                if pixelated:
                    ax = int(ax / 16) * 16
                    ay = int(ay / 16) * 16
                    scale = int(scale / 8) * 8
                    # Blocky polar bear (rectangle body + head + legs)
                    body_w = scale * 1.8
                    body_h = scale * 0.7
                    head_w = scale * 0.7
                    head_h = scale * 0.5
                    mdraw.rectangle([(ax, ay - body_h), (ax + body_w, ay)], fill=(255,255,255,70))
                    mdraw.rectangle([(ax + body_w, ay - head_h), (ax + body_w + head_w, ay)], fill=(255,255,255,80))
                    leg_w = scale * 0.25
                    for lx in [ax + scale*0.2, ax + scale*0.8, ax + scale*1.4, ax + scale*1.9]:
                        mdraw.rectangle([(lx, ay), (lx + leg_w, ay + scale*0.35)], fill=(255,255,255,80))
                else:
                    # Penguin/ bear silhouette via simple polygons
                    is_penguin = (i % 2 == 1)
                    if is_penguin:
                        body_h = scale * 1.6
                        body_w = scale * 0.9
                        head_r = scale * 0.35
                        # Body
                        mdraw.ellipse([(ax - body_w/2, ay - body_h), (ax + body_w/2, ay)], fill=(255,255,255,60))
                        # Wings
                        mdraw.polygon([(ax - body_w*0.6, ay - body_h*0.4), (ax - body_w*1.1, ay - body_h*0.2), (ax - body_w*0.5, ay - body_h*0.1)], fill=(255,255,255,50))
                        mdraw.polygon([(ax + body_w*0.6, ay - body_h*0.4), (ax + body_w*1.1, ay - body_h*0.2), (ax + body_w*0.5, ay - body_h*0.1)], fill=(255,255,255,50))
                        # Head
                        mdraw.ellipse([(ax - head_r, ay - body_h - head_r*0.8), (ax + head_r, ay - body_h + head_r*0.8)], fill=(255,255,255,70))
                        # Feet
                        mdraw.rectangle([(ax - body_w*0.25, ay), (ax + body_w*0.25, ay + scale*0.15)], fill=(255,255,255,70))
                    else:
                        # Bear-like soft silhouette
                        body_w = scale * 1.8
                        body_h = scale * 0.8
                        head_r = scale * 0.35
                        mdraw.ellipse([(ax, ay - body_h), (ax + body_w, ay)], fill=(255,255,255,55))
                        mdraw.ellipse([(ax + body_w - head_r*1.4, ay - body_h - head_r), (ax + body_w + head_r*0.6, ay - body_h + head_r)], fill=(255,255,255,70))
                        # Legs
                        leg_w = scale * 0.25
                        for lx in [ax + scale*0.2, ax + scale*0.9, ax + scale*1.6, ax + scale*2.0]:
                            mdraw.rectangle([(lx, ay), (lx + leg_w, ay + scale*0.25)], fill=(255,255,255,70))
        
        if not pixelated and not minimal_style:
            motif_blur = motif.filter(ImageFilter.GaussianBlur(radius=2))
            motif.paste(motif_blur, (0,0))

    def draw_forest(pixelated=False):
        # Draw trees
        tree_count = 3 if minimal_style else 5
        for _ in range(tree_count):
            trunk_x = rng.uniform(0.1, 0.9) * width
            trunk_bottom = height * rng.uniform(0.7, 0.9)
            trunk_height = rng.uniform(150, 300)
            trunk_width = rng.uniform(20, 40)
            canopy_y = trunk_bottom - trunk_height
            canopy_r = rng.uniform(80, 150)
            
            if pixelated:
                # 8-bit tree
                trunk_x = int(trunk_x / 16) * 16
                trunk_bottom = int(trunk_bottom / 16) * 16
                trunk_height = int(trunk_height / 16) * 16
                trunk_width = max(8, int(trunk_width / 8) * 8)
                canopy_r = int(canopy_r / 16) * 16
                canopy_y = trunk_bottom - trunk_height
                
                # Trunk
                trunk_top = trunk_bottom - trunk_height
                mdraw.rectangle([
                    (trunk_x - trunk_width//2, trunk_top),
                    (trunk_x + trunk_width//2, trunk_bottom)
                ], fill=(255,255,255,50))
                
                # Blocky canopy
                layers = max(1, int(canopy_r / 16))
                for i in range(layers):
                    layer_y = canopy_y + i * 16
                    layer_w = max(16, canopy_r - i * 12)
                    mdraw.rectangle([
                        (trunk_x - layer_w//2, layer_y),
                        (trunk_x + layer_w//2, layer_y + 16)
                    ], fill=(200,255,200,60+i*5))
            else:
                # Trunk
                trunk_top = trunk_bottom - trunk_height
                mdraw.rectangle([
                    (trunk_x - trunk_width//2, trunk_top),
                    (trunk_x + trunk_width//2, trunk_bottom)
                ], fill=(255,255,255,35))
                
                # Canopy (multiple circles)
                for i in range(4):
                    offset_x = rng.uniform(-30, 30)
                    offset_y = rng.uniform(-30, 30)
                    r = canopy_r * rng.uniform(0.6, 1.0)
                    mdraw.ellipse([
                        (trunk_x + offset_x - r, canopy_y + offset_y - r),
                        (trunk_x + offset_x + r, canopy_y + offset_y + r)
                    ], fill=(220,255,220,45))
        
        # Draw scattered leaves
        leaf_count = 30 if minimal_style else 60
        for _ in range(leaf_count):
            cx = rng.uniform(0,1)*width
            cy = rng.uniform(0,0.8)*height
            if pixelated:
                size = rng.choice([6, 8, 12])
                cx = int(cx / size) * size
                cy = int(cy / size) * size
                alpha = rng.randint(50,80)
                mdraw.rectangle([(cx-size, cy-size//2), (cx+size, cy+size//2)], fill=(200,255,200,alpha))
            else:
                rx = rng.uniform(8,24)
                ry = rx * rng.uniform(0.5,0.8)
                rot = rng.uniform(0,3.14)
                alpha = rng.randint(40,75)
                leaf = Image.new("RGBA", (width, height), (0,0,0,0))
                ldraw = ImageDraw.Draw(leaf)
                box = [(cx-rx, cy-ry), (cx+rx, cy+ry)]
                ldraw.ellipse(box, fill=(220,255,220,alpha))
                leaf = leaf.rotate(rot*57.3, resample=Image.BICUBIC, center=(cx, cy))
                leaf = leaf.filter(ImageFilter.GaussianBlur(radius=1.5))
                motif.alpha_composite(leaf)

    def draw_sunset(pixelated=False):
        # Draw sun
        sun_x = width * rng.uniform(0.6, 0.8)
        sun_y = height * rng.uniform(0.25, 0.4)
        sun_r = rng.uniform(80, 140)
        
        if pixelated:
            # 8-bit sun
            sun_x = int(sun_x / 16) * 16
            sun_y = int(sun_y / 16) * 16
            sun_r = max(16, int(sun_r / 16) * 16)
            for i in range(max(1, int(sun_r // 16))):
                offset = i * 16
                size = max(8, sun_r - offset * 2)
                x1 = sun_x - size // 2
                y1 = sun_y - size // 2
                x2 = sun_x + size // 2
                y2 = sun_y + size // 2
                mdraw.rectangle([(x1, y1), (x2, y2)], fill=(255,200,150,80+i*8))
        else:
            # Smooth sun with glow
            for i in range(6):
                r = sun_r + i * 20
                alpha = 90 - i * 12
                mdraw.ellipse([(sun_x-r, sun_y-r), (sun_x+r, sun_y+r)], fill=(255,220,180,alpha))
        
        # Draw sun rays
        ray_count = 8 if minimal_style else 16
        for i in range(ray_count):
            angle = (i / ray_count) * 6.28
            length = rng.uniform(width*0.3, width*0.6)
            start_r = sun_r + 20
            sx = sun_x + start_r * math.cos(angle)
            sy = sun_y + start_r * math.sin(angle)
            ex = sun_x + length * math.cos(angle)
            ey = sun_y + length * math.sin(angle)
            
            if pixelated:
                sx = int(sx / 16) * 16
                sy = int(sy / 16) * 16
                ex = int(ex / 16) * 16
                ey = int(ey / 16) * 16
                mdraw.line([(sx, sy), (ex, ey)], fill=(255,200,150,50), width=6)
            else:
                # Draw gradient rays
                segments = 8
                for j in range(segments):
                    t = j / segments
                    x1 = sx + (ex - sx) * t
                    y1 = sy + (ey - sy) * t
                    x2 = sx + (ex - sx) * (t + 1/segments)
                    y2 = sy + (ey - sy) * (t + 1/segments)
                    alpha = int(50 * (1 - t * 0.8))
                    mdraw.line([(x1, y1), (x2, y2)], fill=(255,220,180,alpha), width=4)

        # Spaceships for space audio
        if audio == "space":
            ship_count = 1 if minimal_style else 3
            for _ in range(ship_count):
                sx = width * rng.uniform(0.15, 0.85)
                sy = height * rng.uniform(0.15, 0.45)
                scale = rng.uniform(40, 90)
                if pixelated:
                    sx = int(sx / 16) * 16
                    sy = int(sy / 16) * 16
                    scale = int(scale / 8) * 8
                    body_w = scale
                    body_h = scale * 0.6
                    nose_w = scale * 0.5
                    mdraw.rectangle([(sx - body_w/2, sy - body_h/2), (sx + body_w/2, sy + body_h/2)], fill=(255,255,255,70))
                    mdraw.polygon([(sx + body_w/2, sy - body_h/2), (sx + body_w/2 + nose_w, sy), (sx + body_w/2, sy + body_h/2)], fill=(255,255,255,80))
                    # Thruster trail
                    mdraw.rectangle([(sx - body_w/2 - scale*0.3, sy - body_h*0.2), (sx - body_w/2, sy + body_h*0.2)], fill=(255,200,150,60))
                else:
                    body_w = scale * 1.2
                    body_h = scale * 0.7
                    nose = (sx + body_w*0.7, sy)
                    tail = (sx - body_w*0.7, sy)
                    top = (sx, sy - body_h*0.6)
                    bottom = (sx, sy + body_h*0.6)
                    mdraw.polygon([tail, (sx - body_w*0.3, sy - body_h*0.6), nose, (sx - body_w*0.3, sy + body_h*0.6)], fill=(255,255,255,70))
                    # Windows
                    win_r = scale * 0.1
                    for j in range(3):
                        wx = sx - body_w*0.2 + j * win_r * 2.5
                        wy = sy
                        mdraw.ellipse([(wx - win_r, wy - win_r), (wx + win_r, wy + win_r)], fill=(255,200,180,80))
                    # Exhaust trail
                    trail_len = scale * 0.9
                    mdraw.polygon([
                        (tail[0] - trail_len, sy),
                        (tail[0], sy - body_h*0.3),
                        (tail[0], sy + body_h*0.3)
                    ], fill=(255,200,150,60))
        
        # Add cloud silhouettes
        if not minimal_style and not pixelated:
            for _ in range(3):
                cx = rng.uniform(0.1, 0.9) * width
                cy = rng.uniform(0.4, 0.7) * height
                for i in range(4):
                    r = rng.uniform(30, 60)
                    ox = cx + rng.uniform(-50, 50)
                    mdraw.ellipse([(ox-r, cy-r//2), (ox+r, cy+r//2)], fill=(255,255,255,20))

    def draw_volcano(pixelated=False):
        # Draw volcano shape
        v_count = 1 if minimal_style else 2
        for _ in range(v_count):
            base_x = rng.uniform(0.2, 0.8) * width
            base_y = height * 0.85
            peak_y = height * rng.uniform(0.3, 0.5)
            v_width = rng.uniform(200, 400)
            
            if pixelated:
                # 8-bit volcano
                base_x = int(base_x / 32) * 32
                peak_y = int(peak_y / 32) * 32
                v_width = int(v_width / 32) * 32
                
                # Build blocky mountain
                steps = 8
                for i in range(steps):
                    t = i / steps
                    y = base_y - t * (base_y - peak_y)
                    w = v_width * (1 - t * 0.8)
                    x1 = base_x - w // 2
                    x2 = base_x + w // 2
                    x1 = int(x1 / 16) * 16
                    x2 = int(x2 / 16) * 16
                    y = int(y / 16) * 16
                    mdraw.rectangle([(x1, y), (x2, y+16)], fill=(255,255,255,40+i*5))
                
                # 8-bit lava from crater
                lava_streams = 5
                for _ in range(lava_streams):
                    lx = base_x + rng.uniform(-v_width//4, v_width//4)
                    lx = int(lx / 16) * 16
                    stream_height = rng.randint(6, 12) * 16
                    for j in range(0, stream_height, 16):
                        ly = peak_y + j
                        lx += rng.choice([-16, 0, 16])
                        mdraw.rectangle([(lx, ly), (lx+16, ly+16)], fill=(255,180,100,rng.randint(80,140)))
            else:
                # Smooth volcano
                poly = [
                    (base_x - v_width//2, base_y),
                    (base_x - v_width//4, peak_y + 50),
                    (base_x, peak_y),
                    (base_x + v_width//4, peak_y + 50),
                    (base_x + v_width//2, base_y)
                ]
                mdraw.polygon(poly, fill=(255,255,255,35))
                
                # Flowing lava
                lava_count = 12 if not minimal_style else 6
                for _ in range(lava_count):
                    x = base_x + rng.uniform(-v_width//3, v_width//3)
                    y1 = peak_y + rng.uniform(0, 80)
                    length = rng.uniform(150, 350)
                    for i in range(8):
                        t = i / 8
                        y = y1 + t * length
                        x_drift = x + rng.uniform(-20, 20) * t
                        alpha = rng.randint(50, 110)
                        w = rng.randint(3, 8)
                        mdraw.ellipse([(x_drift-w, y-w), (x_drift+w, y+w)], fill=(255,180,100,alpha))

    def add_grid(count=40):
        # minimal geometric accents
        step = width // (12 if pixelated else 20)
        alpha = 12 if minimal_style else 22
        for x in range(0, width, step):
            if rng.random() < 0.35:
                mdraw.line([(x, 0), (x, height)], fill=(255,255,255,alpha), width=1)
        for y in range(0, height, step):
            if rng.random() < 0.35:
                mdraw.line([(0, y), (width, y)], fill=(255,255,255,alpha), width=1)

    # Dispatch bold themed motifs with audio style modifiers
    if visual == "ocean":
        draw_ocean(pixelated=pixelated)
    elif visual == "forest":
        draw_forest(pixelated=pixelated)
    elif visual == "sunset":
        draw_sunset(pixelated=pixelated)
    elif visual == "midnight":
        draw_midnight(pixelated=pixelated, playful=playful)
    elif visual == "sakura":
        draw_sakura(pixelated=pixelated, flowing=flowing)
    elif visual == "volcano":
        draw_volcano(pixelated=pixelated)
    elif visual == "arctic":
        draw_arctic(geometric=geometric, pixelated=pixelated)
    else:
        add_grid()

    base = Image.alpha_composite(base.convert("RGBA"), motif).convert("RGB")

    # Vignette for readable center (darken edges slightly)
    vignette = Image.new("L", (width, height), 0)
    vdraw = ImageDraw.Draw(vignette)
    for i in range(10):
        inset = int(i * 0.035 * min(width, height))
        alpha = int(180 * (i / 9))
        vdraw.rectangle([inset, inset, width - inset, height - inset], outline=alpha, width=3)
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=width * 0.06))

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    overlay.putalpha(vignette)
    base = Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")

    base.save(out_img, quality=90)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="assets/themes", help="Root assets directory")
    parser.add_argument("--format", default="png", choices=["png","jpg"], help="Output image format")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Model name (ignored for local generation)")
    parser.add_argument("--dry-run", action="store_true", help="Skip writing images (placeholder only)")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of images to generate (for testing)")
    parser.add_argument("--clean", action="store_true", help="Remove existing background images before generation")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        print(f"Error: root path {root} not found", file=sys.stderr)
        sys.exit(1)

    if not PIL_AVAILABLE:
        print("Pillow not installed; cannot generate local backgrounds.", file=sys.stderr)
        sys.exit(1)

    if args.dry_run:
        print("Dry run enabled; writing placeholders only")

    # Optional clean-up
    if args.clean:
        for p in root.glob("**/background.png"):
            try:
                p.unlink()
            except Exception:
                pass
        for p in root.glob("**/background.jpg"):
            try:
                p.unlink()
            except Exception:
                pass

    generated = 0
    total_attempts = 0
    for visual in VISUALS:
        for audio in AUDIOS:
            if args.limit and total_attempts >= args.limit:
                print(f"\nReached limit of {args.limit} images. Stopping.")
                break
                
            combo_dir = root / visual / audio
            if not combo_dir.exists():
                combo_dir.mkdir(parents=True, exist_ok=True)
            prompt = build_prompt(visual, audio)
            out_img = combo_dir / ("background." + args.format)
            out_svg = combo_dir / "background.svg"

            print(f"-> {visual}/{audio}: {out_img.name}")
            total_attempts += 1

            if args.dry_run:
                write_placeholder_svg(out_svg, visual)
                generated += 1
                continue

            try:
                generate_local_background(visual, audio, out_img)
                generated += 1
                print(f"  ✓ Generated {out_img.name} (local)")
            except Exception as e:
                print(f"  ! Local generation error: {e}")
                print("  Writing placeholder SVG")
                write_placeholder_svg(out_svg, visual)
                generated += 1
        
        if args.limit and total_attempts >= args.limit:
            break

    print(f"Done. Generated {generated} assets (local or placeholders).")

if __name__ == "__main__":
    main()
