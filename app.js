/* No-Key Domain Bulk Checker - static GitHub Pages app */

const SPECIAL_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "ltd.uk", "me.uk", "net.uk", "plc.uk",
  "com.au", "net.au", "org.au", "edu.au", "gov.au", "asn.au",
  "co.nz", "org.nz", "net.nz", "ac.nz", "govt.nz",
  "com.br", "net.br", "org.br",
  "com.mx", "org.mx", "gob.mx",
  "co.jp", "ne.jp", "or.jp", "ac.jp",
  "co.kr", "ne.kr", "or.kr", "ac.kr",
  "com.sg", "net.sg", "org.sg", "edu.sg",
  "com.tr", "net.tr", "org.tr",
  "com.cn", "net.cn", "org.cn", "gov.cn",
  "com.hk", "net.hk", "org.hk",
  "com.tw", "net.tw", "org.tw",
  "co.in", "firm.in", "net.in", "org.in", "gen.in", "ind.in",
  "co.za", "org.za", "net.za", "web.za",
  "com.ar", "net.ar", "org.ar",
  "com.pl", "net.pl", "org.pl",
  "com.es", "nom.es", "org.es",
  "com.sa", "net.sa", "org.sa",
  "com.my", "net.my", "org.my",
  "com.ph", "net.ph", "org.ph",
  "com.ng", "net.ng", "org.ng"
]);

const RDAP_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const RDAP_ORG_DOMAIN_URL = "https://rdap.org/domain/";
const DNS_GOOGLE_URL = "https://dns.google/resolve";

const el = {
  inputBox: document.getElementById("inputBox"),
  inputCount: document.getElementById("inputCount"),
  fileInput: document.getElementById("fileInput"),
  loadTxtBtn: document.getElementById("loadTxtBtn"),
  clearInputBtn: document.getElementById("clearInputBtn"),
  pasteDemoBtn: document.getElementById("pasteDemoBtn"),
  workersInput: document.getElementById("workersInput"),
  delayInput: document.getElementById("delayInput"),
  timeoutInput: document.getElementById("timeoutInput"),
  useRdapInput: document.getElementById("useRdapInput"),
  useDnsInput: document.getElementById("useDnsInput"),
  dedupeInput: document.getElementById("dedupeInput"),
  checkBtn: document.getElementById("checkBtn"),
  removeTakenBtn: document.getElementById("removeTakenBtn"),
  openAllBtn: document.getElementById("openAllBtn"),
  openAvailableBtn: document.getElementById("openAvailableBtn"),
  exportBtn: document.getElementById("exportBtn"),
  copyAvailableBtn: document.getElementById("copyAvailableBtn"),
  copyAllBtn: document.getElementById("copyAllBtn"),
  statusText: document.getElementById("statusText"),
  progress: document.getElementById("progress"),
  resultsBody: document.getElementById("resultsBody"),
  summaryChecked: document.getElementById("summaryChecked"),
  summaryAvailable: document.getElementById("summaryAvailable"),
  summaryTaken: document.getElementById("summaryTaken"),
  summaryUnknown: document.getElementById("summaryUnknown"),
  summaryInvalid: document.getElementById("summaryInvalid")
};

let results = [];
let rdapBootstrap = null;
let stopRequested = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function withTimeout(promiseFactory, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return promiseFactory(controller.signal).finally(() => clearTimeout(timer));
}

