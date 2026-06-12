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
const STATE_KEY = "domainCheckerStateV3";

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
  scoringStyleInput: document.getElementById("scoringStyleInput"),
  positiveWordsInput: document.getElementById("positiveWordsInput"),
  negativeWordsInput: document.getElementById("negativeWordsInput"),
  topPickCountInput: document.getElementById("topPickCountInput"),
  showTopPicksBtn: document.getElementById("showTopPicksBtn"),
  copyTopPicksBtn: document.getElementById("copyTopPicksBtn"),
  openTopPicksBtn: document.getElementById("openTopPicksBtn"),
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

const QUALITY_WORDS = [
  // Legal / estate planning category words
  "probate", "estate", "will", "wills", "trust", "trusts", "executor", "executors", "inheritance", "heir", "heirs",
  "court", "filing", "file", "forms", "form", "law", "legal", "attorney", "lawyer", "claim", "assets",
  // Useful domain / product words
  "help", "guide", "guides", "kit", "tool", "tools", "program", "planner", "plan", "plans", "course",
  "service", "services", "support", "assistant", "assist", "coach", "coaching", "academy", "hub", "works",
  "focus", "portal", "online", "pathway", "path", "route", "wizard", "central", "option", "options",
  "checklist", "book", "guidebook", "manual", "template", "templates", "document", "documents",
  // Positioning / audience words
  "diy", "self", "easy", "simple", "my", "own", "your", "do", "done", "quick", "fast", "clear", "smart",
  "pro", "plus", "express", "solution", "solutions", "buddy", "genius", "for", "less",
  "quote", "quotes", "estimate", "estimates", "bright", "fresh", "swift", "pulse"
];

const PRIMARY_INTENT_TERMS = new Map([
  ["help", 15], ["guide", 15], ["guides", 14], ["kit", 14], ["checklist", 14],
  ["forms", 13], ["form", 13], ["tool", 13], ["tools", 13], ["template", 12], ["templates", 12],
  ["program", 11], ["planner", 11], ["course", 10], ["manual", 10], ["book", 10], ["guidebook", 10],
  ["plan", 9], ["plans", 9], ["service", 8], ["services", 8], ["support", 8], ["assistant", 7],
  ["assist", 7], ["coach", 7], ["coaching", 6], ["academy", 5], ["hub", 5], ["works", 5],
  ["focus", 4], ["portal", 4], ["online", 4], ["central", 4], ["option", 3], ["route", 3],
  ["path", 3], ["wizard", 2], ["buddy", 2], ["genius", 1]
]);

const POSITIONING_TERMS = new Map([
  ["diy", 6], ["self", 5], ["easy", 5], ["simple", 5], ["do", 2], ["your", 2], ["own", 2],
  ["my", 3], ["quick", 2], ["clear", 2], ["smart", 2]
]);

const WEAK_OR_HYPE_TERMS = new Map([
  ["solution", 8], ["solutions", 8], ["pathway", 7], ["express", 6], ["plus", 6], ["pro", 6],
  ["247", 14], ["24", 9], ["genius", 6], ["wizard", 5], ["buddy", 5], ["route", 3], ["portal", 3]
]);

function getDelimitedWords(element) {
  if (!element) return [];
  return String(element.value || "")
    .toLowerCase()
    .split(/[,;\n]+/)
    .map(part => part.trim())
    .filter(Boolean)
    .flatMap(part => part.split(/\s+/))
    .map(cleanKeyword)
    .filter(word => word.length >= 2)
    .slice(0, 50);
}

function getPositiveWords() {
  return [...new Set(getDelimitedWords(el.positiveWordsInput))];
}

function getNegativeWords() {
  return [...new Set(getDelimitedWords(el.negativeWordsInput))];
}


let dynamicVocabularyCacheKey = "";
let dynamicVocabularyCache = [];

function getDynamicVocabulary() {
  const inputText = String(el.inputBox?.value || "");
  const resultDomains = results.filter(Boolean).map(r => r.normalized_domain || "").join("\n");
  const key = `${inputText}\n${resultDomains}`;
  if (key === dynamicVocabularyCacheKey) return dynamicVocabularyCache;

  const domainNames = [];
  const seen = new Set();
  const addDomain = raw => {
    const normalized = normalizeDomain(raw);
    const domain = normalized.domain && !normalized.error ? normalized.domain : raw;
    const sld = cleanKeyword(secondLevelName(domain));
    if (sld && sld.length >= 3 && !seen.has(sld)) {
      seen.add(sld);
      domainNames.push(sld);
    }
  };

  inputText.split(/[\s,;]+/).map(cleanToken).filter(Boolean).forEach(addDomain);
  results.filter(Boolean).forEach(r => addDomain(r.normalized_domain || r.input || ""));

  const counts = new Map();
  const addCandidate = (term, domain) => {
    term = cleanKeyword(term);
    if (term.length < 3 || term.length > 14) return;
    if (!/[aeiou]/.test(term) || !/[bcdfghjklmnpqrstvwxyz]/.test(term)) return;
    if (/^(www|com|net|org|the|and|for|with)$/.test(term)) return;
    const set = counts.get(term) || new Set();
    set.add(domain);
    counts.set(term, set);
  };

  for (const name of domainNames) {
    const alphaChunks = name.split(/\d+/).filter(Boolean);
    for (const chunk of alphaChunks) {
      if (chunk.length >= 3 && chunk.length <= 14) addCandidate(chunk, name);
      for (let len = 3; len <= Math.min(12, chunk.length); len++) {
        addCandidate(chunk.slice(0, len), name);
        addCandidate(chunk.slice(-len), name);
      }
    }
  }

  const dynamic = [...counts.entries()]
    .filter(([term, set]) => {
      const minCount = domainNames.length >= 30 ? 3 : 2;
      return set.size >= minCount && term.length >= 4;
    })
    .sort((a, b) => b[1].size - a[1].size || b[0].length - a[0].length)
    .map(([term]) => term)
    .filter((term, index, arr) => {
      // Keep useful repeated niche words, but avoid flooding the tokenizer with overlapping fragments.
      const longerParent = arr.slice(0, index).find(other => other.includes(term) && other.length > term.length + 2);
      return !longerParent;
    })
    .slice(0, 80);

  dynamicVocabularyCacheKey = key;
  dynamicVocabularyCache = dynamic;
  return dynamicVocabularyCache;
}

function isTermMatch(term, tokenSet, sld, options = {}) {
  term = cleanKeyword(term);
  if (!term) return false;
  if (tokenSet && tokenSet.has(term)) return true;
  if (["247", "24"].includes(term)) return sld.includes(term);

  const allowSubstring = options.allowSubstring !== false;
  if (!allowSubstring) return false;

  // Avoid false positives like “pro” inside “probate”, “app” inside “happy”,
  // or “ai” inside unrelated words. Short terms only match exact tokens
  // unless they are common product suffixes/prefixes.
  if (term.length <= 3) {
    if (term === "pro" || term === "plus") return sld.endsWith(term);
    if (["ai", "app", "crm", "seo"].includes(term)) return sld === term || sld.startsWith(term) || sld.endsWith(term);
    return sld === term;
  }
  if (term.length === 4) {
    return sld === term || sld.startsWith(term) || sld.endsWith(term);
  }
  return sld.includes(term);
}

function pronounceabilityScore(sld) {
  if (!sld) return 0;
  const letters = sld.replace(/[^a-z]/g, "");
  if (!letters) return 0;

  const vowelCount = (letters.match(/[aeiou]/g) || []).length;
  const vowelLikeCount = (letters.match(/[aeiouy]/g) || []).length;
  if (letters.length >= 5 && vowelLikeCount === 0) return 12;

  const ratio = vowelCount / letters.length;
  let score = 70;
  if (ratio >= 0.28 && ratio <= 0.62) score += 15;
  else if (ratio < 0.18 || ratio > 0.72) score -= 24;
  else if (ratio < 0.24) score -= 12;

  const clusterLetters = letters
    .replace(/ght/g, "t")
    .replace(/(ch|sh|th|ph|ck|qu)/g, "a");
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(clusterLetters)) score -= 30;
  else if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(clusterLetters)) score -= 18;
  if (/[aeiou]{4,}/.test(letters)) score -= 10;
  if (/(q[^u]|zx|xq|qz|vv|ww|yy|jz|zj)/.test(letters)) score -= 18;
  if (/(.)\1\1/.test(letters)) score -= 12;
  return Math.max(0, Math.min(100, score));
}

