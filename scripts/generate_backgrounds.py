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
from pathlib import Path

# Optional: try to import required libraries
REQUESTS_AVAILABLE = False
PIL_AVAILABLE = False
try:
    import requests
    REQUESTS_AVAILABLE = True
except Exception:
    REQUESTS_AVAILABLE = False

try:
    from PIL import Image
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

STYLE_HINTS = {
    "ocean": "Underwater ambience with soft cyan-blue gradients, gentle waves, light caustics",
    "forest": "Organic greens, leaf textures, dappled light, soft bokeh",
    "sunset": "Warm orange-pink gradients, twilight glow, subtle rays",
    "midnight": "Deep indigo-purple space ambience, stars, faint nebula",
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
    
    # Use the combo's description as the primary creative direction
    description = combo.get('description', f'{visual} + {audio}')
    name = combo.get('name', f'{visual.title()} {audio.title()}')
    
    # Build a detailed prompt using the combo description
    return (
        f"Generate a seamless, abstract background for a Sudoku puzzle game UI. "
        f"Theme name: {name}. "
        f"Creative direction: {description}. "
        f"Style: Abstract gradients and soft shapes that evoke this mood. "
        f"Requirements: Seamless, non-distracting, high readability for black text overlay, "
        f"16:9 aspect ratio (1920x1080), PNG format. "
        f"Avoid: Text, faces, logos, high detail, busy patterns."
    )

def write_placeholder_svg(out_path: Path, visual: str):
    # Minimal gradient SVG placeholder
    base_colors = {
        "ocean": ("#06b6d4","#67e8f9"),
        "forest": ("#10b981","#6ee7b7"),
        "sunset": ("#f97316","#fbbf24"),
        "midnight": ("#6366f1","#a5b4fc"),
        "sakura": ("#ec4899","#f472b6"),
        "volcano": ("#dc2626","#f97316"),
        "arctic": ("#0ea5e9","#7dd3fc"),
        "default": ("#3b82f6","#60a5fa")
    }
    c1, c2 = base_colors.get(visual, base_colors["default"])
    svg = f"""
<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='{c1}'/>
      <stop offset='100%' stop-color='{c2}'/>
    </linearGradient>
  </defs>
  <rect x='0' y='0' width='1920' height='1080' fill='url(#g)'/>
  <circle cx='30%' cy='40%' r='220' fill='#ffffff20' />
  <circle cx='70%' cy='65%' r='180' fill='#ffffff10' />
</svg>
"""
    out_path.write_text(svg)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="assets/themes", help="Root assets directory")
    parser.add_argument("--format", default="png", choices=["png","jpg"], help="Output image format")
    parser.add_argument("--model", default="imagen-4.0-fast-generate-001", help="Gemini image model name")
    parser.add_argument("--dry-run", action="store_true", help="Do not call API, only print actions or write placeholders")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of images to generate (for testing)")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists():
        print(f"Error: root path {root} not found", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("GEMINI_API_KEY")
    use_api = REQUESTS_AVAILABLE and PIL_AVAILABLE and api_key and not args.dry_run

    if use_api:
        print("Using Gemini Imagen REST API for image generation")
        if args.limit:
            print(f"Limiting to {args.limit} images for testing")
    else:
        if not REQUESTS_AVAILABLE:
            print("requests not installed; falling back to placeholders")
        elif not PIL_AVAILABLE:
            print("PIL not installed; falling back to placeholders")
        elif not api_key:
            print("GEMINI_API_KEY missing; falling back to placeholders")
        elif args.dry_run:
            print("Dry run enabled; writing placeholders")

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

            if use_api:
                try:
                    # Use Imagen REST API
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{args.model}:predict"
                    headers = {
                        "Content-Type": "application/json",
                        "x-goog-api-key": api_key
                    }
                    payload = {
                        "instances": [{
                            "prompt": prompt
                        }],
                        "parameters": {
                            "sampleCount": 1,
                            "aspectRatio": "16:9"
                        }
                    }
                    
                    response = requests.post(url, json=payload, headers=headers, timeout=60)
                    
                    if response.status_code == 200:
                        result = response.json()
                        if "predictions" in result and result["predictions"]:
                            # Imagen returns base64-encoded images
                            img_b64 = result["predictions"][0].get("bytesBase64Encoded") or result["predictions"][0].get("image")
                            if img_b64:
                                img_bytes = base64.b64decode(img_b64)
                                img = Image.open(io.BytesIO(img_bytes))
                                img.save(out_img)
                                generated += 1
                                print(f"  ✓ Generated {out_img.name}")
                            else:
                                print("  ! No image data in response, writing placeholder SVG")
                                write_placeholder_svg(out_svg, visual)
                        else:
                            print("  ! No predictions in response, writing placeholder SVG")
                            write_placeholder_svg(out_svg, visual)
                    else:
                        print(f"  ! API error {response.status_code}: {response.text[:200]}")
                        write_placeholder_svg(out_svg, visual)
                        
                except Exception as e:
                    print(f"  ! Generation error: {e}")
                    print("  Writing placeholder SVG")
                    write_placeholder_svg(out_svg, visual)
            else:
                # Placeholder fallbacks
                write_placeholder_svg(out_svg, visual)
                generated += 1
        
        if args.limit and total_attempts >= args.limit:
            break

    print(f"Done. Generated {generated} assets (including placeholders).")

if __name__ == "__main__":
    main()
