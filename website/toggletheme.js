// === toggleTheme.js ===

// Apply saved theme on page load
(function () {
  const theme = localStorage.getItem("theme");
  const html = document.documentElement;
  const toggleBtn = document.getElementById("toggleMode");

  if (theme === "light") {
    html.classList.remove("dark");
    if (toggleBtn) toggleBtn.textContent = "🌞";
  } else {
    html.classList.add("dark");
    if (toggleBtn) toggleBtn.textContent = "🌙";
  }
})();

// Toggle theme on button click
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMode");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle("dark");
    toggleBtn.textContent = isDark ? "🌙" : "🌞";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});
