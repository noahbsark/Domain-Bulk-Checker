# Domain Shortlist — v94 Results Focus Fix

## v94 screenshot fixes

- Fixes the stale cache/body-class issue so the newest layout CSS actually applies.
- Fully hides the accessibility skip link until keyboard focus so no clipped text appears in the top-left corner.
- Keeps **All Results** collapsed after checking; the public flow now centers on Best Picks first.
- Makes the #1 Best Pick a wider hero card and places backup picks below it so domain names wrap less awkwardly.
- Removes the duplicate preview-panel check button in normal mode, leaving one obvious **Check my list** action.
- Reduces the launch textarea height and duplicate guidance once clean input is ready.

Run locally:

```bash
node --check app.js
node scripts/smoke-test.mjs
python3 -m http.server 4173
```

Then open `http://localhost:4173/`, try the sample list, check names, review Best Picks, open View all results, and verify registrar links open without buying anything.



## v92 screenshot fixes

- Reduces the oversized launch hero so it behaves better on Windows display scaling and browser zoom changes.
- Hides the skip link fully until keyboard focus so clipped text no longer appears in the top-left corner.
- Restores the Important Notes content that was hidden by an older CSS rule.
- Fixes All Checked Names card layout so registrar buttons, details, and notes no longer overlap.
- Shortens the primary registrar CTA to “Check at Namecheap” to avoid awkward wrapping.

## v91 screenshot-driven polish

- Widens the desktop layout so the app does not feel cramped when users zoom out or use Windows display scaling.
- Fixes the offscreen skip link and the lower-page privacy/notes panel so neither appears as clipped or floating text.
- Makes Best Picks the primary output and All Checked Names the secondary review area.
- Changes registrar CTAs from pushy “Check price now” copy to honest availability/registrar checks.
- Adds visible registrar/affiliate disclosure close to result CTAs while keeping affiliate mode off by default.
- Adds `scripts/smoke-test.mjs` for static launch checks: duplicate IDs, missing DOM IDs, rel attributes, disclosure placement, privacy panel positioning, analytics sanitizer presence, and sitemap/robots consistency.

Run locally:

```bash
node --check app.js
node scripts/smoke-test.mjs
python3 -m http.server 4173
```

Then open `http://localhost:4173/`, load the sample list, check names, save finalists, and verify registrar links open without buying anything.


# Domain Shortlist — v84 Tool-First Final Layout

## v80 no-mistake simple layout

- Reduces visible buttons in the normal public view so there is one obvious next step.
- Keeps Top Picks focused on checking the best choice, checking the top 3, viewing all results, or starting over.
- Hides copy/export/power-user Top Picks actions unless Advanced Mode is on.
- Adds clearer short help: Save only stars names, Copy only copies text, filters only hide rows, and price checks open registrar tabs.
- Makes All Results calmer with a bigger primary save action, clearer optional controls, and a safer **Reset view** recovery button.

# Domain Shortlist — v70: Inline Results Details

## v70 inline results details

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


## v73 update — visible worth-checking reasons

- The public copy button now copies only the visible worth-checking results, so active filters are respected.
- Collapsed taken names now include helper text explaining that nothing was deleted.
- Worth-checking rows show a small one-line reason directly in All Results.


## v76 update — result cleanup actions

- Added public **Save visible worth-checking** for the filtered All Results view.
- Made row badges clickable so users can filter by `.com`, `Short`, `Saved`, `Strong`, `Taken`, or `Needs review`.
- Added a small **Results cleaned up** notice whenever taken names, weak names, or a badge filter is hiding rows, with **Show everything** to restore the full list.
- Kept Advanced Mode tools hidden from the normal public flow.

## v74 update — scan badges and copy-with-reasons

- Added **Copy visible with reasons** so visible worth-checking names can be copied with their short why line.
- Added a public **Hide weak names** toggle in All Results, while keeping advanced filters hidden until needed.
- Added quick result badges such as `.com`, `Short`, `Saved`, `Strong`, `Taken`, and `Needs review` for faster scanning.


## v76 update

- Added Undo save for the last bulk save from All Results.
- Added a compact badge legend so users know row badges are clickable filters.
- Improved the cleaned-up notice when Saved-only filters are active.


## v80 Simple-First Polish

This pass focuses on making the public app hard to misuse:

- fewer visible public controls
- one obvious Top Picks next step
- simpler All Results labels
- safer help copy near actions
- Advanced-only controls remain hidden unless needed
- saved finalist actions are simplified in the normal view

The app still does not buy domains, change DNS, or delete the checked list automatically. Registrar tabs are opened only when the user chooses to check price.


## v83 UI Audit

This version removes the stacked trust/help panels above the tool. Users now see a compact header and then the paste box almost immediately. Registrar settings and extra explanations stay hidden until they are useful or Advanced Mode is enabled.


## v83 UI audit pass

This version focuses on design quality and ease of use rather than adding more features.

What changed:
- Fixed the tool-first styling so the page no longer shows stacked helper panels above the tool.
- Made the hero shorter and cleaner.
- Put the paste box immediately after the header.
- Hid empty Top Picks, Full List, Saved Names, and recent-run panels until they are useful.
- Kept Advanced Mode reachable while hiding registrar and power-user settings from the normal flow.
- Reduced public controls to the main actions: paste, check, start with best pick, save names, and search the list.
- Hid the technical table in the public UI; result cards are the default view.


## v84 Tool-First Final Layout

This version is a visual/usability cleanup. It puts the paste box immediately after a compact header, hides empty zero-states, hides registrar/settings clutter until Advanced Mode, renames the full list to “All checked names,” and keeps one obvious next action visible at each step.


## v86 decision mode updates

- Uses a single-card decision flow so users start with #1 instead of scanning a grid.
- Gives the top card explicit actions: Check price, Save finalist, Why this name, and Show another pick.
- Improves the paste box visual treatment and keeps help short and close to the action.
- Adds a tiny three-step result checklist after checking.


## v87 premium decision + finish updates

- Makes the #1 recommendation feel more like a premium decision card.
- Keeps only the most useful public actions visible on Top Picks.
- Moves copy/compare/export-style actions behind Advanced Mode.
- Adds a saved-finalists finish summary so users know what to do next.
- Uses clearer “done for now” language after a winner is checked.


## v90 Ultra Simple Decision UI
- Mobile-first final polish: tighter header, paste box above the fold, and hidden workflow pills on small screens.
- Added a simple saved-finalists ready card with Check saved prices and Start new search.
- Public #1 pick card is quieter: Check price + Save finalist are the main actions; deeper details stay tucked away.


## v90 Ultra Simple Decision UI

- First screen is now textarea-first: paste box, Check my list, upload/sample, then optional extras.
- Target keywords are hidden under Improve ranking until needed.
- Empty preview stats stay hidden until text is entered.
- #1 recommendation card has stronger visual emphasis and simpler actions.
- Public flow remains: paste names, check list, check price, save finalist.


## V90 update — Final Decision Focus UI

- Tightened the first screen so the paste box and Check my list button appear faster.
- Made the #1 recommendation card more visually dominant.
- Kept public card actions focused on Check price now, Save this, and Show another pick.
- Hid duplicate/details-heavy controls from the normal public flow.
