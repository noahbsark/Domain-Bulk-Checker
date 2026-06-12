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
  scoringStyleInput: document.getElementById("scoringStyleInput"),
  positiveWordsInput: document.getElementById("positiveWordsInput"),
  negativeWordsInput: document.getElementById("negativeWordsInput"),
  likedExamplesInput: document.getElementById("likedExamplesInput"),
  dislikedExamplesInput: document.getElementById("dislikedExamplesInput"),
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
  "pro", "plus", "express", "solution", "solutions", "buddy", "genius", "for", "less"
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

function getExampleDomains(element) {
  if (!element) return [];
  const lines = String(element.value || "").split(/\r?\n|[,;]+/).map(line => line.trim()).filter(Boolean);
  const domains = [];
  for (const line of lines) {
    const row = normalizeDomain(line);
    if (!row.error && row.domain) domains.push(row.domain);
  }
  return [...new Set(domains)].slice(0, 80);
}

function buildPreferenceModel(targetKeywords, positiveWords, negativeWords) {
  const liked = getExampleDomains(el.likedExamplesInput);
  const disliked = getExampleDomains(el.dislikedExamplesInput);
  const likedTerms = new Map();
  const dislikedTerms = new Map();
  const likedPatterns = new Map();
  const dislikedPatterns = new Map();
  const likedLengths = [];
  const dislikedLengths = [];

  function add(map, key, amount = 1) {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + amount);
  }

  function ingest(domain, termMap, patternMap, lengths) {
    const sldRaw = secondLevelName(domain).toLowerCase();
    const sld = sldRaw.replace(/[^a-z0-9]/g, "");
    const tokens = tokenizeDomainName(sldRaw, targetKeywords, positiveWords, negativeWords)
      .filter(t => !t.unknown)
      .map(t => t.text);
    const tokenSet = new Set(tokens);
    lengths.push(sld.length);
    for (const token of tokens) add(termMap, token);
    for (const signal of domainPatternSignals({ sldRaw, sld, knownTokens: tokens, tokenSet, coverage: tokens.length ? 1 : 0, targetKeywords })) {
      add(patternMap, signal);
    }
  }

  liked.forEach(domain => ingest(domain, likedTerms, likedPatterns, likedLengths));
  disliked.forEach(domain => ingest(domain, dislikedTerms, dislikedPatterns, dislikedLengths));

  return {
    liked, disliked,
    likedTerms, dislikedTerms,
    likedPatterns, dislikedPatterns,
    likedAvgLen: average(likedLengths),
    dislikedAvgLen: average(dislikedLengths)
  };
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const GENERIC_DOMAIN_WORDS = [
  "app", "apps", "ai", "data", "cloud", "sync", "flow", "desk", "crm", "sales", "lead", "leads", "client", "clients",
  "marketing", "market", "seo", "ads", "media", "brand", "brands", "studio", "agency", "lab", "labs", "stack", "base",
  "local", "near", "city", "home", "house", "roof", "lawn", "clean", "cleaning", "repair", "plumbing", "electric", "hvac",
  "care", "health", "fitness", "wellness", "doctor", "dental", "pet", "pets", "food", "coffee", "shop", "store", "supply",
  "supplies", "gear", "goods", "box", "club", "direct", "delivery", "buy", "sell", "deals", "discount", "review", "reviews",
  "compare", "best", "top", "rank", "finder", "find", "search", "now", "today", "hq", "go", "get", "try", "use", "join",
  "learn", "school", "class", "classes", "course", "courses", "academy", "training", "lesson", "lessons", "blueprint", "playbook"
];

const DEFAULT_POSITIVE_TERMS = new Map([
  ["help", 9], ["guide", 9], ["kit", 8], ["tool", 8], ["tools", 8], ["app", 8], ["forms", 8], ["form", 7],
  ["planner", 7], ["checklist", 7], ["template", 7], ["templates", 7], ["course", 6], ["academy", 5],
  ["service", 6], ["services", 6], ["shop", 6], ["store", 6], ["supply", 5], ["finder", 6], ["compare", 5],
  ["reviews", 5], ["direct", 4], ["simple", 4], ["easy", 3], ["clear", 4], ["smart", 3]
]);

const DEFAULT_NEGATIVE_TERMS = new Map([
  ["247", 13], ["24", 8], ["guru", 8], ["genius", 7], ["wizard", 7], ["ninja", 8], ["hack", 8],
  ["hacks", 8], ["buddy", 5], ["plus", 5], ["pro", 5], ["express", 5], ["solution", 5], ["solutions", 5],
  ["pathway", 5], ["route", 3], ["portal", 3], ["online", 2], ["best", 4], ["top", 3], ["cheap", 9]
]);

const STRONG_PURPOSE_TERMS = new Set([
  "help", "guide", "guides", "kit", "tool", "tools", "app", "apps", "forms", "form",
  "checklist", "template", "templates", "planner", "finder", "compare", "reviews", "shop", "store",
  "supply", "supplies", "course", "academy", "manual", "playbook", "blueprint"
]);

const VAGUE_OR_WEAK_ENDINGS = new Set([
  "solution", "solutions", "portal", "hub", "works", "central", "pathway", "route", "option", "options",
  "online", "pro", "plus", "express", "buddy", "genius", "wizard", "hq", "now", "today"
]);

const SOFT_MODIFIERS = new Set([
  "my", "your", "own", "easy", "simple", "self", "diy", "the", "a", "an", "best", "top", "get", "go",
  "try", "use", "join", "now", "today", "online", "hq", "direct", "smart", "clear", "quick", "fast"
]);

// Human-feel checks: these help catch names that score well mathematically but sound awkward.
const AWKWARD_SUFFIXES = new Set([
  "forme", "guided", "helperpro", "assistpro", "route", "pathway", "option", "central", "portal",
  "solution", "solutions", "247", "24", "express", "genius", "wizard", "buddy"
]);

const TRUST_RISK_TERMS = new Set([
  "lawyer", "attorney", "legal", "law", "guarantee", "guaranteed", "expert", "experts", "official",
  "certified", "cheap", "hack", "guru", "genius", "wizard", "247"
]);

