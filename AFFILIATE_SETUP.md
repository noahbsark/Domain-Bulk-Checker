# Affiliate setup for Domain Shortlist

This app can use direct registrar search links or affiliate redirect templates. Affiliate mode is **off by default** so the app works safely without tracking links.

## 1. Keep the public disclosure visible

The app already includes an affiliate notice near registrar actions and in the footer pages. Keep that disclosure visible if any registrar link can earn a commission.

Suggested disclosure:

> Some registrar links may be affiliate links. If you register after clicking, this site may earn a commission at no extra cost to you. The registrar confirms final price, availability, premium status, checkout, renewals, and refunds.

## 2. Get the affiliate tracking URL from your affiliate platform

Use the exact URL or template provided by the affiliate platform. Some networks give you a redirect URL that wraps the destination registrar URL. Others give a static tracking URL.

Common placeholder patterns this app supports:

```js
{url} or {url_encoded}       // encoded registrar destination URL
{url_raw}                    // unencoded registrar destination URL
{domain} or {domain_encoded} // encoded domain, such as example.com
{domain_raw}                 // unencoded domain
{registrar}                  // registrar key, such as namecheap
```

## 3. Paste templates in `app.js`

Find this block:

```js
const AFFILIATE_CONFIG = {
  enabled: false,
  templates: {
    namecheap: "",
    porkbun: "",
    godaddy: "",
    dynadot: "",
    namesilo: ""
  },
  requireValidUrl: true,
  testDomain: "example.com"
};
```

Turn it on and add your template:

```js
const AFFILIATE_CONFIG = {
  enabled: true,
  templates: {
    namecheap: "https://your-affiliate-network.example/click?url={url}",
    porkbun: "",
    godaddy: "",
    dynadot: "",
    namesilo: ""
  },
  requireValidUrl: true,
  testDomain: "example.com"
};
```

## 4. Test before launch

Open the app, turn on **Advanced mode**, then open **Affiliate setup tester**.

Test each registrar you plan to use:

1. Select registrar.
2. Enter a test domain such as `example.com`.
3. Click **Open test link**.
4. Confirm the final page is a registrar search or domain result page.
5. Confirm the domain is carried through correctly if your affiliate program supports destination URLs.
6. Use **Copy test link** to inspect the final URL.

## 5. Fallback behavior

If affiliate mode is off, no template exists, or a template does not produce a valid `http`/`https` URL, the app falls back to the direct registrar search link.

This helps prevent broken price-check buttons during launch.

## 6. Things to verify manually

- The link opens the selected registrar.
- The searched domain appears correctly.
- The affiliate network allows the destination URL format you used.
- The affiliate disclosure remains visible near registrar actions.
- Multiple-tab actions still open the expected number of links.
- Mobile Check Price buttons still work.

## 7. Do not track pasted domain lists

If you later enable analytics, keep analytics limited to product events such as `check_started` and `check_price_clicked`. Do not send pasted domain lists, uploaded files, or raw user input to analytics.
