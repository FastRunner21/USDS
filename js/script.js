// ===========================
// ZÁKLADNÍ NASTAVENÍ
// ===========================

const API_KEY = "";   // ← SEM VLOŽ SVŮJ TRUCKY API KEY
const VTC_ID = 44677;

// ===========================
// TÉMA + MOBILNÍ MENU
// ===========================

const themeToggle = document.getElementById("themeToggle");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const body = document.body;
    const current = body.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    body.setAttribute("data-theme", next);
    themeToggle.textContent = next === "dark" ? "🌙 Tmavý režim" : "☀️ Světlý režim";
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("hidden");
  });
}

// ===========================
// LOADING / ERROR STAVY
// ===========================

function setLoading() {
  ["drivers","jobs","km","jobs7","avg","convoys","topDrivers"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "…";
    });
}

function setError() {
  ["drivers","jobs","km","jobs7","avg","convoys","topDrivers"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "Nedostupné";
    });
}

// ===========================
// ZÁKLADNÍ STATISTIKY
// ===========================

async function loadStats() {
  try {
    const res = await fetch(`https://api.truckyapp.com/v2/vtc/${VTC_ID}/stats`, {
      headers: { "x-api-key": API_KEY }
    });

    const data = await res.json();
    if (!data || !data.response) return setError();

    const r = data.response;

    const map = {
      drivers: r.members,
      jobs: r.jobs,
      km: r.distance,
      jobs7: r.jobs7d,
      avg: r.avgDistance,
      convoys: r.convoys
    };

    Object.entries(map).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value ?? "–";
    });

  } catch (err) {
    console.error("Chyba API:", err);
    setError();
  }
}

// ===========================
// LEADERBOARD ŘIDIČŮ
// ===========================

async function loadLeaderboard() {
  try {
    const res = await fetch(`https://api.truckyapp.com/v2/vtc/${VTC_ID}/leaderboard`, {
      headers: { "x-api-key": API_KEY }
    });

    const data = await res.json();
    const container = document.getElementById("topDrivers");
    if (!container) return;

    if (!data || !data.response) {
      container.textContent = "Nedostupné";
      return;
    }

    const list = data.response.slice(0, 5);
    if (!list.length) {
      container.textContent = "Žádná data";
      return;
    }

    let html = "";
    list.forEach((d, i) => {
      html += `<div>${i + 1}. <strong>${d.driverName}</strong> – ${d.distance} km</div>`;
    });

    container.innerHTML = html;

  } catch (err) {
    console.error("Chyba leaderboardu:", err);
    const container = document.getElementById("topDrivers");
    if (container) container.textContent = "Nedostupné";
  }
}

// ===========================
// GRAFY – PŘEPÍNATELNÝ HLAVNÍ GRAF
// ===========================

let mainChart = null;
let graphDataCache = null;

function createMainChart(labels, data, label, color) {
  const ctx = document.getElementById("mainChart");
  if (!ctx) return;

  if (mainChart) mainChart.destroy();

  mainChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: color + "33",
        tension: 0.3,
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#ffffff" } }
      },
      scales: {
        x: {
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        },
        y: {
          ticks: { color: "#ffffff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        }
      }
    }
  });
}

async function loadGraphs() {
  try {
    const res = await fetch(`https://api.truckyapp.com/v2/vtc/${VTC_ID}/stats/monthly`, {
      headers: { "x-api-key": API_KEY }
    });

    const data = await res.json();
    if (!data || !data.response) return;

    const days = data.response.map(d => d.date);
    const jobs = data.response.map(d => d.jobs);
    const km = data.response.map(d => d.distance);
    const activity = data.response.map(d => d.activeDrivers);

    graphDataCache = { days, jobs, km, activity };

    // defaultně zobrazíme jízdy
    createMainChart(days, jobs, "Jízdy", "#ff0000");

  } catch (err) {
    console.error("Chyba grafů:", err);
  }
}

// Přepínání grafů
document.querySelectorAll(".btn-graph").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!graphDataCache) return;

    const type = btn.dataset.graph;
    const { days, jobs, km, activity } = graphDataCache;

    if (type === "jobs") {
      createMainChart(days, jobs, "Jízdy", "#ff0000");
    } else if (type === "km") {
      createMainChart(days, km, "Kilometry", "#ff2222");
    } else if (type === "activity") {
      createMainChart(days, activity, "Aktivní řidiči", "#ff4444");
    }
  });
});

// ===========================
// START + AUTO REFRESH
// ===========================

function initDashboard() {
  setLoading();
  loadStats();
  loadLeaderboard();
  loadGraphs();

  // Auto refresh každých 60 sekund
  setInterval(() => {
    loadStats();
    loadLeaderboard();
    loadGraphs();
  }, 60000);
}

document.addEventListener("DOMContentLoaded", initDashboard);