const NATURAL_PAIR_BONUSES = [
  ["diy", "kit"], ["diy", "guide"], ["diy", "forms"], ["diy", "tool"],
  ["my", "kit"], ["my", "guide"], ["my", "forms"], ["your", "guide"],
  ["easy", "guide"], ["simple", "guide"], ["self", "help"],
  ["executor", "forms"], ["executor", "guide"], ["estate", "forms"], ["estate", "kit"],
  ["tax", "help"], ["tax", "guide"], ["tax", "forms"], ["local", "service"],
  ["shop", "supply"], ["pet", "care"], ["home", "repair"]
];


const PATTERN_PURPOSE_WORDS = new Set([
  "help", "guide", "guides", "kit", "tool", "tools", "app", "apps", "forms", "form", "finder", "shop", "store",
  "checklist", "planner", "template", "templates", "course", "academy", "service", "services", "supply", "supplies"
]);

const PATTERN_MODIFIERS = new Set([
  "my", "your", "diy", "self", "easy", "simple", "local", "clear", "smart", "quick", "best", "top", "get", "go", "try", "use"
]);

const WEAK_PATTERN_ENDINGS = new Set([
  "solution", "solutions", "portal", "central", "pathway", "route", "option", "options", "pro", "plus", "express", "online", "hq", "now", "today"
]);

const MEMORABILITY_BAD_BIGRAMS = /(q[^u]|zx|xq|qz|vv|ww|yy|kkk|xxx|zzz)/;

const TOP_PICK_DIVERSITY_FILL = true;

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
  const preferenceModel = buildPreferenceModel(targetKeywords, positiveWords, negativeWords);

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

  const components = {
    tld: weightedScore(rawTldScore(suffix), profile.weights.tld),
    length: weightedScore(rawLengthScore(len), profile.weights.length),
    keyword: weightedScore(rawKeywordScore(sld, targetKeywords, profile.keywordOptional), profile.weights.keyword),
    clarity: weightedScore(rawClarityScore(sld, knownTokens, coverage, targetKeywords), profile.weights.clarity),
    brand: weightedScore(rawBrandScore(sldRaw, sld, len), profile.weights.brand),
    intent: weightedScore(rawIntentScore(tokenSet, sld, positiveWords, profile), profile.weights.intent),
    fit: weightedScore(rawStyleFitScore(tokenSet, sld, profile), profile.weights.fit)
  };

  const strengths = [];
  const issues = [];
  const tweaks = [];

  addStrengthsAndIssues({ suffix, len, targetKeywords, sld, sldRaw, knownTokens, coverage, tokenSet, components, strengths, issues, profile });
  const phrase = phraseQualityAnalysis({ sldRaw, sld, len, knownTokens, tokenSet, coverage, targetKeywords, suffix, profile, strengths, issues });

  let score = Object.values(components).reduce((sum, value) => sum + value, 0);
  score += phrase.adjust;
  const penalty = scorePenaltyDetails({ sldRaw, sld, knownTokens, coverage, targetKeywords, positiveWords, negativeWords, profile, issues, tweaks });
  score -= penalty.total;

  const market = marketabilityAdjustment({ sldRaw, sld, len, knownTokens, coverage, targetKeywords, tokenSet, suffix, profile, strengths, issues });
  score += market.adjust;

  const pattern = patternQualityAnalysis({ sldRaw, sld, len, knownTokens, coverage, targetKeywords, tokenSet, suffix, profile, strengths, issues });
  score += pattern.adjust;
  components.pattern = pattern.adjust;

  const memorability = memorabilityAnalysis({ sldRaw, sld, len, knownTokens, coverage, targetKeywords, tokenSet, suffix, profile, strengths, issues });
  score += memorability.adjust;
  components.memorability = memorability.adjust;

  const preference = preferenceAdjustment({ sldRaw, sld, len, knownTokens, coverage, targetKeywords, tokenSet, profile, preferenceModel, strengths, issues });
  score += preference.adjust;
  components.preference = preference.adjust;

  const capInfo = scoreCaps({ sldRaw, sld, len, coverage, targetKeywords, components, profile, phrase, pattern, memorability });
  if (capInfo.reasons.length) issues.push(...capInfo.reasons);

  const calibrated = calibrateScore(score, { len, knownTokens, coverage, tokenSet, targetKeywords, suffix, profile });
  const finalScore = Math.max(0, Math.min(capInfo.cap, Math.round(calibrated)));
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
    market.adjust ? `marketability ${market.adjust > 0 ? "+" : ""}${market.adjust}: ${market.reasons.join(", ")}` : "marketability neutral",
    `phrase quality ${phrase.label}: ${phrase.reasons.join(", ") || "normal"}`,
    `pattern quality ${pattern.label}: ${pattern.reasons.join(", ") || "normal"}`,
    `memorability ${memorability.label}: ${memorability.reasons.join(", ") || "normal"}`,
    preference.adjust ? `preference calibration ${preference.adjust > 0 ? "+" : ""}${preference.adjust}: ${preference.reasons.join(", ")}` : "preference calibration neutral",
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
    phraseQuality: phrase.label,
    phraseReasons: phrase.reasons,
    patternQuality: pattern.label,
    patternReasons: pattern.reasons,
    memorability: memorability.label,
    memorabilityReasons: memorability.reasons,
    preferenceLabel: preference.label,
    preferenceReasons: preference.reasons,
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

function rawKeywordScore(sld, targetKeywords, keywordOptional) {
  if (!targetKeywords.length) return keywordOptional ? 72 : 45;
  let best = 0;
  let count = 0;
  for (const keyword of targetKeywords) {
    if (!keyword) continue;
    if (sld === keyword) best = Math.max(best, 100);
    else if (sld.startsWith(keyword) || sld.endsWith(keyword)) best = Math.max(best, 92);
    else if (sld.includes(keyword)) best = Math.max(best, 78);
    if (sld.includes(keyword)) count += 1;
  }
  if (count >= 2) best = Math.min(100, best + 8);
  return best;
}

