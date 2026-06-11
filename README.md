# No-Key Domain Bulk Checker Web App

A static, browser-based domain checker that can be hosted on GitHub Pages.

## What it does

- Paste many URLs/domains at once.
- Normalizes URLs to registrable domains.
- Generates direct Namecheap lookup links.
- Tries public RDAP checks first.
- Falls back to Google DNS-over-HTTPS when RDAP is blocked by browser/CORS.
- Shows clickable Namecheap links in the table.
- Removes taken/registered rows.
- Opens all visible, available, or favorite Namecheap links in browser tabs.
- Adds favorites/shortlist stars.
- Scores domain quality based on TLD, length, hyphens, numbers, readability, intent words, and your target keywords. Availability is shown separately and no longer inflates the quality score.
- Filters by status, TLD, search text, max length, hyphens, and numbers.
- Sorts by available + best quality, shortest domain, status, domain name, or favorites first.
- Saves your input, filters, results, and favorites in browser localStorage.
- Exports all results or favorites to CSV.
- Copies available, favorite, visible domains, or visible Namecheap links to clipboard.

## Important limitation

This is a no-key static web app. It has no backend. Public RDAP endpoints may block browser requests with CORS, and DNS checks are not the same as registrar purchase availability.

Treat results as a fast filter only. Always confirm on Namecheap before buying.

## Suggested workflow

1. Paste domains or URLs.
2. Add target keywords like `probate, estate, will`.
3. Click **Check pasted links**.
4. Click **Remove taken / registered URLs** or filter to **Possibly available**.
5. Star the domains you like.
6. Click **Open favorites** or **Export favorites**.

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
- `app.js` — all checking, scoring, filtering, and export logic

## Quality scoring update

The quality score intentionally does **not** include availability. This prevents every available `.com` keyword domain from tying at 100. The default sort still shows possibly available domains first, then ranks them by quality score.

## Better scoring model

The scoring model now uses bounded components instead of one large bonus for `.com` + keyword:

- TLD strength: up to 15 points
- Length: up to 20 points
- Target keyword fit: up to 25 points
- Buyer/search intent words: up to 15 points
- Clarity/readability: up to 15 points
- Brand/trust basics: up to 10 points
- Penalties and caps for hyphens, numbers, filler terms, hard-to-parse names, and overly long names

Examples of things it now handles better:

- `probatehelp.com` can score very high because it is short, clear, and high-intent.
- `diyprobatesolution.com` scores lower because it is longer and uses a weaker filler word.
- `probate247.com` scores lower because numbers hurt trust and memorability.
- Taken domains can still have high quality scores; availability is shown separately.
