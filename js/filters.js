import { renderStars } from "./components/stars.js";

/**
 * Builds the saga filter buttons from the current row set.
 * @param {Array}    rows
 * @param {string}   activeFilter
 * @param {Function} onFilterChange  - called with the new filter string
 */
export function initFilters(rows, activeFilter, onFilterChange) {
  const container = document.getElementById("filters");
  container.innerHTML = "";

  const sagas = ["Todos", ...new Set(rows.map(r => r.saga).filter(Boolean))];

  sagas.forEach(saga => {
    const btn       = document.createElement("button");
    btn.className   = "filter-btn" + (saga === activeFilter ? " active" : "");
    btn.textContent = saga;

    btn.onclick = () => {
      container.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      onFilterChange(saga);
    };

    container.appendChild(btn);
  });
}

/**
 * Applies search, saga filter, and sort to allRows.
 * @param {Array}       allRows
 * @param {string}      searchQuery
 * @param {string}      activeFilter
 * @param {string|null} sortMode     - "asc" | "desc" | null
 * @returns {Array}
 */
export function applyFilters(allRows, searchQuery, activeFilter, sortMode) {
  let rows = allRows.filter(r => {
    const matchSaga   = activeFilter === "Todos" || r.saga === activeFilter;
    const matchSearch = r.title.toLowerCase().includes(searchQuery);
    return matchSaga && matchSearch;
  });

  if (sortMode === "desc") rows = [...rows].sort((a, b) => b.score - a.score);
  if (sortMode === "asc")  rows = [...rows].sort((a, b) => a.score - b.score);

  return rows;
}

/**
 * Updates the average banner visibility and content.
 * @param {Array}   currentRows
 * @param {boolean} showAvg
 */
export function updateAvgBanner(currentRows, showAvg) {
  const banner = document.getElementById("avg-banner");

  if (!showAvg || currentRows.length === 0) {
    banner.classList.remove("visible");
    return;
  }

  const avg = currentRows.reduce((sum, r) => sum + r.score, 0) / currentRows.length;

  document.getElementById("avg-score").textContent  = (Math.round(avg * 100) / 100).toFixed(2) + " / 10";
  document.getElementById("avg-stars").innerHTML    = renderStars(avg, 24);
  document.getElementById("avg-count").textContent  =
    `${currentRows.length} ${currentRows.length === 1 ? "ítem" : "ítems"}`;

  banner.classList.add("visible");
}
