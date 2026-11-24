import os
import re
import sys
import uuid
import json
import time
import urllib.request
import urllib.error
from html import unescape

# Read credentials from .env.local
with open(".env.local") as f:
    env = dict(
        line.strip().split("=", 1)
        for line in f
        if "=" in line and not line.startswith("#")
    )

SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SERVICE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"]
PROFIT_MARGIN = 650.0  # As requested: Supplier Price + Rs. 650
BUCKET_NAME = "product-images"

HEADERS_SUPABASE = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

def clean_html_to_markdown(html_text: str) -> str:
    if not html_text:
        return ""
    text = html_text
    # Convert <p> and <br>
    text = re.sub(r"<\s*br\s*/?\s*>", "\n", text, flags=re.I)
    text = re.sub(r"<\s*/p\s*>", "\n\n", text, flags=re.I)
    text = re.sub(r"<\s*p[^>]*>", "", text, flags=re.I)
    # Convert <strong>/<b>
    text = re.sub(r"<\s*(strong|b)[^>]*>(.*?)<\s*/\1\s*>", r"**\2**", text, flags=re.I)
    # Convert list items
    text = re.sub(r"<\s*li[^>]*>(.*?)<\s*/li\s*>", r"- \1\n", text, flags=re.I)
    text = re.sub(r"<\s*/?(ul|ol)[^>]*>", "\n", text, flags=re.I)
    # Remove any remaining html tags
    text = re.sub(r"<[^>]+>", "", text)
    # Unescape HTML entities (&amp;, etc.)
    text = unescape(text)
    # Normalize multiple newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def extract_warranty_months(desc_html: str, name: str) -> int | None:
    text = (desc_html or "") + " " + (name or "")
    ym = re.search(r'(\d+)\s*(?:year|yr)', text, re.I)
    mm = re.search(r'(\d+)\s*month', text, re.I)
    if ym:
        return int(ym.group(1)) * 12
    elif mm:
        return int(mm.group(1))
    return None

def slugify(text: str) -> str:
    s = text.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

# Preload existing categories
def get_or_create_category(name: str, slug: str, cache: dict) -> str:
    norm_name = name.strip()
    if norm_name.lower() in cache:
        return cache[norm_name.lower()]

    cat_slug = slugify(slug or norm_name)
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/categories",
        headers={**HEADERS_SUPABASE, "Prefer": "return=representation"},
        data=json.dumps({"name": norm_name, "slug": cat_slug}).encode("utf-8")
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            cat_id = data[0]["id"]
            cache[norm_name.lower()] = cat_id
            return cat_id
    except urllib.error.HTTPError as e:
        # If slug conflicted, fetch existing
        req_get = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/categories?select=id,name&slug=eq.{cat_slug}",
            headers=HEADERS_SUPABASE
        )
        with urllib.request.urlopen(req_get) as resp_get:
            existing = json.loads(resp_get.read().decode("utf-8"))
            if existing:
                cat_id = existing[0]["id"]
                cache[norm_name.lower()] = cat_id
                return cat_id
        raise e

