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
const STATE_KEY = "domainCheckerStateV2";

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
  keywordsInput: document.getElementById("keywordsInput"),
  useRdapInput: document.getElementById("useRdapInput"),
  useDnsInput: document.getElementById("useDnsInput"),
  dedupeInput: document.getElementById("dedupeInput"),
  checkBtn: document.getElementById("checkBtn"),
  stopBtn: document.getElementById("stopBtn"),
  removeTakenBtn: document.getElementById("removeTakenBtn"),
  keepAvailableBtn: document.getElementById("keepAvailableBtn"),
  openAllBtn: document.getElementById("openAllBtn"),
  openAvailableBtn: document.getElementById("openAvailableBtn"),
  openFavoritesBtn: document.getElementById("openFavoritesBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportFavoritesBtn: document.getElementById("exportFavoritesBtn"),
  copyAvailableBtn: document.getElementById("copyAvailableBtn"),
  copyFavoritesBtn: document.getElementById("copyFavoritesBtn"),
  copyVisibleBtn: document.getElementById("copyVisibleBtn"),
  copyLinksBtn: document.getElementById("copyLinksBtn"),
  clearSessionBtn: document.getElementById("clearSessionBtn"),
  statusText: document.getElementById("statusText"),
  progress: document.getElementById("progress"),
  summaryChecked: document.getElementById("summaryChecked"),
  summaryAvailable: document.getElementById("summaryAvailable"),
  summaryTaken: document.getElementById("summaryTaken"),
  summaryUnknown: document.getElementById("summaryUnknown"),
  summaryInvalid: document.getElementById("summaryInvalid"),
  summaryFavorites: document.getElementById("summaryFavorites"),
  filterStatus: document.getElementById("filterStatus"),
  filterSearch: document.getElementById("filterSearch"),
  filterTld: document.getElementById("filterTld"),
  filterMaxLen: document.getElementById("filterMaxLen"),
  filterNoHyphen: document.getElementById("filterNoHyphen"),
  filterNoNumbers: document.getElementById("filterNoNumbers"),
  sortSelect: document.getElementById("sortSelect"),
  visibleCount: document.getElementById("visibleCount"),
  resultsBody: document.getElementById("resultsBody")
};

let results = [];
let favorites = new Set();
let rdapBootstrap = null;
let stopRequested = false;
let isChecking = false;

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

  const suffix = effectiveSuffix(host);
  const suffixParts = suffix ? suffix.split(".").length : 1;
  const registrable = parts.slice(Math.max(0, parts.length - suffixParts - 1)).join(".");

  const labelOk = registrable.split(".").every(label => {
    return label.length >= 1 && label.length <= 63 && !label.startsWith("-") && !label.endsWith("-");
  });
  if (!labelOk) return { input: original, domain: registrable, error: "invalid label" };

  return { input: original, domain: registrable, error: "" };
}

function effectiveSuffix(domain) {
  const parts = String(domain || "").toLowerCase().split(".").filter(Boolean);
  if (parts.length < 2) return "";
  const lastTwo = parts.slice(-2).join(".");
  return SPECIAL_SUFFIXES.has(lastTwo) ? lastTwo : parts[parts.length - 1];
}

function secondLevelName(domain) {
  const parts = String(domain || "").toLowerCase().split(".").filter(Boolean);
  if (parts.length < 2) return "";
  const suffix = effectiveSuffix(domain);
  const suffixParts = suffix ? suffix.split(".").length : 1;
  return parts.slice(0, Math.max(1, parts.length - suffixParts)).join(".");
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
  return effectiveSuffix(domain);
}

function getKeywords() {
  const raw = String(el.keywordsInput.value || "").toLowerCase();
  const phraseParts = raw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  const words = phraseParts.flatMap(part => part.split(/\s+/)).map(cleanKeyword).filter(Boolean);
  const phrases = phraseParts.map(cleanKeyword).filter(Boolean);
  return [...new Set([...phrases, ...words])].filter(k => k.length >= 2).slice(0, 20);
}

