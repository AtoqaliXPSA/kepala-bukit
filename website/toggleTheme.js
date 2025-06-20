// === toggleTheme.js ===
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMode");
  const html = document.documentElement;

  const applyTheme = (mode) => {
    if (mode === "dark") {
      html.classList.add("dark");
      toggleBtn.textContent = "🌙";
    } else {
      html.classList.remove("dark");
      toggleBtn.textContent = "🌞";
    }
    localStorage.setItem("theme", mode);
  };

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  toggleBtn.addEventListener("click", () => {
    const current = html.classList.contains("dark") ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });
});
