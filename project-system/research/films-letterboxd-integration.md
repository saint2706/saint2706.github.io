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
  - **Tier 1 (Featured Essays)**: 3 long-form dispatches (_Pather Panchali_, _Across the Spider-Verse_, _Barbie_), keeping lowercase text and unfinished punchlines verbatim.
  - **Tier 2 (Cinema Diary)**: Letterboxd diary entries with ratings (★), dates, and micro-reviews.
