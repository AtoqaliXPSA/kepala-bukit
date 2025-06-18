// website/themeToggle.js

(function () {
  const THEME_KEY = 'site-theme';

  // Tukar tema dan simpan dalam localStorage
  function toggleMode() {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  }

  // Bila halaman dimuat, guna tema yang disimpan
  function applySavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
      document.body.classList.add('light');
    }
  }

  // Jalankan fungsi bila skrip dimuat
  applySavedTheme();

  // Eksport fungsi supaya boleh dipanggil dari HTML
  window.toggleMode = toggleMode;
})();
