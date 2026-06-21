import os
from PIL import Image, ImageDraw

def create_icon(size):
    # Create image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale coordinates based on size
    s = lambda val: int(val * size / 512)
    
    # Draw background rounded rect
    draw.rounded_rectangle([0, 0, size, size], radius=s(128), fill=(15, 82, 56, 255))
    
    # Add a glowing circle border inside
    draw.arc([s(106), s(116), s(406), s(416)], start=0, end=360, fill=(255, 255, 255, 38), width=s(12))
    
    # Outer arc highlight (accent leaf color)
    draw.arc([s(106), s(116), s(406), s(416)], start=180, end=360, fill=(52, 211, 153, 200), width=s(6))
    
    # Main Bowl Body (Half-circle)
    draw.chord([s(156), s(166), s(356), s(366)], start=0, end=180, fill=(241, 245, 249, 255))
    
    # Cutlery (Fork and Spoon) in slate color
    # Fork
    draw.rectangle([s(210), s(220), s(213), s(250)], fill=(71, 85, 105, 220))
    draw.rectangle([s(216), s(220), s(219), s(250)], fill=(71, 85, 105, 220))
    draw.rectangle([s(222), s(220), s(225), s(250)], fill=(71, 85, 105, 220))
    draw.rectangle([s(210), s(248), s(225), s(254)], fill=(71, 85, 105, 220))
    draw.rectangle([s(216), s(254), s(219), s(295)], fill=(71, 85, 105, 220))
    
    # Spoon
    draw.ellipse([s(275), s(220), s(295), s(256)], fill=(71, 85, 105, 220))
    draw.rectangle([s(283), s(256), s(286), s(295)], fill=(71, 85, 105, 220))
    
    # Leaf growing out
    leaf_pts = [
        (s(256), s(266)),
        (s(280), s(210)),
        (s(330), s(170)),
        (s(370), s(130)),
        (s(360), s(180)),
        (s(320), s(230)),
        (s(256), s(266))
    ]
    draw.polygon(leaf_pts, fill=(52, 211, 153, 255))
    
    # Leaf stem line
    draw.line([(s(256), s(266)), (s(370), s(130))], fill=(255, 255, 255, 150), width=s(4))
    
    return img

os.makedirs("public/icons", exist_ok=True)
create_icon(192).save("public/icons/icon-192x192.png", "PNG")
create_icon(512).save("public/icons/icon-512x512.png", "PNG")
print("Icons generated successfully!")
