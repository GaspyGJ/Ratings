const DATASETS = {
  games:  "https://opensheet.elk.sh/1_U-jixHUZXcuKA6k1rfThC1V4uzHK4193DhzYBzdjFI/Juegos",
  movies: "https://opensheet.elk.sh/1_U-jixHUZXcuKA6k1rfThC1V4uzHK4193DhzYBzdjFI/Peliculas",
};

/**
 * Fetches and normalizes rows from the given dataset key.
 * @param {"games"|"movies"} dataset
 * @returns {Promise<Array>}
 */
export async function fetchData(dataset) {
  const res  = await fetch(DATASETS[dataset]);
  const data = await res.json();

  return data.map(r => ({
    cover:    r["Cover"]  || "",
    title:    r["Title"]  || "",
    saga:     r["Saga"]   || "",
    score:    Number((r["Score"] || "0").toString().replace(",", ".")),
    comments: r["Comments"] || "",
  }));
}
