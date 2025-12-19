import os
import random
import math

# Configuration
ASSETS_DIR = "public/assets/themes"
WIDTH = 1920
HEIGHT = 1080

# Theme Definitions
THEMES = [
    "default", "ocean", "forest", "sunset",
    "midnight", "sakura", "volcano", "arctic"
]

SOUND_PACKS = [
    "classic", "zen", "funfair", "retro",
    "space", "nature", "crystal", "minimal"
]


def create_svg_header(width, height):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" preserveAspectRatio="xMidYMid slice">'


def create_svg_footer():
    return '</svg>'


def random_color(colors, opacity_range=(0.3, 0.7)):
    color = random.choice(colors)
    opacity = random.uniform(*opacity_range)
    return color, opacity

# --- Shape Generators ---


def draw_circle(cx, cy, r, color, opacity):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}" opacity="{opacity:.2f}" />'


def draw_rect(x, y, w, h, color, opacity, rotate=0):
    transform = f'transform="rotate({rotate} {x+w/2} {y+h/2})"' if rotate else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}" opacity="{opacity:.2f}" {transform} />'


def draw_star(cx, cy, r, color, opacity):
    points = []
    for i in range(10):
        angle = i * 36 * math.pi / 180
        radius = r if i % 2 == 0 else r / 2
        px = cx + radius * math.cos(angle)
        py = cy + radius * math.sin(angle)
        points.append(f"{px:.1f},{py:.1f}")
    return f'<polygon points="{" ".join(points)}" fill="{color}" opacity="{opacity:.2f}" />'


def draw_triangle(cx, cy, size, color, opacity, rotate=0):
    h = size * math.sqrt(3) / 2
    points = [
        f"{cx},{cy - h/2}",
        f"{cx - size/2},{cy + h/2}",
        f"{cx + size/2},{cy + h/2}"
    ]
    transform = f'transform="rotate({rotate} {cx} {cy})"' if rotate else ""
    return f'<polygon points="{" ".join(points)}" fill="{color}" opacity="{opacity:.2f}" {transform} />'


def draw_petal(cx, cy, size, color, opacity, rotate=0):
    # Simple petal shape using path
    d = f"M{cx},{cy} Q{cx+size/2},{cy-size} {cx},{cy-size*1.5} Q{cx-size/2},{cy-size} {cx},{cy}"
    transform = f'transform="rotate({rotate} {cx} {cy})"' if rotate else ""
    return f'<path d="{d}" fill="{color}" opacity="{opacity:.2f}" {transform} />'


def draw_fish(cx, cy, size, color, opacity):
    # Simple fish silhouette
    d = f"M{cx},{cy} Q{cx+size},{cy-size/2} {cx+size*1.5},{cy} Q{cx+size},{cy+size/2} {cx},{cy} L{cx-size/2},{cy-size/3} L{cx-size/2},{cy+size/3} Z"
    return f'<path d="{d}" fill="{color}" opacity="{opacity:.2f}" />'


def draw_tree(cx, cy, size, color, opacity):
    # Simple pine tree
    w = size / 2
    h = size
    points = [
        f"{cx},{cy-h}",
        f"{cx-w},{cy}",
        f"{cx+w},{cy}"
    ]
    return f'<polygon points="{" ".join(points)}" fill="{color}" opacity="{opacity:.2f}" />'


def draw_snowflake(cx, cy, size, color, opacity):
    # Simple cross snowflake
    lines = []
    for i in range(4):
        angle = i * 45
        transform = f'transform="rotate({angle} {cx} {cy})"'
        lines.append(
            f'<rect x="{cx-size/2}" y="{cy-1}" width="{size}" height="2" fill="{color}" opacity="{opacity:.2f}" {transform} />')
    return "".join(lines)


def draw_cloud(cx, cy, size, color, opacity):
    # Simple cloud using circles
    circles = [
        draw_circle(cx, cy, size*0.6, color, opacity),
        draw_circle(cx-size*0.5, cy+size*0.2, size*0.4, color, opacity),
        draw_circle(cx+size*0.5, cy+size*0.2, size*0.4, color, opacity),
        draw_circle(cx-size*0.2, cy-size*0.3, size*0.5, color, opacity)
    ]
    return "".join(circles)


def draw_ember(cx, cy, size, color, opacity):
    # Diamond shape
    points = [
        f"{cx},{cy-size}",
        f"{cx+size/2},{cy}",
        f"{cx},{cy+size}",
        f"{cx-size/2},{cy}"
    ]
    return f'<polygon points="{" ".join(points)}" fill="{color}" opacity="{opacity:.2f}" />'

# --- Theme Generators ---


def generate_default():
    elements = []
    colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#ffffff"]
    for _ in range(20):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        size = random.randint(20, 100)
        color, opacity = random_color(colors, (0.05, 0.2))
        shape_type = random.choice(['circle', 'rect', 'triangle'])

        if shape_type == 'circle':
            elements.append(draw_circle(cx, cy, size/2, color, opacity))
        elif shape_type == 'rect':
            elements.append(draw_rect(cx, cy, size, size, color,
                            opacity, random.randint(0, 90)))
        else:
            elements.append(draw_triangle(cx, cy, size, color,
                            opacity, random.randint(0, 360)))
    return "\n".join(elements)


