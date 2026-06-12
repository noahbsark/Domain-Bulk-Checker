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
- Score domain pattern quality, such as keyword + purpose word, modifier + keyword + purpose word, weak suffixes, and crowded patterns
- Score memorability using length, word count, word boundaries, typing friction, and letter balance
- Optionally calibrate scoring from examples of domains you like and dislike, fully local in the browser
- Quickly add liked/disliked examples from each row with 👍 / 👎 buttons
- Audit the score distribution so you can see whether ratings are too generous or too strict
- Show available-domain batch rank and percentile, such as `Top 4%`
- Use stricter Excellent/Strong labels so only the clearest names land at the top
- Show diverse top picks by grouping similar variants
- Group similar names so near-duplicates are easier to compare
- Save input, filters, results, and favorites in the browser with localStorage

## Important limitation

This app has no backend and no API key. RDAP/DNS checks and preference calibration run in the browser. RDAP/DNS checks are only a filter. Anything marked `possibly_available` should still be confirmed at the registrar before purchase.

## Deploy to GitHub Pages

Upload these files to the repository root:

- `index.html`
- `app.js`
- `style.css`
- `README.md`

Then enable GitHub Pages from **Settings → Pages → Deploy from a branch → main → /(root)**.

## Scoring v9 update

This build keeps the v8 selectivity changes and adds score-audit/calibration tools:

- Elite-score gates so 95+ is reserved for compact, natural, high-intent names
- Phrase-quality caps so awkward or merely okay names cannot score like excellent names
- Stacked-word penalties for domains that pile up good words but feel crowded, such as `keywordhelpguide.com`
- Similar-group caps so only the best variant in a cluster can stay at the very top
- Better handling for action/verb names like `simplifyexample.com` or `settleanestate.com`
- CSV export fields for `cluster_rank` and `cluster_cap`
- Rating audit dashboard with score distribution, median score, top score, 95+ count, and 90+ count
- Batch rank / percentile labels among available domains
- CSV export fields for `batch_rank`, `batch_percentile`, `batch_rank_label`, and `batch_percentile_label`
- One-click 👍 / 👎 calibration buttons that update the liked/disliked example lists and rescore locally

The score is still a decision aid, not a guarantee. Use it to prioritize names, then manually confirm purchase price, legal risk, and brand fit.