function isBrandableCandidate(sldRaw, sld, len, coverage, knownTokens = [], targetKeywords = [], keywordOptional = false, profile = null) {
  if (len < 5 || len > 12) return false;
  if (sldRaw.includes("-") || /\d/.test(sld)) return false;
  if (!/[aeiou]/.test(sld)) return false;
  if (/(wizard|genius|guru|ninja|hack|cheap|247)/.test(sld)) return false;

  const pronounce = pronounceabilityScore(sld);
  const tokenSet = new Set(knownTokens);
  const targetHits = targetKeywords.filter(k => k && isTermMatch(k, tokenSet, sld));
  const brandableHits = tokenListHits(BRANDABLE_SIGNAL_WORDS, tokenSet, sld);
  const categoryHits = tokenListHits(CATEGORY_LOCK_WORDS, tokenSet, sld);
  const fillerHits = tokenListHits(GENERIC_LOW_SIGNAL_WORDS, tokenSet, sld);
  const utilityHits = tokenListHits(STRONG_INTENT_WORDS, tokenSet, sld);
  const clearBrandableCompound = knownTokens.length >= 2 && brandableHits.length >= 2 && pronounce >= 40;
  if (pronounce < 68 && !clearBrandableCompound) return false;

  if (targetKeywords.length && !keywordOptional) {
    if (!targetHits.length) return false;
    // Do not let “brandable” tolerance rescue keyword + weak-suffix phrases.
    // Exact/near-exact keyword domains can still qualify; multi-token keyword names
    // should earn their score through phrase quality instead.
    if (knownTokens.length > 1) return false;
  }

  // Multi-token category names (probate forms, roof repair, tax calculator) can be great domains,
  // but they are descriptive phrases rather than brandables unless they include SaaS/brand signals.
  if (knownTokens.length >= 2) {
    if (brandableHits.length) return true;
    if (categoryHits.length || utilityHits.length || fillerHits.length) return false;
  }

  if (knownTokens.length === 1 && categoryHits.length && !brandableHits.length) {
    return false;
  }

  return coverage <= 0.7 || knownTokens.length <= 1 || brandableHits.length > 0;
}

const GENERIC_DOMAIN_WORDS = [
  "app", "apps", "ai", "data", "cloud", "sync", "flow", "desk", "crm", "sales", "lead", "leads", "client", "clients",
  "marketing", "market", "seo", "ads", "media", "brand", "brands", "studio", "agency", "lab", "labs", "stack", "base",
  "bright", "fresh", "swift", "pulse", "spark", "forge", "pilot", "grid", "vault", "logic", "signal", "metric",
  "local", "near", "city", "home", "house", "roof", "lawn", "clean", "cleaning", "repair", "plumbing", "electric", "hvac",
  "care", "health", "fitness", "wellness", "doctor", "dental", "pet", "pets", "food", "coffee", "shop", "store", "supply",
  "supplies", "gear", "goods", "box", "club", "direct", "delivery", "buy", "sell", "deals", "discount", "review", "reviews",
  "compare", "best", "top", "rank", "finder", "find", "search", "now", "today", "hq", "go", "get", "try", "use", "join",
  "learn", "school", "class", "classes", "course", "courses", "academy", "training", "lesson", "lessons", "blueprint", "playbook",
  "quote", "quotes", "estimate", "estimates", "calculator", "builder", "generator", "tracker", "manager", "software", "booking",
  "scheduler", "directory", "marketplace", "newsletter", "community", "forum", "tips", "ideas", "recipes", "meal", "meals", "travel",
  "trip", "trips", "budget", "money", "tax", "taxes", "loan", "loans", "insurance", "realty", "rent", "rental", "rentals"
];

const DEFAULT_POSITIVE_TERMS = new Map([
  ["help", 9], ["guide", 9], ["kit", 8], ["tool", 8], ["tools", 8], ["app", 8], ["forms", 8], ["form", 7],
  ["planner", 7], ["checklist", 7], ["template", 7], ["templates", 7], ["course", 6], ["academy", 5],
  ["service", 6], ["services", 6], ["shop", 6], ["store", 6], ["supply", 5], ["finder", 6], ["compare", 5],
  ["reviews", 5], ["direct", 2], ["quote", 7], ["quotes", 7], ["estimate", 7], ["estimates", 7],
  // Soft modifiers can help positioning, but they are not true buyer-intent by themselves.
  ["simple", 2], ["easy", 1], ["clear", 2], ["smart", 1]
]);

const DEFAULT_NEGATIVE_TERMS = new Map([
  ["247", 13], ["24", 8], ["guru", 8], ["genius", 7], ["wizard", 7], ["ninja", 8], ["hack", 8],
  ["hacks", 8], ["buddy", 5], ["plus", 5], ["pro", 5], ["express", 5], ["solution", 5], ["solutions", 5],
  ["pathway", 5], ["route", 3], ["portal", 3], ["online", 2], ["best", 4], ["top", 3], ["cheap", 9]
]);

// Rating calibration helpers. These are intentionally general-purpose, not niche-specific.
// They make the quality score care more about phrase usefulness and less about one lucky keyword match.
const HIGH_INTENT_WORDS = new Set([
  "help", "guide", "guides", "kit", "tool", "tools", "app", "forms", "form", "planner", "checklist",
  "template", "templates", "course", "courses", "academy", "service", "services", "shop", "store",
  "supply", "supplies", "finder", "compare", "reviews", "review", "repair", "quote", "estimate",
  "calculator", "builder", "generator", "tracker", "manager", "software", "quote", "quotes", "estimate", "estimates"
]);

const LOW_VALUE_FILLER_WORDS = new Set([
  "solution", "solutions", "pathway", "route", "portal", "online", "central", "hub", "works",
  "focus", "option", "options", "pro", "plus", "express", "buddy", "genius", "wizard",
  "best", "top", "now", "today", "go", "get", "try", "use", "hq", "247", "24"
]);

const SOFT_MODIFIER_WORDS = new Set([
  "easy", "simple", "smart", "clear", "quick", "fast", "my", "your", "self", "diy", "local", "direct",
  "guided", "start", "starter", "done", "own", "do"
]);


// Rating v3: general-purpose quality signals. These do not add new workflow controls;
// they only make the existing score more calibrated, explainable, and transferable across niches.
const STRONG_INTENT_WORDS = new Set([
  "app", "tool", "tools", "software", "calculator", "builder", "generator", "tracker", "manager",
  "platform", "crm", "dashboard", "templates", "template", "forms", "form", "checklist", "kit",
  "guide", "course", "academy", "training", "lessons", "playbook", "blueprint", "quote", "quotes", "estimate", "estimates",
  "repair", "service", "services", "shop", "store", "supply", "supplies", "finder", "compare",
  "reviews", "review", "directory", "marketplace", "booking", "scheduler"
]);

const GENERIC_LOW_SIGNAL_WORDS = new Set([
  "hub", "portal", "central", "online", "works", "focus", "option", "options", "path", "route",
  "pathway", "solution", "solutions", "plus", "pro", "express", "buddy", "genius", "wizard",
  "best", "top", "now", "today", "go", "get", "try", "use", "hq", "world", "zone", "spot"
]);

const TRUST_RISK_WORDS = new Set([
  "cheap", "hack", "hacks", "guru", "ninja", "wizard", "genius", "247", "24", "guaranteed", "instant"
]);

const CTA_PREFIXES = new Set(["get", "go", "try", "use", "join", "my", "your", "the", "we"]);
const WEAK_SUFFIXES = new Set(["online", "hub", "portal", "hq", "pro", "plus", "world", "zone", "spot", "central"]);

// Rating v4 naturalness calibration. These constants keep 90+ scores rare by checking
// whether the words form a natural, single-purpose phrase instead of just a pile of good tokens.
const CORE_INTENT_WORDS = new Set([
  "help", "guide", "guides", "kit", "tool", "tools", "app", "forms", "form", "planner", "checklist",
  "template", "templates", "course", "courses", "academy", "service", "services", "shop", "store",
  "supply", "supplies", "finder", "compare", "reviews", "review", "repair", "quote", "quotes",
  "estimate", "estimates", "calculator", "builder", "generator", "tracker", "manager", "software",
  "booking", "scheduler", "directory", "marketplace"
]);

const STACKABLE_INTENT_PAIRS = new Set([
  "repair+quote", "quote+repair", "repair+estimate", "estimate+repair",
  "service+quote", "quote+service", "service+estimate", "estimate+service",
  "booking+scheduler", "scheduler+booking"
]);

const AWKWARD_ACTION_PREFIXES = new Set(["close", "start", "done", "guided", "guide", "file"]);
const WEAK_POSITIONING_WORDS = new Set(["easy", "simple", "quick", "fast", "smart", "clear", "guided", "start", "starter", "done", "my", "your", "own", "do"]);
const PROFESSIONAL_RISK_WORDS = new Set(["law", "legal", "lawyer", "attorney", "doctor", "medical", "tax", "loan", "insurance"]);
const SENSITIVE_CATEGORY_WORDS = new Set(["probate", "estate", "will", "wills", "trust", "trusts", "legal", "law", "lawyer", "attorney", "tax", "loan", "insurance", "medical", "doctor", "health"]);

const BRANDABLE_SIGNAL_WORDS = new Set([
  "app", "apps", "ai", "data", "cloud", "sync", "flow", "desk", "crm", "sales", "lead", "leads", "client", "clients",
  "marketing", "market", "seo", "ads", "media", "brand", "brands", "studio", "agency", "lab", "labs", "stack", "base",
  "software", "platform", "dashboard", "bright", "fresh", "swift", "pulse", "spark", "forge", "pilot", "grid", "vault",
  "logic", "signal", "metric"
]);

