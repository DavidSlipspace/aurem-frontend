export type Airport = { code: string; name: string; city: string; country: string };

// Public-domain data: https://ourairports.com/data/ (nightly updated).
const AIRPORTS_URL = "https://davidmegginson.github.io/ourairports-data/airports.csv";
let cachedRequest: Promise<Airport[]> | null = null;

function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field); field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = []; field = "";
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function loadAirports(): Promise<Airport[]> {
  if (!cachedRequest) {
    cachedRequest = fetch(AIRPORTS_URL)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Airport database unavailable (${response.status}).`);
        const rows = parseCsv(await response.text());
        const headers = rows.shift();
        if (!headers) throw new Error("Airport database is empty.");
        const column = (name: string) => headers.indexOf(name);
        const indexes = ["iata_code", "name", "municipality", "iso_country", "scheduled_service", "type"].map(column);
        if (indexes.some((index) => index < 0)) throw new Error("Airport database format has changed.");
        const [iata, name, city, country, scheduled, type] = indexes;
        const byCode = new Map<string, Airport>();
        for (const row of rows) {
          const code = (row[iata] || "").trim().toUpperCase();
          if (!/^[A-Z]{3}$/.test(code) || row[scheduled] !== "yes") continue;
          if (!["large_airport", "medium_airport", "small_airport"].includes(row[type])) continue;
          if (!byCode.has(code)) byCode.set(code, {
            code, name: row[name] || code, city: row[city] || "", country: row[country] || ""
          });
        }
        if (!byCode.size) throw new Error("No eligible airports were found.");
        return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
      })
      .catch((error: unknown) => { cachedRequest = null; throw error; });
  }
  return cachedRequest;
}
