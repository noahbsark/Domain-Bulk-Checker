/* Domain Shortlist - public beta static GitHub Pages app */
const UI_VERSION = "v92-scale-layout-fix-2026-06-19";

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
const SCORING_VERSION = "v16-public-buyer-calibration-2026-06-15";
const APP_PERFORMANCE_VERSION = "large-batch-v14-2026-06-14";
const INITIAL_RENDER_LIMIT = 150;
const RENDER_LIMIT_STEP = 250;
const CHECK_RENDER_INTERVAL_MS = 900;
const STATE_KEY = "domainCheckerStateV6"; // keep old key so saved batches rescore after upgrades
const FIRST_RUN_DISMISSED_KEY = "domainShortlistFirstRunDismissedV1";
const SIMPLE_ONBOARDING_DISMISSED_KEY = "domainShortlistSimpleOnboardingDismissedV1";
const START_OVER_UNDO_KEY = "domainShortlistStartOverUndoV1";
const COMPARE_LIMIT = 5;
const SAVED_SHORTLIST_KEY = "domainShortlistSavedDomainsV1";
const SAVED_NOTES_KEY = "domainShortlistSavedNotesV1";
const SAVED_CHECKED_KEY = "domainShortlistSavedCheckedV1";
const SAVED_WINNER_KEY = "domainShortlistSavedWinnerV1";
const SESSION_ARCHIVES_KEY = "domainShortlistSessionArchivesV1";
const SESSION_ARCHIVE_LIMIT_KEY = "domainShortlistArchiveLimitV1";
const SESSION_ARCHIVE_DEFAULT_LIMIT = 5;
const SESSION_ARCHIVE_LIMIT_OPTIONS = [5, 10, 25];
const RECENT_RUNS_KEY = "domainShortlistRecentRunsV1";
const RECENT_RUN_LIMIT = 6;
const RECENT_RUN_MAX_ROWS = 200;
// Public launch mode keeps the visitor experience simple while leaving owner tools available with ?owner=1.
const PUBLIC_LAUNCH_MODE = true;
// Edit these three constants later when the final public name/domain are chosen.
const PUBLIC_SITE_NAME = "Domain Shortlist";
const PUBLIC_SITE_TAGLINE = "Find the best domain names from your list.";
const PUBLIC_SITE_URL = "https://noahbsark.github.io/Domain-Bulk-Checker/";


const el = {
  inputBox: document.getElementById("inputBox"),
  simpleCheckBtn: document.getElementById("simpleCheckBtn"),
  inputCount: document.getElementById("inputCount"),
  fileInput: document.getElementById("fileInput"),
  loadTxtBtn: document.getElementById("loadTxtBtn"),
  clearInputBtn: document.getElementById("clearInputBtn"),
  pasteDemoBtn: document.getElementById("pasteDemoBtn"),
  heroSampleBtn: document.getElementById("heroSampleBtn"),
  shareAppLinkBtn: document.getElementById("shareAppLinkBtn"),
  guidedPasteFocusBtn: document.getElementById("guidedPasteFocusBtn"),
  guidedSampleBtn: document.getElementById("guidedSampleBtn"),
  guidedFastModeBtn: document.getElementById("guidedFastModeBtn"),
  inputCoachPanel: document.getElementById("inputCoachPanel"),
  inputCoachTitle: document.getElementById("inputCoachTitle"),
  inputCoachText: document.getElementById("inputCoachText"),
  editInputBtn: document.getElementById("editInputBtn"),
  inputPreviewPanel: document.getElementById("inputPreviewPanel"),
  inputPreviewHeadline: document.getElementById("inputPreviewHeadline"),
  inputPreviewDetails: document.getElementById("inputPreviewDetails"),
  previewValidCount: document.getElementById("previewValidCount"),
  previewDuplicateCount: document.getElementById("previewDuplicateCount"),
  previewInvalidCount: document.getElementById("previewInvalidCount"),
  previewMissingCount: document.getElementById("previewMissingCount"),
  invalidReviewList: document.getElementById("invalidReviewList"),
  previewCheckBtn: document.getElementById("previewCheckBtn"),
  previewReviewInvalidBtn: document.getElementById("previewReviewInvalidBtn"),
  previewCopyCleanBtn: document.getElementById("previewCopyCleanBtn"),
  largeListPanel: document.getElementById("largeListPanel"),
  largeListHeadline: document.getElementById("largeListHeadline"),
  largeListDetails: document.getElementById("largeListDetails"),
  largeListScoreOnlyBtn: document.getElementById("largeListScoreOnlyBtn"),
  largeListDismissBtn: document.getElementById("largeListDismissBtn"),
  advancedModeInput: document.getElementById("advancedModeInput"),
  workersInput: document.getElementById("workersInput"),
  delayInput: document.getElementById("delayInput"),
  timeoutInput: document.getElementById("timeoutInput"),
  keywordsInput: document.getElementById("keywordsInput"),
  registrarInput: document.getElementById("registrarInput"),
  priceOpenLimitInput: document.getElementById("priceOpenLimitInput"),
  affiliateTestDomainInput: document.getElementById("affiliateTestDomainInput"),
  affiliateTestBtn: document.getElementById("affiliateTestBtn"),
  affiliateCopyTestBtn: document.getElementById("affiliateCopyTestBtn"),
  affiliateConfigStatus: document.getElementById("affiliateConfigStatus"),
  useRdapInput: document.getElementById("useRdapInput"),
  useDnsInput: document.getElementById("useDnsInput"),
  scoreOnlyInput: document.getElementById("scoreOnlyInput"),
  dedupeInput: document.getElementById("dedupeInput"),
  scoringStyleInput: document.getElementById("scoringStyleInput"),
  positiveWordsInput: document.getElementById("positiveWordsInput"),
  negativeWordsInput: document.getElementById("negativeWordsInput"),
  topPickCountInput: document.getElementById("topPickCountInput"),
  showTopPicksBtn: document.getElementById("showTopPicksBtn"),
  copyTopPicksBtn: document.getElementById("copyTopPicksBtn"),
  openTopPicksBtn: document.getElementById("openTopPicksBtn"),
  topPicksCards: document.getElementById("topPicksCards"),
  topPicksEmpty: document.getElementById("topPicksEmpty"),
  topPicksCount: document.getElementById("topPicksCount"),
  topSavedCountBadge: document.getElementById("topSavedCountBadge"),
  topPicksShowMoreBtn: document.getElementById("topPicksShowMoreBtn"),
  showNextPickBtn: document.getElementById("showNextPickBtn"),
  topPicksViewAllBtn: document.getElementById("topPicksViewAllBtn"),
  topPicksNewSearchBtn: document.getElementById("topPicksNewSearchBtn"),
  topPicksPriceLimitNote: document.getElementById("topPicksPriceLimitNote"),
  compareTray: document.getElementById("compareTray"),
  compareCount: document.getElementById("compareCount"),
  compareItems: document.getElementById("compareItems"),
  compareClearBtn: document.getElementById("compareClearBtn"),
  compareOpenBtn: document.getElementById("compareOpenBtn"),
  compareCopyBtn: document.getElementById("compareCopyBtn"),
  compareHint: document.getElementById("compareHint"),
  savedShortlistPanel: document.getElementById("savedShortlistPanel"),
  savedShortlistCount: document.getElementById("savedShortlistCount"),
  savedCheckedCount: document.getElementById("savedCheckedCount"),
  savedShortlistItems: document.getElementById("savedShortlistItems"),
  savedShortlistEmpty: document.getElementById("savedShortlistEmpty"),
  savedDecisionPanel: document.getElementById("savedDecisionPanel"),
  savedDecisionCount: document.getElementById("savedDecisionCount"),
  savedDecisionContent: document.getElementById("savedDecisionContent"),
  savedCheckPriceBtn: document.getElementById("savedCheckPriceBtn"),
  savedReportBtn: document.getElementById("savedReportBtn"),
  savedCopyBtn: document.getElementById("savedCopyBtn"),
  savedCopyWinnerBtn: document.getElementById("savedCopyWinnerBtn"),
  savedOpenWinnerBtn: document.getElementById("savedOpenWinnerBtn"),
  savedCopyWinnerLinkBtn: document.getElementById("savedCopyWinnerLinkBtn"),
  savedCopyWinnerReportBtn: document.getElementById("savedCopyWinnerReportBtn"),
  savedDoneBtn: document.getElementById("savedDoneBtn"),
  savedNewSearchAfterDoneBtn: document.getElementById("savedNewSearchAfterDoneBtn"),
  savedCopyLinksBtn: document.getElementById("savedCopyLinksBtn"),
  savedCopyUncheckedLinksBtn: document.getElementById("savedCopyUncheckedLinksBtn"),
  savedCopyUncheckedNamesBtn: document.getElementById("savedCopyUncheckedNamesBtn"),
  savedOpenUncheckedBtn: document.getElementById("savedOpenUncheckedBtn"),
  savedOpenRemainingBtn: document.getElementById("savedOpenRemainingBtn"),
  savedFinishHint: document.getElementById("savedFinishHint"),
  savedFinishText: document.getElementById("savedFinishText"),
  savedWinnerHint: document.getElementById("savedWinnerHint"),
  savedWinnerHintText: document.getElementById("savedWinnerHintText"),
  savedDoneSummary: document.getElementById("savedDoneSummary"),
  savedReadyCard: document.getElementById("savedReadyCard"),
  savedReadyTitle: document.getElementById("savedReadyTitle"),
  savedReadyText: document.getElementById("savedReadyText"),
  savedReadyPriceBtn: document.getElementById("savedReadyPriceBtn"),
  savedReadyNewSearchBtn: document.getElementById("savedReadyNewSearchBtn"),
  savedViewOnlyBtn: document.getElementById("savedViewOnlyBtn"),
  savedShowUncheckedBtn: document.getElementById("savedShowUncheckedBtn"),
  savedClearNotesBtn: document.getElementById("savedClearNotesBtn"),
  savedClearCheckedBtn: document.getElementById("savedClearCheckedBtn"),
  savedClearWinnerBtn: document.getElementById("savedClearWinnerBtn"),
  savedClearCompletedBtn: document.getElementById("savedClearCompletedBtn"),
  archiveSessionBtn: document.getElementById("archiveSessionBtn"),
  archiveDownloadCurrentBtn: document.getElementById("archiveDownloadCurrentBtn"),
  archiveImportBtn: document.getElementById("archiveImportBtn"),
  archiveImportSaveBtn: document.getElementById("archiveImportSaveBtn"),
  archiveDownloadAllBtn: document.getElementById("archiveDownloadAllBtn"),
  archiveImportInput: document.getElementById("archiveImportInput"),
  archiveCurrentSummary: document.getElementById("archiveCurrentSummary"),
  archiveSearchInput: document.getElementById("archiveSearchInput"),
  archiveSearchClearBtn: document.getElementById("archiveSearchClearBtn"),
  archiveClearAllBtn: document.getElementById("archiveClearAllBtn"),
  archiveHealthBtn: document.getElementById("archiveHealthBtn"),
  archiveRepairLabelsBtn: document.getElementById("archiveRepairLabelsBtn"),
  archiveClearBrokenBtn: document.getElementById("archiveClearBrokenBtn"),
  archiveMergeDuplicateLabelsBtn: document.getElementById("archiveMergeDuplicateLabelsBtn"),
  archiveLimitSelect: document.getElementById("archiveLimitSelect"),
  archiveHealthSummary: document.getElementById("archiveHealthSummary"),
  archiveStorageSummary: document.getElementById("archiveStorageSummary"),
  archiveCountSummary: document.getElementById("archiveCountSummary"),
  archiveList: document.getElementById("archiveList"),
  archiveListEmpty: document.getElementById("archiveListEmpty"),
  savedExportBtn: document.getElementById("savedExportBtn"),
  savedClearBtn: document.getElementById("savedClearBtn"),
  finalReportPanel: document.getElementById("finalReportPanel"),
  finalReportCount: document.getElementById("finalReportCount"),
  finalReportText: document.getElementById("finalReportText"),
  finalReportCopyBtn: document.getElementById("finalReportCopyBtn"),
  finalReportCleanBtn: document.getElementById("finalReportCleanBtn"),
  finalReportDownloadCleanBtn: document.getElementById("finalReportDownloadCleanBtn"),
  finalReportDownloadBtn: document.getElementById("finalReportDownloadBtn"),
  finalReportPriceBtn: document.getElementById("finalReportPriceBtn"),
  finalReportShareBtn: document.getElementById("finalReportShareBtn"),
  recentRunsPanel: document.getElementById("recentRunsPanel"),
  recentRunsCount: document.getElementById("recentRunsCount"),
  recentRunsItems: document.getElementById("recentRunsItems"),
  recentRunsEmpty: document.getElementById("recentRunsEmpty"),
  recentRunsClearBtn: document.getElementById("recentRunsClearBtn"),
  returnUserPanel: document.getElementById("returnUserPanel"),
  returnUserHeadline: document.getElementById("returnUserHeadline"),
  returnUserDetails: document.getElementById("returnUserDetails"),
  returnCheckSavedBtn: document.getElementById("returnCheckSavedBtn"),
  returnRestoreRecentBtn: document.getElementById("returnRestoreRecentBtn"),
  returnViewSavedBtn: document.getElementById("returnViewSavedBtn"),
  simpleOnboardingPanel: document.getElementById("simpleOnboardingPanel"),
  simpleOnboardingSampleBtn: document.getElementById("simpleOnboardingSampleBtn"),
  simpleOnboardingPasteBtn: document.getElementById("simpleOnboardingPasteBtn"),
  simpleOnboardingDismissBtn: document.getElementById("simpleOnboardingDismissBtn"),
  startOverBtn: document.getElementById("startOverBtn"),
  undoStartOverPanel: document.getElementById("undoStartOverPanel"),
  undoStartOverBtn: document.getElementById("undoStartOverBtn"),
  dismissStartOverUndoBtn: document.getElementById("dismissStartOverUndoBtn"),
  analyticsStatus: document.getElementById("analyticsStatus"),
  analyticsEndpointStatus: document.getElementById("analyticsEndpointStatus"),
  analyticsDebugCount: document.getElementById("analyticsDebugCount"),
  analyticsDebugPreview: document.getElementById("analyticsDebugPreview"),
  analyticsTestBtn: document.getElementById("analyticsTestBtn"),
  analyticsCopyBtn: document.getElementById("analyticsCopyBtn"),
  analyticsClearBtn: document.getElementById("analyticsClearBtn"),
  stickyPriceBar: document.getElementById("stickyPriceBar"),
  stickyPriceHeadline: document.getElementById("stickyPriceHeadline"),
  stickyPriceDetails: document.getElementById("stickyPriceDetails"),
  stickyOpenTopPicksBtn: document.getElementById("stickyOpenTopPicksBtn"),
  stickyViewAllBtn: document.getElementById("stickyViewAllBtn"),
  stickyNewSearchBtn: document.getElementById("stickyNewSearchBtn"),
  firstRunPanel: document.getElementById("firstRunPanel"),
  firstRunDismissBtn: document.getElementById("firstRunDismissBtn"),
  domainDetailOverlay: document.getElementById("domainDetailOverlay"),
  domainDetailDrawer: document.getElementById("domainDetailDrawer"),
  domainDetailTitle: document.getElementById("domainDetailTitle"),
  domainDetailContent: document.getElementById("domainDetailContent"),
  domainDetailCloseBtn: document.getElementById("domainDetailCloseBtn"),
  nextViewAllBtn: document.getElementById("nextViewAllBtn"),
  cardOpenTopPicksBtn: document.getElementById("cardOpenTopPicksBtn"),
  cardCheckBestChoiceBtn: document.getElementById("cardCheckBestChoiceBtn"),
  cardCopyTopPicksBtn: document.getElementById("cardCopyTopPicksBtn"),
  cardCopyBestChoiceBtn: document.getElementById("cardCopyBestChoiceBtn"),
  cardCopyBest3Btn: document.getElementById("cardCopyBest3Btn"),
  cardCopyBestReasonsBtn: document.getElementById("cardCopyBestReasonsBtn"),
  cardCopyPriceLinksBtn: document.getElementById("cardCopyPriceLinksBtn"),
  hideWeakPicksBtn: document.getElementById("hideWeakPicksBtn"),
  cardExportTopPicksBtn: document.getElementById("cardExportTopPicksBtn"),
  nextStepsPanel: document.getElementById("nextStepsPanel"),
  nextStepsHeadline: document.getElementById("nextStepsHeadline"),
  nextStepsDetails: document.getElementById("nextStepsDetails"),
  nextShowTopPicksBtn: document.getElementById("nextShowTopPicksBtn"),
  nextExportTopPicksBtn: document.getElementById("nextExportTopPicksBtn"),
  nextOpenTopPicksBtn: document.getElementById("nextOpenTopPicksBtn"),
  bestNextActionPanel: document.getElementById("bestNextActionPanel"),
  bestNextActionTitle: document.getElementById("bestNextActionTitle"),
  bestNextActionText: document.getElementById("bestNextActionText"),
  bestNextPrimaryBtn: document.getElementById("bestNextPrimaryBtn"),
  bestNextSecondaryBtn: document.getElementById("bestNextSecondaryBtn"),
  ownerChecklistPanel: document.getElementById("ownerChecklistPanel"),
  ownerChecklistList: document.getElementById("ownerChecklistList"),
  copyLaunchNeedsBtn: document.getElementById("copyLaunchNeedsBtn"),
  ownerLaunchInputsPanel: document.getElementById("ownerLaunchInputsPanel"),
  copyLaunchInputsRequestBtn: document.getElementById("copyLaunchInputsRequestBtn"),
  ownerFinalReplacePanel: document.getElementById("ownerFinalReplacePanel"),
  ownerFinalReplaceList: document.getElementById("ownerFinalReplaceList"),
  copyFinalLaunchChecklistBtn: document.getElementById("copyFinalLaunchChecklistBtn"),
  ownerPreflightPanel: document.getElementById("ownerPreflightPanel"),
  preflightStatus: document.getElementById("preflightStatus"),
  preflightResults: document.getElementById("preflightResults"),
  runPreflightBtn: document.getElementById("runPreflightBtn"),
  copyPreflightReportBtn: document.getElementById("copyPreflightReportBtn"),
  checkBtn: document.getElementById("checkBtn"),
  stopBtn: document.getElementById("stopBtn"),
  removeTakenBtn: document.getElementById("removeTakenBtn"),
  removeUnsavedBtn: document.getElementById("removeUnsavedBtn"),
  keepAvailableBtn: document.getElementById("keepAvailableBtn"),
  openAllBtn: document.getElementById("openAllBtn"),
  openAvailableBtn: document.getElementById("openAvailableBtn"),
  openFavoritesBtn: document.getElementById("openFavoritesBtn"),
  openAllTopPicksBtn: document.getElementById("openAllTopPicksBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportFavoritesBtn: document.getElementById("exportFavoritesBtn"),
  exportTopPicksBtn: document.getElementById("exportTopPicksBtn"),
  copyAvailableBtn: document.getElementById("copyAvailableBtn"),
  copyFavoritesBtn: document.getElementById("copyFavoritesBtn"),
  copyVisibleBtn: document.getElementById("copyVisibleBtn"),
  copyVisibleResultsBtn: document.getElementById("copyVisibleResultsBtn"),
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
  resultPlainSummary: document.getElementById("resultPlainSummary"),
  filterStatus: document.getElementById("filterStatus"),
  filterSearch: document.getElementById("filterSearch"),
  filterTld: document.getElementById("filterTld"),
  filterMaxLen: document.getElementById("filterMaxLen"),
  filterNoHyphen: document.getElementById("filterNoHyphen"),
  filterNoNumbers: document.getElementById("filterNoNumbers"),
  sortSelect: document.getElementById("sortSelect"),
  visibleCount: document.getElementById("visibleCount"),
  allResultsTotal: document.getElementById("allResultsTotal"),
  allResultsWorth: document.getElementById("allResultsWorth"),
  allResultsStrong: document.getElementById("allResultsStrong"),
  allResultsCom: document.getElementById("allResultsCom"),
  allResultsSaved: document.getElementById("allResultsSaved"),
  allResultsHelper: document.getElementById("allResultsHelper"),
  allResultsBackTopPicksBtn: document.getElementById("allResultsBackTopPicksBtn"),
  allResultsDensityBtn: document.getElementById("allResultsDensityBtn"),
  allResultsSortPills: document.getElementById("allResultsSortPills"),
  copyWorthCheckingBtn: document.getElementById("copyWorthCheckingBtn"),
  copyVisibleWorthReasonsBtn: document.getElementById("copyVisibleWorthReasonsBtn"),
  saveVisibleWorthCheckingBtn: document.getElementById("saveVisibleWorthCheckingBtn"),
  undoSaveVisibleBtn: document.getElementById("undoSaveVisibleBtn"),
  allResultsBadgeLegend: document.getElementById("allResultsBadgeLegend"),
  hideWeakNamesBtn: document.getElementById("hideWeakNamesBtn"),
  resultsCleanedNotice: document.getElementById("resultsCleanedNotice"),
  resultsCleanedText: document.getElementById("resultsCleanedText"),
  showEverythingResultsBtn: document.getElementById("showEverythingResultsBtn"),
  takenToggleBtn: document.getElementById("takenToggleBtn"),
  takenCollapseNote: document.getElementById("takenCollapseNote"),
  editResultsFiltersBtn: document.getElementById("editResultsFiltersBtn"),
  saveAllWorthCheckingBtn: document.getElementById("saveAllWorthCheckingBtn"),
  resultCards: document.getElementById("resultCards"),
  renderedCount: document.getElementById("renderedCount"),
  showMoreBtn: document.getElementById("showMoreBtn"),
  showAllRowsBtn: document.getElementById("showAllRowsBtn"),
  resultsBody: document.getElementById("resultsBody")
};

let results = [];
let favorites = new Set();
let rdapBootstrap = null;
let stopRequested = false;
let isChecking = false;
let renderRowLimit = INITIAL_RENDER_LIMIT;
let topPicksExpanded = false;
let guidedPickCount = 3;
let pendingRenderTimer = null;
let lastRenderAt = 0;
let resultQuickPreset = "all";
let resultBadgeFilter = "all";
let resultsFiltersOpen = false;
let compareSet = new Set();
let savedShortlist = new Set();
let savedNotes = {};
let savedChecked = new Set();
let savedWinner = "";
let winnerDoneShown = false;
let savedShowUncheckedOnly = false;
let allResultsComfortable = false;
let showTakenResults = false;
let resultCardFeedback = { domain: "", message: "", type: "", expires: 0, timer: null };
let lastBulkSaveChanges = [];
let archiveSearchQuery = "";
let archiveImportMode = "restore";
let recentRuns = [];
let hideWeakPicks = false;
let invalidPreviewOpen = false;
let bestNextPrimaryAction = "focus_input";
let bestNextSecondaryAction = "load_sample";

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

  // Beginner-friendly cleanup: allow pasted phrases like "best startup idea.io"
  // by turning spaces into a registrable domain candidate before URL parsing.
  if (/\s/.test(value) && !/[/?#@]/.test(value) && !/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    value = value.replace(/\s+/g, "");
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

// Affiliate configuration.
// Leave enabled=false for normal direct price-check links.
// To use an affiliate network, set enabled=true and paste the tracking template you receive.
// Templates can use these placeholders:
//   {url} or {url_encoded}       encoded registrar destination URL
//   {url_raw}                    unencoded registrar destination URL
//   {domain} or {domain_encoded} encoded domain
//   {domain_raw}                 unencoded domain
//   {registrar}                  registrar key, such as namecheap
// Examples:
//   namecheap: "https://affiliate-network.example/click?url={url}"
//   godaddy: "https://affiliate-network.example/go?u={url}&subid={domain}"
// If a template is invalid, the app falls back to the direct registrar URL.
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

// Privacy-friendly analytics prep.
// Disabled by default. It records product events only, never pasted domains, uploaded list contents, or saved domain names.
// Configure this only after choosing an analytics tool. See ANALYTICS_SETUP.md.
const ANALYTICS_CONFIG = {
  enabled: false,
  provider: "custom", // custom | plausible | fathom | dataLayer
  endpoint: "",
  siteId: "",
  localDebug: false,
  consoleDebug: false,
  dataLayerName: "dataLayer",
  storageKey: "domainShortlistAnalyticsDebugV2",
  maxLocalEvents: 250
};

const FEEDBACK_ISSUE_BASE = "https://github.com/noahbsark/Domain-Bulk-Checker/issues/new";

const ANALYTICS_BLOCKED_KEYS = new Set([
  "domain", "domains", "normalized_domain", "input", "raw_input", "raw", "text", "textarea", "file", "filename", "contents", "saved_domain", "saved_domains", "recent_domains"
]);

function analyticsLooksLikeDomain(value) {
  const text = String(value || "").trim();
  if (!text || text.length > 120 || /\s/.test(text)) return false;
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(text) || /^https?:\/\//i.test(text);
}

function sanitizeAnalyticsPayload(value, key = "") {
  const normalizedKey = String(key || "").toLowerCase();
  if (ANALYTICS_BLOCKED_KEYS.has(normalizedKey)) return "[redacted]";
  if (Array.isArray(value)) return value.slice(0, 20).map(item => sanitizeAnalyticsPayload(item, key));
  if (value && typeof value === "object") {
    const out = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      const safeChildKey = String(childKey || "").toLowerCase();
      if (ANALYTICS_BLOCKED_KEYS.has(safeChildKey)) {
        out[childKey] = "[redacted]";
      } else {
        out[childKey] = sanitizeAnalyticsPayload(childValue, safeChildKey);
      }
    }
    return out;
  }
  if (typeof value === "string") {
    if (value.includes("\n") || value.length > 160 || analyticsLooksLikeDomain(value)) return "[redacted]";
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || value === null || value === undefined) return value;
  return String(value);
}

function analyticsDebugEvents() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ANALYTICS_CONFIG.storageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderAnalyticsPanel() {
  if (el.analyticsStatus) {
    const mode = ANALYTICS_CONFIG.enabled ? `On (${ANALYTICS_CONFIG.provider})` : "Off";
    const debug = ANALYTICS_CONFIG.localDebug ? "local debug on" : "local debug off";
    el.analyticsStatus.textContent = `${mode} · ${debug}`;
  }
  if (el.analyticsEndpointStatus) {
    const endpoint = ANALYTICS_CONFIG.endpoint ? "configured" : "not configured";
    el.analyticsEndpointStatus.textContent = ANALYTICS_CONFIG.enabled ? `Endpoint ${endpoint}` : "No analytics are sent unless enabled in app.js.";
  }
  const events = analyticsDebugEvents();
  if (el.analyticsDebugCount) el.analyticsDebugCount.textContent = `${events.length} local debug event${events.length === 1 ? "" : "s"}`;
  if (el.analyticsDebugPreview) {
    const recent = events.slice(-6).reverse();
    el.analyticsDebugPreview.innerHTML = recent.length
      ? recent.map(event => `<li><strong>${escapeHtml(event.event_name || "event")}</strong><span>${escapeHtml(event.created_at || "")}</span></li>`).join("")
      : `<li><span>No local debug events. Set <code>ANALYTICS_CONFIG.localDebug = true</code> in <code>app.js</code> to inspect payloads locally before launch.</span></li>`;
  }
}

function sendAnalyticsEvent(event) {
  if (ANALYTICS_CONFIG.consoleDebug) console.info("Domain Shortlist analytics event", event);
  if (!ANALYTICS_CONFIG.enabled) return;
  try {
    if (ANALYTICS_CONFIG.provider === "plausible" && typeof window.plausible === "function") {
      window.plausible(event.event_name, { props: event });
      return;
    }
    if (ANALYTICS_CONFIG.provider === "fathom" && window.fathom && typeof window.fathom.trackEvent === "function") {
      window.fathom.trackEvent(event.event_name);
      return;
    }
    if (ANALYTICS_CONFIG.provider === "dataLayer") {
      const layerName = ANALYTICS_CONFIG.dataLayerName || "dataLayer";
      window[layerName] = window[layerName] || [];
      window[layerName].push({ event: event.event_name, domain_shortlist: event });
      return;
    }
    if (!ANALYTICS_CONFIG.endpoint) return;
    const body = JSON.stringify(event);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_CONFIG.endpoint, new Blob([body], { type: "application/json" }));
    } else {
      fetch(ANALYTICS_CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {}
}

function safeAnalyticsContext(extra = {}) {
  return {
    ui_version: UI_VERSION,
    scoring_version: SCORING_VERSION,
    performance_version: APP_PERFORMANCE_VERSION,
    result_count: results.filter(Boolean).length,
    has_results: results.filter(Boolean).length > 0,
    advanced_mode: Boolean(el.advancedModeInput?.checked),
    score_only: Boolean(el.scoreOnlyInput?.checked),
    registrar: selectedRegistrarKey(),
    ...extra
  };
}

function trackEvent(eventName, extra = {}) {
  const safeExtra = sanitizeAnalyticsPayload(extra || {});
  const event = {
    event_name: String(eventName || "event"),
    created_at: new Date().toISOString(),
    ...safeAnalyticsContext(safeExtra)
  };

  if (ANALYTICS_CONFIG.localDebug) {
    try {
      const existing = analyticsDebugEvents();
      existing.push(event);
      localStorage.setItem(ANALYTICS_CONFIG.storageKey, JSON.stringify(existing.slice(-ANALYTICS_CONFIG.maxLocalEvents)));
    } catch {}
  }

  renderAnalyticsPanel();
  sendAnalyticsEvent(event);
}

function isProbablyUrl(value) {
  try {
    const parsed = new URL(String(value || ""));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function affiliateTemplateStatus(registrarKey = selectedRegistrarKey()) {
  const template = AFFILIATE_CONFIG.templates?.[registrarKey] || "";
  if (!AFFILIATE_CONFIG.enabled) return { status: "direct", message: "Affiliate mode is off. Direct registrar links are active." };
  if (!template.trim()) return { status: "direct", message: `${REGISTRARS[registrarKey]?.label || registrarKey} has no affiliate template, so it uses the direct registrar link.` };
  const expanded = expandAffiliateTemplate(registrarKey, AFFILIATE_CONFIG.testDomain || "example.com", REGISTRARS[registrarKey]?.urlDirect?.(AFFILIATE_CONFIG.testDomain || "example.com") || "");
  if (!isProbablyUrl(expanded)) return { status: "invalid", message: `${REGISTRARS[registrarKey]?.label || registrarKey} affiliate template does not produce a valid URL. Direct registrar links will be used.` };
  const hasDestination = /\{url(?:_encoded|_raw)?\}/.test(template);
  const hasDomain = /\{domain(?:_encoded|_raw)?\}/.test(template);
  const note = hasDestination ? "wraps the registrar destination" : (hasDomain ? "uses a domain placeholder" : "uses a static tracking URL");
  return { status: "active", message: `${REGISTRARS[registrarKey]?.label || registrarKey} affiliate template is active and ${note}. Test before launch.` };
}

function expandAffiliateTemplate(registrarKey, domain, destinationUrl) {
  const template = AFFILIATE_CONFIG.templates?.[registrarKey] || "";
  const safeDomain = String(domain || "");
  const safeDestination = String(destinationUrl || "");
  return template
    .replaceAll("{url}", encodeURIComponent(safeDestination))
    .replaceAll("{url_encoded}", encodeURIComponent(safeDestination))
    .replaceAll("{url_raw}", safeDestination)
    .replaceAll("{domain}", encodeURIComponent(safeDomain))
    .replaceAll("{domain_encoded}", encodeURIComponent(safeDomain))
    .replaceAll("{domain_raw}", safeDomain)
    .replaceAll("{registrar}", encodeURIComponent(String(registrarKey || "")));
}

function applyAffiliateTemplate(registrarKey, domain, destinationUrl) {
  const template = AFFILIATE_CONFIG.templates?.[registrarKey];
  if (!AFFILIATE_CONFIG.enabled || !template || !String(template).trim()) return destinationUrl;
  const expanded = expandAffiliateTemplate(registrarKey, domain, destinationUrl);
  if (AFFILIATE_CONFIG.requireValidUrl && !isProbablyUrl(expanded)) {
    console.warn("Invalid affiliate template; falling back to direct registrar URL", registrarKey);
    return destinationUrl;
  }
  return expanded;
}

function registrarLinkRel(registrarKey = selectedRegistrarKey(), domain = "") {
  const registrar = REGISTRARS[registrarKey] || REGISTRARS[selectedRegistrarKey()];
  const directUrl = registrar?.urlDirect ? registrar.urlDirect(domain || AFFILIATE_CONFIG.testDomain || "example.com") : "";
  const finalUrl = registrar?.url ? registrar.url(domain || AFFILIATE_CONFIG.testDomain || "example.com") : directUrl;
  const isAffiliate = Boolean(AFFILIATE_CONFIG.enabled && finalUrl && directUrl && finalUrl !== directUrl);
  return isAffiliate ? "nofollow sponsored noopener noreferrer" : "noopener noreferrer";
}

function registrarLinkDisclosureText() {
  return AFFILIATE_CONFIG.enabled
    ? "May be an affiliate link. Registrar confirms final price and availability."
    : "Registrar confirms final price and availability. No purchase happens here.";
}

function namecheapUrl(domain) {
  return applyAffiliateTemplate("namecheap", domain, `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`);
}

const REGISTRARS = {
  namecheap: {
    label: "Namecheap",
    urlDirect: domain => `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
    url(domain) { return applyAffiliateTemplate("namecheap", domain, this.urlDirect(domain)); }
  },
  porkbun: {
    label: "Porkbun",
    urlDirect: domain => `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
    url(domain) { return applyAffiliateTemplate("porkbun", domain, this.urlDirect(domain)); }
  },
  godaddy: {
    label: "GoDaddy",
    urlDirect: domain => `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
    url(domain) { return applyAffiliateTemplate("godaddy", domain, this.urlDirect(domain)); }
  },
  dynadot: {
    label: "Dynadot",
    urlDirect: domain => `https://www.dynadot.com/domain/search?domain=${encodeURIComponent(domain)}`,
    url(domain) { return applyAffiliateTemplate("dynadot", domain, this.urlDirect(domain)); }
  },
  namesilo: {
    label: "NameSilo",
    urlDirect: domain => `https://www.namesilo.com/domain/search-domains?query=${encodeURIComponent(domain)}`,
    url(domain) { return applyAffiliateTemplate("namesilo", domain, this.urlDirect(domain)); }
  }
};

function selectedRegistrarKey() {
  const key = el.registrarInput?.value || "namecheap";
  return REGISTRARS[key] ? key : "namecheap";
}

function selectedRegistrarLabel() {
  return REGISTRARS[selectedRegistrarKey()].label;
}

function topPickPriceOpenLimit() {
  const raw = el.priceOpenLimitInput?.value || "3";
  if (raw === "all") return Infinity;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.max(1, Math.floor(n)) : 3;
}

function topPickPriceOpenLimitLabel(total = 0) {
  const limit = topPickPriceOpenLimit();
  if (!Number.isFinite(limit)) return `all ${total || ""}`.trim();
  return `first ${Math.min(limit, total || limit)}`;
}

function updatePriceLimitNote() {
  if (!el.topPicksPriceLimitNote) return;
  const total = topPickRows().length;
  const label = topPickPriceOpenLimitLabel(total);
  el.topPicksPriceLimitNote.textContent = `Start with the top pick at ${selectedRegistrarLabel()}. Use backups only if the first option is too expensive or unavailable.`;
}

function registrarUrl(domain) {
  if (!domain) return "";
  return REGISTRARS[selectedRegistrarKey()].url(domain);
}


function resultRegistrarUrl(row) {
  return row?.normalized_domain ? registrarUrl(row.normalized_domain) : (row?.registrar_url || row?.namecheap_url || "");
}

function domainParts(domain) {
  const clean = String(domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").split(/[/?#]/)[0];
  const pieces = clean.split(".").filter(Boolean);
  if (pieces.length < 2) return { label: clean.replace(/[^a-z0-9-]/g, ""), tld: "com" };
  const tld = pieces.pop();
  return { label: pieces.join("-").replace(/[^a-z0-9-]/g, ""), tld: tld.replace(/[^a-z0-9-]/g, "") || "com" };
}

function safeAlternativeDomain(label, tld) {
  const cleanedLabel = String(label || "").toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
  const cleanedTld = String(tld || "com").toLowerCase().replace(/[^a-z0-9-]/g, "") || "com";
  if (!cleanedLabel || cleanedLabel.length > 63) return "";
  const candidate = `${cleanedLabel}.${cleanedTld}`;
  const normalized = normalizeDomain(candidate);
  return normalized.error ? "" : normalized.domain;
}

function generateAlternatives(domain, max = 8) {
  const { label, tld } = domainParts(domain);
  if (!label) return [];
  const preferredTlds = [tld, "com", "io", "co", "app", "net"].filter(Boolean);
  const variants = [
    [label, tld],
    [`get${label}`, tld],
    [`try${label}`, tld],
    [`use${label}`, tld],
    [`${label}app`, tld],
    [`${label}hq`, tld],
    [`my${label}`, tld],
    [`go${label}`, tld],
    [label, "com"],
    [label, "io"],
    [label, "co"],
    [label, "app"],
    [`get${label}`, "com"],
    [`try${label}`, "com"],
    [`${label}app`, "com"],
    ...preferredTlds.map(ext => [label, ext])
  ];
  const seen = new Set();
  const output = [];
  const original = safeAlternativeDomain(label, tld);
  for (const [candidateLabel, candidateTld] of variants) {
    const candidate = safeAlternativeDomain(candidateLabel, candidateTld);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    if (candidate !== original) output.push(candidate);
    if (output.length >= max) break;
  }
  return output;
}

function alternativeRowsForDomain(domain, max = 8) {
  return generateAlternatives(domain, max).map(normalized_domain => ({ normalized_domain }));
}

function openAlternativePriceChecks(domain) {
  const rows = alternativeRowsForDomain(domain, 6);
  if (!rows.length) {
    setStatus("No safe alternatives were generated for that domain.");
    return;
  }
  openLinks(rows, "alternative", { forceConfirm: true });
}

function copyAlternatives(domain) {
  const alternatives = generateAlternatives(domain, 8);
  if (!alternatives.length) {
    setStatus("No safe alternatives were generated for that domain.");
    return;
  }
  copyText(alternatives.join("\n"), "domain alternatives");
  trackEvent("alternatives_copied", { alternative_count: alternatives.length });
}

function registrarComparisonLinks(domain) {
  if (!domain) return [];
  const selected = selectedRegistrarKey();
  const keys = [selected, "namecheap", "porkbun", "dynadot"].filter((key, index, arr) => REGISTRARS[key] && arr.indexOf(key) === index).slice(0, 4);
  return keys.map(key => ({
    key,
    label: REGISTRARS[key].label,
    url: REGISTRARS[key].url(domain),
    rel: registrarLinkRel(key, domain),
    primary: key === selected
  }));
}

function registrarComparisonHtml(domain) {
  const links = registrarComparisonLinks(domain);
  if (!links.length) return "";
  return `<div class="registrar-compare-row" aria-label="Registrar options for ${escapeAttr(domain)}">
    <span>Check at</span>
    ${links.map(link => `<a class="registrar-pill ${link.primary ? "is-primary" : ""}" href="${escapeAttr(link.url)}" target="_blank" rel="${escapeAttr(link.rel)}">${escapeHtml(link.label)}</a>`).join("")}
  </div>`;
}

function alternativesHtml(domain, limit = 5) {
  const alternatives = generateAlternatives(domain, limit);
  if (!alternatives.length) return "";
  return `<div class="domain-alternatives">
    <div class="domain-alternatives-head"><strong>Nearby alternatives</strong><span>Safe ideas to price-check if this one is taken or expensive.</span></div>
    <div class="alternative-chip-row">${alternatives.map(item => `<button type="button" class="alternative-chip" data-copy-domain="${escapeAttr(item)}">${escapeHtml(item)}</button>`).join("")}</div>
    <div class="alternative-actions">
      <button type="button" class="ghost small-button" data-open-alternatives="${escapeAttr(domain)}">Check alternatives</button>
      <button type="button" class="ghost small-button" data-copy-alternatives="${escapeAttr(domain)}">Copy alternatives</button>
    </div>
  </div>`;
}

function updateAffiliateConfigStatus() {
  if (!el.affiliateConfigStatus) return;
  const info = affiliateTemplateStatus(selectedRegistrarKey());
  el.affiliateConfigStatus.textContent = info.message;
  el.affiliateConfigStatus.dataset.status = info.status;
}

function testAffiliateUrl() {
  const raw = el.affiliateTestDomainInput?.value || AFFILIATE_CONFIG.testDomain || "example.com";
  const normalized = normalizeDomain(raw);
  const domain = normalized.error ? "example.com" : normalized.domain;
  return registrarUrl(domain);
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
  "probate", "estate", "estates", "small", "will", "wills", "trust", "trusts", "executor", "executors", "inheritance", "heir", "heirs",
  "court", "filing", "file", "forms", "form", "law", "legal", "attorney", "lawyer", "claim", "assets", "asset", "inventory", "administration", "admin", "administrator", "administrators", "personal", "representative", "representatives", "affidavit", "affidavits", "beneficiary", "beneficiaries", "debt", "debts", "creditor", "creditors", "county", "state", "informal", "without",
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

  const staticVocabulary = new Set([
    ...QUALITY_WORDS, ...GENERIC_DOMAIN_WORDS, ...getKeywords(), ...getPositiveWords(), ...getNegativeWords()
  ].map(cleanKeyword).filter(Boolean));
  const junkFragments = new Set([
    "tion", "ions", "ment", "ness", "able", "ible", "ator", "ators", "izer", "izers",
    "ify", "ing", "ings", "ally", "allys", "less", "wise", "line"
  ]);

  const dynamic = [...counts.entries()]
    .filter(([term, set]) => {
      const minCount = domainNames.length >= 30 ? 3 : 2;
      if (set.size < minCount || term.length < 4) return false;
      if (junkFragments.has(term)) return false;
      // v13: dynamic vocabulary should learn niche words, not arbitrary prefixes/suffixes.
      // Short learned terms need stronger evidence unless they already exist in the curated vocabulary.
      if (term.length <= 5 && !staticVocabulary.has(term) && set.size < Math.max(minCount + 2, Math.ceil(domainNames.length * 0.04))) return false;
      if (/^(pre|post|auto|best|easy|quick|smart|clear)$/.test(term) && !staticVocabulary.has(term)) return false;
      return true;
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
  "bright", "fresh", "swift", "pulse", "spark", "forge", "pilot", "grid", "vault", "logic", "signal", "metric", "settle", "settled", "close", "closed", "file", "filing", "it", "this", "that",
  "local", "near", "city", "home", "house", "roof", "lawn", "clean", "cleaning", "repair", "plumbing", "electric", "hvac",
  "care", "health", "fitness", "wellness", "doctor", "dental", "pet", "pets", "food", "coffee", "shop", "store", "supply",
  "supplies", "gear", "goods", "box", "club", "direct", "delivery", "buy", "sell", "deals", "discount", "review", "reviews",
  "compare", "best", "top", "rank", "finder", "find", "search", "now", "today", "hq", "go", "get", "try", "use", "join",
  "learn", "school", "class", "classes", "course", "courses", "academy", "training", "lesson", "lessons", "blueprint", "playbook",
  "quote", "quotes", "estimate", "estimates", "calculator", "builder", "generator", "tracker", "manager", "software", "booking",
  "scheduler", "directory", "marketplace", "newsletter", "community", "forum", "tips", "ideas", "recipes", "meal", "meals", "travel",
  "trip", "trips", "budget", "money", "tax", "taxes", "loan", "loans", "insurance", "realty", "rent", "rental", "rentals", "buy", "own", "wait", "lease", "mortgage", "versus", "decision", "breakeven", "worksheet", "comparison"
];

const DEFAULT_POSITIVE_TERMS = new Map([
  ["help", 9], ["guide", 9], ["kit", 8], ["tool", 7], ["tools", 7], ["app", 5], ["apps", 5], ["forms", 8], ["form", 7],
  ["planner", 7], ["checklist", 7], ["template", 7], ["templates", 7], ["course", 6], ["academy", 5],
  ["service", 6], ["services", 6], ["shop", 6], ["store", 6], ["supply", 5], ["finder", 6], ["compare", 8], ["comparison", 8],
  ["calculator", 9], ["decision", 7], ["breakeven", 8], ["worksheet", 7],
  ["reviews", 5], ["direct", 2], ["quote", 7], ["quotes", 7], ["estimate", 7], ["estimates", 7],
  // Soft modifiers can help positioning, but they are not true buyer-intent by themselves.
  ["simple", 2], ["easy", 1], ["clear", 2], ["smart", 1]
]);

const DEFAULT_NEGATIVE_TERMS = new Map([
  ["247", 13], ["24", 8], ["guru", 8], ["genius", 7], ["wizard", 7], ["ninja", 8], ["hack", 8],
  ["hacks", 8], ["buddy", 5], ["plus", 5], ["pro", 5], ["express", 5], ["solution", 5], ["solutions", 5],
  ["pathway", 5], ["program", 4], ["route", 3], ["portal", 3], ["online", 2], ["best", 4], ["top", 3], ["cheap", 9]
]);

// Rating calibration helpers. These are intentionally general-purpose, not niche-specific.
// They make the quality score care more about phrase usefulness and less about one lucky keyword match.
const HIGH_INTENT_WORDS = new Set([
  "help", "guide", "guides", "kit", "tool", "tools", "app", "forms", "form", "planner", "plan", "plans", "checklist",
  "template", "templates", "course", "courses", "academy", "service", "services", "shop", "store",
  "supply", "supplies", "finder", "compare", "reviews", "review", "repair", "quote", "estimate",
  "calculator", "comparison", "decision", "breakeven", "worksheet", "builder", "generator", "tracker", "manager", "software", "quote", "quotes", "estimate", "estimates"
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
  "pathway", "solution", "solutions", "program", "plus", "pro", "express", "buddy", "genius", "wizard",
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
  "help", "guide", "guides", "kit", "tool", "tools", "app", "forms", "form", "planner", "plan", "plans", "checklist",
  "template", "templates", "course", "courses", "academy", "service", "services", "shop", "store",
  "supply", "supplies", "finder", "compare", "reviews", "review", "repair", "quote", "quotes",
  "estimate", "estimates", "calculator", "builder", "generator", "tracker", "manager", "software",
  "booking", "scheduler", "directory", "marketplace", "comparison", "decision", "breakeven", "worksheet"
]);

const STACKABLE_INTENT_PAIRS = new Set([
  "repair+quote", "quote+repair", "repair+estimate", "estimate+repair",
  "service+quote", "quote+service", "service+estimate", "estimate+service",
  "booking+scheduler", "scheduler+booking"
]);

const AWKWARD_ACTION_PREFIXES = new Set(["close", "start", "done", "guided", "guide", "file", "settle"]);
const WEAK_POSITIONING_WORDS = new Set(["easy", "simple", "quick", "fast", "smart", "clear", "guided", "start", "starter", "done", "my", "your", "own", "do"]);
const PROFESSIONAL_RISK_WORDS = new Set(["law", "legal", "lawyer", "attorney", "doctor", "medical", "tax", "loan", "insurance"]);
const LEGAL_PROFESSIONAL_WORDS = new Set(["law", "legal", "lawyer", "attorney"]);
const SENSITIVE_CATEGORY_WORDS = new Set([
  "probate", "estate", "estates", "small", "will", "wills", "trust", "trusts", "executor", "executors", "heir", "heirs", "heirship",
  "inheritance", "affidavit", "court", "legal", "law", "lawyer", "attorney", "tax", "irs", "1099", "401k",
  "loan", "credit", "mortgage", "insurance", "medical", "doctor", "health", "therapy"
]);

// Rating v5 top-end calibration. Platform/software nouns can be strong in SaaS mode,
// but they should not automatically make sensitive or service domains look premium.
const PLATFORM_SOFTWARE_WORDS = new Set([
  "ai", "app", "apps", "tool", "tools", "software", "platform", "dashboard", "desk", "base", "stack", "pilot", "flow", "cloud", "data", "sync", "crm"
]);

const PLATFORM_GENERIC_WORDS = new Set(["desk", "base", "stack", "pilot", "flow", "hub", "portal", "platform"]);

// Rating v7: premium gates and word-order guards. These keep top scores rare and
// reduce false-premium scores for sensitive + software/platform phrasing.
const WEAK_PRONOUN_WORDS = new Set(["it", "this", "that", "thing", "stuff"]);
const SENSITIVE_SOFTWARE_RISK_WORDS = new Set(["ai", "app", "apps", "tool", "tools", "software", "platform", "dashboard", "desk", "base", "stack", "pilot", "flow"]);
const PREMIUM_DIRECT_INTENT_WORDS = new Set([
  "forms", "form", "guide", "guides", "kit", "checklist", "planner", "template", "templates",
  "course", "courses", "quote", "quotes", "estimate", "estimates", "calculator", "repair",
  "booking", "scheduler", "finder", "compare", "shop", "store"
]);
const SUPPORT_ONLY_INTENT_WORDS = new Set(["help", "support", "assist", "assistant", "service", "services", "tool", "tools", "app", "apps", "software", "platform"]);

const DIRECT_USEFULNESS_WORDS = new Set([
  "help", "guide", "guides", "kit", "forms", "form", "checklist", "planner", "template", "templates",
  "course", "courses", "quote", "quotes", "estimate", "estimates", "calculator", "repair", "service", "services",
  "shop", "store", "finder", "compare", "booking", "scheduler", "directory", "marketplace"
]);

const PRODUCT_NOUN_WORDS = new Set([
  "app", "apps", "tool", "tools", "kit", "forms", "form", "guide", "guides", "help", "plan", "plans", "course", "courses",
  "checklist", "planner", "template", "templates", "software", "platform", "desk", "base", "stack", "dashboard"
]);

const PLURAL_OWNER_WORDS = new Set([
  "executors", "heirs", "clients", "patients", "customers", "owners", "parents", "seniors", "buyers", "sellers",
  "renters", "tenants", "contractors", "lawyers", "attorneys", "doctors", "agents"
]);

const SAFE_PLURAL_PRODUCT_WORDS = new Set([
  "forms", "guides", "tools", "templates", "courses", "services", "supplies", "reviews", "quotes", "estimates", "apps"
]);


// Rating v8: comparison and decision-domain calibration. These terms keep comparison domains
// like rent-or-buy from being over-scored just because they are short and end in "app".
const COMPARISON_OPTIONS = new Set([
  "rent", "buy", "own", "wait", "lease", "mortgage", "sell", "refinance", "borrow", "save", "hold"
]);

const STRONG_COMPARISON_PAIRS = new Set([
  "rent+buy", "buy+rent", "rent+own", "buy+wait", "wait+buy", "lease+buy", "buy+lease", "rent+lease", "lease+rent"
]);

const MEDIUM_COMPARISON_PAIRS = new Set([
  "rent+mortgage", "mortgage+rent", "buy+mortgage", "mortgage+buy", "own+rent", "rent+wait", "wait+rent", "buy+own", "own+buy"
]);

const WEAK_COMPARISON_PAIRS = new Set([
  "wait+own", "own+wait", "own+rent", "mortgage+lease", "lease+mortgage"
]);

const DECISION_TOOL_WORDS = new Set([
  "calculator", "compare", "comparison", "estimate", "estimates", "planner", "guide", "worksheet", "checklist", "decision", "breakeven", "quote", "quotes"
]);

const GENERIC_APP_WRAPPER_WORDS = new Set(["app", "apps", "tool", "tools", "score", "wise", "help"]);

// Rating v9: word-order and category-phrase calibration. These rules help when users
// do not enter target keywords, by using detected category terms and phrase shape.
const CATEGORY_MODIFIER_WORDS = new Set(["diy", "self", "easy", "simple", "guided", "my", "your", "own", "do"]);
const OWNERSHIP_MODIFIER_WORDS = new Set(["own", "my", "your"]);
const NONPREMIUM_PROGRAM_WORDS = new Set(["program", "programs"]);
const CATEGORY_PHRASE_WORDS = new Set(["small", "estate", "estates"]);
const INTENT_PREFIX_WEAK_WORDS = new Set(["guide", "guides", "help", "forms", "form", "kit", "tool", "tools", "service", "services"]);
const DIRECT_CLEAR_INTENT_WORDS = new Set([
  "forms", "form", "guide", "guides", "kit", "checklist", "planner", "template", "templates",
  "quote", "quotes", "estimate", "estimates", "calculator", "compare", "comparison", "worksheet",
  "repair", "booking", "scheduler", "finder"
]);


const BRANDABLE_SIGNAL_WORDS = new Set([
  "app", "apps", "ai", "data", "cloud", "sync", "flow", "desk", "crm", "sales", "lead", "leads", "client", "clients",
  "marketing", "market", "seo", "ads", "media", "brand", "brands", "studio", "agency", "lab", "labs", "stack", "base",
  "software", "platform", "dashboard", "bright", "fresh", "swift", "pulse", "spark", "forge", "pilot", "grid", "vault",
  "logic", "signal", "metric"
]);

const CATEGORY_LOCK_WORDS = new Set([
  "probate", "estate", "estates", "small", "will", "wills", "trust", "trusts", "executor", "executors", "inheritance", "heir", "heirs",
  "court", "filing", "file", "forms", "form", "law", "legal", "attorney", "lawyer", "claim", "claims", "assets",
  "home", "house", "roof", "lawn", "cleaning", "repair", "plumbing", "electric", "hvac", "care", "health", "doctor",
  "dental", "tax", "taxes", "loan", "loans", "insurance", "realty", "rent", "rental", "rentals", "quote", "quotes",
  "estimate", "estimates"
]);

// Rating v13: general calibration additions. These are intentionally cross-niche.
// They reduce over-penalties for meaningful numbers, improve token-confidence scoring,
// and avoid treating every learned substring as a real word.
const MEANINGFUL_NUMBER_PATTERNS = [
  { pattern: /1099/, context: new Set(["tax", "taxes", "irs", "contractor", "contractors", "freelance", "freelancer", "payroll"]) },
  { pattern: /401k/, context: new Set(["retire", "retirement", "ira", "invest", "investment", "finance", "financial", "tax"]) },
  { pattern: /529/, context: new Set(["college", "tuition", "education", "savings", "save", "school"]) },
  { pattern: /360/, context: new Set(["brand", "brands", "marketing", "view", "insight", "analytics", "data", "feedback"]) },
  { pattern: /365/, context: new Set(["planner", "calendar", "daily", "day", "fitness", "health", "productivity", "support"]) },
  { pattern: /3d/, context: new Set(["print", "printer", "printing", "model", "models", "design", "scan", "scanning"]) },
  { pattern: /b2b/, context: new Set(["sales", "lead", "leads", "crm", "marketing", "saas", "software", "agency"]) },
  { pattern: /b2c/, context: new Set(["marketing", "brand", "brands", "shop", "store", "ecommerce", "sales"]) }
];

const TOKEN_FRAGMENT_WORDS = new Set([
  "tion", "ions", "ment", "ness", "able", "ible", "ator", "ators", "izer", "izers", "ing", "ings", "less", "wise"
]);

const SHORT_COMMON_SAFE_WORDS = new Set([
  "app", "ai", "crm", "seo", "tax", "law", "pet", "gym", "fit", "job", "pay", "buy", "rent", "own", "car", "home", "roof", "kit"
]);


function tokenHitCount(words, tokenSet, sld) {
  let hits = 0;
  for (const word of words) if (isTermMatch(word, tokenSet, sld)) hits += 1;
  return hits;
}

function tokenListHits(words, tokenSet, sld) {
  return dedupeTermHits([...words].filter(word => isTermMatch(word, tokenSet, sld)));
}

function hasMeaningfulNumberPattern(sld, tokens = [], tokenSet = new Set()) {
  const cleanSld = cleanKeyword(sld);
  if (!/\d/.test(cleanSld)) return false;
  const tokenWords = new Set((tokens || []).map(cleanKeyword).filter(Boolean));
  for (const { pattern, context } of MEANINGFUL_NUMBER_PATTERNS) {
    if (!pattern.test(cleanSld)) continue;
    const hasContext = [...context].some(term => tokenWords.has(term) || isTermMatch(term, tokenSet, cleanSld));
    if (hasContext) return true;
  }
  // 24/7 style service names are common but usually promotional, not premium.
  if (/247|24/.test(cleanSld)) return false;
  return false;
}

function tokenConfidenceScore(sld, knownTokens = [], coverage = 0, targetKeywords = [], positiveWords = []) {
  const tokens = (knownTokens || []).map(cleanKeyword).filter(Boolean);
  if (!sld) return 0;
  let score = Math.round(coverage * 70);

  if (tokens.length >= 2 && tokens.length <= 3) score += 18;
  else if (tokens.length === 1 || tokens.length === 4) score += 10;
  else if (tokens.length >= 5) score -= Math.min(15, (tokens.length - 4) * 4);

  const targetSet = new Set((targetKeywords || []).map(cleanKeyword).filter(Boolean));
  const positiveSet = new Set((positiveWords || []).map(cleanKeyword).filter(Boolean));
  const curatedSet = new Set([
    ...QUALITY_WORDS, ...GENERIC_DOMAIN_WORDS, ...DIRECT_USEFULNESS_WORDS, ...CATEGORY_LOCK_WORDS,
    ...COMPARISON_OPTIONS, ...targetSet, ...positiveSet
  ].map(cleanKeyword).filter(Boolean));

  let strongTokens = 0;
  let weakTokens = 0;
  for (const token of tokens) {
    if (curatedSet.has(token)) strongTokens += 1;
    if (TOKEN_FRAGMENT_WORDS.has(token)) weakTokens += 1;
    if (token.length <= 3 && !SHORT_COMMON_SAFE_WORDS.has(token) && !targetSet.has(token) && !positiveSet.has(token)) weakTokens += 1;
  }
  if (strongTokens >= 2) score += 8;
  if (strongTokens === tokens.length && tokens.length >= 2) score += 4;
  if (weakTokens) score -= Math.min(20, weakTokens * 6);
  if (/[^a-z0-9]/.test(String(sld || ""))) score -= 4;

  return Math.max(0, Math.min(100, score));
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


// v16 Public Buyer Calibration
// These rules make the public default act like a human-curated domain shortlist.
// A good public recommendation should be easy to understand, useful, and safe to send to a registrar.
const PUBLIC_BUYER_UTILITY_WORDS = new Set([
  "guide", "guides", "help", "forms", "form", "kit", "checklist", "planner", "calculator", "template", "templates",
  "worksheet", "manual", "book", "guidebook", "course", "courses", "academy", "training", "service", "services",
  "assistant", "assist", "finder", "compare", "comparison", "estimate", "estimates", "quote", "quotes", "generator", "builder"
]);

const PUBLIC_BUYER_PREMIUM_UTILITY_WORDS = new Set([
  "guide", "guides", "forms", "form", "kit", "checklist", "calculator", "planner", "template", "templates", "worksheet", "manual", "guidebook"
]);

const ABSTRACT_SAAS_WORDS = new Set([
  "grid", "signal", "signals", "logic", "base", "stack", "desk", "pilot", "platform", "crm", "dashboard", "software", "system", "systems", "portal", "hub", "flow"
]);

const PUBLIC_LOW_VALUE_BRAND_WORDS = new Set([
  "hub", "central", "online", "now", "today", "pro", "plus", "best", "top", "easy", "fast", "quick", "smart", "wizard", "genius", "guru", "ninja", "buddy"
]);

const AMBIGUOUS_ABBREVIATIONS = new Set([
  "pr", "pa", "pc", "ai", "ml", "hr", "seo", "ppc", "crm", "erp", "llc", "cpa", "rn", "md", "qa", "ux", "ui"
]);

const US_STATE_ABBREVIATIONS = new Set([
  "al", "ak", "az", "ar", "ca", "co", "ct", "de", "dc", "fl", "ga", "hi", "ia", "id", "il", "in", "ks", "ky", "la", "ma", "md", "me", "mi", "mn", "mo", "ms", "mt", "nc", "nd", "ne", "nh", "nj", "nm", "nv", "ny", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "va", "vt", "wa", "wi", "wv", "wy"
]);

const HIGH_CONFIDENCE_STATE_ABBREVIATIONS = new Set(["ca", "ny", "tx", "fl", "dc"]);
const MEDIUM_CONFIDENCE_STATE_ABBREVIATIONS = new Set(["pa", "nj", "ma", "ga", "wa", "nc", "sc", "va", "az", "oh", "mi", "il", "co", "tn"]);

const LEGAL_SENSITIVE_PHRASE_PATTERNS = [
  /withoutlawyer/, /nolawyer/, /legaladvice/, /courtapproved/, /official/, /guarantee/, /guaranteed/, /filedfor/i, /^irs/, /socialsecurity/, /^medicare/
];

const EXACT_LONGTAIL_UTILITY_PATTERNS = [
  /estateinventorychecklist/,
  /personalrepresentative(kit|guide|forms|checklist)/,
  /estateadministration(forms|guide|checklist|kit)/,
  /probatewithoutlawyer/,
  /smallestate(guide|kit|forms|checklist|affidavit|help)/,
  /probate(form|forms|kit|guide|checklist|help)/,
  /executor(checklist|guide|forms|kit|help)/,
  /inheritance(guide|help|forms|planner)/,
  /diyprobate(kit|guide|forms|checklist)/
];

const NATURAL_PUBLIC_PATTERNS = [
  /^(diy|self|simple|clear|easy)?(probate|estate|executor|heir|inheritance|will|trust)[a-z]*(guide|guides|help|forms|form|kit|checklist|planner|calculator|template|templates|worksheet|manual)$/,
  /^(smallestate|estateinventory|estateadministration|personalrepresentative|executor)[a-z]*(guide|help|forms|kit|checklist|planner|template|templates|manual)$/,
  /^[a-z]+(probate|estate|executor|heir|inheritance)(help|forms|kit|guide|checklist)$/
];

const SCORING_PROFILES = {
  general: {
    label: "Public buyer",
    // v16: default mode is for the general public buying a domain, not a SaaS naming contest.
    // Clear utility phrases and .com names should beat abstract startup filler.
    weights: { tld: 14, length: 14, keyword: 18, clarity: 20, brand: 11, intent: 16, fit: 7 },
    positives: { guide: 4, help: 4, forms: 4, form: 3, kit: 4, checklist: 4, planner: 3, calculator: 4, template: 3, templates: 3 },
    negatives: { grid: 6, signal: 6, logic: 6, base: 5, stack: 5, desk: 5, pilot: 5, platform: 5, crm: 7, wizard: 5, genius: 5, guru: 6, ninja: 6, cheap: 7, 247: 8 },
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

function scoringSettingsKey() {
  return JSON.stringify({
    version: SCORING_VERSION,
    style: el.scoringStyleInput?.value || "general",
    keywords: String(el.keywordsInput?.value || "").trim().toLowerCase(),
    positive: String(el.positiveWordsInput?.value || "").trim().toLowerCase(),
    negative: String(el.negativeWordsInput?.value || "").trim().toLowerCase()
  });
}


function selectedProfileIsPublicBuyer(profile) {
  return !profile || profile.label === "Public buyer" || profile.label === "General";
}

function publicBuyerCategoryHits(tokenSet, sld) {
  const categories = new Set([
    ...SENSITIVE_CATEGORY_WORDS,
    ...CATEGORY_LOCK_WORDS,
    "probate", "estate", "estates", "executor", "executors", "heir", "heirs", "inheritance", "will", "wills", "trust", "trusts",
    "affidavit", "court", "filing", "tax", "loan", "insurance", "mortgage", "rent", "buy", "lease", "roof", "repair", "cleaning", "fitness", "travel", "meal", "course", "school", "pet"
  ]);
  return tokenListHits(categories, tokenSet, sld);
}

function publicTldCap(suffix, profile, publicSignals = {}) {
  suffix = String(suffix || "").toLowerCase();
  if (!suffix || suffix === "com") return 96;
  if (profile && profile.label === "Brandable / SaaS" && ["io", "ai", "app", "dev"].includes(suffix)) return 91;
  if (profile && profile.label === "Ecommerce / product" && ["shop", "store"].includes(suffix)) return 88;
  if ((profile && (profile.label === "Trust-heavy" || profile.label === "Course / content")) && suffix === "org") return 90;
  if (["org", "net"].includes(suffix)) return publicSignals.phrase_naturalness >= 82 ? 88 : 84;
  if (suffix === "co") return publicSignals.phrase_naturalness >= 82 ? 84 : 80;
  if (suffix === "app") return profile && profile.label === "Brandable / SaaS" ? 91 : (publicSignals.hasAppUse ? 84 : 80);
  if (["io", "ai", "dev"].includes(suffix)) return profile && profile.label === "Brandable / SaaS" ? 91 : 78;
  if (["legal", "law", "finance"].includes(suffix)) return publicSignals.legal_sensitive_flag ? 82 : 78;
  if (["guide", "help", "tools", "software", "shop", "store"].includes(suffix)) return publicSignals.phrase_naturalness >= 78 ? 82 : 76;
  if (suffix.includes(".")) return 78;
  return 74;
}

function detectStateAbbreviationPrefix(sld, tokenSet) {
  const prefix = cleanKeyword(sld).slice(0, 2);
  if (!US_STATE_ABBREVIATIONS.has(prefix)) return { prefix: "", confidence: "none", penalty: 0, note: "" };
  const remainder = cleanKeyword(sld).slice(2);
  const contextWords = ["probate", "estate", "law", "legal", "lawyer", "attorney", "roof", "repair", "tax", "insurance", "mortgage", "rent", "homes", "home"];
  const hasContext = contextWords.some(word => remainder.includes(word) || (tokenSet && tokenSet.has(word)));
  if (!hasContext) return { prefix: "", confidence: "none", penalty: 0, note: "" };
  if (HIGH_CONFIDENCE_STATE_ABBREVIATIONS.has(prefix)) return { prefix, confidence: "high", penalty: 0, note: `state abbreviation ${prefix.toUpperCase()}` };
  if (MEDIUM_CONFIDENCE_STATE_ABBREVIATIONS.has(prefix)) return { prefix, confidence: "medium", penalty: 3, note: `state abbreviation ${prefix.toUpperCase()} may be less clear than full state name` };
  return { prefix, confidence: "low", penalty: 7, note: `ambiguous state abbreviation ${prefix.toUpperCase()}` };
}

function detectAmbiguousAbbreviation(sld, knownTokens, tokenSet, targetKeywords) {
  const targetSet = new Set((targetKeywords || []).map(cleanKeyword));
  const cleanSld = cleanKeyword(sld);
  const safePrefixWords = ["probate", "property", "price", "project", "process", "product", "program", "professional", "profile", "proof", "privacy", "private", "pro", "personal", "representative"];
  const tokenHits = (knownTokens || []).filter(t => AMBIGUOUS_ABBREVIATIONS.has(t) && !targetSet.has(t));
  const start = cleanSld.slice(0, 2);
  if (start && AMBIGUOUS_ABBREVIATIONS.has(start) && !targetSet.has(start) && !safePrefixWords.some(word => cleanSld.startsWith(word))) {
    const stateInfo = detectStateAbbreviationPrefix(cleanSld, tokenSet);
    if (stateInfo.prefix === start && stateInfo.confidence !== "none") return { hits: [], penalty: stateInfo.penalty, cap: stateInfo.confidence === "low" ? 74 : 82, reason: stateInfo.note };
    const rest = cleanSld.slice(2);
    // PR/PA/PC/etc. in front of a useful word is usually not public-clear unless the user typed it as a keyword.
    if (rest.length >= 4) return { hits: [start], penalty: start === "pr" ? 24 : 14, cap: start === "pr" ? 64 : 72, reason: `ambiguous abbreviation ${start.toUpperCase()}` };
  }
  if (tokenHits.length) return { hits: tokenHits, penalty: Math.min(18, 8 + tokenHits.length * 5), cap: 72, reason: `ambiguous abbreviation ${tokenHits[0].toUpperCase()}` };
  return { hits: [], penalty: 0, cap: 96, reason: "" };
}

function hasExactLongtailUtility(sld) {
  const cleanSld = cleanKeyword(sld);
  return EXACT_LONGTAIL_UTILITY_PATTERNS.some(pattern => pattern.test(cleanSld));
}

function hasNaturalPublicPattern(sld) {
  const cleanSld = cleanKeyword(sld);
  return NATURAL_PUBLIC_PATTERNS.some(pattern => pattern.test(cleanSld));
}

function analyzePublicBuyerSignals(ctx) {
  const {
    suffix, sldRaw, sld, len, knownTokens = [], coverage = 0, targetKeywords = [], positiveWords = [], negativeWords = [],
    profile, tokenSet = new Set(), brandableCandidate = false, phraseFit = {}, tokenConfidence = 0
  } = ctx;

  const strengths = [];
  const issues = [];
  const notes = [];
  const cleanSld = cleanKeyword(sld);
  const tokens = knownTokens.map(cleanKeyword).filter(Boolean);
  const tokenCount = tokens.length;
  const uniqueTokens = [...new Set(tokens)];
  const isPublic = selectedProfileIsPublicBuyer(profile);
  const categoryHits = publicBuyerCategoryHits(tokenSet, cleanSld);
  const utilityHits = dedupeTermHits(uniqueTokens.filter(t => PUBLIC_BUYER_UTILITY_WORDS.has(t) || PUBLIC_BUYER_PREMIUM_UTILITY_WORDS.has(t) || DIRECT_USEFULNESS_WORDS.has(t)));
  const premiumUtilityHits = dedupeTermHits(utilityHits.filter(t => PUBLIC_BUYER_PREMIUM_UTILITY_WORDS.has(t) || PREMIUM_DIRECT_INTENT_WORDS.has(t)));
  const abstractHits = tokenListHits(ABSTRACT_SAAS_WORDS, tokenSet, cleanSld);
  const lowValueHits = tokenListHits(PUBLIC_LOW_VALUE_BRAND_WORDS, tokenSet, cleanSld);
  const legalRiskHits = tokenListHits(new Set([...LEGAL_PROFESSIONAL_WORDS, ...PROFESSIONAL_RISK_WORDS]), tokenSet, cleanSld);
  const sensitiveHits = tokenListHits(SENSITIVE_CATEGORY_WORDS, tokenSet, cleanSld);
  const legalPhraseRisk = LEGAL_SENSITIVE_PHRASE_PATTERNS.some(pattern => pattern.test(cleanSld));
  const stateInfo = detectStateAbbreviationPrefix(cleanSld, tokenSet);
  const abbreviation = detectAmbiguousAbbreviation(cleanSld, tokens, tokenSet, targetKeywords);
  const exactLongtail = hasExactLongtailUtility(cleanSld);
  const naturalPattern = hasNaturalPublicPattern(cleanSld);
  const hasCategory = categoryHits.length > 0 || (targetKeywords.length && (phraseFit.targetHits || []).length > 0);
  const hasUtility = utilityHits.length > 0 || (phraseFit.customPositiveHits || []).length > 0;
  const hasPremiumUtility = premiumUtilityHits.length > 0 || exactLongtail;
  const backwardOrder = hasIntentBeforeCategoryPattern(tokens) || hasSmallEstateReversalPattern(tokens) || hasCategorySoftIntentOrder(tokens, phraseFit.targetHits || [], phraseFit.intentHits || []);
  const appUse = isTermMatch("app", tokenSet, cleanSld) || isTermMatch("apps", tokenSet, cleanSld);
  const platformOutsideSaas = abstractHits.length && (!profile || profile.label !== "Brandable / SaaS");
  const isLegalSensitive = legalRiskHits.length > 0 || legalPhraseRisk || (sensitiveHits.length > 0 && (utilityHits.length || abstractHits.length));

  let buyerIntentScore = 35;
  if (hasCategory && hasPremiumUtility) buyerIntentScore = 92;
  else if (hasCategory && hasUtility) buyerIntentScore = 84;
  else if (exactLongtail) buyerIntentScore = 88;
  else if (utilityHits.length) buyerIntentScore = 68;
  else if (abstractHits.length && isPublic) buyerIntentScore = 45;
  if (lowValueHits.length && !hasUtility) buyerIntentScore -= Math.min(16, lowValueHits.length * 5);
  buyerIntentScore = Math.max(0, Math.min(100, buyerIntentScore));

  let seoUtilityScore = 0;
  if (exactLongtail) seoUtilityScore += 82;
  else if (hasCategory && hasPremiumUtility && tokenCount >= 2) seoUtilityScore += 68;
  else if (hasCategory && hasUtility) seoUtilityScore += 56;
  if (tokenCount >= 3 && tokenCount <= 5 && hasCategory && hasUtility && coverage >= 0.8) seoUtilityScore += 10;
  if (cleanSld.includes("withoutlawyer")) seoUtilityScore += 6;
  seoUtilityScore = Math.max(0, Math.min(100, seoUtilityScore));

  let phraseNaturalness = 58;
  if (naturalPattern) phraseNaturalness = 90;
  else if (exactLongtail && coverage >= 0.8) phraseNaturalness = 84;
  else if (hasCategory && hasPremiumUtility && tokenCount >= 2 && tokenCount <= 4 && !backwardOrder) phraseNaturalness = 82;
  else if (hasCategory && hasUtility && !backwardOrder) phraseNaturalness = 74;
  else if (brandableCandidate && tokenConfidence >= 70) phraseNaturalness = 74;
  else if (platformOutsideSaas) phraseNaturalness = 56;
  if (backwardOrder) phraseNaturalness -= 22;
  if (abstractHits.length && isPublic && !hasPremiumUtility) phraseNaturalness -= Math.min(18, 7 + abstractHits.length * 4);
  if (abbreviation.penalty) phraseNaturalness -= Math.min(22, Math.round(abbreviation.penalty * 0.8));
  if (lowValueHits.length && !hasUtility) phraseNaturalness -= Math.min(12, lowValueHits.length * 3);
  if (tokenConfidence < 55 && !brandableCandidate) phraseNaturalness -= 10;
  phraseNaturalness = Math.max(0, Math.min(100, phraseNaturalness));

  let trustRiskScore = 0;
  if (isLegalSensitive) trustRiskScore += legalPhraseRisk ? 28 : 16;
  if (cleanSld.includes("official") || cleanSld.includes("guarantee")) trustRiskScore += 35;
  if (abstractHits.length && sensitiveHits.length && isPublic) trustRiskScore += 12;
  trustRiskScore = Math.max(0, Math.min(100, trustRiskScore));

  let adjustment = 0;
  let wordOrderPenalty = backwardOrder ? (hasCategory && hasUtility ? 16 : 10) : 0;
  let abstractPenalty = platformOutsideSaas ? Math.min(22, 8 + abstractHits.length * 5 + (sensitiveHits.length ? 6 : 0)) : 0;
  let abbreviationPenalty = abbreviation.penalty || 0;

  // Long exact-match utility names should not be buried merely for length.
  if (isPublic && exactLongtail && coverage >= 0.75) {
    adjustment += len > 20 ? 10 : 7;
    strengths.push("clear long-tail utility phrase");
  } else if (isPublic && hasCategory && hasPremiumUtility && phraseNaturalness >= 78) {
    adjustment += 5;
    strengths.push("clear public-use phrase");
  }

  if (isPublic && platformOutsideSaas) {
    adjustment -= Math.min(12, abstractPenalty);
    issues.push(`abstract SaaS word outside SaaS mode: ${abstractHits.slice(0, 2).join(", ")}`);
  }
  if (abbreviationPenalty) {
    adjustment -= Math.min(16, abbreviationPenalty);
    issues.push(abbreviation.reason);
  }
  if (wordOrderPenalty) {
    adjustment -= Math.min(12, wordOrderPenalty);
    issues.push("word order is less natural for public buyers");
  }
  if (stateInfo.penalty) {
    adjustment -= stateInfo.penalty;
    issues.push(stateInfo.note);
  } else if (stateInfo.note) {
    strengths.push(stateInfo.note);
  }
  if (trustRiskScore >= 20) {
    issues.push("legal/trust-sensitive wording needs careful landing-page copy");
  }
  if (suffix !== "com") {
    issues.push(`${suffix || "non-.com"} is a TLD fallback`);
  }

  let recommendationType = "General shortlist";
  if (isLegalSensitive && seoUtilityScore >= 60) recommendationType = "Legal-sensitive SEO / utility";
  else if (exactLongtail || (hasCategory && hasPremiumUtility && tokenCount >= 3)) recommendationType = "SEO / exact-match utility";
  else if (hasCategory && hasUtility) recommendationType = "Clear public utility";
  else if (platformOutsideSaas) recommendationType = "B2B SaaS / abstract";
  else if (stateInfo.prefix) recommendationType = "Local / state-specific";
  else if (brandableCandidate) recommendationType = "Brandable";

  const tldCap = publicTldCap(suffix, profile, { phrase_naturalness: phraseNaturalness, legal_sensitive_flag: isLegalSensitive, hasAppUse: appUse });
  const riskFlags = [];
  if (isLegalSensitive) riskFlags.push("legal-sensitive");
  if (legalPhraseRisk) riskFlags.push("high-claim wording");
  if (abbreviationPenalty) riskFlags.push("ambiguous abbreviation");
  if (platformOutsideSaas) riskFlags.push("abstract SaaS wording");
  if (backwardOrder) riskFlags.push("word-order issue");
  if (stateInfo.prefix && stateInfo.confidence !== "high") riskFlags.push("state abbreviation clarity");

  notes.push(`public buyer adjustment ${adjustment >= 0 ? "+" : ""}${adjustment}`);
  notes.push(`phrase naturalness ${phraseNaturalness}/100`);
  notes.push(`buyer intent ${buyerIntentScore}/100`);
  notes.push(`recommendation type: ${recommendationType}`);

  return {
    adjustment,
    strengths,
    issues,
    notes,
    recommendation_type: recommendationType,
    phrase_naturalness: phraseNaturalness,
    buyer_intent_score: buyerIntentScore,
    seo_utility_score: seoUtilityScore,
    brandability_score: Math.round(pronounceabilityScore(cleanSld) * 0.55 + (brandableCandidate ? 30 : 10)),
    trust_risk_score: trustRiskScore,
    abbreviation_penalty: abbreviationPenalty,
    word_order_penalty: wordOrderPenalty,
    abstract_saas_penalty: abstractPenalty,
    legal_sensitive_flag: isLegalSensitive ? "yes" : "",
    risk_flags: riskFlags.join("; "),
    top_pick_group: cleanSld,
    tld_cap: tldCap,
    cap_reasons: [],
    exactLongtail,
    hasCategory,
    hasUtility,
    hasPremiumUtility,
    abstractHits,
    abbreviation,
    stateInfo,
    platformOutsideSaas,
    backwardOrder
  };
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
  const tokenConfidence = tokenConfidenceScore(sld, knownTokens, coverage, targetKeywords, positiveWords);

  const components = {
    tld: weightedScore(rawTldScore(suffix, profile), profile.weights.tld),
    length: weightedScore(rawLengthScore(len), profile.weights.length),
    keyword: weightedScore(rawKeywordScore(sld, targetKeywords, profile.keywordOptional, tokenSet), profile.weights.keyword),
    clarity: weightedScore(rawClarityScore(sld, sldRaw, knownTokens, coverage, targetKeywords, brandableCandidate, tokenConfidence), profile.weights.clarity),
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

  const publicBuyer = analyzePublicBuyerSignals({
    suffix, sldRaw, sld, len, knownTokens, coverage, targetKeywords, positiveWords, negativeWords,
    profile, tokenSet, brandableCandidate, phraseFit, tokenConfidence
  });
  score += publicBuyer.adjustment;
  strengths.push(...publicBuyer.strengths);
  issues.push(...publicBuyer.issues);

  const penalty = scorePenaltyDetails({ sldRaw, sld, knownTokens, coverage, targetKeywords, positiveWords, negativeWords, profile, issues, tweaks, brandableCandidate });
  score -= penalty.total;

  const calibration = calibrateRatingScore({
    rawScore: score, sldRaw, sld, len, coverage, targetKeywords, components, profile,
    brandableCandidate, tokenSet, phraseFit, penalty, knownTokens, positiveWords
  });
  score += calibration.adjustment;
  strengths.push(...calibration.strengths);
  issues.push(...calibration.issues);

  const capInfo = scoreCaps({ suffix, sldRaw, sld, len, coverage, targetKeywords, components, profile, brandableCandidate, tokenSet, phraseFit, knownTokens, publicBuyer });
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
    `token confidence ${tokenConfidence}/100`,
    `brand ${components.brand}/${profile.weights.brand}`,
    `intent ${components.intent}/${profile.weights.intent}`,
    `style fit ${components.fit}/${profile.weights.fit}`,
    phraseFit.notes.join(", "),
    phraseFit.strengths.length ? `phrase strengths: ${phraseFit.strengths.slice(0, 3).join(", ")}` : "no extra phrase-strength boost",
    phraseFit.issues.length ? `phrase tradeoffs: ${phraseFit.issues.slice(0, 3).join(", ")}` : "no extra phrase tradeoffs",
    calibration.notes.join(", "),
    publicBuyer.notes.join(", "),
    publicBuyer.risk_flags ? `risk flags: ${publicBuyer.risk_flags}` : "no public-buyer risk flags",
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
    style: profile.label,
    phrase_adjustment: phraseFit.adjustment,
    calibration_adjustment: calibration.adjustment,
    penalty_total: penalty.total,
    penalty_reasons: penalty.reasons.join("; "),
    score_cap: capInfo.cap,
    cap_reasons: capInfo.reasons.join("; "),
    token_count: knownTokens.length,
    token_coverage: coverage.toFixed(2),
    token_confidence: tokenConfidence,
    detected_tokens: knownTokens.join("+"),
    recommendation_type: publicBuyer.recommendation_type,
    phrase_naturalness: publicBuyer.phrase_naturalness,
    buyer_intent_score: publicBuyer.buyer_intent_score,
    seo_utility_score: publicBuyer.seo_utility_score,
    brandability_score: publicBuyer.brandability_score,
    trust_risk_score: publicBuyer.trust_risk_score,
    abbreviation_penalty: publicBuyer.abbreviation_penalty,
    word_order_penalty: publicBuyer.word_order_penalty,
    abstract_saas_penalty: publicBuyer.abstract_saas_penalty,
    legal_sensitive_flag: publicBuyer.legal_sensitive_flag,
    risk_flags: publicBuyer.risk_flags,
    top_pick_group: publicBuyer.top_pick_group,
    tld_cap: publicBuyer.tld_cap
  };
}

function scoreResult(score, label, explanation, components, notes) {
  return { score, label, explanation, components, notes, strengths: [], issues: [], style: getScoringProfile().label, phrase_adjustment: 0, calibration_adjustment: 0, penalty_total: 0, penalty_reasons: "", score_cap: score, cap_reasons: "", token_count: 0, token_coverage: "", token_confidence: "", detected_tokens: "", recommendation_type: "", phrase_naturalness: "", buyer_intent_score: "", seo_utility_score: "", brandability_score: "", trust_risk_score: "", abbreviation_penalty: "", word_order_penalty: "", abstract_saas_penalty: "", legal_sensitive_flag: "", risk_flags: "", top_pick_group: "", tld_cap: "" };
}

function weightedScore(raw0to100, weight) {
  return Math.round(Math.max(0, Math.min(100, raw0to100)) * weight / 100);
}

function rawTldScore(suffix, profile = getScoringProfile()) {
  suffix = String(suffix || "").toLowerCase();
  if (suffix === "com") return 100;

  // v13: TLD quality is now profile-aware. A .ai or .app can be strong for SaaS,
  // .shop/.store can be strong for ecommerce, and .org can be strong for trust/content.
  // They should still sit below .com for a general public shortlist.
  const label = profile?.label || "General";
  if (label === "Brandable / SaaS" && ["ai", "io", "app", "dev"].includes(suffix)) return 84;
  if (label === "Ecommerce / product" && ["shop", "store"].includes(suffix)) return 82;
  if ((label === "Trust-heavy" || label === "Course / content") && ["org"].includes(suffix)) return 82;
  if (label === "Local service" && String(suffix).includes(".")) return 58;

  if (["org", "net"].includes(suffix)) return 72;
  if (["co", "io", "ai", "app", "dev"].includes(suffix)) return 64;
  if (["legal", "law", "finance", "shop", "store"].includes(suffix)) return 58;
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

function rawClarityScore(sld, sldRaw, knownTokens, coverage, targetKeywords, brandableCandidate, tokenConfidence) {
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

  // v13: coverage alone can be fooled by learned fragments. Token confidence combines
  // coverage, token count, and whether the parts are curated/user-supplied terms.
  if (tokenConfidence >= 85) score += 6;
  else if (tokenConfidence >= 72) score += 3;
  else if (tokenConfidence < 45 && !brandableCandidate) score -= 10;
  else if (tokenConfidence < 60 && !brandableCandidate) score -= 5;

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
    // Platform/product words like app/tool/software are strong in SaaS mode, but only moderate
    // in general/trust-heavy batches. This prevents keyword+app/tool from looking premium by default.
    let multiplier = SOFT_MODIFIER_WORDS.has(term) ? 6 : 10;
    if (PLATFORM_SOFTWARE_WORDS.has(cleanKeyword(term)) && profile.label !== "Brandable / SaaS") {
      // Outside SaaS mode, app/tool/software words are context signals, not direct buyer intent.
      multiplier = Math.min(multiplier, hasSensitiveCategory(tokenSet, sld) ? 3 : 4);
    }
    hits.push(Math.min(100, points * multiplier));
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
  const platformHits = hasPlatformSoftwareSignal(tokenSet, sld);
  const directUsefulnessHits = hasDirectUsefulnessSignal(tokenSet, sld);
  const pluralOwnerProduct = hasPluralOwnerProductPattern(tokens);
  const sensitivePlatformMismatch = isSensitivePlatformMismatch(profile, tokenSet, sld);
  const platformContextIssue = platformWordContextIssue(profile, tokenSet, sld);
  const weakPronounStructure = hasWeakPronounStructure(tokens, sld);
  const categorySoftIntentOrder = hasCategorySoftIntentOrder(tokens, targetHits, intentHits);
  const intentBeforeCategoryPattern = hasIntentBeforeCategoryPattern(tokens);
  const weakOwnershipModifier = hasWeakOwnershipModifierPattern(tokens);
  const redundantPluralCategory = hasRedundantPluralCategoryPattern(tokens);
  const smallEstateReversal = hasSmallEstateReversalPattern(tokens);
  const programStackPattern = hasProgramStackPattern(tokens);
  const comparisonPhrase = analyzeComparisonPhrase(sld, tokens, tokenSet, profile);

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
  const keywordSoftIntentOrder = hasKeywordSoftIntentOrder(tokens, targetHits, intentHits);
  const premiumDirectIntentHits = dedupeTermHits(intentHits.filter(t => PREMIUM_DIRECT_INTENT_WORDS.has(t)));
  const supportOnlyIntentHits = dedupeTermHits(intentHits.filter(t => SUPPORT_ONLY_INTENT_WORDS.has(t)));
  const naturalIntentPhrase = !lastIsSoftModifier && !firstIntentBeforeKeyword && !unclearIntentStack && !keywordSoftIntentOrder && !categorySoftIntentOrder && !intentBeforeCategoryPattern && !weakOwnershipModifier && !redundantPluralCategory && !smallEstateReversal && !programStackPattern && !weakPronounStructure;

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

  if (sensitivePlatformMismatch) {
    adjustment -= 5;
    issues.push(`platform/AI wording in sensitive category: ${platformHits.slice(0, 2).join(", ")}`);
  } else if (platformContextIssue) {
    adjustment -= 3;
    issues.push(platformContextIssue);
  }

  if (pluralOwnerProduct) {
    adjustment -= 7;
    issues.push("awkward plural owner + product pattern");
  }

  if (keywordSoftIntentOrder && !brandableCandidate) {
    adjustment -= 5;
    issues.push("keyword + soft modifier + intent order is less natural");
  }

  if (categorySoftIntentOrder && !brandableCandidate) {
    adjustment -= 6;
    issues.push("category + soft modifier + intent order is less natural");
  }

  if (intentBeforeCategoryPattern && !brandableCandidate) {
    adjustment -= 5;
    issues.push("intent word before category reads less natural");
  }

  if (weakOwnershipModifier && !brandableCandidate) {
    adjustment -= 4;
    issues.push("ownership modifier is weaker than a clear action phrase");
  }

  if (redundantPluralCategory && !brandableCandidate) {
    adjustment -= 5;
    issues.push("plural category phrase reads less clean");
  }

  if (smallEstateReversal && !brandableCandidate) {
    adjustment -= 4;
    issues.push("small-estate phrase order is less natural");
  }

  if (programStackPattern && profile.label !== "Course / content" && !brandableCandidate) {
    adjustment -= 5;
    issues.push("program word is vague outside course/content use");
  }

  if (weakPronounStructure && !brandableCandidate) {
    adjustment -= 8;
    issues.push("weak pronoun makes the phrase less brandable");
  }

  if (comparisonPhrase.hasComparison) {
    adjustment += comparisonPhrase.adjustment;
    strengths.push(...comparisonPhrase.strengths);
    issues.push(...comparisonPhrase.issues);
  }

  if (supportOnlyIntentHits.length && !premiumDirectIntentHits.length && targetKeywords.length && !brandableCandidate) {
    adjustment -= 3;
    issues.push("support/platform intent is less premium than direct-purpose wording");
  }

  if (platformHits.length && !directUsefulnessHits.length && profile.label !== "Brandable / SaaS") {
    adjustment -= 2;
    issues.push("platform-style word without direct usefulness signal");
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
    platformHits,
    directUsefulnessHits,
    pluralOwnerProduct,
    sensitivePlatformMismatch,
    weakPronounStructure,
    keywordSoftIntentOrder,
    categorySoftIntentOrder,
    intentBeforeCategoryPattern,
    weakOwnershipModifier,
    redundantPluralCategory,
    smallEstateReversal,
    programStackPattern,
    comparisonPhrase,
    premiumDirectIntentHits,
    supportOnlyIntentHits,
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
  const platformHits = hasPlatformSoftwareSignal(tokenSet, sld);
  const directUsefulnessHits = hasDirectUsefulnessSignal(tokenSet, sld);
  const pluralOwnerProduct = hasPluralOwnerProductPattern(tokens);
  const sensitivePlatformMismatch = isSensitivePlatformMismatch(profile, tokenSet, sld);
  const keywordIndex = tokenIndex(tokens, targetHits);
  const intentIndex = tokenIndex(tokens, coreIntentHits.length ? coreIntentHits : intentHits);
  const firstIntentBeforeKeyword = intentIndex === 0 && keywordIndex > 0;
  const unclearIntentStack = hasUnclearIntentStack(coreIntentHits);
  const middleTokens = tokens.slice(1, -1);
  const middleIsSoftOnly = middleTokens.length && middleTokens.every(t => SOFT_MODIFIER_WORDS.has(t));
  const middleHasAwkwardAction = middleTokens.some(t => AWKWARD_ACTION_PREFIXES.has(t));
  const keywordSoftIntentOrder = hasKeywordSoftIntentOrder(tokens, targetHits, intentHits);
  const weakPronounStructure = hasWeakPronounStructure(tokens, sld);
  const categorySoftIntentOrder = hasCategorySoftIntentOrder(tokens, targetHits, intentHits);
  const intentBeforeCategoryPattern = hasIntentBeforeCategoryPattern(tokens);
  const weakOwnershipModifier = hasWeakOwnershipModifierPattern(tokens);
  const redundantPluralCategory = hasRedundantPluralCategoryPattern(tokens);
  const smallEstateReversal = hasSmallEstateReversalPattern(tokens);
  const programStackPattern = hasProgramStackPattern(tokens);
  const comparisonPhrase = analyzeComparisonPhrase(sld, tokens, tokenSet, profile);
  const naturalOrder = !lastIsSoftModifier && !firstIntentBeforeKeyword && !unclearIntentStack && !firstIsAwkwardAction && !middleHasAwkwardAction && !keywordSoftIntentOrder && !weakPronounStructure && (!comparisonPhrase.hasComparison || comparisonPhrase.natural);

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

  if (pluralOwnerProduct && !brandableCandidate) {
    adjustment -= 7;
    issues.push("plural-owner product phrase sounds awkward");
  }

  if (sensitivePlatformMismatch && !brandableCandidate) {
    adjustment -= 7;
    issues.push("software/platform word is risky in sensitive category");
  } else if (platformHits.length && !directUsefulnessHits.length && profile.label !== "Brandable / SaaS" && !brandableCandidate) {
    adjustment -= 2;
    issues.push("generic platform noun needs clearer purpose");
  }

  if (firstIsAwkwardAction && tokenCount >= 3 && !brandableCandidate) {
    adjustment -= 4;
    issues.push("awkward action prefix");
  }

  if (middleHasAwkwardAction && tokenCount >= 3 && !brandableCandidate) {
    adjustment -= 3;
    issues.push("awkward action word in middle");
  }

  if (middleIsSoftOnly && hasKeyword && hasIntent && !brandableCandidate) {
    adjustment -= 6;
    issues.push("soft modifier interrupts phrase");
  }

  if (keywordSoftIntentOrder && hasKeyword && hasIntent && !brandableCandidate) {
    adjustment -= 5;
    issues.push("less natural keyword-modifier-intent order");
  }

  if (weakPronounStructure && !brandableCandidate) {
    adjustment -= 7;
    issues.push("weak pronoun phrase");
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
  const meaningfulNumber = hasMeaningfulNumberPattern(sld, knownTokens, tokenSet);
  const tokenConfidence = tokenConfidenceScore(sld, knownTokens, coverage, targetKeywords, []);

  if (sldRaw.includes("-")) add((sldRaw.match(/-/g) || []).length > 1 ? 10 : 6, "hyphen");
  if (/\d/.test(sld)) add(meaningfulNumber ? 2 : (/\d{2,}/.test(sld) ? 9 : 6), meaningfulNumber ? "contextual number" : "number");
  if (/(.)\1\1/.test(sld)) add(5, "repeated characters");
  if (knownTokens.length > 4) add(3, "many words");
  if (knownTokens.length > 5) add(3, "wordy");
  if (coverage < 0.45 && !brandableCandidate) add(6, "hard to parse");
  if (tokenConfidence < 45 && !brandableCandidate) add(6, "low token confidence");
  else if (tokenConfidence < 60 && !brandableCandidate) add(3, "moderate token confidence");

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

  const sensitiveHits = tokenListHits(SENSITIVE_CATEGORY_WORDS, tokenSet, sld);
  const platformHits = tokenListHits(PLATFORM_SOFTWARE_WORDS, tokenSet, sld);
  const genericPlatformHits = tokenListHits(PLATFORM_GENERIC_WORDS, tokenSet, sld);
  const directHits = hasDirectUsefulnessSignal(tokenSet, sld).filter(t => !PLATFORM_GENERIC_WORDS.has(t));
  if (sensitiveHits.length && platformHits.length && profile.label !== "Brandable / SaaS" && !brandableCandidate) {
    add(profile.strictTrust ? 10 : 7, `sensitive category + platform word (${platformHits.slice(0, 2).join("+")})`);
  }
  if (sensitiveHits.length && isTermMatch("ai", tokenSet, sld) && profile.label !== "Brandable / SaaS" && !brandableCandidate) {
    add(profile.strictTrust ? 10 : 8, "AI with sensitive category");
  }
  if (hasPluralOwnerProductPattern(knownTokens) && !brandableCandidate) {
    add(8, "awkward plural-owner product phrase");
  }
  if (genericPlatformHits.length && !directHits.length && !sensitiveHits.length && profile.label !== "Brandable / SaaS" && !brandableCandidate) {
    add(6, `generic platform word (${genericPlatformHits.slice(0, 2).join("+")})`);
  }
  const legalRiskHits = tokenListHits(LEGAL_PROFESSIONAL_WORDS, tokenSet, sld);
  if (legalRiskHits.length && hasDirectUsefulnessSignal(tokenSet, sld).length && !brandableCandidate) {
    add(profile.strictTrust ? 6 : 4, `legal/professional wording (${legalRiskHits.slice(0, 2).join("+")})`);
  }
  if (hasWeakPronounStructure(knownTokens, sld) && !brandableCandidate) {
    add(8, "weak pronoun phrase");
  }
  if (hasKeywordSoftIntentOrder(knownTokens, targetKeywords.filter(k => isTermMatch(k, tokenSet, sld)), hasDirectUsefulnessSignal(tokenSet, sld)) && !brandableCandidate) {
    add(5, "less natural keyword-modifier-intent order");
  }
  if (hasCategorySoftIntentOrder(knownTokens, targetKeywords.filter(k => isTermMatch(k, tokenSet, sld)), hasDirectUsefulnessSignal(tokenSet, sld)) && !brandableCandidate) {
    add(6, "less natural category-modifier-intent order");
  }
  if (hasIntentBeforeCategoryPattern(knownTokens) && !brandableCandidate) {
    add(5, "intent word before category");
  }
  if (hasWeakOwnershipModifierPattern(knownTokens) && !brandableCandidate) {
    add(4, "weak ownership modifier");
  }
  if (hasRedundantPluralCategoryPattern(knownTokens) && !brandableCandidate) {
    add(5, "plural category phrase");
  }
  if (hasSmallEstateReversalPattern(knownTokens) && !brandableCandidate) {
    add(4, "small-estate phrase order");
  }
  if (hasProgramStackPattern(knownTokens) && profile.label !== "Course / content" && !brandableCandidate) {
    add(5, "vague program stack");
  }

  const comparisonPhrase = analyzeComparisonPhrase(sld, knownTokens, tokenSet, profile);
  if (comparisonPhrase.hasComparison && !brandableCandidate) {
    if (comparisonPhrase.pairQuality === "weak") add(6, `weak comparison pair (${comparisonPhrase.optionPair})`);
    if (comparisonPhrase.appOnly && comparisonPhrase.pairQuality !== "strong" && profile.label !== "Brandable / SaaS") add(4, "generic app/tool wrapper for comparison phrase");
    if (comparisonPhrase.smashed) add(3, "smashed comparison pair");
    if (!comparisonPhrase.decisionHits.length && !comparisonPhrase.appOnly && profile.label !== "Brandable / SaaS") add(3, "comparison lacks decision-tool word");
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


function hasSensitiveCategory(tokenSet, sld) {
  return tokenListHits(SENSITIVE_CATEGORY_WORDS, tokenSet, sld).length > 0;
}

function hasPlatformSoftwareSignal(tokenSet, sld) {
  return tokenListHits(PLATFORM_SOFTWARE_WORDS, tokenSet, sld);
}

function hasDirectUsefulnessSignal(tokenSet, sld) {
  return tokenListHits(DIRECT_USEFULNESS_WORDS, tokenSet, sld);
}

function hasPluralOwnerProductPattern(tokens = []) {
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const first = tokens[i];
    const second = tokens[i + 1];
    if (!first || !second || !PRODUCT_NOUN_WORDS.has(second)) continue;
    if (PLURAL_OWNER_WORDS.has(first)) return true;
    if (first.endsWith("s") && first.length > 4 && !SAFE_PLURAL_PRODUCT_WORDS.has(first) && !DIRECT_USEFULNESS_WORDS.has(first)) return true;
  }
  return false;
}

function pluralOwnerProductWord(tokens = []) {
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const first = tokens[i];
    const second = tokens[i + 1];
    if (!first || !second || !PRODUCT_NOUN_WORDS.has(second)) continue;
    if (PLURAL_OWNER_WORDS.has(first)) return second;
    if (first.endsWith("s") && first.length > 4 && !SAFE_PLURAL_PRODUCT_WORDS.has(first) && !DIRECT_USEFULNESS_WORDS.has(first)) return second;
  }
  return "";
}

function hasWeakPronounStructure(tokens = [], sld = "") {
  const cleanTokens = tokens.map(cleanKeyword).filter(Boolean);
  // Only count the pronoun when tokenization isolates it. This avoids false positives
  // like affidavit+kit, where the letters "it" appear across a real word boundary.
  return cleanTokens.some(t => WEAK_PRONOUN_WORDS.has(t));
}

function hasKeywordSoftIntentOrder(tokens = [], targetHits = [], intentHits = []) {
  const cleanTokens = tokens.map(cleanKeyword).filter(Boolean);
  const targets = new Set((targetHits || []).map(cleanKeyword));
  const intents = new Set((intentHits || []).map(cleanKeyword));
  if (!cleanTokens.length || !targets.size || !intents.size) return false;
  for (let i = 0; i < cleanTokens.length - 2; i += 1) {
    const a = cleanTokens[i];
    const b = cleanTokens[i + 1];
    const c = cleanTokens[i + 2];
    if (targets.has(a) && SOFT_MODIFIER_WORDS.has(b) && intents.has(c)) return true;
  }
  return false;
}


function isCategoryLikeToken(token = "") {
  const t = cleanKeyword(token);
  if (!t) return false;
  if (SENSITIVE_CATEGORY_WORDS.has(t) || CATEGORY_LOCK_WORDS.has(t) || COMPARISON_OPTIONS.has(t)) return true;
  // Treat frequent real-estate/legal phrase words as categories even when the user has not
  // entered target keywords. This helps word-order scoring work on pasted batches alone.
  if (["estate", "estates", "probate", "executor", "executors", "heir", "heirs", "heirship", "affidavit", "rent", "buy", "own", "lease", "mortgage", "tax"].includes(t)) return true;
  return false;
}

function hasCategorySoftIntentOrder(tokens = [], targetHits = [], intentHits = []) {
  const cleanTokens = tokens.map(cleanKeyword).filter(Boolean);
  const targets = new Set((targetHits || []).map(cleanKeyword));
  const intents = new Set((intentHits || []).map(cleanKeyword));
  for (let i = 0; i < cleanTokens.length - 2; i += 1) {
    const a = cleanTokens[i];
    const b = cleanTokens[i + 1];
    const c = cleanTokens[i + 2];
    const categoryA = targets.has(a) || isCategoryLikeToken(a);
    const intentC = intents.has(c) || CORE_INTENT_WORDS.has(c) || DIRECT_USEFULNESS_WORDS.has(c) || PREMIUM_DIRECT_INTENT_WORDS.has(c);
    if (categoryA && CATEGORY_MODIFIER_WORDS.has(b) && intentC) return true;
  }
  return false;
}

function hasIntentBeforeCategoryPattern(tokens = []) {
  const cleanTokens = tokens.map(cleanKeyword).filter(Boolean);
  if (cleanTokens.length < 2) return false;
  const first = cleanTokens[0];
  if (!INTENT_PREFIX_WEAK_WORDS.has(first)) return false;
  // Natural decision/service compounds can start with compare/quote/estimate, so keep this
  // focused on noun-like intent prefixes such as guide/forms/help/kit/tool.
  return cleanTokens.slice(1).some(isCategoryLikeToken);
}

function hasWeakOwnershipModifierPattern(tokens = []) {
  const cleanTokens = tokens.map(cleanKeyword).filter(Boolean);
  if (cleanTokens.length < 2) return false;
  // "ownprobateguide" / "ownestateforms" is usually less natural than
  // "diyprobateguide" or "doyourownprobate".
  if (OWNERSHIP_MODIFIER_WORDS.has(cleanTokens[0]) && cleanTokens.slice(1).some(isCategoryLikeToken)) {
    return true;
  }
  return false;
}

function hasRedundantPluralCategoryPattern(tokens = []) {
  const cleanTokens = tokens.map(cleanKeyword).filter(Boolean);
  for (let i = 0; i < cleanTokens.length - 1; i += 1) {
    const a = cleanTokens[i];
    const b = cleanTokens[i + 1];
    if ((a === "estates" || a === "trusts" || a === "wills") && (PRODUCT_NOUN_WORDS.has(b) || DIRECT_USEFULNESS_WORDS.has(b))) return true;
  }
  return false;
}

function hasSmallEstateReversalPattern(tokens = []) {
  const cleanTokens = tokens.map(cleanKeyword).filter(Boolean);
  const smallIdx = cleanTokens.indexOf("small");
  const estateIdx = cleanTokens.findIndex(t => t === "estate" || t === "estates");
  if (smallIdx < 0 || estateIdx < 0) return false;
  const hasSmallEstate = estateIdx === smallIdx + 1;
  if (!hasSmallEstate) return true;
  // "small estate guide" is natural. "guide small estate" is understandable,
  // but less clean as a domain phrase.
  return smallIdx > 0 && INTENT_PREFIX_WEAK_WORDS.has(cleanTokens[0]);
}

function hasProgramStackPattern(tokens = []) {
  const cleanTokens = tokens.map(cleanKeyword).filter(Boolean);
  if (!cleanTokens.some(t => NONPREMIUM_PROGRAM_WORDS.has(t))) return false;
  const otherIntent = cleanTokens.some(t => t !== "program" && t !== "programs" && (DIRECT_USEFULNESS_WORDS.has(t) || PREMIUM_DIRECT_INTENT_WORDS.has(t)));
  return otherIntent || cleanTokens.length >= 3;
}

function hasUnnaturalCategoryOrderPattern(tokens = [], targetHits = [], intentHits = []) {
  return hasCategorySoftIntentOrder(tokens, targetHits, intentHits) ||
    hasIntentBeforeCategoryPattern(tokens) ||
    hasWeakOwnershipModifierPattern(tokens) ||
    hasRedundantPluralCategoryPattern(tokens) ||
    hasSmallEstateReversalPattern(tokens) ||
    hasProgramStackPattern(tokens);
}

function premiumDirectIntentHitCount(phraseFit = {}) {
  return dedupeTermHits([...(phraseFit.intentHits || []), ...(phraseFit.directUsefulnessHits || []), ...(phraseFit.customPositiveHits || [])]
    .filter(t => PREMIUM_DIRECT_INTENT_WORDS.has(t) || (phraseFit.customPositiveHits || []).includes(t))).length;
}

function isSensitivePlatformMismatch(profile, tokenSet, sld) {
  if (profile.label === "Brandable / SaaS") return false;
  const sensitiveHits = tokenListHits(SENSITIVE_CATEGORY_WORDS, tokenSet, sld);
  if (!sensitiveHits.length) return false;
  const platformHits = tokenListHits(PLATFORM_SOFTWARE_WORDS, tokenSet, sld);
  if (!platformHits.length) return false;
  return true;
}

function platformWordContextIssue(profile, tokenSet, sld) {
  const platformHits = tokenListHits(PLATFORM_GENERIC_WORDS, tokenSet, sld);
  if (!platformHits.length) return "";
  if (profile.label === "Brandable / SaaS") return "";
  const directHits = hasDirectUsefulnessSignal(tokenSet, sld).filter(t => !PLATFORM_GENERIC_WORDS.has(t));
  if (!directHits.length) return `generic platform word: ${platformHits.slice(0, 2).join(", ")}`;
  return "";
}


function analyzeComparisonPhrase(sld, tokens = [], tokenSet = new Set(), profile = getScoringProfile()) {
  const cleanSld = cleanKeyword(sld);
  const tokenList = (tokens || []).map(cleanKeyword).filter(Boolean);
  const optionList = [...COMPARISON_OPTIONS].sort((a, b) => b.length - a.length);
  const suffixWords = [...DECISION_TOOL_WORDS, ...GENERIC_APP_WRAPPER_WORDS]
    .sort((a, b) => b.length - a.length);
  let best = null;

  function register(first, second, connector, startIndex, endIndex) {
    if (!first || !second || first === second) return;
    const rawPair = `${first}+${second}`;
    let pairQuality = "medium";
    if (STRONG_COMPARISON_PAIRS.has(rawPair)) pairQuality = "strong";
    else if (WEAK_COMPARISON_PAIRS.has(rawPair)) pairQuality = "weak";
    else if (MEDIUM_COMPARISON_PAIRS.has(rawPair)) pairQuality = "medium";
    else pairQuality = "weak";

    const remainder = cleanSld.slice(endIndex);
    const suffixHits = suffixWords.filter(word => remainder === word || remainder.endsWith(word) || isTermMatch(word, tokenSet, cleanSld));
    const decisionHits = suffixHits.filter(word => DECISION_TOOL_WORDS.has(word));
    const wrapperHits = suffixHits.filter(word => GENERIC_APP_WRAPPER_WORDS.has(word));
    const appOnly = wrapperHits.length > 0 && decisionHits.length === 0;
    const smashed = !connector;
    const optionPair = rawPair;
    const natural = pairQuality !== "weak" && !(smashed && appOnly);

    const candidate = {
      hasComparison: true,
      first,
      second,
      connector,
      optionPair,
      pairQuality,
      remainder,
      suffixHits,
      decisionHits,
      wrapperHits,
      appOnly,
      smashed,
      natural,
      startIndex,
      endIndex
    };
    const score = (pairQuality === "strong" ? 30 : pairQuality === "medium" ? 20 : 5)
      + (decisionHits.length ? 12 : 0)
      - (appOnly ? 7 : 0)
      - (smashed ? 4 : 0)
      - (startIndex > 0 ? 2 : 0);
    if (!best || score > best._score) best = { ...candidate, _score: score };
  }

  for (const first of optionList) {
    for (const second of optionList) {
      if (first === second) continue;
      for (const connector of ["or", "vs", "versus"]) {
        const pattern = `${first}${connector}${second}`;
        const index = cleanSld.indexOf(pattern);
        if (index >= 0) register(first, second, connector, index, index + pattern.length);
      }
      // Smashed option pairs, e.g. rentbuyapp.com. These are readable sometimes,
      // but usually less natural than rent-or-buy or buy-vs-rent.
      const smashed = `${first}${second}`;
      const index = cleanSld.indexOf(smashed);
      if (index >= 0) register(first, second, "", index, index + smashed.length);
    }
  }

  if (!best) return {
    hasComparison: false,
    adjustment: 0,
    strengths: [],
    issues: [],
    cap: 98,
    capReason: ""
  };

  let adjustment = 0;
  const strengths = [];
  const issues = [];
  let cap = 98;
  let capReason = "";

  if (best.pairQuality === "strong" && best.decisionHits.length && !best.smashed) {
    adjustment += 7;
    strengths.push(`strong comparison + decision phrase: ${best.first} ${best.connector} ${best.second}`);
  } else if (best.pairQuality === "strong" && best.appOnly && !best.smashed) {
    adjustment += 8;
    strengths.push(`clear comparison-app concept: ${best.first} ${best.connector} ${best.second}`);
  } else if (best.pairQuality === "strong") {
    adjustment += 2;
    strengths.push(`useful comparison pair: ${best.first}/${best.second}`);
  } else if (best.pairQuality === "medium" && best.decisionHits.length) {
    adjustment += 1;
    issues.push(`less obvious comparison pair: ${best.first}/${best.second}`);
  } else if (best.pairQuality === "medium") {
    adjustment -= 2;
    issues.push(`less obvious comparison pair: ${best.first}/${best.second}`);
  } else {
    adjustment -= 7;
    issues.push(`awkward comparison pair: ${best.first}/${best.second}`);
    cap = Math.min(cap, 72);
    capReason = "weak comparison pair";
  }

  if (best.appOnly && profile.label !== "Brandable / SaaS") {
    if (best.pairQuality === "strong") {
      issues.push("app wrapper is useful but less direct than calculator/compare/guide wording");
      cap = Math.min(cap, 88);
    } else {
      adjustment -= 3;
      issues.push("generic app/tool wrapper is weaker than calculator/compare/guide wording");
      cap = Math.min(cap, 80);
    }
    capReason = capReason || "comparison app wrapper outside SaaS mode";
  }

  if (best.smashed) {
    adjustment -= best.pairQuality === "strong" ? 3 : 5;
    issues.push("smashed comparison pair is less readable than or/vs wording");
    cap = Math.min(cap, best.pairQuality === "strong" ? 84 : 76);
    capReason = capReason || "smashed comparison pair";
  }

  if (!best.decisionHits.length && !best.appOnly && profile.label !== "Brandable / SaaS") {
    adjustment -= 2;
    issues.push("comparison phrase lacks a strong decision-tool word");
    cap = Math.min(cap, best.pairQuality === "strong" ? 89 : 82);
    capReason = capReason || "comparison lacks decision-tool word";
  }

  return { ...best, adjustment, strengths, issues, cap, capReason };
}

function calibrateRatingScore(ctx) {
  const { rawScore, sldRaw, sld, len, coverage, targetKeywords, components, profile, brandableCandidate, tokenSet, phraseFit, penalty, knownTokens = [], positiveWords = [] } = ctx;
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
  const tokenConfidence = tokenConfidenceScore(sld, knownTokens, coverage, targetKeywords, positiveWords);
  const cleanHighEvidence = cleanStructure && compact && tokenConfidence >= 72 && (brandableCandidate || (hasTarget && hasIntent));

  // Help very good but not perfect names break out of the high-70s without inflating weak names.
  const weakPhraseIssue = (phraseFit.issues || []).some(issue => /backward|stacked|soft modifier|category|ownership|plural category|small-estate|program|awkward|multiple utility|weak phrase|less natural|pronoun|platform|sensitive/i.test(issue));

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

  if (tokenConfidence < 55 && !brandableCandidate && rawScore >= 65) {
    adjustment -= 3;
    issues.push("calibrated down for low token confidence");
  } else if (tokenConfidence >= 88 && cleanHighEvidence && rawScore >= 70 && rawScore <= 86 && penalty.total <= 3 && !weakPhraseIssue) {
    adjustment += 2;
    strengths.push("calibrated upward for very high token confidence");
  }

  if (weakPhraseIssue && rawScore >= 76 && !brandableCandidate) {
    adjustment -= 3;
    issues.push("calibrated down for weaker phrase naturalness");
  }

  if ((phraseFit.weakPronounStructure || phraseFit.keywordSoftIntentOrder || phraseFit.categorySoftIntentOrder || phraseFit.intentBeforeCategoryPattern || phraseFit.weakOwnershipModifier || phraseFit.redundantPluralCategory || phraseFit.smallEstateReversal || phraseFit.programStackPattern) && rawScore >= 70 && !brandableCandidate) {
    adjustment -= 3;
    issues.push("calibrated down for awkward word order");
  }

  if (phraseFit.sensitivePlatformMismatch && rawScore >= 72 && !brandableCandidate) {
    adjustment -= 4;
    issues.push("calibrated down for sensitive platform wording");
  }

  notes.push(`calibration ${adjustment >= 0 ? "+" : ""}${adjustment}`);
  return { adjustment, strengths, issues, notes };
}

function scoreCaps(ctx) {
  const { suffix, sldRaw, sld, len, coverage, targetKeywords, components, profile, brandableCandidate, tokenSet, phraseFit, knownTokens = [], publicBuyer = {} } = ctx;
  let cap = 96;
  const reasons = [];
  function apply(value, reason) {
    if (value < cap) {
      cap = value;
      reasons.push(reason);
    }
  }

  // v16 public-buyer gates: do not let additive keyword scores push weak human phrases into the top tier.
  if (publicBuyer && Number.isFinite(Number(publicBuyer.tld_cap))) apply(Number(publicBuyer.tld_cap), "public-buyer TLD cap");
  if (selectedProfileIsPublicBuyer(profile) && publicBuyer) {
    if (Number(publicBuyer.abbreviation_penalty || 0) >= 20) apply(64, "ambiguous abbreviation central to name");
    else if (Number(publicBuyer.abbreviation_penalty || 0) > 0) apply(72, "ambiguous abbreviation");
    if (Number(publicBuyer.abstract_saas_penalty || 0) >= 18) apply(72, "abstract SaaS phrase in public mode");
    else if (Number(publicBuyer.abstract_saas_penalty || 0) > 0) apply(78, "abstract product word in public mode");
    if (Number(publicBuyer.word_order_penalty || 0) >= 16) apply(68, "reversed/awkward public phrase order");
    else if (Number(publicBuyer.word_order_penalty || 0) > 0) apply(76, "less natural public phrase order");
    if (Number(publicBuyer.phrase_naturalness || 0) < 58 && !brandableCandidate) apply(68, "low public phrase naturalness");
    else if (Number(publicBuyer.phrase_naturalness || 0) < 70 && !brandableCandidate) apply(80, "only moderate public phrase naturalness");
    if (publicBuyer.platformOutsideSaas && publicBuyer.hasCategory && !publicBuyer.hasPremiumUtility && !brandableCandidate) apply(74, "category + abstract SaaS word");
    if (publicBuyer.legal_sensitive_flag && Number(publicBuyer.trust_risk_score || 0) >= 35) apply(78, "high legal/trust-sensitive wording");
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
  const middleHasAwkwardAction = knownTokens.slice(1, -1).some(t => AWKWARD_ACTION_PREFIXES.has(t));
  const cleanPremiumShape = !sldRaw.includes("-") && !/\d/.test(sld) && coverage >= 0.8 && len >= 6 && len <= 15 && knownTokens.length >= 2 && knownTokens.length <= 3;
  const canonicalKeywordIntent = targetEvidence && intentEvidence && cleanPremiumShape && !lastIsSoftModifier && !firstIntentBeforeKeyword && !unclearIntentStack && !firstIsAwkwardAction && phraseFit.fillerHits.length === 0;
  const exactOrPremiumBrandable = exactTargetName || (brandableCandidate && len <= 12 && pronounce >= 78);

  if (targetKeywords.length && components.keyword === 0 && !profile.keywordOptional) apply(78, "no target keyword");
  if (publicBuyer && publicBuyer.exactLongtail && Number(publicBuyer.buyer_intent_score || 0) >= 80) {
    if (coverage < 0.45 && !brandableCandidate) apply(84, "long exact-match phrase needs review");
    else if (coverage < 0.62 && !brandableCandidate) apply(86, "somewhat harder to read exact-match phrase");
    if (len > 28) apply(82, "very long exact-match phrase");
    else if (len > 22) apply(84, "long exact-match phrase");
    else if (len > 18) apply(88, "slightly long exact-match phrase");
  } else {
    if (coverage < 0.45 && !brandableCandidate) apply(76, "harder to read");
    else if (coverage < 0.62 && !brandableCandidate) apply(84, "somewhat harder to read");
    if (len > 24) apply(70, "very long");
    else if (len > 20) apply(79, "long name");
    else if (len > 18) apply(86, "slightly long name");
  }
  const meaningfulNumber = hasMeaningfulNumberPattern(sld, knownTokens, tokenSet);
  const tokenConfidence = tokenConfidenceScore(sld, knownTokens, coverage, targetKeywords, []);

  if (sldRaw.includes("-")) apply((sldRaw.match(/-/g) || []).length > 1 ? 72 : 78, "hyphen");
  if (/\d/.test(sld)) {
    if (meaningfulNumber) apply(profile.label === "Brandable / SaaS" ? 90 : 88, "numbered term is context-specific");
    else apply(/\d{2,}/.test(sld) ? 72 : 78, "number");
  }
  if (tokenConfidence < 45 && !brandableCandidate) apply(72, "low token confidence");
  else if (tokenConfidence < 60 && !brandableCandidate) apply(84, "moderate token confidence");
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
  if (middleHasAwkwardAction && intentEvidence && targetEvidence && !brandableCandidate) apply(88, "awkward action word in middle");
  if (intentEvidence && targetEvidence && !canonicalKeywordIntent && !exactOrPremiumBrandable && !brandableCandidate) apply(89, "not a natural premium-grade phrase");

  const professionalRiskHits = tokenListHits(PROFESSIONAL_RISK_WORDS, tokenSet, sld);
  const legalRiskHits = tokenListHits(LEGAL_PROFESSIONAL_WORDS, tokenSet, sld);
  const sensitiveHits = tokenListHits(SENSITIVE_CATEGORY_WORDS, tokenSet, sld);
  const platformHits = hasPlatformSoftwareSignal(tokenSet, sld);
  const genericPlatformHits = tokenListHits(PLATFORM_GENERIC_WORDS, tokenSet, sld);
  const directUsefulnessHits = hasDirectUsefulnessSignal(tokenSet, sld);
  const pluralOwnerProduct = hasPluralOwnerProductPattern(knownTokens);
  const pluralProductWord = pluralOwnerProductWord(knownTokens);
  const sensitivePlatformMismatch = sensitiveHits.length && platformHits.length && profile.label !== "Brandable / SaaS";
  const weakPronounStructure = hasWeakPronounStructure(knownTokens, sld);
  const keywordSoftIntentOrder = hasKeywordSoftIntentOrder(knownTokens, phraseFit.targetHits || [], coreIntentHits);
  const categorySoftIntentOrder = hasCategorySoftIntentOrder(knownTokens, phraseFit.targetHits || [], coreIntentHits);
  const intentBeforeCategoryPattern = hasIntentBeforeCategoryPattern(knownTokens);
  const weakOwnershipModifier = hasWeakOwnershipModifierPattern(knownTokens);
  const redundantPluralCategory = hasRedundantPluralCategoryPattern(knownTokens);
  const smallEstateReversal = hasSmallEstateReversalPattern(knownTokens);
  const programStackPattern = hasProgramStackPattern(knownTokens);
  const comparisonPhrase = analyzeComparisonPhrase(sld, knownTokens, tokenSet, profile);
  const strongComparisonDecision = comparisonPhrase.hasComparison && comparisonPhrase.pairQuality === "strong" && comparisonPhrase.decisionHits.length > 0 && !comparisonPhrase.smashed && !comparisonPhrase.appOnly;
  const premiumDirectCount = premiumDirectIntentHitCount(phraseFit);
  const platformOnlyIntent = platformHits.length && !premiumDirectCount && profile.label !== "Brandable / SaaS";
  if (professionalRiskHits.length && (isTermMatch("tool", tokenSet, sld) || isTermMatch("app", tokenSet, sld) || isTermMatch("ai", tokenSet, sld) || isTermMatch("easy", tokenSet, sld) || isTermMatch("done", tokenSet, sld))) {
    apply(profile.strictTrust ? 76 : 84, "professional/trust wording needs review");
  }
  if (legalRiskHits.length && directUsefulnessHits.length && !brandableCandidate) {
    apply(profile.strictTrust ? 82 : 88, "legal/professional wording needs review");
  }
  if (sensitiveHits.length && isTermMatch("ai", tokenSet, sld) && !brandableCandidate) apply(profile.label === "Brandable / SaaS" ? 86 : (profile.strictTrust ? 72 : 78), "AI with sensitive category");
  if (sensitivePlatformMismatch && !brandableCandidate) apply(profile.strictTrust ? 74 : 80, "platform wording in sensitive category");
  if (pluralOwnerProduct && !brandableCandidate) {
    const pluralCap = PLATFORM_SOFTWARE_WORDS.has(pluralProductWord) || PLATFORM_GENERIC_WORDS.has(pluralProductWord) ? 76 : 82;
    apply(profile.strictTrust ? Math.min(76, pluralCap) : pluralCap, "plural owner + product phrase");
  }
  if (genericPlatformHits.length && profile.label !== "Brandable / SaaS" && !directUsefulnessHits.length && !brandableCandidate) apply(78, "generic platform word outside SaaS mode");
  if (genericPlatformHits.length && targetEvidence && profile.label !== "Brandable / SaaS" && !brandableCandidate) apply(82, "platform word is context-dependent");
  if (platformOnlyIntent && !brandableCandidate) apply(80, "platform-only intent outside SaaS mode");
  if (weakPronounStructure && !brandableCandidate) apply(72, "weak pronoun phrase");
  if (keywordSoftIntentOrder && !brandableCandidate) apply(82, "keyword + soft modifier + intent order");
  if (categorySoftIntentOrder && !brandableCandidate) apply(80, "category + soft modifier + intent order");
  if (intentBeforeCategoryPattern && !brandableCandidate) apply(80, "intent word before category");
  if (weakOwnershipModifier && !brandableCandidate) apply(82, "weak ownership modifier");
  if (redundantPluralCategory && !brandableCandidate) apply(78, "plural category phrase");
  if (smallEstateReversal && !brandableCandidate) apply(80, "small-estate phrase order");
  if (programStackPattern && profile.label !== "Course / content" && !brandableCandidate) apply(78, "vague program stack");
  if (comparisonPhrase.hasComparison && !brandableCandidate) {
    if (comparisonPhrase.pairQuality === "weak") apply(70, "weak comparison pair");
    if (comparisonPhrase.appOnly && profile.label !== "Brandable / SaaS") apply(comparisonPhrase.pairQuality === "strong" ? 88 : 80, "comparison app wrapper outside SaaS mode");
    if (comparisonPhrase.smashed) apply(comparisonPhrase.pairQuality === "strong" ? 84 : 76, "smashed comparison pair");
    if (!comparisonPhrase.decisionHits.length && !comparisonPhrase.appOnly && profile.label !== "Brandable / SaaS") apply(comparisonPhrase.pairQuality === "strong" ? 88 : 80, "comparison lacks decision-tool word");
    if (comparisonPhrase.capReason) apply(comparisonPhrase.cap, comparisonPhrase.capReason);
  }

  // TLDs are part of the rating, not just a component. Strong alternatives can still score well,
  // but only .com should be able to reach the very top of a general-purpose shortlist.
  if (suffix && suffix !== "com") {
    const strongAltTlds = new Set(["org", "net", "co", "io", "ai", "app", "dev", "legal", "law", "finance", "shop", "store"]);
    const profileAlignedAlt =
      (profile.label === "Brandable / SaaS" && ["io", "ai", "app", "dev"].includes(suffix)) ||
      (profile.label === "Ecommerce / product" && ["shop", "store"].includes(suffix)) ||
      (profile.label === "Trust-heavy" && ["org", "net"].includes(suffix));
    if (selectedProfileIsPublicBuyer(profile)) {
      if (["org", "net"].includes(suffix)) apply(88, `${suffix} TLD below .com`);
      else if (suffix === "co") apply(84, ".co confusion risk vs .com");
      else if (["app", "legal", "law", "shop", "store"].includes(suffix)) apply(82, `${suffix} TLD is context-specific`);
      else if (["io", "ai", "dev"].includes(suffix)) apply(78, `${suffix} TLD is SaaS/dev leaning`);
      else if (String(suffix).includes(".")) apply(78, "compound country-code TLD");
      else apply(74, "weaker TLD");
    } else if (profileAlignedAlt) apply(93, `${suffix} TLD below .com`);
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
    const premiumBlockers = Boolean(
      phraseFit.pluralOwnerProduct ||
      phraseFit.sensitivePlatformMismatch ||
      phraseFit.weakPronounStructure ||
      phraseFit.keywordSoftIntentOrder ||
      phraseFit.categorySoftIntentOrder ||
      phraseFit.intentBeforeCategoryPattern ||
      phraseFit.weakOwnershipModifier ||
      phraseFit.redundantPluralCategory ||
      phraseFit.smallEstateReversal ||
      phraseFit.programStackPattern ||
      (phraseFit.comparisonPhrase && phraseFit.comparisonPhrase.hasComparison && !phraseFit.comparisonPhrase.natural) ||
      (phraseFit.platformHits || []).some(t => PLATFORM_GENERIC_WORDS.has(t)) ||
      (phraseFit.supportOnlyIntentHits || []).length && !premiumDirectCount ||
      phraseFit.fillerHits.length ||
      lastIsSoftModifier ||
      firstIntentBeforeKeyword ||
      unclearIntentStack
    );
    const hasCleanTopEvidence = (exactOrPremiumBrandable || canonicalKeywordIntent || strongComparisonDecision) && !premiumBlockers;
    if (premiumBlockers && !brandableCandidate) apply(86, "top-tier premium blockers");
    if (phraseFit.adjustment <= -5 && !brandableCandidate) apply(82, "weak phrase quality");
    if (targetKeywords.length && phraseFit.targetHits.length && !intentEvidence && !brandableCandidate && !exactTargetName) {
      apply(84, "keyword lacks clear intent support");
    }
    if (!hasCleanTopEvidence && !brandableCandidate) apply(88, "not enough top-tier evidence");
    if (intentEvidence && !premiumDirectCount && !brandableCandidate && profile.label !== "Brandable / SaaS") apply(86, "no premium direct-purpose word");
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
  if (/\d/.test(sld)) {
    if (hasMeaningfulNumberPattern(sld, knownTokens, tokenSet)) issues.push("numbered term is niche-specific but meaningful");
    else issues.push("number hurts trust/readability");
  }

  const profileHits = Object.keys(profile.positives || {}).filter(t => isTermMatch(t, tokenSet, sld));
  if (profileHits.length) strengths.push(`${profile.label} fit: ${profileHits.slice(0, 2).join(", ")}`);
  if (components.intent >= Math.max(6, Math.round(profile.weights.intent * 0.7))) strengths.push("clear user intent word");

  const platformHits = hasPlatformSoftwareSignal(tokenSet, sld);
  if (platformHits.length && profile.label !== "Brandable / SaaS" && hasSensitiveCategory(tokenSet, sld)) {
    issues.push("platform/AI wording needs context in sensitive categories");
  }
  if (hasPluralOwnerProductPattern(knownTokens)) issues.push("plural-owner product phrase is less clean");
  if (hasWeakPronounStructure(knownTokens, sld)) issues.push("weak pronoun makes phrase less clean");
  const keywordHitsForOrder = targetKeywords.filter(k => k && isTermMatch(k, tokenSet, sld));
  if (hasKeywordSoftIntentOrder(knownTokens, keywordHitsForOrder, hasDirectUsefulnessSignal(tokenSet, sld))) issues.push("word order is less natural");
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
    tld_score: score.components?.tld ?? "",
    length_score: score.components?.length ?? "",
    keyword_score: score.components?.keyword ?? "",
    clarity_score: score.components?.clarity ?? "",
    brand_score: score.components?.brand ?? "",
    intent_score: score.components?.intent ?? "",
    fit_score: score.components?.fit ?? "",
    phrase_adjustment: score.phrase_adjustment ?? "",
    calibration_adjustment: score.calibration_adjustment ?? "",
    penalty_total: score.penalty_total ?? "",
    penalty_reasons: score.penalty_reasons ?? "",
    score_cap: score.score_cap ?? "",
    cap_reasons: score.cap_reasons ?? "",
    token_count: score.token_count ?? "",
    token_coverage: score.token_coverage ?? "",
    token_confidence: score.token_confidence ?? "",
    detected_tokens: score.detected_tokens ?? "",
    recommendation_type: score.recommendation_type ?? "",
    phrase_naturalness: score.phrase_naturalness ?? "",
    buyer_intent_score: score.buyer_intent_score ?? "",
    seo_utility_score: score.seo_utility_score ?? "",
    brandability_score: score.brandability_score ?? "",
    trust_risk_score: score.trust_risk_score ?? "",
    abbreviation_penalty: score.abbreviation_penalty ?? "",
    word_order_penalty: score.word_order_penalty ?? "",
    abstract_saas_penalty: score.abstract_saas_penalty ?? "",
    legal_sensitive_flag: score.legal_sensitive_flag ?? "",
    risk_flags: score.risk_flags ?? "",
    top_pick_group: score.top_pick_group || topPickGroup(result.normalized_domain || ""),
    tld_cap: score.tld_cap ?? "",
    scoring_style: score.style || getScoringProfile().label,
    namecheap_url: result.normalized_domain ? namecheapUrl(result.normalized_domain) : (result.namecheap_url || ""),
    registrar_url: result.normalized_domain ? registrarUrl(result.normalized_domain) : (result.registrar_url || result.namecheap_url || ""),
    registrar_name: selectedRegistrarLabel(),
    scoring_version: SCORING_VERSION,
    scoring_settings_key: scoringSettingsKey()
  };
}

function applyBatchMetrics(rows) {
  const key = scoringSettingsKey();
  const enhancedRows = rows.filter(Boolean).map(row => {
    if (row && row.scoring_version === SCORING_VERSION && row.scoring_settings_key === key && row.domain_score !== undefined && row.domain_score !== null) {
      return row;
    }
    return enhanceResult(row);
  });
  const rankable = enhancedRows
    .filter(row => row && row.availability_status !== "invalid_input" && Number.isFinite(Number(row.domain_score)))
    .sort((a, b) => Number(b.domain_score || 0) - Number(a.domain_score || 0) || Number(a.name_length || 999) - Number(b.name_length || 999));
  const total = rankable.length;
  rankable.forEach((row, index) => {
    const rank = index + 1;
    const percentile = total ? (rank / total) * 100 : 0;
    row.batch_rank = rank;
    row.batch_percentile = total ? percentile.toFixed(1) : "";
    row.batch_label = batchRankLabel(percentile, rank, total);
  });
  return enhancedRows;
}

function batchRankLabel(percentile, rank, total) {
  if (!total) return "";
  if (rank === 1) return "Best in batch";
  if (percentile <= 1) return "Top 1%";
  if (percentile <= 5) return "Top 5%";
  if (percentile <= 10) return "Top 10%";
  if (percentile <= 25) return "Top 25%";
  return "";
}

function refreshResultsScoring() {
  results = applyBatchMetrics(results);
}

function rescoreResults() {
  refreshResultsScoring();
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
      registrar_url: row.domain ? registrarUrl(row.domain) : "",
      registrar_name: selectedRegistrarLabel(),
      availability_status: "invalid_input",
      available: null,
      check_source: "normalizer",
      checked_at_utc: checkedAt,
      notes: row.error,
      error: row.error,
      rdap_url: ""
    });
  }

  if (options.scoreOnly) {
    return enhanceResult({
      input: row.input,
      normalized_domain: row.domain,
      namecheap_url: namecheapUrl(row.domain),
      registrar_url: registrarUrl(row.domain),
      registrar_name: selectedRegistrarLabel(),
      availability_status: "not_checked_score_only",
      available: null,
      check_source: "score-only",
      checked_at_utc: checkedAt,
      rdap_url: "",
      notes: "Score-only mode skipped network availability checks. Use price-check links to confirm availability.",
      error: ""
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
    registrar_url: registrarUrl(row.domain),
    registrar_name: selectedRegistrarLabel(),
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


function isMissingExtensionRow(row) {
  return Boolean(row && (row.error === "not a domain" || row.error === "not a registrable domain"));
}

function analyzeInputLines() {
  const rawLines = el.inputBox.value
    .split(/\r?\n/)
    .map((line, index) => ({ raw: line, text: line.trim(), lineNumber: index + 1 }))
    .filter(item => item.text);

  const rows = rawLines.map(item => ({ ...normalizeDomain(item.text), raw: item.raw, lineNumber: item.lineNumber }));
  const validRows = rows.filter(row => !row.error);
  const missingExtensionRows = rows.filter(isMissingExtensionRow);
  const invalidRows = rows.filter(row => row.error && !isMissingExtensionRow(row));
  const seen = new Set();
  const duplicateRows = [];
  const uniqueValidRows = [];

  for (const row of validRows) {
    const key = row.domain || row.input;
    if (seen.has(key)) {
      duplicateRows.push(row);
    } else {
      seen.add(key);
      uniqueValidRows.push(row);
    }
  }

  return {
    rawCount: rawLines.length,
    rows,
    validRows,
    uniqueValidRows,
    duplicateRows,
    missingExtensionRows,
    invalidRows,
    issueRows: [...missingExtensionRows, ...invalidRows]
  };
}

function renderInvalidReviewList(analysis = analyzeInputLines()) {
  if (!el.invalidReviewList) return;
  const issues = analysis.issueRows;
  if (!invalidPreviewOpen || !issues.length) {
    el.invalidReviewList.classList.add("is-hidden");
    el.invalidReviewList.innerHTML = "";
    return;
  }
  const limit = 25;
  const rowsHtml = issues.slice(0, limit).map(row => {
    const help = isMissingExtensionRow(row)
      ? "Missing extension. Add something like .com, .io, .app, or .co."
      : `Invalid: ${row.error || "not recognized"}.`;
    return `<li><strong>Line ${escapeHtml(row.lineNumber)}</strong><span>${escapeHtml(row.input || row.raw || "")}</span><em>${escapeHtml(help)}</em></li>`;
  }).join("");
  const more = issues.length > limit ? `<p class="muted">Showing first ${limit.toLocaleString()} of ${issues.length.toLocaleString()} lines that need review.</p>` : "";
  el.invalidReviewList.innerHTML = `<ul>${rowsHtml}</ul>${more}`;
  el.invalidReviewList.classList.remove("is-hidden");
}

function updateInputPreview() {
  if (!el.inputPreviewPanel) return analyzeInputLines();
  const analysis = analyzeInputLines();
  const validCount = analysis.uniqueValidRows.length;
  const duplicateCount = analysis.duplicateRows.length;
  const invalidCount = analysis.invalidRows.length;
  const missingCount = analysis.missingExtensionRows.length;
  const issueCount = invalidCount + missingCount;
  const hasInput = analysis.rawCount > 0;

  el.inputPreviewPanel.classList.toggle("is-empty", !hasInput);
  el.inputPreviewPanel.classList.toggle("has-issues", issueCount > 0 || duplicateCount > 0);
  el.inputPreviewPanel.classList.toggle("is-ready", validCount > 0 && issueCount === 0 && duplicateCount === 0);
  if (el.previewValidCount) el.previewValidCount.textContent = validCount.toLocaleString();
  if (el.previewDuplicateCount) el.previewDuplicateCount.textContent = duplicateCount.toLocaleString();
  if (el.previewInvalidCount) el.previewInvalidCount.textContent = invalidCount.toLocaleString();
  if (el.previewMissingCount) el.previewMissingCount.textContent = missingCount.toLocaleString();

  if (!hasInput) {
    if (el.inputPreviewHeadline) el.inputPreviewHeadline.textContent = "Input preview appears here.";
    if (el.inputPreviewDetails) el.inputPreviewDetails.textContent = "Paste names above to see valid domains, duplicates, invalid lines, and missing extensions before you run a long check.";
  } else if (!validCount) {
    if (el.inputPreviewHeadline) el.inputPreviewHeadline.textContent = "No valid domains found yet.";
    if (el.inputPreviewDetails) el.inputPreviewDetails.textContent = "Add an extension such as .com, .io, or .app. URLs are okay, and spaces before an extension are cleaned automatically.";
  } else if (issueCount || duplicateCount) {
    const parts = [];
    if (duplicateCount) parts.push(`${duplicateCount.toLocaleString()} duplicate${duplicateCount === 1 ? "" : "s"}`);
    if (invalidCount) parts.push(`${invalidCount.toLocaleString()} invalid line${invalidCount === 1 ? "" : "s"}`);
    if (missingCount) parts.push(`${missingCount.toLocaleString()} missing extension${missingCount === 1 ? "" : "s"}`);
    if (el.inputPreviewHeadline) el.inputPreviewHeadline.textContent = `We found ${validCount.toLocaleString()} valid domain${validCount === 1 ? "" : "s"}.`;
    if (el.inputPreviewDetails) el.inputPreviewDetails.textContent = `${parts.join(" · ")}. Use “Check valid domains” to run only the cleaned unique list.`;
  } else {
    if (el.inputPreviewHeadline) el.inputPreviewHeadline.textContent = `Ready to check ${validCount.toLocaleString()} domain${validCount === 1 ? "" : "s"}.`;
    if (el.inputPreviewDetails) el.inputPreviewDetails.textContent = "No duplicates or invalid lines detected. Start with Top Picks after the check finishes.";
  }

  const disabled = validCount === 0 || isChecking;
  if (el.previewCheckBtn) el.previewCheckBtn.disabled = disabled;
  if (el.previewCopyCleanBtn) el.previewCopyCleanBtn.disabled = validCount === 0;
  if (el.previewReviewInvalidBtn) {
    el.previewReviewInvalidBtn.disabled = issueCount === 0;
    el.previewReviewInvalidBtn.textContent = invalidPreviewOpen ? "Hide invalid lines" : "Review invalid lines";
  }
  renderInvalidReviewList(analysis);
  return analysis;
}

function replaceInputWithCleanValidDomains(analysis = analyzeInputLines()) {
  const domains = analysis.uniqueValidRows.map(row => row.domain).filter(Boolean);
  el.inputBox.value = domains.join("\n");
  invalidPreviewOpen = false;
  updateInputCount();
  return domains;
}

function checkCleanValidDomains() {
  const analysis = analyzeInputLines();
  if (!analysis.uniqueValidRows.length) {
    setStatus("No valid domains to check yet. Add names like examplebrand.com first.");
    el.inputBox?.focus();
    return;
  }
  const domains = replaceInputWithCleanValidDomains(analysis);
  trackEvent("clean_input_check_clicked", {
    valid_count: domains.length,
    duplicate_count: analysis.duplicateRows.length,
    invalid_count: analysis.invalidRows.length,
    missing_extension_count: analysis.missingExtensionRows.length
  });
  setStatus(`Cleaned input to ${domains.length.toLocaleString()} unique valid domain${domains.length === 1 ? "" : "s"}. Starting check...`);
  runChecks();
}

function toggleInvalidReview() {
  invalidPreviewOpen = !invalidPreviewOpen;
  updateInputPreview();
  if (invalidPreviewOpen && el.invalidReviewList) el.invalidReviewList.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function copyCleanValidDomains() {
  const analysis = analyzeInputLines();
  const domains = analysis.uniqueValidRows.map(row => row.domain).filter(Boolean);
  if (!domains.length) {
    setStatus("No valid domains to copy yet.");
    return;
  }
  copyText(domains.join("\n"), "clean valid domain list");
  trackEvent("clean_input_copied", { valid_count: domains.length });
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
    setStatus("Paste or upload at least one domain first. Example: examplebrand.com");
    updateInputCoach(0, "Paste one domain to begin.", "Example: examplebrand.com. Then click Check domains.");
    el.inputBox?.focus();
    return;
  }
  const validCount = rows.filter(row => !row.error).length;
  if (!validCount) {
    setStatus("I could not recognize a valid domain. Try a format like examplebrand.com or https://example.com.");
    updateInputCoach(rows.length, "No valid domains recognized yet.", "Use one domain per line, like examplebrand.com. URLs are okay too.");
    el.inputBox?.focus();
    return;
  }

  topPicksExpanded = false;
  guidedPickCount = 3;
  results = new Array(rows.length);
  resetRenderLimit();
  renderResults();
  setChecking(true);
  const options = {
    workers: clampNumber(el.workersInput.value, 1, 10, 2),
    delayMs: clampNumber(el.delayInput.value, 0, 10000, 250),
    timeoutMs: clampNumber(el.timeoutInput.value, 1000, 60000, 12000),
    useRdap: el.useRdapInput.checked,
    useDns: el.useDnsInput.checked,
    scoreOnly: el.scoreOnlyInput ? el.scoreOnlyInput.checked : false
  };
  trackEvent("check_started", { row_count: rows.length, large_list: rows.length >= 1000, huge_list: rows.length >= 10000, score_only: options.scoreOnly });

  let done = 0;
  el.progress.max = rows.length;
  el.progress.value = 0;
  if (rows.length >= 10000 && !options.scoreOnly) {
    setStatus(`Checking ${rows.length} domains with network availability checks. Large batches can take a long time; score-only mode is much faster for first-pass ranking.`);
  } else {
    setStatus(options.scoreOnly ? `Scoring ${rows.length} domains without network checks...` : `Checking ${rows.length} domains...`);
  }

  try {
    await mapLimit(rows, options.workers, async row => {
      if (options.delayMs > 0) await sleep(options.delayMs);
      return checkDomain(row, options);
    }, (result, index) => {
      results[index] = result;
      done += 1;
      const progressEvery = rows.length >= 10000 ? 50 : rows.length >= 3000 ? 15 : 1;
      if (done % progressEvery === 0 || done === rows.length) {
        el.progress.value = done;
        setStatus(`${options.scoreOnly ? "Scored" : "Checked"} ${done}/${rows.length}: ${result.normalized_domain || result.input}`);
      }
      scheduleRenderResults();
    });
  } catch (err) {
    setStatus(`Stopped with error: ${err.message}`);
  } finally {
    refreshResultsScoring();
    scheduleRenderResults({ force: true });
    updateSummary();
    setChecking(false);
    const endText = stopRequested ? `Stopped. Checked ${results.length}/${rows.length} rows.` : `Done. Checked ${results.length} rows.`;
    trackEvent(stopRequested ? "check_stopped" : "check_completed", { row_count: rows.length, result_count: results.filter(Boolean).length, top_pick_count: topPickRows().length });
    setStatus(`${endText} Next: start with the #1 pick, then show another pick only if needed.`);
    if (!stopRequested) recordRecentRun();
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


function resetRenderLimit() {
  renderRowLimit = INITIAL_RENDER_LIMIT;
}

function adaptiveRenderIntervalMs() {
  const targetSize = results.length || 0;
  if (!isChecking) return CHECK_RENDER_INTERVAL_MS;
  if (targetSize >= 15000) return 3500;
  if (targetSize >= 10000) return 2500;
  if (targetSize >= 5000) return 1600;
  if (targetSize >= 2000) return 1100;
  return CHECK_RENDER_INTERVAL_MS;
}

function scheduleRenderResults(options = {}) {
  const force = Boolean(options.force);
  if (force) {
    if (pendingRenderTimer) {
      clearTimeout(pendingRenderTimer);
      pendingRenderTimer = null;
    }
    renderResults();
    renderArchiveTools();
    return;
  }

  const now = Date.now();
  const interval = adaptiveRenderIntervalMs();
  const elapsed = now - lastRenderAt;
  if (elapsed >= interval) {
    if (pendingRenderTimer) {
      clearTimeout(pendingRenderTimer);
      pendingRenderTimer = null;
    }
    renderResults();
    return;
  }

  if (!pendingRenderTimer) {
    pendingRenderTimer = setTimeout(() => {
      pendingRenderTimer = null;
      renderResults();
    }, Math.max(80, interval - elapsed));
  }
}

function isWorthCheckingRow(row) {
  return row && row.available !== false && row.availability_status !== "invalid_input" && Number(row.domain_score || 0) >= 70;
}

function isSimpleStrongEnoughRow(row) {
  return row && row.availability_status !== "invalid_input" && Number(row.domain_score || 0) >= 70;
}

function weakPicksHiddenCount() {
  return results.filter(row => row && !isSimpleStrongEnoughRow(row)).length;
}

function updateHideWeakPicksButton() {
  const count = weakPicksHiddenCount();
  const disabled = !results.filter(Boolean).length || count === 0;
  const title = count ? `${count.toLocaleString()} lower-score result${count === 1 ? "" : "s"} can be hidden.` : "No weak names to hide.";
  const buttons = [el.hideWeakPicksBtn, el.hideWeakNamesBtn].filter(Boolean);
  buttons.forEach(button => {
    button.textContent = hideWeakPicks ? "Show weak names" : "Hide weak names";
    button.setAttribute("aria-label", hideWeakPicks ? "Show weak names again" : "Hide lower-score names without deleting anything");
    button.setAttribute("aria-pressed", hideWeakPicks ? "true" : "false");
    button.disabled = disabled;
    button.title = title;
  });
}

function toggleHideWeakPicks() {
  hideWeakPicks = !hideWeakPicks;
  resetRenderLimit();
  renderResults();
  saveState();
  const count = weakPicksHiddenCount();
  setStatus(hideWeakPicks ? `Hiding ${count.toLocaleString()} weak pick${count === 1 ? "" : "s"}.` : "Showing all picks again.");
  trackEvent("hide_weak_picks_toggled", { enabled: hideWeakPicks, weak_count: count });
}

function isStrongNameRow(row) {
  return row && row.available !== false && row.availability_status !== "invalid_input" && Number(row.domain_score || 0) >= 80;
}

function needsReviewRow(row) {
  if (!row || row.availability_status === "invalid_input") return false;
  if (row.available === false) return false;
  if (Number(row.domain_score || 0) < 55) return false;
  const issueTags = topPickIssueTags(row).filter(tag => tag.kind !== "good");
  return Boolean(
    issueTags.length ||
    row.available === null ||
    row.availability_status === "not_checked_score_only" ||
    effectiveSuffix(row.normalized_domain || "") !== "com"
  );
}

const RESULT_BADGE_FILTER_LABELS = {
  all: "All badges",
  com: ".com",
  short: "Short",
  saved: "Saved",
  review: "Needs review",
  strong: "Strong",
  taken: "Taken"
};

function normalizeResultBadgeFilter(kind) {
  const value = String(kind || "all").toLowerCase();
  return Object.prototype.hasOwnProperty.call(RESULT_BADGE_FILTER_LABELS, value) ? value : "all";
}

function resultBadgeFilterLabel(kind = resultBadgeFilter) {
  return RESULT_BADGE_FILTER_LABELS[normalizeResultBadgeFilter(kind)] || "All badges";
}

function savedOnlyFilterActive() {
  return resultQuickPreset === "saved" || resultBadgeFilter === "saved" || Boolean(el.filterStatus && el.filterStatus.value === "favorites");
}

function updateResultBadgeFilterControls() {
  document.querySelectorAll("button[data-result-badge-filter]").forEach(button => {
    const kind = normalizeResultBadgeFilter(button.getAttribute("data-result-badge-filter"));
    const active = kind !== "all" && kind === resultBadgeFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function matchesResultBadgeFilter(row, kind = resultBadgeFilter) {
  kind = normalizeResultBadgeFilter(kind);
  if (kind === "all") return true;
  const domain = row?.normalized_domain || "";
  const suffix = row?.effective_tld || effectiveSuffix(domain);
  const nameLength = Number(row?.name_length || secondLevelName(domain).length || 0);
  if (kind === "com") return suffix === "com";
  if (kind === "short") return nameLength > 0 && nameLength <= 12;
  if (kind === "saved") return favorites.has(domain) || savedShortlist.has(normalizeSavedDomain(domain));
  if (kind === "review") return needsReviewRow(row);
  if (kind === "strong") return isStrongNameRow(row);
  if (kind === "taken") return row?.available === false;
  return true;
}

function applyResultBadgeFilter(kind) {
  kind = normalizeResultBadgeFilter(kind);
  const wasActive = kind !== "all" && kind === resultBadgeFilter;
  resultBadgeFilter = wasActive ? "all" : kind;
  if (resultBadgeFilter === "taken") showTakenResults = true;
  resetRenderLimit();
  document.body.classList.add("show-all-results");
  renderResults();
  saveState();
  setStatus(resultBadgeFilter === "all" ? "Badge filter cleared." : `Showing results tagged ${resultBadgeFilterLabel(resultBadgeFilter)}. Click the badge again to clear it.`);
  trackEvent("all_results_badge_filter_clicked", { badge_filter: resultBadgeFilter, cleared: wasActive });
}

function matchesResultQuickPreset(row, preset = resultQuickPreset) {
  const domain = row?.normalized_domain || "";
  if (preset === "worth") return isWorthCheckingRow(row);
  if (preset === "strong") return isStrongNameRow(row);
  if (preset === "com") return effectiveSuffix(domain) === "com";
  if (preset === "saved") return favorites.has(domain) || savedShortlist.has(domain);
  if (preset === "checked_saved") return savedShortlist.has(normalizeSavedDomain(domain)) && isSavedChecked(domain);
  if (preset === "review") return needsReviewRow(row);
  return true;
}

function resultPresetLabel(preset = resultQuickPreset) {
  return ({
    all: "All results",
    worth: "Worth checking",
    strong: "Strong names",
    com: ".com only",
    saved: "Saved",
    checked_saved: "Checked saved",
    review: "Needs review"
  })[preset] || "All results";
}

function updateResultPresetButtons() {
  document.querySelectorAll("[data-results-preset]").forEach(button => {
    const active = button.getAttribute("data-results-preset") === resultQuickPreset;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (el.allResultsHelper) {
    const helpers = {
      all: "Showing every result that matches your advanced filters. Nothing is hidden or deleted.",
      worth: "Showing names with solid scores that are still worth checking or not yet live-checked.",
      strong: "Showing higher-scoring names first. These are usually the best candidates outside the Top Picks cards.",
      com: "Showing only .com domains. This is useful when you want the strongest mainstream extension.",
      saved: "Showing domains you saved. Saved names stay in this browser session.",
      checked_saved: "Showing saved finalists you already marked checked. This is an advanced review filter.",
      review: "Showing domains with useful scores but possible concerns, non-.com extensions, or uncertain availability."
    };
    const extras = [];
    if (resultBadgeFilter !== "all") extras.push(`Badge filter: ${resultBadgeFilterLabel(resultBadgeFilter)}.`);
    if (hideWeakPicks) extras.push("Weak picks are hidden.");
    el.allResultsHelper.textContent = `${helpers[resultQuickPreset] || helpers.all}${extras.length ? ` ${extras.join(" ")}` : ""}`;
  }
  updateResultsCleanedNotice();
}

function updateAllResultsSummary() {
  const rows = results.filter(Boolean);
  if (el.allResultsTotal) el.allResultsTotal.textContent = rows.length.toLocaleString();
  if (el.allResultsWorth) el.allResultsWorth.textContent = rows.filter(isWorthCheckingRow).length.toLocaleString();
  if (el.allResultsStrong) el.allResultsStrong.textContent = rows.filter(isStrongNameRow).length.toLocaleString();
  if (el.allResultsCom) el.allResultsCom.textContent = rows.filter(row => effectiveSuffix(row.normalized_domain || "") === "com").length.toLocaleString();
  if (el.allResultsSaved) el.allResultsSaved.textContent = rows.filter(row => favorites.has(row.normalized_domain) || savedShortlist.has(row.normalized_domain)).length.toLocaleString();
  updateResultPresetButtons();
  updateAllResultsSortPills();
  updateResultBadgeFilterControls();
  updateTakenToggle();
}

function updateResultsFiltersPanelState() {
  const hasAnyResults = results.filter(Boolean).length > 0;
  if (!hasAnyResults) resultsFiltersOpen = false;
  document.body.classList.toggle("results-filters-open", Boolean(resultsFiltersOpen && hasAnyResults));
  if (el.editResultsFiltersBtn) {
    el.editResultsFiltersBtn.disabled = !hasAnyResults;
    el.editResultsFiltersBtn.textContent = resultsFiltersOpen ? "Hide search/filter" : "Search / filter";
    el.editResultsFiltersBtn.setAttribute("aria-expanded", resultsFiltersOpen ? "true" : "false");
  }
}

function toggleResultsFiltersPanel() {
  if (!results.filter(Boolean).length) return;
  resultsFiltersOpen = !resultsFiltersOpen;
  updateResultsFiltersPanelState();
  setStatus(resultsFiltersOpen ? "Search and filters shown. They only change what is visible." : "Search and filters hidden.");
  trackEvent("all_results_filters_toggled", { open: resultsFiltersOpen });
}

function resetAllResultFiltersFromEmptyState() {
  clearAllResultFilters({ keepFiltersOpen: false, statusMessage: "Showing all results again.", eventName: "all_results_empty_show_all_clicked" });
}

function clearAllResultFilters(options = {}) {
  const { keepFiltersOpen = false, statusMessage = "All result filters cleared.", eventName = "all_results_filters_cleared" } = options;
  resultQuickPreset = "all";
  resultBadgeFilter = "all";
  hideWeakPicks = false;
  showTakenResults = false;
  if (el.filterStatus) el.filterStatus.value = "all";
  if (el.filterSearch) el.filterSearch.value = "";
  if (el.filterTld) el.filterTld.value = "";
  if (el.filterMaxLen) el.filterMaxLen.value = "";
  if (el.filterNoHyphen) el.filterNoHyphen.checked = false;
  if (el.filterNoNumbers) el.filterNoNumbers.checked = false;
  resetRenderLimit();
  resultsFiltersOpen = Boolean(keepFiltersOpen);
  renderResults();
  setStatus(statusMessage);
  saveState();
  trackEvent(eventName);
}

function hasActiveAllResultFilters() {
  return resultQuickPreset !== "all" || resultBadgeFilter !== "all" || hideWeakPicks ||
    (el.filterStatus && el.filterStatus.value !== "all") ||
    Boolean(String(el.filterSearch?.value || "").trim()) ||
    Boolean(String(el.filterTld?.value || "").trim()) ||
    Boolean(String(el.filterMaxLen?.value || "").trim()) ||
    Boolean(el.filterNoHyphen?.checked) ||
    Boolean(el.filterNoNumbers?.checked);
}

function focusAllResultsFilterSearch() {
  if (!results.filter(Boolean).length || !el.filterSearch) return;
  document.body.classList.add("show-all-results");
  resultsFiltersOpen = true;
  updateResultsFiltersPanelState();
  document.querySelector(".results-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => el.filterSearch?.focus(), 120);
  setStatus("Search result filters. Press Esc to clear filters.");
  trackEvent("all_results_filter_shortcut_focus");
}

function handleResultsKeyboardShortcuts(event) {
  const target = event.target;
  const tag = String(target?.tagName || "").toLowerCase();
  const isTyping = target?.isContentEditable || ["input", "textarea", "select"].includes(tag);
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping) {
    event.preventDefault();
    focusAllResultsFilterSearch();
    return;
  }
  if (event.key === "Escape" && results.filter(Boolean).length && hasActiveAllResultFilters()) {
    if (isTyping && !target.closest?.(".filters-panel")) return;
    event.preventDefault();
    clearAllResultFilters({ keepFiltersOpen: Boolean(resultsFiltersOpen), statusMessage: "All result filters cleared." });
  }
}


function compareRows() {
  return [...compareSet]
    .map(domain => findResultByDomain(domain))
    .filter(Boolean);
}

function compareButtonHtml(domain) {
  const selected = compareSet.has(domain);
  const label = selected ? "In comparison" : "Compare";
  const title = selected ? "Remove from comparison" : `Add to comparison (up to ${COMPARE_LIMIT})`;
  return `<button type="button" class="ghost compare-button ${selected ? "is-selected" : ""}" data-compare-domain="${escapeAttr(domain)}" title="${escapeAttr(title)}">${escapeHtml(label)}</button>`;
}

function toggleCompare(domain) {
  domain = String(domain || "").trim().toLowerCase();
  if (!domain) return;
  if (compareSet.has(domain)) {
    compareSet.delete(domain);
    setStatus(`${domain} removed from comparison.`);
    trackEvent("compare_domain_removed");
  } else {
    if (compareSet.size >= COMPARE_LIMIT) {
      setStatus(`Comparison holds up to ${COMPARE_LIMIT} domains. Remove one before adding another.`);
      return;
    }
    compareSet.add(domain);
    setStatus(`${domain} added to comparison.`);
    trackEvent("compare_domain_added", { compare_count: compareSet.size });
  }
  renderResults();
}

function clearComparison() {
  compareSet.clear();
  renderResults();
  setStatus("Comparison cleared.");
  trackEvent("compare_cleared");
}

function copyComparison() {
  const rows = compareRows();
  if (!rows.length) {
    setStatus("Add domains to comparison first.");
    return;
  }
  const text = rows.map(row => [
    row.normalized_domain || "",
    `Score: ${row.domain_score ?? ""} ${row.score_label || ""}`.trim(),
    `Status: ${availabilityText(row)}`,
    `Why: ${publicScoreExplanation(row)}`,
    `Concern: ${topPickConcernTags(row).map(tag => tag.label).join(", ")}`
  ].join(" | ")).join("\n");
  copyText(text, "comparison");
  trackEvent("compare_copied", { compare_count: rows.length });
}

function openComparisonPriceChecks() {
  const rows = compareRows();
  if (!rows.length) {
    setStatus("Add domains to comparison before checking prices.");
    return;
  }
  openLinks(rows, "comparison", { forceConfirm: rows.length > 1 });
  trackEvent("compare_price_clicked", { compare_count: rows.length });
}

function renderCompareTray() {
  if (!el.compareTray || !el.compareItems || !el.compareCount) return;
  const rows = compareRows();
  const validDomains = new Set(rows.map(row => row.normalized_domain).filter(Boolean));
  for (const domain of [...compareSet]) {
    if (!validDomains.has(domain)) compareSet.delete(domain);
  }
  if (!rows.length) {
    el.compareTray.classList.add("is-hidden");
    el.compareCount.textContent = "0 selected";
    el.compareItems.innerHTML = "";
    if (el.compareOpenBtn) el.compareOpenBtn.disabled = true;
    if (el.compareCopyBtn) el.compareCopyBtn.disabled = true;
    return;
  }
  el.compareTray.classList.remove("is-hidden");
  el.compareCount.textContent = `${rows.length} selected`;
  if (el.compareOpenBtn) el.compareOpenBtn.disabled = false;
  if (el.compareCopyBtn) el.compareCopyBtn.disabled = false;
  if (el.compareHint) el.compareHint.textContent = rows.length >= COMPARE_LIMIT
    ? `Comparison is full. Remove one to add another.`
    : `Add up to ${COMPARE_LIMIT} names, then compare score, extension, concerns, and price-check links.`;
  el.compareItems.innerHTML = rows.map(row => {
    const domain = row.normalized_domain || "";
    const lookupUrl = resultRegistrarUrl(row);
    const strengths = topPickStrengthTags(row).slice(0, 3).map(tag => cardTagHtml(tag.label, tag.kind)).join("");
    const concerns = topPickConcernTags(row).slice(0, 3).map(tag => cardTagHtml(tag.label, tag.kind)).join("");
    return `<article class="compare-card score-${scoreClass(row.domain_score)}" data-domain="${escapeAttr(domain)}">
      <div class="compare-card-head">
        <strong>${escapeHtml(domain)}</strong>
        <button type="button" class="ghost small-button" data-compare-domain="${escapeAttr(domain)}">Remove</button>
      </div>
      <div class="compare-metrics">
        <span><b>${escapeHtml(row.domain_score ?? "")}</b> score</span>
        <span>${escapeHtml(row.score_label || "")}</span>
        <span>.${escapeHtml(row.effective_tld || effectiveSuffix(domain))}</span>
        <span>${escapeHtml(availabilityText(row))}</span>
      </div>
      <p>${escapeHtml(publicScoreExplanation(row))}</p>
      <div class="compare-tag-row"><span>Strengths</span><div class="top-pick-tags">${strengths}</div></div>
      <div class="compare-tag-row"><span>Concerns</span><div class="top-pick-tags">${concerns}</div></div>
      <div class="compare-card-actions">
        ${lookupUrl ? `<a class="top-pick-cta secondary-registrar-cta" href="${escapeAttr(lookupUrl)}" target="_blank" rel="${escapeAttr(registrarLinkRel(selectedRegistrarKey(), domain))}">Check registrar</a>` : ""}
        <button type="button" class="ghost" data-detail-domain="${escapeAttr(domain)}">Why?</button>
        <button type="button" class="ghost" data-copy-domain="${escapeAttr(domain)}">Copy</button>
      </div>
    </article>`;
  }).join("");
}

function normalizeSavedDomain(domain) {
  const normalized = normalizeDomain(domain);
  return normalized.error ? String(domain || "").trim().toLowerCase() : normalized.domain;
}

function loadSavedShortlistData() {
  try {
    const raw = localStorage.getItem(SAVED_SHORTLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    savedShortlist = new Set(Array.isArray(parsed) ? parsed.map(normalizeSavedDomain).filter(Boolean) : []);
  } catch {
    savedShortlist = new Set();
  }
  loadSavedNotesData();
}

function loadSavedNotesData() {
  try {
    const raw = localStorage.getItem(SAVED_NOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    savedNotes = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    savedNotes = {};
  }
  loadSavedCheckedData();
}

function loadSavedCheckedData() {
  try {
    const raw = localStorage.getItem(SAVED_CHECKED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    savedChecked = new Set(Array.isArray(parsed) ? parsed.map(normalizeSavedDomain).filter(Boolean) : []);
  } catch {
    savedChecked = new Set();
  }
  loadSavedWinnerData();
}

function saveSavedCheckedData() {
  try { localStorage.setItem(SAVED_CHECKED_KEY, JSON.stringify([...savedChecked].sort())); } catch {}
}

function loadSavedWinnerData() {
  try {
    const raw = localStorage.getItem(SAVED_WINNER_KEY);
    savedWinner = normalizeSavedDomain(raw || "");
  } catch {
    savedWinner = "";
  }
}

function saveSavedWinnerData() {
  try { localStorage.setItem(SAVED_WINNER_KEY, savedWinner || ""); } catch {}
}

function isSavedWinner(domain) {
  const key = normalizeSavedDomain(domain);
  return Boolean(key && savedWinner && key === savedWinner);
}

function isSavedChecked(domain) {
  return savedChecked.has(normalizeSavedDomain(domain));
}

function savedCheckedCount() {
  return [...savedShortlist].filter(domain => isSavedChecked(domain)).length;
}

function winnerCheckedStatusText() {
  const row = savedWinnerRow();
  const domain = row?.normalized_domain || "";
  if (!domain) return "";
  return isSavedChecked(domain) ? `Winner ready: ${domain}.` : `Winner not checked yet: ${domain}.`;
}

function savedUncheckedRows(rows = savedShortlistRows()) {
  return rows.filter(row => row && row.normalized_domain && !isSavedChecked(row.normalized_domain));
}

function toggleSavedUncheckedView() {
  if (!savedShortlist.size) {
    setStatus("Save a few finalists first, then filter unchecked names.");
    return;
  }
  savedShowUncheckedOnly = !savedShowUncheckedOnly;
  renderSavedShortlist();
  const unchecked = savedUncheckedRows().length;
  setStatus(savedShowUncheckedOnly ? `Showing ${unchecked} unchecked saved finalist${unchecked === 1 ? "" : "s"}.` : "Showing all saved finalists.");
  trackEvent("saved_unchecked_filter_toggled", { enabled: savedShowUncheckedOnly, unchecked_count: unchecked });
}

function toggleSavedChecked(domain) {
  const key = normalizeSavedDomain(domain);
  if (!key) return;
  if (savedChecked.has(key)) {
    savedChecked.delete(key);
    setStatus(`${key} marked unchecked.`);
  } else {
    savedChecked.add(key);
    setStatus(`${key} marked checked.`);
  }
  saveSavedCheckedData();
  saveState();
  renderSavedShortlist();
  trackEvent("saved_checked_toggled", { checked: savedChecked.has(key) });
}

function pickSavedWinner(domain) {
  const key = normalizeSavedDomain(domain);
  if (!key || !savedShortlist.has(key)) return;
  savedWinner = key;
  winnerDoneShown = false;
  saveSavedWinnerData();
  saveState();
  renderSavedShortlist();
  setStatus(`${key} picked as winner.`);
  trackEvent("saved_winner_picked");
}

function clearSavedWinnerIfNeeded(domain) {
  if (isSavedWinner(domain)) {
    savedWinner = "";
    winnerDoneShown = false;
    saveSavedWinnerData();
  }
}

function savedWinnerRow() {
  const key = normalizeSavedDomain(savedWinner);
  if (!key || !savedShortlist.has(key)) return null;
  return findResultByDomain(key) || fallbackSavedRow(key);
}

function winnerFallbackRow() {
  return savedWinnerRow() || savedDecisionRows()[0] || topPickRows()[0] || null;
}

function winnerNoteLine(row) {
  if (!row || !row.normalized_domain) return "";
  const note = savedNoteFor(row.normalized_domain);
  return note ? `Winner note: ${note}` : "";
}

function copyWinnerDomain() {
  const row = winnerFallbackRow();
  const domain = row?.normalized_domain || "";
  if (!domain) {
    setStatus("No winner to copy yet. Save a finalist or run Top Picks first.");
    return;
  }
  copyText(domain, savedWinner && isSavedWinner(domain) ? "winner" : "best choice");
  trackEvent("winner_domain_copied", { has_picked_winner: Boolean(savedWinner), domain });
}

function winnerLinkRow() {
  return savedWinnerRow() || savedDecisionRows()[0] || topPickRows()[0] || null;
}

function openWinnerLink() {
  const row = winnerLinkRow();
  const domain = row?.normalized_domain || "";
  const link = resultRegistrarUrl(row);
  if (!domain || !link) {
    setStatus("No winner link to open yet. Pick or save a finalist first.");
    return;
  }
  openLinks([row], savedWinner && isSavedWinner(domain) ? "winner" : "best choice", { forceConfirm: false });
  setStatus(`Opening ${domain} at ${selectedRegistrarLabel()}.`);
  trackEvent("winner_link_opened", { has_picked_winner: Boolean(savedWinner), domain });
}

function copyWinnerWithLink() {
  const row = winnerLinkRow();
  const domain = row?.normalized_domain || "";
  const link = resultRegistrarUrl(row);
  if (!domain || !link) {
    setStatus("No winner link to copy yet. Pick or save a finalist first.");
    return;
  }
  copyText(`${domain} — ${link}`, savedWinner && isSavedWinner(domain) ? "winner with link" : "best choice with link");
  trackEvent("winner_with_link_copied", { has_picked_winner: Boolean(savedWinner), domain });
}

function winnerReportText() {
  const row = winnerLinkRow();
  const domain = row?.normalized_domain || "";
  if (!domain) return "No winner selected yet.";
  const link = resultRegistrarUrl(row);
  const note = savedNoteFor(domain);
  const checked = isSavedChecked(domain);
  const label = savedWinner && isSavedWinner(domain) ? "Winner" : "Best choice";
  const lines = [
    `${PUBLIC_SITE_NAME} winner report`,
    "",
    `${label}: ${domain}`
  ];
  if (note) lines.push(`Winner note: ${note}`);
  lines.push(
    `Checked: ${checked ? "yes" : "no"}`,
    link ? `Registrar link: ${link}` : "Registrar link: not available yet",
    "",
    `Next step: confirm final price, renewal cost, spelling, and trademark risk at ${selectedRegistrarLabel()} or another registrar before buying.`
  );
  return lines.join("\n");
}

function copyWinnerReport() {
  const row = winnerLinkRow();
  const domain = row?.normalized_domain || "";
  if (!domain) {
    setStatus("No winner report to copy yet. Pick or save a finalist first.");
    return;
  }
  copyText(winnerReportText(), savedWinner && isSavedWinner(domain) ? "winner report" : "best choice report");
  trackEvent("winner_report_copied", { has_picked_winner: Boolean(savedWinner), domain });
}

function isWinnerReady() {
  return Boolean(savedWinner && isSavedChecked(savedWinner));
}

async function finishWinnerDone() {
  const row = savedWinnerRow();
  const domain = row?.normalized_domain || savedWinner || "";
  if (!domain) {
    setStatus("Pick a winner before marking this done.");
    return;
  }
  if (!isSavedChecked(domain)) {
    setStatus("Check the winner first, then mark this done.");
    return;
  }
  winnerDoneShown = true;
  await copyText(winnerReportText(), "winner report");
  const target = el.finalReportPanel && !el.finalReportPanel.classList.contains("is-hidden")
    ? el.finalReportPanel
    : el.savedShortlistPanel;
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
  renderSavedShortlist();
  trackEvent("winner_done_clicked", { domain });
}

function startNewSearchAfterDone() {
  winnerDoneShown = false;
  startOverSimple();
  trackEvent("winner_new_search_clicked");
}

function archiveAutoLabel(cleaned = [], savedDomains = [], winner = "", createdAt = new Date().toISOString()) {
  const cleanWinner = normalizeSavedDomain(winner || "");
  const firstSaved = Array.isArray(savedDomains) ? normalizeSavedDomain(savedDomains[0] || "") : "";
  const firstTopPick = Array.isArray(cleaned) ? normalizeSavedDomain(cleaned[0]?.normalized_domain || "") : "";
  const date = String(createdAt || new Date().toISOString()).slice(0, 10);
  if (cleanWinner) return `Winner: ${cleanWinner} · ${date}`;
  if (firstSaved) return `Saved: ${firstSaved} · ${date}`;
  if (firstTopPick) return `Top pick: ${firstTopPick} · ${date}`;
  return `Domain session · ${date}`;
}

function sessionArchiveSnapshot() {
  const cleaned = results.filter(Boolean);
  const savedDomains = [...savedShortlist];
  const winner = savedWinner || "";
  const createdAt = new Date().toISOString();
  return {
    id: `archive-${Date.now()}`,
    label: archiveAutoLabel(cleaned, savedDomains, winner, createdAt),
    created_at: createdAt,
    input: el.inputBox ? el.inputBox.value : "",
    results: cleaned.length > 5000 ? [] : cleaned.slice(0, 5000),
    large_result_count_not_saved: cleaned.length > 5000 ? cleaned.length : 0,
    favorites: [...favorites],
    saved_shortlist: savedDomains,
    saved_notes: savedNotes,
    saved_checked: [...savedChecked],
    saved_winner: winner,
    pinned: false,
    archive_note: "",
    settings: currentSettings()
  };
}

function archiveCurrentSession(options = {}) {
  const silent = Boolean(options.silent);
  const snapshot = sessionArchiveSnapshot();
  const hasAnything = Boolean(snapshot.input || snapshot.results.length || snapshot.saved_shortlist.length || snapshot.favorites.length);
  if (!hasAnything) {
    if (!silent) setStatus("Nothing to archive yet. Paste a list or save finalists first.");
    return false;
  }
  let archives = [];
  try {
    const raw = localStorage.getItem(SESSION_ARCHIVES_KEY);
    archives = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(archives)) archives = [];
  } catch {
    archives = [];
  }
  archives.unshift(snapshot);
  if (saveSessionArchives(archives)) {
    const storedCount = loadSessionArchives().length;
    if (!silent) setStatus(`Archived this session. ${storedCount} archive${storedCount === 1 ? "" : "s"} stored in this browser.`);
    renderArchiveTools();
    trackEvent("session_archived", { archive_count: storedCount, saved_count: snapshot.saved_shortlist.length, result_count: snapshot.results.length, silent });
    return true;
  }
  return false;
}


function archiveCreatedTime(archive) {
  const time = Date.parse(archive?.created_at || "");
  return Number.isFinite(time) ? time : 0;
}

function sortSessionArchives(archives) {
  return (Array.isArray(archives) ? archives : [])
    .filter(archive => archive && archive.id)
    .sort((a, b) => {
      const pinnedDelta = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
      if (pinnedDelta) return pinnedDelta;
      return archiveCreatedTime(b) - archiveCreatedTime(a);
    });
}

function currentSessionHasArchiveableContent() {
  const snapshot = sessionArchiveSnapshot();
  return Boolean(snapshot.input || snapshot.results.length || snapshot.saved_shortlist.length || snapshot.favorites.length);
}


function archiveLimit() {
  try {
    const stored = Number(localStorage.getItem(SESSION_ARCHIVE_LIMIT_KEY));
    return SESSION_ARCHIVE_LIMIT_OPTIONS.includes(stored) ? stored : SESSION_ARCHIVE_DEFAULT_LIMIT;
  } catch {
    return SESSION_ARCHIVE_DEFAULT_LIMIT;
  }
}

function setArchiveLimit(value) {
  const nextLimit = SESSION_ARCHIVE_LIMIT_OPTIONS.includes(Number(value)) ? Number(value) : SESSION_ARCHIVE_DEFAULT_LIMIT;
  try { localStorage.setItem(SESSION_ARCHIVE_LIMIT_KEY, String(nextLimit)); } catch {}
  const archives = loadSessionArchives({ includeOverLimit: true });
  if (saveSessionArchives(archives)) {
    renderArchiveTools();
    setStatus(`Archive limit set to ${nextLimit}.`);
    trackEvent("session_archive_limit_changed", { limit: nextLimit });
  }
}

function loadSessionArchives(options = {}) {
  try {
    const raw = localStorage.getItem(SESSION_ARCHIVES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const limit = options.includeOverLimit ? 25 : archiveLimit();
    return Array.isArray(parsed) ? sortSessionArchives(parsed).slice(0, limit) : [];
  } catch {
    return [];
  }
}

function saveSessionArchives(archives) {
  try {
    localStorage.setItem(SESSION_ARCHIVES_KEY, JSON.stringify(sortSessionArchives(archives).slice(0, archiveLimit())));
    return true;
  } catch {
    setStatus("Could not update archives because browser storage is full.");
    return false;
  }
}

function normalizeArchiveSnapshot(value, fallbackLabel = "Imported archive") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const hasKnownField = ["input", "results", "saved_shortlist", "favorites", "saved_notes", "settings"].some(key => Object.prototype.hasOwnProperty.call(value, key));
  if (!hasKnownField) return null;
  const createdAt = typeof value.created_at === "string" && value.created_at.trim() ? value.created_at : new Date().toISOString();
  const rawResults = Array.isArray(value.results) ? value.results.filter(item => item && typeof item === "object").slice(0, 5000) : [];
  const rawSaved = Array.isArray(value.saved_shortlist) ? value.saved_shortlist : [];
  const rawFavorites = Array.isArray(value.favorites) ? value.favorites : [];
  const notes = value.saved_notes && typeof value.saved_notes === "object" && !Array.isArray(value.saved_notes) ? value.saved_notes : {};
  const settings = value.settings && typeof value.settings === "object" && !Array.isArray(value.settings) ? value.settings : {};
  const winner = normalizeSavedDomain(value.saved_winner || "");
  const fallback = String(fallbackLabel || "Imported archive").replace(/\.json$/i, "").trim() || "Imported archive";
  const label = String(value.label || fallback).trim().slice(0, 90) || "Imported archive";
  return {
    id: String(value.id || `imported-${Date.now()}`).trim() || `imported-${Date.now()}`,
    label,
    created_at: createdAt,
    imported_at: new Date().toISOString(),
    input: typeof value.input === "string" ? value.input : "",
    results: rawResults,
    large_result_count_not_saved: Number(value.large_result_count_not_saved || 0),
    favorites: rawFavorites.map(normalizeSavedDomain).filter(Boolean),
    saved_shortlist: rawSaved.map(normalizeSavedDomain).filter(Boolean),
    saved_notes: notes,
    saved_checked: Array.isArray(value.saved_checked) ? value.saved_checked.map(normalizeSavedDomain).filter(Boolean) : [],
    saved_winner: winner,
    pinned: Boolean(value.pinned),
    archive_note: typeof value.archive_note === "string" ? value.archive_note.trim().slice(0, 240) : "",
    settings
  };
}

function archiveLooksUseful(snapshot) {
  return Boolean(snapshot && (snapshot.input || snapshot.results.length || snapshot.saved_shortlist.length || snapshot.favorites.length || Object.keys(snapshot.saved_notes || {}).length));
}

function sessionArchiveSummary(archive) {
  const normalized = normalizeArchiveSnapshot(archive, archive?.label || "Saved archive");
  if (!normalized) {
    return { label: "Saved archive", meta: "Could not read archive", lines: ["Could not read archive."] };
  }
  const label = String(normalized.label || "Saved archive").trim();
  const resultCount = Array.isArray(normalized.results) ? normalized.results.length : 0;
  const savedCount = Array.isArray(normalized.saved_shortlist) ? normalized.saved_shortlist.length : 0;
  const checkedCount = Array.isArray(normalized.saved_checked) ? normalized.saved_checked.length : 0;
  const winner = normalizeSavedDomain(normalized.saved_winner || "");
  const largeCount = Number(normalized.large_result_count_not_saved || 0);
  const parts = [];
  if (resultCount) parts.push(`${resultCount} result${resultCount === 1 ? "" : "s"}`);
  if (largeCount) parts.push(`${largeCount.toLocaleString()} result${largeCount === 1 ? "" : "s"} not stored`);
  if (savedCount) parts.push(`${savedCount} saved`);
  if (winner) parts.push("1 winner");
  if (checkedCount) parts.push(`${checkedCount} checked`);
  const lines = [
    `${resultCount.toLocaleString()} result${resultCount === 1 ? "" : "s"}`,
    `${savedCount.toLocaleString()} saved finalist${savedCount === 1 ? "" : "s"}`,
    winner ? `Winner: ${winner}` : "No winner picked",
    `${checkedCount.toLocaleString()} checked`,
  ];
  if (largeCount) lines.push(`${largeCount.toLocaleString()} very large result row${largeCount === 1 ? "" : "s"} not stored`);
  return { label, meta: parts.length ? parts.join(" · ") : "No result rows stored", lines, normalized };
}

function sessionArchiveLabel(archive) {
  const summary = sessionArchiveSummary(archive);
  return { label: summary.label, meta: summary.meta };
}

function archiveSearchText(archive) {
  const summary = sessionArchiveSummary(archive);
  const saved = Array.isArray(archive?.saved_shortlist) ? archive.saved_shortlist.join(" ") : "";
  const winner = archive?.saved_winner || "";
  const date = archive?.created_at || "";
  const note = archive?.archive_note || "";
  return `${summary.label} ${summary.meta} ${saved} ${winner} ${date} ${note}`.toLowerCase();
}

function filteredSessionArchives() {
  const archives = loadSessionArchives();
  const query = archiveSearchQuery.trim().toLowerCase();
  if (!query) return archives;
  return archives.filter(archive => archiveSearchText(archive).includes(query));
}

function currentSessionSummaryText() {
  const resultCount = results.filter(Boolean).length;
  const savedCount = savedShortlist.size;
  const checkedCount = savedCheckedCount();
  const winner = savedWinner || "";
  const parts = [
    `${resultCount.toLocaleString()} result${resultCount === 1 ? "" : "s"}`,
    `${savedCount.toLocaleString()} saved`,
  ];
  if (winner) parts.push(`winner: ${winner}`);
  if (checkedCount) parts.push(`${checkedCount.toLocaleString()} checked`);
  if (!resultCount && !savedCount && !winner) return "Current session: nothing saved yet.";
  return `Current session: ${parts.join(" · ")}`;
}


function archiveCountSummaryText(archives = loadSessionArchives()) {
  const list = Array.isArray(archives) ? archives : [];
  if (!list.length) return "";
  const pinnedCount = list.filter(archive => archive && archive.pinned).length;
  return `${pinnedCount} pinned · ${list.length}/${archiveLimit()} archive${list.length === 1 ? "" : "s"}`;
}

function archiveStorageSummaryText(archives = loadSessionArchives({ includeOverLimit: true })) {
  const list = Array.isArray(archives) ? archives : [];
  if (!list.length) return "Archive storage: 0 KB";
  let bytes = 0;
  try {
    bytes = new Blob([JSON.stringify(list)]).size;
  } catch {
    bytes = JSON.stringify(list).length;
  }
  const kb = Math.max(1, Math.round(bytes / 1024));
  if (kb < 1024) return `Archive storage: about ${kb.toLocaleString()} KB`;
  const mb = (kb / 1024).toFixed(kb >= 10240 ? 0 : 1);
  return `Archive storage: about ${mb} MB`;
}

function archiveIsBroken(archive) {
  return !normalizeArchiveSnapshot(archive, archive?.label || "Saved archive");
}

function clearBrokenArchives() {
  const archives = loadSessionArchives({ includeOverLimit: true });
  if (!archives.length) {
    setStatus("No archives saved yet.");
    return;
  }
  const broken = archives.filter(archiveIsBroken);
  if (!broken.length) {
    setStatus("No broken archives found.");
    if (el.archiveHealthSummary) {
      el.archiveHealthSummary.textContent = "Archive cleanup: no broken archives found.";
      el.archiveHealthSummary.classList.remove("is-hidden");
    }
    return;
  }
  if (!confirm(`Remove ${broken.length} broken archive${broken.length === 1 ? "" : "s"}? Valid archives will stay.`)) return;
  const next = archives.filter(archive => !archiveIsBroken(archive));
  if (saveSessionArchives(next)) {
    renderArchiveTools();
    if (el.archiveHealthSummary) {
      el.archiveHealthSummary.textContent = `Removed ${broken.length} broken archive${broken.length === 1 ? "" : "s"}.`;
      el.archiveHealthSummary.classList.remove("is-hidden");
    }
    setStatus(`Removed ${broken.length} broken archive${broken.length === 1 ? "" : "s"}.`);
    trackEvent("session_archive_broken_cleared", { removed_count: broken.length, archive_count: loadSessionArchives().length });
  }
}

function mergeDuplicateArchiveLabels() {
  const archives = loadSessionArchives({ includeOverLimit: true });
  if (!archives.length) {
    setStatus("No archives saved yet.");
    return;
  }
  const groups = new Map();
  for (const archive of archives) {
    const label = String(archive?.label || sessionArchiveLabel(archive).label || "Saved archive").trim() || "Saved archive";
    const key = label.toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(archive);
  }
  let changed = 0;
  const seen = new Map();
  const next = archives.map(archive => {
    const label = String(archive?.label || sessionArchiveLabel(archive).label || "Saved archive").trim() || "Saved archive";
    const key = label.toLowerCase();
    const group = groups.get(key) || [];
    if (group.length <= 1) return archive;
    const index = (seen.get(key) || 0) + 1;
    seen.set(key, index);
    changed += 1;
    const base = label.replace(/\s+·\s+\d+$/g, "").trim() || "Saved archive";
    return {
      ...archive,
      label: `${base} · ${index}`.slice(0, 90),
      label_merged_at: new Date().toISOString()
    };
  });
  if (!changed) {
    setStatus("No duplicate archive labels found.");
    return;
  }
  if (saveSessionArchives(next)) {
    renderArchiveTools();
    setStatus(`Merged ${changed} duplicate archive label${changed === 1 ? "" : "s"}.`);
    trackEvent("session_archive_duplicate_labels_merged", { changed_count: changed });
  }
}

function addArchiveToLocalList(snapshot, options = {}) {
  const fallbackLabel = options.fallbackLabel || "Imported archive";
  const normalized = normalizeArchiveSnapshot(snapshot, fallbackLabel);
  if (!archiveLooksUseful(normalized)) {
    setStatus("That archive could not be saved. The file did not contain a saved session.");
    return false;
  }
  const now = new Date().toISOString();
  const label = String(normalized.label || fallbackLabel || archiveAutoLabel(normalized.results, normalized.saved_shortlist, normalized.saved_winner, now)).trim();
  normalized.id = options.id || `archive-import-${Date.now()}`;
  normalized.label = label.slice(0, 90) || archiveAutoLabel(normalized.results, normalized.saved_shortlist, normalized.saved_winner, now);
  normalized.created_at = options.keepCreatedAt ? normalized.created_at : now;
  normalized.imported_at = now;
  normalized.pinned = Boolean(options.pinned && normalized.pinned);
  const archives = loadSessionArchives();
  const next = [normalized, ...archives.filter(item => item.id !== normalized.id)];
  if (saveSessionArchives(next)) {
    renderArchiveTools();
    const storedCount = loadSessionArchives().length;
    setStatus(`Saved imported archive. ${storedCount} archive${storedCount === 1 ? "" : "s"} stored in this browser.`);
    trackEvent("session_archive_import_saved", { archive_count: storedCount, saved_count: normalized.saved_shortlist.length, result_count: normalized.results.length });
    return true;
  }
  return false;
}

function archiveHealthReport(archives = loadSessionArchives()) {
  const list = Array.isArray(archives) ? archives : [];
  const labels = new Map();
  let brokenCount = 0;
  let emptyCount = 0;
  let largest = { label: "None", count: 0 };
  for (const archive of list) {
    const normalized = normalizeArchiveSnapshot(archive, archive?.label || "Saved archive");
    if (!normalized) {
      brokenCount += 1;
      continue;
    }
    if (!archiveLooksUseful(normalized)) emptyCount += 1;
    const label = String(normalized.label || "Saved archive").trim().toLowerCase();
    labels.set(label, (labels.get(label) || 0) + 1);
    const count = (Array.isArray(normalized.results) ? normalized.results.length : 0) + Number(normalized.large_result_count_not_saved || 0);
    if (count > largest.count) largest = { label: normalized.label || "Saved archive", count };
  }
  const duplicateLabels = [...labels.values()].filter(count => count > 1).length;
  const pinnedCount = list.filter(archive => archive && archive.pinned).length;
  const issues = brokenCount + emptyCount + duplicateLabels;
  const line = `Archives checked: ${list.length} total · ${pinnedCount} pinned · ${duplicateLabels} duplicate label${duplicateLabels === 1 ? "" : "s"} · ${emptyCount} empty · ${brokenCount} broken · largest: ${largest.count.toLocaleString()} row${largest.count === 1 ? "" : "s"}`;
  return { line, issues, total: list.length, pinnedCount, duplicateLabels, emptyCount, brokenCount, largest };
}

function checkSessionArchives() {
  const archives = loadSessionArchives();
  if (!archives.length) {
    if (el.archiveHealthSummary) {
      el.archiveHealthSummary.textContent = "No archives saved yet.";
      el.archiveHealthSummary.classList.remove("is-hidden");
    }
    setStatus("No archives saved yet.");
    return;
  }
  const report = archiveHealthReport(archives);
  if (el.archiveHealthSummary) {
    el.archiveHealthSummary.textContent = report.line;
    el.archiveHealthSummary.classList.remove("is-hidden");
  }
  setStatus(report.issues ? `Archive check found ${report.issues} issue${report.issues === 1 ? "" : "s"}.` : "Archive check passed.");
  trackEvent("session_archive_health_checked", { issue_count: report.issues, archive_count: report.total });
}

function archiveNeedsLabelRepair(archive) {
  const label = String(archive?.label || "").trim();
  if (!label) return true;
  return /^(saved archive|imported archive|domain session|archive|copy of imported archive)$/i.test(label);
}

function repairArchiveLabels() {
  const archives = loadSessionArchives();
  if (!archives.length) {
    setStatus("No archives to repair.");
    return;
  }
  let changed = 0;
  const repaired = archives.map(archive => {
    if (!archiveNeedsLabelRepair(archive)) return archive;
    const normalized = normalizeArchiveSnapshot(archive, archive?.label || "Saved archive");
    if (!archiveLooksUseful(normalized)) return archive;
    changed += 1;
    return {
      ...archive,
      label: archiveAutoLabel(normalized.results, normalized.saved_shortlist, normalized.saved_winner, normalized.created_at),
      label_repaired_at: new Date().toISOString()
    };
  });
  if (!changed) {
    setStatus("Archive labels already look good.");
    return;
  }
  if (saveSessionArchives(repaired)) {
    renderArchiveTools();
    setStatus(`Repaired ${changed} archive label${changed === 1 ? "" : "s"}.`);
    trackEvent("session_archive_labels_repaired", { repaired_count: changed });
  }
}

function renderArchiveTools() {
  if (el.archiveCurrentSummary) el.archiveCurrentSummary.textContent = currentSessionSummaryText();
  if (!el.archiveList || !el.archiveListEmpty) return;
  const archives = loadSessionArchives();
  const visibleArchives = filteredSessionArchives();
  const hasArchives = archives.length > 0;
  const hasSearch = archiveSearchQuery.trim().length > 0;
  el.archiveListEmpty.classList.toggle("is-hidden", hasArchives && (!hasSearch || visibleArchives.length > 0));
  el.archiveListEmpty.textContent = hasSearch && hasArchives && !visibleArchives.length ? "No archives match that search." : "No archives saved yet.";
  if (el.archiveClearAllBtn) el.archiveClearAllBtn.disabled = !hasArchives;
  if (el.archiveDownloadAllBtn) el.archiveDownloadAllBtn.disabled = !hasArchives;
  if (el.archiveHealthBtn) el.archiveHealthBtn.disabled = !hasArchives;
  if (el.archiveRepairLabelsBtn) el.archiveRepairLabelsBtn.disabled = !hasArchives;
  if (el.archiveClearBrokenBtn) el.archiveClearBrokenBtn.disabled = !hasArchives;
  if (el.archiveMergeDuplicateLabelsBtn) el.archiveMergeDuplicateLabelsBtn.disabled = !hasArchives;
  if (el.archiveLimitSelect && el.archiveLimitSelect.value !== String(archiveLimit())) el.archiveLimitSelect.value = String(archiveLimit());
  if (el.archiveCountSummary) {
    el.archiveCountSummary.textContent = archiveCountSummaryText(archives);
    el.archiveCountSummary.classList.toggle("is-hidden", !hasArchives);
  }
  if (el.archiveStorageSummary) {
    el.archiveStorageSummary.textContent = archiveStorageSummaryText(archives);
    el.archiveStorageSummary.classList.toggle("is-hidden", !hasArchives);
  }
  if (el.archiveSearchInput && el.archiveSearchInput.value !== archiveSearchQuery) el.archiveSearchInput.value = archiveSearchQuery;
  if (el.archiveSearchInput) el.archiveSearchInput.disabled = !hasArchives;
  if (el.archiveSearchClearBtn) el.archiveSearchClearBtn.disabled = !hasSearch;
  if (el.archiveDownloadCurrentBtn) el.archiveDownloadCurrentBtn.disabled = false;
  if (!visibleArchives.length) {
    el.archiveList.innerHTML = "";
    return;
  }
  el.archiveList.innerHTML = visibleArchives.map(archive => {
    const info = sessionArchiveLabel(archive);
    const id = escapeHtml(archive.id);
    const when = archive.created_at ? new Date(archive.created_at).toLocaleString() : "Saved archive";
    const isPinned = Boolean(archive.pinned);
    const note = String(archive.archive_note || "").trim();
    const pinLabel = isPinned ? "Unpin" : "Pin";
    const pinBadge = isPinned ? `<span class="archive-pin-badge">Pinned</span>` : "";
    const noteLine = note ? `<span class="archive-note">Note: ${escapeHtml(note)}</span>` : "";
    return `<div class="archive-row${isPinned ? " is-pinned" : ""}">\n      <div class="archive-row-text">\n        <strong>${pinBadge}${escapeHtml(info.label)}</strong>\n        <span>${escapeHtml(info.meta)} · ${escapeHtml(when)}</span>\n        ${noteLine}\n      </div>\n      <div class="archive-row-actions">\n        <button type="button" class="ghost small-button" data-archive-restore="${id}">Restore</button>\n        <button type="button" class="ghost small-button" data-archive-pin="${id}">${pinLabel}</button>\n        <button type="button" class="ghost small-button" data-archive-note="${id}">Note</button>\n        <button type="button" class="ghost small-button" data-archive-duplicate="${id}">Duplicate</button>\n        <button type="button" class="ghost small-button" data-archive-rename="${id}">Rename</button>\n        <button type="button" class="ghost small-button" data-archive-download="${id}">Download JSON</button>\n        <button type="button" class="ghost small-button" data-archive-delete="${id}">Delete</button>\n      </div>\n    </div>`;
  }).join("");
}

function archiveRestoreConfirmText(summary, options = {}) {
  const isImport = options.mode === "import";
  const title = isImport ? "Import archive?" : `Restore ${summary.label || "this archive"}?`;
  const actionLine = isImport ? "This will replace your current browser session." : "This will replace the current browser session.";
  return `${title}\n\nArchive contains:\n- ${summary.lines.join("\n- ")}\n\n${actionLine}`;
}

function maybeArchiveCurrentBeforeImport() {
  if (!currentSessionHasArchiveableContent()) return true;
  const shouldArchive = confirm("Archive current session before importing?\n\nOK = archive current session first.\nCancel = import without archiving.");
  if (!shouldArchive) return true;
  const archived = archiveCurrentSession({ silent: true });
  if (archived) return true;
  return confirm("The current session could not be archived. Import anyway?");
}

function restoreArchiveSnapshot(snapshot, options = {}) {
  const normalized = normalizeArchiveSnapshot(snapshot, snapshot?.label || (options.mode === "import" ? "Imported archive" : "Saved archive"));
  if (!archiveLooksUseful(normalized)) {
    setStatus("Could not restore that archive. The file did not contain a saved session.");
    return false;
  }
  const summary = sessionArchiveSummary(normalized);
  if (!options.skipConfirm && !confirm(archiveRestoreConfirmText(summary, options))) return false;
  if (el.inputBox) el.inputBox.value = normalized.input || "";
  applySettings(normalized.settings || {});
  results = Array.isArray(normalized.results) ? applyBatchMetrics(normalized.results) : [];
  favorites = new Set(Array.isArray(normalized.favorites) ? normalized.favorites.map(normalizeSavedDomain).filter(Boolean) : []);
  savedShortlist = new Set(Array.isArray(normalized.saved_shortlist) ? normalized.saved_shortlist.map(normalizeSavedDomain).filter(Boolean) : []);
  savedNotes = normalized.saved_notes && typeof normalized.saved_notes === "object" && !Array.isArray(normalized.saved_notes) ? normalized.saved_notes : {};
  savedChecked = new Set(Array.isArray(normalized.saved_checked) ? normalized.saved_checked.map(normalizeSavedDomain).filter(Boolean) : []);
  savedWinner = normalizeSavedDomain(normalized.saved_winner || "");
  compareSet = new Set(Array.isArray(normalized.compare) ? normalized.compare.map(normalizeSavedDomain).filter(Boolean).slice(0, COMPARE_LIMIT) : []);
  savedShowUncheckedOnly = false;
  winnerDoneShown = false;
  syncFavoritesToSavedShortlist();
  saveSavedShortlistData();
  saveState();
  updateInputCount();
  updateInputPreview();
  renderResults();
  renderArchiveTools();
  const largeCount = Number(normalized.large_result_count_not_saved || 0);
  const statusPrefix = options.mode === "import" ? "Imported archive" : "Restored archive";
  setStatus(largeCount ? `${statusPrefix}. ${largeCount.toLocaleString()} very large result rows were not stored in the archive.` : `${statusPrefix}.`);
  trackEvent(options.mode === "import" ? "session_archive_imported" : "session_archive_restored", { result_count: results.length, saved_count: savedShortlist.size });
  return true;
}

function restoreSessionArchive(id) {
  const archive = loadSessionArchives().find(item => item.id === id);
  restoreArchiveSnapshot(archive);
}

function deleteSessionArchive(id) {
  const archives = loadSessionArchives();
  const archive = archives.find(item => item.id === id);
  if (!archive) {
    setStatus("That archive was not found.");
    renderArchiveTools();
    return;
  }
  if (!confirm(`Delete ${archive.label || "this archive"}?`)) return;
  const next = archives.filter(item => item.id !== id);
  if (saveSessionArchives(next)) {
    renderArchiveTools();
    setStatus("Deleted archive.");
    trackEvent("session_archive_deleted", { archive_count: next.length });
  }
}

function clearAllSessionArchives() {
  const archives = loadSessionArchives();
  if (!archives.length) {
    setStatus("No archives to delete.");
    return;
  }
  if (!confirm(`Delete all ${archives.length} local archive${archives.length === 1 ? "" : "s"}?`)) return;
  if (saveSessionArchives([])) {
    renderArchiveTools();
    setStatus("Deleted all archives stored in this browser.");
    trackEvent("session_archives_cleared");
  }
}

function archiveJsonText(snapshot) {
  return JSON.stringify(snapshot || sessionArchiveSnapshot(), null, 2);
}

function downloadArchiveSnapshot(snapshot, label = "archive") {
  const safeLabel = String(label || "archive").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "archive";
  const filename = `domain-shortlist-${safeLabel}-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([archiveJsonText(snapshot)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadCurrentArchiveJson() {
  const snapshot = sessionArchiveSnapshot();
  const hasAnything = Boolean(snapshot.input || snapshot.results.length || snapshot.saved_shortlist.length || snapshot.favorites.length);
  if (!hasAnything) {
    setStatus("Nothing to export yet. Paste a list or save finalists first.");
    return;
  }
  downloadArchiveSnapshot(snapshot, "current-session");
  setStatus("Downloaded current session archive JSON.");
  trackEvent("session_archive_current_downloaded", { saved_count: snapshot.saved_shortlist.length, result_count: snapshot.results.length });
}

function downloadStoredArchiveJson(id) {
  const archive = loadSessionArchives().find(item => item.id === id);
  if (!archive) {
    setStatus("That archive was not found.");
    renderArchiveTools();
    return;
  }
  downloadArchiveSnapshot(archive, archive.label || "archive");
  setStatus("Downloaded archive JSON.");
  trackEvent("session_archive_downloaded");
}


function downloadAllArchivesJson() {
  const archives = loadSessionArchives();
  if (!archives.length) {
    setStatus("No archives to download yet.");
    renderArchiveTools();
    return;
  }
  const payload = {
    app: PUBLIC_SITE_NAME,
    type: "domain-shortlist-archives",
    exported_at: new Date().toISOString(),
    archive_count: archives.length,
    archives
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `domain-shortlist-all-archives-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus(`Downloaded ${archives.length} archive${archives.length === 1 ? "" : "s"}.`);
  trackEvent("session_archives_downloaded", { archive_count: archives.length });
}

function renameSessionArchive(id) {
  const archives = loadSessionArchives();
  const archive = archives.find(item => item.id === id);
  if (!archive) {
    setStatus("That archive was not found.");
    renderArchiveTools();
    return;
  }
  const current = String(archive.label || "Saved archive");
  const nextLabel = prompt("Rename archive", current);
  if (nextLabel === null) return;
  const cleanLabel = nextLabel.trim().slice(0, 90);
  if (!cleanLabel) {
    setStatus("Archive name was not changed.");
    return;
  }
  archive.label = cleanLabel;
  archive.renamed_at = new Date().toISOString();
  if (saveSessionArchives(archives)) {
    renderArchiveTools();
    setStatus("Renamed archive.");
    trackEvent("session_archive_renamed");
  }
}


function toggleSessionArchivePin(id) {
  const archives = loadSessionArchives();
  const archive = archives.find(item => item.id === id);
  if (!archive) {
    setStatus("That archive was not found.");
    renderArchiveTools();
    return;
  }
  archive.pinned = !archive.pinned;
  archive.pinned_at = archive.pinned ? new Date().toISOString() : "";
  if (saveSessionArchives(archives)) {
    renderArchiveTools();
    setStatus(archive.pinned ? "Pinned archive." : "Unpinned archive.");
    trackEvent("session_archive_pin_toggled", { pinned: archive.pinned });
  }
}

function noteSessionArchive(id) {
  const archives = loadSessionArchives();
  const archive = archives.find(item => item.id === id);
  if (!archive) {
    setStatus("That archive was not found.");
    renderArchiveTools();
    return;
  }
  const current = String(archive.archive_note || "");
  const nextNote = prompt("Archive note", current);
  if (nextNote === null) return;
  archive.archive_note = nextNote.trim().slice(0, 240);
  archive.note_updated_at = archive.archive_note ? new Date().toISOString() : "";
  if (saveSessionArchives(archives)) {
    renderArchiveTools();
    setStatus(archive.archive_note ? "Saved archive note." : "Cleared archive note.");
    trackEvent("session_archive_note_updated", { has_note: Boolean(archive.archive_note) });
  }
}


function duplicateSessionArchive(id) {
  const archives = loadSessionArchives();
  const archive = archives.find(item => item.id === id);
  if (!archive) {
    setStatus("That archive was not found.");
    renderArchiveTools();
    return;
  }
  const copy = normalizeArchiveSnapshot(archive, archive.label || "Saved archive");
  if (!archiveLooksUseful(copy)) {
    setStatus("Could not duplicate that archive.");
    return;
  }
  const labelBase = String(copy.label || "Saved archive").replace(/^Copy of\s+/i, "").trim();
  copy.id = `archive-copy-${Date.now()}`;
  copy.label = `Copy of ${labelBase}`.slice(0, 90);
  copy.created_at = new Date().toISOString();
  copy.pinned = false;
  copy.duplicated_from = archive.id;
  const next = [copy, ...archives].slice(0, archiveLimit());
  if (saveSessionArchives(next)) {
    renderArchiveTools();
    setStatus("Duplicated archive.");
    trackEvent("session_archive_duplicated", { archive_count: next.length });
  }
}

function updateArchiveSearch(value) {
  archiveSearchQuery = String(value || "").trim();
  renderArchiveTools();
}

function clearArchiveSearch() {
  archiveSearchQuery = "";
  if (el.archiveSearchInput) el.archiveSearchInput.value = "";
  renderArchiveTools();
}

function openArchiveImportPicker(mode = "restore") {
  archiveImportMode = mode === "save" ? "save" : "restore";
  if (!el.archiveImportInput) {
    setStatus("Archive import is not available in this browser.");
    return;
  }
  el.archiveImportInput.value = "";
  el.archiveImportInput.click();
}

async function importArchiveJson(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const isBundle = parsed && typeof parsed === "object" && Array.isArray(parsed.archives);
    if (isBundle && !parsed.archives.length) {
      setStatus("That archive export does not contain any saved archives.");
      return;
    }
    if (archiveImportMode === "save" && isBundle) {
      const snapshots = parsed.archives
        .map((item, index) => normalizeArchiveSnapshot(item, `${file.name || "Imported archives"} ${index + 1}`))
        .filter(archiveLooksUseful);
      if (!snapshots.length) {
        setStatus("That archive export does not contain any usable archives.");
        return;
      }
      const preview = snapshots.slice(0, 5).map(item => `- ${sessionArchiveLabel(item).label}`).join("\n");
      const confirmText = `Save imported archives only?\n\nThis file contains ${snapshots.length} archive${snapshots.length === 1 ? "" : "s"}.\n${preview}\n\nThis will add them to Local archives without replacing your current session.`;
      if (!confirm(confirmText)) return;
      const existing = loadSessionArchives();
      const now = Date.now();
      const prepared = snapshots.map((item, index) => ({
        ...item,
        id: `archive-import-${now}-${index}`,
        imported_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        pinned: false
      }));
      if (saveSessionArchives([...prepared, ...existing])) {
        renderArchiveTools();
        const storedCount = loadSessionArchives().length;
        setStatus(`Saved ${prepared.length} imported archive${prepared.length === 1 ? "" : "s"}. ${storedCount} archive${storedCount === 1 ? "" : "s"} stored in this browser.`);
        trackEvent("session_archive_bundle_import_saved", { imported_count: prepared.length, archive_count: storedCount });
      }
      return;
    }
    const candidate = isBundle ? parsed.archives[0] : parsed;
    const snapshot = normalizeArchiveSnapshot(candidate, file.name || "Imported archive");
    if (!archiveLooksUseful(snapshot)) {
      setStatus("That JSON file does not look like a Domain Shortlist archive.");
      return;
    }
    const summary = sessionArchiveSummary(snapshot);
    if (archiveImportMode === "save") {
      const confirmText = `Save imported archive only?\n\nArchive contains:\n- ${summary.lines.join("\n- ")}\n\nThis will add it to Local archives without replacing your current session.`;
      if (!confirm(confirmText)) return;
      addArchiveToLocalList(snapshot, { fallbackLabel: file.name || "Imported archive", keepCreatedAt: false });
      return;
    }
    if (isBundle && !confirm(`This JSON file contains ${parsed.archives.length} archives. Restore the first archive in the file?`)) return;
    if (!confirm(archiveRestoreConfirmText(summary, { mode: "import" }))) return;
    if (!maybeArchiveCurrentBeforeImport()) return;
    restoreArchiveSnapshot(snapshot, { mode: "import", skipConfirm: true });
  } catch {
    setStatus("Could not import that archive JSON file.");
  } finally {
    archiveImportMode = "restore";
    if (el.archiveImportInput) el.archiveImportInput.value = "";
  }
}

function clearSavedWinner() {
  if (!savedWinner) {
    setStatus("No winner is picked yet.");
    return;
  }
  const oldWinner = savedWinner;
  if (!confirm(`Clear winner badge from ${oldWinner}? Saved domains, notes, and checked status will stay.`)) return;
  savedWinner = "";
  saveSavedWinnerData();
  saveState();
  renderSavedShortlist();
  renderResults();
  setStatus(`Cleared winner from ${oldWinner}.`);
  trackEvent("saved_winner_cleared");
}

function savedNoteFor(domain) {
  return String(savedNotes[normalizeSavedDomain(domain)] || "").slice(0, 160);
}

function setSavedNote(domain, note) {
  const key = normalizeSavedDomain(domain);
  if (!key) return;
  const clean = String(note || "").trim().slice(0, 160);
  if (clean) savedNotes[key] = clean;
  else delete savedNotes[key];
  saveSavedNotesData();
  saveState();
}

function saveSavedNotesData() {
  try { localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(savedNotes)); } catch {}
}

function saveSavedShortlistData() {
  try { localStorage.setItem(SAVED_SHORTLIST_KEY, JSON.stringify([...savedShortlist].sort())); } catch {}
  // Keep only checkmarks for currently saved names.
  savedChecked = new Set([...savedChecked].filter(domain => savedShortlist.has(domain)));
  if (savedWinner && !savedShortlist.has(savedWinner)) savedWinner = "";
  saveSavedNotesData();
  saveSavedCheckedData();
  saveSavedWinnerData();
}

function loadRecentRunsData() {
  try {
    const raw = localStorage.getItem(RECENT_RUNS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    recentRuns = Array.isArray(parsed) ? parsed.filter(run => run && run.id).slice(0, RECENT_RUN_LIMIT) : [];
  } catch {
    recentRuns = [];
  }
}

function saveRecentRunsData() {
  try { localStorage.setItem(RECENT_RUNS_KEY, JSON.stringify(recentRuns.slice(0, RECENT_RUN_LIMIT))); } catch {}
}

function updateReturnUserPanel() {
  if (!el.returnUserPanel) return;
  const savedCount = savedShortlist.size;
  const recentCount = recentRuns.filter(Boolean).length;
  const hasReturnData = savedCount > 0 || recentCount > 0;
  el.returnUserPanel.classList.toggle("is-hidden", !hasReturnData);
  if (!hasReturnData) return;
  if (el.returnUserHeadline) {
    const savedText = savedCount ? `${savedCount} saved name${savedCount === 1 ? "" : "s"}` : "No saved names yet";
    const recentText = recentCount ? `${recentCount} recent run${recentCount === 1 ? "" : "s"}` : "no recent runs";
    el.returnUserHeadline.textContent = `Welcome back — ${savedText}, ${recentText}`;
  }
  if (el.returnUserDetails) {
    el.returnUserDetails.textContent = savedCount
      ? "Continue from your saved shortlist, restore a recent run, or check prices for saved names at your selected registrar."
      : "Restore a recent run to continue reviewing earlier results from this browser.";
  }
  if (el.returnCheckSavedBtn) el.returnCheckSavedBtn.disabled = savedCount === 0;
  if (el.returnViewSavedBtn) el.returnViewSavedBtn.disabled = savedCount === 0;
  if (el.returnRestoreRecentBtn) el.returnRestoreRecentBtn.disabled = recentCount === 0;
}

function restoreLatestRecentRun() {
  const latest = recentRuns.filter(Boolean)[0];
  if (!latest) {
    setStatus("No recent runs are saved in this browser yet.");
    return;
  }
  trackEvent("return_panel_restore_recent_clicked");
  restoreRecentRun(latest.id);
}

function viewSavedShortlistPanel() {
  trackEvent("return_panel_view_saved_clicked", { saved_count: savedShortlist.size });
  const panel = el.savedShortlistPanel || document.getElementById("savedShortlistPanel");
  if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function syncFavoritesToSavedShortlist() {
  for (const domain of favorites) {
    const normalized = normalizeSavedDomain(domain);
    if (normalized) savedShortlist.add(normalized);
  }
  saveSavedShortlistData();
}

function fallbackSavedRow(domain) {
  const normalized = normalizeSavedDomain(domain);
  return {
    input: normalized,
    normalized_domain: normalized,
    effective_tld: effectiveSuffix(normalized),
    name_length: secondLevelName(normalized).replace(/\./g, "").length,
    domain_score: "",
    score_label: "Saved",
    score_explanation: "Saved from an earlier shortlist.",
    score_notes: "Run a fresh check to update score, availability, and ranking details.",
    availability_status: "saved_shortlist",
    available: null,
    check_source: "saved",
    notes: "Saved locally in this browser."
  };
}

function savedShortlistRows() {
  return [...savedShortlist]
    .map(domain => findResultByDomain(domain) || fallbackSavedRow(domain))
    .filter(row => row && row.normalized_domain)
    .sort((a, b) => {
      const aWinner = isSavedWinner(a.normalized_domain) ? 0 : 1;
      const bWinner = isSavedWinner(b.normalized_domain) ? 0 : 1;
      if (aWinner !== bWinner) return aWinner - bWinner;
      const aChecked = isSavedChecked(a.normalized_domain) ? 1 : 0;
      const bChecked = isSavedChecked(b.normalized_domain) ? 1 : 0;
      if (aChecked !== bChecked) return aChecked - bChecked;
      return Number(b.domain_score || 0) - Number(a.domain_score || 0) || String(a.normalized_domain).localeCompare(String(b.normalized_domain));
    });
}

function savedShortlistItemHtml(row) {
  const domain = row.normalized_domain || "";
  const lookupUrl = resultRegistrarUrl(row);
  const hasScore = row.domain_score !== "" && row.domain_score !== null && row.domain_score !== undefined;
  const scoreHtml = hasScore ? `<span class="score-badge score-${scoreClass(row.domain_score)}">${escapeHtml(row.domain_score)}</span>` : `<span class="score-badge muted-score">Saved</span>`;
  const concernTags = topPickConcernTags(row).slice(0, 2).map(tag => cardTagHtml(tag.label, tag.kind)).join("");
  const winnerBadge = isSavedWinner(domain) ? `<span class="winner-badge">Winner</span>` : "";
  return `<article class="saved-domain-card ${isSavedWinner(domain) ? "is-winner" : ""}" data-domain="${escapeAttr(domain)}">
    <div class="saved-domain-head">
      <div class="saved-domain-title"><strong>${escapeHtml(domain)}</strong>${winnerBadge}</div>
      <button type="button" class="ghost small-button" data-remove-saved="${escapeAttr(domain)}">Remove</button>
    </div>
    <div class="result-card-meta">
      ${scoreHtml}
      <span>${escapeHtml(row.score_label || publicRecommendationType(row) || "Saved")}</span>
      <span>${escapeHtml(availabilityText(row))}</span>
      <span>.${escapeHtml(row.effective_tld || effectiveSuffix(domain))}</span>
    </div>
    <p>${escapeHtml(publicScoreExplanation(row) || "Saved locally. Check the registrar when you are ready to decide.")}</p>
    <p class="saved-watchout"><strong>Watch out:</strong> ${escapeHtml(watchOutForRow(row))}</p>
    <div class="saved-status-actions">
      <button type="button" class="ghost small-button saved-checked-button ${isSavedChecked(domain) ? "is-checked" : ""}" data-saved-checked="${escapeAttr(domain)}" aria-pressed="${isSavedChecked(domain) ? "true" : "false"}">${isSavedChecked(domain) ? "✓ Marked checked" : "Mark as checked"}</button>
      <button type="button" class="ghost small-button saved-winner-button ${isSavedWinner(domain) ? "is-winner" : ""}" data-saved-winner="${escapeAttr(domain)}" aria-pressed="${isSavedWinner(domain) ? "true" : "false"}">${isSavedWinner(domain) ? "✓ Winner" : "Pick winner"}</button>
    </div>
    ${concernTags ? `<div class="top-pick-tags">${concernTags}</div>` : ""}
    <label class="saved-note-label" for="note-${escapeAttr(domain)}">Note</label>
    <textarea id="note-${escapeAttr(domain)}" class="saved-note-input" data-saved-note-domain="${escapeAttr(domain)}" maxlength="160" rows="2" placeholder="Optional note, e.g. best for app name">${escapeHtml(savedNoteFor(domain))}</textarea>
    <div class="saved-domain-actions">
      ${lookupUrl ? `<a class="top-pick-cta secondary-registrar-cta" href="${escapeAttr(lookupUrl)}" target="_blank" rel="${escapeAttr(registrarLinkRel(selectedRegistrarKey(), domain))}">Check registrar</a>` : ""}
      <button type="button" class="ghost" data-detail-domain="${escapeAttr(domain)}">Why?</button>
      ${compareButtonHtml(domain)}
      <button type="button" class="ghost" data-copy-domain="${escapeAttr(domain)}">Copy</button>
    </div>
  </article>`;
}

function savedDecisionScore(row) {
  const domain = String(row.normalized_domain || "");
  let value = Number(row.domain_score || 0);
  if (effectiveSuffix(domain) === "com") value += 8;
  if (row.available === true) value += 6;
  if (domainHasCleanShape(domain)) value += 5;
  if (watchOutForRow(row) === "confirm final price") value += 3;
  return value;
}

function savedDecisionRows() {
  return savedShortlistRows()
    .slice(0, 8)
    .sort((a, b) => {
      const aWinner = isSavedWinner(a.normalized_domain) ? 0 : 1;
      const bWinner = isSavedWinner(b.normalized_domain) ? 0 : 1;
      if (aWinner !== bWinner) return aWinner - bWinner;
      return savedDecisionScore(b) - savedDecisionScore(a);
    })
    .slice(0, 5);
}


function savedDecisionReportText() {
  const rows = savedDecisionRows();
  if (!rows.length) return "No saved finalists yet.";
  const best = rows[0];
  const backup = rows[1] || rows[0];
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const lines = [
    `${PUBLIC_SITE_NAME} decision report — ${date}`,
    "",
    `${isSavedWinner(best.normalized_domain) ? "Winner" : "Best overall"}: ${best.normalized_domain || ""}`
  ];
  const directWinnerNote = winnerNoteLine(best);
  if (directWinnerNote) lines.push(directWinnerNote);
  lines.push(
    `Best backup: ${backup.normalized_domain || ""}`,
    "",
    "Finalists:"
  );
  for (const row of rows.slice(0, 8)) {
    const note = savedNoteFor(row.normalized_domain);
    const checked = isSavedChecked(row.normalized_domain) ? " Checked: yes." : " Checked: no.";
    lines.push(`- ${row.normalized_domain || ""}: ${bestUseForRow(row)}. Strength: ${strengthForRow(row)}. Watch out: ${watchOutForRow(row)}.${note ? ` Note: ${note}.` : ""}${checked}`);
  }
  lines.push("", "Next steps:", `1. Check final price and availability at ${selectedRegistrarLabel()} or another registrar.`, "2. Watch for premium pricing, trademarks, confusing spelling, and renewal price.", "3. Buy only after the registrar confirms the domain is available at a price you accept.");
  return lines.join("\n");
}


function savedShareSummaryText() {
  const rows = savedDecisionRows();
  if (!rows.length) return "No saved finalists yet.";
  const best = rows[0];
  const names = rows.slice(0, 5).map((row, index) => `${index + 1}. ${row.normalized_domain || ""}`);
  const lines = [
    `My top domain picks from ${PUBLIC_SITE_NAME}:`,
    ...names,
    "",
    `${isSavedWinner(best.normalized_domain) ? "Winner" : "Best overall"}: ${best.normalized_domain || ""}`
  ];
  const directWinnerNote = winnerNoteLine(best);
  if (directWinnerNote) lines.push(directWinnerNote);
  lines.push("Next step: check final registrar price and availability before buying.");
  return lines.join("\n");
}

function savedCleanReportText() {
  const savedRows = savedDecisionRows();
  const topRows = topPickRows().slice(0, 3);
  const best = savedRows[0] || topRows[0];
  const bestThree = uniqueDomains(savedRows.length ? savedRows.slice(0, 3) : topRows);
  const savedDomains = uniqueDomains(savedRows);
  if (!best && !bestThree.length && !savedDomains.length) return "No report yet. Paste names and click Check my list first.";
  const lines = [
    `${PUBLIC_SITE_NAME} clean report`,
    "",
    `${best && isSavedWinner(best.normalized_domain) ? "Winner" : "Best choice"}: ${best?.normalized_domain || bestThree[0] || "Not selected yet"}`
  ];
  const directWinnerNote = best ? winnerNoteLine(best) : "";
  if (directWinnerNote) lines.push(directWinnerNote);
  lines.push(
    "",
    "Best 3:",
    ...(bestThree.length ? bestThree.map((domain, index) => `${index + 1}. ${domain}`) : ["No Top Picks yet"]),
    "",
    "Saved finalists:",
    ...(savedDomains.length ? savedDomains.map(domain => `- ${domain}${isSavedChecked(domain) ? " — checked" : ""}`) : ["No saved finalists yet"]),
    "",
    `Next step: check final price, renewal cost, spelling, and trademark risk at ${selectedRegistrarLabel()} or another registrar before buying.`
  );
  return lines.join("\n");
}

function copyCleanReport() {
  const hasSaved = savedDecisionRows().length > 0;
  const hasPicks = topPickRows().length > 0;
  if (!hasSaved && !hasPicks) {
    setStatus("No clean report to copy yet. Paste a list and click Check my list first.");
    return;
  }
  copyText(savedCleanReportText(), "clean report");
  trackEvent("clean_report_copied", { saved_count: savedShortlist.size, top_pick_count: topPickRows().length });
}

function copyShareSummary() {
  const rows = savedDecisionRows();
  if (!rows.length) {
    setStatus("Save at least one finalist before copying a share summary.");
    return;
  }
  copyText(savedShareSummaryText(), "share summary");
  trackEvent("share_summary_copied", { saved_count: rows.length });
}

function copySavedDecisionReport() {
  const rows = savedDecisionRows();
  if (!rows.length) {
    setStatus("Save at least one finalist before copying a decision report.");
    return;
  }
  copyText(savedDecisionReportText(), "decision report");
  trackEvent("saved_decision_report_copied", { saved_count: rows.length });
}

function renderFinalReport() {
  if (!el.finalReportPanel || !el.finalReportText || !el.finalReportCount) return;
  const rows = savedDecisionRows();
  const show = rows.length >= 2;
  el.finalReportPanel.classList.toggle("is-hidden", !show);
  el.finalReportCount.textContent = `${rows.length} name${rows.length === 1 ? "" : "s"}`;
  el.finalReportText.textContent = show ? savedDecisionReportText() : "";
  [el.finalReportCopyBtn, el.finalReportCleanBtn, el.finalReportDownloadCleanBtn, el.finalReportDownloadBtn, el.finalReportPriceBtn, el.finalReportShareBtn].filter(Boolean).forEach(button => { button.disabled = !show; });
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadSavedDecisionReport() {
  const rows = savedDecisionRows();
  if (rows.length < 2) {
    setStatus("Save at least two finalists before downloading a final report.");
    return;
  }
  downloadTextFile(`domain-shortlist-full-report-${new Date().toISOString().slice(0, 10)}.txt`, savedDecisionReportText());
  setStatus("Downloaded full decision report.");
  trackEvent("saved_decision_report_downloaded", { saved_count: rows.length });
}

function downloadCleanReport() {
  const hasSaved = savedDecisionRows().length > 0;
  const hasPicks = topPickRows().length > 0;
  if (!hasSaved && !hasPicks) {
    setStatus("No clean report to download yet. Paste a list and click Check my list first.");
    return;
  }
  downloadTextFile(`domain-shortlist-clean-report-${new Date().toISOString().slice(0, 10)}.txt`, savedCleanReportText());
  setStatus("Downloaded clean report.");
  trackEvent("clean_report_downloaded", { saved_count: savedShortlist.size, top_pick_count: topPickRows().length });
}

function launchInputsNeededText() {
  return [
    `${PUBLIC_SITE_NAME} launch inputs needed:`,
    "",
    "1. Final public site name and one-sentence tagline. Current placeholder: " + PUBLIC_SITE_NAME + " — " + PUBLIC_SITE_TAGLINE,
    "2. Final custom domain name. Current placeholder URL: " + PUBLIC_SITE_URL,
    "3. DNS/registrar access or screenshots for the domain settings.",
    "4. Preferred registrar order for price-check buttons.",
    "5. Affiliate link templates or confirmation to keep direct registrar links only.",
    "6. Support email or feedback destination.",
    "7. Analytics choice: disabled, privacy-friendly analytics, or Google tag.",
    "8. Final approval of privacy, affiliate disclosure, and terms pages.",
    "9. Optional: brand color, logo, or social preview preference."
  ].join("\n");
}

function copyLaunchNeedsList() {
  copyText(launchInputsNeededText(), "launch needs list");
  trackEvent("launch_needs_copied");
}

function renderSavedComparison() {
  if (!el.savedDecisionPanel || !el.savedDecisionContent || !el.savedDecisionCount) return;
  const rows = savedDecisionRows();
  if (rows.length < 2) {
    el.savedDecisionPanel.classList.add("is-hidden");
    el.savedDecisionCount.textContent = `${rows.length} compared`;
    el.savedDecisionContent.innerHTML = "";
    return;
  }
  const best = rows[0];
  const backup = rows.find(row => row.normalized_domain !== best.normalized_domain && effectiveSuffix(row.normalized_domain || "") !== "com") || rows[1];
  el.savedDecisionPanel.classList.remove("is-hidden");
  el.savedDecisionCount.textContent = `${rows.length} compared`;
  const tableRows = rows.map(row => {
    const domain = row.normalized_domain || "";
    const lookupUrl = resultRegistrarUrl(row);
    return `<tr>
      <td><strong>${escapeHtml(domain)}</strong>${isSavedWinner(domain) ? `<span class="winner-inline">Winner</span>` : ""}<span>${escapeHtml(row.score_label || "")}</span></td>
      <td>${escapeHtml(bestUseForRow(row))}</td>
      <td>${escapeHtml(strengthForRow(row))}</td>
      <td>${escapeHtml(watchOutForRow(row))}</td>
      <td>${lookupUrl ? `<a class="link-pill" href="${escapeAttr(lookupUrl)}" target="_blank" rel="${escapeAttr(registrarLinkRel(selectedRegistrarKey(), result.normalized_domain))}">Check registrar</a>` : ""}</td>
      <td>${isSavedWinner(domain) ? "Winner · " : ""}${isSavedChecked(domain) ? "✓ Checked" : "Not checked"}</td>
    </tr>`;
  }).join("");
  el.savedDecisionContent.innerHTML = `
    <div class="saved-decision-summary">
      <div><span>Best overall</span><strong>${escapeHtml(best.normalized_domain || "")}</strong></div>
      <div><span>Best backup</span><strong>${escapeHtml(backup?.normalized_domain || "")}</strong></div>
    </div>
    <div class="saved-decision-table-wrap">
      <table class="saved-decision-table">
        <thead><tr><th>Domain</th><th>Best for</th><th>Strength</th><th>Watch out</th><th>Next</th><th>Status</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
    <div class="decision-report-preview">
      <strong>Decision report ready</strong>
      <span>The final report below summarizes the recommendation, watch-outs, and next steps.</span>
    </div>
    <p class="muted saved-decision-note">Use this table to narrow finalists, then let the registrar confirm final availability, premium status, and price.</p>`;
}

function renderSavedShortlist() {
  if (!el.savedShortlistItems || !el.savedShortlistCount) return;
  document.body.classList.toggle("has-saved", savedShortlist.size > 0);
  const rows = savedShortlistRows();
  const checkedCount = savedCheckedCount();
  const uncheckedRows = savedUncheckedRows(rows);
  const visibleRows = savedShowUncheckedOnly ? uncheckedRows : rows;
  const hasRows = rows.length > 0;
  const leftCount = Math.max(0, rows.length - checkedCount);
  el.savedShortlistCount.textContent = hasRows ? `${rows.length} saved · ${checkedCount} checked · ${leftCount} left` : "0 saved";
  el.savedShortlistCount.setAttribute("aria-label", hasRows ? `${rows.length} saved finalists, ${checkedCount} checked, ${leftCount} left to check` : "No saved finalists yet");
  if (el.savedCheckedCount) {
    el.savedCheckedCount.textContent = `${leftCount} left`;
    el.savedCheckedCount.classList.add("is-hidden");
    el.savedCheckedCount.setAttribute("aria-label", `${leftCount} saved finalist${leftCount === 1 ? "" : "s"} left to check`);
  }
  if (el.savedFinishHint && el.savedFinishText) {
    const showFinish = hasRows;
    el.savedFinishHint.classList.toggle("is-hidden", !showFinish);
    el.savedFinishHint.classList.toggle("is-complete", hasRows && leftCount === 0);
    el.savedFinishText.textContent = hasRows
      ? (leftCount === 0 ? "All saved finalists checked." : `${leftCount} left to check.`)
      : "";
  }
  if (el.topSavedCountBadge) {
    el.topSavedCountBadge.textContent = `${rows.length} saved`;
    el.topSavedCountBadge.classList.toggle("is-hidden", rows.length === 0);
    el.topSavedCountBadge.setAttribute("aria-label", `${rows.length} saved finalist${rows.length === 1 ? "" : "s"}`);
  }
  if (el.savedWinnerHint && el.savedWinnerHintText) {
    const text = winnerCheckedStatusText();
    const checked = savedWinner && isSavedChecked(savedWinner);
    el.savedWinnerHint.classList.toggle("is-hidden", !text);
    el.savedWinnerHint.classList.toggle("is-complete", Boolean(text && checked));
    el.savedWinnerHintText.textContent = text;
  }
  if (el.savedDoneSummary) {
    el.savedDoneSummary.classList.toggle("is-hidden", !hasRows);
    if (hasRows) {
      const plural = rows.length === 1 ? "finalist" : "finalists";
      const checkedPhrase = checkedCount > 0 ? `${checkedCount} checked` : "none checked yet";
      const winner = savedWinnerRow();
      const winnerText = winner ? ` Best current choice: ${winner.normalized_domain}.` : "";
      const doneLead = winnerDoneShown ? "You are done for now." : `You saved ${rows.length} ${plural}.`;
      el.savedDoneSummary.innerHTML = `<strong>${escapeHtml(doneLead)}</strong><span>${escapeHtml(`Next: confirm price, spelling, and availability at the registrar. ${checkedPhrase}.${winnerText}`)}</span>`;
    } else {
      el.savedDoneSummary.innerHTML = "";
    }
  }
  if (el.savedReadyCard) {
    el.savedReadyCard.classList.toggle("is-hidden", !hasRows);
    if (hasRows) {
      const plural = rows.length === 1 ? "finalist" : "finalists";
      const winner = savedWinnerRow();
      const bestText = winner ? `Best current choice: ${winner.normalized_domain}. ` : "";
      if (el.savedReadyTitle) el.savedReadyTitle.textContent = `You saved ${rows.length} ${plural}.`;
      if (el.savedReadyText) el.savedReadyText.textContent = `${bestText}Next: check saved prices, then confirm spelling and availability at the registrar.`;
    }
  }
  // saved_progress_summary_updated
  if (!hasRows) savedShowUncheckedOnly = false;
  if (el.savedShortlistEmpty) el.savedShortlistEmpty.classList.toggle("is-hidden", hasRows);
  if (hasRows && savedShowUncheckedOnly && !visibleRows.length) {
    el.savedShortlistItems.innerHTML = `<div class="saved-empty saved-filter-empty"><strong>All saved finalists are checked.</strong><span>Use Show all saved to review everything again.</span></div>`;
  } else {
    el.savedShortlistItems.innerHTML = visibleRows.slice(0, 12).map(savedShortlistItemHtml).join("");
  }
  const disabled = !hasRows;
  [el.savedCheckPriceBtn, el.savedReportBtn, el.savedCopyBtn, el.savedCopyWinnerBtn, el.savedOpenWinnerBtn, el.savedCopyWinnerLinkBtn, el.savedCopyWinnerReportBtn, el.savedCopyLinksBtn, el.savedViewOnlyBtn, el.savedExportBtn, el.savedClearBtn].filter(Boolean).forEach(button => { button.disabled = disabled; });
  const winnerReady = isWinnerReady();
  if (!winnerReady) winnerDoneShown = false;
  if (el.savedDoneBtn) {
    el.savedDoneBtn.disabled = !winnerReady;
    el.savedDoneBtn.textContent = "Done for now";
    el.savedDoneBtn.classList.toggle("is-hidden", !winnerReady);
  }
  if (el.savedNewSearchAfterDoneBtn) {
    el.savedNewSearchAfterDoneBtn.disabled = !winnerDoneShown;
    el.savedNewSearchAfterDoneBtn.classList.toggle("is-hidden", !winnerDoneShown);
  }
  if (el.savedCopyUncheckedLinksBtn) el.savedCopyUncheckedLinksBtn.disabled = uncheckedRows.length === 0;
  if (el.savedCopyUncheckedNamesBtn) el.savedCopyUncheckedNamesBtn.disabled = uncheckedRows.length === 0;
  if (el.savedOpenUncheckedBtn) el.savedOpenUncheckedBtn.disabled = uncheckedRows.length === 0;
  if (el.savedOpenRemainingBtn) el.savedOpenRemainingBtn.disabled = uncheckedRows.length === 0;
  if (el.savedShowUncheckedBtn) {
    el.savedShowUncheckedBtn.disabled = disabled;
    el.savedShowUncheckedBtn.textContent = savedShowUncheckedOnly ? "Show all saved" : "Show unchecked only";
    el.savedShowUncheckedBtn.setAttribute("aria-pressed", savedShowUncheckedOnly ? "true" : "false");
  }
  if (el.savedClearNotesBtn) el.savedClearNotesBtn.disabled = savedNotesCount() === 0;
  if (el.savedClearCheckedBtn) el.savedClearCheckedBtn.disabled = checkedCount === 0;
  if (el.savedClearWinnerBtn) el.savedClearWinnerBtn.disabled = !savedWinner;
  if (el.savedClearCompletedBtn) {
    const completedClearCount = rows.filter(row => row && row.normalized_domain && isSavedChecked(row.normalized_domain) && !isSavedWinner(row.normalized_domain)).length;
    el.savedClearCompletedBtn.disabled = completedClearCount === 0;
  }
  renderSavedComparison();
  renderFinalReport();
  updateReturnUserPanel();
  updateSimpleOnboarding();
  renderArchiveTools();
}

function openSavedShortlistPrices() {
  const rows = savedShortlistRows();
  if (!rows.length) {
    setStatus("Save domains first, then check prices for your saved shortlist.");
    return;
  }
  openLinks(rows, "saved shortlist", { forceConfirm: rows.length > 1 });
  trackEvent("saved_shortlist_price_clicked", { saved_count: rows.length });
}

function copySavedShortlist() {
  const rows = savedShortlistRows();
  if (!rows.length) {
    setStatus("No saved domains to copy yet.");
    return;
  }
  copyText(rows.map(row => row.normalized_domain).join("\n"), "finalists");
  trackEvent("saved_shortlist_copied", { saved_count: rows.length });
}

function copySavedWithLinks() {
  const rows = savedShortlistRows();
  if (!rows.length) {
    setStatus("No saved domains to copy yet.");
    return;
  }
  const lines = ["Saved domain finalists:", ""];
  rows.forEach((row, index) => {
    const domain = row.normalized_domain || "";
    const link = resultRegistrarUrl(row);
    lines.push(`${index + 1}. ${domain}${isSavedChecked(domain) ? " [checked]" : ""}${link ? ` — ${link}` : ""}`);
  });
  lines.push("", "Reminder: confirm final availability, premium price, renewal cost, spelling, and trademark risk before buying.");
  copyText(lines.join("\n"), "saved finalists with links");
  trackEvent("saved_with_links_copied", { saved_count: rows.length });
}

function copyUncheckedSavedLinks() {
  const rows = savedUncheckedRows();
  if (!rows.length) {
    setStatus("No unchecked saved finalists to copy.");
    return;
  }
  const lines = rows.map(row => resultRegistrarUrl(row)).filter(Boolean);
  if (!lines.length) {
    setStatus("No price-check links found for unchecked saved finalists.");
    return;
  }
  copyText(lines.join("\n"), "unchecked saved links");
  trackEvent("unchecked_saved_links_copied", { unchecked_count: rows.length, link_count: lines.length });
}

function copyUncheckedSavedNames() {
  const rows = savedUncheckedRows();
  if (!rows.length) {
    setStatus("No unchecked saved finalists to copy.");
    return;
  }
  copyText(rows.map(row => row.normalized_domain).filter(Boolean).join("\n"), "unchecked saved names");
  trackEvent("unchecked_saved_names_copied", { unchecked_count: rows.length });
}

function openUncheckedSavedLinks() {
  const rows = savedUncheckedRows();
  if (!rows.length) {
    setStatus("No unchecked saved finalists to open.");
    return;
  }
  openLinks(rows, "unchecked saved", { forceConfirm: rows.length > 1 });
  trackEvent("unchecked_saved_links_opened", { unchecked_count: rows.length });
}

function clearSavedCheckedMarks() {
  const count = savedCheckedCount();
  if (!count) {
    setStatus("No checked marks to clear.");
    return;
  }
  if (!confirm(`Clear ${count} checked mark${count === 1 ? "" : "s"}? Saved domains and notes will stay.`)) return;
  savedChecked.clear();
  savedShowUncheckedOnly = false;
  saveSavedCheckedData();
  saveState();
  renderSavedShortlist();
  renderResults();
  setStatus(`Cleared ${count} checked mark${count === 1 ? "" : "s"}.`);
  trackEvent("saved_checked_marks_cleared", { checked_count: count });
}

function clearCompletedCheckedFinalists() {
  const removable = savedShortlistRows()
    .map(row => normalizeSavedDomain(row.normalized_domain))
    .filter(domain => domain && isSavedChecked(domain) && !isSavedWinner(domain));
  if (!removable.length) {
    setStatus("No completed checked finalists to clear. The winner, if any, will be kept.");
    return;
  }
  if (!confirm(`Remove ${removable.length} checked finalist${removable.length === 1 ? "" : "s"} and keep the winner? Notes for removed names will also be cleared.`)) return;
  removable.forEach(domain => {
    savedShortlist.delete(domain);
    favorites.delete(domain);
    savedChecked.delete(domain);
    delete savedNotes[domain];
    compareSet.delete(domain);
  });
  savedShowUncheckedOnly = false;
  saveSavedShortlistData();
  saveSavedCheckedData();
  saveSavedNotesData();
  saveState();
  renderSavedShortlist();
  renderResults();
  setStatus(`Removed ${removable.length} completed checked finalist${removable.length === 1 ? "" : "s"}. Winner stayed saved.`);
  trackEvent("completed_checked_finalists_cleared", { removed_count: removable.length });
}

function viewSavedOnlyResults() {
  if (!savedShortlist.size) {
    setStatus("Save a few finalists first, then use View saved only.");
    return;
  }
  resultQuickPreset = "saved";
  if (el.filterStatus) el.filterStatus.value = "all";
  if (el.sortSelect) el.sortSelect.value = "score_desc";
  if (el.filterSearch) el.filterSearch.value = "";
  resetRenderLimit();
  document.body.classList.add("show-all-results");
  renderResults();
  document.querySelector(".results-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(`Showing ${savedShortlist.size} saved finalist${savedShortlist.size === 1 ? "" : "s"}.`);
  trackEvent("saved_only_view_clicked", { saved_count: savedShortlist.size });
  saveState();
}

function savedNotesCount() {
  return [...savedShortlist].filter(domain => savedNoteFor(domain)).length;
}

function clearSavedNotes() {
  const count = savedNotesCount();
  if (!count) {
    setStatus("No saved notes to clear.");
    return;
  }
  if (!confirm(`Clear ${count} saved note${count === 1 ? "" : "s"}? Your saved domains will stay.`)) return;
  for (const domain of savedShortlist) delete savedNotes[normalizeSavedDomain(domain)];
  saveSavedNotesData();
  saveState();
  renderSavedShortlist();
  setStatus(`Cleared ${count} saved note${count === 1 ? "" : "s"}.`);
  trackEvent("saved_notes_cleared", { note_count: count });
}

function clearSavedShortlist() {
  if (!savedShortlist.size) return;
  if (!confirm("Clear your saved shortlist from this browser? Current results will stay on screen.")) return;
  savedShortlist.clear();
  favorites.clear();
  savedNotes = {};
  savedChecked.clear();
  savedWinner = "";
  savedShowUncheckedOnly = false;
  saveSavedShortlistData();
  saveSavedNotesData();
  saveSavedCheckedData();
  saveSavedWinnerData();
  saveState();
  renderResults();
  setStatus("Saved names cleared.");
  trackEvent("saved_shortlist_cleared");
}

function recentRunSummary(rows) {
  const cleaned = rows.filter(Boolean);
  return {
    checked: cleaned.length,
    worth: cleaned.filter(isWorthCheckingRow).length,
    strong: cleaned.filter(isStrongNameRow).length,
    saved: cleaned.filter(row => savedShortlist.has(row.normalized_domain)).length,
    topPicks: Math.min(topPickRows().length, topPickLimit())
  };
}

function recordRecentRun() {
  const cleaned = applyBatchMetrics(results.filter(Boolean));
  if (!cleaned.length) return;
  const topRows = topPickRows().slice(0, RECENT_RUN_MAX_ROWS);
  const snapshotRows = topRows.length ? topRows : cleaned.slice(0, RECENT_RUN_MAX_ROWS);
  const run = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    ui_version: UI_VERSION,
    scoring_version: SCORING_VERSION,
    registrar: selectedRegistrarKey(),
    registrar_label: selectedRegistrarLabel(),
    score_only: Boolean(el.scoreOnlyInput?.checked),
    original_count: cleaned.length,
    snapshot_note: cleaned.length > snapshotRows.length ? `Saved best ${snapshotRows.length} of ${cleaned.length} rows.` : `Saved ${snapshotRows.length} rows.`,
    summary: recentRunSummary(cleaned),
    domains_preview: snapshotRows.slice(0, 5).map(row => row.normalized_domain),
    rows: snapshotRows
  };
  recentRuns = [run, ...recentRuns.filter(item => item && item.id !== run.id)].slice(0, RECENT_RUN_LIMIT);
  saveRecentRunsData();
  renderRecentRuns();
}

function formatRecentRunDate(value) {
  try {
    return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "Recent";
  }
}

function renderRecentRuns() {
  if (!el.recentRunsItems || !el.recentRunsCount) return;
  const runs = recentRuns.filter(Boolean).slice(0, RECENT_RUN_LIMIT);
  el.recentRunsCount.textContent = `${runs.length} recent`;
  if (el.recentRunsEmpty) el.recentRunsEmpty.classList.toggle("is-hidden", runs.length > 0);
  if (el.recentRunsClearBtn) el.recentRunsClearBtn.disabled = !runs.length;
  el.recentRunsItems.innerHTML = runs.map(run => {
    const summary = run.summary || {};
    const preview = Array.isArray(run.domains_preview) && run.domains_preview.length ? run.domains_preview.join(", ") : "No preview saved";
    return `<article class="recent-run-card" data-run-id="${escapeAttr(run.id)}">
      <div class="recent-run-head">
        <strong>${escapeHtml(formatRecentRunDate(run.created_at))}</strong>
        <span>${escapeHtml(run.score_only ? "Fast scoring" : "Availability check")}</span>
      </div>
      <div class="recent-run-stats">
        <span>${escapeHtml(run.original_count || summary.checked || 0)} checked</span>
        <span>${escapeHtml(summary.worth || 0)} worth checking</span>
        <span>${escapeHtml(summary.strong || 0)} strong</span>
        <span>${escapeHtml(run.registrar_label || selectedRegistrarLabel())}</span>
      </div>
      <p class="muted">${escapeHtml(run.snapshot_note || "Saved a small local snapshot.")}</p>
      <p class="recent-run-preview">${escapeHtml(preview)}</p>
      <div class="recent-run-actions">
        <button type="button" class="ghost" data-restore-run="${escapeAttr(run.id)}">Restore snapshot</button>
        <button type="button" class="ghost" data-delete-run="${escapeAttr(run.id)}">Delete</button>
      </div>
    </article>`;
  }).join("");
  updateReturnUserPanel();
}

function restoreRecentRun(runId) {
  const run = recentRuns.find(item => item && item.id === runId);
  if (!run) return;
  results = applyBatchMetrics(Array.isArray(run.rows) ? run.rows : []);
  resultQuickPreset = "all";
  resultBadgeFilter = "all";
  if (el.filterStatus) el.filterStatus.value = "all";
  if (el.sortSelect) el.sortSelect.value = "score_desc";
  if (el.registrarInput && run.registrar && REGISTRARS[run.registrar]) el.registrarInput.value = run.registrar;
  resetRenderLimit();
  renderResults();
  document.body.classList.add("show-all-results");
  document.getElementById("topPicksHeading")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(`Restored a recent shortlist snapshot with ${results.length} saved result${results.length === 1 ? "" : "s"}.`);
  trackEvent("recent_run_restored", { restored_count: results.length });
  saveState();
}

function deleteRecentRun(runId) {
  recentRuns = recentRuns.filter(item => item && item.id !== runId);
  saveRecentRunsData();
  renderRecentRuns();
  setStatus("Recent shortlist removed.");
  trackEvent("recent_run_deleted");
}

function clearRecentRuns() {
  if (!recentRuns.length) return;
  if (!confirm("Clear recent shortlist snapshots from this browser?")) return;
  recentRuns = [];
  saveRecentRunsData();
  renderRecentRuns();
  setStatus("Recent shortlist snapshots cleared.");
  trackEvent("recent_runs_cleared");
}

function updateAllResultsDensity() {
  document.body.classList.toggle("results-comfortable", Boolean(allResultsComfortable));
  if (!el.allResultsDensityBtn) return;
  el.allResultsDensityBtn.textContent = allResultsComfortable ? "Compact rows" : "Roomier rows";
  el.allResultsDensityBtn.setAttribute("aria-pressed", allResultsComfortable ? "true" : "false");
}


function isAdvancedModeActive() {
  return Boolean(el.advancedModeInput && el.advancedModeInput.checked);
}

function hasManualResultFilters() {
  return Boolean(String(el.filterSearch?.value || "").trim())
    || Boolean(String(el.filterTld?.value || "").trim())
    || Boolean(String(el.filterMaxLen?.value || "").trim())
    || Boolean(el.filterNoHyphen?.checked)
    || Boolean(el.filterNoNumbers?.checked);
}

function canCollapseTakenResults() {
  if (isAdvancedModeActive()) return false;
  if (!results.filter(Boolean).some(row => row && row.available === false)) return false;
  if (resultQuickPreset !== "all") return false;
  if (el.filterStatus && el.filterStatus.value !== "all") return false;
  if (hasManualResultFilters()) return false;
  return true;
}

function takenResultsAreCollapsed() {
  return canCollapseTakenResults() && !showTakenResults;
}

function updateTakenToggle(rowsShown = null) {
  const takenCount = results.filter(row => row && row.available === false).length;
  const canCollapse = canCollapseTakenResults();
  const collapsed = canCollapse && !showTakenResults;
  if (el.takenToggleBtn) {
    el.takenToggleBtn.classList.toggle("is-hidden", !canCollapse);
    el.takenToggleBtn.disabled = !takenCount;
    el.takenToggleBtn.textContent = showTakenResults ? `Hide taken (${takenCount.toLocaleString()})` : `Show taken names (${takenCount.toLocaleString()})`;
    el.takenToggleBtn.title = "Taken names are only hidden to reduce clutter. Nothing is deleted.";
    el.takenToggleBtn.setAttribute("aria-pressed", showTakenResults ? "true" : "false");
  }
  if (el.takenCollapseNote) {
    el.takenCollapseNote.classList.toggle("is-hidden", !collapsed);
    el.takenCollapseNote.textContent = collapsed
      ? `${takenCount.toLocaleString()} taken name${takenCount === 1 ? " is" : "s are"} hidden only to reduce clutter. Nothing was deleted.`
      : "";
  }
  if (!el.allResultsHelper) return;
  if (collapsed) {
    const shown = Number.isFinite(rowsShown) ? rowsShown.toLocaleString() : "";
    el.allResultsHelper.textContent = `${shown ? `${shown} active result${rowsShown === 1 ? "" : "s"} shown. ` : ""}Taken names are hidden for clarity. Click Show taken names if you want the complete list.`;
    return;
  }
  if (hasActiveAllResultFilters()) {
    el.allResultsHelper.textContent = "Filtered results are shown. Use Show everything to return to the full checked list.";
  } else {
    el.allResultsHelper.textContent = "All checked names are here. Filters only hide rows temporarily; nothing is deleted.";
  }
}

function toggleTakenResults() {
  showTakenResults = !showTakenResults;
  resetRenderLimit();
  renderResults();
  saveState();
  setStatus(showTakenResults ? "Taken names shown. Nothing changed except the view." : "Taken names hidden. Nothing was deleted.");
  trackEvent("taken_results_toggled", { shown: showTakenResults });
}

function updateAllResultsSortPills() {
  if (!el.allResultsSortPills || !el.sortSelect) return;
  const current = el.sortSelect.value || "score_desc";
  el.allResultsSortPills.querySelectorAll("button[data-result-sort]").forEach(button => {
    const active = button.getAttribute("data-result-sort") === current;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function applyAllResultsSort(value) {
  if (!el.sortSelect) return;
  const allowed = new Set(["score_desc", "domain_asc", "length_asc"]);
  if (!allowed.has(value)) return;
  el.sortSelect.value = value;
  resetRenderLimit();
  renderResults();
  saveState();
  const labels = { score_desc: "Best results first", domain_asc: "A–Z sorting", length_asc: "Shortest names first" };
  setStatus(`${labels[value] || "Sort"} applied.`);
  trackEvent("all_results_sort_pill_clicked", { sort: value });
}

function toggleAllResultsDensity() {
  allResultsComfortable = !allResultsComfortable;
  updateAllResultsDensity();
  saveState();
  setStatus(allResultsComfortable ? "Roomier result rows shown." : "Compact result rows shown.");
  trackEvent("all_results_density_toggled", { density: allResultsComfortable ? "comfortable" : "compact" });
}

function setResultCardFeedback(domain, message, type = "saved") {
  domain = normalizeSavedDomain(domain);
  if (!domain) return;
  if (resultCardFeedback.timer) clearTimeout(resultCardFeedback.timer);
  resultCardFeedback = { domain, message, type, expires: Date.now() + 1300, timer: null };
  resultCardFeedback.timer = setTimeout(() => {
    if (resultCardFeedback.domain === domain) {
      resultCardFeedback = { domain: "", message: "", type: "", expires: 0, timer: null };
      if (results.length) renderResults();
    }
  }, 1350);
}

function worthCheckingReason(row) {
  if (!isWorthCheckingRow(row)) return "";
  const domain = row.normalized_domain || "";
  const score = Number(row.domain_score || 0);
  const suffix = effectiveSuffix(domain);
  if (suffix === "com" && score >= 80) return "Strong .com with a high quality score.";
  if (row.available === true && score >= 80) return "Looks available and has a high quality score.";
  if (row.available === true) return "Looks available and passes the quality checks.";
  if (score >= 80) return "High quality score; worth a registrar price check.";
  return publicScoreExplanation(row) || "Strong enough to compare before deciding.";
}

function resultRowBadges(result) {
  const domain = result?.normalized_domain || "";
  const suffix = result?.effective_tld || effectiveSuffix(domain);
  const nameLength = Number(result?.name_length || secondLevelName(domain).length || 0);
  const saved = favorites.has(domain) || savedShortlist.has(normalizeSavedDomain(domain));
  const badges = [];
  if (suffix) badges.push({ label: `.${suffix}`, kind: suffix === "com" ? "com" : "tld" });
  if (nameLength > 0 && nameLength <= 12) badges.push({ label: "Short", kind: "short" });
  if (saved) badges.push({ label: "Saved", kind: "saved" });
  if (needsReviewRow(result)) badges.push({ label: "Needs review", kind: "review" });
  if (isStrongNameRow(result)) badges.push({ label: "Strong", kind: "strong" });
  if (result?.available === false) badges.push({ label: "Taken", kind: "taken" });
  return badges.slice(0, 5);
}

function resultRowBadgesHtml(result) {
  const badges = resultRowBadges(result);
  if (!badges.length) return "";
  return `<div class="result-row-badges" aria-label="Quick labels">${badges.map(badge => {
    const kind = normalizeResultBadgeFilter(badge.kind);
    if (kind === "all") return `<span class="result-row-badge badge-${escapeAttr(badge.kind)}">${escapeHtml(badge.label)}</span>`;
    const active = kind === resultBadgeFilter;
    return `<button type="button" class="result-row-badge badge-${escapeAttr(badge.kind)}${active ? " is-active" : ""}" data-result-badge-filter="${escapeAttr(kind)}" title="Filter All Results to ${escapeAttr(badge.label)}">${escapeHtml(badge.label)}</button>`;
  }).join("")}</div>`;
}

function resultCardHtml(result) {
  const cls = classForStatus(result.availability_status);
  const domain = result.normalized_domain || "";
  const favorite = favorites.has(domain) || savedShortlist.has(normalizeSavedDomain(domain));
  const lookupUrl = resultRegistrarUrl(result);
  const linkHtml = lookupUrl
    ? `<a class="top-pick-cta secondary-registrar-cta" href="${escapeAttr(lookupUrl)}" target="_blank" rel="${escapeAttr(registrarLinkRel(selectedRegistrarKey(), domain))}">Check registrar</a>`
    : "";
  const statusLabel = availabilityText(result);
  const scoreLabel = result.score_label || "";
  const reason = publicScoreExplanation(result);
  const worthReason = worthCheckingReason(result);
  const tld = result.effective_tld || effectiveSuffix(domain);
  const feedbackHtml = resultCardFeedback.domain === domain && Date.now() < resultCardFeedback.expires
    ? `<span class="result-card-feedback ${escapeAttr(resultCardFeedback.type)}">${escapeHtml(resultCardFeedback.message)}</span>`
    : "";
  const badgesHtml = resultRowBadgesHtml(result);
  return `<article class="result-card compact-result-row ${cls} score-${scoreClass(result.domain_score)}" data-domain="${escapeAttr(domain)}">
    <div class="result-main">
      <button type="button" class="star-button ${favorite ? "is-favorite" : ""}" data-favorite="${escapeAttr(domain)}" title="${favorite ? "Remove from saved" : "Save"}">${favorite ? "★" : "☆"}</button>
      <div class="result-name-block">
        <strong>${escapeHtml(domain)}</strong>
        <span>${escapeHtml(reason)}</span>
        ${worthReason ? `<div class="result-worth-reason"><strong>Why:</strong> ${escapeHtml(worthReason)}</div>` : ""}
        ${badgesHtml}
      </div>
    </div>
    <div class="result-status-line">
      <span class="score-badge score-${scoreClass(result.domain_score)}">${escapeHtml(result.domain_score ?? "")}</span>
      <span>${escapeHtml(scoreLabel)}</span>
      <span>${escapeHtml(statusLabel)}</span>
      <span>.${escapeHtml(tld)}</span>
      ${feedbackHtml}
    </div>
    <details class="result-inline-details">
      <summary>Why this result?</summary>
      <div class="result-inline-details-grid">
        <span><strong>Status</strong>${escapeHtml(statusLabel)}</span>
        <span><strong>Score</strong>${escapeHtml(result.domain_score ?? "")} · ${escapeHtml(scoreLabel)}</span>
        <span><strong>Length</strong>${escapeHtml(result.name_length || secondLevelName(domain).length || "")}</span>
        <span><strong>Why</strong>${escapeHtml(result.score_explanation || reason)}</span>
        <span class="wide"><strong>Notes</strong>${escapeHtml(result.notes || result.error || result.score_notes || "No extra notes.")}</span>
      </div>
    </details>
    <div class="result-card-actions compact-actions">
      ${linkHtml}
      <button type="button" class="ghost" data-detail-domain="${escapeAttr(domain)}">Details</button>
    </div>
    ${lookupUrl ? `<p class="registrar-disclosure compact-disclosure">${escapeHtml(registrarLinkDisclosureText())}</p>` : ""}
  </article>`;
}

function updateUndoSaveVisibleButton() {
  if (!el.undoSaveVisibleBtn) return;
  const count = lastBulkSaveChanges.length;
  el.undoSaveVisibleBtn.classList.toggle("is-hidden", !count);
  el.undoSaveVisibleBtn.disabled = !count;
  el.undoSaveVisibleBtn.textContent = count ? `Undo save (${count.toLocaleString()})` : "Undo save";
  el.undoSaveVisibleBtn.title = "Only removes names added by the last bulk save.";
}

function saveWorthCheckingRows(rows, eventName = "worth_checking_saved") {
  rows = rows.filter(Boolean).filter(isWorthCheckingRow);
  if (!rows.length) {
    setStatus("No visible good names to save. Clear filters or reset the view.");
    return;
  }
  let added = 0;
  let lastDomain = "";
  const newlyAdded = [];
  for (const row of rows) {
    const domain = normalizeSavedDomain(row.normalized_domain);
    if (!domain) continue;
    lastDomain = domain;
    const wasSaved = savedShortlist.has(domain);
    const wasFavorite = favorites.has(domain);
    if (!wasSaved) {
      added += 1;
      newlyAdded.push({ domain, wasFavorite });
    }
    savedShortlist.add(domain);
    favorites.add(domain);
  }
  lastBulkSaveChanges = newlyAdded;
  saveSavedShortlistData();
  refreshResultsScoring();
  if (lastDomain) setResultCardFeedback(lastDomain, added ? "Saved" : "Already saved", "saved");
  renderResults();
  saveState();
  setStatus(added ? `Saved ${added} good name${added === 1 ? "" : "s"}. Use Undo save if that was accidental.` : "The visible good names are already saved.");
  trackEvent(eventName, { added_count: added, total_worth: rows.length });
}

function undoLastBulkSave() {
  const changes = lastBulkSaveChanges.filter(item => item && item.domain);
  if (!changes.length) {
    setStatus("No recent bulk save to undo.");
    return;
  }
  let removed = 0;
  for (const item of changes) {
    const domain = normalizeSavedDomain(item.domain);
    if (!domain) continue;
    if (savedShortlist.delete(domain)) removed += 1;
    if (!item.wasFavorite) favorites.delete(domain);
    compareSet.delete(domain);
  }
  lastBulkSaveChanges = [];
  saveSavedShortlistData();
  refreshResultsScoring();
  renderResults();
  saveState();
  setStatus(removed ? `Undid save for ${removed} domain${removed === 1 ? "" : "s"}.` : "Nothing changed. Those domains were already removed.");
  trackEvent("bulk_save_undone", { removed_count: removed });
}

function saveAllWorthCheckingResults() {
  saveWorthCheckingRows(results.filter(Boolean).filter(isWorthCheckingRow), "all_worth_checking_saved");
}

function saveVisibleWorthCheckingResults() {
  saveWorthCheckingRows(displayedResults().filter(isWorthCheckingRow), "visible_worth_checking_saved");
}

function updateSaveVisibleWorthCheckingButton() {
  if (!el.saveVisibleWorthCheckingBtn) return;
  const count = displayedResults().filter(isWorthCheckingRow).length;
  el.saveVisibleWorthCheckingBtn.disabled = !count;
  el.saveVisibleWorthCheckingBtn.textContent = count ? `Save good names (${count.toLocaleString()})` : "Save good names";
  el.saveVisibleWorthCheckingBtn.title = "Marks visible good names as saved finalists. You can undo the last bulk save.";
  updateUndoSaveVisibleButton();
}

function activeCleanupPieces() {
  const pieces = [];
  if (savedOnlyFilterActive()) pieces.push("saved names only");
  if (takenResultsAreCollapsed()) pieces.push("taken names hidden");
  if (hideWeakPicks) pieces.push("weak names hidden");
  if (resultBadgeFilter !== "all" && resultBadgeFilter !== "saved") pieces.push(`${resultBadgeFilterLabel(resultBadgeFilter)} badge filter`);
  return pieces;
}

function updateResultsCleanedNotice() {
  if (!el.resultsCleanedNotice || !el.resultsCleanedText) return;
  const pieces = activeCleanupPieces();
  const visible = pieces.length > 0 && results.filter(Boolean).length > 0;
  el.resultsCleanedNotice.classList.toggle("is-hidden", !visible);
  if (!visible) {
    el.resultsCleanedText.textContent = "";
    return;
  }
  el.resultsCleanedText.textContent = savedOnlyFilterActive()
    ? `Showing saved results only${pieces.length > 1 ? ` with ${pieces.filter(piece => piece !== "saved names only").join(", ")}` : ""}. Nothing was deleted.`
    : `Your view is simplified: ${pieces.join(", ")}. Nothing was deleted.`;
}

function showEverythingResults() {
  resultQuickPreset = "all";
  resultBadgeFilter = "all";
  hideWeakPicks = false;
  showTakenResults = true;
  if (el.filterStatus) el.filterStatus.value = "all";
  if (el.filterSearch) el.filterSearch.value = "";
  if (el.filterTld) el.filterTld.value = "";
  if (el.filterMaxLen) el.filterMaxLen.value = "";
  if (el.filterNoHyphen) el.filterNoHyphen.checked = false;
  if (el.filterNoNumbers) el.filterNoNumbers.checked = false;
  resetRenderLimit();
  resultsFiltersOpen = false;
  renderResults();
  saveState();
  setStatus("View reset. Every result is shown again. Nothing was deleted.");
  trackEvent("all_results_show_everything_clicked");
}

function displayedResults() {
  const status = el.filterStatus.value;
  const search = String(el.filterSearch.value || "").toLowerCase().trim();
  const tld = String(el.filterTld.value || "").toLowerCase().replace(/^\./, "").trim();
  const maxLen = Number(el.filterMaxLen.value);
  const noHyphen = el.filterNoHyphen.checked;
  const noNumbers = el.filterNoNumbers.checked;
  const sort = el.sortSelect.value;
  const topPickDomainSet = status === "top_picks" ? new Set(topPickRows().map(r => r.normalized_domain).filter(Boolean)) : null;

  let sourceRows = results.filter(Boolean);
  // During very large active checks, defer batch-rank recalculation until the run finishes.
  // Sorting/ranking thousands of rows every redraw is the biggest browser slowdown.
  if (!isChecking || sourceRows.length < 2500) sourceRows = applyBatchMetrics(sourceRows);
  let rows = sourceRows.filter(row => {
    const domain = row.normalized_domain || "";
    const sld = secondLevelName(domain).replace(/\./g, "");

    if (status === "available" && row.available !== true) return false;
    if (status === "taken" && row.available !== false) return false;
    if (status === "unknown" && !(row.available === null && row.availability_status !== "invalid_input")) return false;
    if (status === "invalid" && row.availability_status !== "invalid_input") return false;
    if (status === "favorites" && !(favorites.has(domain) || savedShortlist.has(domain))) return false;
    if (status === "top_picks" && !topPickDomainSet.has(domain)) return false;
    if (!matchesResultQuickPreset(row)) return false;
    if (!matchesResultBadgeFilter(row)) return false;
    if (hideWeakPicks && !isSimpleStrongEnoughRow(row)) return false;
    if (takenResultsAreCollapsed() && row.available === false) return false;

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
      const favDelta = Number(favorites.has(b.normalized_domain) || savedShortlist.has(b.normalized_domain)) - Number(favorites.has(a.normalized_domain) || savedShortlist.has(a.normalized_domain));
      return favDelta || availabilitySortValue(a) - availabilitySortValue(b) || Number(b.domain_score || 0) - Number(a.domain_score || 0);
    }
    // Default: available first, then best quality score, then shorter names.
    return availabilitySortValue(a) - availabilitySortValue(b)
      || Number(b.domain_score || 0) - Number(a.domain_score || 0)
      || Number(a.name_length || 999) - Number(b.name_length || 999);
  });
  if (status === "top_picks") rows = diverseTopPickSubset(rows, topPickLimit());
  return rows;
}

function renderResults() {
  lastRenderAt = Date.now();
  const hasAnyResults = results.filter(Boolean).length > 0;
  document.body.classList.toggle("has-results", hasAnyResults);
  document.body.classList.toggle("has-saved", savedShortlist.size > 0);
  updateAllResultsDensity();
  if (!hasAnyResults) document.body.classList.remove("editing-input");
  if (hasAnyResults) document.body.classList.add("show-all-results");
  const visibleRows = displayedResults();
  if (!results.length || results.every(r => !r)) {
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="13"><strong>No results yet.</strong><br />Paste names above, then click <strong>Check my list</strong>.</td></tr>';
    el.visibleCount.textContent = "0 visible";
    if (el.resultCards) el.resultCards.innerHTML = '<div class="result-card-empty">All checked names will appear here after you check your list.</div>';
    updateAllResultsSummary();
    updateResultsFiltersPanelState();
    updateHideWeakPicksButton();
    updateSaveVisibleWorthCheckingButton();
    updateResultsCleanedNotice();
    if (el.renderedCount) el.renderedCount.textContent = "0 shown";
    if (el.showMoreBtn) el.showMoreBtn.disabled = true;
    if (el.showAllRowsBtn) el.showAllRowsBtn.disabled = true;
    renderTopPickCards();
    renderCompareTray();
    renderSavedShortlist();
    renderRecentRuns();
    updatePriceLimitNote();
    updateSummary();
    updateBestNextAction();
    return;
  }

  if (!visibleRows.length) {
    updateTakenToggle(0);
    el.resultsBody.innerHTML = '<tr class="empty"><td colspan="13">No names match this filter. Reset the view?</td></tr>';
    el.visibleCount.textContent = `0 visible of ${results.filter(Boolean).length}`;
    if (el.resultCards) el.resultCards.innerHTML = `<div class="result-card-empty result-filter-empty"><strong>No results match this filter.</strong><span>Try a different filter or reset the view.</span><button type="button" class="ghost" data-empty-show-all-results>Show all results</button></div>`;
    updateAllResultsSummary();
    updateResultsFiltersPanelState();
    updateHideWeakPicksButton();
    updateSaveVisibleWorthCheckingButton();
    updateResultsCleanedNotice();
    if (el.renderedCount) el.renderedCount.textContent = "0 shown";
    if (el.showMoreBtn) el.showMoreBtn.disabled = true;
    if (el.showAllRowsBtn) el.showAllRowsBtn.disabled = true;
    renderTopPickCards();
    renderCompareTray();
    renderSavedShortlist();
    renderRecentRuns();
    updatePriceLimitNote();
    updateSummary();
    updateBestNextAction();
    return;
  }

  const totalVisibleRows = visibleRows.length;
  updateTakenToggle(totalVisibleRows);
  const renderedRows = visibleRows.slice(0, renderRowLimit);
  const rowsHtml = renderedRows.map(result => {
    const cls = classForStatus(result.availability_status);
    const availableText = result.available === true ? "True" : result.available === false ? "False" : "";
    const favorite = favorites.has(result.normalized_domain);
    const starTitle = favorite ? "Remove from saved" : "Save";
    const lookupUrl = resultRegistrarUrl(result);
    const linkHtml = lookupUrl
      ? `<a class="link-pill" href="${escapeAttr(lookupUrl)}" target="_blank" rel="${escapeAttr(registrarLinkRel(selectedRegistrarKey(), result.normalized_domain))}">Check registrar</a>`
      : "";
    return `<tr class="${cls}" data-domain="${escapeAttr(result.normalized_domain)}">
      <td><button type="button" class="star-button ${favorite ? "is-favorite" : ""}" data-favorite="${escapeAttr(result.normalized_domain)}" title="${starTitle}">${favorite ? "★" : "☆"}</button></td>
      <td><strong>${escapeHtml(result.normalized_domain)}</strong><div class="subtle">${escapeHtml(result.input || "")}</div></td>
      <td><span class="score-badge score-${scoreClass(result.domain_score)}" title="${escapeAttr(result.score_notes || "")}">${escapeHtml(result.domain_score ?? "")}</span></td>
      <td><span class="rating-pill rating-${scoreClass(result.domain_score)}">${escapeHtml(result.score_label || "")}</span></td>
      <td>${escapeHtml(result.batch_label || (result.batch_rank ? `#${result.batch_rank}` : ""))}<div class="subtle">${result.batch_percentile ? `top ${escapeHtml(result.batch_percentile)}%` : ""}</div></td>
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
  if (el.resultCards) el.resultCards.innerHTML = renderedRows.map(resultCardHtml).join("");
  updateAllResultsSummary();
  updateResultsFiltersPanelState();
  updateHideWeakPicksButton();
  updateSaveVisibleWorthCheckingButton();
  updateResultsCleanedNotice();
  const totalResults = results.filter(Boolean).length;
  el.visibleCount.textContent = `${totalVisibleRows} visible of ${totalResults}`;
  if (el.renderedCount) el.renderedCount.textContent = `Showing ${renderedRows.length.toLocaleString()} result${renderedRows.length === 1 ? "" : "s"}${renderedRows.length < totalVisibleRows ? ` of ${totalVisibleRows.toLocaleString()}` : ""}`;
  if (el.showMoreBtn) el.showMoreBtn.disabled = renderedRows.length >= totalVisibleRows;
  if (el.showAllRowsBtn) el.showAllRowsBtn.disabled = renderedRows.length >= totalVisibleRows;
  renderTopPickCards();
  renderCompareTray();
  renderSavedShortlist();
  renderRecentRuns();
  updatePriceLimitNote();
  updateSummary();
  updateBestNextAction();
}

function scoreClass(score) {
  const value = Number(score || 0);
  if (value >= 80) return "high";
  if (value >= 55) return "mid";
  return "low";
}


function getBestNextActionState() {
  const analysis = analyzeInputLines();
  const cleaned = results.filter(Boolean);
  const topRows = topPickRows();
  const compareCount = compareRows().length;
  const savedCount = savedShortlistRows().length;

  if (isChecking) {
    return {
      title: "Next best step: let this check finish",
      text: "Results are still updating. When it finishes, start with Top Picks instead of scanning every row.",
      primaryLabel: "Stop check",
      primaryAction: "stop_check",
      secondaryLabel: "View progress",
      secondaryAction: "view_status"
    };
  }

  if (compareCount > 0) {
    return {
      title: `Next best step: check ${compareCount} finalist${compareCount === 1 ? "" : "s"}`,
      text: "You have domains in comparison. Open registrar price checks for those finalists before deciding.",
      primaryLabel: "Check finalist prices",
      primaryAction: "open_compare_prices",
      secondaryLabel: "Copy comparison",
      secondaryAction: "copy_compare"
    };
  }

  if (cleaned.length > 0 && topRows.length > 0) {
    return {
      title: "Next best step: review Top Picks",
      text: `${topRows.length.toLocaleString()} top pick${topRows.length === 1 ? "" : "s"} are ready. Compare finalists or check prices at your selected registrar.`,
      primaryLabel: "Review Top Picks",
      primaryAction: "show_top_picks",
      secondaryLabel: topRows.length ? "Check price for top picks" : "Export top picks",
      secondaryAction: topRows.length ? "open_top_picks" : "export_top_picks"
    };
  }

  if (savedCount > 0 && !analysis.rawCount) {
    return {
      title: "Next best step: continue saved shortlist",
      text: `${savedCount.toLocaleString()} saved domain${savedCount === 1 ? "" : "s"} are stored in this browser. Check prices or restore a recent run.`,
      primaryLabel: "Check saved prices",
      primaryAction: "open_saved_prices",
      secondaryLabel: "View saved",
      secondaryAction: "view_saved"
    };
  }

  if (!analysis.rawCount) {
    return {
      title: "Next best step: paste or upload names",
      text: "Add domains, URLs, or a TXT/CSV file. The preview will show what will be checked before you start.",
      primaryLabel: "Paste names",
      primaryAction: "focus_input",
      secondaryLabel: "Try sample",
      secondaryAction: "load_sample"
    };
  }

  if (!analysis.uniqueValidRows.length) {
    return {
      title: "Next best step: fix the input format",
      text: "No valid domains are ready yet. Add an extension such as .com, .io, .app, or .co.",
      primaryLabel: "Review invalid lines",
      primaryAction: "review_invalid",
      secondaryLabel: "Paste names",
      secondaryAction: "focus_input"
    };
  }

  if (analysis.rawCount >= 1000 && !el.scoreOnlyInput?.checked) {
    return {
      title: "Next best step: use fast scoring first",
      text: `${analysis.rawCount.toLocaleString()} input line${analysis.rawCount === 1 ? "" : "s"} detected. Score first, then check only the strongest names at the registrar.`,
      primaryLabel: "Use fast scoring",
      primaryAction: "enable_fast_scoring",
      secondaryLabel: "Check valid domains",
      secondaryAction: "check_clean_valid"
    };
  }

  return {
    title: "Next best step: find the best domains",
    text: `${analysis.uniqueValidRows.length.toLocaleString()} valid domain${analysis.uniqueValidRows.length === 1 ? "" : "s"} ready. Duplicates and invalid lines can be skipped automatically.`,
    primaryLabel: "Find best domains",
    primaryAction: "check_clean_valid",
    secondaryLabel: analysis.issueRows.length ? "Review invalid lines" : "Copy clean list",
    secondaryAction: analysis.issueRows.length ? "review_invalid" : "copy_clean"
  };
}

function updateBestNextAction() {
  if (!el.bestNextActionPanel) return;
  const state = getBestNextActionState();
  bestNextPrimaryAction = state.primaryAction;
  bestNextSecondaryAction = state.secondaryAction;
  if (el.bestNextActionTitle) el.bestNextActionTitle.textContent = state.title;
  if (el.bestNextActionText) el.bestNextActionText.textContent = state.text;
  if (el.bestNextPrimaryBtn) {
    el.bestNextPrimaryBtn.textContent = state.primaryLabel;
    el.bestNextPrimaryBtn.disabled = false;
  }
  if (el.bestNextSecondaryBtn) {
    el.bestNextSecondaryBtn.textContent = state.secondaryLabel;
    el.bestNextSecondaryBtn.classList.toggle("is-hidden", !state.secondaryLabel);
    el.bestNextSecondaryBtn.disabled = false;
  }
}

function runBestNextAction(action) {
  switch (action) {
    case "focus_input":
      el.inputBox?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.inputBox?.focus(), 200);
      setStatus("Paste one domain per line, then use the preview to check the valid list.");
      break;
    case "load_sample":
      el.pasteDemoBtn?.click();
      break;
    case "review_invalid":
      invalidPreviewOpen = true;
      updateInputPreview();
      el.invalidReviewList?.scrollIntoView({ behavior: "smooth", block: "center" });
      break;
    case "copy_clean":
      copyCleanValidDomains();
      break;
    case "check_clean_valid":
      checkCleanValidDomains();
      break;
    case "enable_fast_scoring":
      if (el.scoreOnlyInput) el.scoreOnlyInput.checked = true;
      updateInputCount();
      saveState();
      setStatus("Fast scoring enabled. It ranks the list first and skips slow live availability checks.");
      break;
    case "show_top_picks":
      showTopPicks();
      break;
    case "open_top_picks":
      openTopPicks();
      break;
    case "export_top_picks":
      exportCsv("top_picks");
      break;
    case "open_compare_prices":
      openComparisonPriceChecks();
      break;
    case "copy_compare":
      copyComparison();
      break;
    case "open_saved_prices":
      openSavedShortlistPrices();
      break;
    case "view_saved":
      viewSavedShortlistPanel();
      break;
    case "stop_check":
      stopRequested = true;
      setStatus("Stopping after current checks finish...");
      break;
    case "view_status":
      el.statusText?.scrollIntoView({ behavior: "smooth", block: "center" });
      break;
    default:
      el.inputBox?.focus();
  }
}

function ownerModeEnabled() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    return params.get("owner") === "1";
  } catch {
    return false;
  }
}

function applyPublicLaunchMode() {
  const owner = ownerModeEnabled();
  document.body.classList.toggle("public-launch-mode", Boolean(PUBLIC_LAUNCH_MODE && !owner));
  document.body.classList.toggle("owner-mode", owner);
}

const OWNER_PREFLIGHT_FILES = [
  "index.html",
  "app.js",
  "style.css",
  "privacy.html",
  "terms.html",
  "affiliate-disclosure.html",
  "og-image.png",
  "og-image.svg",
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml"
];

let lastPreflightResults = [];

function preflightItem(label, status, note) {
  return { label, status, note };
}

function preflightStatusLabel(status) {
  if (status === "pass") return "Pass";
  if (status === "warn") return "Warn";
  if (status === "fail") return "Fail";
  return "Info";
}

function preflightStatusIcon(status) {
  if (status === "pass") return "✓";
  if (status === "warn") return "!";
  if (status === "fail") return "×";
  return "•";
}

async function checkPublicFile(path) {
  try {
    const response = await fetch(path, { method: "HEAD", cache: "no-store" });
    if (response && response.ok) return preflightItem(path, "pass", "Found and reachable.");
    if (response && response.status === 405) {
      const getResponse = await fetch(path, { method: "GET", cache: "no-store" });
      return preflightItem(path, getResponse.ok ? "pass" : "fail", getResponse.ok ? "Found with GET fallback." : `Returned HTTP ${getResponse.status}.`);
    }
    return preflightItem(path, "fail", response ? `Returned HTTP ${response.status}.` : "No response.");
  } catch {
    const isLocal = window.location.protocol === "file:";
    return preflightItem(path, isLocal ? "warn" : "fail", isLocal ? "Cannot verify file reachability from file://. Test after serving or publishing." : "Could not verify this file.");
  }
}

function metadataPreflightItems() {
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  const host = window.location.hostname || "";
  const customDomainLikely = Boolean(host && !/github\.io$|localhost$|127\.0\.0\.1$|^$/i.test(host));
  const affiliateTemplates = Object.values(AFFILIATE_CONFIG.templates || {}).filter(template => String(template || "").trim());
  const affiliateReady = Boolean(AFFILIATE_CONFIG.enabled && affiliateTemplates.length);
  const analyticsReady = !ANALYTICS_CONFIG.enabled || Boolean(ANALYTICS_CONFIG.endpoint || ANALYTICS_CONFIG.siteId || ANALYTICS_CONFIG.provider === "dataLayer");
  const launchModeReady = PUBLIC_LAUNCH_MODE === true;

  return [
    preflightItem("Public launch mode", launchModeReady ? "pass" : "warn", launchModeReady ? "Visitor-facing cleanup is enabled." : "Turn PUBLIC_LAUNCH_MODE on before sharing widely."),
    preflightItem("Canonical URL", canonical ? (/yourdomain\.com|example\.com/i.test(canonical) ? "warn" : "pass") : "fail", canonical ? `Set to ${canonical}` : "Missing canonical URL."),
    preflightItem("Custom domain", customDomainLikely ? "pass" : "warn", customDomainLikely ? `Current host: ${host}` : "Still on GitHub Pages/local host. Fine for testing; use a custom domain for public launch."),
    preflightItem("Meta description", description && description.length >= 60 ? "pass" : "warn", description ? `${description.length} characters.` : "Missing meta description."),
    preflightItem("Open Graph image", ogImage ? "pass" : "fail", ogImage ? "Social preview image is configured." : "Missing og:image tag."),
    preflightItem("Affiliate links", affiliateReady ? "pass" : "warn", affiliateReady ? "Affiliate mode has configured templates. Test each registrar." : "Affiliate mode is off or using direct registrar links."),
    preflightItem("Analytics safety", analyticsReady ? "pass" : "fail", analyticsReady ? "Analytics is disabled or has a destination configured." : "Analytics is enabled without a destination."),
    preflightItem("Owner tools hidden", ownerModeEnabled() ? "pass" : "warn", ownerModeEnabled() ? "Owner mode is active for this test only." : "Owner tools should be hidden publicly unless ?owner=1 is used.")
  ];
}

function renderPreflightResults(items) {
  if (!el.preflightResults || !el.preflightStatus) return;
  const failCount = items.filter(item => item.status === "fail").length;
  const warnCount = items.filter(item => item.status === "warn").length;
  el.preflightStatus.textContent = failCount ? `${failCount} fail · ${warnCount} warn` : warnCount ? `${warnCount} warning${warnCount === 1 ? "" : "s"}` : "All checks passed";
  el.preflightStatus.className = `status-chip status-${failCount ? "fail" : warnCount ? "warn" : "pass"}`;
  el.preflightResults.innerHTML = items.map(item => `
    <li class="preflight-${escapeAttr(item.status)}">
      <strong><span>${escapeHtml(preflightStatusIcon(item.status))}</span> ${escapeHtml(preflightStatusLabel(item.status))}: ${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.note)}</span>
    </li>
  `).join("");
}

async function runOwnerPreflight() {
  if (!ownerModeEnabled()) return [];
  if (el.preflightStatus) {
    el.preflightStatus.textContent = "Checking...";
    el.preflightStatus.className = "status-chip";
  }
  if (el.preflightResults) {
    el.preflightResults.innerHTML = '<li class="preflight-pending"><strong>Checking</strong><span>Testing public files and launch settings...</span></li>';
  }
  const fileItems = await Promise.all(OWNER_PREFLIGHT_FILES.map(checkPublicFile));
  const items = [...fileItems, ...metadataPreflightItems()];
  lastPreflightResults = items;
  renderPreflightResults(items);
  const failCount = items.filter(item => item.status === "fail").length;
  const warnCount = items.filter(item => item.status === "warn").length;
  setStatus(failCount ? `Preflight found ${failCount} failing check${failCount === 1 ? "" : "s"} and ${warnCount} warning${warnCount === 1 ? "" : "s"}.` : warnCount ? `Preflight passed with ${warnCount} warning${warnCount === 1 ? "" : "s"}.` : "Preflight passed.");
  trackEvent("owner_preflight_run", { fail_count: failCount, warn_count: warnCount });
  return items;
}

function preflightReportText(items = lastPreflightResults) {
  const rows = items && items.length ? items : [preflightItem("Preflight", "info", "Not run yet.")];
  const summary = rows.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  return [
    "Domain Shortlist — owner preflight report",
    `Generated: ${new Date().toLocaleString()}`,
    `Summary: ${summary.pass || 0} pass, ${summary.warn || 0} warn, ${summary.fail || 0} fail`,
    "",
    ...rows.map(item => `- ${preflightStatusLabel(item.status)}: ${item.label} — ${item.note}`),
    "",
    "Next: fix failures first, review warnings, then test the live URL on mobile."
  ].join("\n");
}

async function copyPreflightReport() {
  if (!lastPreflightResults.length && ownerModeEnabled()) await runOwnerPreflight();
  copyText(preflightReportText(), "preflight report");
  trackEvent("owner_preflight_report_copied", { result_count: lastPreflightResults.length });
}

function renderOwnerPreflightPanel() {
  if (!el.ownerPreflightPanel) return;
  const show = ownerModeEnabled();
  el.ownerPreflightPanel.classList.toggle("is-hidden", !show);
  if (show && !lastPreflightResults.length && el.preflightStatus) {
    el.preflightStatus.textContent = "Not run yet";
    el.preflightStatus.className = "status-chip";
  }
}

function renderOwnerLaunchInputsPanel() {
  if (!el.ownerLaunchInputsPanel) return;
  el.ownerLaunchInputsPanel.classList.toggle("is-hidden", !ownerModeEnabled());
}

function finalLaunchReplacementChecklistText() {
  return [
    `${PUBLIC_SITE_NAME} — final launch replacement checklist`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Current placeholders:",
    `- Site name: ${PUBLIC_SITE_NAME}`,
    `- Tagline: ${PUBLIC_SITE_TAGLINE}`,
    `- Public URL: ${PUBLIC_SITE_URL}`,
    "",
    "Replace these when the final public brand/domain are ready:",
    "- app.js: PUBLIC_SITE_NAME, PUBLIC_SITE_TAGLINE, PUBLIC_SITE_URL",
    "- index.html: title, meta description, canonical URL, Open Graph tags, Twitter tags, structured data",
    "- sitemap.xml: final public URL",
    "- robots.txt: sitemap URL if needed",
    "- site.webmanifest: app name and start URL if using a custom domain",
    "- README.md and LAUNCH_INPUTS_NEEDED.md: public name/domain references",
    "- privacy.html, terms.html, affiliate-disclosure.html: contact/support and site-name references",
    "- og-image.png and og-image.svg: final public name if the branding changes",
    "",
    "After replacement:",
    "1. Run owner preflight with ?owner=1.",
    "2. Open the live URL on desktop and phone.",
    "3. Check the social preview image.",
    "4. Confirm registrar links and disclosure language."
  ].join("\n");
}

function renderOwnerFinalReplacePanel() {
  if (!el.ownerFinalReplacePanel) return;
  const show = ownerModeEnabled();
  el.ownerFinalReplacePanel.classList.toggle("is-hidden", !show);
  if (!show || !el.ownerFinalReplaceList) return;
  const items = [
    ["Current site name", PUBLIC_SITE_NAME],
    ["Current tagline", PUBLIC_SITE_TAGLINE],
    ["Current public URL", PUBLIC_SITE_URL],
    ["Main files to update later", "app.js, index.html, sitemap.xml, robots.txt, site.webmanifest"],
    ["Content files to review", "README.md, privacy.html, terms.html, affiliate-disclosure.html"],
    ["Image files to refresh if renamed", "og-image.png, og-image.svg"]
  ];
  el.ownerFinalReplaceList.innerHTML = items.map(([label, value]) => `<li><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></li>`).join("");
}

function copyFinalLaunchChecklist() {
  copyText(finalLaunchReplacementChecklistText(), "final launch replacement checklist");
  trackEvent("final_launch_checklist_copied");
}

function renderOwnerChecklist() {
  if (!el.ownerChecklistPanel || !el.ownerChecklistList) return;
  const show = ownerModeEnabled();
  el.ownerChecklistPanel.classList.toggle("is-hidden", !show);
  applyPublicLaunchMode();
  renderOwnerPreflightPanel();
  renderOwnerLaunchInputsPanel();
  renderOwnerFinalReplacePanel();
  if (!show) return;

  const host = window.location.hostname || "";
  const customDomainLikely = Boolean(host && !/github\.io$|localhost$|127\.0\.0\.1$|^$/i.test(host));
  const affiliateTemplates = Object.values(AFFILIATE_CONFIG.templates || {}).filter(template => String(template || "").trim());
  const affiliateReady = Boolean(AFFILIATE_CONFIG.enabled && affiliateTemplates.length);
  const analyticsSafe = !ANALYTICS_CONFIG.enabled || Boolean(ANALYTICS_CONFIG.endpoint || ANALYTICS_CONFIG.siteId || ANALYTICS_CONFIG.provider === "dataLayer");
  const pageLinks = [...document.querySelectorAll("a[href]")].map(link => link.getAttribute("href") || "");
  const hasPrivacy = pageLinks.includes("privacy.html");
  const hasAffiliateDisclosure = pageLinks.includes("affiliate-disclosure.html");
  const hasTerms = pageLinks.includes("terms.html");

  const items = [
    { label: "Custom domain added", done: customDomainLikely, note: customDomainLikely ? `Current host: ${host}` : "Still on GitHub Pages/local host. Add the final custom domain before public launch." },
    { label: "Real affiliate URLs added", done: affiliateReady, note: affiliateReady ? "Affiliate mode has at least one configured template." : "Affiliate mode is off or templates are blank; direct registrar links are active." },
    { label: "Affiliate links tested", done: false, note: "Use the affiliate tester in Advanced mode and confirm each registrar resolves correctly." },
    { label: "OG preview verified", done: false, note: "Use a social preview tool after the final domain is live." },
    { label: "Privacy page checked", done: hasPrivacy, note: hasPrivacy ? "Privacy link is present in the UI." : "Privacy link not found in the page." },
    { label: "Affiliate disclosure checked", done: hasAffiliateDisclosure, note: hasAffiliateDisclosure ? "Affiliate disclosure link is present in the UI." : "Affiliate disclosure link not found in the page." },
    { label: "Terms checked", done: hasTerms, note: hasTerms ? "Terms link is present in the UI." : "Terms link not found in the page." },
    { label: "Analytics disabled or configured safely", done: analyticsSafe, note: analyticsSafe ? "Analytics config is off or has a destination configured." : "Analytics is enabled but no destination is configured." },
    { label: "Internal checklist removed from deploy", done: true, note: ".gitignore excludes INTERNAL_CREATOR_CHECKLIST.md; public ZIP should not include it." }
  ];

  el.ownerChecklistList.innerHTML = items.map(item => `
    <li class="${item.done ? "is-done" : "needs-check"}">
      <strong>${item.done ? "✓" : "□"} ${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.note)}</span>
    </li>
  `).join("");
}

function updateSummary() {
  const cleaned = results.filter(Boolean);
  const checked = cleaned.length;
  const available = cleaned.filter(r => r.available === true).length;
  const taken = cleaned.filter(r => r.available === false).length;
  const invalid = cleaned.filter(r => r.availability_status === "invalid_input").length;
  const unknown = cleaned.filter(r => r.available === null && r.availability_status !== "invalid_input").length;
  const favoriteCount = cleaned.filter(r => favorites.has(r.normalized_domain) || savedShortlist.has(r.normalized_domain)).length;
  const topPickCount = Math.min(topPickRows().length, topPickLimit());

  el.summaryChecked.textContent = checked;
  el.summaryAvailable.textContent = available;
  el.summaryTaken.textContent = taken;
  el.summaryInvalid.textContent = invalid;
  el.summaryUnknown.textContent = unknown;
  el.summaryFavorites.textContent = favoriteCount;

  if (el.resultPlainSummary) {
    if (checked) {
      const worthText = available ? `${available.toLocaleString()} worth checking` : "0 worth checking yet";
      const nextText = available ? "Start with the top pick." : "Try a broader list or more .com options.";
      const extra = [];
      if (taken) extra.push(`${taken.toLocaleString()} likely unavailable`);
      if (unknown) extra.push(`${unknown.toLocaleString()} unconfirmed`);
      if (favoriteCount) extra.push(`${favoriteCount.toLocaleString()} saved`);
      el.resultPlainSummary.textContent = `${checked.toLocaleString()} checked · ${worthText}${extra.length ? ` · ${extra.join(" · ")}` : ""}. ${nextText}`;
      el.resultPlainSummary.classList.remove("is-hidden");
    } else {
      el.resultPlainSummary.textContent = "No domains checked yet.";
      el.resultPlainSummary.classList.add("is-hidden");
    }
  }

  if (checked && el.inputPreviewHeadline && el.inputPreviewDetails) {
    el.inputPreviewHeadline.textContent = `Input checked: ${checked.toLocaleString()} domain${checked === 1 ? "" : "s"}.`;
    el.inputPreviewDetails.textContent = "Review Top Picks or scan All Results below. Use Edit list to change the pasted names.";
  }

  updateNextStepsPanel({ checked, available, taken, unknown, invalid, favoriteCount, topPickCount });
}

function updateNextStepsPanel(summary) {
  if (!el.nextStepsPanel) return;
  if (!summary.checked) {
    el.nextStepsPanel.classList.add("is-hidden");
    return;
  }
  el.nextStepsPanel.classList.remove("is-hidden");
  if (el.nextStepsHeadline) {
    el.nextStepsHeadline.textContent = `Checked ${summary.checked} domain${summary.checked === 1 ? "" : "s"}.`;
  }
  if (el.nextStepsDetails) {
    const parts = [
      `${summary.available} worth checking`,
      `${summary.taken} likely unavailable`,
      `${summary.unknown} unconfirmed`,
      `${summary.topPickCount} top pick${summary.topPickCount === 1 ? "" : "s"}`,
      `${summary.favoriteCount} saved`
    ];
    el.nextStepsDetails.textContent = `${parts.join(" · ")}. Next: review Best Picks, save finalists, then confirm price and availability at a registrar.`;
  }
}

function removeTaken() {
  const before = results.length;
  results = applyBatchMetrics(results.filter(r => r && r.available !== false));
  const removed = before - results.length;
  replaceInputWithDomains(results.map(r => r.normalized_domain).filter(Boolean));
  renderResults();
  setStatus(`Removed ${removed} taken/registered rows. Bulk price-check actions now only open the remaining visible rows.`);
  saveState();
}

function keepAvailableOnly() {
  const before = results.length;
  results = applyBatchMetrics(results.filter(r => r && r.available === true));
  const removed = before - results.length;
  replaceInputWithDomains(results.map(r => r.normalized_domain).filter(Boolean));
  renderResults();
  setStatus(`Kept ${results.length} worth-checking rows and removed ${removed}.`);
  saveState();
}

function removeUnsavedResults() {
  const savedDomains = new Set([...favorites, ...savedShortlist].map(normalizeSavedDomain).filter(Boolean));
  if (!savedDomains.size) {
    setStatus("Save a few finalists before removing unsaved results.");
    return;
  }
  if (!results.filter(Boolean).length) {
    setStatus("No results to clean yet.");
    return;
  }
  if (!confirm("Remove all unsaved result rows and keep only saved finalists?")) return;
  const before = results.length;
  results = applyBatchMetrics(results.filter(row => row && savedDomains.has(normalizeSavedDomain(row.normalized_domain))));
  const removed = before - results.length;
  replaceInputWithDomains(results.map(row => row.normalized_domain).filter(Boolean));
  resultQuickPreset = "saved";
  if (el.filterStatus) el.filterStatus.value = "all";
  resetRenderLimit();
  renderResults();
  saveState();
  setStatus(`Removed ${removed} unsaved result row${removed === 1 ? "" : "s"}. Saved finalists stayed.`);
  trackEvent("unsaved_results_removed", { removed_count: removed, saved_count: savedDomains.size });
}

function replaceInputWithDomains(domains) {
  const unique = [...new Set(domains)];
  el.inputBox.value = unique.join("\n");
  updateInputCount();
}


function showMoreRows() {
  renderRowLimit += RENDER_LIMIT_STEP;
  renderResults();
}

function showAllRows() {
  const visibleRows = displayedResults();
  renderRowLimit = Math.max(renderRowLimit, visibleRows.length);
  renderResults();
}

function openLinks(rows, label, options = {}) {
  const links = [...new Set(rows.filter(Boolean).map(resultRegistrarUrl).filter(Boolean))];
  if (!links.length) {
    setStatus(`No ${label} ${selectedRegistrarLabel()} price-check links to open.`);
    return;
  }

  const requiresConfirm = options.forceConfirm || links.length > 3;
  if (requiresConfirm) {
    const message = `Open ${links.length} ${selectedRegistrarLabel()} price-check tab${links.length === 1 ? "" : "s"}?\n\nThe registrar will confirm final availability, premium status, and price. Your browser may block many tabs.`;
    if (!confirm(message)) {
      trackEvent("open_price_links_cancelled", { link_count: links.length, link_group: label });
      return;
    }
  }
  trackEvent("check_price_clicked", { link_count: links.length, link_group: label });

  let opened = 0;
  for (const link of links) {
    const win = window.open(link, "_blank", "noopener,noreferrer");
    if (win) opened += 1;
  }
  setStatus(`Opened ${opened}/${links.length} ${label} ${selectedRegistrarLabel()} price-check link${links.length === 1 ? "" : "s"}. Final price and availability are confirmed by the registrar.`);
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

function copyWorthChecking() {
  const rows = displayedResults().filter(isWorthCheckingRow);
  const domains = uniqueDomains(rows);
  if (!domains.length) {
    setStatus("No visible worth-checking names to copy. Clear filters or show more results.");
    return;
  }
  copyText(domains.join("\n"), "visible worth-checking domains");
  trackEvent("visible_worth_checking_domains_copied", { domain_count: domains.length });
}

function copyVisibleWorthCheckingWithReasons() {
  const rows = displayedResults().filter(isWorthCheckingRow);
  if (!rows.length) {
    setStatus("No visible worth-checking names with reasons to copy. Clear filters or show more results.");
    return;
  }
  const lines = rows.map(row => {
    const domain = row.normalized_domain || row.input || "";
    const reason = worthCheckingReason(row) || publicScoreExplanation(row) || row.score_explanation || "Worth checking.";
    return `${domain} — ${reason}`;
  }).filter(Boolean);
  copyText(lines.join("\n"), "visible worth-checking domains with reasons");
  trackEvent("visible_worth_checking_reasons_copied", { domain_count: lines.length });
}

function copyFavorites() {
  const domains = [...new Set([...favorites, ...savedShortlist])].filter(Boolean).sort();
  if (!domains.length) {
    setStatus("No saved names to copy yet.");
    return;
  }
  copyText(domains.join("\n"), "saved domains");
}

function copyVisible() {
  copyText(uniqueDomains(displayedResults()).join("\n"), "visible domains");
}

function copyVisibleResults() {
  const rows = displayedResults();
  if (!rows.length) {
    setStatus("No visible results to copy.");
    return;
  }
  const text = rows.map(row => {
    const domain = row.normalized_domain || row.input || "";
    const status = availabilityText(row);
    const score = row.domain_score ?? "";
    const reason = publicScoreExplanation(row) || row.score_explanation || "";
    return `${domain} — ${status}${score !== "" ? ` · score ${score}` : ""}${reason ? ` · ${reason}` : ""}`;
  }).join("\n");
  copyText(text, "visible results");
}

function copyVisibleLinks() {
  const links = [...new Set(displayedResults().map(resultRegistrarUrl).filter(Boolean))];
  copyText(links.join("\n"), `visible ${selectedRegistrarLabel()} links`);
}


function topPickGroup(domain) {
  return cleanKeyword(secondLevelName(domain || "")) || cleanKeyword(domain || "");
}

function tldPreferenceScore(suffix) {
  suffix = String(suffix || "").toLowerCase();
  if (suffix === "com") return 100;
  if (suffix === "org") return 82;
  if (suffix === "net") return 78;
  if (suffix === "co") return 72;
  if (suffix === "app") return 68;
  if (suffix === "legal") return 66;
  if (["io", "ai", "dev"].includes(suffix)) return 62;
  if (suffix.includes(".")) return 50;
  return 42;
}

function diverseTopPickSubset(rows, limit = topPickLimit()) {
  const selected = [];
  const seenGroups = new Set();
  const sorted = rows.filter(Boolean).sort((a, b) =>
    Number(b.domain_score || 0) - Number(a.domain_score || 0) ||
    tldPreferenceScore(effectiveSuffix(b.normalized_domain || "")) - tldPreferenceScore(effectiveSuffix(a.normalized_domain || "")) ||
    Number(a.name_length || 999) - Number(b.name_length || 999)
  );
  for (const row of sorted) {
    const group = row.top_pick_group || topPickGroup(row.normalized_domain || "");
    if (group && seenGroups.has(group)) continue;
    selected.push(row);
    if (group) seenGroups.add(group);
    if (selected.length >= limit) break;
  }
  return selected;
}

function topPickLimit() {
  return clampNumber(el.topPickCountInput?.value || 20, 1, 100, 20);
}

function topPickCandidateRows() {
  const cleaned = results.filter(r => r && r.availability_status !== "invalid_input");
  const availableRows = cleaned.filter(r => r.available === true);
  // If a real availability run found available domains, top picks should focus on those.
  // In score-only mode, there are no available=true rows, so use all non-taken rows as candidates.
  return availableRows.length ? availableRows : cleaned.filter(r => r.available !== false);
}

function topPickRows() {
  const candidates = applyBatchMetrics(topPickCandidateRows()).filter(row => !hideWeakPicks || isSimpleStrongEnoughRow(row));
  return diverseTopPickSubset(candidates, topPickLimit());
}

function topPickCardRows() {
  const rows = topPickRows();
  const simpleLimit = Math.max(1, Math.min(guidedPickCount || 1, 5, topPickLimit()));
  return topPicksExpanded ? rows : rows.slice(0, simpleLimit);
}

function availabilityText(row) {
  if (row.available === true) return "Worth checking";
  if (row.available === false) return "Likely unavailable";
  if (row.availability_status === "not_checked_score_only") return "Not checked yet";
  if (row.availability_status === "invalid_input") return "Invalid";
  return "Unknown";
}

function cardTagHtml(label, kind = "neutral") {
  return `<span class="card-tag ${kind}">${escapeHtml(label)}</span>`;
}


function publicRecommendationType(row) {
  const raw = String(row.recommendation_type || row.score_label || "").toLowerCase();
  const domain = String(row.normalized_domain || "").toLowerCase();
  const tld = effectiveSuffix(domain);
  if (raw.includes("seo") || Number(row.seo_utility_score || 0) >= 7) return "Clear search intent";
  if (raw.includes("exact") || /(?:forms|guide|kit|checklist|calculator|planner|quote|help)$/.test(secondLevelName(domain))) return "Clear utility name";
  if (raw.includes("brand") || Number(row.brandability_score || 0) >= 7) return "Brandable shortlist candidate";
  if (tld && tld !== "com") return "Strong fallback extension";
  if (Number(row.domain_score || 0) >= 85) return "Strong option";
  if (Number(row.domain_score || 0) >= 70) return "Needs review";
  return "Review carefully";
}

function domainHasCleanShape(domain) {
  const sld = secondLevelName(domain || "");
  return Boolean(sld) && !sld.includes("-") && !/\d/.test(sld) && sld.length <= 15;
}

function plainReasonForRow(row) {
  const domain = String(row.normalized_domain || "").toLowerCase();
  const tld = effectiveSuffix(domain);
  const sld = secondLevelName(domain);
  const score = Number(row.domain_score || 0);
  const buyerIntent = Number(row.buyer_intent_score || 0);
  const seo = Number(row.seo_utility_score || 0);
  const brand = Number(row.brandability_score || 0);
  const phrase = String(row.phrase_naturalness || "").toLowerCase();
  const clean = domainHasCleanShape(domain);

  if (tld === "com" && clean && score >= 80) return "Clean, easy to read, and on .com."
  if (buyerIntent >= 7) return "Clearly describes what a visitor is looking for."
  if (seo >= 7) return "Reads like a useful search phrase."
  if (brand >= 7 || publicRecommendationType(row).toLowerCase().includes("brand")) return "Good because it sounds brandable and could work as a product or company name.";
  if (tld === "com") return "Good because it uses the trusted .com extension and ranked well in this batch.";
  if (clean) return "Good because it avoids numbers and hyphens and is easy to scan.";
  if (phrase.includes("natural")) return "Good because the words feel natural together.";
  if (sld.length <= 12 && score >= 70) return "Good because it is relatively short and ranked well in this batch.";
  return "Good because it ranked near the top of this list based on wording, length, and extension.";
}

function publicScoreExplanation(row) {
  return plainReasonForRow(row);
}

function bestUseForRow(row) {
  const domain = String(row.normalized_domain || "").toLowerCase();
  const tld = effectiveSuffix(domain);
  if (Number(row.buyer_intent_score || 0) >= 7) return "landing page or service offer";
  if (Number(row.seo_utility_score || 0) >= 7) return "content, SEO, or utility page";
  if (Number(row.brandability_score || 0) >= 7) return "startup, app, or product brand";
  if (["io", "app", "ai", "dev"].includes(tld)) return "software or app backup";
  if (tld === "org") return "community or nonprofit project";
  if (tld === "com") return "main brand candidate";
  return "backup or campaign domain";
}

function strengthForRow(row) {
  const domain = String(row.normalized_domain || "").toLowerCase();
  const tld = effectiveSuffix(domain);
  if (tld === "com" && domainHasCleanShape(domain)) return "clean .com";
  if (Number(row.buyer_intent_score || 0) >= 7) return "clear intent";
  if (Number(row.seo_utility_score || 0) >= 7) return "clear phrase";
  if (Number(row.brandability_score || 0) >= 7) return "brandable";
  if (domainHasCleanShape(domain)) return "easy to read";
  return row.score_label || "shortlisted";
}

function watchOutForRow(row) {
  const domain = String(row.normalized_domain || "").toLowerCase();
  const tld = effectiveSuffix(domain);
  const sld = secondLevelName(domain);
  if (row.available === false) return "appears taken";
  if (row.availability_status === "not_checked_score_only") return "not live-checked yet";
  if (String(row.legal_sensitive_flag || "").toLowerCase() === "true") return "sensitive wording";
  if (tld && tld !== "com") return `.${tld} is a fallback, not .com`;
  if (sld.includes("-")) return "has a hyphen";
  if (/\d/.test(sld)) return "has a number";
  if (sld.length > 15) return "a little long";
  const concern = topPickConcernTags(row).find(tag => tag.kind !== "good");
  if (concern) return concern.label;
  return "confirm final price";
}

function publicScoreDetails(row) {
  const pieces = [];
  if (row.score_notes) pieces.push(String(row.score_notes));
  const flags = String(row.risk_flags || "").split(/[|;,]/).map(v => v.trim()).filter(Boolean);
  if (flags.length) pieces.push(`Flags: ${flags.slice(0, 4).map(flag => flag.replace(/_/g, " ")).join(", ")}.`);
  if (row.tld_cap) pieces.push(`Extension cap: ${row.tld_cap}.`);
  return pieces.join(" ");
}

function topPickStrengthTags(row) {
  const tags = [];
  const domain = String(row.normalized_domain || "");
  const tld = effectiveSuffix(domain);
  const score = Number(row.domain_score || 0);
  if (score >= 85) tags.push({ label: "strong score", kind: "good" });
  if (tld === "com") tags.push({ label: ".com advantage", kind: "good" });
  else if (tld) tags.push({ label: `.${tld} option`, kind: "tld" });
  if (Number(row.buyer_intent_score || 0) >= 7) tags.push({ label: "clear intent", kind: "good" });
  if (Number(row.seo_utility_score || 0) >= 7) tags.push({ label: "SEO phrase", kind: "good" });
  if (Number(row.brandability_score || 0) >= 7) tags.push({ label: "brandable", kind: "good" });
  if (row.available === true) tags.push({ label: "worth checking", kind: "good" });
  if (!tags.length) tags.push({ label: "shortlist candidate", kind: "good" });
  return tags.slice(0, 4);
}

function topPickConcernTags(row) {
  const concerns = topPickIssueTags(row).filter(tag => tag.kind !== "good");
  if (!concerns.length) return [{ label: "no obvious concern", kind: "good" }];
  return concerns.slice(0, 4);
}
function topPickIssueTags(row) {
  const tags = [];
  const tld = effectiveSuffix(row.normalized_domain || "");
  if (tld && tld !== "com") tags.push({ label: `.${tld} fallback`, kind: "tld" });
  if (Number(row.abbreviation_penalty || 0) < 0) tags.push({ label: "abbreviation risk", kind: "risk" });
  if (Number(row.word_order_penalty || 0) < 0) tags.push({ label: "word order check", kind: "risk" });
  if (Number(row.abstract_saas_penalty || 0) < 0) tags.push({ label: "abstract/startup-style", kind: "risk" });
  if (String(row.legal_sensitive_flag || "").toLowerCase() === "true") tags.push({ label: "sensitive wording", kind: "risk" });

  const rawRiskFlags = String(row.risk_flags || "").split(/[|;,]/).map(v => v.trim()).filter(Boolean);
  for (const flag of rawRiskFlags.slice(0, 2)) {
    if (!tags.some(t => t.label.toLowerCase() === flag.toLowerCase())) tags.push({ label: flag.replace(/_/g, " "), kind: "risk" });
  }

  if (!tags.length) tags.push({ label: "clean shortlist candidate", kind: "good" });
  return tags.slice(0, 4);
}

function feedbackIssueUrl(kind, row) {
  const domain = row?.normalized_domain || "";
  const kindLabel = String(kind || "Feedback");
  const score = row?.domain_score ?? "";
  const label = row?.score_label || "";
  const availability = availabilityText(row || {});
  const registrar = selectedRegistrarLabel();
  const riskFlags = row?.risk_flags || "";
  const recommendation = row ? publicRecommendationType(row) : "";
  const explanation = row?.score_explanation || row?.explanation || "";
  const body = [
    `Feedback type: ${kindLabel}`,
    `Domain: ${domain}`,
    `Score: ${score} ${label ? `(${label})` : ""}`,
    `Availability shown: ${availability}`,
    `Registrar selected: ${registrar}`,
    `Recommendation type: ${recommendation}`,
    `Risk flags: ${riskFlags}`,
    "",
    "Why this looked wrong:",
    "",
    "Expected behavior:",
    "",
    "Score explanation:",
    explanation
  ].join("\n");
  const params = new URLSearchParams({
    title: `${kindLabel}: ${domain || "Domain Shortlist"}`,
    body
  });
  return `${FEEDBACK_ISSUE_BASE}?${params.toString()}`;
}

function feedbackLinkHtml(kind, row, label) {
  return `<a class="top-pick-feedback-link" href="${escapeAttr(feedbackIssueUrl(kind, row))}" target="_blank" rel="noopener noreferrer" data-feedback-kind="${escapeAttr(kind)}">${escapeHtml(label)}</a>`;
}

function hasDismissedFirstRun() {
  try { return localStorage.getItem(FIRST_RUN_DISMISSED_KEY) === "1"; } catch { return false; }
}

function dismissFirstRunGuide() {
  try { localStorage.setItem(FIRST_RUN_DISMISSED_KEY, "1"); } catch {}
  if (el.firstRunPanel) el.firstRunPanel.classList.add("is-hidden");
  trackEvent("first_run_guide_dismissed");
}

function updateFirstRunGuide() {
  if (!el.firstRunPanel) return;
  if (hasDismissedFirstRun()) {
    el.firstRunPanel.classList.add("is-hidden");
    return;
  }
  el.firstRunPanel.classList.remove("is-hidden");
  const hasInput = Boolean(el.inputBox?.value?.trim());
  const checked = results.filter(Boolean).length;
  const picks = topPickRows().length;
  const steps = {
    input: hasInput,
    check: checked > 0,
    review: picks > 0,
    price: false
  };
  for (const item of el.firstRunPanel.querySelectorAll("[data-walkthrough-step]")) {
    const key = item.getAttribute("data-walkthrough-step");
    item.classList.toggle("is-done", Boolean(steps[key]));
    item.classList.toggle("is-current", key === "input" ? !hasInput : key === "check" ? hasInput && !checked : key === "review" ? checked > 0 && !picks : key === "price" ? picks > 0 : false);
  }
}

function hasDismissedSimpleOnboarding() {
  try { return localStorage.getItem(SIMPLE_ONBOARDING_DISMISSED_KEY) === "1"; } catch { return false; }
}

function dismissSimpleOnboarding() {
  try { localStorage.setItem(SIMPLE_ONBOARDING_DISMISSED_KEY, "1"); } catch {}
  if (el.simpleOnboardingPanel) el.simpleOnboardingPanel.classList.add("is-hidden");
  trackEvent("simple_onboarding_dismissed");
}

function updateSimpleOnboarding() {
  if (!el.simpleOnboardingPanel) return;
  const hasInput = Boolean(el.inputBox?.value?.trim());
  const hasResults = results.filter(Boolean).length > 0;
  const hasSaved = savedShortlist.size > 0;
  const shouldShow = !hasDismissedSimpleOnboarding() && !hasInput && !hasResults && !hasSaved;
  el.simpleOnboardingPanel.classList.toggle("is-hidden", !shouldShow);
}

function focusDomainInput() {
  el.inputBox?.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => el.inputBox?.focus(), 250);
}

function findResultByDomain(domain) {
  const needle = String(domain || "").toLowerCase();
  if (!needle) return null;
  return results.find(row => row && String(row.normalized_domain || "").toLowerCase() === needle)
    || topPickRows().find(row => row && String(row.normalized_domain || "").toLowerCase() === needle)
    || (savedShortlist.has(needle) ? fallbackSavedRow(needle) : null);
}

function relatedExtensionRows(row) {
  if (!row) return [];
  const group = row.top_pick_group || topPickGroup(row.normalized_domain || "");
  return applyBatchMetrics(results.filter(candidate => {
    if (!candidate || candidate.normalized_domain === row.normalized_domain) return false;
    const candidateGroup = candidate.top_pick_group || topPickGroup(candidate.normalized_domain || "");
    return candidateGroup === group;
  })).slice(0, 8);
}

function renderDomainDetail(row) {
  if (!row || !el.domainDetailContent || !el.domainDetailTitle) return;
  const domain = row.normalized_domain || "";
  const lookupUrl = resultRegistrarUrl(row);
  const tld = row.effective_tld || effectiveSuffix(domain);
  const availability = availabilityText(row);
  const strengths = topPickStrengthTags(row).map(tag => cardTagHtml(tag.label, tag.kind)).join("");
  const concerns = topPickConcernTags(row).map(tag => cardTagHtml(tag.label, tag.kind)).join("");
  const related = relatedExtensionRows(row);
  const relatedHtml = related.length
    ? `<div class="drawer-related-list">${related.map(item => {
        const url = resultRegistrarUrl(item);
        return `<div class="drawer-related-row"><span>${escapeHtml(item.normalized_domain || "")}</span><span>${escapeHtml(item.domain_score ?? "")}</span>${url ? `<a href="${escapeAttr(url)}" target="_blank" rel="${escapeAttr(registrarLinkRel(selectedRegistrarKey(), item.normalized_domain))}">Check</a>` : ""}</div>`;
      }).join("")}</div>`
    : `<p class="muted">No close extension variants are currently visible in this batch.</p>`;
  const checkButton = lookupUrl
    ? `<a class="top-pick-cta drawer-cta" href="${escapeAttr(lookupUrl)}" target="_blank" rel="${escapeAttr(registrarLinkRel(selectedRegistrarKey(), domain))}">Check at ${escapeHtml(selectedRegistrarLabel())}</a>`
    : "";
  el.domainDetailTitle.textContent = domain || "Domain details";
  el.domainDetailContent.innerHTML = `
    <div class="drawer-score-row">
      <span class="score-badge score-${scoreClass(row.domain_score)}">${escapeHtml(row.domain_score ?? "")}</span>
      <span>${escapeHtml(row.score_label || "")}</span>
      <span>.${escapeHtml(tld)}</span>
      <span>${escapeHtml(availability)}</span>
    </div>
    <p class="drawer-summary"><strong>${escapeHtml(publicRecommendationType(row))}</strong> · ${escapeHtml(publicScoreExplanation(row))}</p>
    <section class="drawer-section"><h3>Why it ranked well</h3><div class="top-pick-tags">${strengths}</div></section>
    <section class="drawer-section"><h3>Possible concerns</h3><div class="top-pick-tags">${concerns}</div></section>
    <section class="drawer-section"><h3>Score details</h3><p>${escapeHtml(publicScoreDetails(row) || row.score_explanation || "No additional scoring notes for this domain.")}</p></section>
    <section class="drawer-section"><h3>Other extensions / variants in this batch</h3>${relatedHtml}</section>
    <section class="drawer-section"><h3>Nearby alternatives</h3>${alternativesHtml(domain, 8) || `<p class="muted">No safe alternatives generated for this name.</p>`}</section>
    ${registrarComparisonHtml(domain)}
    <div class="drawer-actions">
      ${checkButton}
      <button type="button" class="ghost" data-copy-domain="${escapeAttr(domain)}">Copy domain</button>
      ${compareButtonHtml(domain)}
      <button type="button" class="ghost" data-favorite="${escapeAttr(domain)}">${favorites.has(domain) ? "Unsave" : "Save"}</button>
    </div>
    <div class="top-pick-feedback drawer-feedback" aria-label="Feedback for ${escapeAttr(domain)}">
      ${feedbackLinkHtml("Bad score", row, "Bad score?")}
      ${feedbackLinkHtml("Wrong availability", row, "Wrong availability?")}
      ${feedbackLinkHtml("Broken registrar link", row, "Broken link?")}
    </div>
    <p class="muted drawer-disclaimer">Final price, premium status, and availability are confirmed by the registrar. Some links may be affiliate links at no extra cost to you.</p>
  `;
}

function openDomainDetail(domain) {
  const row = findResultByDomain(domain);
  if (!row || !el.domainDetailOverlay || !el.domainDetailDrawer) return;
  renderDomainDetail(row);
  el.domainDetailOverlay.classList.remove("is-hidden");
  el.domainDetailOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  el.domainDetailDrawer.focus();
  trackEvent("domain_detail_opened");
}

function closeDomainDetail() {
  if (!el.domainDetailOverlay) return;
  el.domainDetailOverlay.classList.add("is-hidden");
  el.domainDetailOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function renderTopPickCards() {
  if (!el.topPicksCards || !el.topPicksEmpty || !el.topPicksCount) return;

  const picks = topPickCardRows();
  const totalPicks = topPickRows().length;
  const hasResults = results.filter(Boolean).length > 0;

  if (!hasResults || !picks.length) {
    el.topPicksCards.innerHTML = "";
    el.topPicksEmpty.classList.remove("is-hidden");
    el.topPicksCount.textContent = hasResults ? (hideWeakPicks ? "No strong picks" : "No eligible picks") : "No picks yet";
    if (el.topPicksShowMoreBtn) el.topPicksShowMoreBtn.classList.add("is-hidden");
    updateStickyPriceBar();
    updateFirstRunGuide();
    return;
  }

  el.topPicksEmpty.classList.add("is-hidden");
  el.topPicksCount.textContent = totalPicks > 1 ? `${picks.length} of ${totalPicks} picks` : `${picks.length} pick`;
  if (el.topPicksShowMoreBtn) {
    const canExpand = totalPicks > Math.min(5, topPickLimit());
    el.topPicksShowMoreBtn.classList.toggle("is-hidden", !canExpand);
    el.topPicksShowMoreBtn.textContent = topPicksExpanded ? "Show fewer" : "Show more picks";
    el.topPicksShowMoreBtn.setAttribute("aria-expanded", topPicksExpanded ? "true" : "false");
  }
  if (el.showNextPickBtn) {
    const canShowNext = !topPicksExpanded && totalPicks > picks.length;
    el.showNextPickBtn.classList.toggle("is-hidden", !canShowNext);
    el.showNextPickBtn.textContent = picks.length <= 1 ? "Show another pick" : `Show pick #${picks.length + 1}`;
    el.showNextPickBtn.setAttribute("aria-label", `Show another backup pick. ${picks.length} of ${totalPicks} picks are visible.`);
  }

  el.topPicksCards.innerHTML = picks.map((row, index) => {
    const domain = row.normalized_domain || "";
    const favorite = favorites.has(domain);
    const lookupUrl = resultRegistrarUrl(row);
    const rank = row.batch_rank ? `#${row.batch_rank}` : `#${index + 1}`;
    const recommendation = publicRecommendationType(row);
    const explanation = publicScoreExplanation(row);
    const scoreNotes = publicScoreDetails(row);
    const strengthsHtml = topPickStrengthTags(row).map(tag => cardTagHtml(tag.label, tag.kind)).join("");
    const concernsHtml = topPickConcernTags(row).map(tag => cardTagHtml(tag.label, tag.kind)).join("");
    const tld = row.effective_tld || effectiveSuffix(domain);
    const availability = availabilityText(row);
    const checkButtonLabel = index === 0 ? `Check at ${selectedRegistrarLabel()}` : "Check registrar";
    const checkButton = lookupUrl
      ? `<a class="top-pick-cta ${index === 0 ? "primary-registrar-cta" : "secondary-registrar-cta"}" href="${escapeAttr(lookupUrl)}" target="_blank" rel="${escapeAttr(registrarLinkRel(selectedRegistrarKey(), domain))}">${escapeHtml(checkButtonLabel)}</a>`
      : "";

    const bestChoiceBadge = index === 0 ? `<span class="best-choice-badge">Best choice</span>` : `<span class="best-choice-badge is-backup">${index === 1 ? "Runner-up" : "Backup"}</span>`;
    const stepLine = index === 0
      ? "Check this one first, then save backups if needed."
      : "Backup option. Confirm it only if earlier picks do not work.";
    const saveButton = `<button type="button" class="star-button finalist-button decision-save-button ${favorite ? "is-favorite" : ""}" data-favorite="${escapeAttr(domain)}" title="${favorite ? "Remove from saved finalists" : "Save as finalist"}">${favorite ? "Saved" : "Save this"}</button>`;

    return `<article class="top-pick-card simple-pick-card premium-decision-card ${index === 0 ? "is-best-choice decision-primary-card" : "decision-backup-card"} score-${scoreClass(row.domain_score)}" data-domain="${escapeAttr(domain)}">
      <div class="top-pick-card-head decision-card-head">
        <span class="top-pick-card-labels"><span class="top-pick-rank">${escapeHtml(index === 0 ? "#1 Start here" : `${rank} ${index === 1 ? "Runner-up" : "Backup"}`)}</span>${bestChoiceBadge}</span>
      </div>
      <div class="top-pick-domain decision-domain">${escapeHtml(domain)}</div>
      <p class="simple-reason-pill decision-reason"><strong>${escapeHtml(recommendation)}</strong> · ${escapeHtml(explanation)}</p>
      <p class="decision-step-line">${escapeHtml(stepLine)}</p>
      <details class="top-pick-why-details">
        <summary>Why it ranked here</summary>
        <div class="top-pick-mini-meta">
          <span class="score-badge score-${scoreClass(row.domain_score)}">${escapeHtml(row.domain_score ?? "")}</span>
          <span>${escapeHtml(row.score_label || "")}</span>
          <span>.${escapeHtml(tld)}</span>
          <span>${escapeHtml(availability)}</span>
        </div>
        <div class="top-pick-card-section"><span>Strengths</span><div class="top-pick-tags">${strengthsHtml}</div></div>
        <div class="top-pick-card-section"><span>Watch out</span><div class="top-pick-tags">${concernsHtml}</div></div>
        ${scoreNotes ? `<p class="why-score-note">${escapeHtml(scoreNotes)}</p>` : ""}
      </details>
      <div class="top-pick-actions decision-actions">
        ${checkButton}
        ${saveButton}
        <button type="button" class="ghost decision-secondary" data-detail-domain="${escapeAttr(domain)}">Details</button>
        <span class="advanced-only-inline">${compareButtonHtml(domain)}</span>
        <button type="button" class="ghost advanced-only-inline" data-copy-domain="${escapeAttr(domain)}">Copy</button>
      </div>
      <p class="registrar-disclosure card-disclosure">${escapeHtml(registrarLinkDisclosureText())}</p>
      <div class="top-pick-quiet-more">
        ${alternativesHtml(domain, 4)}
        ${registrarComparisonHtml(domain)}
      </div>
    </article>`;
  }).join("");
  updateStickyPriceBar();
  updateFirstRunGuide();
}

function showTopPicks() {
  trackEvent("top_picks_reviewed", { top_pick_count: topPickRows().length });
  el.filterStatus.value = "top_picks";
  el.sortSelect.value = "score_desc";
  const picks = topPickRows();
  const cutoff = picks.length ? Number(picks[picks.length - 1].domain_score || 0) : 0;
  el.filterSearch.value = "";
  renderResults();
  setStatus(picks.length ? `Showing ${picks.length} top pick${picks.length === 1 ? "" : "s"}. The card shortlist above is the fastest review view; the filtered table is below.` : "No top picks yet. Try broader keywords, include .com names, or use score-only mode for a first pass.");
  saveState();
}

function copyTopPicks() {
  const rows = topPickRows().slice(0, 10);
  const domains = uniqueDomains(rows);
  if (!domains.length) {
    setStatus("No Top Picks to copy yet. Paste a list and click Check my list first.");
    return;
  }
  copyText(domains.join("\n"), `top ${domains.length} pick${domains.length === 1 ? "" : "s"}`);
}

function copyBestChoiceTopPick() {
  const row = topPickRows()[0];
  const domain = row?.normalized_domain || "";
  if (!domain) {
    setStatus("No best choice to copy yet. Paste a list and click Check my list first.");
    return;
  }
  copyText(domain, "best choice");
  trackEvent("best_choice_copied");
}

function openBestChoiceTopPick() {
  const row = topPickRows()[0];
  if (!row?.normalized_domain) {
    setStatus("No best choice to check yet. Paste a list and click Check my list first.");
    return;
  }
  setStatus(`Opening the best choice: ${row.normalized_domain}. Confirm final price and availability at the registrar.`);
  openLinks([row], "best choice", { forceConfirm: false });
  trackEvent("best_choice_price_clicked");
}

function copyBestThreeTopPicks() {
  const rows = topPickRows().slice(0, 3);
  const domains = uniqueDomains(rows);
  if (!domains.length) {
    setStatus("No picks to copy yet. Paste a list and click Check my list first.");
    return;
  }
  copyText(domains.join("\n"), `best ${domains.length} pick${domains.length === 1 ? "" : "s"}`);
  trackEvent("best_three_copied", { count: domains.length });
}

function copyBestThreeWithReasons() {
  const rows = topPickRows().slice(0, 3);
  if (!rows.length) {
    setStatus("No picks to copy yet. Paste a list and click Check my list first.");
    return;
  }
  const lines = ["Best domain picks:", ""];
  rows.forEach((row, index) => {
    const reason = publicScoreExplanation(row) || publicRecommendationType(row) || "Worth checking.";
    lines.push(`${index + 1}. ${row.normalized_domain || ""} — ${reason}`);
  });
  lines.push("", "Next step: check final registrar price and availability before buying.");
  copyText(lines.join("\n"), `best ${rows.length} with reasons`);
  trackEvent("best_three_with_reasons_copied", { count: rows.length });
}

function toggleTopPicksExpanded() {
  topPicksExpanded = !topPicksExpanded;
  renderTopPickCards();
  setStatus(topPicksExpanded ? "Showing more Top Picks." : "Showing the simplest Top Picks view.");
  trackEvent("top_picks_show_more_toggled", { expanded: topPicksExpanded });
}

function showNextGuidedPick() {
  const total = topPickRows().length;
  if (!total) {
    setStatus("No backup pick yet. Paste names and check the list first.");
    return;
  }
  topPicksExpanded = false;
  guidedPickCount = Math.min(total, Math.max(1, guidedPickCount || 1) + 1);
  renderResults();
  setStatus(guidedPickCount >= total ? "Showing all Best Picks." : `Showing ${guidedPickCount} picks. Start with the highest-ranked name you like.`);
  trackEvent("guided_next_pick_clicked", { visible_count: guidedPickCount, total });
  saveState();
}

function openTopPicks() {
  const rows = topPickRows();
  const limit = topPickPriceOpenLimit();
  const selected = Number.isFinite(limit) ? rows.slice(0, limit) : rows;
  const label = Number.isFinite(limit) ? `${selected.length} top-pick` : "all top-pick";
  if (rows.length > selected.length) {
    setStatus(`Opening the first ${selected.length} of ${rows.length} top picks. Change the top-pick price tab setting to open more.`);
  }
  openLinks(selected, label, { forceConfirm: selected.length > 1 });
}

function openAllTopPicks() {
  openLinks(topPickRows(), "all top-pick", { forceConfirm: true });
}

function showAllResultsSection() {
  document.body.classList.add("show-all-results");
  resultQuickPreset = "all";
  resultBadgeFilter = "all";
  if (el.filterStatus) el.filterStatus.value = "all";
  if (el.sortSelect) el.sortSelect.value = "score_desc";
  resetRenderLimit();
  renderResults();
  document.querySelector(".results-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus("Showing all results. The Top Picks cards remain above for quick price checks.");
  saveState();
}

function backToTopPicks() {
  document.getElementById("topPicksHeading")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus("Back at Top Picks.");
  trackEvent("back_to_top_picks_clicked");
}

function updateStickyPriceBar() {
  if (!el.stickyPriceBar) return;
  const rows = results.filter(Boolean);
  const picks = topPickRows();
  if (!rows.length || !picks.length) {
    el.stickyPriceBar.classList.add("is-hidden");
    return;
  }
  const checked = rows.length;
  const worth = rows.filter(isWorthCheckingRow).length;
  const taken = rows.filter(row => row.available === false).length;
  const first = picks[0]?.normalized_domain || "top pick";
  const limitLabel = topPickPriceOpenLimitLabel(picks.length);
  if (el.stickyPriceHeadline) el.stickyPriceHeadline.textContent = `${checked.toLocaleString()} checked · ${worth.toLocaleString()} worth checking · ${taken.toLocaleString()} taken`;
  if (el.stickyPriceDetails) el.stickyPriceDetails.textContent = `Best choice: ${first}.`;
  if (el.stickyOpenTopPicksBtn) el.stickyOpenTopPicksBtn.textContent = `Check ${limitLabel}`;
  el.stickyPriceBar.classList.remove("is-hidden");
}

function exportCsv(scope = "all") {
  const rows = applyBatchMetrics(
    scope === "saved_shortlist" ? savedShortlistRows() :
    scope === "favorites" ? results.filter(r => r && favorites.has(r.normalized_domain)) :
    scope === "top_picks" ? topPickRows() :
    scope === "visible" ? displayedResults() :
    results.filter(Boolean)
  );
  if (!rows.length) {
    setStatus(scope === "favorites" || scope === "saved_shortlist" ? "No saved domains to export." : "No results to export.");
    return;
  }
  trackEvent(scope === "top_picks" ? "export_top_picks_clicked" : "export_clicked", { export_scope: scope, row_count: rows.length });
  const columns = [
    "favorite", "input", "normalized_domain", "effective_tld", "name_length", "domain_score", "score_label", "scoring_version",
    "batch_rank", "batch_percentile", "batch_label",
    "score_explanation", "scoring_style", "recommendation_type", "risk_flags",
    "tld_score", "length_score", "keyword_score", "clarity_score", "brand_score", "intent_score", "fit_score",
    "phrase_naturalness", "buyer_intent_score", "seo_utility_score", "brandability_score", "trust_risk_score",
    "abbreviation_penalty", "word_order_penalty", "abstract_saas_penalty", "legal_sensitive_flag", "top_pick_group", "tld_cap",
    "phrase_adjustment", "calibration_adjustment", "penalty_total", "penalty_reasons", "score_cap", "cap_reasons",
    "token_count", "token_coverage", "token_confidence", "detected_tokens", "score_components", "score_notes",
    "registrar_name", "registrar_url", "namecheap_url", "availability_status", "available", "check_source", "checked_at_utc", "rdap_url", "notes", "error"
  ];
  const csv = [
    columns.join(","),
    ...rows.map(row => {
      const enhanced = row;
      return columns.map(col => {
        if (col === "favorite") return csvCell(savedShortlist.has(enhanced.normalized_domain) ? "yes" : "");
        if (col === "registrar_name") return csvCell(selectedRegistrarLabel());
        if (col === "registrar_url") return csvCell(resultRegistrarUrl(enhanced));
        return csvCell(enhanced[col]);
      }).join(",");
    })
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = scope === "favorites" || scope === "saved_shortlist" ? `domain-saved-shortlist-${stamp}.csv` : scope === "top_picks" ? `domain-top-picks-${stamp}.csv` : `domain-results-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus(`Exported ${rows.length} ${scope === "favorites" || scope === "saved_shortlist" ? "saved" : "result"} rows to CSV.`);
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
  document.body.classList.toggle("is-checking", Boolean(checking));
  el.checkBtn.disabled = checking;
  if (el.simpleCheckBtn) el.simpleCheckBtn.disabled = checking;
  el.stopBtn.disabled = !checking;
  const otherButtons = [
    el.removeTakenBtn, el.keepAvailableBtn, el.openAllBtn, el.openAvailableBtn, el.openFavoritesBtn, el.openAllTopPicksBtn,
    el.exportBtn, el.exportFavoritesBtn, el.exportTopPicksBtn, el.copyAvailableBtn, el.copyFavoritesBtn, el.copyVisibleBtn,
    el.copyLinksBtn, el.showTopPicksBtn, el.copyTopPicksBtn, el.openTopPicksBtn, el.clearSessionBtn, el.startOverBtn,
    el.nextShowTopPicksBtn, el.nextExportTopPicksBtn, el.nextOpenTopPicksBtn
  ];
  for (const btn of otherButtons.filter(Boolean)) btn.disabled = checking;
  updateInputPreview();
  updateBestNextAction();
}

function updateInputCoach(count, forcedTitle = "", forcedText = "") {
  if (!el.inputCoachPanel) return;
  const hasInput = count > 0;
  el.inputCoachPanel.classList.toggle("is-ready", hasInput && count < 1000);
  el.inputCoachPanel.classList.toggle("is-large", count >= 1000);
  let title = forcedTitle;
  let text = forcedText;
  if (!title) {
    if (!count) {
      title = "Paste at least one domain to begin.";
      text = "Use one domain per line. URLs, TXT files, and CSV files are okay.";
    } else if (count >= 10000) {
      title = `${count.toLocaleString()} names found — use fast scoring first.`;
      text = "This is a huge list. Fast scoring ranks names quickly, then you can check price/availability only for the best few.";
    } else if (count >= 1000) {
      title = `${count.toLocaleString()} names found — large list mode recommended.`;
      text = "You can check normally, but fast scoring will feel much faster and prevents thousands of slow network checks.";
    } else {
      title = `${count.toLocaleString()} name${count === 1 ? "" : "s"} ready.`;
      text = "Click Check domains. After it finishes, start with Your best domain ideas.";
    }
  }
  if (el.inputCoachTitle) el.inputCoachTitle.textContent = title;
  if (el.inputCoachText) el.inputCoachText.textContent = text;
}

function updateInputCount() {
  const count = el.inputBox.value.split(/\r?\n/).filter(line => line.trim()).length;
  el.inputCount.textContent = `${count} line${count === 1 ? "" : "s"}`;
  updateInputCoach(count);
  updateLargeListPrompt(count);
  updateInputPreview();
  updateBestNextAction();
  updateSimpleOnboarding();
  saveState();
}
function updateLargeListPrompt(count) {
  if (!el.largeListPanel) return;
  const show = count >= 1000 && !el.scoreOnlyInput?.checked;
  el.largeListPanel.classList.toggle("is-hidden", !show);
  if (!show) return;
  const label = count.toLocaleString();
  if (el.largeListHeadline) el.largeListHeadline.textContent = `Large list detected: ${label} names.`;
  if (el.largeListDetails) {
    const severity = count >= 10000 ? "For a list this large, live availability checks may be slow or rate-limited." : "Live availability checks can take a while on bigger lists.";
    el.largeListDetails.textContent = `${severity} Use fast scoring first, review the top cards, then check price/availability only for the shortlist.`;
  }
}

function applyAdvancedMode() {
  const isAdvanced = Boolean(el.advancedModeInput && el.advancedModeInput.checked);
  document.body.classList.toggle("advanced-mode", isAdvanced);
  if (!isAdvanced) {
    const advancedSections = document.querySelectorAll(".advanced-only details[open]");
    advancedSections.forEach(section => { section.open = false; });
  }
}

function currentSettings() {
  return {
    advancedMode: el.advancedModeInput ? el.advancedModeInput.checked : false,
    workers: el.workersInput.value,
    delay: el.delayInput.value,
    timeout: el.timeoutInput.value,
    keywords: el.keywordsInput.value,
    registrar: el.registrarInput?.value || "namecheap",
    priceOpenLimit: el.priceOpenLimitInput?.value || "3",
    scoringStyle: el.scoringStyleInput?.value || "general",
    positiveWords: el.positiveWordsInput?.value || "",
    negativeWords: el.negativeWordsInput?.value || "",
    topPickCount: el.topPickCountInput?.value || "20",
    useRdap: el.useRdapInput.checked,
    useDns: el.useDnsInput.checked,
    scoreOnly: el.scoreOnlyInput ? el.scoreOnlyInput.checked : false,
    dedupe: el.dedupeInput.checked,
    filterStatus: el.filterStatus.value,
    filterSearch: el.filterSearch.value,
    filterTld: el.filterTld.value,
    filterMaxLen: el.filterMaxLen.value,
    resultQuickPreset,
    resultBadgeFilter,
    allResultsComfortable,
    showTakenResults,
    hideWeakPicks,
    filterNoHyphen: el.filterNoHyphen.checked,
    filterNoNumbers: el.filterNoNumbers.checked,
    sort: el.sortSelect.value
  };
}

function applySettings(settings = {}) {
  if (settings.advancedMode !== undefined && el.advancedModeInput) el.advancedModeInput.checked = Boolean(settings.advancedMode);
  applyAdvancedMode();
  if (settings.workers !== undefined) el.workersInput.value = settings.workers;
  if (settings.delay !== undefined) el.delayInput.value = settings.delay;
  if (settings.timeout !== undefined) el.timeoutInput.value = settings.timeout;
  if (settings.keywords !== undefined) el.keywordsInput.value = settings.keywords;
  if (settings.registrar !== undefined && el.registrarInput) el.registrarInput.value = REGISTRARS[settings.registrar] ? settings.registrar : "namecheap";
  if (settings.priceOpenLimit !== undefined && el.priceOpenLimitInput) el.priceOpenLimitInput.value = ["1", "3", "5", "10", "all"].includes(String(settings.priceOpenLimit)) ? String(settings.priceOpenLimit) : "3";
  if (settings.scoringStyle !== undefined && el.scoringStyleInput) el.scoringStyleInput.value = settings.scoringStyle;
  if (settings.positiveWords !== undefined && el.positiveWordsInput) el.positiveWordsInput.value = settings.positiveWords;
  if (settings.negativeWords !== undefined && el.negativeWordsInput) el.negativeWordsInput.value = settings.negativeWords;
  if (settings.topPickCount !== undefined && el.topPickCountInput) el.topPickCountInput.value = settings.topPickCount;
  if (settings.useRdap !== undefined) el.useRdapInput.checked = Boolean(settings.useRdap);
  if (settings.useDns !== undefined) el.useDnsInput.checked = Boolean(settings.useDns);
  if (settings.scoreOnly !== undefined && el.scoreOnlyInput) el.scoreOnlyInput.checked = Boolean(settings.scoreOnly);
  if (settings.dedupe !== undefined) el.dedupeInput.checked = Boolean(settings.dedupe);
  if (settings.resultQuickPreset !== undefined) resultQuickPreset = ["all", "worth", "strong", "com", "saved", "checked_saved", "review"].includes(String(settings.resultQuickPreset)) ? String(settings.resultQuickPreset) : "all";
  if (settings.resultBadgeFilter !== undefined) resultBadgeFilter = normalizeResultBadgeFilter(settings.resultBadgeFilter);
  if (settings.allResultsComfortable !== undefined) allResultsComfortable = Boolean(settings.allResultsComfortable);
  if (settings.showTakenResults !== undefined) showTakenResults = Boolean(settings.showTakenResults);
  updateAllResultsDensity();
  if (settings.hideWeakPicks !== undefined) hideWeakPicks = Boolean(settings.hideWeakPicks);
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
  const cleaned = results.filter(Boolean);
  // localStorage gets slow and can exceed browser quotas with giant batches.
  // Save settings/input/favorites, but only persist result rows for smaller sessions.
  const state = {
    input: el.inputBox.value,
    results: cleaned.length > 5000 ? [] : cleaned.slice(0, 5000),
    large_result_count_not_saved: cleaned.length > 5000 ? cleaned.length : 0,
    favorites: [...favorites],
    saved_shortlist: [...savedShortlist],
    saved_notes: savedNotes,
    saved_checked: [...savedChecked],
    saved_winner: savedWinner,
    settings: currentSettings()
  };
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    const smallerState = { ...state, results: [] };
    try { localStorage.setItem(STATE_KEY, JSON.stringify(smallerState)); } catch {}
  }
}

function loadState() {
  const saved = localStorage.getItem(STATE_KEY);
  loadSavedShortlistData();
  loadRecentRunsData();
  if (!saved) {
    applyAdvancedMode();
    updateInputCount();
    renderResults();
    return;
  }
  try {
    const state = JSON.parse(saved);
    if (state.input) el.inputBox.value = state.input;
    applySettings(state.settings || {});
    favorites = new Set(Array.isArray(state.favorites) ? state.favorites.map(normalizeSavedDomain).filter(Boolean) : []);
    if (Array.isArray(state.saved_shortlist)) {
      for (const domain of state.saved_shortlist.map(normalizeSavedDomain).filter(Boolean)) savedShortlist.add(domain);
    }
    if (state.saved_notes && typeof state.saved_notes === "object" && !Array.isArray(state.saved_notes)) savedNotes = { ...savedNotes, ...state.saved_notes };
    if (Array.isArray(state.saved_checked)) {
      for (const domain of state.saved_checked.map(normalizeSavedDomain).filter(Boolean)) savedChecked.add(domain);
    }
    if (state.saved_winner) savedWinner = normalizeSavedDomain(state.saved_winner);
    syncFavoritesToSavedShortlist();
    results = Array.isArray(state.results) ? applyBatchMetrics(state.results) : [];
  } catch {
    results = [];
    favorites = new Set();
  }
  syncFavoritesToSavedShortlist();
  applyAdvancedMode();
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
  domain = normalizeSavedDomain(domain);
  if (favorites.has(domain) || savedShortlist.has(domain)) {
    favorites.delete(domain);
    savedShortlist.delete(domain);
    delete savedNotes[domain];
    savedChecked.delete(domain);
    setResultCardFeedback(domain, "Removed", "removed");
    setStatus(`${domain} removed from saved.`);
  } else {
    favorites.add(domain);
    savedShortlist.add(domain);
    setResultCardFeedback(domain, "Saved", "saved");
    setStatus(`${domain} saved as finalist.`);
  }
  saveSavedShortlistData();
  refreshResultsScoring();
  renderResults();
  saveState();
}

function clearSession() {
  if (!confirm("Clear saved input, results, filters, and saved names from this browser?")) return;
  localStorage.removeItem(STATE_KEY);
  topPicksExpanded = false;
  guidedPickCount = 3;
  winnerDoneShown = false;
  results = [];
  favorites = new Set();
  savedShortlist = new Set();
  savedNotes = {};
  savedChecked = new Set();
  savedWinner = "";
  winnerDoneShown = false;
  localStorage.removeItem(SAVED_WINNER_KEY);
  el.inputBox.value = "";
  applySettings({
    advancedMode: false,
    workers: "2", delay: "250", timeout: "12000", keywords: "", scoringStyle: "general",
    positiveWords: "", negativeWords: "", topPickCount: "20", useRdap: true, useDns: true, dedupe: true,
    filterStatus: "all", filterSearch: "", filterTld: "", filterMaxLen: "", filterNoHyphen: false, filterNoNumbers: false, sort: "score_desc"
  });
  updateInputCount();
  renderResults();
  setStatus("Cleared saved session.");
}


function startOverUndoSnapshot() {
  return {
    input: el.inputBox ? el.inputBox.value : "",
    results: results.filter(Boolean).slice(0, 5000),
    favorites: [...favorites],
    saved_shortlist: [...savedShortlist],
    saved_notes: savedNotes,
    saved_checked: [...savedChecked],
    saved_winner: savedWinner,
    compare: [...compareSet],
    settings: currentSettings(),
    saved_at: new Date().toISOString()
  };
}

function saveStartOverUndoSnapshot() {
  const snapshot = startOverUndoSnapshot();
  const hasAnything = Boolean(snapshot.input.trim() || snapshot.results.length || snapshot.favorites.length || snapshot.saved_shortlist.length);
  if (!hasAnything) return false;
  try {
    localStorage.setItem(START_OVER_UNDO_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

function getStartOverUndoSnapshot() {
  try {
    const raw = localStorage.getItem(START_OVER_UNDO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function updateStartOverUndoPanel() {
  if (!el.undoStartOverPanel) return;
  const snapshot = getStartOverUndoSnapshot();
  const show = Boolean(snapshot && (String(snapshot.input || "").trim() || (Array.isArray(snapshot.results) && snapshot.results.length) || (Array.isArray(snapshot.saved_shortlist) && snapshot.saved_shortlist.length)));
  el.undoStartOverPanel.classList.toggle("is-hidden", !show);
}

function restoreStartOverUndo() {
  const snapshot = getStartOverUndoSnapshot();
  if (!snapshot) {
    setStatus("There is no start-over session to restore.");
    updateStartOverUndoPanel();
    return;
  }
  if (el.inputBox) el.inputBox.value = snapshot.input || "";
  applySettings(snapshot.settings || {});
  results = Array.isArray(snapshot.results) ? applyBatchMetrics(snapshot.results) : [];
  favorites = new Set(Array.isArray(snapshot.favorites) ? snapshot.favorites.map(normalizeSavedDomain).filter(Boolean) : []);
  savedShortlist = new Set(Array.isArray(snapshot.saved_shortlist) ? snapshot.saved_shortlist.map(normalizeSavedDomain).filter(Boolean) : []);
  savedNotes = snapshot.saved_notes && typeof snapshot.saved_notes === "object" && !Array.isArray(snapshot.saved_notes) ? snapshot.saved_notes : {};
  savedChecked = new Set(Array.isArray(snapshot.saved_checked) ? snapshot.saved_checked.map(normalizeSavedDomain).filter(Boolean) : []);
  savedWinner = normalizeSavedDomain(snapshot.saved_winner || "");
  compareSet = new Set(Array.isArray(snapshot.compare) ? snapshot.compare.map(normalizeSavedDomain).filter(Boolean).slice(0, COMPARE_LIMIT) : []);
  syncFavoritesToSavedShortlist();
  saveSavedShortlistData();
  saveState();
  localStorage.removeItem(START_OVER_UNDO_KEY);
  updateInputCount();
  updateInputPreview();
  renderResults();
  updateStartOverUndoPanel();
  setStatus("Restored the session you cleared.");
  trackEvent("start_over_undo_restored");
}

function dismissStartOverUndo() {
  localStorage.removeItem(START_OVER_UNDO_KEY);
  updateStartOverUndoPanel();
  setStatus("Undo dismissed.");
}

function editInputAfterResults() {
  document.body.classList.add("editing-input");
  el.inputBox?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => el.inputBox?.focus(), 120);
  setStatus("Editing the pasted list. Check valid domains again when you are ready.");
}

function startOverSimple() {
  const hasSaved = Boolean(savedShortlist.size || favorites.size);
  let archivedBeforeReset = false;
  if (hasSaved) {
    if (!confirm("Start over and clear your saved finalists from this browser?")) return;
    if (confirm("Archive this session before starting over?")) {
      archivedBeforeReset = archiveCurrentSession({ silent: true });
      if (!archivedBeforeReset && !confirm("The archive could not be saved. Start over anyway?")) return;
    }
  }
  const canUndo = saveStartOverUndoSnapshot();
  stopRequested = true;
  topPicksExpanded = false;
  guidedPickCount = 3;
  winnerDoneShown = false;
  results = [];
  favorites = new Set();
  savedShortlist = new Set();
  savedNotes = {};
  savedChecked = new Set();
  savedWinner = "";
  if (el.inputBox) el.inputBox.value = "";
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(SAVED_SHORTLIST_KEY);
  localStorage.removeItem(SAVED_NOTES_KEY);
  localStorage.removeItem(SAVED_CHECKED_KEY);
  localStorage.removeItem(SAVED_WINNER_KEY);
  document.body.classList.remove("results-ready", "has-results", "has-saved", "show-all-results", "editing-input");
  updateInputCount();
  updateInputPreview();
  updateBestNextAction();
  renderResults();
  renderArchiveTools();
  saveSavedShortlistData();
  updateStartOverUndoPanel();
  setStatus(archivedBeforeReset ? "Archived this session, then started over. You can undo if needed." : (canUndo ? "Started over. You can undo if needed." : "Started over. Paste a new list or try the sample."));
  trackEvent("start_over_clicked", { cleared_saved: hasSaved, undo_saved: canUndo, archived_before_reset: archivedBeforeReset });
  if (el.inputBox) el.inputBox.focus();
}

const QUICK_START_TEMPLATES = {
  startup: {
    label: "Startup names",
    keywords: "startup, platform, app",
    scoringStyle: "brandable",
    domains: ["clearpilot.com", "launchgrid.io", "founderpath.com", "stackbeam.com", "productnest.com", "brandforge.app"]
  },
  local: {
    label: "Local business",
    keywords: "roofing, repair, quote",
    scoringStyle: "local",
    domains: ["denverroofquote.com", "austinrepairpros.com", "cityplumbingsolutions.com", "quickhvacquote.com", "localroofhelp.com", "repaircrew.com"]
  },
  content: {
    label: "Blog/content",
    keywords: "guide, tips, learn",
    scoringStyle: "content",
    domains: ["simplestartguide.com", "dailybuildtips.com", "learnwithclear.com", "homeprojectguide.com", "budgettravelnotes.com", "gardenstarterkit.com"]
  },
  aiapp: {
    label: "AI/app names",
    keywords: "ai, app, assistant",
    scoringStyle: "brandable",
    domains: ["taskpilot.ai", "briefbuilder.app", "promptledger.com", "clearassistant.ai", "workflowmate.app", "smartdrafts.io"]
  },
  store: {
    label: "Product/store",
    keywords: "shop, store, gear",
    scoringStyle: "ecommerce",
    domains: ["trailgearshop.com", "modernpetstore.com", "kitchenkitco.com", "shopbrighttools.com", "dailyfitgear.com", "cleanhomegoods.com"]
  },
  seo: {
    label: "SEO domains",
    keywords: "calculator, guide, checklist",
    scoringStyle: "content",
    domains: ["rentorbuycalculator.com", "smallbusinesschecklist.com", "movingcostguide.com", "estateinventorychecklist.com", "roofrepaircalculator.com", "collegebudgetplanner.com"]
  }
};

function loadQuickStartTemplate(kind) {
  const template = QUICK_START_TEMPLATES[kind];
  if (!template) return;
  trackEvent("template_loaded", { template: kind });
  el.inputBox.value = template.domains.join("\n");
  if (el.keywordsInput) el.keywordsInput.value = template.keywords;
  if (el.scoringStyleInput) el.scoringStyleInput.value = template.scoringStyle;
  updateInputCount();
  rescoreResults();
  setStatus(`Loaded ${template.label} examples. Replace them with your own names, then click Check domains.`);
}


function applyPublicBranding() {
  document.title = `${PUBLIC_SITE_NAME} — Simple Domain Shortlisting`;
  const appNameMeta = document.querySelector('meta[name="application-name"]');
  if (appNameMeta) appNameMeta.setAttribute("content", PUBLIC_SITE_NAME);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${PUBLIC_SITE_NAME} — Simple Domain Shortlisting`);
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute("content", `${PUBLIC_SITE_NAME} — Simple Domain Shortlisting`);
}

async function shareAppLink() {
  const shareUrl = window.location.href.split("#")[0];
  const shareData = {
    title: PUBLIC_SITE_NAME,
    text: `${PUBLIC_SITE_TAGLINE} Paste ideas, save finalists, and check final price at a registrar.`,
    url: shareUrl
  };
  trackEvent("share_app_clicked");
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      setStatus(`Share sheet opened for ${PUBLIC_SITE_NAME}.`);
      return;
    } catch (error) {
      if (error && error.name === "AbortError") {
        setStatus("Share canceled.");
        return;
      }
    }
  }
  await copyText(shareUrl, "app link");
}

function bindEvents() {
  el.inputBox.addEventListener("input", () => { updateInputCount(); updateFirstRunGuide(); });
  el.loadTxtBtn.addEventListener("click", () => el.fileInput.click());
  el.fileInput.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (file) {
      trackEvent("file_uploaded", { file_type: (file.name || "").split(".").pop() || "unknown" });
      loadFile(file);
    }
    event.target.value = "";
  });
  el.clearInputBtn.addEventListener("click", () => {
    el.inputBox.value = "";
    updateInputCount();
  });
  el.pasteDemoBtn.addEventListener("click", () => {
    trackEvent("sample_loaded");
    el.inputBox.value = [
      "rentorbuyguide.com",
      "buyvsrentcalculator.com",
      "diyprobatekit.com",
      "example.com",
      "google.com",
      "probate-helper-247.com"
    ].join("\n");
    el.keywordsInput.value = "rent, buy, probate";
    rescoreResults();
    updateInputCount();
    setStatus("Loaded sample domains. Click Check domains, then review the Top Picks cards.");
  });
  if (el.heroSampleBtn) el.heroSampleBtn.addEventListener("click", () => el.pasteDemoBtn.click());
  if (el.simpleOnboardingSampleBtn) el.simpleOnboardingSampleBtn.addEventListener("click", () => {
    trackEvent("simple_onboarding_sample_clicked");
    el.pasteDemoBtn.click();
    updateSimpleOnboarding();
  });
  if (el.simpleOnboardingPasteBtn) el.simpleOnboardingPasteBtn.addEventListener("click", () => {
    trackEvent("simple_onboarding_paste_clicked");
    focusDomainInput();
    setStatus("Paste one domain idea per line, then click Find best domains.");
  });
  if (el.simpleOnboardingDismissBtn) el.simpleOnboardingDismissBtn.addEventListener("click", dismissSimpleOnboarding);
  if (el.guidedSampleBtn) el.guidedSampleBtn.addEventListener("click", () => el.pasteDemoBtn.click());
  if (el.guidedPasteFocusBtn) el.guidedPasteFocusBtn.addEventListener("click", () => {
    el.inputBox?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => el.inputBox?.focus(), 250);
    setStatus("Paste one domain per line, then click Check domains.");
    trackEvent("guided_paste_clicked");
  });
  if (el.guidedFastModeBtn) el.guidedFastModeBtn.addEventListener("click", () => {
    if (el.scoreOnlyInput) el.scoreOnlyInput.checked = true;
    updateInputCount();
    el.inputBox?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => el.inputBox?.focus(), 250);
    setStatus("Fast scoring is on. Paste your large list, then click Check domains.");
    trackEvent("fast_scoring_enabled", { source: "guided_start" });
    saveState();
  });
  if (el.shareAppLinkBtn) el.shareAppLinkBtn.addEventListener("click", shareAppLink);
  document.querySelectorAll("[data-template-kind]").forEach(button => {
    button.addEventListener("click", () => loadQuickStartTemplate(button.getAttribute("data-template-kind")));
  });
  if (el.largeListScoreOnlyBtn) {
    el.largeListScoreOnlyBtn.addEventListener("click", () => {
      if (el.scoreOnlyInput) el.scoreOnlyInput.checked = true;
      updateInputCount();
      saveState();
      trackEvent("fast_scoring_enabled", { source: "large_list_prompt" });
      setStatus("Fast scoring enabled. This ranks the list first and skips slow live availability checks.");
    });
  }
  if (el.largeListDismissBtn) {
    el.largeListDismissBtn.addEventListener("click", () => {
      if (el.largeListPanel) el.largeListPanel.classList.add("is-hidden");
      setStatus("Normal availability checks kept. Large batches may run slowly or hit public service limits.");
    });
  }
  if (el.scoreOnlyInput) {
    el.scoreOnlyInput.addEventListener("change", () => updateInputCount());
  }
  if (el.previewCheckBtn) el.previewCheckBtn.addEventListener("click", checkCleanValidDomains);
  if (el.previewReviewInvalidBtn) el.previewReviewInvalidBtn.addEventListener("click", toggleInvalidReview);
  if (el.previewCopyCleanBtn) el.previewCopyCleanBtn.addEventListener("click", copyCleanValidDomains);
  if (el.bestNextPrimaryBtn) el.bestNextPrimaryBtn.addEventListener("click", () => runBestNextAction(bestNextPrimaryAction));
  if (el.bestNextSecondaryBtn) el.bestNextSecondaryBtn.addEventListener("click", () => runBestNextAction(bestNextSecondaryAction));
  if (el.advancedModeInput) {
    el.advancedModeInput.addEventListener("change", () => {
      applyAdvancedMode();
      if (results.filter(Boolean).length) renderResults();
      saveState();
      trackEvent(el.advancedModeInput.checked ? "advanced_mode_enabled" : "simple_mode_enabled");
      setStatus(el.advancedModeInput.checked ? "Advanced controls shown." : "Simple mode shown. Advanced controls are hidden." );
    });
  }

  el.checkBtn.addEventListener("click", runChecks);
  if (el.simpleCheckBtn) el.simpleCheckBtn.addEventListener("click", runChecks);
  el.stopBtn.addEventListener("click", () => {
    stopRequested = true;
    setStatus("Stopping after current checks finish...");
  });
  el.removeTakenBtn.addEventListener("click", removeTaken);
  if (el.removeUnsavedBtn) el.removeUnsavedBtn.addEventListener("click", removeUnsavedResults);
  el.keepAvailableBtn.addEventListener("click", keepAvailableOnly);
  el.openAllBtn.addEventListener("click", () => openLinks(displayedResults(), "visible", { forceConfirm: true }));
  el.openAvailableBtn.addEventListener("click", () => openLinks(results.filter(r => r && r.available === true), "available", { forceConfirm: true }));
  el.openFavoritesBtn.addEventListener("click", () => openLinks(savedShortlistRows(), "saved", { forceConfirm: true }));
  if (el.openAllTopPicksBtn) el.openAllTopPicksBtn.addEventListener("click", openAllTopPicks);
  el.exportBtn.addEventListener("click", () => exportCsv("all"));
  el.exportFavoritesBtn.addEventListener("click", () => exportCsv("saved_shortlist"));
  if (el.exportTopPicksBtn) el.exportTopPicksBtn.addEventListener("click", () => exportCsv("top_picks"));
  el.copyAvailableBtn.addEventListener("click", copyAvailable);
  el.copyFavoritesBtn.addEventListener("click", copyFavorites);
  el.copyVisibleBtn.addEventListener("click", copyVisible);
  if (el.copyVisibleResultsBtn) el.copyVisibleResultsBtn.addEventListener("click", copyVisibleResults);
  if (el.copyWorthCheckingBtn) el.copyWorthCheckingBtn.addEventListener("click", copyWorthChecking);
  if (el.copyVisibleWorthReasonsBtn) el.copyVisibleWorthReasonsBtn.addEventListener("click", copyVisibleWorthCheckingWithReasons);
  if (el.saveVisibleWorthCheckingBtn) el.saveVisibleWorthCheckingBtn.addEventListener("click", saveVisibleWorthCheckingResults);
  if (el.undoSaveVisibleBtn) el.undoSaveVisibleBtn.addEventListener("click", undoLastBulkSave);
  if (el.allResultsBadgeLegend) {
    el.allResultsBadgeLegend.addEventListener("click", event => {
      const button = event.target.closest("button[data-result-badge-filter]");
      if (!button) return;
      applyResultBadgeFilter(button.getAttribute("data-result-badge-filter"));
    });
  }
  if (el.hideWeakNamesBtn) el.hideWeakNamesBtn.addEventListener("click", toggleHideWeakPicks);
  if (el.takenToggleBtn) el.takenToggleBtn.addEventListener("click", toggleTakenResults);
  if (el.allResultsSortPills) {
    el.allResultsSortPills.addEventListener("click", event => {
      const button = event.target.closest("button[data-result-sort]");
      if (!button) return;
      applyAllResultsSort(button.getAttribute("data-result-sort"));
    });
  }
  if (el.showEverythingResultsBtn) el.showEverythingResultsBtn.addEventListener("click", showEverythingResults);
  el.copyLinksBtn.addEventListener("click", copyVisibleLinks);
  el.showTopPicksBtn.addEventListener("click", showTopPicks);
  el.copyTopPicksBtn.addEventListener("click", copyTopPicks);
  el.openTopPicksBtn.addEventListener("click", openTopPicks);
  if (el.nextShowTopPicksBtn) el.nextShowTopPicksBtn.addEventListener("click", showTopPicks);
  if (el.nextExportTopPicksBtn) el.nextExportTopPicksBtn.addEventListener("click", () => exportCsv("top_picks"));
  if (el.nextOpenTopPicksBtn) el.nextOpenTopPicksBtn.addEventListener("click", openTopPicks);
  if (el.cardOpenTopPicksBtn) el.cardOpenTopPicksBtn.addEventListener("click", openTopPicks);
  if (el.cardCheckBestChoiceBtn) el.cardCheckBestChoiceBtn.addEventListener("click", openBestChoiceTopPick);
  if (el.cardCopyTopPicksBtn) el.cardCopyTopPicksBtn.addEventListener("click", copyTopPicks);
  if (el.cardCopyBestChoiceBtn) el.cardCopyBestChoiceBtn.addEventListener("click", copyBestChoiceTopPick);
  if (el.cardCopyBest3Btn) el.cardCopyBest3Btn.addEventListener("click", copyBestThreeTopPicks);
  if (el.cardCopyBestReasonsBtn) el.cardCopyBestReasonsBtn.addEventListener("click", copyBestThreeWithReasons);
  if (el.cardCopyPriceLinksBtn) el.cardCopyPriceLinksBtn.addEventListener("click", copyTopThreePriceLinks);
  if (el.hideWeakPicksBtn) el.hideWeakPicksBtn.addEventListener("click", toggleHideWeakPicks);
  if (el.topPicksShowMoreBtn) el.topPicksShowMoreBtn.addEventListener("click", toggleTopPicksExpanded);
  if (el.showNextPickBtn) el.showNextPickBtn.addEventListener("click", showNextGuidedPick);
  if (el.cardExportTopPicksBtn) el.cardExportTopPicksBtn.addEventListener("click", () => exportCsv("top_picks"));
  if (el.topPicksViewAllBtn) el.topPicksViewAllBtn.addEventListener("click", showAllResultsSection);
  if (el.topPicksNewSearchBtn) el.topPicksNewSearchBtn.addEventListener("click", startOverSimple);
  if (el.editInputBtn) el.editInputBtn.addEventListener("click", editInputAfterResults);
  if (el.allResultsBackTopPicksBtn) el.allResultsBackTopPicksBtn.addEventListener("click", backToTopPicks);
  if (el.allResultsDensityBtn) el.allResultsDensityBtn.addEventListener("click", toggleAllResultsDensity);
  if (el.editResultsFiltersBtn) el.editResultsFiltersBtn.addEventListener("click", toggleResultsFiltersPanel);
  if (el.saveAllWorthCheckingBtn) el.saveAllWorthCheckingBtn.addEventListener("click", saveAllWorthCheckingResults);
  if (el.nextViewAllBtn) el.nextViewAllBtn.addEventListener("click", showAllResultsSection);
  if (el.stickyViewAllBtn) el.stickyViewAllBtn.addEventListener("click", showAllResultsSection);
  if (el.stickyOpenTopPicksBtn) el.stickyOpenTopPicksBtn.addEventListener("click", openTopPicks);
  if (el.stickyNewSearchBtn) el.stickyNewSearchBtn.addEventListener("click", startOverSimple);
  document.addEventListener("keydown", handleResultsKeyboardShortcuts);
  document.querySelectorAll("[data-results-preset]").forEach(button => {
    button.addEventListener("click", () => {
      resultQuickPreset = button.getAttribute("data-results-preset") || "all";
      resultBadgeFilter = "all";
      if (resultQuickPreset === "saved" && el.filterStatus) el.filterStatus.value = "all";
      resetRenderLimit();
      document.body.classList.add("show-all-results");
      renderResults();
      trackEvent("all_results_quick_filter", { preset: resultQuickPreset });
      setStatus(`Showing ${resultPresetLabel().toLowerCase()}. Use Reset view to show everything again.`);
      saveState();
    });
  });

  if (el.compareClearBtn) el.compareClearBtn.addEventListener("click", clearComparison);
  if (el.compareOpenBtn) el.compareOpenBtn.addEventListener("click", openComparisonPriceChecks);
  if (el.compareCopyBtn) el.compareCopyBtn.addEventListener("click", copyComparison);
  if (el.compareItems) {
    el.compareItems.addEventListener("click", event => {
      const compareButton = event.target.closest("button[data-compare-domain]");
      if (compareButton) {
        toggleCompare(compareButton.getAttribute("data-compare-domain"));
        return;
      }
      const checkedButton = event.target.closest("button[data-saved-checked]");
      if (checkedButton) {
        toggleSavedChecked(checkedButton.getAttribute("data-saved-checked"));
        return;
      }
      const winnerButton = event.target.closest("button[data-saved-winner]");
      if (winnerButton) {
        pickSavedWinner(winnerButton.getAttribute("data-saved-winner"));
        return;
      }
      const detailButton = event.target.closest("button[data-detail-domain]");
      if (detailButton) {
        openDomainDetail(detailButton.getAttribute("data-detail-domain"));
        return;
      }
      const copyButton = event.target.closest("button[data-copy-domain]");
      if (copyButton) {
        trackEvent("compare_domain_copied");
        copyText(copyButton.getAttribute("data-copy-domain"), "domain");
      }
    });
  }
  if (el.returnCheckSavedBtn) el.returnCheckSavedBtn.addEventListener("click", () => {
    trackEvent("return_panel_check_saved_clicked", { saved_count: savedShortlist.size });
    openSavedShortlistPrices();
  });
  if (el.returnRestoreRecentBtn) el.returnRestoreRecentBtn.addEventListener("click", restoreLatestRecentRun);
  if (el.returnViewSavedBtn) el.returnViewSavedBtn.addEventListener("click", viewSavedShortlistPanel);
  if (el.analyticsTestBtn) el.analyticsTestBtn.addEventListener("click", () => {
    trackEvent("analytics_test_event", { source: "owner_panel", safe_event: true });
    setStatus("Sent a safe analytics test event. If local debug is on, it appears in the analytics panel.");
  });
  if (el.analyticsCopyBtn) el.analyticsCopyBtn.addEventListener("click", () => {
    const events = analyticsDebugEvents();
    copyText(JSON.stringify(events, null, 2), "local analytics debug events");
    trackEvent("analytics_debug_copied", { debug_event_count: events.length });
  });
  if (el.analyticsClearBtn) el.analyticsClearBtn.addEventListener("click", () => {
    localStorage.removeItem(ANALYTICS_CONFIG.storageKey);
    renderAnalyticsPanel();
    setStatus("Local analytics debug events cleared from this browser.");
  });
  if (el.savedCheckPriceBtn) el.savedCheckPriceBtn.addEventListener("click", openSavedShortlistPrices);
  if (el.savedReadyPriceBtn) el.savedReadyPriceBtn.addEventListener("click", openSavedShortlistPrices);
  if (el.savedReadyNewSearchBtn) el.savedReadyNewSearchBtn.addEventListener("click", startOverSimple);
  if (el.savedReportBtn) el.savedReportBtn.addEventListener("click", copySavedDecisionReport);
  if (el.finalReportCopyBtn) el.finalReportCopyBtn.addEventListener("click", copySavedDecisionReport);
  if (el.finalReportCleanBtn) el.finalReportCleanBtn.addEventListener("click", copyCleanReport);
  if (el.finalReportDownloadCleanBtn) el.finalReportDownloadCleanBtn.addEventListener("click", downloadCleanReport);
  if (el.finalReportDownloadBtn) el.finalReportDownloadBtn.addEventListener("click", downloadSavedDecisionReport);
  if (el.finalReportPriceBtn) el.finalReportPriceBtn.addEventListener("click", () => {
    trackEvent("final_report_price_clicked", { saved_count: savedShortlist.size });
    openSavedShortlistPrices();
  });
  if (el.savedCopyBtn) el.savedCopyBtn.addEventListener("click", copySavedShortlist);
  if (el.savedCopyWinnerBtn) el.savedCopyWinnerBtn.addEventListener("click", copyWinnerDomain);
  if (el.savedOpenWinnerBtn) el.savedOpenWinnerBtn.addEventListener("click", openWinnerLink);
  if (el.savedCopyWinnerLinkBtn) el.savedCopyWinnerLinkBtn.addEventListener("click", copyWinnerWithLink);
  if (el.savedCopyWinnerReportBtn) el.savedCopyWinnerReportBtn.addEventListener("click", copyWinnerReport);
  if (el.savedDoneBtn) el.savedDoneBtn.addEventListener("click", finishWinnerDone);
  if (el.savedNewSearchAfterDoneBtn) el.savedNewSearchAfterDoneBtn.addEventListener("click", startNewSearchAfterDone);
  if (el.savedCopyLinksBtn) el.savedCopyLinksBtn.addEventListener("click", copySavedWithLinks);
  if (el.savedCopyUncheckedLinksBtn) el.savedCopyUncheckedLinksBtn.addEventListener("click", copyUncheckedSavedLinks);
  if (el.savedCopyUncheckedNamesBtn) el.savedCopyUncheckedNamesBtn.addEventListener("click", copyUncheckedSavedNames);
  if (el.savedOpenUncheckedBtn) el.savedOpenUncheckedBtn.addEventListener("click", openUncheckedSavedLinks);
  if (el.savedOpenRemainingBtn) el.savedOpenRemainingBtn.addEventListener("click", openUncheckedSavedLinks);
  if (el.savedViewOnlyBtn) el.savedViewOnlyBtn.addEventListener("click", viewSavedOnlyResults);
  if (el.savedShowUncheckedBtn) el.savedShowUncheckedBtn.addEventListener("click", toggleSavedUncheckedView);
  if (el.savedClearNotesBtn) el.savedClearNotesBtn.addEventListener("click", clearSavedNotes);
  if (el.savedClearCheckedBtn) el.savedClearCheckedBtn.addEventListener("click", clearSavedCheckedMarks);
  if (el.savedClearWinnerBtn) el.savedClearWinnerBtn.addEventListener("click", clearSavedWinner);
  if (el.savedClearCompletedBtn) el.savedClearCompletedBtn.addEventListener("click", clearCompletedCheckedFinalists);
  if (el.savedExportBtn) el.savedExportBtn.addEventListener("click", () => exportCsv("saved_shortlist"));
  if (el.savedClearBtn) el.savedClearBtn.addEventListener("click", clearSavedShortlist);
  if (el.recentRunsClearBtn) el.recentRunsClearBtn.addEventListener("click", clearRecentRuns);
  if (el.savedShortlistItems) {
    el.savedShortlistItems.addEventListener("click", event => {
      const removeButton = event.target.closest("button[data-remove-saved]");
      if (removeButton) {
        const domain = normalizeSavedDomain(removeButton.getAttribute("data-remove-saved"));
        savedShortlist.delete(domain);
        favorites.delete(domain);
        delete savedNotes[domain];
        savedChecked.delete(domain);
        clearSavedWinnerIfNeeded(domain);
        saveSavedShortlistData();
        saveState();
        renderResults();
        setStatus(`${domain} removed from saved shortlist.`);
        return;
      }
      const checkedButton = event.target.closest("button[data-saved-checked]");
      if (checkedButton) {
        toggleSavedChecked(checkedButton.getAttribute("data-saved-checked"));
        return;
      }
      const winnerButton = event.target.closest("button[data-saved-winner]");
      if (winnerButton) {
        pickSavedWinner(winnerButton.getAttribute("data-saved-winner"));
        return;
      }
      const detailButton = event.target.closest("button[data-detail-domain]");
      if (detailButton) {
        openDomainDetail(detailButton.getAttribute("data-detail-domain"));
        return;
      }
      const compareButton = event.target.closest("button[data-compare-domain]");
      if (compareButton) {
        toggleCompare(compareButton.getAttribute("data-compare-domain"));
        return;
      }
      const copyButton = event.target.closest("button[data-copy-domain]");
      if (copyButton) {
        copyText(copyButton.getAttribute("data-copy-domain"), "domain");
        trackEvent("saved_shortlist_domain_copied");
      }
    });
    el.savedShortlistItems.addEventListener("input", event => {
      const field = event.target.closest("[data-saved-note-domain]");
      if (!field) return;
      setSavedNote(field.getAttribute("data-saved-note-domain"), field.value);
      renderFinalReport();
    });
    el.savedShortlistItems.addEventListener("change", event => {
      const field = event.target.closest("[data-saved-note-domain]");
      if (!field) return;
      setStatus("Saved note updated.");
    });
  }
  if (el.recentRunsItems) {
    el.recentRunsItems.addEventListener("click", event => {
      const restoreButton = event.target.closest("button[data-restore-run]");
      if (restoreButton) {
        restoreRecentRun(restoreButton.getAttribute("data-restore-run"));
        return;
      }
      const deleteButton = event.target.closest("button[data-delete-run]");
      if (deleteButton) {
        deleteRecentRun(deleteButton.getAttribute("data-delete-run"));
      }
    });
  }

  if (el.runPreflightBtn) el.runPreflightBtn.addEventListener("click", runOwnerPreflight);
  if (el.copyPreflightReportBtn) el.copyPreflightReportBtn.addEventListener("click", copyPreflightReport);
  if (el.copyLaunchNeedsBtn) el.copyLaunchNeedsBtn.addEventListener("click", copyLaunchNeedsList);
  if (el.copyLaunchInputsRequestBtn) el.copyLaunchInputsRequestBtn.addEventListener("click", copyLaunchNeedsList);

  if (el.firstRunDismissBtn) el.firstRunDismissBtn.addEventListener("click", dismissFirstRunGuide);
  if (el.domainDetailCloseBtn) el.domainDetailCloseBtn.addEventListener("click", closeDomainDetail);
  if (el.domainDetailOverlay) {
    el.domainDetailOverlay.addEventListener("click", event => {
      if (event.target === el.domainDetailOverlay) closeDomainDetail();
    });
  }
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && el.domainDetailOverlay && !el.domainDetailOverlay.classList.contains("is-hidden")) closeDomainDetail();
  });
  if (el.startOverBtn) el.startOverBtn.addEventListener("click", startOverSimple);
  if (el.undoStartOverBtn) el.undoStartOverBtn.addEventListener("click", restoreStartOverUndo);
  if (el.dismissStartOverUndoBtn) el.dismissStartOverUndoBtn.addEventListener("click", dismissStartOverUndo);
  el.clearSessionBtn.addEventListener("click", clearSession);
  if (el.archiveSessionBtn) el.archiveSessionBtn.addEventListener("click", () => archiveCurrentSession());
  if (el.archiveDownloadCurrentBtn) el.archiveDownloadCurrentBtn.addEventListener("click", downloadCurrentArchiveJson);
  if (el.archiveImportBtn) el.archiveImportBtn.addEventListener("click", () => openArchiveImportPicker("restore"));
  if (el.archiveImportSaveBtn) el.archiveImportSaveBtn.addEventListener("click", () => openArchiveImportPicker("save"));
  if (el.archiveDownloadAllBtn) el.archiveDownloadAllBtn.addEventListener("click", downloadAllArchivesJson);
  if (el.archiveHealthBtn) el.archiveHealthBtn.addEventListener("click", checkSessionArchives);
  if (el.archiveRepairLabelsBtn) el.archiveRepairLabelsBtn.addEventListener("click", repairArchiveLabels);
  if (el.archiveClearBrokenBtn) el.archiveClearBrokenBtn.addEventListener("click", clearBrokenArchives);
  if (el.archiveMergeDuplicateLabelsBtn) el.archiveMergeDuplicateLabelsBtn.addEventListener("click", mergeDuplicateArchiveLabels);
  if (el.archiveLimitSelect) el.archiveLimitSelect.addEventListener("change", event => setArchiveLimit(event.target.value));
  if (el.archiveImportInput) el.archiveImportInput.addEventListener("change", importArchiveJson);
  if (el.archiveSearchInput) el.archiveSearchInput.addEventListener("input", event => updateArchiveSearch(event.target.value));
  if (el.archiveSearchClearBtn) el.archiveSearchClearBtn.addEventListener("click", clearArchiveSearch);
  if (el.archiveClearAllBtn) el.archiveClearAllBtn.addEventListener("click", clearAllSessionArchives);
  if (el.archiveList) {
    el.archiveList.addEventListener("click", event => {
      const restoreButton = event.target.closest("button[data-archive-restore]");
      if (restoreButton) { restoreSessionArchive(restoreButton.getAttribute("data-archive-restore")); return; }
      const pinButton = event.target.closest("button[data-archive-pin]");
      if (pinButton) { toggleSessionArchivePin(pinButton.getAttribute("data-archive-pin")); return; }
      const noteButton = event.target.closest("button[data-archive-note]");
      if (noteButton) { noteSessionArchive(noteButton.getAttribute("data-archive-note")); return; }
      const duplicateButton = event.target.closest("button[data-archive-duplicate]");
      if (duplicateButton) { duplicateSessionArchive(duplicateButton.getAttribute("data-archive-duplicate")); return; }
      const renameButton = event.target.closest("button[data-archive-rename]");
      if (renameButton) { renameSessionArchive(renameButton.getAttribute("data-archive-rename")); return; }
      const downloadButton = event.target.closest("button[data-archive-download]");
      if (downloadButton) { downloadStoredArchiveJson(downloadButton.getAttribute("data-archive-download")); return; }
      const deleteButton = event.target.closest("button[data-archive-delete]");
      if (deleteButton) deleteSessionArchive(deleteButton.getAttribute("data-archive-delete"));
    });
  }
  renderArchiveTools();
  if (el.showMoreBtn) el.showMoreBtn.addEventListener("click", showMoreRows);
  if (el.showAllRowsBtn) el.showAllRowsBtn.addEventListener("click", showAllRows);

  const filterControls = [
    el.filterStatus, el.filterSearch, el.filterTld, el.filterMaxLen, el.filterNoHyphen, el.filterNoNumbers, el.sortSelect
  ];
  for (const control of filterControls) {
    control.addEventListener("input", () => { resetRenderLimit(); renderResults(); saveState(); });
    control.addEventListener("change", () => { resetRenderLimit(); renderResults(); saveState(); });
  }

  const optionControls = [el.advancedModeInput, el.priceOpenLimitInput, el.workersInput, el.delayInput, el.timeoutInput, el.useRdapInput, el.useDnsInput, el.dedupeInput, el.topPickCountInput];
  for (const control of optionControls.filter(Boolean)) {
    control.addEventListener("change", saveState);
    control.addEventListener("input", saveState);
  }

  if (el.registrarInput) {
    el.registrarInput.addEventListener("change", () => {
      renderResults();
      updatePriceLimitNote();
      updateAffiliateConfigStatus();
renderAnalyticsPanel();
renderOwnerChecklist();
updateReturnUserPanel();
updateBestNextAction();
      saveState();
      setStatus(`Price-check registrar changed to ${selectedRegistrarLabel()}.`);
    });
  }
  if (el.priceOpenLimitInput) {
    el.priceOpenLimitInput.addEventListener("change", () => {
      updatePriceLimitNote();
      saveState();
      setStatus(`Top-pick bulk price checks will open ${topPickPriceOpenLimitLabel(topPickRows().length)} at a time.`);
    });
  }
  if (el.affiliateTestBtn) {
    el.affiliateTestBtn.addEventListener("click", () => {
      const url = testAffiliateUrl();
      trackEvent("affiliate_test_opened", { registrar: selectedRegistrarKey() });
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus(`Opened a test ${selectedRegistrarLabel()} price-check link. Confirm it resolves correctly before launch.`);
    });
  }
  if (el.affiliateCopyTestBtn) {
    el.affiliateCopyTestBtn.addEventListener("click", () => {
      const url = testAffiliateUrl();
      copyText(url, `${selectedRegistrarLabel()} test price-check link`);
      trackEvent("affiliate_test_copied", { registrar: selectedRegistrarKey() });
    });
  }
  if (el.affiliateTestDomainInput) {
    el.affiliateTestDomainInput.addEventListener("input", updateAffiliateConfigStatus);
  }

  const scoringControls = [el.keywordsInput, el.scoringStyleInput, el.positiveWordsInput, el.negativeWordsInput];
  for (const control of scoringControls.filter(Boolean)) {
    control.addEventListener("input", rescoreResults);
    control.addEventListener("change", rescoreResults);
  }

  if (el.topPicksCards) {
    el.topPicksCards.addEventListener("click", event => {
      const favoriteButton = event.target.closest("button[data-favorite]");
      if (favoriteButton) {
        toggleFavorite(favoriteButton.getAttribute("data-favorite"));
        return;
      }
      const checkedButton = event.target.closest("button[data-saved-checked]");
      if (checkedButton) {
        toggleSavedChecked(checkedButton.getAttribute("data-saved-checked"));
        return;
      }
      const winnerButton = event.target.closest("button[data-saved-winner]");
      if (winnerButton) {
        pickSavedWinner(winnerButton.getAttribute("data-saved-winner"));
        return;
      }
      const detailButton = event.target.closest("button[data-detail-domain]");
      if (detailButton) {
        openDomainDetail(detailButton.getAttribute("data-detail-domain"));
        return;
      }
      const compareButton = event.target.closest("button[data-compare-domain]");
      if (compareButton) {
        toggleCompare(compareButton.getAttribute("data-compare-domain"));
        return;
      }
      const copyButton = event.target.closest("button[data-copy-domain]");
      if (copyButton) {
        trackEvent("top_pick_domain_copied");
        copyText(copyButton.getAttribute("data-copy-domain"), "domain");
        return;
      }
      const openAlternativesButton = event.target.closest("button[data-open-alternatives]");
      if (openAlternativesButton) {
        openAlternativePriceChecks(openAlternativesButton.getAttribute("data-open-alternatives"));
        return;
      }
      const copyAlternativesButton = event.target.closest("button[data-copy-alternatives]");
      if (copyAlternativesButton) {
        copyAlternatives(copyAlternativesButton.getAttribute("data-copy-alternatives"));
        return;
      }
      const feedbackLink = event.target.closest("a[data-feedback-kind]");
      if (feedbackLink) {
        trackEvent("feedback_link_clicked", { feedback_type: feedbackLink.getAttribute("data-feedback-kind") || "unknown" });
      }
    });
  }

  if (el.resultCards) {
    el.resultCards.addEventListener("click", event => {
      const emptyShowAllButton = event.target.closest("button[data-empty-show-all-results]");
      if (emptyShowAllButton) {
        resetAllResultFiltersFromEmptyState();
        return;
      }
      const badgeButton = event.target.closest("button[data-result-badge-filter]");
      if (badgeButton) {
        applyResultBadgeFilter(badgeButton.getAttribute("data-result-badge-filter"));
        return;
      }
      const favoriteButton = event.target.closest("button[data-favorite]");
      if (favoriteButton) {
        toggleFavorite(favoriteButton.getAttribute("data-favorite"));
        return;
      }
      const checkedButton = event.target.closest("button[data-saved-checked]");
      if (checkedButton) {
        toggleSavedChecked(checkedButton.getAttribute("data-saved-checked"));
        return;
      }
      const winnerButton = event.target.closest("button[data-saved-winner]");
      if (winnerButton) {
        pickSavedWinner(winnerButton.getAttribute("data-saved-winner"));
        return;
      }
      const detailButton = event.target.closest("button[data-detail-domain]");
      if (detailButton) {
        openDomainDetail(detailButton.getAttribute("data-detail-domain"));
        return;
      }
      const compareButton = event.target.closest("button[data-compare-domain]");
      if (compareButton) {
        toggleCompare(compareButton.getAttribute("data-compare-domain"));
        return;
      }
      const copyButton = event.target.closest("button[data-copy-domain]");
      if (copyButton) {
        trackEvent("all_results_domain_copied");
        copyText(copyButton.getAttribute("data-copy-domain"), "domain");
      }
    });
  }

  if (el.domainDetailContent) {
    el.domainDetailContent.addEventListener("click", event => {
      const favoriteButton = event.target.closest("button[data-favorite]");
      if (favoriteButton) {
        toggleFavorite(favoriteButton.getAttribute("data-favorite"));
        const row = findResultByDomain(favoriteButton.getAttribute("data-favorite"));
        if (row) renderDomainDetail(row);
        return;
      }
      const compareButton = event.target.closest("button[data-compare-domain]");
      if (compareButton) {
        toggleCompare(compareButton.getAttribute("data-compare-domain"));
        const row = findResultByDomain(compareButton.getAttribute("data-compare-domain"));
        if (row) renderDomainDetail(row);
        return;
      }
      const copyButton = event.target.closest("button[data-copy-domain]");
      if (copyButton) {
        trackEvent("domain_detail_domain_copied");
        copyText(copyButton.getAttribute("data-copy-domain"), "domain");
        return;
      }
      const openAlternativesButton = event.target.closest("button[data-open-alternatives]");
      if (openAlternativesButton) {
        openAlternativePriceChecks(openAlternativesButton.getAttribute("data-open-alternatives"));
        return;
      }
      const copyAlternativesButton = event.target.closest("button[data-copy-alternatives]");
      if (copyAlternativesButton) {
        copyAlternatives(copyAlternativesButton.getAttribute("data-copy-alternatives"));
        return;
      }
      const feedbackLink = event.target.closest("a[data-feedback-kind]");
      if (feedbackLink) {
        trackEvent("feedback_link_clicked", { feedback_type: feedbackLink.getAttribute("data-feedback-kind") || "unknown", source: "detail_drawer" });
      }
    });
  }

  document.addEventListener("click", event => {
    const analyticsTarget = event.target.closest("[data-analytics-event]");
    if (analyticsTarget) {
      trackEvent(analyticsTarget.getAttribute("data-analytics-event"), { source: analyticsTarget.getAttribute("data-analytics-source") || "page" });
    }
    const priceLink = event.target.closest("a.top-pick-cta, a.link-pill, a.registrar-pill");
    if (priceLink) trackEvent("check_price_clicked", { link_count: 1, link_group: priceLink.classList.contains("registrar-pill") ? "registrar-options" : (priceLink.classList.contains("top-pick-cta") ? "top-pick-card" : "results-table") });
  });

  el.resultsBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-favorite]");
    if (button) toggleFavorite(button.getAttribute("data-favorite"));
  });
}

bindEvents();
applyPublicLaunchMode();
applyPublicBranding();
loadState();
updateStartOverUndoPanel();
updateAffiliateConfigStatus();
renderAnalyticsPanel();
renderOwnerChecklist();
renderOwnerPreflightPanel();
renderOwnerLaunchInputsPanel();
updateReturnUserPanel();
updateSimpleOnboarding();
