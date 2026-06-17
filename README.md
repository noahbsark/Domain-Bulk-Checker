# Domain Shortlist — v72: Results Sort + Taken Collapse


## v72 keyboard and summary polish

- Adds keyboard shortcuts for All Results: `/` opens/focuses result search and `Esc` clears active filters.
- Updates the sticky post-results bar into a compact result summary with New search.
- Adds Advanced-only Copy visible results with status, score, and reason.
- Keeps the public workflow simple: Top Picks first, All Results visible, advanced tools hidden until needed.


- Adds a simple inline **Quick details** expansion inside each All Results row.
- Adds a small explanation for **Taken** results so the label is easier to understand.
- Adds Advanced Mode **Save all worth-checking** for quickly saving every strong candidate.
- Keeps the default public view simple while moving bulk actions into Advanced Mode.

## v69 results view polish

- Adds a simple **Comfortable view / Compact view** toggle for All Results.
- Makes taken domains visually quieter so worth-checking domains stand out.
- Shows quick **Saved** / **Removed** feedback directly on All Results rows after using the star.
- Keeps the default public view simple while leaving deeper controls in Advanced Mode.

## v68 filter polish

- Adds **Edit filters** above All Results so filter chips stay hidden until needed.
- Uses a roomier two-column Top Picks layout on desktop to reduce awkward wrapping for long domains.
- Adds a clear empty filter recovery state: **No results match this filter. Show all results?**
- Keeps All Results visible after checking while reducing visual clutter around filters.
- Keeps deeper filters, tables, exports, and archive tools in Advanced Mode.

## v66 clean results view

- Cleans up the post-check screen so users see fewer repeated panels after a run.
- Compresses the hero and input area after results exist.
- Shows **All Results** automatically after checking, not only behind a hidden button.
- Uses clean result cards for the full list by default; the large table stays available in Advanced Mode.
- Simplifies Top Picks cards and keeps extra actions/details out of the default public view.

A static GitHub Pages app for cleaning, scoring, shortlisting, comparing, and price-checking domain ideas.

## v60 updates

- Added an Advanced Mode **Local archives** manager.
- Added **Restore**, **Download JSON**, and **Delete** for each archive.
- Added **Clear all archives** and **Download current JSON**.
- Kept the public interface simple: archive tools stay in Advanced Mode.

## Recent updates

- v72: Add All Results keyboard shortcuts, a sticky mini summary, and Advanced-only Copy visible results.
- v70: Add inline All Results details, a Taken explanation, and Advanced-only Save all worth-checking.
- v69: Add All Results compact/comfortable view, quieter taken rows, and inline saved feedback.
- v68: Hide All Results filters until needed, use roomier Top Pick cards, and add a clear empty-filter recovery action.
- v67: Compact post-check view with visible All Results and fewer repeated controls.
- v66: Cleaner post-check results view and automatic All Results.
- v60: Restore archives, delete archives, and download archive JSON.
- v57: Done flow, Start a new search, and Archive session.
- v56: Winner ready, Copy winner report, and Clear completed checked.
- v51: Clear checked marks, open unchecked links, and Advanced-only Checked saved filter.
- v50: Checked count, Show unchecked only, and Copy unchecked links.
- v49: Mark as checked and Copy price-check links.
- v48: Check best choice, Copy saved with links, and Download clean report.
- v47: Copy clean report, saved count, and Back to Top Picks.
- v46: Consistent Saved wording and Copy best choice.
- v45: View saved only, Copy best with reasons, and Clear notes.
- v44: Hide weak picks, Copy clean input, and saved finalist notes.
- v42: Simpler Top Picks with Show more and Why? details.
- v37: Public launch mode and owner-only preflight.

## Files included

- `index.html`
- `app.js`
- `style.css`
- `README.md`
- `LAUNCH_INPUTS_NEEDED.md`
- `launch-checklist.html`
- `privacy.html`
- `affiliate-disclosure.html`
- `terms.html`
- `favicon.svg`
- `og-image.png`
- `og-image.svg`
- `site.webmanifest`
- `robots.txt`
- `sitemap.xml`
- `CUSTOM_DOMAIN_SETUP.md`
- `AFFILIATE_SETUP.md`
- `ANALYTICS_SETUP.md`
- `CNAME.example`
- `.gitignore`

## Owner mode

Open the app with:

```text
?owner=1
```

