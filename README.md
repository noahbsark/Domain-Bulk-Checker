# Domain Shortlist

A static GitHub Pages app for bulk domain triage.

## What it does

- Paste domains, URLs, or upload TXT/CSV files
- Normalize URLs to registrable domains
- Check public RDAP first and DNS fallback second
- Rank domain quality with explainable scores
- Show batch rank / top picks
- Favorite shortlisted names
- Export all results, favorites, or top picks
- Open registrar lookup links in bulk
- Render large batches in chunks for better performance

## Public beta notes

This app is a browser-only static site. It has no backend server, no database, and no registrar API key.

Availability is an estimate from public RDAP/DNS checks. A domain marked `possibly_available` still needs to be confirmed at a registrar before purchase. Pricing is not live in this app.

## Privacy

Pasted lists and saved sessions stay in the browser's local storage. Availability checks may contact public RDAP/DNS services, and registrar links open external websites.

## Scoring

The quality score is a heuristic ranking based on TLD, length, target keyword fit, clarity, brandability, buyer intent, word order, comparison-phrase quality, and penalties. It is not a market valuation or trademark check.

Current scoring model: `v9-word-order-category-calibration-2026-06-13`.
Public polish/performance version: `public-beta-v11-polish-performance-2026-06-13`.


## v16 public-buyer scoring calibration

This release tunes the scoring for a general public domain-buying workflow: paste many domain ideas, shortlist the most human-readable options, then check final price at a registrar.

Key scoring changes:

- Public buyer is now the default scoring style.
- Harder caps for ambiguous abbreviations such as `prdecision.com` unless the abbreviation was supplied as a target keyword.
- Lower scores for abstract SaaS words such as `grid`, `signal`, `logic`, `base`, `stack`, `pilot`, `platform`, and `crm` outside Brandable/SaaS mode.
- Stronger recognition for long but clear utility/search phrases such as `estateinventorychecklist.com`, `personalrepresentativekit.com`, and `probatewithoutlawyer.com`.
- More profile-aware TLD caps so non-.com alternatives do not flood the very top of public recommendations.
- Top picks are now de-duplicated by base name so one phrase does not appear repeatedly across `.co`, `.io`, `.app`, `.org`, `.net`, and `.legal`.
- Export CSV now includes public-buyer audit columns: recommendation type, phrase naturalness, buyer intent, SEO utility, risk flags, abbreviation penalty, word-order penalty, abstract SaaS penalty, legal-sensitive flag, top-pick group, and TLD cap.
