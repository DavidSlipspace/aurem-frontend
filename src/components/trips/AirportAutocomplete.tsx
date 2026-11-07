import { useEffect, useId, useRef, useState } from "react";
import { loadAirports, type Airport } from "./airportData";

type AirportAutocompleteProps = {
  label: string;
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export function AirportAutocomplete({ label, value, onChange, disabled = false }: AirportAutocompleteProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    loadAirports().then((items) => {
      if (mounted) { setAirports(items); setLoading(false); setLoadError(""); }
    }).catch(() => {
      if (mounted) { setLoading(false); setLoadError("Airport list unavailable. Please refresh and try again."); }
    });
    return () => { mounted = false; };
  }, []);

  const selectedAirport = airports.find((airport) => airport.code === value.toUpperCase());
  const search = query.trim().toLowerCase();
  const matches = search ? airports.filter((airport) =>
    airport.code.toLowerCase().startsWith(search) ||
    airport.city.toLowerCase().includes(search) ||
    airport.name.toLowerCase().includes(search) ||
    airport.country.toLowerCase() === search
  ).sort((a, b) => {
    const score = (airport: Airport) => airport.code.toLowerCase() === search ? 0
      : airport.code.toLowerCase().startsWith(search) ? 1
      : airport.city.toLowerCase().startsWith(search) ? 2 : 3;
    return score(a) - score(b);
  }).slice(0, 8) : [];

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.setCustomValidity(
      loading ? "Loading airports. Please wait." : loadError || (!selectedAirport ? "Select an airport from the suggestions." : "")
    );
  }, [loading, loadError, selectedAirport]);

  function choose(airport: Airport) {
    onChange(airport.code);
    setQuery("");
    setOpen(false);
    setActiveIndex(0);
  }

  return (
    <div className="airport-autocomplete" style={{ position: "relative" }}>
      <label htmlFor={listId}>{label} *</label>
      <input
        id={listId}
        ref={inputRef}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && matches.length > 0}
        aria-controls={`${listId}-options`}
        aria-activedescendant={open && matches[activeIndex] ? `${listId}-option-${activeIndex}` : undefined}
        placeholder="Search airport, city, or IATA code"
        value={open || query ? query : selectedAirport ? `${selectedAirport.code} — ${selectedAirport.name}` : value}
        disabled={disabled || loading || !!loadError}
        required
        onFocus={() => { setQuery(""); setOpen(true); setActiveIndex(0); }}
        onChange={(event) => { setQuery(event.target.value); onChange(""); setOpen(true); setActiveIndex(0); }}
        onBlur={() => { window.setTimeout(() => { setOpen(false); setQuery(""); }, 150); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") { setOpen(false); setQuery(""); }
          if (!open || !matches.length) return;
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((i) => (i + 1) % matches.length); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((i) => (i + matches.length - 1) % matches.length); }
          if (event.key === "Enter") { event.preventDefault(); choose(matches[activeIndex] ?? matches[0]); }
        }}
      />
      {loading && <small>Loading airport directory…</small>}
      {loadError && <small role="alert">{loadError}</small>}
      {open && search && !loading && !loadError && (
        <div id={`${listId}-options`} role="listbox" style={{ position: "absolute", zIndex: 20, top: "100%", left: 0, right: 0, background: "white", color: "#111", border: "1px solid #bbb", borderRadius: 6, maxHeight: 260, overflowY: "auto", boxShadow: "0 4px 12px #0002" }}>
          {matches.length ? matches.map((airport, index) => (
            <div
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              key={airport.code}
              onMouseDown={(event) => { event.preventDefault(); choose(airport); }}
              onMouseEnter={() => setActiveIndex(index)}
              style={{ padding: "9px 12px", cursor: "pointer", background: index === activeIndex ? "#eef3fa" : "white" }}
            >
              <strong>{airport.code}</strong> — {airport.name}
              <div style={{ fontSize: 12, color: "#555" }}>{[airport.city, airport.country].filter(Boolean).join(", ")}</div>
            </div>
          )) : <div style={{ padding: 12 }}>No matching airports</div>}
        </div>
      )}
    </div>
  );
}