function rawClarityScore(sld, knownTokens, coverage, targetKeywords) {
  let score = 0;
  if (coverage >= 0.95) score += 45;
  else if (coverage >= 0.8) score += 36;
  else if (coverage >= 0.65) score += 25;
  else if (coverage >= 0.5) score += 14;
  else score += 5;

  const tokenCount = knownTokens.length;
  if (tokenCount >= 2 && tokenCount <= 3) score += 30;
  else if (tokenCount === 1 || tokenCount === 4) score += 18;
  else if (tokenCount === 5) score += 8;

  const firstKeywordIndex = knownTokens.findIndex(t => targetKeywords.includes(t));
  if (firstKeywordIndex === 0) score += 12;
  else if (firstKeywordIndex > 0 && firstKeywordIndex <= 2) score += 7;

  if (/^[a-z0-9]+$/.test(sld)) score += 8;
  if (/(.)\1\1/.test(sld)) score -= 8;
  return Math.max(0, Math.min(100, score));
}

function rawBrandScore(sldRaw, sld, len) {
  let score = 45;
  if (!sldRaw.includes("-")) score += 15;
  if (!/\d/.test(sld)) score += 15;
  if (/[aeiou]/.test(sld)) score += 10;
  if (!/(.)\1\1/.test(sld)) score += 6;
  if (!/(q[^u]|zx|xq|qz|vv|ww|yy)/.test(sld)) score += 6;
  if (len >= 6 && len <= 13) score += 12;
  if (len > 18) score -= 15;
  return Math.max(0, Math.min(100, score));
}

function rawIntentScore(tokenSet, sld, positiveWords, profile) {
  let best = 0;
  for (const [term, points] of DEFAULT_POSITIVE_TERMS.entries()) {
    if (tokenSet.has(term) || sld.includes(term)) best = Math.max(best, Math.min(100, points * 10));
  }
  for (const [term, points] of Object.entries(profile.positives || {})) {
    if (tokenSet.has(term) || sld.includes(term)) best = Math.max(best, Math.min(100, 55 + points * 9));
  }
  for (const word of positiveWords) {
    if (word && (tokenSet.has(word) || sld.includes(word))) best = Math.max(best, 95);
  }
  return best;
}

function rawStyleFitScore(tokenSet, sld, profile) {
  let score = 55;
  for (const [term, points] of Object.entries(profile.positives || {})) {
    if (tokenSet.has(term) || sld.includes(term)) score += points * 6;
  }
  for (const [term, points] of Object.entries(profile.negatives || {})) {
    if (tokenSet.has(term) || sld.includes(term)) score -= points * 5;
  }
  if (profile.strictTrust) {
    if (["trust", "clear", "simple", "guide", "help", "forms", "service", "planner"].some(t => tokenSet.has(t) || sld.includes(t))) score += 12;
    if (["wizard", "genius", "guru", "ninja", "hack", "cheap", "247"].some(t => tokenSet.has(t) || sld.includes(t))) score -= 22;
  }
  return Math.max(0, Math.min(100, score));
}


function phraseQualityAnalysis(ctx) {
  const { sldRaw, sld, len, knownTokens, tokenSet, coverage, targetKeywords, suffix, profile, strengths, issues } = ctx;
  const reasons = [];
  let adjust = 0;
  let cap = 97;

  function add(points, reason, isIssue = points < 0) {
    adjust += points;
    reasons.push(reason);
    if (points > 0) strengths.push(reason);
    if (isIssue && points < 0) issues.push(reason);
  }

  const tokenCount = knownTokens.length;
  const first = knownTokens[0] || "";
  const last = knownTokens[tokenCount - 1] || "";
  const keywordHit = targetKeywords.some(k => k && sld.includes(k));
  const hasPurpose = knownTokens.some(t => STRONG_PURPOSE_TERMS.has(t));

  if (coverage >= 0.92 && tokenCount >= 2 && tokenCount <= 3) add(4, "natural phrase");
  if (coverage >= 0.86 && keywordHit && hasPurpose && tokenCount <= 3) add(4, "clear keyword phrase");
  if (suffix === "com" && len <= 12 && coverage >= 0.86 && tokenCount <= 3) add(2, "crisp .com");

  for (const [prefix, purpose] of NATURAL_PAIR_BONUSES) {
    if ((tokenSet.has(prefix) || sld.startsWith(prefix)) && (tokenSet.has(purpose) || sld.endsWith(purpose))) {
      add(3, `natural pair: ${prefix}+${purpose}`);
      break;
    }
  }

  // Penalize names that look like typo domains or forced word merges.
  if (AWKWARD_SUFFIXES.has(last) || [...AWKWARD_SUFFIXES].some(term => sld.endsWith(term))) {
    const reason = `awkward ending: ${last || sld.slice(-8)}`;
    add(-9, reason);
    cap = Math.min(cap, profile.strictTrust ? 78 : 84);
  }
  if (/forme$/.test(sld) && !tokenSet.has("for")) {
    add(-12, "ambiguous ending: forme");
    cap = Math.min(cap, 82);
  }
  if (/guided$/.test(sld) && !tokenSet.has("guide")) {
    add(-10, "awkward word form: guided");
    cap = Math.min(cap, 84);
  }
  if (tokenCount >= 4 && SOFT_MODIFIERS.has(first)) add(-5, "generic prefix on long name");
  if (coverage < 0.75 && len >= 12) {
    add(-8, "unclear word boundaries");
    cap = Math.min(cap, 82);
  }
  if (coverage < 0.55) {
    add(-10, "looks hard to parse");
    cap = Math.min(cap, 74);
  }

  const riskHits = [...TRUST_RISK_TERMS].filter(term => tokenSet.has(term) || sld.includes(term));
  if (riskHits.length) {
    add(profile.strictTrust ? -10 : -5, `trust/risk word: ${riskHits.slice(0, 2).join(", ")}`);
    cap = Math.min(cap, profile.strictTrust ? 76 : 88);
  }

  // Names that are a target keyword plus a weak modifier often look SEO-ish rather than brandable.
  if (keywordHit && VAGUE_OR_WEAK_ENDINGS.has(last)) {
    add(-6, `weak modifier after keyword: ${last}`);
    cap = Math.min(cap, 86);
  }

  const positiveCount = reasons.filter(r => /natural|clear|crisp/.test(r)).length;
  const negativeCount = reasons.filter(r => /awkward|ambiguous|unclear|risk|weak|hard/.test(r)).length;
  let label = "Clean";
  if (negativeCount >= 2 || cap <= 78) label = "Awkward";
  else if (negativeCount === 1 || cap <= 86) label = "Tradeoff";
  else if (positiveCount >= 2) label = "Natural";

  return { adjust, cap, label, reasons };
}

