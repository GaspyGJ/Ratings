import { renderStars } from "./stars.js";

/**
 * Renders all cards into #cards, given a filtered/sorted row array.
 * @param {Array} rows
 */
export function renderCards(rows) {
  const cardsEl = document.getElementById("cards");
  const noRes   = document.getElementById("no-results");

  cardsEl.innerHTML = "";

  if (rows.length === 0) {
    noRes.style.display = "block";
    return;
  }

  noRes.style.display = "none";

  rows.forEach(({ cover, title, saga, score, comments }) => {
    const card = document.createElement("div");
    card.className = "card";

    const coverHtml  = cover
      ? `<img class="cover-img" src="${cover}" alt="${title}" loading="lazy">`
      : `<span class="cover-empty"></span>`;

    const hasComments = comments && comments.trim() !== "";

    card.innerHTML = `
      ${coverHtml}
      <div class="card-info">
        <div class="card-top">
          <span class="title-text">${title || "—"}</span>
          <span class="score-text">${score}</span>
        </div>
        <div class="saga-text">${saga || ""}</div>
        ${renderStars(score)}
        ${hasComments ? `
          <div class="comment-toggle">Ver comentarios</div>
          <div class="comment-box">${comments}</div>
        ` : ""}
      </div>
    `;

    if (hasComments) {
      const toggle = card.querySelector(".comment-toggle");
      const box    = card.querySelector(".comment-box");

      toggle.onclick = () => {
        const visible      = box.style.display === "block";
        box.style.display  = visible ? "none" : "block";
        toggle.textContent = visible ? "Ver comentarios" : "Ocultar comentarios";
      };
    }

    cardsEl.appendChild(card);
  });
}
