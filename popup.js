const DEFAULT_PREFS = {
  viewedEnabled: true,
  appliedEnabled: true,
  extensionActive: true,
  keywordRules: [],
};

const ABOUT_URLS = {
  github: "https://github.com/Ajandaghian/JobFocus_Assist",
  star: "https://github.com/Ajandaghian/JobFocus_Assist/stargazers",
  feedback: "https://github.com/Ajandaghian/JobFocus_Assist/issues/new",
};

const COLOR_PRESETS = [
  { value: "#2563eb", label: "Blue" },
  { value: "#0ea5e9", label: "Sky" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#22c55e", label: "Green" },
  { value: "#84cc16", label: "Lime" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#f97316", label: "Orange" },
  { value: "#ef4444", label: "Red" },
  { value: "#f43f5e", label: "Rose" },
  { value: "#ec4899", label: "Fuchsia" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#10b981", label: "Emerald" },
  { value: "#a855f7", label: "Purple" },
  { value: "#d97706", label: "Gold" },
  { value: "#64748b", label: "Slate" },
  { value: "#94a3b8", label: "Gray" },
];

const ICONS = {
  moreVertical: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5" r="1.5" fill="currentColor"></circle>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
      <circle cx="12" cy="19" r="1.5" fill="currentColor"></circle>
    </svg>
  `,
  eye: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"></circle>
    </svg>
  `,
  badgeCheck: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  pause: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="5" height="18" rx="1" stroke="currentColor" stroke-width="2"></rect>
      <rect x="14" y="3" width="5" height="18" rx="1" stroke="currentColor" stroke-width="2"></rect>
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  plus: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
    </svg>
  `,
  search: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
      <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
    </svg>
  `,
  x: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
    </svg>
  `,
  chevronDown: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  trash: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6m-8 0h8m-9 0 .75 13A1.5 1.5 0 0 0 9.24 20h5.52a1.5 1.5 0 0 0 1.49-1.27L17 6M10 10v6m4-6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  edit: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  github: `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
    </svg>
  `,
  star: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  messageCircle: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-1.3 4.5c-.18.3-.25.64-.17.98l.38 1.69a1 1 0 0 1-1.18 1.18l-1.69-.38a1.5 1.5 0 0 0-.98.17A8.38 8.38 0 1 1 21 11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  shieldCheck: `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 4.5 6v5.5c0 4.93 3.35 8.89 7.5 9.5 4.15-.61 7.5-4.57 7.5-9.5V6L12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="m9.5 12.2 1.9 1.9 3.9-4.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
};

const state = {
  viewedEnabled: DEFAULT_PREFS.viewedEnabled,
  appliedEnabled: DEFAULT_PREFS.appliedEnabled,
  extensionActive: DEFAULT_PREFS.extensionActive,
  keywordRules: [],
  editor: null,
};

const elements = {};

let saveTimer = 0;

function storageGet(defaults) {
  if (!globalThis.chrome?.storage?.local?.get) {
    return Promise.resolve(defaults ?? {});
  }

  return new Promise((resolve) => {
    globalThis.chrome.storage.local.get(defaults, (result) => resolve(result));
  });
}

function storageSet(items) {
  if (!globalThis.chrome?.storage?.local?.set) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    globalThis.chrome.storage.local.set(items, () => {
      const error = globalThis.chrome.runtime?.lastError;
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function iconHtml(name) {
  return ICONS[name] || "";
}

function installIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    const iconName = node.getAttribute("data-icon");
    node.innerHTML = iconHtml(iconName);
  });
}

function normalizeColor(value) {
  const fallback = COLOR_PRESETS[0].value;
  if (typeof value !== "string") return fallback;
  const candidate = value.trim();
  return COLOR_PRESETS.some((color) => color.value === candidate) ? candidate : fallback;
}

function normalizeTime(value, fallback = 0) {
  const candidate = Number(value);
  return Number.isFinite(candidate) && candidate > 0 ? Math.floor(candidate) : fallback;
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function dedupeKeywords(keywords) {
  const seen = new Set();
  const result = [];

  for (const keyword of keywords) {
    const lower = keyword.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    result.push(keyword);
  }

  return result;
}

function createRuleId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `rule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeRule(rule, fallbackTime = 0) {
  const createdAt = normalizeTime(rule?.createdAt, fallbackTime);
  const updatedAt = normalizeTime(rule?.updatedAt, createdAt);

  return {
    id: String(rule?.id || createRuleId()),
    keywords: dedupeKeywords(normalizeKeywords(rule?.keywords)),
    color: normalizeColor(rule?.color),
    createdAt,
    updatedAt,
  };
}

function sanitizeRules(rules) {
  return Array.isArray(rules)
    ? rules
        .map((rule) => normalizeRule(rule, 0))
        .filter((rule) => rule.keywords.length > 0)
    : [];
}

function renderPill() {
  const active = state.extensionActive;
  elements.pill.classList.toggle("status-pill--paused", !active);
  elements.pill.classList.toggle("status-pill--active", active);
  elements.pillLabel.textContent = active ? "Active" : "Paused";
}

function renderMenu() {
  const active = state.extensionActive;
  elements.menuActive.classList.toggle("is-selected", active);
  elements.menuPause.classList.toggle("is-selected", !active);
}

function renderRadios() {
  for (const key of ["viewedEnabled", "appliedEnabled"]) {
    const group = document.querySelector(`.radio-group[data-group="${key}"]`);
    const on = group.querySelector('input[value="true"]');
    const off = group.querySelector('input[value="false"]');
    on.checked = Boolean(state[key]);
    off.checked = !Boolean(state[key]);
  }
}

function renderColorPalette() {
  const editor = state.editor;
  const isOpen = Boolean(editor?.paletteOpen);
  const activeColor = normalizeColor(editor?.color);

  elements.colorButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  elements.colorPalette.hidden = !isOpen;
  elements.colorSwatch.style.background = activeColor;

  elements.colorPalette.innerHTML = COLOR_PRESETS.map((color) => {
    const selected = activeColor === color.value;
    return `
      <button
        class="color-swatch${selected ? " is-selected" : ""}"
        type="button"
        data-color="${color.value}"
        aria-label="${color.label}"
        aria-pressed="${selected ? "true" : "false"}"
      >
        <span class="color-swatch__dot" style="background:${color.value}"></span>
      </button>
    `;
  }).join("");
}

function renderEditor() {
  const editor = state.editor;
  const isOpen = Boolean(editor);

  elements.editor.hidden = !isOpen;
  elements.addRuleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  elements.addRuleButton.querySelector("span:last-child").textContent = "Add rule";

  if (!isOpen) {
    elements.keywordInput.value = "";
    elements.colorPalette.hidden = true;
    elements.colorButton.setAttribute("aria-expanded", "false");
    return;
  }

  elements.keywordInput.value = editor.keywordsText;
  renderColorPalette();
}

function renderKeywordRules() {
  const rules = [...state.keywordRules]
    .map((rule, index) => ({ rule, index }))
    .sort((a, b) => {
      const timeDiff = (b.rule.updatedAt || 0) - (a.rule.updatedAt || 0);
      if (timeDiff !== 0) return timeDiff;
      return a.index - b.index;
    })
    .map(({ rule }) => rule);

  elements.keywordEmpty.hidden = rules.length !== 0 || Boolean(state.editor);
  elements.keywordList.hidden = rules.length === 0;
  elements.keywordList.innerHTML = rules
    .map((rule) => {
      const keywords = rule.keywords.join(", ");
      const editing = state.editor?.id === rule.id;
      return `
        <article class="keyword-rule${editing ? " is-editing" : ""}" data-rule-id="${rule.id}">
          <span class="keyword-rule__swatch" style="background:${rule.color}"></span>
          <div class="keyword-rule__body">
            <div class="keyword-rule__keywords">${escapeHtml(keywords)}</div>
            <div class="keyword-rule__meta">${rule.keywords.length} keyword${rule.keywords.length === 1 ? "" : "s"} in this group</div>
          </div>
          <div class="keyword-rule__actions">
            <button class="keyword-rule__action" type="button" data-action="edit-rule" data-rule-id="${rule.id}" aria-label="Edit rule">
              <span class="icon icon--small" data-icon="edit"></span>
            </button>
            <button class="keyword-rule__action" type="button" data-action="delete-rule" data-rule-id="${rule.id}" aria-label="Delete rule">
              <span class="icon icon--small" data-icon="trash"></span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  installIcons();
  renderEditor();
}

function renderAll() {
  renderPill();
  renderMenu();
  renderRadios();
  renderKeywordRules();
}

function closeMenu() {
  elements.menuPanel.hidden = true;
  elements.menuButton.setAttribute("aria-expanded", "false");
}

function openMenu() {
  elements.menuPanel.hidden = false;
  elements.menuButton.setAttribute("aria-expanded", "true");
}

function toggleMenu(forceOpen) {
  const open = typeof forceOpen === "boolean" ? forceOpen : elements.menuPanel.hidden;
  if (open) openMenu();
  else closeMenu();
}

function persistPrefs() {
  window.clearTimeout(saveTimer);

  saveTimer = window.setTimeout(async () => {
    try {
      await storageSet({
        viewedEnabled: state.viewedEnabled,
        appliedEnabled: state.appliedEnabled,
        extensionActive: state.extensionActive,
        keywordRules: state.keywordRules,
      });
    } catch (error) {
      console.error(error);
    }
  }, 0);
}

function setPref(key, value) {
  const next = Boolean(value);
  if (state[key] === next) return;
  state[key] = next;
  renderAll();
  persistPrefs();
}

function openExternal(url) {
  if (globalThis.chrome?.tabs?.create) {
    chrome.tabs.create({ url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function setEditor(nextEditor) {
  state.editor = nextEditor;
  renderKeywordRules();
}

function openAddEditor() {
  setEditor({
    id: null,
    keywordsText: "",
    color: COLOR_PRESETS[0].value,
    paletteOpen: false,
  });
  elements.keywordInput.focus();
}

function openEditEditor(rule) {
  setEditor({
    id: rule.id,
    keywordsText: rule.keywords.join(", "),
    color: normalizeColor(rule.color),
    paletteOpen: false,
  });
  elements.keywordInput.focus();
}

function closeEditor() {
  if (!state.editor) return;
  setEditor(null);
}

function readEditorKeywords() {
  return dedupeKeywords(normalizeKeywords(elements.keywordInput.value));
}

function saveEditor() {
  const keywords = readEditorKeywords();
  if (keywords.length === 0) {
    closeEditor();
    return;
  }

  const existingRule = state.keywordRules.find((rule) => rule.id === state.editor?.id);
  const now = Date.now();
  const nextRule = normalizeRule({
    id: state.editor?.id,
    keywords,
    color: state.editor?.color,
    createdAt: existingRule?.createdAt ?? now,
    updatedAt: now,
  });

  const nextRules = [...state.keywordRules];
  if (state.editor?.id) {
    const index = nextRules.findIndex((rule) => rule.id === state.editor.id);
    if (index >= 0) {
      nextRules[index] = nextRule;
    } else {
      nextRules.push(nextRule);
    }
  } else {
    nextRules.push(nextRule);
  }

  state.keywordRules = nextRules;
  closeEditor();
  renderAll();
  persistPrefs();
}

function deleteRule(ruleId) {
  const rule = state.keywordRules.find((item) => item.id === ruleId);
  if (!rule) return;

  const confirmed = window.confirm(`Delete keyword rule for "${rule.keywords.join(", ")}"?`);
  if (!confirmed) return;

  state.keywordRules = state.keywordRules.filter((item) => item.id !== ruleId);
  if (state.editor?.id === ruleId) {
    state.editor = null;
  }
  renderAll();
  persistPrefs();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function bindEvents() {
  document.querySelectorAll('input[type="radio"][name="viewedEnabled"], input[type="radio"][name="appliedEnabled"]').forEach((input) => {
    input.addEventListener("change", (event) => {
      const { name, value } = event.currentTarget;
      setPref(name, value === "true");
    });
  });

  elements.menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  elements.menuActive.addEventListener("click", () => {
    setPref("extensionActive", true);
    closeMenu();
  });

  elements.menuPause.addEventListener("click", () => {
    setPref("extensionActive", false);
    closeMenu();
  });

  elements.addRuleButton.addEventListener("click", () => {
    if (state.editor) {
      closeEditor();
      return;
    }

    openAddEditor();
  });

  elements.keywordEditorCancel.addEventListener("click", closeEditor);
  elements.keywordEditorSave.addEventListener("click", saveEditor);

  elements.colorButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!state.editor) return;
    state.editor = {
      ...state.editor,
      paletteOpen: !state.editor.paletteOpen,
    };
    renderColorPalette();
  });

  elements.keywordInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.editor?.paletteOpen) {
        state.editor = {
          ...state.editor,
          paletteOpen: false,
        };
        renderColorPalette();
        return;
      }
      closeEditor();
    }

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      saveEditor();
    }
  });

  elements.colorPalette.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-color]");
    if (!button) return;
    const color = button.getAttribute("data-color");
    if (!state.editor) return;
    state.editor = {
      ...state.editor,
      color,
      paletteOpen: false,
    };
    renderColorPalette();
  });

  elements.keywordList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) return;

    const action = actionButton.getAttribute("data-action");
    const ruleId = actionButton.getAttribute("data-rule-id");
    const rule = state.keywordRules.find((item) => item.id === ruleId);
    if (!rule) return;

    if (action === "edit-rule") {
      openEditEditor(rule);
      return;
    }

    if (action === "delete-rule") {
      deleteRule(ruleId);
    }
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    if (button.hasAttribute("data-action") && button.getAttribute("data-action") !== "github" && button.getAttribute("data-action") !== "star" && button.getAttribute("data-action") !== "feedback") {
      return;
    }

    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      openExternal(ABOUT_URLS[action]);
    });
  });

  document.addEventListener("click", (event) => {
    if (!elements.menuPanel.contains(event.target) && !elements.menuButton.contains(event.target)) {
      closeMenu();
    }

    if (state.editor?.paletteOpen && !elements.colorDropdown.contains(event.target)) {
      state.editor = {
        ...state.editor,
        paletteOpen: false,
      };
      renderColorPalette();
    }
  });

  window.addEventListener("blur", closeMenu);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      if (state.editor?.paletteOpen) {
        state.editor = {
          ...state.editor,
          paletteOpen: false,
        };
        renderColorPalette();
        return;
      }

      if (state.editor) {
        closeEditor();
      }
    }
  });
}