function marketabilityAdjustment(ctx) {
  const { sldRaw, sld, len, knownTokens, coverage, targetKeywords, tokenSet, suffix, strengths, issues } = ctx;
  const reasons = [];
  let adjust = 0;
  const tokenCount = knownTokens.length;
  const lastToken = knownTokens[tokenCount - 1] || "";
  const firstToken = knownTokens[0] || "";
  const keywordHit = targetKeywords.some(k => k && sld.includes(k));

  function add(points, reason, positive = true) {
    adjust += points;
    reasons.push(reason);
    if (positive && points > 0) strengths.push(reason);
    if (!positive && points < 0) issues.push(reason);
  }

  // Extra spread: names that are short, purposeful, and easy to say should clearly separate from merely "fine" names.
  if (len >= 6 && len <= 10) add(5, "very compact");
  else if (len <= 12) add(4, "compact");
  else if (len <= 14) add(2, "reasonable length");
  else if (len >= 17 && len <= 19) add(-4, "getting long", false);
  else if (len >= 20) add(-8, "too long", false);

  if (tokenCount === 2) add(5, "clean two-word structure");
  else if (tokenCount === 3) add(2, "clear three-word structure");
  else if (tokenCount >= 4) add(-4, "too many words", false);
  if (tokenCount >= 5) add(-5, "crowded phrase", false);

  if (STRONG_PURPOSE_TERMS.has(lastToken)) add(5, `purpose word: ${lastToken}`);
  else if (VAGUE_OR_WEAK_ENDINGS.has(lastToken)) add(-5, `vague ending: ${lastToken}`, false);

  if (keywordHit && STRONG_PURPOSE_TERMS.has(lastToken) && tokenCount <= 3) add(4, "keyword plus buyer-intent word");
  if (suffix === "com" && len <= 13 && tokenCount >= 2 && tokenCount <= 3) add(3, "clean .com candidate");

  if (["my", "your", "own"].includes(firstToken)) add(-2, `soft prefix: ${firstToken}`, false);
  if (["easy", "simple"].includes(firstToken) && tokenCount >= 4) add(-2, `generic prefix: ${firstToken}`, false);
  if (coverage < 0.75) add(-4, "unclear word breaks", false);
  if (sldRaw.includes("-") || /\d/.test(sld)) add(-4, "typing friction", false);

  return { adjust, reasons };
}


function domainPatternSignals(ctx) {
  const { sldRaw, sld, knownTokens, tokenSet, coverage, targetKeywords } = ctx;
  const tokenCount = knownTokens.length;
  const first = knownTokens[0] || "";
  const last = knownTokens[tokenCount - 1] || "";
  const signals = [];
  const keywordHit = targetKeywords.some(k => k && (tokenSet.has(k) || sld.includes(k)));

  if (tokenCount === 2) signals.push("two_word");
  if (tokenCount === 3) signals.push("three_word");
  if (tokenCount >= 4) signals.push("long_phrase");
  if (PATTERN_MODIFIERS.has(first)) signals.push(`prefix:${first}`);
  if (PATTERN_PURPOSE_WORDS.has(last)) signals.push(`purpose:${last}`);
  if (WEAK_PATTERN_ENDINGS.has(last)) signals.push(`weak_end:${last}`);
  if (keywordHit && PATTERN_PURPOSE_WORDS.has(last)) signals.push("keyword_purpose");
  if (keywordHit && WEAK_PATTERN_ENDINGS.has(last)) signals.push("keyword_weak_end");
  if (tokenCount === 3 && PATTERN_MODIFIERS.has(first) && PATTERN_PURPOSE_WORDS.has(last)) signals.push("modifier_keyword_purpose");
  if (sldRaw.includes("-")) signals.push("hyphenated");
  if (/\d/.test(sld)) signals.push("numbered");
  if (coverage < 0.7) signals.push("low_parse_coverage");
  return signals;
}

function patternQualityAnalysis(ctx) {
  const { sldRaw, sld, len, knownTokens, coverage, targetKeywords, tokenSet, suffix, profile, strengths, issues } = ctx;
  const reasons = [];
  let adjust = 0;
  let cap = 97;
  const tokenCount = knownTokens.length;
  const first = knownTokens[0] || "";
  const last = knownTokens[tokenCount - 1] || "";
  const keywordHit = targetKeywords.some(k => k && (tokenSet.has(k) || sld.includes(k)));
  const hasPurposeEnd = PATTERN_PURPOSE_WORDS.has(last);
  const weakEnd = WEAK_PATTERN_ENDINGS.has(last);

  function add(points, reason, isIssue = points < 0) {
    adjust += points;
    reasons.push(reason);
    if (points > 0) strengths.push(reason);
    if (isIssue && points < 0) issues.push(reason);
  }

  if (tokenCount === 2 && keywordHit && hasPurposeEnd) add(8, "strong keyword+purpose pattern");
  else if (tokenCount === 2 && hasPurposeEnd) add(5, "clear two-word pattern");
  else if (tokenCount === 3 && PATTERN_MODIFIERS.has(first) && keywordHit && hasPurposeEnd) add(6, "modifier+keyword+purpose pattern");
  else if (tokenCount === 3 && keywordHit && hasPurposeEnd) add(4, "clear three-word pattern");
  else if (tokenCount >= 4) {
    add(-5, "too many pattern pieces");
    cap = Math.min(cap, 88);
  }

  if (weakEnd) {
    add(-7, `weak pattern ending: ${last}`);
    cap = Math.min(cap, profile.strictTrust ? 78 : 86);
  }
  if (keywordHit && weakEnd) {
    add(-3, "keyword with vague suffix");
    cap = Math.min(cap, 84);
  }
  if (PATTERN_MODIFIERS.has(first) && tokenCount >= 4) {
    add(-4, `extra modifier: ${first}`);
    cap = Math.min(cap, 86);
  }
  if (coverage < 0.72 && len >= 12) {
    add(-6, "unclear pattern split");
    cap = Math.min(cap, 82);
  }
  if (suffix === "com" && tokenCount >= 2 && tokenCount <= 3 && coverage >= 0.85 && !weakEnd) add(2, "clean .com pattern");
  if (sldRaw.includes("-") || /\d/.test(sld)) {
    add(-5, "pattern friction");
    cap = Math.min(cap, /\d/.test(sld) ? 72 : 78);
  }

  let label = "Balanced";
  if (adjust >= 8) label = "Strong";
  else if (adjust >= 4) label = "Good";
  else if (adjust <= -8 || cap <= 78) label = "Weak";
  else if (adjust < 0 || cap <= 86) label = "Tradeoff";
  return { adjust, cap, label, reasons };
}

