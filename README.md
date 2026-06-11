# No-Key Domain Bulk Checker

Static GitHub Pages app for checking a pasted list of domains/URLs, filtering likely taken names, scoring domain quality, and opening registrar lookup links.

## What it does

- Paste a big list of URLs or domains.
- Normalize them to registrable domains.
- Check availability using public RDAP first, with DNS-over-HTTPS fallback.
- Generate direct Namecheap lookup links.
- Favorite/shortlist domains.
- Remove taken/registered rows.
- Open visible links, available links, favorite links, or top-pick links in bulk.
- Export all results or favorites to CSV.
- Save the current browser session with localStorage.

## Latest upgrade

The scoring system now includes:

- Explainable quality scores.
- A rating label: Excellent, Strong, Good, Okay, Weak, or Avoid.
- A visible “Why score?” explanation for every row.
- Expandable score details with component breakdown.
- Collapsible Advanced scoring controls.
- Optional scoring styles:
  - General
  - Trust-heavy
  - Brandable / SaaS
  - Local service
  - Ecommerce / product
  - Course / content
- Custom positive words and negative words.
- Top-picks workflow:
  - Show top picks
  - Copy top picks
  - Open top picks

## Important limitation

This app has no backend and no registrar API key. It cannot guarantee a domain is purchasable or show live registrar pricing. Treat `possibly_available` as a filter and always confirm at the registrar before buying.

## Deploy to GitHub Pages

Upload these files to the root of your GitHub repo:

- `index.html`
- `app.js`
- `style.css`
- `README.md`

Then enable Pages from your repo settings:

**Settings → Pages → Deploy from a branch → main → / root**

## Push update from Windows Command Prompt

```bat
cd C:\Users\noahb\Downloads\Domain-Bulk-Checker-live

robocopy C:\Users\noahb\Downloads\domain_github_pages_app_scoring_explanations . index.html app.js style.css README.md

git add index.html app.js style.css README.md
git commit -m "Add explainable domain scoring"
git push origin main
```

Then hard-refresh the GitHub Pages site with **Ctrl + F5**.