const CATEGORY_LOCK_WORDS = new Set([
  "probate", "estate", "will", "wills", "trust", "trusts", "executor", "executors", "inheritance", "heir", "heirs",
  "court", "filing", "file", "forms", "form", "law", "legal", "attorney", "lawyer", "claim", "claims", "assets",
  "home", "house", "roof", "lawn", "cleaning", "repair", "plumbing", "electric", "hvac", "care", "health", "doctor",
  "dental", "tax", "taxes", "loan", "loans", "insurance", "realty", "rent", "rental", "rentals", "quote", "quotes",
  "estimate", "estimates"
]);


function tokenHitCount(words, tokenSet, sld) {
  let hits = 0;
  for (const word of words) if (isTermMatch(word, tokenSet, sld)) hits += 1;
  return hits;
}

function tokenListHits(words, tokenSet, sld) {
  return dedupeTermHits([...words].filter(word => isTermMatch(word, tokenSet, sld)));
}

function dedupeTermHits(hits) {
  const cleaned = [...new Set(hits.map(cleanKeyword).filter(Boolean))];
  const hitSet = new Set(cleaned);
  return cleaned.filter(key => {
    if (key === "24" && hitSet.has("247")) return false;
    if (key.length > 3 && hitSet.has(`${key}s`)) return false;
    if (key.endsWith("s") && key.length > 4 && hitSet.has(key.slice(0, -1))) return true;

    // Prefer a supplied phrase or compound keyword over its component words in explanations/penalties.
    // Example: with target keyword "roof repair", show "roofrepair" rather than "roofrepair + roof".
    if (key.length >= 3) {
      const longerParent = cleaned.find(other =>
        other !== key &&
        other.length >= key.length + 3 &&
        other.includes(key)
      );
      if (longerParent) return false;
    }
    return true;
  });
}

const SCORING_PROFILES = {
  general: {
    label: "General",
    weights: { tld: 12, length: 18, keyword: 22, clarity: 16, brand: 16, intent: 10, fit: 6 },
    positives: {}, negatives: {},
    strictTrust: false,
    keywordOptional: false
  },
  trust: {
    label: "Trust-heavy",
    weights: { tld: 13, length: 16, keyword: 22, clarity: 18, brand: 13, intent: 10, fit: 8 },
    positives: { guide: 3, help: 3, forms: 3, planner: 2, service: 2, services: 2, clear: 2, simple: 2 },
    negatives: { wizard: 8, genius: 8, guru: 8, ninja: 8, hack: 8, cheap: 7, express: 4, 247: 8, buddy: 4 },
    strictTrust: true,
    keywordOptional: false
  },
  brandable: {
    label: "Brandable / SaaS",
    weights: { tld: 12, length: 22, keyword: 14, clarity: 14, brand: 22, intent: 8, fit: 8 },
    positives: { app: 4, ai: 3, data: 3, cloud: 3, flow: 3, base: 2, stack: 2, lab: 2, labs: 2 },
    negatives: { services: 5, service: 4, solutions: 8, solution: 8, online: 4, express: 4, 247: 8 },
    strictTrust: false,
    keywordOptional: true
  },
  local: {
    label: "Local service",
    weights: { tld: 12, length: 14, keyword: 24, clarity: 18, brand: 12, intent: 12, fit: 8 },
    positives: { local: 4, near: 3, service: 4, services: 4, repair: 4, home: 3, care: 3, clean: 3, cleaning: 3 },
    negatives: { app: 2, ai: 2, wizard: 5, genius: 5, 247: 5, solutions: 3 },
    strictTrust: false,
    keywordOptional: false
  },
  ecommerce: {
    label: "Ecommerce / product",
    weights: { tld: 12, length: 17, keyword: 22, clarity: 15, brand: 16, intent: 12, fit: 6 },
    positives: { shop: 5, store: 5, supply: 4, supplies: 4, gear: 4, goods: 3, direct: 3, deals: 2 },
    negatives: { services: 4, service: 3, solution: 5, solutions: 5, wizard: 4, 247: 4 },
    strictTrust: false,
    keywordOptional: false
  },
  content: {
    label: "Course / content",
    weights: { tld: 11, length: 15, keyword: 23, clarity: 17, brand: 13, intent: 14, fit: 7 },
    positives: { guide: 5, course: 5, courses: 5, academy: 4, learn: 4, kit: 4, checklist: 4, blueprint: 4, playbook: 4, training: 4 },
    negatives: { solutions: 5, solution: 5, portal: 3, 247: 5, wizard: 3 },
    strictTrust: false,
    keywordOptional: false
  }
};

function getScoringProfile() {
  const key = el.scoringStyleInput?.value || "general";
  return SCORING_PROFILES[key] || SCORING_PROFILES.general;
}

function scoreDomain(resultOrDomain, availableValue, statusValue) {
  const domain = typeof resultOrDomain === "string" ? resultOrDomain : resultOrDomain.normalized_domain;
  const status = typeof resultOrDomain === "string" ? statusValue : resultOrDomain.availability_status;
  const targetKeywords = getKeywords();
  const positiveWords = getPositiveWords();
  const negativeWords = getNegativeWords();
  const profile = getScoringProfile();

  if (!domain || status === "invalid_input") {
    return scoreResult(0, "Invalid", "No valid domain to score.", {}, "No valid domain.");
  }

  const sldRaw = secondLevelName(domain).toLowerCase();
  const sld = sldRaw.replace(/[^a-z0-9]/g, "");
  const suffix = effectiveSuffix(domain);
  const len = sld.length;
  const tokens = tokenizeDomainName(sldRaw, targetKeywords, positiveWords, negativeWords);
  const knownTokens = tokens.filter(t => !t.unknown).map(t => t.text);
  const unknownChars = tokens.filter(t => t.unknown).reduce((sum, t) => sum + t.text.length, 0);
  const coverage = len ? Math.max(0, Math.min(1, (len - unknownChars) / len)) : 0;
  const tokenSet = new Set(knownTokens);
  const brandableCandidate = isBrandableCandidate(sldRaw, sld, len, coverage, knownTokens, targetKeywords, profile.keywordOptional, profile);

  const components = {
    tld: weightedScore(rawTldScore(suffix), profile.weights.tld),
    length: weightedScore(rawLengthScore(len), profile.weights.length),
    keyword: weightedScore(rawKeywordScore(sld, targetKeywords, profile.keywordOptional, tokenSet), profile.weights.keyword),
    clarity: weightedScore(rawClarityScore(sld, sldRaw, knownTokens, coverage, targetKeywords, brandableCandidate), profile.weights.clarity),
    brand: weightedScore(rawBrandScore(sldRaw, sld, len, brandableCandidate), profile.weights.brand),
    intent: weightedScore(rawIntentScore(tokenSet, sld, positiveWords, profile), profile.weights.intent),
    fit: weightedScore(rawStyleFitScore(tokenSet, sld, profile), profile.weights.fit)
  };

  const strengths = [];
  const issues = [];
  const tweaks = [];

  addStrengthsAndIssues({ suffix, len, targetKeywords, sld, sldRaw, knownTokens, coverage, tokenSet, components, strengths, issues, profile, brandableCandidate });

  let score = Object.values(components).reduce((sum, value) => sum + value, 0);
  const phraseFit = analyzeRatingFit({
    sldRaw, sld, knownTokens, coverage, targetKeywords, positiveWords, negativeWords,
    profile, components, brandableCandidate, tokenSet
  });
  score += phraseFit.adjustment;
  strengths.push(...phraseFit.strengths);
  issues.push(...phraseFit.issues);

  const penalty = scorePenaltyDetails({ sldRaw, sld, knownTokens, coverage, targetKeywords, positiveWords, negativeWords, profile, issues, tweaks, brandableCandidate });
  score -= penalty.total;

  const calibration = calibrateRatingScore({
    rawScore: score, sldRaw, sld, len, coverage, targetKeywords, components, profile,
    brandableCandidate, tokenSet, phraseFit, penalty
  });
  score += calibration.adjustment;
  strengths.push(...calibration.strengths);
  issues.push(...calibration.issues);

  const capInfo = scoreCaps({ suffix, sldRaw, sld, len, coverage, targetKeywords, components, profile, brandableCandidate, tokenSet, phraseFit, knownTokens });
  if (capInfo.reasons.length) issues.push(...capInfo.reasons);

  const finalScore = Math.max(0, Math.min(capInfo.cap, Math.round(score)));
  const label = scoreLabel(finalScore);
  const explanation = buildScoreExplanation(finalScore, label, strengths, issues);
  const notes = [
    `${profile.label} scoring; availability is separate`,
    `TLD ${components.tld}/${profile.weights.tld}`,
    `length ${components.length}/${profile.weights.length}`,
    targetKeywords.length ? `keyword fit ${components.keyword}/${profile.weights.keyword}` : `keyword fit ${components.keyword}/${profile.weights.keyword}; add target keywords for better ranking`,
    `clarity ${components.clarity}/${profile.weights.clarity}`,
    `brand ${components.brand}/${profile.weights.brand}`,
    `intent ${components.intent}/${profile.weights.intent}`,
    `style fit ${components.fit}/${profile.weights.fit}`,
    phraseFit.notes.join(", "),
    phraseFit.strengths.length ? `phrase strengths: ${phraseFit.strengths.slice(0, 3).join(", ")}` : "no extra phrase-strength boost",
    phraseFit.issues.length ? `phrase tradeoffs: ${phraseFit.issues.slice(0, 3).join(", ")}` : "no extra phrase tradeoffs",
    calibration.notes.join(", "),
    calibration.strengths.length ? `calibration strengths: ${calibration.strengths.slice(0, 2).join(", ")}` : "no calibration boost",
    calibration.issues.length ? `calibration tradeoffs: ${calibration.issues.slice(0, 2).join(", ")}` : "no calibration penalty",
    brandableCandidate ? "brandable tolerance applied" : "standard readability rules",
    penalty.total ? `penalties -${penalty.total}: ${penalty.reasons.join(", ")}` : "no major penalties",
    capInfo.reasons.length ? `caps: ${capInfo.reasons.join(", ")}` : "no score caps",
    scoreBand(finalScore)
  ].join("; ");

  return {
    score: finalScore,
    label,
    explanation,
    notes,
    components,
    strengths,
    issues,
    style: profile.label
  };
}

