// dashboard.js

const user = localStorage.getItem("user");
if (!user) {
  window.location.href = "/index.html"; // redirect ke login jika tiada user
} else {
  document.getElementById("user").textContent = user;
}

document.getElementById("statusBtn").addEventListener("click", () => {
  window.location.href = "/stats"; // bukannya "/"
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "/index.html";
});
