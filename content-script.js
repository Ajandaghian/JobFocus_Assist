(() => {
  const DEFAULT_PREFS = {
    viewedEnabled: true,
    appliedEnabled: true,
    extensionActive: true,
    keywordRules: [],
  };

  const CLASSES = {
    viewed: "jfa-card--viewed",
    applied: "jfa-card--applied",
    highlight: "jfa-jd-highlight",
  };

  const JOB_PAGE_PREFIX = "/jobs/";
  const JOB_PAGE_HOSTS = new Set(["linkedin.com", "www.linkedin.com"]);

  const STATE_SELECTORS = [
    ".job-card-container__footer-job-state",
    ".job-card-list__footer-job-state",
  ].join(", ");

  const CARD_ROOT_SELECTORS = [
    "[data-job-id]",
    "li[data-occludable-job-id]",
    "[componentkey^='job-card-component-ref-']",
  ].join(", ");

  const FEED_SCOPE_SELECTORS = [
    "[data-testid='JobsHomeFeedModuleListCollection']",
    "[componentkey*='JobsHomeFeedModuleListLazyColumnContainer']",
    "section[aria-label='Primary content']",
    "main",
  ].join(", ");

  const JD_TEXT_ROOT_SELECTORS = [
    ".jobs-description-content__text",
    ".jobs-description__content",
    ".jobs-box__html-content",
  ].join(", ");

  const JD_CONTAINER_SELECTORS = [
    ".jobs-search__job-details--wrapper",
    ".jobs-search__job-details",
    ".scaffold-layout__detail",
  ].join(", ");

  const JD_FALLBACK_SELECTORS = [
    "[data-testid='job-details']",
    "[data-testid='job-details-container']",
    "[data-job-description]",
    ".jobs-description",
    ".jobs-description__container",
  ].join(", ");

  const FLUSH_DELAY_MS = 48;
  const BOOTSTRAP_INTERVAL_MS = 500;
  const BOOTSTRAP_MAX_ATTEMPTS = 16;
  const HIGHLIGHT_RESTORE_DELAY_MS = 120;
  const MIN_KEYWORD_LENGTH = 2;

  let prefs = { ...DEFAULT_PREFS };
  let observer = null;
  let flushQueued = false;
  let bootstrapAttempts = 0;
  let bootstrapTimer = 0;
  let suppressMutationUntil = 0;

  function isJobsPage() {
    return (
      (JOB_PAGE_HOSTS.has(location.hostname) ||
        location.hostname.endsWith(".linkedin.com")) &&
      location.pathname.startsWith(JOB_PAGE_PREFIX)
    );
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function readVisibleState(root) {
    const footerStateNodes = root.querySelectorAll(STATE_SELECTORS);
    for (const node of footerStateNodes) {
      const text = normalizeText(node.textContent);
      if (text === "Applied") {
        return "applied";
      }
      if (text === "Viewed") {
        return "viewed";
      }
    }

    // LinkedIn occasionally reshuffles the footer markup; fall back to the card text.
    const cardText = normalizeText(root.textContent);
    if (cardText.includes("Applied")) {
      return "applied";
    }
    if (cardText.includes("Viewed")) {
      return "viewed";
    }

    return null;
  }

  function isVisibleElement(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (element.hidden) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }

    return element.getClientRects().length > 0;
  }

  function isExplicitCardRoot(node) {
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    if (node.matches("li[data-occludable-job-id]")) {
      return true;
    }

    const jobId = node.getAttribute("data-job-id");
    if (jobId && /^\d+$/.test(jobId)) {
      return true;
    }

    const componentKey = node.getAttribute("componentkey") || "";
    return componentKey.startsWith("job-card-component-ref-");
  }

  function hasRepeatedComponentKey(node) {
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    const componentKey = node.getAttribute("componentkey");
    if (!componentKey) {
      return false;
    }

    for (const child of node.children) {
      if (child instanceof HTMLElement && child.getAttribute("componentkey") === componentKey) {
        return true;
      }
    }

    return false;
  }

  function findCardRootFromStateNode(node) {
    let current = node instanceof HTMLElement ? node : node?.parentElement;

    while (current instanceof HTMLElement) {
      if (isExplicitCardRoot(current)) {
        return current;
      }

      if (hasRepeatedComponentKey(current)) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }

  function isStateLabelNode(node) {
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    const text = normalizeText(node.textContent);
    return text === "Applied" || text === "Viewed";
  }

  function collectStateNodes(scope = document) {
    const nodes = [];
    const seen = new Set();

    const pushCandidate = (candidate) => {
      if (!(candidate instanceof HTMLElement) || seen.has(candidate)) {
        return;
      }

      seen.add(candidate);
      nodes.push(candidate);
    };

    for (const node of scope.querySelectorAll(STATE_SELECTORS)) {
      pushCandidate(node);
    }

    const treeScope =
      scope instanceof Document
        ? (scope.querySelector(FEED_SCOPE_SELECTORS) || scope.body || scope.documentElement)
        : scope;

    if (!treeScope) {
      return nodes;
    }

    const walker = document.createTreeWalker(treeScope, NodeFilter.SHOW_ELEMENT);
    for (let current = walker.currentNode; current; current = walker.nextNode()) {
      if (isStateLabelNode(current)) {
        pushCandidate(current);
      }
    }

    return nodes;
  }

  function collectCardRoots(scope = document) {
    const nodes = [];
    const seen = new Set();

    const pushCandidate = (candidate) => {
      if (!(candidate instanceof HTMLElement) || seen.has(candidate)) {
        return;
      }

      seen.add(candidate);
      nodes.push(candidate);
    };

    for (const node of scope.querySelectorAll(CARD_ROOT_SELECTORS)) {
      if (isExplicitCardRoot(node)) {
        pushCandidate(node);
      }
    }

    for (const stateNode of collectStateNodes(scope)) {
      const root = findCardRootFromStateNode(stateNode);
      if (root) {
        pushCandidate(root);
      }
    }

    return nodes;
  }

  function discoverCardRoots(scope = document) {
    const roots = [];
    const seen = new Set();

    for (const candidate of collectCardRoots(scope)) {
      if (!candidate || seen.has(candidate)) {
        continue;
      }

      seen.add(candidate);
      roots.push(candidate);
    }

    return roots.filter((root) => !roots.some((other) => other !== root && other.contains(root)));
  }

  function removeOwnClasses(root) {
    root.classList.remove(CLASSES.viewed, CLASSES.applied);
  }

  function applyState(root, state) {
    if (state === "applied") {
      root.classList.remove(CLASSES.viewed);
      if (prefs.appliedEnabled) {
        root.classList.add(CLASSES.applied);
      } else {
        root.classList.remove(CLASSES.applied);
      }
      return;
    }

    if (state === "viewed") {
      root.classList.remove(CLASSES.applied);
      if (prefs.viewedEnabled) {
        root.classList.add(CLASSES.viewed);
      } else {
        root.classList.remove(CLASSES.viewed);
      }
    }
  }

  function clearAllStyledCards(scope = document) {
    for (const node of scope.querySelectorAll(`.${CLASSES.viewed}, .${CLASSES.applied}`)) {
      if (node instanceof HTMLElement) {
        removeOwnClasses(node);
      }
    }
  }

  function normalizeRule(rule) {
    const keywords = Array.isArray(rule?.keywords)
      ? rule.keywords
      : String(rule?.keywords || "")
          .split(/[,;\n]/)
          .map((item) => item.trim());

    return {
      color: String(rule?.color || "#2563eb"),
      keywords: keywords.filter(Boolean),
    };
  }

  function getActiveKeywordRules() {
    return Array.isArray(prefs.keywordRules)
      ? prefs.keywordRules
          .map(normalizeRule)
          .map((rule) => ({
            color: rule.color,
            keywords: rule.keywords
              .map((keyword) => keyword.trim())
              .filter((keyword) => keyword.length >= MIN_KEYWORD_LENGTH),
          }))
          .filter((rule) => rule.keywords.length > 0)
      : [];
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function hexToRgb(hex) {
    const value = String(hex || "").trim();
    const short = /^#([0-9a-f]{3})$/i.exec(value);
    if (short) {
      const [r, g, b] = short[1].split("").map((digit) => parseInt(digit + digit, 16));
      return { r, g, b };
    }

    const long = /^#([0-9a-f]{6})$/i.exec(value);
    if (!long) {
      return { r: 37, g: 99, b: 235 };
    }

    const numeric = Number.parseInt(long[1], 16);
    return {
      r: (numeric >> 16) & 255,
      g: (numeric >> 8) & 255,
      b: numeric & 255,
    };
  }

  function rgbaFromHex(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function clearAllHighlights(scope = document) {
    for (const node of scope.querySelectorAll(`.${CLASSES.highlight}[data-jfa-highlight="true"]`)) {
      const parent = node.parentNode;
      if (!parent) {
        continue;
      }

      parent.replaceChild(document.createTextNode(node.textContent || ""), node);
      parent.normalize();
    }
  }

  function findJobDescriptionRoots(scope = document) {
    const roots = [];
    const seen = new Set();
    const textRoots = [];

    const pushCandidate = (candidate) => {
      if (!(candidate instanceof HTMLElement) || seen.has(candidate)) {
        return;
      }

      if (!isVisibleElement(candidate)) {
        return;
      }

      seen.add(candidate);
      roots.push(candidate);
    };

    for (const node of scope.querySelectorAll(JD_TEXT_ROOT_SELECTORS)) {
      textRoots.push(node);
    }

    if (textRoots.length > 0) {
      textRoots.forEach(pushCandidate);
      return roots.filter((root) => !roots.some((other) => other !== root && other.contains(root)));
    }

    for (const container of scope.querySelectorAll(JD_CONTAINER_SELECTORS)) {
      if (!(container instanceof HTMLElement) || !isVisibleElement(container)) {
        continue;
      }

      const nestedTextRoots = container.querySelectorAll(JD_TEXT_ROOT_SELECTORS);
      if (nestedTextRoots.length > 0) {
        for (const nested of nestedTextRoots) {
          pushCandidate(nested);
        }
      } else {
        pushCandidate(container);
      }
    }

    if (roots.length > 0) {
      return roots.filter((root) => !roots.some((other) => other !== root && other.contains(root)));
    }

    for (const node of scope.querySelectorAll(JD_FALLBACK_SELECTORS)) {
      if (node instanceof HTMLElement && isVisibleElement(node)) {
        pushCandidate(node);
      }
    }

    if (roots.length > 0) {
      return roots.filter((root) => !roots.some((other) => other !== root && other.contains(root)));
    }

    const main = scope.querySelector("main");
    if (!(main instanceof HTMLElement) || !isVisibleElement(main)) {
      return roots;
    }

    const candidates = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_ELEMENT);
    for (let current = walker.currentNode; current; current = walker.nextNode()) {
      if (!(current instanceof HTMLElement) || !isVisibleElement(current)) {
        continue;
      }

      if (current === main) {
        continue;
      }

      if (current.matches("button, input, textarea, select, option, script, style, svg, nav, aside, [role='main']")) {
        continue;
      }

      const text = normalizeText(current.textContent);
      if (text.length < 250) {
        continue;
      }

      const scoreMatches = /about the job|job description|responsibilities|requirements|qualifications|skills/i.test(text);
      const childCount = current.children.length || 1;
      const score = text.length * (scoreMatches ? 2 : 1) / childCount;
      candidates.push({ element: current, score });
    }

    candidates.sort((a, b) => b.score - a.score);

    for (const candidate of candidates.slice(0, 3)) {
      pushCandidate(candidate.element);
    }

    return roots.filter((root) => !roots.some((other) => other !== root && other.contains(root)));
  }

  function isHighlightTargetNode(node) {
    if (!(node instanceof Text)) {
      return false;
    }

    const parent = node.parentElement;
    if (!(parent instanceof HTMLElement)) {
      return false;
    }

    if (!isVisibleElement(parent)) {
      return false;
    }

    if (parent.closest(`[data-jfa-highlight="true"]`)) {
      return false;
    }

    if (parent.closest("button, input, textarea, select, option, script, style, svg, noscript")) {
      return false;
    }

    return normalizeText(node.textContent).length > 0;
  }

  function buildKeywordMatcher(rules) {
    const entries = [];
    for (const rule of rules) {
      for (const keyword of rule.keywords) {
        entries.push({
          keyword,
          color: rule.color,
        });
      }
    }

    entries.sort((a, b) => b.keyword.length - a.keyword.length);

    if (entries.length === 0) {
      return null;
    }

    const pattern = new RegExp(entries.map((entry) => `(${escapeRegex(entry.keyword)})`).join("|"), "gi");
    const colorByKeyword = new Map(entries.map((entry) => [entry.keyword.toLowerCase(), entry.color]));

    return { pattern, colorByKeyword };
  }

  function createHighlightSpan(text, color) {
    const span = document.createElement("span");
    span.className = CLASSES.highlight;
    span.dataset.jfaHighlight = "true";
    span.textContent = text;
    span.style.backgroundColor = rgbaFromHex(color, 0.18);
    span.style.boxShadow = `inset 0 0 0 1px ${rgbaFromHex(color, 0.45)}`;
    span.style.borderRadius = "4px";
    span.style.padding = "0 2px";
    span.style.margin = "0 -1px";
    span.style.fontWeight = "600";
    span.style.boxDecorationBreak = "clone";
    span.style.webkitBoxDecorationBreak = "clone";
    return span;
  }

  function highlightTextNode(node, matcher) {
    const text = node.textContent;
    if (!text || !matcher) {
      return false;
    }

    matcher.pattern.lastIndex = 0;
    if (!matcher.pattern.test(text)) {
      return false;
    }

    matcher.pattern.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    let changed = false;

    while ((match = matcher.pattern.exec(text)) !== null) {
      const matchedText = match[0];
      const index = match.index;
      if (index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
      }

      const color = matcher.colorByKeyword.get(matchedText.toLowerCase()) || "#2563eb";
      fragment.appendChild(createHighlightSpan(matchedText, color));
      lastIndex = index + matchedText.length;
      changed = true;

      if (matchedText.length === 0) {
        matcher.pattern.lastIndex += 1;
      }
    }

    if (!changed) {
      return false;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.parentNode.replaceChild(fragment, node);
    return true;
  }

  function applyKeywordHighlights(scope = document) {
    const rules = getActiveKeywordRules();
    clearAllHighlights(scope);

    const matcher = buildKeywordMatcher(rules);
    if (!matcher) {
      return;
    }

    const roots = findJobDescriptionRoots(scope);
    for (const root of roots) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      for (let current = walker.currentNode; current; current = walker.nextNode()) {
        if (isHighlightTargetNode(current)) {
          textNodes.push(current);
        }
      }

      for (const textNode of textNodes) {
        highlightTextNode(textNode, matcher);
      }
    }
  }

  function scanVisibleCards(scope = document) {
    if (!isJobsPage()) {
      return;
    }

    if (!prefs.extensionActive) {
      clearAllStyledCards(scope);
      clearAllHighlights(scope);
      return;
    }

    const roots = discoverCardRoots(scope);
    for (const root of roots) {
      applyState(root, readVisibleState(root));
    }

    if (!prefs.viewedEnabled) {
      for (const node of scope.querySelectorAll(`.${CLASSES.viewed}`)) {
        if (node instanceof HTMLElement) {
          node.classList.remove(CLASSES.viewed);
        }
      }
    }

    if (!prefs.appliedEnabled) {
      for (const node of scope.querySelectorAll(`.${CLASSES.applied}`)) {
        if (node instanceof HTMLElement) {
          node.classList.remove(CLASSES.applied);
        }
      }
    }
  }

  function scanVisibleJobDetails(scope = document) {
    if (!isJobsPage()) {
      return;
    }

    if (!prefs.extensionActive) {
      clearAllHighlights(scope);
      return;
    }

    applyKeywordHighlights(scope);
  }

  function scanVisibleUi(scope = document) {
    suppressMutationUntil = Date.now() + HIGHLIGHT_RESTORE_DELAY_MS;
    scanVisibleCards(scope);
    scanVisibleJobDetails(scope);
  }

  function queueFlush() {
    if (!isJobsPage() || flushQueued) {
      return;
    }

    flushQueued = true;

    const run = () => {
      flushQueued = false;
      if (Date.now() < suppressMutationUntil) {
        return;
      }

      scanVisibleUi();
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(run);
      return;
    }

    window.setTimeout(run, FLUSH_DELAY_MS);
  }

  function requestFullScan() {
    queueFlush();
  }

  function runBootstrapScan() {
    if (!isJobsPage() || bootstrapAttempts >= BOOTSTRAP_MAX_ATTEMPTS) {
      return;
    }

    bootstrapAttempts += 1;
    requestFullScan();

    bootstrapTimer = window.setTimeout(runBootstrapScan, BOOTSTRAP_INTERVAL_MS);
  }

  function installObservers() {
    if (observer) {
      return;
    }

    observer = new MutationObserver((records) => {
      if (Date.now() < suppressMutationUntil) {
        return;
      }

      let sawRelevantChange = false;

      for (const record of records) {
        if (record.type === "characterData") {
          sawRelevantChange = true;
          continue;
        }

        if (record.type !== "childList") {
          continue;
        }

        sawRelevantChange = true;
      }

      if (sawRelevantChange) {
        queueFlush();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("popstate", requestFullScan, true);
    window.addEventListener("hashchange", requestFullScan, true);

    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function pushStatePatched(...args) {
      const result = pushState.apply(this, args);
      requestFullScan();
      return result;
    };

    history.replaceState = function replaceStatePatched(...args) {
      const result = replaceState.apply(this, args);
      requestFullScan();
      return result;
    };
  }

  function syncPreferences(nextPrefs, { immediate = false } = {}) {
    prefs = {
      viewedEnabled: Boolean(nextPrefs.viewedEnabled),
      appliedEnabled: Boolean(nextPrefs.appliedEnabled),
      extensionActive: Boolean(nextPrefs.extensionActive),
      keywordRules: Array.isArray(nextPrefs.keywordRules) ? nextPrefs.keywordRules : [],
    };

    if (immediate) {
      suppressMutationUntil = Date.now() + HIGHLIGHT_RESTORE_DELAY_MS;
      scanVisibleUi();
      return;
    }

    requestFullScan();
  }

  function loadPreferences() {
    chrome.storage.local.get(DEFAULT_PREFS, (stored) => {
      syncPreferences({ ...DEFAULT_PREFS, ...stored }, { immediate: true });
    });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }

    if (
      !changes.viewedEnabled &&
      !changes.appliedEnabled &&
      !changes.extensionActive &&
      !changes.keywordRules
    ) {
      return;
    }

    syncPreferences({
      viewedEnabled: changes.viewedEnabled
        ? changes.viewedEnabled.newValue
        : prefs.viewedEnabled,
      appliedEnabled: changes.appliedEnabled
        ? changes.appliedEnabled.newValue
        : prefs.appliedEnabled,
      extensionActive: changes.extensionActive
        ? changes.extensionActive.newValue
        : prefs.extensionActive,
      keywordRules: changes.keywordRules
        ? changes.keywordRules.newValue
        : prefs.keywordRules,
    });
  });

  function start() {
    if (!isJobsPage()) {
      return;
    }

    installObservers();
    loadPreferences();

    bootstrapAttempts = 0;
    if (bootstrapTimer) {
      window.clearTimeout(bootstrapTimer);
    }
    runBootstrapScan();
  }

  start();
})();