function scoreResult(score, label, explanation, components, notes) {
  return { score, label, explanation, components, notes, strengths: [], issues: [], style: getScoringProfile().label };
}

function weightedScore(raw0to100, weight) {
  return Math.round(Math.max(0, Math.min(100, raw0to100)) * weight / 100);
}

function rawTldScore(suffix) {
  if (suffix === "com") return 100;
  if (["org", "net"].includes(suffix)) return 72;
  if (["co", "io", "ai", "app", "dev"].includes(suffix)) return 60;
  if (["legal", "law", "finance", "shop", "store"].includes(suffix)) return 55;
  if (String(suffix || "").includes(".")) return 45;
  return 30;
}

function rawLengthScore(len) {
  if (len <= 0) return 0;
  if (len <= 3) return 35;
  if (len <= 5) return 65;
  if (len <= 8) return 94;
  if (len <= 11) return 100;
  if (len <= 13) return 92;
  if (len <= 15) return 82;
  if (len <= 17) return 66;
  if (len <= 19) return 48;
  if (len <= 22) return 28;
  return 10;
}

function rawKeywordScore(sld, targetKeywords, keywordOptional, tokenSet = new Set()) {
  if (!targetKeywords.length) return keywordOptional ? 68 : 48;
  let best = 0;
  let count = 0;
  let exactOrTokenCount = 0;

  for (const keyword of targetKeywords) {
    if (!keyword) continue;
    const tokenHit = tokenSet.has(keyword);
    const exact = sld === keyword;
    const edge = sld.startsWith(keyword) || sld.endsWith(keyword);
    const contains = keyword.length >= 4 && sld.includes(keyword);
    if (!(tokenHit || edge || contains || exact)) continue;

    let candidate = 0;
    const extraChars = Math.max(0, sld.length - keyword.length);
    const keywordShare = keyword.length / Math.max(keyword.length, sld.length || 1);

    if (exact) candidate = 100;
    else if (tokenHit) candidate = 92;
    else if (edge) candidate = 84;
    else candidate = 72;

    // A keyword buried inside a long phrase is still relevant, but it should not score like a clean phrase.
    if (!exact && extraChars > 10) candidate -= Math.min(14, Math.ceil((extraChars - 10) * 1.4));
    if (!exact && keywordShare < 0.35) candidate -= 6;
    if (tokenHit || exact) exactOrTokenCount += 1;
    count += 1;
    best = Math.max(best, candidate);
  }

  if (count >= 2) best = Math.min(100, best + 5);
  if (exactOrTokenCount >= 2) best = Math.min(100, best + 3);
  return Math.max(0, Math.min(100, best));
}

function rawClarityScore(sld, sldRaw, knownTokens, coverage, targetKeywords, brandableCandidate) {
  let score = 0;
  if (coverage >= 0.95) score += 44;
  else if (coverage >= 0.8) score += 36;
  else if (coverage >= 0.65) score += 27;
  else if (coverage >= 0.5) score += 17;
  else score += brandableCandidate ? 18 : 6;

  const tokenCount = knownTokens.length;
  if (tokenCount >= 2 && tokenCount <= 3) score += 31;
  else if (tokenCount === 1 || tokenCount === 4) score += 20;
  else if (tokenCount === 5) score += 10;
  else if (brandableCandidate) score += 18;

  const firstKeywordIndex = knownTokens.findIndex(t => targetKeywords.includes(t));
  if (firstKeywordIndex === 0) score += 12;
  else if (firstKeywordIndex > 0 && firstKeywordIndex <= 2) score += 7;

  if (/^[a-z0-9]+$/.test(sld)) score += 7;
  if (brandableCandidate) score += 13;
  if ((sldRaw.match(/-/g) || []).length > 1) score -= 10;
  if (/(.)\1\1/.test(sld)) score -= 8;
  return Math.max(0, Math.min(100, score));
}

