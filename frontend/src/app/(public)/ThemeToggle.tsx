import { MdDarkMode, MdLightMode } from "react-icons/md";

const themeScript = `
(function () {
  if (window.__barobadiPublicThemeReady) return;
  window.__barobadiPublicThemeReady = true;

  function resolveTheme() {
    try {
      var saved = window.localStorage.getItem("public-theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch (error) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("public-theme", theme);
    } catch (error) {}
  }

  applyTheme(resolveTheme());

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-theme-toggle]");
    if (!button) return;
    var current = document.documentElement.dataset.theme;
    applyTheme(current === "dark" ? "light" : "dark");
  });
})();
`;

export default function ThemeToggle() {
  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        data-theme-toggle
        aria-label="Toggle color mode"
        title="Toggle color mode"
      >
        <span className="theme-icon theme-icon-dark">
          <MdDarkMode />
        </span>
        <span className="theme-icon theme-icon-light">
          <MdLightMode />
        </span>
      </button>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </>
  );
}
