# Analytics Setup — Privacy-First

Analytics are **disabled by default** in this app. The app is designed so you can measure the product funnel without collecting pasted domains, uploaded files, saved names, or personal notes.

## What to track

Safe product events:

- `sample_loaded`
- `file_uploaded`
- `fast_scoring_enabled`
- `check_started`
- `check_completed`
- `check_stopped`
- `top_picks_reviewed`
- `domain_compared`
- `saved_shortlist_viewed`
- `saved_shortlist_price_clicked`
- `recent_run_restored`
- `check_price_clicked`
- `export_top_picks_clicked`
- `advanced_mode_enabled`
- `share_app_clicked`
- `feedback_link_clicked`

## What not to track

Do not track:

- pasted domain text
- uploaded file contents
- raw lists
- saved domain names
- recent-run domain names
- user notes
- names typed into the textarea

The analytics sanitizer redacts domain-like strings and blocked keys such as `domain`, `domains`, `input`, `file`, `contents`, and `saved_domains`.

## Local debug mode

Before enabling a real endpoint, turn on local debug mode in `app.js`:

```js
const ANALYTICS_CONFIG = {
  enabled: false,
  localDebug: true
};
```

Then open Advanced Mode and use **Owner analytics safety check** to send a test event, copy the local debug log, and confirm that no domain text is present.

## Enabling an endpoint

For a custom endpoint:

```js
const ANALYTICS_CONFIG = {
  enabled: true,
  provider: "custom",
  endpoint: "https://your-endpoint.example/events",
  localDebug: false
};
```

For Plausible or Fathom, load the vendor script in `index.html`, then set:

```js
provider: "plausible"
```

or:

```js
provider: "fathom"
```

## Pre-launch check

Before launch:

1. Run the app locally.
2. Enable `localDebug` only.
3. Click through the main funnel: sample list, check, top picks, compare, check price, save, export.
4. Copy the debug log from Advanced Mode.
5. Confirm the log contains event names and counts only, not user domains.
6. Only then enable a real provider or endpoint.
