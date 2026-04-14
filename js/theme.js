const toggle = document.getElementById("themeToggle");
const body = document.body;

toggle.addEventListener("click", () => {
  const current = body.getAttribute("data-theme");
  if (current === "dark") {
    body.setAttribute("data-theme", "light");
    toggle.textContent = "🌞 Světlý režim";
  } else {
    body.setAttribute("data-theme", "dark");
    toggle.textContent = "🌙 Tmavý režim";
  }
});

// Mobilní menu (hamburger)
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("hidden");
  });
}
