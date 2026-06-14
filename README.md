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