Owner mode shows launch checks, final replacement reminders, and setup-only tools that stay hidden from public visitors.

## Public launch mode

The public mode is controlled in `app.js`:

```js
const PUBLIC_LAUNCH_MODE = true;
```

When enabled, public visitors do not see owner/debug/setup panels. Owner tools still appear when the URL includes `?owner=1`.

## Deployment

Copy the v60 files into your GitHub Pages repository, then commit and push.

```bat
cd C:\Users\noahb\Downloads\Domain-Bulk-Checker-live

git pull origin main

robocopy C:\Users\noahb\Downloads\archive_manager_v60 . index.html app.js style.css README.md LAUNCH_INPUTS_NEEDED.md launch-checklist.html AFFILIATE_SETUP.md ANALYTICS_SETUP.md privacy.html affiliate-disclosure.html terms.html favicon.svg og-image.png og-image.svg site.webmanifest robots.txt sitemap.xml CUSTOM_DOMAIN_SETUP.md CNAME.example .gitignore

git add index.html app.js style.css README.md LAUNCH_INPUTS_NEEDED.md launch-checklist.html AFFILIATE_SETUP.md ANALYTICS_SETUP.md privacy.html affiliate-disclosure.html terms.html favicon.svg og-image.png og-image.svg site.webmanifest robots.txt sitemap.xml CUSTOM_DOMAIN_SETUP.md CNAME.example .gitignore
git commit -m "Add archive manager v60"
git push origin main
```

Then hard refresh:

```text
Ctrl + F5
```

## Important limitation

This app can help shortlist and open registrar checks. It does not reserve domains, complete purchases, or guarantee live availability or price.


## v54 update

- Added a small Finish checking helper for unchecked saved finalists.
- Added an All checked completion message when saved finalists are finished.
- Added Pick winner on saved finalists; the winner appears first in reports.


## v55 update

- Added **Open winner** for the picked winner or best saved finalist.
- Added **Copy winner with link** for quick sharing.
- Added a tiny winner checked hint: **Winner checked** or **Winner not checked yet**.
- Kept saved domains, notes, checked status, and winner controls in the same simple Saved finalists area.


## v56 update

- Added **Winner ready** once the winner has been marked checked.
- Added **Copy winner report** with winner, note, link, checked status, and next step.
- Added Advanced-only **Clear completed checked** to keep the winner and remove checked non-winners.


## v57 update

- Added a simple **Done** action when the picked winner is checked.
- Added **Start a new search** after Done, using the existing safe Start over flow and undo behavior.
- Added Advanced Mode **Archive session** to save the current session snapshot locally in the browser.
- Kept the public workflow simple: new controls only appear when relevant or in Advanced Mode.

## v60 update

- Added Advanced Mode **Local archives** manager.
- Added **Restore**, **Download JSON**, and **Delete** for saved archives.
- Added **Clear all archives** and **Download current JSON**.
- Kept archive tools out of the public default workflow.


## v60: Archive Preview

- Added a restore preview before an archive replaces the current session.
- Added Advanced Mode archive search.
- Added archive duplication so older saved sessions can be copied before restoring or editing.
- Public flow remains unchanged.


## v62: Archive Session Summary

- Added clearer import preview wording before an imported archive replaces the current session.
- Archive labels now automatically prefer the picked winner, then the best saved finalist, then the first top pick.
- Added an Advanced Mode current-session summary near Archive session.
- Kept all archive-management controls in Advanced Mode so the public app stays simple.


## v62 update

- Added Advanced Mode archive pinning so important local archives stay at the top.
- Added short archive notes that are included in archive search.
- Added safer import behavior: before importing JSON, the app can archive the current session first.


## v63 update

- Added a tiny pinned/archive count inside Advanced Mode.
- Added **Download all archives** to export every local archive as one JSON file.
- Added **Import as new archive** so a downloaded archive can be saved without replacing the current session.
- Kept the public workflow unchanged and simple.


## v64 update

- Added Advanced Mode archive health check.
- Added archive label repair for blank or generic archive names.
- Added archive limit setting: keep 5, 10, or 25 local archives.
- Public workflow remains unchanged.


## v72 update

- Added public All Results sort pills: Best, A–Z, and Shortest.
- Added a public Copy worth-checking button.
- Collapsed taken names in the default simple All Results view with a clear Show taken names button.
- Kept advanced sorting, exports, and bulk tools in Advanced Mode.
