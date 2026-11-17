import { useId, useMemo, useState } from "react";
import "./travelerMultiSelect.css";

export type TravelerOption = { id: string; name: string; email?: string };

type Props = {
  label: string;
  options: TravelerOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
};

export function TravelerMultiSelect({ label, options, selectedIds, onChange, disabled = false, required = false, emptyMessage = "No travelers available." }: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(true);
  const searchId = useId();
  const available = useMemo(() => new Map(options.map((option) => [option.id, option])), [options]);
  const selected = selectedIds.filter((id) => available.has(id));
  const visible = options.filter((option) => `${option.name} ${option.email ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  return (
    <div className="traveler-multi-select" role="group" aria-label={label}>
      <div className="traveler-multi-select__heading"><strong>{label}{required ? " *" : ""}</strong><span>{selected.length} selected</span></div>
      <div className="traveler-multi-select__chips" aria-live="polite">
        {selected.length === 0 && <span className="traveler-multi-select__placeholder">No travelers selected</span>}
        {selected.map((id) => <span className="traveler-multi-select__chip" key={id}>{available.get(id)?.name}<button type="button" disabled={disabled} aria-label={`Remove ${available.get(id)?.name}`} onClick={() => toggle(id)}>×</button></span>)}
      </div>
      <div className="traveler-multi-select__toolbar">
        <input id={searchId} type="search" placeholder="Search by name or email" aria-label={`Search ${label.toLowerCase()}`} value={query} onChange={(event) => setQuery(event.target.value)} disabled={disabled || options.length === 0} />
        <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} disabled={disabled || options.length === 0}>{expanded ? "Hide" : "Show"}</button>
      </div>
      {expanded && <div className="traveler-multi-select__options" role="group" aria-label={`${label} options`}>
        {visible.length === 0 ? <p className="traveler-multi-select__empty">{options.length === 0 ? emptyMessage : "No matching travelers."}</p> : visible.map((option) => <label className="traveler-multi-select__option" key={option.id}><input type="checkbox" checked={selected.includes(option.id)} disabled={disabled} onChange={() => toggle(option.id)} /><span><strong>{option.name}</strong>{option.email && <small>{option.email}</small>}</span></label>)}
      </div>}
      {options.length > 1 && <div className="traveler-multi-select__actions"><button type="button" disabled={disabled || selected.length === options.length} onClick={() => onChange(options.map((item) => item.id))}>Select all</button><button type="button" disabled={disabled || selected.length === 0} onClick={() => onChange([])}>Clear</button></div>}
    </div>
  );
}
