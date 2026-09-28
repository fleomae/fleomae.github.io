# Fleo Mae: Portfolio

A fast, static portfolio site: plain HTML, CSS and a little JavaScript, with no framework or build step to host it.

```
index.html          ← home page
work/*.html         ← one page per project (7)
assets/css/style.css
assets/js/main.js
assets/img/         ← images (pulled from the portfolio PDF)
build.py            ← edit content here, then regenerate the pages
.nojekyll           ← tells GitHub Pages to serve files as-is
```

## Launch on GitHub Pages (about 5 minutes)

1. Create a new **public** repository on GitHub, e.g. `fleomae.github.io` (using that exact name gives you the URL `https://fleomae.github.io`, but any name works).
2. Upload everything in this folder: on the repo page choose **Add file → Upload files**, drag in the *contents* of this folder (including `.nojekyll`), then **Commit**.
   Or from a terminal:
   ```bash
   git init && git add . && git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. In the repo go to **Settings → Pages**, set **Source: Deploy from a branch**, **Branch: `main` / `(root)`**, and save.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

**Custom domain (optional):** in Settings → Pages, enter your domain (e.g. `fleomae.com`) and follow GitHub's DNS instructions.

## Before you launch: replace the placeholders

Open `build.py` and edit the `SITE` block at the top:

- `email`: currently `hello@fleomae.com` (placeholder)
- `linkedin`, `instagram`, `tiktok`: currently point to the generic homepages
- `cv`: add a PDF to `assets/` and set its path to show a "Download CV" button

Then run:

```bash
python3 build.py
```

This regenerates `index.html` and every page in `work/`. It needs Python 3 and nothing else.

## Editing content

All text lives in `build.py`: the about copy, stats, services, education, certificates, and each project's challenge, strategy, metrics, outcome, lessons and fun fact. To add a project, copy one entry in `PROJECTS`, change it, drop its images into `assets/img/`, and run `python3 build.py`.

Want to change the look? Colors and fonts are CSS variables at the top of `assets/css/style.css` (`--rose`, `--ink`, `--paper`, and so on).

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