function rawBrandScore(sldRaw, sld, len, brandableCandidate) {
  let score = 38;
  if (!sldRaw.includes("-")) score += 14;
  if (!/\d/.test(sld)) score += 14;
  const pronounce = pronounceabilityScore(sld);
  score += Math.round(pronounce * 0.22);
  if (len >= 6 && len <= 12) score += 12;
  else if (len >= 13 && len <= 15) score += 5;
  if (brandableCandidate) score += 12;
  if (pronounce < 45) score -= 18;
  if (len > 18) score -= 13;
  if (/(best|top|cheap|247|guru|ninja|hack)/.test(sld)) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function rawIntentScore(tokenSet, sld, positiveWords, profile) {
  const hits = [];
  for (const [term, points] of DEFAULT_POSITIVE_TERMS.entries()) {
    if (!isTermMatch(term, tokenSet, sld)) continue;
    const softMultiplier = SOFT_MODIFIER_WORDS.has(term) ? 6 : 10;
    hits.push(Math.min(100, points * softMultiplier));
  }
  for (const [term, points] of Object.entries(profile.positives || {})) {
    if (isTermMatch(term, tokenSet, sld)) hits.push(Math.min(100, 55 + points * 9));
  }
  for (const word of positiveWords) {
    if (word && isTermMatch(word, tokenSet, sld)) hits.push(95);
  }
  if (!hits.length) return 0;
  hits.sort((a, b) => b - a);
  // Use the best intent term, with a small boost for a second complementary intent term.
  return Math.max(0, Math.min(100, hits[0] + Math.round((hits[1] || 0) * 0.18)));
}

function rawStyleFitScore(tokenSet, sld, profile) {
  let score = 56;
  const positiveHits = dedupeTermHits(Object.keys(profile.positives || {}).filter(term => isTermMatch(term, tokenSet, sld)));
  const negativeHits = dedupeTermHits(Object.keys(profile.negatives || {}).filter(term => isTermMatch(term, tokenSet, sld)));

  for (const term of positiveHits) score += (profile.positives || {})[term] * 6;
  for (const term of negativeHits) score -= (profile.negatives || {})[term] * 4;

  if (profile.label === "Brandable / SaaS") {
    const brandableHits = tokenListHits(BRANDABLE_SIGNAL_WORDS, tokenSet, sld);
    const categoryHits = tokenListHits(CATEGORY_LOCK_WORDS, tokenSet, sld);
    if (brandableHits.length >= 2) score += 8;
    else if (!brandableHits.length && categoryHits.length) score -= 16;
  }

  if (profile.strictTrust) {
    if (["trust", "clear", "simple", "guide", "help", "forms", "service", "planner"].some(t => isTermMatch(t, tokenSet, sld))) score += 12;
    if (["wizard", "genius", "guru", "ninja", "hack", "cheap", "247"].some(t => isTermMatch(t, tokenSet, sld))) score -= 20;
  }
  return Math.max(0, Math.min(100, score));
}

function analyzeRatingFit(ctx) {
  const {
    sldRaw, sld, knownTokens, coverage, targetKeywords, positiveWords, negativeWords,
    profile, components, brandableCandidate, tokenSet
  } = ctx;
  const strengths = [];
  const issues = [];
  const notes = [];
  let adjustment = 0;

  const tokens = knownTokens.filter(Boolean);
  const uniqueTokens = [...new Set(tokens)];
  const targetHits = dedupeTermHits(targetKeywords.filter(k => k && isTermMatch(k, tokenSet, sld)));
  const customPositiveHits = dedupeTermHits(positiveWords.filter(w => w && isTermMatch(w, tokenSet, sld)));
  const customNegativeHits = dedupeTermHits(negativeWords.filter(w => w && isTermMatch(w, tokenSet, sld)));
  const intentHits = dedupeTermHits(uniqueTokens.filter(t => {
    if (SOFT_MODIFIER_WORDS.has(t)) return false;
    return CORE_INTENT_WORDS.has(t) || STRONG_INTENT_WORDS.has(t) || HIGH_INTENT_WORDS.has(t) || Object.prototype.hasOwnProperty.call(profile.positives || {}, t);
  }));
  const fillerHits = dedupeTermHits(uniqueTokens.filter(t => GENERIC_LOW_SIGNAL_WORDS.has(t) || LOW_VALUE_FILLER_WORDS.has(t) || DEFAULT_NEGATIVE_TERMS.has(t) || Object.prototype.hasOwnProperty.call(profile.negatives || {}, t)));
  const modifierHits = uniqueTokens.filter(t => SOFT_MODIFIER_WORDS.has(t));
  const trustRiskHits = tokenListHits(TRUST_RISK_WORDS, tokenSet, sld);

  const tokenCount = tokens.length;
  const duplicateCount = tokenCount - uniqueTokens.length;
  const keywordPresent = targetKeywords.length ? targetHits.length > 0 : true;
  const exactTargetName = targetKeywords.some(k => k && cleanKeyword(k) === sld);
  const strongIntentPresent = intentHits.length > 0 || customPositiveHits.length > 0;
  const hasOnlySoftModifiers = tokenCount > 1 && !strongIntentPresent && modifierHits.length >= 1 && fillerHits.length === 0;
  const firstToken = tokens[0] || "";
  const lastToken = tokens[tokens.length - 1] || "";
  const firstIsIntent = intentHits.includes(firstToken);
  const lastIsSoftModifier = SOFT_MODIFIER_WORDS.has(lastToken);
  const keywordIndex = tokens.findIndex(t => targetHits.includes(t));
  const firstIntentBeforeKeyword = firstIsIntent && keywordIndex > 0;
  const unclearIntentStack = hasUnclearIntentStack(intentHits);
  const naturalIntentPhrase = !lastIsSoftModifier && !firstIntentBeforeKeyword && !unclearIntentStack;

  if (exactTargetName) {
    adjustment += 8;
    strengths.push("exact target keyword");
  }

  // Reward domains that form a clean, useful phrase instead of only containing a keyword.
  if (keywordPresent && strongIntentPresent && naturalIntentPhrase && tokenCount >= 2 && tokenCount <= 3 && coverage >= 0.75) {
    adjustment += 5;
    strengths.push("clean keyword + intent phrase");
  } else if (keywordPresent && strongIntentPresent && naturalIntentPhrase && tokenCount <= 4 && coverage >= 0.65) {
    adjustment += 3;
    strengths.push("useful keyword phrase");
  } else if (keywordPresent && strongIntentPresent && !naturalIntentPhrase) {
    adjustment -= 3;
    issues.push("useful words but weaker phrase order");
  }

  if (!targetKeywords.length && brandableCandidate && components.brand >= Math.round(profile.weights.brand * 0.78)) {
    adjustment += 5;
    strengths.push("strong short brandable pattern");
  }

  if (coverage >= 0.9 && tokenCount >= 2 && tokenCount <= 3 && !fillerHits.length) {
    adjustment += 4;
    strengths.push("clear two-to-three word structure");
  }

  if (customPositiveHits.length) {
    adjustment += Math.min(6, customPositiveHits.length * 3);
    strengths.push(`matches custom positive word${customPositiveHits.length > 1 ? "s" : ""}`);
  }

  // Penalize names that are technically readable but not actually useful or memorable.
  if (targetKeywords.length && targetHits.length && !strongIntentPresent && !brandableCandidate && tokenCount >= 2) {
    adjustment -= 5;
    issues.push("keyword present but weak supporting word");
  }

  if (hasOnlySoftModifiers && targetKeywords.length) {
    adjustment -= 3;
    issues.push("modifier word without clear buyer intent");
  }

  if (lastIsSoftModifier && tokenCount >= 2 && !brandableCandidate) {
    adjustment -= 5;
    issues.push("soft modifier at the end reads less natural");
  }

  if (firstIntentBeforeKeyword && !brandableCandidate) {
    adjustment -= 5;
    issues.push("intent word before keyword reads backward");
  }

  if (unclearIntentStack && !brandableCandidate) {
    adjustment -= 5;
    issues.push("stacked utility words reduce clarity");
  }

  if (fillerHits.length >= 2) {
    adjustment -= 7;
    issues.push(`multiple low-value words: ${fillerHits.slice(0, 2).join(", ")}`);
  } else if (fillerHits.length === 1 && !strongIntentPresent) {
    adjustment -= 4;
    issues.push(`low-value word: ${fillerHits[0]}`);
  }

  if (trustRiskHits.length) {
    adjustment -= Math.min(profile.strictTrust ? 8 : 5, trustRiskHits.length * 4);
    issues.push(`trust-risk word: ${trustRiskHits.slice(0, 2).join(", ")}`);
  }

  if (customNegativeHits.length) {
    adjustment -= Math.min(9, customNegativeHits.length * 4);
    issues.push(`matches custom negative word${customNegativeHits.length > 1 ? "s" : ""}`);
  }

  if (duplicateCount > 0) {
    adjustment -= Math.min(6, duplicateCount * 3);
    issues.push("repeated word pattern");
  }

  const extraChars = lenWithoutTarget(sld, targetKeywords);
  if (targetKeywords.length && extraChars > 14 && !strongIntentPresent) {
    adjustment -= 5;
    issues.push("too much extra wording beyond keyword");
  }

  if (coverage < 0.55 && !brandableCandidate) {
    adjustment -= 4;
    issues.push("low word-recognition confidence");
  }

  if (sld.length >= 6 && sld.length <= 12 && /^[a-z]+$/.test(sld) && pronounceabilityScore(sld) >= 78 && !fillerHits.length) {
    adjustment += 3;
    strengths.push("memorable length and sound");
  }

  const architecture = analyzePhraseArchitecture({
    sldRaw, sld, tokens, uniqueTokens, targetKeywords, targetHits, intentHits,
    fillerHits, modifierHits, customPositiveHits, customNegativeHits,
    coverage, brandableCandidate, profile, tokenSet
  });
  adjustment += architecture.adjustment;
  strengths.push(...architecture.strengths);
  issues.push(...architecture.issues);
  notes.push(...architecture.notes);

  notes.push(`phrase adjustment ${adjustment >= 0 ? "+" : ""}${adjustment}`);
  return {
    adjustment,
    strengths,
    issues,
    notes,
    targetHits,
    intentHits,
    fillerHits,
    customPositiveHits,
    customNegativeHits,
    architecture
  };
}

function hasUnclearIntentStack(intentHits = []) {
  const hits = dedupeTermHits(intentHits).filter(Boolean);
  if (hits.length < 2) return false;
  for (let i = 0; i < hits.length; i++) {
    for (let j = i + 1; j < hits.length; j++) {
      if (STACKABLE_INTENT_PAIRS.has(`${hits[i]}+${hits[j]}`)) return false;
    }
  }
  return true;
}

function tokenIndex(tokens, hits) {
  return tokens.findIndex(t => hits.includes(t));
}

function analyzePhraseArchitecture(ctx) {
  const {
    sld, tokens, uniqueTokens, targetKeywords, targetHits, intentHits,
    fillerHits, modifierHits, customPositiveHits, coverage, brandableCandidate, profile, tokenSet
  } = ctx;
  const strengths = [];
  const issues = [];
  const notes = [];
  let adjustment = 0;

  const tokenCount = tokens.length;
  const hasKeyword = targetKeywords.length ? targetHits.length > 0 : false;
  const hasIntent = intentHits.length > 0 || customPositiveHits.length > 0;
  const hasFiller = fillerHits.length > 0;
  const first = tokens[0] || uniqueTokens[0] || "";
  const last = tokens[tokens.length - 1] || uniqueTokens[uniqueTokens.length - 1] || "";
  const firstIsCTA = CTA_PREFIXES.has(first);
  const lastIsWeak = WEAK_SUFFIXES.has(last);
  const lastIsSoftModifier = SOFT_MODIFIER_WORDS.has(last);
  const firstIsAwkwardAction = AWKWARD_ACTION_PREFIXES.has(first);
  const coreIntentHits = dedupeTermHits(uniqueTokens.filter(t => CORE_INTENT_WORDS.has(t)));
  const keywordIndex = tokenIndex(tokens, targetHits);
  const intentIndex = tokenIndex(tokens, coreIntentHits.length ? coreIntentHits : intentHits);
  const firstIntentBeforeKeyword = intentIndex === 0 && keywordIndex > 0;
  const unclearIntentStack = hasUnclearIntentStack(coreIntentHits);
  const middleTokens = tokens.slice(1, -1);
  const middleIsSoftOnly = middleTokens.length && middleTokens.every(t => SOFT_MODIFIER_WORDS.has(t));
  const naturalOrder = !lastIsSoftModifier && !firstIntentBeforeKeyword && !unclearIntentStack && !firstIsAwkwardAction;

  // Strong domains usually have one of these shapes:
  //   keyword + intent        (roofrepair, probateforms)
  //   modifier + keyword + intent (easymealplanner, diyestatekit)
  //   short brandable         (clean, pronounceable, low friction)
  if (tokenCount === 2 && hasKeyword && hasIntent && !hasFiller && naturalOrder) {
    adjustment += 5;
    strengths.push("strong two-word commercial phrase");
  } else if (tokenCount === 3 && hasKeyword && hasIntent && modifierHits.length <= 1 && fillerHits.length <= 1 && naturalOrder && !middleIsSoftOnly) {
    adjustment += 3;
    strengths.push("clear three-part phrase");
  } else if (brandableCandidate && tokenCount <= 2) {
    adjustment += 3;
    strengths.push("simple brandable structure");
  }

  if (tokenCount >= 5) {
    adjustment -= 5;
    issues.push("too many word parts");
  } else if (tokenCount === 4 && !hasIntent) {
    adjustment -= 3;
    issues.push("longer phrase without clear action word");
  }

  if (lastIsSoftModifier && tokenCount >= 2 && !brandableCandidate) {
    adjustment -= 5;
    issues.push("awkward soft-modifier suffix");
  }

  if (firstIntentBeforeKeyword && !brandableCandidate) {
    adjustment -= 5;
    issues.push("backward word order");
  }

  if (unclearIntentStack && !brandableCandidate) {
    adjustment -= 5;
    issues.push("multiple utility nouns compete");
  }

  if (firstIsAwkwardAction && tokenCount >= 3 && !brandableCandidate) {
    adjustment -= 4;
    issues.push("awkward action prefix");
  }

  if (middleIsSoftOnly && hasKeyword && hasIntent && !brandableCandidate) {
    adjustment -= 3;
    issues.push("soft modifier interrupts phrase");
  }

  if (firstIsCTA && !hasIntent && !brandableCandidate) {
    adjustment -= 4;
    issues.push("generic call-to-action prefix");
  }

  if (lastIsWeak && !hasIntent) {
    adjustment -= 3;
    issues.push("weak generic suffix");
  }

  if (targetKeywords.length && !hasKeyword && !profile.keywordOptional && !brandableCandidate) {
    adjustment -= 4;
    issues.push("off-target for entered keywords");
  }

  if (hasKeyword && hasIntent && naturalOrder && coverage >= 0.8 && sld.length <= 15) {
    adjustment += 2;
    strengths.push("relevant and compact");
  }

  if (hasFiller && !hasIntent && !brandableCandidate) {
    adjustment -= 3;
    issues.push("filler word without strong value signal");
  }

  notes.push(`architecture adjustment ${adjustment >= 0 ? "+" : ""}${adjustment}`);
  return { adjustment, strengths, issues, notes };
}

function scorePenaltyDetails(ctx) {
  const { sldRaw, sld, knownTokens, coverage, targetKeywords, negativeWords, profile, issues, brandableCandidate } = ctx;
  const reasons = [];
  let total = 0;

  function add(points, reason) {
    if (points <= 0) return;
    total += points;
    reasons.push(reason);
  }

  const tokenSet = new Set(knownTokens);

  // Structural penalties are deliberately moderate. The cap logic handles the truly bad cases,
  // so one flaw does not collapse a domain four different ways.
  if (sldRaw.includes("-")) add((sldRaw.match(/-/g) || []).length > 1 ? 10 : 6, "hyphen");
  if (/\d/.test(sld)) add(/\d{2,}/.test(sld) ? 9 : 6, "number");
  if (/(.)\1\1/.test(sld)) add(5, "repeated characters");
  if (knownTokens.length > 4) add(3, "many words");
  if (knownTokens.length > 5) add(3, "wordy");
  if (coverage < 0.45 && !brandableCandidate) add(6, "hard to parse");

  const termPenalties = new Map();
  const collect = (term, points, reason) => {
    if (!isTermMatch(term, tokenSet, sld)) return;
    const key = cleanKeyword(term);
    const existing = termPenalties.get(key);
    if (!existing || points > existing.points) termPenalties.set(key, { points, reason });
  };

  for (const [term, points] of DEFAULT_NEGATIVE_TERMS.entries()) collect(term, points, term);
  for (const [term, points] of Object.entries(profile.negatives || {})) collect(term, points, `${term} in ${profile.label} mode`);
  for (const word of negativeWords) collect(word, 12, `custom negative: ${word}`);

  // Very generic CTA prefixes are weaker when they do not lead to a concrete action/intent word.
  const intentHits = tokenHitCount(STRONG_INTENT_WORDS, tokenSet, sld);
  for (const prefix of CTA_PREFIXES) {
    if (sld.startsWith(prefix) && !intentHits && sld.length > prefix.length + 6) collect(prefix, 3, `generic prefix: ${prefix}`);
  }

  const keptPenaltyKeys = new Set(dedupeTermHits([...termPenalties.keys()]));
  for (const [key, item] of termPenalties.entries()) {
    if (keptPenaltyKeys.has(key)) add(item.points, item.reason);
  }

  const nonKeywordLength = lenWithoutTarget(sld, targetKeywords);
  if (targetKeywords.length && nonKeywordLength > 20) add(4, "long extra wording");
  if (sld.length > 19) add(Math.min(9, Math.ceil((sld.length - 19) * 1.15)), "extra length");

  if (total && reasons.length) issues.push(`penalty for ${reasons.slice(0, 3).join(", ")}`);
  return { total, reasons };
}

function matchesTerm(term, tokenSet, sld) {
  return isTermMatch(term, tokenSet, sld);
}


function calibrateRatingScore(ctx) {
  const { rawScore, sldRaw, sld, len, coverage, targetKeywords, components, profile, brandableCandidate, tokenSet, phraseFit, penalty } = ctx;
  const strengths = [];
  const issues = [];
  const notes = [];
  let adjustment = 0;

  const hasTarget = targetKeywords.length ? phraseFit.targetHits.length > 0 : false;
  const exactTargetName = targetKeywords.some(k => k && cleanKeyword(k) === sld);
  const hasIntent = phraseFit.intentHits.length > 0 || phraseFit.customPositiveHits.length > 0;
  const lowValueCount = phraseFit.fillerHits.length;
  const cleanStructure = !sldRaw.includes("-") && !/\d/.test(sld) && coverage >= 0.7;
  const compact = len >= 6 && len <= 15;
  const cleanHighEvidence = cleanStructure && compact && (brandableCandidate || (hasTarget && hasIntent));

  // Help very good but not perfect names break out of the high-70s without inflating weak names.
  const weakPhraseIssue = (phraseFit.issues || []).some(issue => /backward|stacked|soft modifier|awkward|multiple utility|weak phrase|less natural/i.test(issue));

  if (rawScore >= 74 && rawScore <= 84 && cleanHighEvidence && lowValueCount === 0 && penalty.total <= 3 && !weakPhraseIssue) {
    adjustment += 3;
    strengths.push("calibrated upward for clean high-evidence name");
  }

  // Brandable names should be judged differently from keyword domains, but only if they are short and pronounceable.
  if (brandableCandidate && rawScore >= 64 && rawScore <= 82 && pronounceabilityScore(sld) >= 78 && !lowValueCount) {
    adjustment += 2;
    strengths.push("brandable calibration boost");
  }

  // Prevent mediocre keyword domains from looking strong just because they match one keyword.
  if (targetKeywords.length && hasTarget && !hasIntent && !brandableCandidate && !exactTargetName && rawScore >= 72) {
    adjustment -= 3;
    issues.push("calibrated down: keyword match without strong usefulness signal");
  }

  if (lowValueCount >= 2 && rawScore >= 68) {
    adjustment -= 3;
    issues.push("calibrated down for multiple generic words");
  }

  if (coverage < 0.55 && !brandableCandidate && rawScore >= 65) {
    adjustment -= 2;
    issues.push("calibrated down for uncertain word split");
  }

  if (weakPhraseIssue && rawScore >= 76 && !brandableCandidate) {
    adjustment -= 3;
    issues.push("calibrated down for weaker phrase naturalness");
  }

  notes.push(`calibration ${adjustment >= 0 ? "+" : ""}${adjustment}`);
  return { adjustment, strengths, issues, notes };
}

function scoreCaps(ctx) {
  const { suffix, sldRaw, sld, len, coverage, targetKeywords, components, profile, brandableCandidate, tokenSet, phraseFit, knownTokens = [] } = ctx;
  let cap = 96;
  const reasons = [];
  function apply(value, reason) {
    if (value < cap) {
      cap = value;
      reasons.push(reason);
    }
  }

  const exactTargetName = targetKeywords.some(k => k && cleanKeyword(k) === sld);
  const targetEvidence = !targetKeywords.length || phraseFit.targetHits.length || exactTargetName;
  const intentEvidence = phraseFit.intentHits.length || phraseFit.customPositiveHits.length;
  const brandableHits = tokenListHits(BRANDABLE_SIGNAL_WORDS, tokenSet, sld);
  const categoryHits = tokenListHits(CATEGORY_LOCK_WORDS, tokenSet, sld);
  const trustRiskHits = tokenListHits(TRUST_RISK_WORDS, tokenSet, sld);
  const ctaHits = phraseFit.fillerHits.filter(t => CTA_PREFIXES.has(t));
  const pronounce = pronounceabilityScore(sld);
  const coreIntentHits = tokenListHits(CORE_INTENT_WORDS, tokenSet, sld);
  const firstToken = knownTokens[0] || "";
  const lastToken = knownTokens[knownTokens.length - 1] || "";
  const keywordIndex = tokenIndex(knownTokens, phraseFit.targetHits || []);
  const intentIndex = tokenIndex(knownTokens, coreIntentHits);
  const lastIsSoftModifier = SOFT_MODIFIER_WORDS.has(lastToken);
  const firstIntentBeforeKeyword = intentIndex === 0 && keywordIndex > 0;
  const unclearIntentStack = hasUnclearIntentStack(coreIntentHits);
  const firstIsAwkwardAction = AWKWARD_ACTION_PREFIXES.has(firstToken);
  const firstIsWeakPositioning = WEAK_POSITIONING_WORDS.has(firstToken);
  const middleHasWeakPositioning = knownTokens.slice(1, -1).some(t => WEAK_POSITIONING_WORDS.has(t));
  const cleanPremiumShape = !sldRaw.includes("-") && !/\d/.test(sld) && coverage >= 0.8 && len >= 6 && len <= 15 && knownTokens.length >= 2 && knownTokens.length <= 3;
  const canonicalKeywordIntent = targetEvidence && intentEvidence && cleanPremiumShape && !lastIsSoftModifier && !firstIntentBeforeKeyword && !unclearIntentStack && !firstIsAwkwardAction && phraseFit.fillerHits.length === 0;
  const exactOrPremiumBrandable = exactTargetName || (brandableCandidate && len <= 12 && pronounce >= 78);

  if (targetKeywords.length && components.keyword === 0 && !profile.keywordOptional) apply(78, "no target keyword");
  if (coverage < 0.45 && !brandableCandidate) apply(76, "harder to read");
  else if (coverage < 0.62 && !brandableCandidate) apply(84, "somewhat harder to read");
  if (len > 24) apply(70, "very long");
  else if (len > 20) apply(79, "long name");
  else if (len > 18) apply(86, "slightly long name");
  if (sldRaw.includes("-")) apply((sldRaw.match(/-/g) || []).length > 1 ? 72 : 78, "hyphen");
  if (/\d/.test(sld)) apply(/\d{2,}/.test(sld) ? 72 : 78, "number");
  const gimmicks = ["wizard", "genius", "guru", "ninja", "hack", "cheap", "247"];
  if (gimmicks.some(t => isTermMatch(t, tokenSet, sld))) apply(profile.strictTrust ? 68 : 80, "gimmicky word");

  if (pronounce < 45 && coverage < 0.5 && !brandableCandidate) apply(55, "hard to say and hard to parse");
  if (pronounce < 25 && !brandableCandidate) apply(48, "unpronounceable name");
  if (knownTokens.length >= 4 && !intentEvidence) apply(76, "too many words without intent");
  if (WEAK_SUFFIXES.has(lastToken) && !brandableCandidate) apply(intentEvidence ? 84 : 78, "weak generic suffix");
  if (knownTokens.length >= 3 && phraseFit.fillerHits.length && targetEvidence && !brandableCandidate) apply(86, "extra generic word");

  // Naturalness gates: a keyword + intent match can be good, but 90+ should require
  // a clean, natural phrase rather than reversed words, stacked utilities, or soft suffixes.
  if (lastIsSoftModifier && !brandableCandidate) apply(84, "soft modifier suffix");
  if (firstIntentBeforeKeyword && !brandableCandidate) apply(84, "backward word order");
  if (unclearIntentStack && !brandableCandidate) apply(86, "stacked utility words");
  if (firstIsAwkwardAction && knownTokens.length >= 3 && !brandableCandidate) apply(84, "awkward action prefix");
  if (firstIsWeakPositioning && intentEvidence && targetEvidence && !brandableCandidate) apply(89, "soft positioning prefix");
  if (middleHasWeakPositioning && intentEvidence && targetEvidence && !brandableCandidate) apply(86, "soft modifier interrupts phrase");
  if (intentEvidence && targetEvidence && !canonicalKeywordIntent && !exactOrPremiumBrandable && !brandableCandidate) apply(89, "not a natural premium-grade phrase");

  const professionalRiskHits = tokenListHits(PROFESSIONAL_RISK_WORDS, tokenSet, sld);
  const sensitiveHits = tokenListHits(SENSITIVE_CATEGORY_WORDS, tokenSet, sld);
  if (professionalRiskHits.length && (isTermMatch("tool", tokenSet, sld) || isTermMatch("app", tokenSet, sld) || isTermMatch("ai", tokenSet, sld) || isTermMatch("easy", tokenSet, sld) || isTermMatch("done", tokenSet, sld))) {
    apply(profile.strictTrust ? 78 : 86, "professional/trust wording needs review");
  }
  if (sensitiveHits.length && isTermMatch("ai", tokenSet, sld) && !brandableCandidate) apply(88, "AI with sensitive category");

  // TLDs are part of the rating, not just a component. Strong alternatives can still score well,
  // but only .com should be able to reach the very top of a general-purpose shortlist.
  if (suffix && suffix !== "com") {
    const strongAltTlds = new Set(["org", "net", "co", "io", "ai", "app", "dev", "legal", "law", "finance", "shop", "store"]);
    const profileAlignedAlt =
      (profile.label === "Brandable / SaaS" && ["io", "ai", "app", "dev"].includes(suffix)) ||
      (profile.label === "Ecommerce / product" && ["shop", "store"].includes(suffix)) ||
      (profile.label === "Trust-heavy" && ["org", "net"].includes(suffix));
    if (profileAlignedAlt) apply(93, `${suffix} TLD below .com`);
    else if (strongAltTlds.has(suffix)) apply(89, `${suffix} TLD below .com`);
    else if (String(suffix).includes(".")) apply(82, "compound country-code TLD");
    else apply(84, "weaker TLD");
  }

  if (profile.label === "Brandable / SaaS") {
    if (categoryHits.length && !brandableHits.length && !brandableCandidate) {
      apply(knownTokens.length >= 2 ? 76 : 80, "descriptive category phrase, not SaaS/brandable");
    }
    if (!brandableHits.length && !brandableCandidate && !intentEvidence) apply(82, "limited brandable/SaaS evidence");
    if (ctaHits.length && sld.length > 9) apply(88, "CTA prefix lowers brandability");
    if (phraseFit.fillerHits.length >= 2) apply(76, "too many generic brand words");
    if (trustRiskHits.length) apply(78, "trust-risk word");
  }

  if (profile.strictTrust && trustRiskHits.length) apply(70, "trust-risk word in trust-heavy mode");

  // Top-tier scores should require positive evidence, not merely the absence of problems.
  if (phraseFit) {
    const hasCleanTopEvidence = exactOrPremiumBrandable || canonicalKeywordIntent;
    if (phraseFit.adjustment <= -5 && !brandableCandidate) apply(82, "weak phrase quality");
    if (targetKeywords.length && phraseFit.targetHits.length && !intentEvidence && !brandableCandidate && !exactTargetName) {
      apply(84, "keyword lacks clear intent support");
    }
    if (!hasCleanTopEvidence && !brandableCandidate) apply(88, "not enough top-tier evidence");
    if (phraseFit.fillerHits.length >= 2) apply(80, "too many low-value words");
    if (phraseFit.architecture && phraseFit.architecture.adjustment <= -5) apply(82, "weak phrase architecture");
  }

  return { cap, reasons };
}
function addStrengthsAndIssues(ctx) {
  const { suffix, len, targetKeywords, sld, sldRaw, knownTokens, coverage, tokenSet, components, strengths, issues, profile, brandableCandidate } = ctx;
  if (suffix === "com") strengths.push(".com extension");
  else issues.push(`${suffix || "non-standard"} TLD is less universal than .com`);

  if (len >= 6 && len <= 13) strengths.push("good length");
  else if (len > 18) issues.push("long name");
  else if (len <= 4) issues.push("very short, may be less descriptive");

  const keywordHits = dedupeTermHits(targetKeywords.filter(k => k && isTermMatch(k, tokenSet, sld)));
  if (targetKeywords.length) {
    if (keywordHits.length) strengths.push(`matches ${keywordHits.slice(0, 2).join(" + ")}`);
    else issues.push("does not include target keyword");
  }

  if (coverage >= 0.8 && knownTokens.length >= 2 && knownTokens.length <= 3) strengths.push("easy to parse");
  else if (brandableCandidate) strengths.push("short pronounceable brandable name");
  else if (coverage < 0.65) issues.push("harder to parse into words");

  if (!sldRaw.includes("-") && !/\d/.test(sld)) strengths.push("no hyphen or number");
  if (sldRaw.includes("-")) issues.push("hyphen hurts memorability");
  if (/\d/.test(sld)) issues.push("number hurts trust/readability");

  const profileHits = Object.keys(profile.positives || {}).filter(t => isTermMatch(t, tokenSet, sld));
  if (profileHits.length) strengths.push(`${profile.label} fit: ${profileHits.slice(0, 2).join(", ")}`);
  if (components.intent >= Math.max(6, Math.round(profile.weights.intent * 0.7))) strengths.push("clear user intent word");
}

function buildScoreExplanation(score, label, strengths, issues) {
  const positive = strengths.length ? strengths.slice(0, 3).join(", ") : "decent baseline";
  const negative = issues.length ? ` Tradeoffs: ${issues.slice(0, 2).join(", ")}.` : " No major tradeoffs.";
  return `${score} — ${label}. ${positive}.${negative}`;
}

function scoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 55) return "Okay";
  if (score >= 40) return "Weak";
  return "Avoid";
}

