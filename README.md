# Domain Bulk Checker — Scoring v8

Static GitHub Pages app for checking pasted domains/URLs and ranking the remaining names.

## v8 scoring changes

This release is a focused scoring-algorithm upgrade for comparison/decision domains. It does not redesign the app workflow.

### Added / changed

- Scoring version: `v8-comparison-decision-2026-06-13`
- Cache-busted script tag: `app.js?v=8-comparison-decision`
- Added comparison phrase detection for names like:
  - `rentorbuyapp.com`
  - `buyvsrentcalculator.com`
  - `rentbuyguide.com`
  - `waitorownapp.com`
- Added comparison option-pair quality:
  - strong: `rent + buy`, `buy + rent`, `rent + own`, `buy + wait`, `lease + buy`
  - medium: `rent + mortgage`, `own + rent`, `buy + own`
  - weak: `wait + own`, `own + wait`, awkward mortgage/lease pairings
- Reduced generic `app/tool` over-scoring outside Brandable/SaaS mode.
- Boosted clearer decision-tool words:
  - `calculator`
  - `compare`
  - `comparison`
  - `estimate`
  - `planner`
  - `guide`
  - `worksheet`
  - `checklist`
  - `decision`
  - `breakeven`
- Penalized smashed comparison pairs like `rentbuyapp.com` relative to clearer `rentorbuy...` / `buyvsrent...` forms.
- Penalized awkward option ordering like `waitorown...` and `ownorwait...`.
- Kept batch-rank and richer CSV audit export columns from the previous scoring versions.

## Notes

The quality score remains an opinionated heuristic. It does not measure domain resale value, search volume, trademark risk, or exact purchase availability.

Use the score as a sorting/filtering tool, then manually review the top names before buying.