function cleanToken(raw) {
  return String(raw || "")
    .trim()
    .replace(/^[<('"\[]+/, "")
    .replace(/[>)'",\]]+$/, "")
    .trim();
}

function normalizeDomain(rawInput) {
  const original = rawInput;
  let value = cleanToken(rawInput);
  if (!value) return { input: original, domain: "", error: "blank" };

  if (value.includes("@") && !value.includes("/") && !value.includes("://")) {
    value = value.split("@").pop();
  }

  let host = "";
  try {
    const urlish = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `http://${value}`;
    const parsed = new URL(urlish);
    host = parsed.hostname || value;
  } catch {
    host = value.split(/[/?#]/)[0];
  }

  host = host
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "")
    .trim();

  if (!host || !host.includes(".")) {
    return { input: original, domain: host, error: "not a domain" };
  }
  if (/[^a-z0-9.-]/i.test(host) || host.includes("..")) {
    return { input: original, domain: host, error: "invalid characters" };
  }

  const parts = host.split(".").filter(Boolean);
  if (parts.length < 2) return { input: original, domain: host, error: "not a registrable domain" };

  const lastTwo = parts.slice(-2).join(".");
  let registrable;
  if (SPECIAL_SUFFIXES.has(lastTwo) && parts.length >= 3) {
    registrable = parts.slice(-3).join(".");
  } else {
    registrable = parts.slice(-2).join(".");
  }

  const labelOk = registrable.split(".").every(label => {
    return label.length >= 1 && label.length <= 63 && !label.startsWith("-") && !label.endsWith("-");
  });
  if (!labelOk) return { input: original, domain: registrable, error: "invalid label" };

  return { input: original, domain: registrable, error: "" };
}

function namecheapUrl(domain) {
  return `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`;
}

function classForStatus(status) {
  if (status === "possibly_available" || status === "possibly_available_dns") return "available";
  if (status === "unavailable_registered" || status === "unavailable_dns") return "taken";
  if (status === "invalid_input") return "invalid";
  return "unknown";
}

function tldOf(domain) {
  const parts = domain.toLowerCase().split(".");
  return parts[parts.length - 1] || "";
}

async function loadRdapBootstrap(timeoutMs) {
  if (rdapBootstrap) return rdapBootstrap;
  const response = await withTimeout(
    signal => fetch(RDAP_BOOTSTRAP_URL, { signal, cache: "force-cache" }),
    timeoutMs
  );
  if (!response.ok) throw new Error(`IANA bootstrap HTTP ${response.status}`);
  rdapBootstrap = await response.json();
  return rdapBootstrap;
}

function rdapUrlsForDomain(domain) {
  const tld = tldOf(domain);
  const urls = [];

  if (rdapBootstrap && Array.isArray(rdapBootstrap.services)) {
    for (const service of rdapBootstrap.services) {
      const tlds = service[0] || [];
      const bases = service[1] || [];
      if (tlds.map(String).map(s => s.toLowerCase()).includes(tld)) {
        for (const base of bases) {
          const slashBase = String(base).endsWith("/") ? String(base) : `${base}/`;
          urls.push(`${slashBase}domain/${encodeURIComponent(domain)}`);
        }
      }
    }
  }

  urls.push(`${RDAP_ORG_DOMAIN_URL}${encodeURIComponent(domain)}`);
  return [...new Set(urls)];
}

async function queryRdap(domain, timeoutMs) {
  try {
    await loadRdapBootstrap(timeoutMs);
  } catch (err) {
    // Continue to rdap.org fallback even when the bootstrap list fails/CORS-blocks.
  }

  const rdapUrls = rdapUrlsForDomain(domain);
  const errors = [];

  for (const url of rdapUrls) {
    try {
      const response = await withTimeout(
        signal => fetch(url, { signal, headers: { "Accept": "application/rdap+json, application/json" } }),
        timeoutMs
      );

      if (response.status === 404) {
        return {
          status: "possibly_available",
          available: true,
          source: "RDAP",
          rdap_url: url,
          notes: "RDAP returned not found; confirm with registrar before buying."
        };
      }
      if (response.status === 429) {
        errors.push(`rate limited at ${url}`);
        continue;
      }
      if (response.ok) {
        return {
          status: "unavailable_registered",
          available: false,
          source: "RDAP",
          rdap_url: url,
          notes: "RDAP found a registered domain object."
        };
      }
      errors.push(`HTTP ${response.status} at ${url}`);
    } catch (err) {
      errors.push(`${url}: ${err.name === "AbortError" ? "timeout" : err.message}`);
    }
  }

  return {
    status: "unknown",
    available: null,
    source: "RDAP",
    rdap_url: rdapUrls[0] || "",
    notes: "RDAP check failed or was blocked by browser/CORS.",
    error: errors.slice(0, 3).join(" | ")
  };
}

async function queryDns(domain, timeoutMs) {
  const errors = [];
  for (const type of ["SOA", "NS", "A", "MX"]) {
    const url = `${DNS_GOOGLE_URL}?name=${encodeURIComponent(domain)}&type=${type}&cd=true`;
    try {
      const response = await withTimeout(signal => fetch(url, { signal }), timeoutMs);
      if (!response.ok) {
        errors.push(`DNS ${type} HTTP ${response.status}`);
        continue;
      }
      const data = await response.json();
      if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) {
        return {
          status: "unavailable_dns",
          available: false,
          source: `Google DNS ${type}`,
          notes: "DNS records exist. Treat as likely taken; RDAP/registrar can confirm."
        };
      }
      if (data.Status === 3) {
        return {
          status: "possibly_available_dns",
          available: true,
          source: `Google DNS ${type}`,
          notes: "DNS returned NXDOMAIN. This is weaker than RDAP; confirm with registrar."
        };
      }
      errors.push(`DNS ${type} status ${data.Status}`);
    } catch (err) {
      errors.push(`DNS ${type}: ${err.name === "AbortError" ? "timeout" : err.message}`);
    }
  }
  return {
    status: "unknown",
    available: null,
    source: "DNS",
    notes: "DNS fallback could not determine availability.",
    error: errors.slice(0, 3).join(" | ")
  };
}

async function checkDomain(row, options) {
  const checkedAt = new Date().toISOString();
  if (row.error) {
    return {
      input: row.input,
      normalized_domain: row.domain || "",
      namecheap_url: row.domain ? namecheapUrl(row.domain) : "",
      availability_status: "invalid_input",
      available: null,
      check_source: "normalizer",
      checked_at_utc: checkedAt,
      notes: row.error,
      error: row.error,
      rdap_url: ""
    };
  }

  let rdapResult = null;
  if (options.useRdap) {
    rdapResult = await queryRdap(row.domain, options.timeoutMs);
    if (rdapResult.status !== "unknown" || !options.useDns) {
      return toResult(row, rdapResult, checkedAt);
    }
  }

  if (options.useDns) {
    const dnsResult = await queryDns(row.domain, options.timeoutMs);
    if (dnsResult.status !== "unknown") {
      const combined = {
        ...dnsResult,
        rdap_url: rdapResult?.rdap_url || "",
        notes: `${dnsResult.notes}${rdapResult?.error ? ` RDAP issue: ${rdapResult.error}` : ""}`,
        error: rdapResult?.error || dnsResult.error || ""
      };
      return toResult(row, combined, checkedAt);
    }
  }

  const unknown = rdapResult || {
    status: "unknown",
    available: null,
    source: "none",
    notes: "No check method succeeded.",
    error: ""
  };
  return toResult(row, unknown, checkedAt);
}

function toResult(row, check, checkedAt) {
  return {
    input: row.input,
    normalized_domain: row.domain,
    namecheap_url: namecheapUrl(row.domain),
    availability_status: check.status,
    available: check.available,
    check_source: check.source || "",
    checked_at_utc: checkedAt,
    rdap_url: check.rdap_url || "",
    notes: check.notes || "",
    error: check.error || ""
  };
}

function parseInputLines() {
  const rawLines = el.inputBox.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const rows = rawLines.map(normalizeDomain);
  if (!el.dedupeInput.checked) return rows;

  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    const key = row.domain || row.input;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(row);
    }
  }
  return deduped;
}

async function mapLimit(items, limit, callback, onDone) {
  const queue = [...items.entries()];
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (queue.length && !stopRequested) {
      const [index, item] = queue.shift();
      const value = await callback(item, index);
      onDone(value, index);
    }
  });
  await Promise.all(workers);
}