function memorabilityAnalysis(ctx) {
  const { sldRaw, sld, len, knownTokens, coverage, tokenSet, suffix, strengths, issues } = ctx;
  const reasons = [];
  let adjust = 0;
  let cap = 97;
  const tokenCount = knownTokens.length;
  const vowels = (sld.match(/[aeiou]/g) || []).length;
  const vowelRatio = len ? vowels / len : 0;

  function add(points, reason, isIssue = points < 0) {
    adjust += points;
    reasons.push(reason);
    if (points > 0) strengths.push(reason);
    if (isIssue && points < 0) issues.push(reason);
  }

  if (len >= 6 && len <= 10) add(6, "easy to remember length");
  else if (len <= 13) add(4, "memorable length");
  else if (len <= 16) add(1, "acceptable length");
  else if (len >= 19) {
    add(-8, "harder to remember length");
    cap = Math.min(cap, 84);
  } else if (len >= 17) add(-4, "longer than ideal");

  if (tokenCount === 2) add(6, "two-word memory hook");
  else if (tokenCount === 3) add(2, "three-word memory hook");
  else if (tokenCount >= 4) {
    add(-5, "wordy memory load");
    cap = Math.min(cap, 86);
  }

  if (coverage >= 0.9) add(3, "clear word boundaries");
  else if (coverage < 0.7) {
    add(-6, "unclear word boundaries");
    cap = Math.min(cap, 82);
  }

  if (vowelRatio >= 0.25 && vowelRatio <= 0.55) add(2, "easy vowel balance");
  else if (vowelRatio < 0.18 || vowelRatio > 0.65) add(-3, "awkward vowel balance");
  if (MEMORABILITY_BAD_BIGRAMS.test(sld)) add(-5, "awkward letter cluster");
  if (/(.)\1\1/.test(sld)) add(-4, "repeated letters");
  if (sldRaw.includes("-") || /\d/.test(sld)) {
    add(-5, "harder to say/type");
    cap = Math.min(cap, /\d/.test(sld) ? 72 : 78);
  }
  if (suffix === "com" && !sldRaw.includes("-") && !/\d/.test(sld) && len <= 13) add(2, "simple .com recall");

  let label = "Clear";
  if (adjust >= 12) label = "Sticky";
  else if (adjust >= 6) label = "Memorable";
  else if (adjust <= -8 || cap <= 78) label = "Forgettable";
  else if (adjust < 0 || cap <= 86) label = "Tradeoff";
  return { adjust, cap, label, reasons };
}

function preferenceAdjustment(ctx) {
  const { sldRaw, sld, len, knownTokens, coverage, targetKeywords, tokenSet, preferenceModel, strengths, issues } = ctx;
  const reasons = [];
  const likedCount = preferenceModel?.liked?.length || 0;
  const dislikedCount = preferenceModel?.disliked?.length || 0;
  if (!likedCount && !dislikedCount) return { adjust: 0, label: "Neutral", reasons };

  let adjust = 0;
  function add(points, reason, isIssue = points < 0) {
    adjust += points;
    reasons.push(reason);
    if (points > 0) strengths.push(reason);
    if (isIssue && points < 0) issues.push(reason);
  }

  const signals = domainPatternSignals({ sldRaw, sld, knownTokens, tokenSet, coverage, targetKeywords });
  const seenTokens = new Set(knownTokens);
  let likedTermHits = 0;
  let dislikedTermHits = 0;
  for (const token of seenTokens) {
    const liked = preferenceModel.likedTerms.get(token) || 0;
    const disliked = preferenceModel.dislikedTerms.get(token) || 0;
    if (liked > disliked) {
      likedTermHits += 1;
      add(Math.min(3, liked - disliked), `matches liked word: ${token}`);
    } else if (disliked > liked) {
      dislikedTermHits += 1;
      add(-Math.min(4, disliked - liked + 1), `matches disliked word: ${token}`);
    }
  }

  let patternDelta = 0;
  for (const signal of signals) {
    patternDelta += (preferenceModel.likedPatterns.get(signal) || 0) - (preferenceModel.dislikedPatterns.get(signal) || 0);
  }
  if (patternDelta > 0) add(Math.min(5, patternDelta), "matches liked pattern");
  if (patternDelta < 0) add(Math.max(-6, patternDelta), "matches disliked pattern");

  if (Number.isFinite(preferenceModel.likedAvgLen)) {
    const distance = Math.abs(len - preferenceModel.likedAvgLen);
    if (distance <= 2) add(2, "near liked length");
    else if (distance >= 7 && likedCount >= 2) add(-2, "far from liked length");
  }
  if (Number.isFinite(preferenceModel.dislikedAvgLen)) {
    const distance = Math.abs(len - preferenceModel.dislikedAvgLen);
    if (distance <= 2 && dislikedCount >= 2) add(-3, "near disliked length");
  }

  adjust = Math.max(-12, Math.min(10, adjust));
  let label = "Neutral";
  if (adjust >= 5) label = "Liked fit";
  else if (adjust > 0) label = "Slight fit";
  else if (adjust <= -5) label = "Disliked fit";
  else if (adjust < 0) label = "Slight miss";

  if (likedTermHits && dislikedTermHits) reasons.push("mixed preference signals");
  return { adjust, label, reasons };
}

