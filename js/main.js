import { fetchData }                          from "./data.js";
import { initFilters, applyFilters, updateAvgBanner } from "./filters.js";
import { renderCards }                        from "./components/cards.js";

// ── State ────────────────────────────────────────────────────────────────────
let allRows       = [];
let currentRows   = [];
let currentDataset = "games";
let sortMode      = null;   // null | "desc" | "asc"
let activeFilter  = "Todos";
let searchQuery   = "";
let showAvg       = true;

// ── Core render cycle ────────────────────────────────────────────────────────
function render() {
  currentRows = applyFilters(allRows, searchQuery, activeFilter, sortMode);
  updateAvgBanner(currentRows, showAvg);
  renderCards(currentRows);
}

// ── Data load ────────────────────────────────────────────────────────────────
async function loadData() {
  allRows      = await fetchData(currentDataset);
  activeFilter = "Todos";
  searchQuery  = "";

  // Reset search input visually
  document.getElementById("search").value = "";

  initFilters(allRows, activeFilter, newFilter => {
    activeFilter = newFilter;
    render();
  });

  render();
}

// ── Event wiring ─────────────────────────────────────────────────────────────
function addEvents() {
  // Dataset toggle
  const gamesBtn  = document.getElementById("games-btn");
  const moviesBtn = document.getElementById("movies-btn");

  gamesBtn.onclick = () => {
    if (currentDataset === "games") return;
    currentDataset = "games";
    gamesBtn.classList.add("active");
    moviesBtn.classList.remove("active");
    loadData();
  };

  moviesBtn.onclick = () => {
    if (currentDataset === "movies") return;
    currentDataset = "movies";
    moviesBtn.classList.add("active");
    gamesBtn.classList.remove("active");
    loadData();
  };

  // Sort cycle: off → desc → asc → off
  const sortBtn = document.getElementById("sort-btn");
  sortBtn.onclick = () => {
    if (sortMode === null)        { sortMode = "desc"; sortBtn.textContent = "Mayor primero ↓"; sortBtn.classList.add("active"); }
    else if (sortMode === "desc") { sortMode = "asc";  sortBtn.textContent = "Menor primero ↑"; }
    else                          { sortMode = null;   sortBtn.textContent = "Ordenar ↕";        sortBtn.classList.remove("active"); }
    render();
  };

  // Search
  document.getElementById("search").addEventListener("input", e => {
    searchQuery = e.target.value.toLowerCase();
    render();
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
addEvents();
loadData();