async function runChecks() {
  stopRequested = false;
  const rows = parseInputLines();
  if (!rows.length) {
    setStatus("Paste at least one URL or domain first.");
    return;
  }

  results = new Array(rows.length);
  renderResults();
  setButtons(false);
  const options = {
    workers: clampNumber(el.workersInput.value, 1, 10, 2),
    delayMs: clampNumber(el.delayInput.value, 0, 10000, 250),
    timeoutMs: clampNumber(el.timeoutInput.value, 1000, 60000, 12000),
    useRdap: el.useRdapInput.checked,
    useDns: el.useDnsInput.checked
  };

  let done = 0;
  el.progress.max = rows.length;
  el.progress.value = 0;
  setStatus(`Checking ${rows.length} domains...`);

  try {
    await mapLimit(rows, options.workers, async row => {
      if (options.delayMs > 0) await sleep(options.delayMs);
      return checkDomain(row, options);
    }, result => {
      results[done] = result;
      done += 1;
      el.progress.value = done;
      setStatus(`Checked ${done}/${rows.length}: ${result.normalized_domain || result.input}`);
      renderResults();
    });
  } catch (err) {
    setStatus(`Stopped with error: ${err.message}`);
  } finally {
    results = results.filter(Boolean);
    renderResults();
    updateSummary();
    setButtons(true);
    setStatus(`Done. Checked ${results.length} rows. Remove taken rows, open links, copy, or export CSV.`);
    saveState();
  }
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function renderResults() {
  if (!results.length || results.every(r => !r)) {
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="7">No results yet.</td></tr>';
    updateSummary();
    return;
  }

  const rowsHtml = results.filter(Boolean).map(result => {
    const cls = classForStatus(result.availability_status);
    const availableText = result.available === true ? "True" : result.available === false ? "False" : "";
    const linkHtml = result.namecheap_url
      ? `<a class="link-pill" href="${escapeAttr(result.namecheap_url)}" target="_blank" rel="noopener noreferrer">Open Namecheap</a>`
      : "";
    return `<tr class="${cls}">
      <td>${escapeHtml(result.input)}</td>
      <td>${escapeHtml(result.normalized_domain)}</td>
      <td>${escapeHtml(result.availability_status)}</td>
      <td>${availableText}</td>
      <td>${linkHtml}</td>
      <td>${escapeHtml(result.check_source || "")}</td>
      <td>${escapeHtml(result.notes || result.error || "")}</td>
    </tr>`;
  }).join("");

  el.resultsBody.innerHTML = rowsHtml;
  updateSummary();
}

function updateSummary() {
  const cleaned = results.filter(Boolean);
  el.summaryChecked.textContent = cleaned.length;
  el.summaryAvailable.textContent = cleaned.filter(r => r.available === true).length;
  el.summaryTaken.textContent = cleaned.filter(r => r.available === false).length;
  el.summaryInvalid.textContent = cleaned.filter(r => r.availability_status === "invalid_input").length;
  el.summaryUnknown.textContent = cleaned.filter(r => r.available === null && r.availability_status !== "invalid_input").length;
}

function removeTaken() {
  const before = results.length;
  results = results.filter(r => r && r.available !== false);
  const removed = before - results.length;
  replaceInputWithDomains(results.map(r => r.normalized_domain).filter(Boolean));
  renderResults();
  setStatus(`Removed ${removed} taken/registered rows. Open ALL now only opens remaining rows.`);
  saveState();
}

function replaceInputWithDomains(domains) {
  const unique = [...new Set(domains)];
  el.inputBox.value = unique.join("\n");
  updateInputCount();
}

function openLinks(filterFn) {
  const links = [...new Set(results.filter(Boolean).filter(filterFn).map(r => r.namecheap_url).filter(Boolean))];
  if (!links.length) {
    setStatus("No matching Namecheap links to open.");
    return;
  }
  if (links.length > 10 && !confirm(`Open ${links.length} browser tabs? Your browser may block popups or slow down.`)) {
    return;
  }

  let opened = 0;
  for (const link of links) {
    const win = window.open(link, "_blank", "noopener,noreferrer");
    if (win) opened += 1;
  }
  setStatus(`Opened ${opened}/${links.length} Namecheap links. If some did not open, allow popups for this site.`);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(`Copied ${label} to clipboard.`);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    setStatus(`Copied ${label} to clipboard.`);
  }
}

