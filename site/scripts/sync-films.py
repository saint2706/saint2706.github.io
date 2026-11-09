# /// script
# dependencies = ["curl_cffi", "beautifulsoup4", "letterboxdpy"]
# ///
"""
Letterboxd Sync Pipeline (letterboxdpy + curl_cffi)
Fetches all logged films and written reviews from https://letterboxd.com/saint2706/,
downloads missing poster artwork locally to site/public/films/ (zero-external-host CSP),
and updates site/content/films.json while preserving long-form essays.
"""

import os
import re
import sys
import json
import time
import html
from curl_cffi import requests
from bs4 import BeautifulSoup
from letterboxdpy.pages.user_films import UserFilms
from letterboxdpy.pages.user_reviews import UserReviews

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTERS_DIR = os.path.join(ROOT_DIR, 'public', 'films')
FILMS_JSON_PATH = os.path.join(ROOT_DIR, 'content', 'films.json')
USERNAME = 'saint2706'

def rating_to_stars(val):
    if val is None:
        return ''
    full = int(val)
    half = '½' if (val - full) >= 0.5 else ''
    return '★' * full + half

def clean_review_text(text):
    if not text:
        return ''
    text = html.unescape(text)
    # Remove letterboxd promotional footer if present
    promo = "Letterboxd is an independent service created by a small team"
    if promo in text:
        text = text.split(promo)[0].strip()
    return text.strip()