function lenWithoutTarget(sld, targetKeywords) {
  let stripped = sld;
  for (const keyword of targetKeywords) {
    if (keyword) stripped = stripped.replaceAll(keyword, "");
  }
  return stripped.length;
}

function tokenizeDomainName(sldRaw, targetKeywords, positiveWords = [], negativeWords = []) {
  const baseVocabulary = [...new Set([
    ...targetKeywords,
    ...positiveWords,
    ...negativeWords,
    ...QUALITY_WORDS,
    ...GENERIC_DOMAIN_WORDS
  ])]
    .map(cleanKeyword)
    .filter(word => word.length >= 2);

  const baseSet = new Set(baseVocabulary);
  const dynamic = getDynamicVocabulary()
    .map(cleanKeyword)
    .filter(word => word.length >= 3)
    // Dynamic vocabulary is useful for repeated niche terms, but it should not merge
    // clean phrases like probate+forms, cloud+flow, or roof+repair into one opaque token.
    .filter(word => !canSegmentWithVocabulary(word, baseSet));

  const dictionary = [...new Set([...baseVocabulary, ...dynamic])]
    .sort((a, b) => b.length - a.length || a.localeCompare(b));

  const chunks = String(sldRaw || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const tokens = [];
  for (const chunk of chunks) tokens.push(...tokenizeChunk(chunk, dictionary));
  return tokens;
}

function canSegmentWithVocabulary(word, vocabularySet) {
  word = cleanKeyword(word);
  if (!word || !vocabularySet || vocabularySet.has(word)) return Boolean(word && vocabularySet && vocabularySet.has(word));
  const n = word.length;
  const dp = Array(n + 1).fill(false);
  const pieces = Array(n + 1).fill(0);
  dp[0] = true;
  for (let i = 0; i < n; i++) {
    if (!dp[i]) continue;
    for (let j = i + 2; j <= n; j++) {
      const part = word.slice(i, j);
      if (!vocabularySet.has(part)) continue;
      if (!dp[j] || pieces[i] + 1 > pieces[j]) {
        dp[j] = true;
        pieces[j] = pieces[i] + 1;
      }
    }
  }
  return dp[n] && pieces[n] >= 2;
}

function tokenizeChunk(chunk, dictionary) {
  const n = chunk.length;
  const dict = new Set(dictionary);
  const maxWordLen = Math.min(18, dictionary.reduce((m, w) => Math.max(m, w.length), 0));
  const memo = new Map();

  function bestAt(i) {
    if (i >= n) return { cost: 0, tokens: [] };
    if (memo.has(i)) return memo.get(i);

    // Unknown single-character fallback; consecutive unknowns are merged later.
    let best = { cost: 5, tokens: [{ text: chunk[i], unknown: true }, ...bestAt(i + 1).tokens] };

    for (let len = Math.min(maxWordLen, n - i); len >= 2; len--) {
      const word = chunk.slice(i, i + len);
      if (!dict.has(word)) continue;
      const next = bestAt(i + len);
      const cost = 0.25 + Math.max(0, 5 - len) * 0.15 + next.cost;
      if (cost < best.cost) {
        best = { cost, tokens: [{ text: word, unknown: false }, ...next.tokens] };
      }
    }

    memo.set(i, best);
    return best;
  }

  const rawTokens = bestAt(0).tokens;
  const merged = [];
  for (const token of rawTokens) {
    const last = merged[merged.length - 1];
    if (last && last.unknown && token.unknown) last.text += token.text;
    else merged.push({ ...token });
  }
  return merged;
}

function scoreBand(score) {
  if (score >= 90) return "excellent domain quality";
  if (score >= 80) return "strong domain quality";
  if (score >= 70) return "good but has tradeoffs";
  if (score >= 55) return "usable but weaker";
  return "weak domain quality";
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
    score_label: score.label,
    score_explanation: score.explanation,
    score_notes: score.notes,
    score_components: score.components ? JSON.stringify(score.components) : "",
    scoring_style: score.style || getScoringProfile().label
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


function availabilitySortValue(row) {
  if (row.available === true) return 0;
  if (row.available === null || row.available === undefined) return 1;
  if (row.available === false) return 2;
  return 3;
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
    if (status === "top_picks" && row.available !== true) return false;

    if (search) {
      const haystack = [row.input, domain, row.availability_status, row.check_source, row.notes, row.error, row.score_label, row.score_explanation, row.score_notes]
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
      return favDelta || availabilitySortValue(a) - availabilitySortValue(b) || Number(b.domain_score || 0) - Number(a.domain_score || 0);
    }
    // Default: available first, then best quality score, then shorter names.
    return availabilitySortValue(a) - availabilitySortValue(b)
      || Number(b.domain_score || 0) - Number(a.domain_score || 0)
      || Number(a.name_length || 999) - Number(b.name_length || 999);
  });
  if (status === "top_picks") rows = rows.slice(0, topPickLimit());
  return rows;
}