function calibrateScore(rawScore, ctx) {
  const { len, knownTokens, coverage, tokenSet, targetKeywords, suffix } = ctx;
  let value = rawScore;

  // Stretch the middle: avoid batches where every decent available .com lands at 79–80.
  if (value >= 72) value = 72 + (value - 72) * 1.18;
  else if (value < 60) value = 60 - (60 - value) * 1.08;

  const tokenCount = knownTokens.length;
  const lastToken = knownTokens[tokenCount - 1] || "";
  const keywordHit = targetKeywords.some(k => k && tokenSet.has(k));
  if (suffix === "com" && keywordHit && STRONG_PURPOSE_TERMS.has(lastToken) && len <= 13 && tokenCount <= 3 && coverage >= 0.85) {
    value += 3;
  }
  if (VAGUE_OR_WEAK_ENDINGS.has(lastToken) && len >= 14) value -= 4;
  if (tokenCount >= 4) value -= 3;
  return value;
}

function scorePenaltyDetails(ctx) {
  const { sldRaw, sld, knownTokens, coverage, targetKeywords, negativeWords, profile, issues } = ctx;
  const reasons = [];
  let total = 0;

  function add(points, reason) {
    total += points;
    reasons.push(reason);
  }

  if (sldRaw.includes("-")) add(9, "hyphen");
  if (/\d/.test(sld)) add(11, "number");
  if (/(.)\1\1/.test(sld)) add(5, "repeated characters");
  if (knownTokens.length > 4) add(4, "many words");
  if (knownTokens.length > 5) add(5, "wordy");
  if (coverage < 0.5) add(7, "hard to parse");

  const tokenSet = new Set(knownTokens);
  for (const [term, points] of DEFAULT_NEGATIVE_TERMS.entries()) {
    if (matchesTerm(term, tokenSet, sld)) add(points, term);
  }
  for (const [term, points] of Object.entries(profile.negatives || {})) {
    if (matchesTerm(term, tokenSet, sld)) add(points, `${term} in ${profile.label} mode`);
  }
  for (const word of negativeWords) {
    if (word && matchesTerm(word, tokenSet, sld)) add(12, `custom negative: ${word}`);
  }

  if (lenWithoutTarget(sld, targetKeywords) > 18 && targetKeywords.length) add(4, "long extra wording");
  if (sld.length > 18) add(Math.min(14, Math.ceil((sld.length - 18) * 1.6)), "extra length");

  if (total && reasons.length) issues.push(`penalty for ${reasons.slice(0, 3).join(", ")}`);
  return { total, reasons };
}

function matchesTerm(term, tokenSet, sld) {
  if (tokenSet.has(term)) return true;
  if (["247", "24"].includes(term)) return sld.includes(term);
  if (["pro", "plus"].includes(term)) return tokenSet.has(term) || sld.endsWith(term);
  return sld.includes(term);
}

function scoreCaps(ctx) {
  const { sldRaw, sld, len, coverage, targetKeywords, components, profile, phrase, pattern, memorability } = ctx;
  let cap = 97;
  const reasons = [];
  function apply(value, reason) {
    if (value < cap) {
      cap = value;
      reasons.push(reason);
    }
  }
  if (targetKeywords.length && components.keyword === 0 && !profile.keywordOptional) apply(76, "no target keyword");
  if (coverage < 0.65) apply(76, "harder to read");
  if (len > 22) apply(72, "very long");
  else if (len > 18) apply(84, "long name");
  if (sldRaw.includes("-")) apply(75, "hyphen");
  if (/\d/.test(sld)) apply(70, "number");
  if (/(wizard|genius|guru|ninja|hack|247|cheap)/.test(sld)) apply(profile.strictTrust ? 70 : 84, "gimmicky word");
  if (phrase && Number.isFinite(phrase.cap)) apply(phrase.cap, `phrase quality: ${phrase.label}`);
  if (pattern && Number.isFinite(pattern.cap)) apply(pattern.cap, `pattern quality: ${pattern.label}`);
  if (memorability && Number.isFinite(memorability.cap)) apply(memorability.cap, `memorability: ${memorability.label}`);
  return { cap, reasons };
}

function addStrengthsAndIssues(ctx) {
  const { suffix, len, targetKeywords, sld, sldRaw, knownTokens, coverage, tokenSet, components, strengths, issues, profile } = ctx;
  if (suffix === "com") strengths.push(".com extension");
  else issues.push(`${suffix || "non-standard"} TLD is less universal than .com`);

  if (len >= 6 && len <= 13) strengths.push("good length");
  else if (len > 18) issues.push("long name");
  else if (len <= 4) issues.push("very short, may be less descriptive");

  const keywordHits = targetKeywords.filter(k => k && sld.includes(k));
  if (targetKeywords.length) {
    if (keywordHits.length) strengths.push(`matches ${keywordHits.slice(0, 2).join(" + ")}`);
    else issues.push("does not include target keyword");
  }

  if (coverage >= 0.8 && knownTokens.length >= 2 && knownTokens.length <= 3) strengths.push("easy to parse");
  else if (coverage < 0.65) issues.push("harder to parse into words");

  if (!sldRaw.includes("-") && !/\d/.test(sld)) strengths.push("no hyphen or number");
  if (sldRaw.includes("-")) issues.push("hyphen hurts memorability");
  if (/\d/.test(sld)) issues.push("number hurts trust/readability");

  const profileHits = Object.keys(profile.positives || {}).filter(t => tokenSet.has(t) || sld.includes(t));
  if (profileHits.length) strengths.push(`${profile.label} fit: ${profileHits.slice(0, 2).join(", ")}`);
  if (components.intent >= Math.max(6, Math.round(profile.weights.intent * 0.7))) strengths.push("clear user intent word");
}