function cleanKeyword(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function scoreDomain(resultOrDomain, availableValue, statusValue) {
  const domain = typeof resultOrDomain === "string" ? resultOrDomain : resultOrDomain.normalized_domain;
  const available = typeof resultOrDomain === "string" ? availableValue : resultOrDomain.available;
  const status = typeof resultOrDomain === "string" ? statusValue : resultOrDomain.availability_status;
  const keywords = getKeywords();

  if (!domain) return { score: 0, notes: "No valid domain." };

  const sld = secondLevelName(domain).replace(/\./g, "");
  const suffix = effectiveSuffix(domain);
  let score = 50;
  const notes = [];

  if (available === true) {
    score += 15;
    notes.push("possibly available +15");
  } else if (available === false) {
    score -= 45;
    notes.push("taken -45");
  } else if (status === "invalid_input") {
    score -= 60;
    notes.push("invalid -60");
  } else {
    score -= 5;
    notes.push("unknown -5");
  }

  if (suffix === "com") {
    score += 18;
    notes.push(".com +18");
  } else if (["net", "org"].includes(suffix)) {
    score += 10;
    notes.push(`.${suffix} +10`);
  } else if (["co", "io", "ai", "app", "dev", "legal", "law"].includes(suffix)) {
    score += 7;
    notes.push(`.${suffix} +7`);
  } else {
    score += 2;
    notes.push(`.${suffix || "tld"} +2`);
  }

  const len = sld.length;
  if (len <= 8) {
    score += 16;
    notes.push("very short +16");
  } else if (len <= 12) {
    score += 13;
    notes.push("short +13");
  } else if (len <= 16) {
    score += 9;
    notes.push("medium +9");
  } else if (len <= 22) {
    score += 4;
    notes.push("long +4");
  } else if (len > 30) {
    score -= 8;
    notes.push("very long -8");
  }

  if (sld.includes("-")) {
    score -= 12;
    notes.push("hyphen -12");
  } else {
    score += 7;
    notes.push("no hyphen +7");
  }

  if (/\d/.test(sld)) {
    score -= 8;
    notes.push("number -8");
  } else {
    score += 5;
    notes.push("no number +5");
  }

  if (/[aeiou]/.test(sld)) {
    score += 3;
    notes.push("has vowel +3");
  } else {
    score -= 4;
    notes.push("hard to read -4");
  }

  let keywordPoints = 0;
  for (const keyword of keywords) {
    if (keyword && (sld.includes(keyword) || cleanKeyword(domain).includes(keyword))) {
      keywordPoints += 8;
      notes.push(`keyword '${keyword}' +8`);
    }
    if (keywordPoints >= 24) break;
  }
  score += Math.min(keywordPoints, 24);

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    notes: notes.join("; ")
  };
}

function enhanceResult(result) {
  if (!result) return result;
  const score = scoreDomain(result);
  const sld = secondLevelName(result.normalized_domain || "").replace(/\./g, "");
  return {
    ...result,
    favorite: favorites.has(result.normalized_domain),
    effective_tld: effectiveSuffix(result.normalized_domain || ""),
    name_length: sld.length || "",
    domain_score: score.score,
    score_notes: score.notes
  };
}

