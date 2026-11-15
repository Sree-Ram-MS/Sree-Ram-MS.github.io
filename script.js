const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const pageNames = ["overview", "projects", "skills", "contact"];
const panels = new Map(
  [...document.querySelectorAll("[data-view-panel]")].map((panel) => [panel.dataset.viewPanel, panel]),
);
const tabs = [...document.querySelectorAll('.profile-tab[role="tab"]')];
let currentPage = pageNames.includes(location.hash.slice(1)) ? location.hash.slice(1) : "overview";
let leaveTimer;

tabs.forEach((tab) => { tab.tabIndex = tab.dataset.page === currentPage ? 0 : -1; });

function setTheme(theme, save = true) {
  const dark = theme === "dark";
  root.dataset.theme = dark ? "dark" : "light";
  themeButton?.setAttribute("aria-pressed", String(dark));
  themeButton?.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  themeButton?.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
  if (themeIcon) themeIcon.textContent = dark ? "☀" : "☾";
  if (themeMeta) themeMeta.content = "#010409";
  if (save) {
    try { localStorage.setItem("sree-ram-portfolio-theme", dark ? "dark" : "light"); } catch {}
  }
}

try {
  const savedTheme = localStorage.getItem("sree-ram-portfolio-theme");
  if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme, false);
} catch {}

themeButton?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

function activatePage(nextPage, { addHistory = true } = {}) {
  if (!panels.has(nextPage) || nextPage === currentPage) return;
  const previousIndex = pageNames.indexOf(currentPage);
  const nextIndex = pageNames.indexOf(nextPage);
  const direction = nextIndex >= previousIndex ? "right" : "left";
  const oldPanel = panels.get(currentPage);
  const newPanel = panels.get(nextPage);

  window.clearTimeout(leaveTimer);
  document.querySelectorAll(".view-panel.is-leaving").forEach((panel) => {
    panel.classList.remove("is-leaving", "to-left", "to-right");
  });

  oldPanel?.classList.remove("is-active", "from-left", "from-right");
  oldPanel?.classList.add("is-leaving", direction === "right" ? "to-left" : "to-right");
  oldPanel?.setAttribute("aria-hidden", "true");
  newPanel?.classList.remove("is-leaving", "to-left", "to-right", "from-left", "from-right");
  newPanel?.classList.add("is-active", direction === "right" ? "from-right" : "from-left");
  newPanel?.setAttribute("aria-hidden", "false");

  tabs.forEach((tab) => {
    const selected = tab.dataset.page === nextPage;
    tab.setAttribute("aria-selected", String(selected));
    tab.classList.toggle("active", selected);
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll(".header-links [data-page]").forEach((link) => {
    if (link.dataset.page === nextPage) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  currentPage = nextPage;
  if (addHistory) history.pushState({ portfolioPage: nextPage }, "", `#${nextPage}`);
  leaveTimer = window.setTimeout(() => {
    oldPanel?.classList.remove("is-leaving", "to-left", "to-right");
  }, 330);
}

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-page]");
  if (!control) return;
  const page = control.dataset.page;
  if (!panels.has(page)) return;
  event.preventDefault();
  activatePage(page);
});

document.querySelector(".profile-tabs")?.addEventListener("keydown", (event) => {
  if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
  const activeIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
  const nextIndex = event.key === "Home" ? 0
    : event.key === "End" ? tabs.length - 1
      : (activeIndex + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
  event.preventDefault();
  tabs[nextIndex]?.focus();
  activatePage(tabs[nextIndex]?.dataset.page);
});

window.addEventListener("popstate", () => {
  const pageFromHistory = pageNames.includes(location.hash.slice(1)) ? location.hash.slice(1) : "overview";
  activatePage(pageFromHistory, { addHistory: false });
});

if (currentPage !== "overview") {
  const initialPanel = panels.get(currentPage);
  panels.get("overview")?.classList.remove("is-active");
  panels.get("overview")?.setAttribute("aria-hidden", "true");
  initialPanel?.classList.add("is-active");
  initialPanel?.setAttribute("aria-hidden", "false");
  tabs.forEach((tab) => {
    const selected = tab.dataset.page === currentPage;
    tab.setAttribute("aria-selected", String(selected));
    tab.classList.toggle("active", selected);
    tab.tabIndex = selected ? 0 : -1;
  });
}

const avatar = document.querySelector(".profile-avatar-image");
avatar?.addEventListener("error", () => avatar.remove());

const projectArt = document.querySelector(".project-page-art");
const device = document.querySelector(".project-device");
if (projectArt && device && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  projectArt.addEventListener("pointermove", (event) => {
    const bounds = projectArt.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    device.style.transform = `rotateX(${5 - y * 7}deg) rotateY(${-9 + x * 10}deg)`;
  });
  projectArt.addEventListener("pointerleave", () => {
    device.style.transform = "rotateX(5deg) rotateY(-9deg)";
  });
}