async function init() {
  elements.pill = document.getElementById("status-pill");
  elements.pillLabel = document.getElementById("status-pill-label");
  elements.menuButton = document.getElementById("menu-button");
  elements.menuPanel = document.getElementById("menu-panel");
  elements.menuActive = document.getElementById("menu-active");
  elements.menuPause = document.getElementById("menu-pause");
  elements.addRuleButton = document.getElementById("keyword-rule-add");
  elements.editor = document.getElementById("keyword-editor");
  elements.keywordInput = document.getElementById("keyword-input");
  elements.colorButton = document.getElementById("keyword-color-button");
  elements.colorSwatch = document.getElementById("keyword-color-swatch");
  elements.colorPalette = document.getElementById("keyword-color-palette");
  elements.colorDropdown = document.querySelector(".color-dropdown");
  elements.keywordEditorCancel = document.getElementById("keyword-editor-cancel");
  elements.keywordEditorSave = document.getElementById("keyword-editor-save");
  elements.keywordEmpty = document.getElementById("keyword-empty");
  elements.keywordList = document.getElementById("keyword-list");

  installIcons();
  bindEvents();

  const stored = await storageGet(DEFAULT_PREFS);
  state.viewedEnabled = Boolean(stored.viewedEnabled);
  state.appliedEnabled = Boolean(stored.appliedEnabled);
  state.extensionActive = Boolean(stored.extensionActive);
  state.keywordRules = sanitizeRules(stored.keywordRules);
  renderAll();
}

init();
