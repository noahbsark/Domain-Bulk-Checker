# Domain Bulk Checker — performance v10

Static GitHub Pages app for checking domain availability and scoring domains.

## Performance-focused changes

This version keeps the scoring logic from v9, but makes large result batches smoother in the browser:

- Renders only the first 250 filtered rows by default.
- Adds **Show more rows** and **Show all rows** controls.
- Keeps copy/export/open actions working on the full filtered result set, not just the rendered rows.
- Throttles result-table redraws while checks are running so the browser is not rebuilding hundreds/thousands of rows after every single domain.
- Adds cache busting in `index.html` so GitHub Pages is less likely to serve an older `app.js`.

## Notes

If a batch has thousands of rows, keep the table rendered to the first few hundred while reviewing/filtering. Export CSV, copy visible domains, open visible links, and top-pick actions still operate on the full underlying results.
