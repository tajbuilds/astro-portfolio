(function () {
  const root = document.documentElement;
  const storageKey = "admin_theme";

  const getTheme = () => {
    const current = root.dataset.adminTheme;
    return current === "dark" ? "dark" : "light";
  };

  const setTheme = (theme) => {
    const next = theme === "dark" ? "dark" : "light";
    root.dataset.adminTheme = next;
    localStorage.setItem(storageKey, next);
    const toggle = document.querySelector(".admin-theme-toggle");
    if (toggle) {
      toggle.textContent = `Theme: ${next === "dark" ? "Dark" : "Light"}`;
      toggle.setAttribute("aria-label", `Switch to ${next === "dark" ? "light" : "dark"} mode`);
    }
  };

  const injectToggle = () => {
    if (document.querySelector(".admin-theme-toggle")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "admin-theme-toggle";
    btn.onclick = () => setTheme(getTheme() === "dark" ? "light" : "dark");
    document.body.appendChild(btn);
    setTheme(getTheme());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectToggle, { once: true });
  } else {
    injectToggle();
  }
})();
