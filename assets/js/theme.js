
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);

    if (!themeToggle) return;

    const label = isDark
        ? "Switch to light mode"
        : "Switch to dark mode";

    themeToggle.innerHTML = isDark
        ? `<span class="theme-icon" aria-hidden="true">☾</span>`
        : `<span class="theme-icon" aria-hidden="true">☀</span>`;

    // Keep the tooltip and accessibility label synchronized.
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("data-tooltip", label);
    themeToggle.setAttribute("title", label);
    themeToggle.setAttribute("aria-pressed", String(isDark));
}

const savedTheme = localStorage.getItem("staynest-theme");
applyTheme(savedTheme === "dark");

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const isDark = !document.body.classList.contains("dark-mode");

        applyTheme(isDark);
        localStorage.setItem("staynest-theme", isDark ? "dark" : "light");
    });
}
