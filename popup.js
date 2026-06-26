const DEFAULT_PREFS = {
  viewedEnabled: true,
  appliedEnabled: true,
  extensionActive: true,
};

const ABOUT_URLS = {
  github: "https://github.com/your-org/jobfocus-assist",
  star: "https://github.com/your-org/jobfocus-assist/stargazers",
  feedback: "https://example.com/jobfocus-assist/feedback",
};

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
};

const state = { ...DEFAULT_PREFS };
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
    const on = group.querySelector(`input[value="true"]`);
    const off = group.querySelector(`input[value="false"]`);
    on.checked = Boolean(state[key]);
    off.checked = !Boolean(state[key]);
  }
}

function renderAll() {
  renderPill();
  renderMenu();
  renderRadios();
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
    globalThis.chrome.tabs.create({ url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
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

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      openExternal(ABOUT_URLS[action]);
    });
  });

  document.addEventListener("click", (event) => {
    if (!elements.menuPanel.contains(event.target) && !elements.menuButton.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("blur", closeMenu);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

async function init() {
  elements.pill = document.getElementById("status-pill");
  elements.pillLabel = document.getElementById("status-pill-label");
  elements.menuButton = document.getElementById("menu-button");
  elements.menuPanel = document.getElementById("menu-panel");
  elements.menuActive = document.getElementById("menu-active");
  elements.menuPause = document.getElementById("menu-pause");

  installIcons();
  bindEvents();

  const stored = await storageGet(DEFAULT_PREFS);
  Object.assign(state, DEFAULT_PREFS, stored);
  renderAll();
}

init();