function renderResults() {
  const visibleRows = displayedResults();
  if (!results.length || results.every(r => !r)) {
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="12">No results yet.</td></tr>';
    el.visibleCount.textContent = "0 visible";
    updateSummary();
    return;
  }

  if (!visibleRows.length) {
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="12">No rows match the current filters.</td></tr>';
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
      <td><span class="rating-pill rating-${scoreClass(result.domain_score)}">${escapeHtml(result.score_label || "")}</span></td>
      <td><details class="score-details"><summary>${escapeHtml(result.score_explanation || "")}</summary><div>${escapeHtml(result.score_notes || "")}</div></details></td>
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

function topPickLimit() {
  return clampNumber(el.topPickCountInput?.value || 20, 1, 100, 20);
}

function topPickRows() {
  return results
    .filter(r => r && r.available === true)
    .map(enhanceResult)
    .sort((a, b) => Number(b.domain_score || 0) - Number(a.domain_score || 0) || Number(a.name_length || 999) - Number(b.name_length || 999))
    .slice(0, topPickLimit());
}

function showTopPicks() {
  el.filterStatus.value = "top_picks";
  el.sortSelect.value = "score_desc";
  const picks = topPickRows();
  const cutoff = picks.length ? Number(picks[picks.length - 1].domain_score || 0) : 0;
  el.filterSearch.value = "";
  renderResults();
  setStatus(picks.length ? `Top ${picks.length} available picks start at quality score ${cutoff}. Use Copy top picks or Open top picks.` : "No possibly available rows to show as top picks.");
  saveState();
}

function copyTopPicks() {
  const rows = topPickRows();
  copyText(uniqueDomains(rows).join("\n"), `top ${rows.length} picks`);
}

function openTopPicks() {
  openLinks(topPickRows(), "top-pick");
}

function exportCsv(scope = "all") {
  const rows = scope === "favorites" ? results.filter(r => r && favorites.has(r.normalized_domain)) : results.filter(Boolean);
  if (!rows.length) {
    setStatus(scope === "favorites" ? "No favorites to export." : "No results to export.");
    return;
  }
  const columns = [
    "favorite", "input", "normalized_domain", "effective_tld", "name_length", "domain_score", "score_label",
    "score_explanation", "scoring_style", "score_components", "score_notes",
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
    el.copyLinksBtn, el.showTopPicksBtn, el.copyTopPicksBtn, el.openTopPicksBtn, el.clearSessionBtn
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
    scoringStyle: el.scoringStyleInput?.value || "general",
    positiveWords: el.positiveWordsInput?.value || "",
    negativeWords: el.negativeWordsInput?.value || "",
    topPickCount: el.topPickCountInput?.value || "20",
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
  if (settings.scoringStyle !== undefined && el.scoringStyleInput) el.scoringStyleInput.value = settings.scoringStyle;
  if (settings.positiveWords !== undefined && el.positiveWordsInput) el.positiveWordsInput.value = settings.positiveWords;
  if (settings.negativeWords !== undefined && el.negativeWordsInput) el.negativeWordsInput.value = settings.negativeWords;
  if (settings.topPickCount !== undefined && el.topPickCountInput) el.topPickCountInput.value = settings.topPickCount;
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
    workers: "2", delay: "250", timeout: "12000", keywords: "", scoringStyle: "general",
    positiveWords: "", negativeWords: "", topPickCount: "20", useRdap: true, useDns: true, dedupe: true,
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
  el.showTopPicksBtn.addEventListener("click", showTopPicks);
  el.copyTopPicksBtn.addEventListener("click", copyTopPicks);
  el.openTopPicksBtn.addEventListener("click", openTopPicks);
  el.clearSessionBtn.addEventListener("click", clearSession);

  const filterControls = [
    el.filterStatus, el.filterSearch, el.filterTld, el.filterMaxLen, el.filterNoHyphen, el.filterNoNumbers, el.sortSelect
  ];
  for (const control of filterControls) {
    control.addEventListener("input", () => { renderResults(); saveState(); });
    control.addEventListener("change", () => { renderResults(); saveState(); });
  }

  const optionControls = [el.workersInput, el.delayInput, el.timeoutInput, el.useRdapInput, el.useDnsInput, el.dedupeInput, el.topPickCountInput];
  for (const control of optionControls.filter(Boolean)) {
    control.addEventListener("change", saveState);
    control.addEventListener("input", saveState);
  }

  const scoringControls = [el.keywordsInput, el.scoringStyleInput, el.positiveWordsInput, el.negativeWordsInput];
  for (const control of scoringControls.filter(Boolean)) {
    control.addEventListener("input", rescoreResults);
    control.addEventListener("change", rescoreResults);
  }

  el.resultsBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-favorite]");
    if (button) toggleFavorite(button.getAttribute("data-favorite"));
  });
}

bindEvents();
loadState();