def sync():
    print(f"[sync-films] Initiating sync for @{USERNAME} via letterboxdpy...")
    os.makedirs(POSTERS_DIR, exist_ok=True)

    # 1. Fetch all films via letterboxdpy
    print(f"[sync-films] Fetching all user films...")
    uf = UserFilms(USERNAME)
    films_data = uf.get_films()
    movies = films_data.get('movies', {})
    print(f"[sync-films] Found {len(movies)} total films logged.")
    if not movies:
        # A failed or blocked scrape must not wipe the committed diary.
        sys.exit("[sync-films] No films returned; leaving films.json untouched.")

    # 2. Fetch all reviews via letterboxdpy
    print(f"[sync-films] Fetching all user reviews...")
    ur = UserReviews(USERNAME)
    reviews_data = ur.get_reviews()
    reviews = reviews_data.get('reviews', {})
    print(f"[sync-films] Found {len(reviews)} total review logs.")

    # Group reviews by movie slug (prefer newest/highest log_no)
    reviews_by_slug = {}
    for r in reviews.values():
        slug = r['movie']['slug']
        if slug not in reviews_by_slug or r.get('no', 0) > reviews_by_slug[slug].get('no', 0):
            reviews_by_slug[slug] = r

    # 3. Read existing films.json to preserve essays and existing full text
    existing_essays = []
    existing_diary_by_slug = {}
    if os.path.exists(FILMS_JSON_PATH):
        try:
            with open(FILMS_JSON_PATH, encoding='utf-8') as f:
                existing_data = json.load(f)
                existing_essays = existing_data.get('films', [])
                for d in existing_data.get('diary', []):
                    existing_diary_by_slug[d['slug']] = d
        except Exception as e:
            print(f"[sync-films] Note: could not parse existing films.json: {e}")

    # 4. Check posters and download missing
    existing_posters = set(os.listdir(POSTERS_DIR))
    session = requests.Session(impersonate="chrome131")
    headers = {'Referer': f'https://letterboxd.com/{USERNAME}/films/'}

    diary_entries = []

    for slug, m in movies.items():
        title = m['name']
        year = m['year']
        rating = m.get('rating')
        stars = rating_to_stars(rating)
        
        rev_obj = reviews_by_slug.get(slug)
        existing_entry = existing_diary_by_slug.get(slug)

        review_text = ''
        spoilers = False
        rewatch = False
        link = f"https://letterboxd.com/{USERNAME}/film/{slug}/"
        watched_date = None  # unknown without a review; never invent a date

        if rev_obj:
            review_text = clean_review_text(rev_obj['review']['content'])
            spoilers = rev_obj['review'].get('spoiler', False)
            rewatch = rev_obj.get('type') == 'Rewatched'
            link = rev_obj.get('link', link)
            if rev_obj.get('date'):
                watched_date = rev_obj['date'][:10]

        # Fresh scrape wins, so shortened or deleted reviews update too. The existing entry only
        # restores a review the scrape cut off with an ellipsis, and fills fields it could not supply.
        if existing_entry and existing_entry.get('review'):
            old = existing_entry['review']
            stem = review_text.rstrip('.…').rstrip()
            if review_text != stem and stem and old.startswith(stem) and len(old) > len(review_text):
                review_text = old
            if not rev_obj:
                spoilers = existing_entry.get('spoilers', spoilers)
                rewatch = existing_entry.get('rewatch', rewatch)
                watched_date = existing_entry.get('watchedDate', watched_date)
                link = existing_entry.get('link', link)

        # If still truncated with ellipsis, fetch individual review page
        if review_text.endswith('…') or review_text.endswith('...'):
            try:
                print(f"[sync-films] Fetching full text for truncated review: {title} ({slug})...")
                res = session.get(link, headers=headers, timeout=10)
                if res.status_code == 200:
                    sp = BeautifulSoup(res.text, 'html.parser')
                    body_el = sp.select_one('.review .body-text') or sp.select_one('.body-text')
                    if body_el:
                        paragraphs = [p.text.strip() for p in body_el.find_all('p') 
                                      if not p.text.strip().startswith('This review may contain spoilers') 
                                      and not p.text.strip().startswith('Letterboxd is an independent service')]
                        full_content = "\n\n".join(paragraphs).strip()
                        if len(full_content) > len(review_text):
                            review_text = clean_review_text(full_content)
                time.sleep(1)
            except Exception as e:
                print(f"[sync-films] Could not fetch full review for {slug}: {e}")

        # Poster handling
        poster_filename = f"{slug}.jpg"
        # Letterboxd disambiguates remakes with a year suffix ("the-odyssey-2026"); only strip that.
        clean_slug = re.sub(r'-\d{4}$', '', slug)
        
        has_poster = (poster_filename in existing_posters) or (f"{clean_slug}.jpg" in existing_posters)
        actual_poster_filename = poster_filename if poster_filename in existing_posters else f"{clean_slug}.jpg"

        if not has_poster:
            try:
                print(f"[sync-films] Downloading missing poster for '{title}' ({slug})...")
                f_url = f"https://letterboxd.com/film/{slug}/"
                f_res = session.get(f_url, headers=headers, timeout=12)
                if f_res.status_code == 200:
                    soup = BeautifulSoup(f_res.text, 'html.parser')
                    ld = soup.find('script', type='application/ld+json')
                    img_url = None
                    if ld and ld.string:
                        clean_ld = ld.string.strip().replace('/* <![CDATA[ */', '').replace('/* ]]> */', '').strip()
                        ld_data = json.loads(clean_ld)
                        img_url = ld_data.get('image')
                    if not img_url:
                        og_img = soup.find('meta', property='og:image')
                        if og_img and og_img.get('content'):
                            img_url = og_img['content']
                    if img_url:
                        img_res = session.get(img_url, headers=headers, timeout=15)
                        if img_res.status_code == 200:
                            save_path = os.path.join(POSTERS_DIR, poster_filename)
                            with open(save_path, 'wb') as pf:
                                pf.write(img_res.content)
                            existing_posters.add(poster_filename)
                            actual_poster_filename = poster_filename
                            print(f"[sync-films] Saved {poster_filename} ({len(img_res.content)} bytes)")
                time.sleep(1)
            except Exception as e:
                print(f"[sync-films] Warning: Failed downloading poster for {slug}: {e}")

        diary_entries.append({
            "slug": slug,
            "title": title,
            "year": year,
            "rating": rating,
            "ratingStars": stars,
            "rewatch": rewatch,
            "watchedDate": watched_date,
            "review": review_text,
            "spoilers": spoilers,
            "link": link,
            "poster": {
                "src": f"/films/{actual_poster_filename}",
                "width": 600,
                "height": 900
            }
        })

    # 5. Write back to site/content/films.json
    final_output = {
        "lang": "en",
        "films": existing_essays,
        "diary": diary_entries
    }

    with open(FILMS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)

    print(f"\n[sync-films] Success: Synchronized {len(diary_entries)} screenings into {FILMS_JSON_PATH}.")

if __name__ == '__main__':
    sync()