function buildScoreExplanation(score, label, strengths, issues) {
  const badges = [];
  const joined = strengths.join(" ").toLowerCase();
  const issueText = issues.join(" ").toLowerCase();
  if (joined.includes(".com")) badges.push(".com");
  if (joined.includes("very compact") || joined.includes("compact") || joined.includes("good length")) badges.push("short");
  if (joined.includes("matches") || joined.includes("keyword")) badges.push("keyword fit");
  if (joined.includes("purpose") || joined.includes("intent")) badges.push("buyer intent");
  if (joined.includes("pattern")) badges.push("strong pattern");
  if (joined.includes("remember") || joined.includes("memory") || joined.includes("sticky")) badges.push("memorable");
  if (joined.includes("liked")) badges.push("preference fit");
  if (joined.includes("natural phrase") || joined.includes("clear keyword phrase")) badges.push("natural phrase");
  if (joined.includes("easy to parse") || joined.includes("two-word") || joined.includes("three-word")) badges.push("clear");
  if (joined.includes("no hyphen")) badges.push("clean");
  if (!badges.length) badges.push("baseline");

  let tradeoff = "no major tradeoffs";
  if (issueText.includes("awkward") || issueText.includes("ambiguous")) tradeoff = "awkward phrase";
  else if (issueText.includes("harder to parse") || issueText.includes("unclear")) tradeoff = "parse tradeoff";
  else if (issueText.includes("gimmicky") || issueText.includes("trust/risk")) tradeoff = "trust tradeoff";
  else if (issueText.includes("disliked")) tradeoff = "preference tradeoff";
  else if (issueText.includes("pattern")) tradeoff = "pattern tradeoff";
  else if (issueText.includes("memory") || issueText.includes("forgettable")) tradeoff = "memory tradeoff";
  else if (issueText.includes("long")) tradeoff = "longer name";
  else if (issues.length) tradeoff = issues[0];

  return `${score} · ${label} · ${[...new Set(badges)].slice(0, 4).join(" · ")} · ${tradeoff}`;
}