function copyAvailable() {
  const domains = results.filter(r => r && r.available === true).map(r => r.normalized_domain);
  copyText([...new Set(domains)].join("\n"), "available domains");
}

function copyAllDomains() {
  const domains = results.filter(Boolean).map(r => r.normalized_domain).filter(Boolean);
  copyText([...new Set(domains)].join("\n"), "all result domains");
}

function exportCsv() {
  if (!results.length) {
    setStatus("No results to export.");
    return;
  }
  const columns = [
    "input", "normalized_domain", "namecheap_url", "availability_status", "available",
    "check_source", "checked_at_utc", "rdap_url", "notes", "error"
  ];
  const csv = [
    columns.join(","),
    ...results.filter(Boolean).map(row => columns.map(col => csvCell(row[col])).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `domain-results-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus(`Exported ${results.length} rows to CSV.`);
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[ch]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function setStatus(text) {
  el.statusText.textContent = text;
}

function setButtons(enabled) {
  for (const btn of [el.checkBtn, el.removeTakenBtn, el.openAllBtn, el.openAvailableBtn, el.exportBtn, el.copyAvailableBtn, el.copyAllBtn]) {
    btn.disabled = !enabled;
  }
}

function updateInputCount() {
  const count = el.inputBox.value.split(/\r?\n/).filter(line => line.trim()).length;
  el.inputCount.textContent = `${count} line${count === 1 ? "" : "s"}`;
  localStorage.setItem("domainCheckerInput", el.inputBox.value);
}

function saveState() {
  localStorage.setItem("domainCheckerResults", JSON.stringify(results.slice(0, 2000)));
}

function loadState() {
  const savedInput = localStorage.getItem("domainCheckerInput");
  if (savedInput) el.inputBox.value = savedInput;
  const savedResults = localStorage.getItem("domainCheckerResults");
  if (savedResults) {
    try { results = JSON.parse(savedResults) || []; } catch { results = []; }
  }
  updateInputCount();
  renderResults();
}

async function loadFile(file) {
  const text = await file.text();
  const lines = parseMaybeCsv(text);
  el.inputBox.value = lines.join("\n");
  updateInputCount();
  setStatus(`Loaded ${lines.length} rows from ${file.name}.`);
}

function parseMaybeCsv(text) {
  const rawLines = text.split(/\r?\n/).filter(line => line.trim());
  if (!rawLines.length) return [];
  const header = rawLines[0].split(",").map(s => s.trim().toLowerCase().replace(/^"|"$/g, ""));
  const preferred = ["url", "urls", "domain", "domains", "link", "links", "input", "normalized_domain"];
  const index = preferred.map(name => header.indexOf(name)).find(i => i >= 0);
  if (index !== undefined && index >= 0) {
    return rawLines.slice(1).map(line => splitCsvLine(line)[index]).filter(Boolean);
  }
  return rawLines.map(line => splitCsvLine(line)[0]).filter(Boolean);
}

function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells.map(cleanToken);
}

el.inputBox.addEventListener("input", updateInputCount);
el.loadTxtBtn.addEventListener("click", () => el.fileInput.click());
el.fileInput.addEventListener("change", event => {
  const file = event.target.files?.[0];
  if (file) loadFile(file);
  event.target.value = "";
});
el.clearInputBtn.addEventListener("click", () => {
  el.inputBox.value = "";
  updateInputCount();
});
el.pasteDemoBtn.addEventListener("click", () => {
  el.inputBox.value = [
    "doyourownprobate.com",
    "probateprogram.com",
    "probatetool.com",
    "probateforless.com"
  ].join("\n");
  updateInputCount();
});
el.checkBtn.addEventListener("click", runChecks);
el.removeTakenBtn.addEventListener("click", removeTaken);
el.openAllBtn.addEventListener("click", () => openLinks(() => true));
el.openAvailableBtn.addEventListener("click", () => openLinks(r => r.available === true));
el.exportBtn.addEventListener("click", exportCsv);
el.copyAvailableBtn.addEventListener("click", copyAvailable);
el.copyAllBtn.addEventListener("click", copyAllDomains);

loadState();
