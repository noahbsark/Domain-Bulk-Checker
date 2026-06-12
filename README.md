# No-Key Domain Bulk Checker

Static GitHub Pages web app for checking domain lists and ranking the results without API keys.

## What this version does

- Paste or upload TXT/CSV domain lists
- Normalize URLs into registrable domains
- Check public RDAP first, with DNS-over-HTTPS fallback
- Mark domains as possibly available, taken, unknown, or invalid
- Generate Namecheap lookup links
- Favorite/shortlist domains
- Filter, copy, open, and export results
- Score domain quality separately from availability
- Explain scores with short score badges and expandable details
- Detect phrase quality, typo-looking endings, awkward word forms, and trust/risk words
- Use stricter Excellent/Strong labels so only the clearest names land at the top
- Show diverse top picks by grouping similar variants
- Group similar names so near-duplicates are easier to compare
- Save input, filters, results, and favorites in the browser with localStorage

## Important limitation

This app has no backend and no API key. RDAP/DNS checks are only a filter. Anything marked `possibly_available` should still be confirmed at the registrar before purchase.

## Deploy to GitHub Pages

Upload these files to the repository root:

- `index.html`
- `app.js`
- `style.css`
- `README.md`

Then enable GitHub Pages from **Settings → Pages → Deploy from a branch → main → /(root)**.
