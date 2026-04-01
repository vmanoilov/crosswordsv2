import os
from PIL import Image, ImageDraw, ImageFont

def generate_gradient(width, height, start_color, end_color):
    base = Image.new('RGB', (width, height), start_color)
    top = Image.new('RGB', (width, height), end_color)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        mask_data.extend([int(255 * (y / height))] * width)
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def draw_grid_icon(draw, center_x, center_y, size):
    # Draw a simple glassmorphism 3x3 grid
    cell_size = size // 3
    offset = size // 2
    for row in range(3):
        for col in range(3):
            if (row + col) % 2 == 0:
                x = center_x - offset + col * cell_size
                y = center_y - offset + row * cell_size
                draw.rectangle([x, y, x + cell_size, y + cell_size], fill=(255, 255, 255, 100))

def create_icon():
    img = generate_gradient(1024, 1024, (139, 92, 246), (34, 211, 238))
    img = img.convert('RGBA')
    draw = ImageDraw.Draw(img)
    draw_grid_icon(draw, 512, 512, 600)
    
    # Add a border
    draw.rounded_rectangle([212, 212, 812, 812], radius=60, outline=(255, 255, 255, 180), width=16)
    
    os.makedirs('/app/frontend/assets/images', exist_ok=True)
    img.save('/app/frontend/assets/images/icon.png')
    img.save('/app/frontend/assets/images/adaptive-icon.png')

def create_splash():
    img = generate_gradient(1242, 2436, (10, 10, 26), (26, 26, 58))
    img = img.convert('RGBA')
    draw = ImageDraw.Draw(img)
    
    # Draw some floating orbs
    draw.ellipse([-200, -200, 600, 600], fill=(139, 92, 246, 60))
    draw.ellipse([800, 1800, 1400, 2400], fill=(236, 72, 153, 60))
    
    draw_grid_icon(draw, 621, 1000, 400)
    
    # "КРЪСТОСЛОВИЦА" text (we'll just draw a nice decorative rectangle if no font)
    draw.rectangle([321, 1300, 921, 1350], fill=(255, 255, 255, 80))
    draw.rectangle([421, 1400, 821, 1420], fill=(255, 255, 255, 50))
    
    img.save('/app/frontend/assets/images/splash-icon.png')

if __name__ == "__main__":
    create_icon()
    create_splash()
