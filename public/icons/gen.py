from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.dirname(os.path.abspath(__file__))

def make_icon(size, path, maskable=False):
    img = Image.new('RGB', (size, size), 'black')
    draw = ImageDraw.Draw(img)
    # For maskable, keep a safe zone (10% padding); for regular icons, fill edge
    # Try a bold system font; fallback to default
    font = None
    for candidate in [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
    ]:
        if os.path.exists(candidate):
            font_size = int(size * 0.5)
            font = ImageFont.truetype(candidate, font_size)
            break
    if font is None:
        font = ImageFont.load_default()

    text = 'WE'
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill='white')

    # Border on regular icons
    if not maskable:
        b = max(2, size // 128)
        draw.rectangle([0, 0, size - 1, size - 1], outline='white', width=b)

    img.save(path, 'PNG')

make_icon(192, os.path.join(OUT, 'icon-192.png'))
make_icon(512, os.path.join(OUT, 'icon-512.png'))
make_icon(512, os.path.join(OUT, 'icon-maskable.png'), maskable=True)
make_icon(180, os.path.join(os.path.dirname(OUT), 'apple-touch-icon.png'))

print('icons generated')
