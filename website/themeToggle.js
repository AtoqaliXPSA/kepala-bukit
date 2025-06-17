const root = document.documentElement;
const toggleButton = document.querySelector('.toggle');

function setTheme(mode) {
  if (mode === 'light') {
    root.classList.add('light');
    toggleButton.textContent = '☀️ Light Mode';
  } else {
    root.classList.remove('light');
    toggleButton.textContent = '🌙 Dark Mode';
  }
  localStorage.setItem('theme', mode);
}

function toggleMode() {
  const isLight = root.classList.toggle('light');
  setTheme(isLight ? 'light' : 'dark');
}

window.onload = () => {
  const saved = localStorage.getItem('theme') || 'dark';
  setTheme(saved);
};
