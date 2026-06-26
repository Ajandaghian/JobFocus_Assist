(() => {
  const DEFAULT_PREFS = {
    viewedEnabled: true,
    appliedEnabled: true,
    extensionActive: true,
  };

  const CLASSES = {
    viewed: "jfa-card--viewed",
    applied: "jfa-card--applied",
  };

  const JOB_PAGE_PREFIX = "/jobs/";
  const JOB_PAGE_HOSTS = new Set(["linkedin.com", "www.linkedin.com"]);

  // We only read the labels LinkedIn already renders and turn them into a class.
  const STATE_SELECTORS = [
    ".job-card-container__footer-job-state",
    ".job-card-list__footer-job-state",
  ].join(", ");

  // We anchor styling to the card shell that contains a job link and the visible label.
  const JOB_LINK_SELECTORS = [
    "a[href*='currentJobId=']",
    "a[href*='/jobs/search-results/']",
    "a[href*='/jobs/view/']",
  ].join(", ");

  const FEED_SCOPE_SELECTORS = [
    "[data-testid='JobsHomeFeedModuleListCollection']",
    "[componentkey*='JobsHomeFeedModuleListLazyColumnContainer']",
    "section[aria-label='Primary content']",
    "main",
  ].join(", ");

  const STATE_TEXT_VALUES = new Set(["Viewed", "Applied"]);

  const FLUSH_DELAY_MS = 48;
  const BOOTSTRAP_INTERVAL_MS = 500;
  const BOOTSTRAP_MAX_ATTEMPTS = 16;

  let prefs = { ...DEFAULT_PREFS };
  let observer = null;
  let flushQueued = false;
  let bootstrapAttempts = 0;
  let bootstrapTimer = 0;

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

  function isIgnorableTextNode(textNode) {
    const parent = textNode?.parentElement;
    if (!parent) {
      return true;
    }

    return ["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(parent.tagName);
  }

  function findCardRoot(node) {
    const current = node instanceof HTMLElement ? node : node?.parentElement;
    if (!current) {
      return null;
    }

    let cursor = current;
    while (cursor && cursor !== document.documentElement) {
      if (cursor instanceof HTMLElement && cursor.querySelector(JOB_LINK_SELECTORS)) {
        return cursor;
      }

      cursor = cursor.parentElement;
    }

    return null;
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

    if (treeScope) {
      const walker = document.createTreeWalker(treeScope, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!(node instanceof Text) || isIgnorableTextNode(node)) {
            return NodeFilter.FILTER_REJECT;
          }

          const text = normalizeText(node.textContent);
          return STATE_TEXT_VALUES.has(text)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      });

      while (walker.nextNode()) {
        const textNode = walker.currentNode;
        pushCandidate(textNode.parentElement);
      }
    }

    return nodes;
  }

  function discoverCardRoots(scope = document) {
    const roots = [];
    const seen = new Set();

    for (const candidate of collectStateNodes(scope)) {
      const root = findCardRoot(candidate);
      if (!root || seen.has(root)) {
        continue;
      }

      seen.add(root);
      roots.push(root);
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

  function scanVisibleCards(scope = document) {
    if (!isJobsPage()) {
      return;
    }

    if (!prefs.extensionActive) {
      clearAllStyledCards(scope);
      return;
    }

    const roots = discoverCardRoots(scope);
    for (const root of roots) {
      applyState(root, readVisibleState(root));
    }

    // When a rule is turned off, we strip its class from any card that still carries it.
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

  function queueFlush() {
    if (!isJobsPage() || flushQueued) {
      return;
    }

    flushQueued = true;

    const run = () => {
      flushQueued = false;
      scanVisibleCards();
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

    // LinkedIn is an SPA, so route changes can happen without a full reload.
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
    };

    if (immediate) {
      scanVisibleCards();
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
      !changes.extensionActive
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
    });
  });

  function start() {
    if (!isJobsPage()) {
      return;
    }

    installObservers();
    loadPreferences();

    // LinkedIn fills the card list in waves, so we keep trying briefly after load.
    bootstrapAttempts = 0;
    if (bootstrapTimer) {
      window.clearTimeout(bootstrapTimer);
    }
    runBootstrapScan();
  }

  start();
})();
