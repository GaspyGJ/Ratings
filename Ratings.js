    const STAR_SIZE   = 26;
    const GAP         = 4;
    const COLOR_EMPTY = "#2e2e2e";

    function getColor(score) {
      // 0 → rojo | 10 → verde
      const hue = (score / 10) * 120;
      return `hsl(${hue}, 70%, 50%)`;
    }

    function buildStarPath(cx, cy, outerR, innerR) {
      let d = "";
      for (let i = 0; i < 5; i++) {
        const oa = (Math.PI / 2) + (i * 2 * Math.PI / 5);
        const ia = oa + Math.PI / 5;
        const ox = cx + outerR * Math.cos(oa);
        const oy = cy - outerR * Math.sin(oa);
        const ix = cx + innerR * Math.cos(ia);
        const iy = cy - innerR * Math.sin(ia);
        d += (i === 0 ? `M ${ox} ${oy}` : ` L ${ox} ${oy}`) + ` L ${ix} ${iy}`;
      }
      return d + " Z";
    }

    function renderStar(x, fill, uid, s, color) {
      const cx = x + s / 2;
      const cy = s / 2;
      const d = buildStarPath(cx, cy, s * 0.46, s * 0.19);
      const clipW = s * Math.min(1, Math.max(0, fill));
      return `
        <defs>
          <clipPath id="${uid}">
            <rect x="${x}" y="0" width="${clipW}" height="${s}" />
          </clipPath>
        </defs>
        <path d="${d}" fill="${COLOR_EMPTY}" />
        <path d="${d}" fill="${color}" clip-path="url(#${uid})" />
      `;
    }

function renderStars(score10, size) {
  const s = size || STAR_SIZE;
 
  // mantenés precisión como ya tenías
  score10 = Math.max(0, Math.min(10, Math.round(score10 * 4) / 4));

  // conversión a escala 5
  const score5 = score10 / 2;

  const color = getColor(score10);

  const totalW = 5 * (s + GAP) - GAP;

  let svg = `<svg class="stars" width="${totalW}" height="${s}" viewBox="0 0 ${totalW} ${s}" xmlns="http://www.w3.org/2000/svg">`;

  for (let i = 0; i < 5; i++) {
    const x    = i * (s + GAP);
    const fill = Math.min(1, Math.max(0, score5 - i));
    const uid  = `s${i}_${Math.random().toString(36).slice(2, 7)}`;
    svg += renderStar(x, fill, uid, s, color);
  }

  return svg + "</svg>";
}

    let allRows = [];
    const cardsEl = document.getElementById("cards");
    const noRes   = document.getElementById("no-results");
    const avgBanner = document.getElementById("avg-banner");

    let sortMode     = null;
    let activeFilter = "Todos";
    let searchQuery  = "";
    let showAvg      = false;
    let currentRows  = [];

    async function loadData() {
      const res = await fetch("https://opensheet.elk.sh/1_U-jixHUZXcuKA6k1rfThC1V4uzHK4193DhzYBzdjFI/Listado");
      const data = await res.json();

    allRows = data.map(r => ({
      cover: r["Portada"] || "",
      title: r["Título"] || "",
      type:  r["Tipo"] || "",
      score: Number((r["Puntaje"] || "0").toString().replace(",", ".")),
      comments: r["Comentarios"] || ""
    }));

      initFilters();
      render();
    }

    function initFilters() {
      const filterContainer = document.getElementById("filters");
      filterContainer.innerHTML = "";

      const types = ["Todos", ...new Set(allRows.map(r => r.type).filter(Boolean))];

      types.forEach(type => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (type === "Todos" ? " active" : "");
        btn.textContent = type;
        btn.onclick = () => {
          activeFilter = type;
          document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          render();
        };
        filterContainer.appendChild(btn);
      });
    }

    const sortBtn = document.getElementById("sort-btn");
    sortBtn.onclick = () => {
      if (sortMode === null)        { sortMode = "desc"; sortBtn.textContent = "Mayor primero ↓"; sortBtn.classList.add("active"); }
      else if (sortMode === "desc") { sortMode = "asc";  sortBtn.textContent = "Menor primero ↑"; }
      else                          { sortMode = null;   sortBtn.textContent = "Ordenar ↕";        sortBtn.classList.remove("active"); }
      render();
    };

    const avgBtn = document.getElementById("avg-btn");
    avgBtn.onclick = () => {
      showAvg = !showAvg;
      avgBtn.classList.toggle("active", showAvg);
      updateAvg();
    };

    function updateAvg() {
      if (!showAvg || currentRows.length === 0) { avgBanner.classList.remove("visible"); return; }
      const avg = currentRows.reduce((sum, r) => sum + r.score, 0) / currentRows.length;
      document.getElementById("avg-score").textContent = (Math.round(avg * 100) / 100).toFixed(2) + " / 10";
      document.getElementById("avg-stars").innerHTML = renderStars(avg, 24);
      document.getElementById("avg-count").textContent = `${currentRows.length} ${currentRows.length === 1 ? "ítem" : "ítems"}`;
      avgBanner.classList.add("visible");
    }

    document.getElementById("search").addEventListener("input", e => {
      searchQuery = e.target.value.toLowerCase();
      render();
    });

    function render() {
      currentRows = allRows.filter(r => {
        const matchType   = activeFilter === "Todos" || r.type === activeFilter;
        const matchSearch = r.title.toLowerCase().includes(searchQuery);
        return matchType && matchSearch;
      });

      if (sortMode === "desc") currentRows = [...currentRows].sort((a, b) => b.score - a.score);
      if (sortMode === "asc")  currentRows = [...currentRows].sort((a, b) => a.score - b.score);

      updateAvg();
      cardsEl.innerHTML = "";

      if (currentRows.length === 0) { noRes.style.display = "block"; return; }
      noRes.style.display = "none";

      currentRows.forEach(({ cover, title, type, score, comments }) => {
        const card = document.createElement("div");
        card.className = "card";

        const coverHtml = cover
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
            <div class="type-text">${type || ""}</div>
            ${renderStars(score)}
            ${hasComments ? `<div class="comment-toggle">Ver comentarios</div>
            <div class="comment-box">${comments}</div>` : ``}
          </div>
        `;

        if (hasComments) {
          const toggle = card.querySelector(".comment-toggle");
          const box    = card.querySelector(".comment-box");

          toggle.onclick = () => {
            const visible = box.style.display === "block";
            box.style.display = visible ? "none" : "block";
            toggle.textContent = visible ? "Ver comentarios" : "Ocultar comentarios";
          };
        }

        cardsEl.appendChild(card);
      });
    }

    loadData();