#!/usr/bin/env node
// Static launch smoke test for Domain Shortlist.
// This intentionally avoids loading app.js in Node because the app is browser-only.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

const failures = [];
const pass = (condition, message) => {
  if (!condition) failures.push(message);
};

const idRegex = /\bid="([^"]+)"/g;
const ids = new Map();
for (const match of index.matchAll(idRegex)) {
  ids.set(match[1], (ids.get(match[1]) || 0) + 1);
}

const duplicateIds = [...ids.entries()].filter(([, count]) => count > 1);
pass(duplicateIds.length === 0, `Duplicate IDs: ${duplicateIds.map(([id, count]) => `${id} (${count})`).join(", ")}`);

const getIdRegex = /document\.getElementById\(["']([^"']+)["']\)/g;
const missingIds = [...new Set([...app.matchAll(getIdRegex)].map(match => match[1]))]
  .filter(id => !ids.has(id));
pass(missingIds.length === 0, `Missing IDs referenced by app.js: ${missingIds.join(", ")}`);

pass(index.includes("v97-upgrade"), "Body should include v97-upgrade class so new layout CSS applies.");
pass(index.includes('style.css?v=97-upgrade'), "Stylesheet cache-buster should be v97.");
pass(index.includes('app.js?v=97-upgrade'), "App script cache-buster should be v97.");
pass(app.includes('v97-upgrade'), "App UI_VERSION should include v97-upgrade.");

pass(/\.skip-link:not\(:focus\):not\(:focus-visible\)[\s\S]*left:\s*-100000px !important[\s\S]*clip-path:\s*inset\(100%\)/.test(css),
  "Skip link should be fully offscreen until keyboard focus.");
pass(index.includes("<h2>Before you buy</h2>") && /body\.v94-results-focus #privacy-limits[\s\S]*display:\s*block !important/.test(css),
  "Important notes should be restored as a normal static panel.");
pass(index.includes("Registrar links may be affiliate links") && app.includes("registrarLinkDisclosureText"),
  "Affiliate disclosure should appear near registrar actions.");
pass(!app.includes('rel="sponsored noopener noreferrer"'),
  "Affiliate rel attributes should include nofollow when sponsored.");
pass(app.includes("nofollow sponsored noopener noreferrer"),
  "Sponsored registrar links should have nofollow sponsored noopener noreferrer.");
pass(app.includes('"domain", "domains", "normalized_domain"') && app.includes("analyticsLooksLikeDomain"),
  "Analytics sanitizer should block domain-like strings and domain payload keys.");
pass(/Sitemap:\s*(https:\/\/[^\s]+\/sitemap\.xml)/.test(robots),
  "robots.txt should declare a sitemap URL.");
const robotSitemap = robots.match(/Sitemap:\s*(https:\/\/[^\s]+\/sitemap\.xml)/)?.[1] || "";
const sitemapBase = sitemap.match(/<loc>(https:\/\/[^<]+\/)[^/<]*<\/loc>/)?.[1] || "";
pass(robotSitemap.startsWith(sitemapBase),
  `robots.txt sitemap URL should match sitemap.xml base. robots=${robotSitemap}, sitemapBase=${sitemapBase}`);

pass(index.includes('View all results') && index.includes('<h2>All results</h2>'),
  "All Results copy should avoid repeated 'All checked names' labels.");
pass(/body\.v95-clean-launch-flow\.has-results:not\(\.show-all-results\) \.results-panel[\s\S]*display:\s*none !important/.test(css) ||
  /body\.v97-upgrade\.has-results:not\(\.show-all-results\) \.results-panel[\s\S]*display:\s*none !important/.test(css),
  "All Results should stay collapsed until the user opens it.");
pass(app.includes('v97: keep the secondary All Results section collapsed'), "renderResults should not automatically open All Results.");
pass(app.includes('has-clean-input'), "Input preview should update body classes for cleaner launch guidance.");
pass(/body\.v95-clean-launch-flow \.top-pick-card:first-child[\s\S]*grid-column:\s*1 \/ -1 !important/.test(css) ||
  /body\.v97-upgrade \.top-pick-card:first-child[\s\S]*grid-column:\s*1 \/ -1 !important/.test(css),
  "Top pick should span the Best Picks grid for better readability.");
pass(/body\.v95-clean-launch-flow \.result-card\.compact-result-row[\s\S]*grid-template-areas:[\s\S]*"main status"[\s\S]*"actions actions"[\s\S]*"details details"[\s\S]*"disclosure disclosure"/.test(css) ||
  /body\.v97-upgrade \.result-card\.compact-result-row[\s\S]*grid-template-areas:[\s\S]*"main status"[\s\S]*"actions actions"[\s\S]*"details details"[\s\S]*"disclosure disclosure"/.test(css),
  "All Results cards should stack actions/details/disclosure in non-overlapping rows.");
pass(/result-inline-details:not\(\[open\]\) \.result-inline-details-grid[\s\S]*display:\s*none !important/.test(css),
  "Closed result details should not leak columns into the row.");


pass(index.includes("Paste domains. Pick the best one."), "Hero headline should use shorter v96 copy.");
pass(index.includes("v97-upgrade"), "Body should include v97-upgrade class.");
pass(index.includes('style.css?v=97-upgrade'), "Stylesheet cache-buster should be v97.");
pass(index.includes('app.js?v=97-upgrade'), "App script cache-buster should be v97.");
pass(app.includes('v97-upgrade'), "App UI_VERSION should include v97-upgrade.");
pass(/class="skip-link"[\s\S]*style="[^"]*left:-100000px/.test(index),
  "Skip link should have inline offscreen hiding to prevent clipped first-paint text.");
pass(/body\.v97-upgrade \.hero-copy h1[\s\S]*max-width:\s*880px/.test(css),
  "v97 should keep the hero headline controlled for scaled displays.");
pass(/body\.v97-upgrade\.has-clean-input:not\(\.has-results\) #inputBox[\s\S]*min-height:\s*68px/.test(css),
  "Clean sample input should use a compact textarea before results.");
pass(/body\.v95-clean-launch-flow\.has-results:not\(\.editing-input\) #domain-input #inputBox[\s\S]*display:\s*none !important/.test(css) ||
  /body\.v97-upgrade\.has-results:not\(\.editing-input\) #domain-input #inputBox[\s\S]*display:\s*none !important/.test(css),
  "Input textarea should collapse after results unless editing.");
pass(/body\.v97-upgrade \.top-pick-card:first-child[\s\S]*width:\s*min\(100%, 560px\)/.test(css),
  "v97 should feature a readable but not oversized top pick card.");


pass(index.includes('aria-label="Skip to domain input"') && !index.includes('>Skip to domain input</a>'),
  "Skip link should have no visible text until focus, preventing top-left clipped text.");
pass(index.includes('input-helper-strip') && css.includes('body.v97-upgrade.has-clean-input .input-helper-strip'),
  "Input helper chips should exist and hide after clean input/results.");
pass(app.includes('top-pick-score-chip') && css.includes('.top-pick-score-chip'),
  "Best Picks should show visible score chips.");
pass(index.includes('<h2>Before you buy</h2>'),
  "Trust notes should use the Before you buy heading.");

if (failures.length) {
  console.error("Smoke test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Smoke test passed.");
console.log(`Checked ${ids.size} IDs and ${[...app.matchAll(getIdRegex)].length} getElementById references.`);
