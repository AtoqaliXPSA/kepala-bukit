// website/themeToggle.js

function toggleMode() {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
  }
});

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }
});