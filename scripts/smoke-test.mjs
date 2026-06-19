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

pass(index.includes("v94-results-focus"), "Body should include v94-results-focus class so new layout CSS applies.");
pass(index.includes('style.css?v=94-results-focus'), "Stylesheet cache-buster should be v94.");
pass(index.includes('app.js?v=94-results-focus'), "App script cache-buster should be v94.");
pass(app.includes('v94-results-focus'), "App UI_VERSION should include v94-results-focus.");

pass(/\.skip-link:not\(:focus\):not\(:focus-visible\)[\s\S]*left:\s*-100000px !important[\s\S]*clip-path:\s*inset\(100%\)/.test(css),
  "Skip link should be fully offscreen until keyboard focus.");
pass(index.includes("<h2>Important notes</h2>") && /body\.v94-results-focus #privacy-limits[\s\S]*display:\s*block !important/.test(css),
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
pass(/body\.v94-results-focus\.has-results:not\(\.show-all-results\) \.results-panel[\s\S]*display:\s*none !important/.test(css),
  "All Results should stay collapsed until the user opens it.");
pass(app.includes('v94: keep the secondary All Results section collapsed'), "renderResults should not automatically open All Results.");
pass(app.includes('has-clean-input'), "Input preview should update body classes for cleaner launch guidance.");
pass(/body\.v94-results-focus \.top-pick-card:first-child[\s\S]*grid-column:\s*1 \/ -1 !important/.test(css),
  "Top pick should span the Best Picks grid for better readability.");
pass(/body\.v94-results-focus \.result-card\.compact-result-row[\s\S]*grid-template-areas:[\s\S]*"main status"[\s\S]*"actions actions"[\s\S]*"details details"[\s\S]*"disclosure disclosure"/.test(css),
  "All Results cards should stack actions/details/disclosure in non-overlapping rows.");
pass(/result-inline-details:not\(\[open\]\) \.result-inline-details-grid[\s\S]*display:\s*none !important/.test(css),
  "Closed result details should not leak columns into the row.");

if (failures.length) {
  console.error("Smoke test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Smoke test passed.");
console.log(`Checked ${ids.size} IDs and ${[...app.matchAll(getIdRegex)].length} getElementById references.`);