function scoreLabel(score) {
  if (score >= 95) return "Excellent";
  if (score >= 88) return "Strong";
  if (score >= 76) return "Good";
  if (score >= 62) return "Okay";
  if (score >= 45) return "Weak";
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
  const dictionary = [...new Set([...targetKeywords, ...positiveWords, ...negativeWords, ...QUALITY_WORDS, ...GENERIC_DOMAIN_WORDS])]
    .map(cleanKeyword)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  const chunks = String(sldRaw || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const tokens = [];
  for (const chunk of chunks) tokens.push(...tokenizeChunk(chunk, dictionary));
  return tokens;
}

function tokenizeChunk(chunk, dictionary) {
  const tokens = [];
  let i = 0;
  while (i < chunk.length) {
    const match = dictionary.find(word => word.length >= 2 && chunk.startsWith(word, i));
    if (match) {
      tokens.push({ text: match, unknown: false });
      i += match.length;
      continue;
    }

    let unknown = chunk[i];
    i += 1;
    while (i < chunk.length && !dictionary.some(word => word.length >= 2 && chunk.startsWith(word, i))) {
      unknown += chunk[i];
      i += 1;
    }
    tokens.push({ text: unknown, unknown: true });
  }
  return tokens;
}

function scoreBand(score) {
  if (score >= 95) return "excellent domain quality";
  if (score >= 88) return "strong domain quality";
  if (score >= 76) return "good but has tradeoffs";
  if (score >= 62) return "usable but weaker";
  return "weak domain quality";
}

function similarityKey(domain) {
  if (!domain) return "";
  const sldRaw = secondLevelName(domain).toLowerCase();
  const sld = sldRaw.replace(/[^a-z0-9]/g, "");
  const tokens = tokenizeDomainName(sldRaw, getKeywords(), getPositiveWords(), getNegativeWords())
    .filter(t => !t.unknown)
    .map(t => t.text);
  if (!tokens.length) return sld;

  let core = tokens.filter(t => !SOFT_MODIFIERS.has(t));
  if (core.length < 2) core = tokens;
  // Keep original order so "taxhelp" and "helptax" can still be distinguished when appropriate,
  // but remove soft prefixes like my/easy/diy so close variants group together.
  return core.slice(0, 5).join("|") || sld;
}

function buildGroupInfo(rows) {
  const groups = new Map();
  for (const raw of rows.filter(Boolean)) {
    const row = enhanceResult(raw);
    const key = row.similarity_key || similarityKey(row.normalized_domain);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const info = new Map();
  for (const [key, groupRows] of groups.entries()) {
    const ranked = [...groupRows].sort((a, b) => availabilitySortValue(a) - availabilitySortValue(b)
      || Number(b.domain_score || 0) - Number(a.domain_score || 0)
      || Number(a.name_length || 999) - Number(b.name_length || 999)
      || String(a.normalized_domain).localeCompare(String(b.normalized_domain)));
    ranked.forEach((row, index) => {
      info.set(row.normalized_domain, {
        key,
        count: ranked.length,
        rank: index + 1,
        bestDomain: ranked[0]?.normalized_domain || "",
        bestScore: ranked[0]?.domain_score || 0
      });
    });
  }
  return info;
}

function groupDisplay(row, groupInfo) {
  const info = groupInfo.get(row.normalized_domain);
  if (!info || info.count <= 1) return `<span class="group-pill unique">Unique</span>`;
  if (info.rank === 1) return `<span class="group-pill best">Best of ${info.count}</span>`;
  return `<span class="group-pill variant">Variant ${info.rank}/${info.count}</span><div class="subtle">Best: ${escapeHtml(info.bestDomain)}</div>`;
}

function pickDiverseRows(rows, limit) {
  const sorted = [...rows].sort((a, b) => Number(b.domain_score || 0) - Number(a.domain_score || 0)
    || Number(a.name_length || 999) - Number(b.name_length || 999)
    || String(a.normalized_domain).localeCompare(String(b.normalized_domain)));
  if (!TOP_PICK_DIVERSITY_FILL) return sorted.slice(0, limit);

  const picks = [];
  const seenGroups = new Set();
  for (const row of sorted) {
    const key = row.similarity_key || similarityKey(row.normalized_domain);
    if (key && seenGroups.has(key)) continue;
    picks.push(row);
    if (key) seenGroups.add(key);
    if (picks.length >= limit) return picks;
  }
  for (const row of sorted) {
    if (picks.some(p => p.normalized_domain === row.normalized_domain)) continue;
    picks.push(row);
    if (picks.length >= limit) break;
  }
  return picks;
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
    phrase_quality: score.phraseQuality || "",
    phrase_reasons: score.phraseReasons ? score.phraseReasons.join("; ") : "",
    pattern_quality: score.patternQuality || "",
    pattern_reasons: score.patternReasons ? score.patternReasons.join("; ") : "",
    memorability: score.memorability || "",
    memorability_reasons: score.memorabilityReasons ? score.memorabilityReasons.join("; ") : "",
    preference_fit: score.preferenceLabel || "",
    preference_reasons: score.preferenceReasons ? score.preferenceReasons.join("; ") : "",
    scoring_style: score.style || getScoringProfile().label,
    similarity_key: similarityKey(result.normalized_domain || "")
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
      const haystack = [row.input, domain, row.availability_status, row.check_source, row.notes, row.error, row.score_label, row.score_explanation, row.phrase_quality, row.phrase_reasons, row.pattern_quality, row.pattern_reasons, row.memorability, row.memorability_reasons, row.preference_fit, row.preference_reasons, row.score_notes]
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
  if (status === "top_picks") rows = pickDiverseRows(rows.filter(r => r.available === true), topPickLimit());
  return rows;
}

function renderResults() {
  const visibleRows = displayedResults();
  if (!results.length || results.every(r => !r)) {
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="17">No results yet.</td></tr>';
    el.visibleCount.textContent = "0 visible";
    updateSummary();
    return;
  }

  if (!visibleRows.length) {
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="17">No rows match the current filters.</td></tr>';
    el.visibleCount.textContent = `0 visible of ${results.filter(Boolean).length}`;
    updateSummary();
    return;
  }

  const groupInfo = buildGroupInfo(results.filter(Boolean));
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
      <td><span class="phrase-pill phrase-${phraseClass(result.phrase_quality)}" title="${escapeAttr(result.phrase_reasons || "")}">${escapeHtml(result.phrase_quality || "")}</span></td>
      <td><span class="signal-pill signal-${signalClass(result.pattern_quality)}" title="${escapeAttr(result.pattern_reasons || "")}">${escapeHtml(result.pattern_quality || "")}</span></td>
      <td><span class="signal-pill signal-${signalClass(result.memorability)}" title="${escapeAttr(result.memorability_reasons || "")}">${escapeHtml(result.memorability || "")}</span></td>
      <td><span class="signal-pill signal-${signalClass(result.preference_fit)}" title="${escapeAttr(result.preference_reasons || "")}">${escapeHtml(result.preference_fit || "")}</span></td>
      <td>${groupDisplay(result, groupInfo)}</td>
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
  if (value >= 88) return "high";
  if (value >= 62) return "mid";
  return "low";
}

function phraseClass(label) {
  const value = String(label || "").toLowerCase();
  if (value.includes("natural") || value.includes("clean")) return "good";
  if (value.includes("tradeoff")) return "warn";
  if (value.includes("awkward")) return "bad";
  return "neutral";
}

function signalClass(label) {
  const value = String(label || "").toLowerCase();
  if (value.includes("strong") || value.includes("good") || value.includes("sticky") || value.includes("memorable") || value.includes("liked")) return "good";
  if (value.includes("tradeoff") || value.includes("slight")) return "warn";
  if (value.includes("weak") || value.includes("forgettable") || value.includes("disliked")) return "bad";
  return "neutral";
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
  return clampNumber(el.topPickCountInput?.value || 25, 1, 100, 25);
}

function topPickRows() {
  const available = results
    .filter(r => r && r.available === true)
    .map(enhanceResult)
    .sort((a, b) => Number(b.domain_score || 0) - Number(a.domain_score || 0)
      || Number(a.name_length || 999) - Number(b.name_length || 999)
      || String(a.normalized_domain).localeCompare(String(b.normalized_domain)));
  return pickDiverseRows(available, topPickLimit());
}

function showTopPicks() {
  el.filterStatus.value = "top_picks";
  el.sortSelect.value = "score_desc";
  const picks = topPickRows();
  const cutoff = picks.length ? Number(picks[picks.length - 1].domain_score || 0) : 0;
  el.filterSearch.value = "";
  renderResults();
  setStatus(picks.length ? `Showing ${picks.length} diverse top picks. Lowest visible quality score: ${cutoff}. Use Copy top picks or Open top picks.` : "No possibly available rows to show as top picks.");
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
    "score_explanation", "phrase_quality", "phrase_reasons", "pattern_quality", "pattern_reasons", "memorability", "memorability_reasons", "preference_fit", "preference_reasons", "scoring_style", "score_components", "score_notes", "similarity_key",
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
    likedExamples: el.likedExamplesInput?.value || "",
    dislikedExamples: el.dislikedExamplesInput?.value || "",
    topPickCount: el.topPickCountInput?.value || "25",
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
  if (settings.likedExamples !== undefined && el.likedExamplesInput) el.likedExamplesInput.value = settings.likedExamples;
  if (settings.dislikedExamples !== undefined && el.dislikedExamplesInput) el.dislikedExamplesInput.value = settings.dislikedExamples;
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
    positiveWords: "", negativeWords: "", likedExamples: "", dislikedExamples: "", topPickCount: "25", useRdap: true, useDns: true, dedupe: true,
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

  const scoringControls = [el.keywordsInput, el.scoringStyleInput, el.positiveWordsInput, el.negativeWordsInput, el.likedExamplesInput, el.dislikedExamplesInput];
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
