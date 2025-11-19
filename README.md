# Rishabh Agrawal — Personal Site

This repository contains the source code for [saint2706.github.io](https://saint2706.github.io), the GitHub Pages site that highlights my analytics journey, portfolio projects, and writing. The site is built with Jekyll on top of the Minimal Mistakes/Academic Pages theme and is designed to be simple to maintain directly from Markdown and JSON files in this repo.

## Local development

1. Install Ruby (>= 3.0), Bundler, and Node.js on your machine.
1. Install Ruby gems and JavaScript dependencies:
   ```bash
   bundle install
   npm install
   ```
1. Start a local preview server:
   ```bash
   bundle exec jekyll serve --livereload
   ```
   The site will be available at <http://localhost:4000>. Restart the command if you change `_config.yml`.

## Syncing external blog posts

My Dev.to, Medium, and Substack articles are cached in `_data/external_posts.json`. Refresh the cache whenever a new article is published:

```bash
npm run sync:external-posts
```

The script respects the `HTTPS_PROXY` environment variable if you need to run it behind a proxy.

## Publishing workflow

Pushing to the default branch triggers GitHub Pages to rebuild and deploy the latest version of the site automatically. Open an issue titled **"Fetch blogs"** to let the automation workflow sync external articles in CI.

## Adding new content

- Edit `_pages/about.md` for the homepage biography.
- Update `_pages/cv.md` and `_data/cv.json` to keep résumé content aligned across formats.
- Add Markdown files inside `_portfolio/` to feature new projects.
- Create Markdown posts in `_posts/` whenever you want to publish directly on the site.

Everything else in the repository supports these sections, so the structure stays focused on what appears on the live site.
