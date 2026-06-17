# Custom Domain Setup Checklist

Use this after you choose the real domain. Do not push a fake `CNAME` file.

## Files included in v21

- `privacy.html`
- `affiliate-disclosure.html`
- `terms.html`
- `favicon.svg`
- `site.webmanifest`
- `robots.txt`
- `sitemap.xml`
- `CNAME.example`

## After you choose the domain

1. Rename `CNAME.example` to `CNAME`.
2. Replace the example contents with only your domain, for example `yourdomain.com`.
3. In `index.html`, replace the canonical URL and Open Graph URL with your custom domain.
4. In `robots.txt`, replace the sitemap URL with your custom domain.
5. In `sitemap.xml`, replace every GitHub Pages URL with your custom domain.
6. Update footer/company/contact wording in `privacy.html`, `affiliate-disclosure.html`, and `terms.html`.
7. Configure DNS where you bought the domain.
8. In GitHub Pages settings, add the custom domain and wait for DNS/HTTPS to finish.
9. Test these URLs on desktop and mobile:
   - Home page
   - Privacy page
   - Affiliate disclosure page
   - Terms page
   - Registrar buttons
   - Feedback link

## Before public launch

- Confirm the affiliate disclosure is visible before or near registrar buttons.
- Confirm that no analytics tool receives pasted domain lists.
- Confirm that the site never says availability or pricing is guaranteed.
- Confirm mobile layout works on a small phone screen.
- Confirm `Check price` opens the correct registrar search page.