def generate_ocean():
    elements = []
    colors = ["#0891b2", "#06b6d4", "#67e8f9", "#ffffff"]
    # Bubbles
    for _ in range(30):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        r = random.randint(5, 30)
        color, opacity = random_color(colors, (0.1, 0.3))
        elements.append(draw_circle(cx, cy, r, color, opacity))
    # Fish
    for _ in range(10):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        size = random.randint(30, 60)
        color, opacity = random_color(["#ffffff", "#cffafe"], (0.1, 0.2))
        elements.append(draw_fish(cx, cy, size, color, opacity))
    return "\n".join(elements)


def generate_forest():
    elements = []
    colors = ["#059669", "#10b981", "#34d399", "#d1fae5"]
    # Trees
    for _ in range(15):
        cx = random.randint(0, WIDTH)
        cy = random.randint(HEIGHT//2, HEIGHT)  # Mostly lower half
        size = random.randint(50, 150)
        color, opacity = random_color(colors, (0.1, 0.3))
        elements.append(draw_tree(cx, cy, size, color, opacity))
    # Leaves/Particles
    for _ in range(30):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        r = random.randint(3, 8)
        color, opacity = random_color(colors, (0.2, 0.4))
        elements.append(draw_circle(cx, cy, r, color, opacity))
    return "\n".join(elements)


def generate_sunset():
    elements = []
    colors = ["#ea580c", "#f97316", "#fb923c", "#fbbf24", "#ffffff"]
    # Clouds
    for _ in range(8):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT//2)
        size = random.randint(80, 150)
        color, opacity = random_color(["#ffffff", "#ffedd5"], (0.1, 0.3))
        elements.append(draw_cloud(cx, cy, size, color, opacity))
    # Birds (simple V shapes)
    for _ in range(15):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT//2)
        size = random.randint(10, 20)
        color = "#431407"  # Dark brown
        opacity = 0.2
        # V shape path
        d = f"M{cx},{cy} L{cx+size/2},{cy+size/2} L{cx+size},{cy}"
        elements.append(
            f'<path d="{d}" stroke="{color}" stroke-width="2" fill="none" opacity="{opacity}" />')
    return "\n".join(elements)


def generate_midnight():
    elements = []
    colors = ["#ffffff", "#e0e7ff", "#c7d2fe"]
    # Stars
    for _ in range(100):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        r = random.uniform(1, 3)
        color, opacity = random_color(colors, (0.2, 0.8))
        elements.append(draw_circle(cx, cy, r, color, opacity))
    # Larger stars
    for _ in range(10):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        r = random.randint(5, 15)
        color, opacity = random_color(colors, (0.1, 0.4))
        elements.append(draw_star(cx, cy, r, color, opacity))
    return "\n".join(elements)


def generate_sakura():
    elements = []
    colors = ["#db2777", "#ec4899", "#f472b6", "#fbcfe8"]
    # Petals
    for _ in range(50):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        size = random.randint(10, 25)
        color, opacity = random_color(colors, (0.2, 0.5))
        rotate = random.randint(0, 360)
        elements.append(draw_petal(cx, cy, size, color, opacity, rotate))
    return "\n".join(elements)


def generate_volcano():
    elements = []
    colors = ["#dc2626", "#f87171", "#fca5a5", "#fb923c"]
    # Embers
    for _ in range(40):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        size = random.randint(5, 15)
        color, opacity = random_color(colors, (0.3, 0.6))
        elements.append(draw_ember(cx, cy, size, color, opacity))
    # Smoke/Ash (dark circles)
    for _ in range(20):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        r = random.randint(20, 50)
        color = "#1f2937"  # Dark gray
        opacity = random.uniform(0.05, 0.15)
        elements.append(draw_circle(cx, cy, r, color, opacity))
    return "\n".join(elements)


def generate_arctic():
    elements = []
    colors = ["#ffffff", "#e0f2fe", "#bae6fd"]
    # Snowflakes
    for _ in range(40):
        cx = random.randint(0, WIDTH)
        cy = random.randint(0, HEIGHT)
        size = random.randint(10, 30)
        color, opacity = random_color(colors, (0.2, 0.5))
        elements.append(draw_snowflake(cx, cy, size, color, opacity))
    return "\n".join(elements)

# --- Main Execution ---


GENERATORS = {
    "default": generate_default,
    "ocean": generate_ocean,
    "forest": generate_forest,
    "sunset": generate_sunset,
    "midnight": generate_midnight,
    "sakura": generate_sakura,
    "volcano": generate_volcano,
    "arctic": generate_arctic
}


def main():
    print(f"Generating theme backgrounds in {ASSETS_DIR}...")

    if not os.path.exists(ASSETS_DIR):
        print(f"Error: {ASSETS_DIR} does not exist.")
        return

    count = 0
    for theme in THEMES:
        if theme not in GENERATORS:
            print(f"Warning: No generator for theme '{theme}'")
            continue

        svg_content = create_svg_header(WIDTH, HEIGHT)
        svg_content += GENERATORS[theme]()
        svg_content += create_svg_footer()

        # Write to all sound pack subdirectories for this theme
        theme_dir = os.path.join(ASSETS_DIR, theme)
        if not os.path.exists(theme_dir):
            continue

        for sound_pack in SOUND_PACKS:
            pack_dir = os.path.join(theme_dir, sound_pack)
            if os.path.exists(pack_dir):
                file_path = os.path.join(pack_dir, "background.svg")
                with open(file_path, "w") as f:
                    f.write(svg_content)
                count += 1

    print(f"Successfully generated {count} background.svg files.")


if __name__ == "__main__":
    main()