function rescoreResults() {
  results = results.filter(Boolean).map(enhanceResult);
  renderResults();
  saveState();
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
  const tld = effectiveSuffix(domain).split(".").pop();
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
    return enhanceResult({
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
    });
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
  return enhanceResult({
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
  });
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
  setChecking(true);
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
    }, (result, index) => {
      results[index] = result;
      done += 1;
      el.progress.value = done;
      setStatus(`Checked ${done}/${rows.length}: ${result.normalized_domain || result.input}`);
      renderResults();
    });
  } catch (err) {
    setStatus(`Stopped with error: ${err.message}`);
  } finally {
    results = results.filter(Boolean).map(enhanceResult);
    renderResults();
    updateSummary();
    setChecking(false);
    const endText = stopRequested ? `Stopped. Checked ${results.length}/${rows.length} rows.` : `Done. Checked ${results.length} rows.`;
    setStatus(`${endText} Favorite, filter, remove taken rows, open links, copy, or export CSV.`);
    saveState();
  }
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function displayedResults() {
  const status = el.filterStatus.value;
  const search = String(el.filterSearch.value || "").toLowerCase().trim();
  const tld = String(el.filterTld.value || "").toLowerCase().replace(/^\./, "").trim();
  const maxLen = Number(el.filterMaxLen.value);
  const noHyphen = el.filterNoHyphen.checked;
  const noNumbers = el.filterNoNumbers.checked;
  const sort = el.sortSelect.value;

  let rows = results.filter(Boolean).map(enhanceResult).filter(row => {
    const domain = row.normalized_domain || "";
    const sld = secondLevelName(domain).replace(/\./g, "");

    if (status === "available" && row.available !== true) return false;
    if (status === "taken" && row.available !== false) return false;
    if (status === "unknown" && !(row.available === null && row.availability_status !== "invalid_input")) return false;
    if (status === "invalid" && row.availability_status !== "invalid_input") return false;
    if (status === "favorites" && !favorites.has(domain)) return false;

    if (search) {
      const haystack = [row.input, domain, row.availability_status, row.check_source, row.notes, row.error, row.score_notes]
        .join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (tld && effectiveSuffix(domain) !== tld) return false;
    if (Number.isFinite(maxLen) && maxLen > 0 && Number(row.name_length || sld.length) > maxLen) return false;
    if (noHyphen && sld.includes("-")) return false;
    if (noNumbers && /\d/.test(sld)) return false;
    return true;
  });

  rows.sort((a, b) => {
    if (sort === "score_asc") return Number(a.domain_score || 0) - Number(b.domain_score || 0);
    if (sort === "domain_asc") return String(a.normalized_domain).localeCompare(String(b.normalized_domain));
    if (sort === "length_asc") return Number(a.name_length || 999) - Number(b.name_length || 999);
    if (sort === "status_asc") return String(a.availability_status).localeCompare(String(b.availability_status));
    if (sort === "favorites_first") {
      const favDelta = Number(favorites.has(b.normalized_domain)) - Number(favorites.has(a.normalized_domain));
      return favDelta || Number(b.domain_score || 0) - Number(a.domain_score || 0);
    }
    return Number(b.domain_score || 0) - Number(a.domain_score || 0);
  });
  return rows;
}

function renderResults() {
  const visibleRows = displayedResults();
  if (!results.length || results.every(r => !r)) {
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="10">No results yet.</td></tr>';
    el.visibleCount.textContent = "0 visible";
    updateSummary();
    return;
  }

  if (!visibleRows.length) {
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="10">No rows match the current filters.</td></tr>';
    el.visibleCount.textContent = `0 visible of ${results.filter(Boolean).length}`;
    updateSummary();
    return;
  }

  const rowsHtml = visibleRows.map(result => {
    const cls = classForStatus(result.availability_status);
    const availableText = result.available === true ? "True" : result.available === false ? "False" : "";
    const favorite = favorites.has(result.normalized_domain);
    const starTitle = favorite ? "Remove from favorites" : "Add to favorites";
    const linkHtml = result.namecheap_url
      ? `<a class="link-pill" href="${escapeAttr(result.namecheap_url)}" target="_blank" rel="noopener noreferrer">Open</a>`
      : "";
    return `<tr class="${cls}" data-domain="${escapeAttr(result.normalized_domain)}">
      <td><button type="button" class="star-button ${favorite ? "is-favorite" : ""}" data-favorite="${escapeAttr(result.normalized_domain)}" title="${starTitle}">${favorite ? "★" : "☆"}</button></td>
      <td><strong>${escapeHtml(result.normalized_domain)}</strong><div class="subtle">${escapeHtml(result.input || "")}</div></td>
      <td><span class="score-badge score-${scoreClass(result.domain_score)}" title="${escapeAttr(result.score_notes || "")}">${escapeHtml(result.domain_score ?? "")}</span></td>
      <td>${escapeHtml(result.availability_status)}</td>
      <td>${availableText}</td>
      <td>${linkHtml}</td>
      <td>${escapeHtml(result.effective_tld || effectiveSuffix(result.normalized_domain))}</td>
      <td>${escapeHtml(result.name_length || "")}</td>
      <td>${escapeHtml(result.check_source || "")}</td>
      <td>${escapeHtml(result.notes || result.error || "")}</td>
    </tr>`;
  }).join("");

  el.resultsBody.innerHTML = rowsHtml;
  el.visibleCount.textContent = `${visibleRows.length} visible of ${results.filter(Boolean).length}`;
  updateSummary();
}

function scoreClass(score) {
  const value = Number(score || 0);
  if (value >= 80) return "high";
  if (value >= 55) return "mid";
  return "low";
}

function updateSummary() {
  const cleaned = results.filter(Boolean);
  el.summaryChecked.textContent = cleaned.length;
  el.summaryAvailable.textContent = cleaned.filter(r => r.available === true).length;
  el.summaryTaken.textContent = cleaned.filter(r => r.available === false).length;
  el.summaryInvalid.textContent = cleaned.filter(r => r.availability_status === "invalid_input").length;
  el.summaryUnknown.textContent = cleaned.filter(r => r.available === null && r.availability_status !== "invalid_input").length;
  el.summaryFavorites.textContent = cleaned.filter(r => favorites.has(r.normalized_domain)).length;
}

function removeTaken() {
  const before = results.length;
  results = results.filter(r => r && r.available !== false).map(enhanceResult);
  const removed = before - results.length;
  replaceInputWithDomains(results.map(r => r.normalized_domain).filter(Boolean));
  renderResults();
  setStatus(`Removed ${removed} taken/registered rows. Open ALL now only opens the remaining visible rows.`);
  saveState();
}

function keepAvailableOnly() {
  const before = results.length;
  results = results.filter(r => r && r.available === true).map(enhanceResult);
  const removed = before - results.length;
  replaceInputWithDomains(results.map(r => r.normalized_domain).filter(Boolean));
  renderResults();
  setStatus(`Kept ${results.length} possibly available rows and removed ${removed}.`);
  saveState();
}

function replaceInputWithDomains(domains) {
  const unique = [...new Set(domains)];
  el.inputBox.value = unique.join("\n");
  updateInputCount();
}

function openLinks(rows, label) {
  const links = [...new Set(rows.filter(Boolean).map(r => r.namecheap_url).filter(Boolean))];
  if (!links.length) {
    setStatus(`No ${label} Namecheap links to open.`);
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
  setStatus(`Opened ${opened}/${links.length} ${label} Namecheap links. If some did not open, allow popups for this site.`);
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

function uniqueDomains(rows) {
  return [...new Set(rows.filter(Boolean).map(r => r.normalized_domain).filter(Boolean))];
}

function copyAvailable() {
  copyText(uniqueDomains(results.filter(r => r && r.available === true)).join("\n"), "available domains");
}

function copyFavorites() {
  copyText(uniqueDomains(results.filter(r => r && favorites.has(r.normalized_domain))).join("\n"), "favorite domains");
}

function copyVisible() {
  copyText(uniqueDomains(displayedResults()).join("\n"), "visible domains");
}

function copyVisibleLinks() {
  const links = [...new Set(displayedResults().map(r => r.namecheap_url).filter(Boolean))];
  copyText(links.join("\n"), "visible Namecheap links");
}

function exportCsv(scope = "all") {
  const rows = scope === "favorites" ? results.filter(r => r && favorites.has(r.normalized_domain)) : results.filter(Boolean);
  if (!rows.length) {
    setStatus(scope === "favorites" ? "No favorites to export." : "No results to export.");
    return;
  }
  const columns = [
    "favorite", "input", "normalized_domain", "effective_tld", "name_length", "domain_score", "score_notes",
    "namecheap_url", "availability_status", "available", "check_source", "checked_at_utc", "rdap_url", "notes", "error"
  ];
  const csv = [
    columns.join(","),
    ...rows.map(row => {
      const enhanced = enhanceResult(row);
      return columns.map(col => {
        if (col === "favorite") return csvCell(favorites.has(enhanced.normalized_domain) ? "yes" : "");
        return csvCell(enhanced[col]);
      }).join(",");
    })
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = scope === "favorites" ? `domain-favorites-${stamp}.csv` : `domain-results-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus(`Exported ${rows.length} ${scope === "favorites" ? "favorite" : "result"} rows to CSV.`);
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

function setChecking(checking) {
  isChecking = checking;
  el.checkBtn.disabled = checking;
  el.stopBtn.disabled = !checking;
  const otherButtons = [
    el.removeTakenBtn, el.keepAvailableBtn, el.openAllBtn, el.openAvailableBtn, el.openFavoritesBtn,
    el.exportBtn, el.exportFavoritesBtn, el.copyAvailableBtn, el.copyFavoritesBtn, el.copyVisibleBtn,
    el.copyLinksBtn, el.clearSessionBtn
  ];
  for (const btn of otherButtons) btn.disabled = checking;
}

function updateInputCount() {
  const count = el.inputBox.value.split(/\r?\n/).filter(line => line.trim()).length;
  el.inputCount.textContent = `${count} line${count === 1 ? "" : "s"}`;
  saveState();
}

function currentSettings() {
  return {
    workers: el.workersInput.value,
    delay: el.delayInput.value,
    timeout: el.timeoutInput.value,
    keywords: el.keywordsInput.value,
    useRdap: el.useRdapInput.checked,
    useDns: el.useDnsInput.checked,
    dedupe: el.dedupeInput.checked,
    filterStatus: el.filterStatus.value,
    filterSearch: el.filterSearch.value,
    filterTld: el.filterTld.value,
    filterMaxLen: el.filterMaxLen.value,
    filterNoHyphen: el.filterNoHyphen.checked,
    filterNoNumbers: el.filterNoNumbers.checked,
    sort: el.sortSelect.value
  };
}

function applySettings(settings = {}) {
  if (settings.workers !== undefined) el.workersInput.value = settings.workers;
  if (settings.delay !== undefined) el.delayInput.value = settings.delay;
  if (settings.timeout !== undefined) el.timeoutInput.value = settings.timeout;
  if (settings.keywords !== undefined) el.keywordsInput.value = settings.keywords;
  if (settings.useRdap !== undefined) el.useRdapInput.checked = Boolean(settings.useRdap);
  if (settings.useDns !== undefined) el.useDnsInput.checked = Boolean(settings.useDns);
  if (settings.dedupe !== undefined) el.dedupeInput.checked = Boolean(settings.dedupe);
  if (settings.filterStatus !== undefined) el.filterStatus.value = settings.filterStatus;
  if (settings.filterSearch !== undefined) el.filterSearch.value = settings.filterSearch;
  if (settings.filterTld !== undefined) el.filterTld.value = settings.filterTld;
  if (settings.filterMaxLen !== undefined) el.filterMaxLen.value = settings.filterMaxLen;
  if (settings.filterNoHyphen !== undefined) el.filterNoHyphen.checked = Boolean(settings.filterNoHyphen);
  if (settings.filterNoNumbers !== undefined) el.filterNoNumbers.checked = Boolean(settings.filterNoNumbers);
  if (settings.sort !== undefined) el.sortSelect.value = settings.sort;
}

function saveState() {
  if (isChecking) return;
  const state = {
    input: el.inputBox.value,
    results: results.filter(Boolean).slice(0, 5000),
    favorites: [...favorites],
    settings: currentSettings()
  };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STATE_KEY);
  if (!saved) {
    updateInputCount();
    renderResults();
    return;
  }
  try {
    const state = JSON.parse(saved);
    if (state.input) el.inputBox.value = state.input;
    applySettings(state.settings || {});
    favorites = new Set(Array.isArray(state.favorites) ? state.favorites : []);
    results = Array.isArray(state.results) ? state.results.map(enhanceResult) : [];
  } catch {
    results = [];
    favorites = new Set();
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

function toggleFavorite(domain) {
  if (!domain) return;
  if (favorites.has(domain)) {
    favorites.delete(domain);
    setStatus(`Removed ${domain} from favorites.`);
  } else {
    favorites.add(domain);
    setStatus(`Added ${domain} to favorites.`);
  }
  results = results.map(enhanceResult);
  renderResults();
  saveState();
}

function clearSession() {
  if (!confirm("Clear saved input, results, filters, and favorites from this browser?")) return;
  localStorage.removeItem(STATE_KEY);
  results = [];
  favorites = new Set();
  el.inputBox.value = "";
  applySettings({
    workers: "2", delay: "250", timeout: "12000", keywords: "", useRdap: true, useDns: true, dedupe: true,
    filterStatus: "all", filterSearch: "", filterTld: "", filterMaxLen: "", filterNoHyphen: false, filterNoNumbers: false, sort: "score_desc"
  });
  updateInputCount();
  renderResults();
  setStatus("Cleared saved session.");
}

function bindEvents() {
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
      "probateforless.com",
      "probate-helper-247.com",
      "easyestatefiling.com"
    ].join("\n");
    el.keywordsInput.value = "probate, estate";
    rescoreResults();
    updateInputCount();
  });

  el.checkBtn.addEventListener("click", runChecks);
  el.stopBtn.addEventListener("click", () => {
    stopRequested = true;
    setStatus("Stopping after current checks finish...");
  });
  el.removeTakenBtn.addEventListener("click", removeTaken);
  el.keepAvailableBtn.addEventListener("click", keepAvailableOnly);
  el.openAllBtn.addEventListener("click", () => openLinks(displayedResults(), "visible"));
  el.openAvailableBtn.addEventListener("click", () => openLinks(results.filter(r => r && r.available === true), "available"));
  el.openFavoritesBtn.addEventListener("click", () => openLinks(results.filter(r => r && favorites.has(r.normalized_domain)), "favorite"));
  el.exportBtn.addEventListener("click", () => exportCsv("all"));
  el.exportFavoritesBtn.addEventListener("click", () => exportCsv("favorites"));
  el.copyAvailableBtn.addEventListener("click", copyAvailable);
  el.copyFavoritesBtn.addEventListener("click", copyFavorites);
  el.copyVisibleBtn.addEventListener("click", copyVisible);
  el.copyLinksBtn.addEventListener("click", copyVisibleLinks);
  el.clearSessionBtn.addEventListener("click", clearSession);

  const filterControls = [
    el.filterStatus, el.filterSearch, el.filterTld, el.filterMaxLen, el.filterNoHyphen, el.filterNoNumbers, el.sortSelect
  ];
  for (const control of filterControls) {
    control.addEventListener("input", () => { renderResults(); saveState(); });
    control.addEventListener("change", () => { renderResults(); saveState(); });
  }

  const optionControls = [el.workersInput, el.delayInput, el.timeoutInput, el.useRdapInput, el.useDnsInput, el.dedupeInput];
  for (const control of optionControls) {
    control.addEventListener("change", saveState);
    control.addEventListener("input", saveState);
  }

  el.keywordsInput.addEventListener("input", () => {
    rescoreResults();
  });

  el.resultsBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-favorite]");
    if (button) toggleFavorite(button.getAttribute("data-favorite"));
  });
}

bindEvents();
loadState();
