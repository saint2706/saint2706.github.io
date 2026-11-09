# Research: Films Room (`/personal/films/`) & Letterboxd Direct Integration

**Date**: 2026-11-08  
**Branch**: `phase/ui-upgrade-personal`  
**Topic**: Letterboxd Direct Sync, `mkdir.directory` Visual Curation, & Local CSP Asset Ingestion

---

## 1. Letterboxd Live Account & Feed Audit

- **Profile**: `https://letterboxd.com/saint2706/`
- **RSS Feed**: `https://letterboxd.com/saint2706/rss/`
- **Status**: Verified `200 OK`, live public XML feed.
- **Data Elements Available**:
  - `<title>`: E.g., `The Odyssey, 2026 - ★★`, `12 Angry Men, 1957 - ★★★★★`
  - `<link>`: Canonical Letterboxd review URL (`https://letterboxd.com/saint2706/film/...`)
  - `<letterboxd:filmTitle>`: Exact movie name
  - `<letterboxd:filmYear>`: Release year
  - `<letterboxd:memberRating>`: Floating point rating (e.g. `5.0`, `2.5`, `3.5`)
  - `<letterboxd:watchedDate>`: Date watched (`YYYY-MM-DD`)
  - `<letterboxd:rewatch>`: `Yes` | `No`
  - `<description>`: Contains CDATA with poster image (`<img src="https://a.ltrbxd.com/..."/>`) and review body text.

### Voice & Micro-Review Tone Sample

The diary exhibits sharp, dry, irreverent personal commentary:

- _The Odyssey (2026)_: "nip over to troy, bit of rough and tumble, big horse, bish bash bosh, back home to ithaca. simple as"
- _Chandni Chowk to China (2009)_: "goated training montage soundtrack"
- _The Dark Knight (2008)_: "Cringe"
- _12 Angry Men (1957)_: "Peak"
- _Nope (2022)_: "Clouds are CANCELLED. never wanna see one again after this thabks"
- _The Wizard of Oz (1939)_: "a kansas horsegirl unlearns her homophobia with the help of 3 gay cosplayers as she goes on a killing spree to stop a bitch from stealing her dog"

---

## 2. Design Inspiration via `mkdir.directory`

`mkdir.directory` is a curated meta-index of web design inspiration galleries. Relevant directories and design patterns for the Films room:

1. **Minimal Gallery (`minimal.gallery`)**:
   - Focus: High-density editorial media grids, refined typographic hierarchies, understated tag pills.
   - Application: Film index with clean metadata locks (year, director, rating) without visual clutter.

2. **Dark Mode Design (`darkmodedesign.com`)**:
   - Focus: Deep jewel-tone palettes, luminous gold/amber accents, and soft tactile drop shadows on dark backgrounds (`#120816`).
   - Application: The cinema projection mood—dark screening room with luminous warm accents.

3. **Brutal Web (`brutalweb.com`) & A1 Gallery (`a1.gallery`)**:
   - Focus: Monospaced cataloguing, raw archival timestamps, stark rule lines.
   - Application: Letterboxd screening ledger / diary entries.

4. **Codrops Creative Hub (`tympanus.net/codrops/hub/`)**:
   - Focus: Kinetic film strip sprockets, projection beam light overlays, interactive SVG motion.
   - Application: Bespoke cinema header glyph replacing the flat `.mark` block.

---

## 3. Architecture & CSP Compliance

- **Constraint**: Repository automated tests (`node --test site/scripts/*.test.mjs`) strictly forbid external image hosts (e.g. `a.ltrbxd.com`).
- **Pipeline**:
  1. Build script `site/scripts/sync-films.mjs` fetches `https://letterboxd.com/saint2706/rss/`.
  2. Parses XML items, extracts metadata and poster URLs.
  3. Downloads each poster image locally to `site/public/films/<slug>.webp` (with fallback to `.jpg`).
  4. Writes sanitized, structured data to `site/content/films.json`.
- **Content Partitioning**:
  - **Screening Diary (Flagship View)**: Maximum 2 films per row with compact 120px posters, ample reading width, ratings (★), dates, micro-reviews, spoiler concealment, interactive multi-dimensional sorting (by date, rating, release year, title), and live keyword search.
  - **The Kinematograph Glyph**: 35mm endless film loop featuring 6 curated peak screenings (12 Angry Men, Pyaasa, Shawshank Redemption, Spider-Verse, Barbie, Past Lives) with tactile brass transport buttons (◀ PREV and NEXT ▶), mouse wheel/trackpad scrolling, click-to-advance, and infinite wrap-around.

---

## 4. Completed Implementation & Verification

- **Sync Pipeline**: `site/scripts/sync-films.mjs` and `site/scripts/sync-films.py` (powered by `letterboxdpy` and `curl_cffi`) scrape and synchronize all 91 films across the entire Letterboxd profile, bypassing the 50-item RSS ceiling, downloading local `.jpg` posters into `site/public/films/` (100% self-hosted CSP compliance).
- **Content Model**: `site/src/lib/content.ts` updated with `FilmDiaryEntrySchema` and validated `site/content/films.json` for all 91 screenings (70 written reviews, 21 rating-only entries, 18 five-star peaks, 35 standouts, 20 rewatches).
- **Header Glyph**: `site/src/components/personal/FilmGlyph.astro` built with 35mm celluloid film strip, rotating brass sprockets, volumetric projection cone, optical scrim gradient, real poster artwork, tactile ◀ PREV / NEXT ▶ brass transport buttons, mouse wheel support, and seamless infinite looping.
- **Films Room Redesign**: `site/src/pages/personal/films/index.astro` rebuilt with archival cinema ledger bar (visitor-focused metrics: Screenings, Peaks, Standouts, Rewatches; zero technical sync noise), 2-card max row grid, generous reading space, category filter pills, keyword search, and 7-mode sorting (recently logged default, rating desc/asc, release year desc/asc, title A-Z/Z-A).
- **Verification**:
  - `pnpm -F site check`: 0 errors, 0 warnings across all files.
  - `node --test site/scripts/*.test.mjs`: 12/12 tests pass (including zero-external-host CSP test and poster existence assertions).
  - `pnpm format:check`: 100% Prettier compliant.
  - `pnpm -F site build`: Static build + Pagefind search index generated cleanly.
