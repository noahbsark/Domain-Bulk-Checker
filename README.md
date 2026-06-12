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

This release only tweaks the rating system. The workflow and UI stay the same.

The scoring system now includes:

- Explainable quality scores.
- A rating label: Excellent, Strong, Good, Okay, Weak, or Avoid.
- A visible “Why score?” explanation for every row.
- Expandable score details with component breakdown.
- Dynamic batch vocabulary, so repeated niche terms in your pasted list are recognized instead of treated as random unknown text.
- More token-based matching, reducing false positives like `pro` inside `probate` or `app` inside unrelated words.
- Brandable-name tolerance, so short, pronounceable invented names are not buried only because they do not split perfectly into dictionary words.
- Cleaner penalties, so one bad pattern such as a number, hyphen, or weak word does not get over-counted across multiple parts of the formula.
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

robocopy C:\Users\noahb\Downloads\domain_github_pages_app_rating_tweaks . index.html app.js style.css README.md

git add index.html app.js style.css README.md
git commit -m "Tune domain rating algorithm"
git push origin main
```

Then hard-refresh the GitHub Pages site with **Ctrl + F5**.

## Rating-system-only tweak update

This version keeps the app workflow the same and only tunes the scoring logic.

Scoring changes:

- Adds phrase-quality calibration so domains are judged by whether the words form a useful phrase, not just whether they contain a keyword.
- Makes keyword scoring more proportional: a keyword buried inside a long name gets less credit than a clean token/edge match.
- Adds high-intent word recognition for clear use-case terms such as help, guide, tool, app, forms, kit, shop, quote, estimate, calculator, builder, tracker, and manager.
- Adds low-value filler detection for words that often make names feel generic, including solution, pathway, route, portal, central, pro, plus, express, buddy, genius, wizard, 247, best, and top.
- Improves custom positive and negative word handling. Positive words can now give a controlled phrase boost, while negative words affect both penalties and phrase-quality explanation.
- Reduces false-positive scoring from short substrings by continuing to prefer token-aware matches.
- Adds phrase-adjustment details into the existing score notes so the current “Why score?” details explain the extra rating movement.
- Adds stronger top-tier requirements: a domain should not reach strong/excellent just because it has a .com and one keyword; it needs phrase usefulness, intent support, or a strong brandable pattern.


## Rating system tweaks v3

This version only changes scoring logic. It adds phrase-architecture analysis, calibrated top-tier requirements, stronger separation between useful intent words and generic filler words, improved trust-risk penalties, and a small calibration layer that helps clean high-evidence names escape the high-70s without inflating weak names.

The score remains absolute: weak batches can still have few 80+ names. The difference is that the reasons should be clearer and domains should be judged more fairly across niches, including keyword-heavy, local-service, ecommerce, content, and short brandable names.

## Rating logic patch from external review

This version applies the external scoring-logic patch that:

- makes brandable tolerance stricter when target keywords are required
- allows brandable tolerance in Brandable / SaaS keyword-optional mode
- deduplicates overlapping hits such as `24` when `247` is already matched
- deduplicates singular/plural penalty hits
- adds TLD-based caps so strong alternative TLDs can score well but usually not above comparable `.com` names

This is a rating-system-only change. Availability checking and the rest of the workflow are unchanged.


## Rating system v4 calibration

This version only changes the rating/scoring logic. It keeps the existing UI and workflow intact.

Changes:

- Makes 90+ scores harder to earn.
- Adds natural phrase order checks so stacked words like `estateformskit.com` or `probateguidetool.com` do not score as near-perfect.
- Treats soft positioning words like `easy`, `simple`, `guided`, `start`, `my`, and `your` as minor modifiers rather than strong buyer-intent signals.
- Penalizes soft modifiers in awkward positions, such as suffixes like `estatecloseeasy.com` or middle modifiers like `estateeasytool.com`.
- Penalizes stacked utility nouns when a domain describes several things at once, such as form + kit or guide + tool.
- Adds stricter premium-grade caps so `.com + keyword + intent` is not enough by itself to reach the very top.
- Adds extra caution for sensitive/professional terms combined with `tool`, `app`, `ai`, `easy`, or `done`.
- Keeps availability separate from quality score.

The intended result is not score inflation. It should reduce top-score pileups and make `90+` mean rare, clean, natural, premium-grade candidates.
