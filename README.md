# Domain Shortlist — Scoring v13

Static GitHub Pages domain shortlist tool.

## v13 scoring upgrade

This release focuses only on scoring quality/calibration while keeping the public usability workflow intact.

Changes:

- `v13-general-quality-calibration-2026-06-14` scoring version.
- Profile-aware TLD scoring:
  - `.ai`, `.io`, `.app`, `.dev` score better in Brandable/SaaS mode.
  - `.shop` / `.store` score better in Ecommerce mode.
  - `.org` scores better in Trust-heavy / content contexts.
- Token-confidence scoring:
  - Uses recognized tokens, coverage, curated vocabulary, target keywords, and custom positive words.
  - Reduces false boosts from dynamic vocabulary fragments.
  - Adds `token_confidence` to CSV export.
- Dynamic vocabulary cleanup:
  - Learns repeated niche terms more carefully.
  - Avoids common fragments like `tion`, `able`, `ator`, `ing`, etc.
  - Requires stronger evidence for short learned terms.
- Contextual number handling:
  - Meaningful numbers like `1099`, `401k`, `529`, `360`, `365`, `3d`, `b2b`, and `b2c` are penalized less when paired with relevant context.
  - Random numbers and `247`-style names are still treated cautiously.
- Calibration refinements:
  - Good names need both clean phrase shape and high token confidence for top scores.
  - Low token-confidence names are capped/penalized more consistently.

## Limitations

This app is still a browser-only filter. Availability and quality scores are estimates. Always confirm domain availability and price at a registrar before buying.
