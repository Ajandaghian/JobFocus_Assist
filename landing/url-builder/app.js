(function () {
  const LINKEDIN_BASE_URL = "https://www.linkedin.com/jobs/search/";
  const SECONDS_PER_DAY = 86400;

  const initialState = {
    groups: [{ id: 1, mode: "OR", terms: [] }],
    groupJoin: "AND",
    excludeTerms: [],
    geoId: "103644278",
    recencyDays: 7,
    sortBy: "DD",
    lastCopiedUrl: "",
  };

  let nextGroupId = 2;
  const state = structuredClone(initialState);

  const elements = {
    form: document.querySelector("#builder-form"),
    groupStack: document.querySelector("#group-stack"),
    addGroupButton: document.querySelector("#add-group-button"),
    excludeInput: document.querySelector("#exclude-input"),
    excludeChips: document.querySelector("#exclude-chips"),
    excludeHint: document.querySelector("#exclude-hint"),
    keywordPreview: document.querySelector("#keyword-preview"),
    geoId: document.querySelector("#geo-id"),
    geoError: document.querySelector("#geo-error"),
    recencyCopy: document.querySelector("#recency-copy"),
    customDaysWrap: document.querySelector("#custom-days-wrap"),
    customDays: document.querySelector("#custom-days"),
    sortCopy: document.querySelector("#sort-copy"),
    statusText: document.querySelector("#status-text"),
    generatedUrl: document.querySelector("#generated-url"),
    copyButton: document.querySelector("#copy-button"),
    openLink: document.querySelector("#open-link"),
    resetButton: document.querySelector("#reset-button"),
    booleanPreview: document.querySelector(".boolean-preview"),
    guideDialog: document.querySelector("#geo-guide-dialog"),
    geoHelp: document.querySelector(".geo-help"),
    geoHelpLabel: document.querySelector(".guide-summary-copy"),
  };

  function normalizeTerm(term) {
    return term.trim().replace(/\s+/g, " ");
  }

  function formatTerm(term) {
    return term.includes(" ") ? `"${term}"` : term;
  }

  function addUniqueTerm(terms, rawTerm) {
    const term = normalizeTerm(rawTerm);
    if (!term) return false;

    const exists = terms.some((item) => item.toLowerCase() === term.toLowerCase());
    if (!exists) terms.push(term);
    return !exists;
  }

  function getNonEmptyGroups() {
    return state.groups.filter((group) => group.terms.length > 0);
  }

  function buildGroupExpression(group) {
    return `(${group.terms.map(formatTerm).join(` ${group.mode} `)})`;
  }

  function buildKeywordExpression() {
    const groupExpression = getNonEmptyGroups().map(buildGroupExpression).join(` ${state.groupJoin} `);
    const excludeExpression = state.excludeTerms.map((term) => `NOT ${formatTerm(term)}`).join(" ");
    return [groupExpression, excludeExpression].filter(Boolean).join(" ");
  }

  function recencySeconds() {
    return Number(state.recencyDays) * SECONDS_PER_DAY;
  }

  function isValidGeoId(value) {
    return /^\d+$/.test(value.trim());
  }

  function getValidation() {
    const errors = [];

    if (getNonEmptyGroups().length === 0) {
      errors.push("Add at least one keyword.");
    }

    if (!state.geoId.trim()) {
      errors.push("Enter a geoId or location name.");
    }

    if (!Number.isFinite(Number(state.recencyDays)) || Number(state.recencyDays) <= 0) {
      errors.push("Choose a positive recency value.");
    }

    return errors;
  }

  function buildLinkedInUrl() {
    const locationValue = state.geoId.trim();
    const locationParam = isValidGeoId(locationValue)
      ? ["geoId", locationValue]
      : ["location", locationValue];

    const params = [
      ["keywords", buildKeywordExpression()],
      locationParam,
      ["f_TPR", `r${recencySeconds()}`],
      ["origin", "JOB_SEARCH_PAGE_JOB_FILTER"],
      ["refresh", "true"],
    ];

    if (state.sortBy === "DD") {
      params.splice(3, 0, ["sortBy", state.sortBy]);
    }

    return `${LINKEDIN_BASE_URL}?${params
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")}`;
  }

  function openGuideDialog() {
    if (!(elements.guideDialog instanceof HTMLDialogElement)) {
      return;
    }

    if (typeof elements.guideDialog.showModal === "function") {
      if (!elements.guideDialog.open) {
        elements.guideDialog.showModal();
      }
      return;
    }

    elements.guideDialog.setAttribute("open", "");
  }

  function createChip(term, removeHandler, isExclude) {
    const chip = document.createElement("span");
    chip.className = `chip ${isExclude ? "exclude" : ""}`;

    const label = document.createElement("span");
    label.textContent = term;

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Remove ${term}`);
    button.textContent = "x";
    button.addEventListener("click", removeHandler);

    chip.append(label, button);
    return chip;
  }

  function renderGroups() {
    elements.groupStack.replaceChildren();

    state.groups.forEach((group, index) => {
      const card = document.createElement("article");
      card.className = "keyword-group";
      card.dataset.groupId = String(group.id);

      const header = document.createElement("div");
      header.className = "keyword-group-head";
      header.innerHTML = `
        <div>
          <h3>Group ${index + 1}</h3>
          <p>${group.terms.length === 0 ? "Empty group" : `${group.terms.length} keyword${group.terms.length === 1 ? "" : "s"} in this group`}</p>
        </div>
      `;

      const controls = document.createElement("div");
      controls.className = "group-controls";
      controls.setAttribute("role", "radiogroup");
      controls.setAttribute("aria-label", `Group ${index + 1} mode`);
      controls.innerHTML = `
        <label><input type="radio" name="group-${group.id}-mode" value="AND" ${group.mode === "AND" ? "checked" : ""}><span>AND</span></label>
        <label><input type="radio" name="group-${group.id}-mode" value="OR" ${group.mode === "OR" ? "checked" : ""}><span>OR</span></label>
      `;

      controls.addEventListener("change", (event) => {
        if (event.target instanceof HTMLInputElement) {
          group.mode = event.target.value;
          render();
        }
      });

      const removeButton = document.createElement("button");
      removeButton.className = "icon-button";
      removeButton.type = "button";
      removeButton.disabled = state.groups.length === 1;
      removeButton.setAttribute("aria-label", `Remove group ${index + 1}`);
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        state.groups = state.groups.filter((item) => item.id !== group.id);
        render();
      });

      header.append(controls, removeButton);

      const input = document.createElement("input");
      input.className = "term-input";
      input.type = "text";
      input.autocomplete = "off";
      input.placeholder = "Type a keyword and press Enter";
      input.setAttribute("aria-label", `Add keyword to group ${index + 1}`);
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        addUniqueTerm(group.terms, input.value);
        input.value = "";
        render();
      });

      const chips = document.createElement("div");
      chips.className = "chips";
      group.terms.forEach((term) => {
        chips.append(createChip(term, () => {
          group.terms = group.terms.filter((item) => item !== term);
          render();
        }));
      });

      card.append(header, input, chips);
      elements.groupStack.append(card);
    });
  }

  function renderExcludeChips() {
    elements.excludeChips.replaceChildren();
    state.excludeTerms.forEach((term) => {
      elements.excludeChips.append(createChip(term, () => {
        state.excludeTerms = state.excludeTerms.filter((item) => item !== term);
        render();
      }, true));
    });
  }

  function renderStatus(errors, url) {
    elements.statusText.classList.remove("ready", "copied", "dirty");

    if (errors.length > 0) {
      elements.statusText.textContent = errors[0];
      elements.copyButton.disabled = true;
      elements.openLink.classList.add("is-disabled");
      elements.openLink.setAttribute("aria-disabled", "true");
      elements.openLink.setAttribute("tabindex", "-1");
      elements.copyButton.innerHTML = '<img src="./assets/icons/copy.svg" alt=""> Copy link';
      return;
    }

    const isCopied = state.lastCopiedUrl === url;
    elements.statusText.textContent = isCopied ? "Copied" : "Preview ready";
    elements.statusText.classList.add(isCopied ? "copied" : "ready");
    elements.copyButton.disabled = false;
    elements.openLink.classList.remove("is-disabled");
    elements.openLink.setAttribute("aria-disabled", "false");
    elements.openLink.removeAttribute("tabindex");
    elements.copyButton.innerHTML = isCopied
      ? '<img src="./assets/icons/check.svg" alt=""> Copied'
      : '<img src="./assets/icons/copy.svg" alt=""> Copy link';
  }

  function render() {
    const errors = getValidation();
    const url = errors.length === 0 ? buildLinkedInUrl() : "";
    const keywordExpression = buildKeywordExpression();

    renderGroups();
    renderExcludeChips();

    elements.excludeHint.textContent =
      state.excludeTerms.length === 0
        ? ""
        : state.excludeTerms.length === 1
          ? "1 exclusion term added."
          : `${state.excludeTerms.length} exclusion terms added.`;

    elements.keywordPreview.textContent = keywordExpression || "";
    if (elements.booleanPreview instanceof HTMLElement) {
      elements.booleanPreview.classList.toggle("is-empty", !keywordExpression);
    }
    elements.geoError.textContent = state.geoId.trim() ? "" : "Enter a geoId or location name.";
    elements.recencyCopy.textContent = `Show jobs posted in the last ${state.recencyDays} ${
      Number(state.recencyDays) === 1 ? "day" : "days"
    }.`;

    elements.generatedUrl.value = url;
    elements.openLink.href = url || "#";
    renderStatus(errors, url);
  }

  function resetState() {
    const fresh = structuredClone(initialState);
    Object.keys(state).forEach((key) => {
      state[key] = fresh[key];
    });
    nextGroupId = 2;
    elements.geoId.value = state.geoId;
    elements.customDays.value = "14";
    elements.customDaysWrap.classList.remove("is-visible");
    document.querySelector('input[name="groupJoin"][value="AND"]').checked = true;
    document.querySelector('input[name="recency"][value="7"]').checked = true;
    document.querySelector('input[name="sortBy"][value="DD"]').checked = true;
    render();
  }

  elements.addGroupButton.addEventListener("click", () => {
    state.groups.push({ id: nextGroupId, mode: "OR", terms: [] });
    nextGroupId += 1;
    render();
  });

  elements.excludeInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addUniqueTerm(state.excludeTerms, elements.excludeInput.value);
    elements.excludeInput.value = "";
    render();
  });

  elements.form.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.name === "groupJoin") state.groupJoin = target.value;

    if (target.name === "recency") {
      const isCustom = target.value === "custom";
      elements.customDaysWrap.classList.toggle("is-visible", isCustom);
      state.recencyDays = isCustom ? Number(elements.customDays.value) : Number(target.value);
    }

    if (target.name === "sortBy") state.sortBy = target.value;

    render();
  });

  elements.geoId.addEventListener("input", () => {
    state.geoId = elements.geoId.value.trim();
    render();
  });

  elements.customDays.addEventListener("input", () => {
    state.recencyDays = Number(elements.customDays.value);
    render();
  });

  elements.resetButton.addEventListener("click", resetState);

  document.querySelectorAll("[data-open-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      openGuideDialog();
    });
  });

  elements.copyButton.addEventListener("click", async () => {
    if (!elements.generatedUrl.value) return;

    try {
      await navigator.clipboard.writeText(elements.generatedUrl.value);
    } catch (error) {
      elements.generatedUrl.select();
      document.execCommand("copy");
    }

    state.lastCopiedUrl = elements.generatedUrl.value;
    render();
  });

  if (elements.geoHelp && elements.geoHelpLabel) {
    const syncGeoHelpLabel = () => {
      elements.geoHelpLabel.textContent = elements.geoHelp.open ? "Hide steps" : "Show steps";
    };

    elements.geoHelp.addEventListener("toggle", syncGeoHelpLabel);
    syncGeoHelpLabel();
  }

  render();
})();