# Upload image to Supabase Storage and get public URL
def upload_image_to_storage(image_url: str) -> str | None:
    try:
        ext = "jpg"
        if ".png" in image_url.lower(): ext = "png"
        elif ".webp" in image_url.lower(): ext = "webp"
        elif ".avif" in image_url.lower(): ext = "avif"

        content_types = {
            "jpg": "image/jpeg",
            "png": "image/png",
            "webp": "image/webp",
            "avif": "image/avif"
        }
        content_type = content_types.get(ext, "image/jpeg")

        # Fetch image bytes
        req = urllib.request.Request(
            image_url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            img_bytes = resp.read()

        if len(img_bytes) > 5 * 1024 * 1024:  # > 5MB
            print(f"  [warn] Image exceeds 5MB: {image_url}")
            return None

        # Upload to Supabase Storage
        file_path = f"products/{uuid.uuid4()}.{ext}"
        upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{file_path}"
        
        req_upload = urllib.request.Request(
            upload_url,
            headers={
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type": content_type,
                "x-upsert": "true",
            },
            data=img_bytes,
            method="POST"
        )
        with urllib.request.urlopen(req_upload, timeout=20) as resp_up:
            pass

        # Return public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{file_path}"
        return public_url
    except Exception as e:
        print(f"  [image error] Failed to download/upload {image_url}: {e}")
        return None

def import_product(item: dict, category_cache: dict) -> bool:
    name = item.get("name", "").strip()
    slug = item.get("slug", "").strip() or slugify(name)
    permalink = item.get("permalink", "").strip()
    
    # Prices
    prices = item.get("prices", {})
    raw_price = prices.get("price")
    if not raw_price:
        supplier_price = None
        selling_price = PROFIT_MARGIN
    else:
        supplier_price = float(raw_price) / 100.0
        selling_price = supplier_price + PROFIT_MARGIN

    in_stock = bool(item.get("is_in_stock", True))
    desc_html = item.get("description", "") or item.get("short_description", "")
    description = clean_html_to_markdown(desc_html)
    warranty_months = extract_warranty_months(desc_html, name)

    # Category
    cat_id = None
    cats = item.get("categories", [])
    if cats:
        # Take primary category
        main_cat = cats[0]
        cat_id = get_or_create_category(main_cat["name"], main_cat.get("slug", ""), category_cache)

    # Upload first 4 images to save storage and keep fast
    raw_images = [img["src"] for img in item.get("images", []) if "src" in img][:4]
    supabase_images = []
    for img_url in raw_images:
        uploaded = upload_image_to_storage(img_url)
        if uploaded:
            supabase_images.append(uploaded)

    # Check if product with this supplier_url or slug already exists
    req_check = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/product_private?select=product_id&supplier_url=eq.{urllib.parse.quote(permalink)}",
        headers=HEADERS_SUPABASE
    )
    existing_id = None
    try:
        with urllib.request.urlopen(req_check) as resp_c:
            data_c = json.loads(resp_c.read().decode("utf-8"))
            if data_c:
                existing_id = data_c[0]["product_id"]
    except Exception:
        pass

    if existing_id:
        # Update existing
        update_data = {
            "name": name,
            "description": description,
            "price": selling_price,
            "in_stock": in_stock,
            "is_visible": True,
            "category_id": cat_id,
        }
        if warranty_months is not None:
            update_data["warranty_months"] = warranty_months
        if supabase_images:
            update_data["images"] = supabase_images

        req_up = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/products?id=eq.{existing_id}",
            headers=HEADERS_SUPABASE,
            data=json.dumps(update_data).encode("utf-8"),
            method="PATCH"
        )
        with urllib.request.urlopen(req_up):
            pass

        # Update private
        req_up_priv = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/product_private?product_id=eq.{existing_id}",
            headers=HEADERS_SUPABASE,
            data=json.dumps({"supplier_price": supplier_price, "supplier_url": permalink}).encode("utf-8"),
            method="PATCH"
        )
        with urllib.request.urlopen(req_up_priv):
            pass

        print(f"  [updated] {name} (Selling: Rs. {selling_price}, Supplier: Rs. {supplier_price})")
        return True

    # Ensure unique slug
    base_slug = slug
    final_slug = base_slug
    counter = 1
    while True:
        req_slug = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/products?select=id&slug=eq.{final_slug}",
            headers=HEADERS_SUPABASE
        )
        with urllib.request.urlopen(req_slug) as resp_s:
            if not json.loads(resp_s.read().decode("utf-8")):
                break
        final_slug = f"{base_slug}-{counter}"
        counter += 1

    # Insert new product
    product_row = {
        "name": name,
        "slug": final_slug,
        "description": description,
        "price": selling_price,
        "in_stock": in_stock,
        "is_visible": True,
        "category_id": cat_id,
        "images": supabase_images,
        "warranty_months": warranty_months,
    }

    req_ins = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/products",
        headers={**HEADERS_SUPABASE, "Prefer": "return=representation"},
        data=json.dumps(product_row).encode("utf-8")
    )
    with urllib.request.urlopen(req_ins) as resp_i:
        created = json.loads(resp_i.read().decode("utf-8"))[0]
        prod_id = created["id"]

    # Insert product_private
    priv_row = {
        "product_id": prod_id,
        "supplier_price": supplier_price,
        "supplier_url": permalink,
    }
    req_priv = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/product_private",
        headers=HEADERS_SUPABASE,
        data=json.dumps(priv_row).encode("utf-8")
    )
    with urllib.request.urlopen(req_priv):
        pass

    print(f"  [created] {name} -> Rs. {selling_price} (Supplier: Rs. {supplier_price})")
    return True

if __name__ == "__main__":
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    print(f"Starting Seoul Trading catalog import (Target: {'ALL' if limit == 0 else limit} products)...")

    # Load categories cache
    req_cats = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/categories?select=id,name", headers=HEADERS_SUPABASE)
    category_cache = {}
    with urllib.request.urlopen(req_cats) as resp:
        for c in json.loads(resp.read().decode("utf-8")):
            category_cache[c["name"].lower()] = c["id"]

    page = 1
    imported_count = 0

    while True:
        url = f"https://seoultrading.lk/wp-json/wc/store/v1/products?per_page=10&page={page}"
        print(f"\nFetching page {page}...")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                items = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (400, 404):
                print("Reached end of products catalog.")
                break
            print(f"HTTP error on page {page}: {e}")
            break
        except Exception as e:
            print(f"Error fetching page {page}: {e}")
            break

        if not items:
            break

        for item in items:
            try:
                import_product(item, category_cache)
                imported_count += 1
                if limit and imported_count >= limit:
                    print(f"\nReached test limit of {limit} products.")
                    sys.exit(0)
            except Exception as e:
                print(f"  [error importing {item.get('name')}]: {e}")

        page += 1
        time.sleep(1)  # Friendly delay to avoid overloading supplier server

    print(f"\nImport finished! Total products imported/updated: {imported_count}")
