const STAR_SIZE   = 26;
const GAP         = 4;
const COLOR_EMPTY = "#2e2e2e";

/** Maps a 0–10 score to an hsl color (red → green). */
function getColor(score) {
  const hue = (score / 10) * 120;
  return `hsl(${hue}, 70%, 50%)`;
}

/** Builds the SVG path string for a 5-point star. */
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

/** Renders a single star SVG element with a partial fill clip. */
function renderStar(x, fill, uid, s, color) {
  const cx    = x + s / 2;
  const cy    = s / 2;
  const d     = buildStarPath(cx, cy, s * 0.46, s * 0.19);
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

/**
 * Renders a row of 5 stars for a given 0–10 score.
 * @param {number} score10
 * @param {number} [size]
 * @returns {string} SVG markup
 */
export function renderStars(score10, size) {
  const s      = size || STAR_SIZE;
  score10      = Math.max(0, Math.min(10, Math.round(score10 * 4) / 4));
  const score5 = score10 / 2;
  const color  = getColor(score10);
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
