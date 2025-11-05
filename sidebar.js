const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const toggleSidebar = document.getElementById("toggleSidebar");
const minimizeSidebar = document.getElementById("minimizeSidebar");

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.add("aberta");
  overlay.classList.add("ativa");
});

minimizeSidebar.addEventListener("click", () => {
  sidebar.classList.remove("aberta");
  overlay.classList.remove("ativa");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("aberta");
  overlay.classList.remove("ativa");
});
