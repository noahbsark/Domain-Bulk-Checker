# No-Key Domain Bulk Checker Web App

A static, browser-based domain checker that can be hosted on GitHub Pages.

## What it does

- Paste many URLs/domains at once.
- Normalizes URLs to root domains.
- Generates direct Namecheap lookup links.
- Tries public RDAP checks first.
- Falls back to Google DNS-over-HTTPS when RDAP is blocked by browser/CORS.
- Shows clickable Namecheap links in the table.
- Removes taken/registered rows.
- Opens all remaining Namecheap links in browser tabs.
- Exports CSV.
- Copies available domains to clipboard.

## Important limitation

This is a no-key static web app. It has no backend. Public RDAP endpoints may block browser requests with CORS, and DNS checks are not the same as registrar purchase availability.

Treat results as a fast filter only. Always confirm on Namecheap before buying.

## GitHub Pages setup

1. Create a new GitHub repo.
2. Upload these files to the repo root:
   - `index.html`
   - `app.js`
   - `style.css`
   - `README.md`
3. Commit the files.
4. Go to the repo's **Settings → Pages**.
5. Use **Deploy from a branch**, select your branch, and choose `/ (root)` as the folder.
6. Open the published Pages URL after GitHub finishes deploying.

GitHub Pages can publish from a branch and use either the repository root or `/docs` folder as the publishing source.

## Local preview

You can open `index.html` directly in a browser, but for best behavior run a tiny local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files

- `index.html` — page markup
- `style.css` — styling
- `app.js` — all checking logic
