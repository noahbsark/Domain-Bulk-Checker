# Launch Inputs Needed — v80

This version keeps the public app focused on a safe, self-explanatory flow:

1. Paste ideas.
2. Review the best picks first.
3. Save finalists or check price at the registrar.

No new launch inputs are required for this polish pass.

# Inputs needed before going live

Current placeholders are centralized in `app.js`:

- `PUBLIC_SITE_NAME`: Domain Shortlist
- `PUBLIC_SITE_TAGLINE`: Find the best domain names from your list.
- `PUBLIC_SITE_URL`: https://noahbsark.github.io/Domain-Bulk-Checker/

Later, I will need:

1. Final public site name.
2. Final one-sentence tagline.
3. Final custom domain.
4. DNS/registrar access or screenshots for the custom domain setup.
5. Preferred registrar order for price-check buttons.
6. Affiliate link templates, or confirmation to keep direct registrar links only.
7. Support email or feedback destination.
8. Analytics choice: none, privacy-friendly analytics, or Google tag.
9. Final approval of privacy, affiliate disclosure, and terms pages.

## v55 owner note

v55 adds a simpler saved-finalist progress workflow:

- **Copy unchecked names** copies only unchecked saved finalists.
- Saved finalists sort unchecked first and checked last automatically.
- The saved header now uses one summary: `saved · checked · left`.

No launch input is required for these defaults. Before going live, test: save 3 names, mark 1 checked, confirm the saved section shows `3 saved · 1 checked · 2 left`, then copy unchecked names.


## v55 update

- Added a small Finish checking helper for unchecked saved finalists.
- Added an All checked completion message when saved finalists are finished.
- Added Pick winner on saved finalists; the winner appears first in reports.


## v55 owner note

Winner actions added: Copy winner, Clear winner, and direct winner notes in reports.


## v55 owner note

The saved finalist workflow now supports opening/copying the winner link and showing whether the winner has been checked. Before launch, verify the preferred registrar link format after the final affiliate/registrar choice is made.


## v56 owner note

v56 adds final winner workflow polish:

- Winner-ready hint after the winner is marked checked.
- Copy winner report for quick sharing.
- Advanced-only cleanup for completed checked finalists, while keeping the winner.


## v57 note

The app now supports a local Advanced Mode session archive. It stores up to 5 recent archives in the browser only; it does not upload or sync them.


## v60 archive manager note

No input is needed from you for the archive manager. It is local-browser only, behind Advanced Mode, and does not upload or sync session data.


## v60 owner note

Archive management now supports restore previews, archive search, and duplicate archive. These are browser-local Advanced Mode tools and do not require launch input from Noah.


## v62 archive notes

Archive import preview, automatic archive labels, and current-session summaries are browser-local Advanced Mode tools. They do not require launch input from Noah.


## v62 update

- Added Advanced Mode archive pinning so important local archives stay at the top.
- Added short archive notes that are included in archive search.
- Added safer import behavior: before importing JSON, the app can archive the current session first.


## v63 note

Advanced Mode now supports archive counts, all-archive export, and importing JSON as a saved archive without restoring it immediately.


## v64 note

No new launch input needed. Archive health, label repair, and archive limit controls are Advanced Mode utilities only.


## v66 cleanup note

The app now shows all results automatically after a check while keeping the default public screen simpler.

## v67 compact results note

No new launch input is needed. v67 only cleans up the tested post-check UI:

- hero collapses after results exist
- paste input collapses after checking with an **Edit list** option
- All Results stays visible and easier to scan
- extra public buttons are hidden unless Advanced Mode is on

Before launch, test one short list and confirm a new visitor can see both Top Picks and All Results without enabling Advanced Mode.

## v70 filter polish note

No new launch input is needed. v70 cleans up the tested results UI by hiding filters until needed, making Top Picks roomier, and adding a clear recovery action when filters match no rows.


## v70 results view polish check

No new launch input is required. Test All Results compact/comfortable view and saved feedback after pushing.

<!-- v70: Inline All Results details, Taken explanation, and Advanced-only Save all worth-checking. -->


## v74 launch note

The public results view now includes quick scan badges and a copy-with-reasons action. No extra launch input is required.


## v76 launch note

Check the public All Results flow after a test run: Save visible worth-checking should save only the currently visible worth-checking rows, badge clicks should filter rows, and Show everything should restore taken/weak/filtered names without deleting anything.


## v76 update

- Added Undo save for the last bulk save from All Results.
- Added a compact badge legend so users know row badges are clickable filters.
- Improved the cleaned-up notice when Saved-only filters are active.


## v80 review note

Review the simplified public flow after deployment:

1. Paste names.
2. Click Check my list.
3. Start with the #1 Top Pick.
4. Save finalists.
5. Confirm price and spelling at the registrar.

Advanced settings, archive tools, exports, and destructive controls should stay out of the normal public view.


## v81 UI note

The public UI is now intentionally simple-first. Extra controls should stay hidden unless they help the user avoid a mistake. Keep the normal path focused on: paste, check, #1 pick, saved finalists, registrar confirmation.
