# Theme Background Generation (Gemini)

Generate per-combo backgrounds into `assets/themes/<visual>/<audio>/` using Google Gemini.

## Setup

1. Install deps:

```bash
pip install google-generativeai
```

2. Set your API key:

```bash
export GEMINI_API_KEY="your_key_here"
```

## Run

Dry run (placeholders only):

```bash
python3 scripts/generate_backgrounds.py --dry-run
```

Generate PNG backgrounds with Gemini:

```bash
python3 scripts/generate_backgrounds.py --format png --model "imagen-3.0-generate-001"
```

Note: Model name may vary. Check [Google AI Studio](https://ai.google.dev) for available Imagen models. Common options:
- `imagen-3.0-generate-001`
- `imagegeneration@006`

Outputs:
- `assets/themes/<visual>/<audio>/background.png` (or `.jpg`)
- Fallback: `background.svg` placeholder when API unavailable

## Customize Prompts
Edit `STYLE_HINTS` and `AUDIO_HINTS` in `scripts/generate_backgrounds.py` to tweak mood/style.
