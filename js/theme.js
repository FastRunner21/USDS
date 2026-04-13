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
