import { useId, useMemo, useState } from "react";
import "./travelerMultiSelect.css";

export type TravelerOption = {
  id: string;
  name: string;
  email?: string;
};

type Props = {
  label: string;
  options: TravelerOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
};

export function TravelerMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  disabled = false,
  required = false,
  emptyMessage = "No travelers available."
}: Props) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(true);
  const searchId = useId();
  const groupId = useId();

  const available = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options]
  );
  const selected = useMemo(
    () => [...new Set(selectedIds)].filter((id) => available.has(id)),
    [selectedIds, available]
  );
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return options.filter((option) =>
      `${option.name} ${option.email ?? ""}`
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    );
  }, [options, query]);

  function toggle(id: string) {
    if (disabled || !available.has(id)) return;
    onChange(
      selectedSet.has(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id]
    );
  }

  return (
    <div
      className={`traveler-multi-select${disabled ? " traveler-multi-select--disabled" : ""}`}
      role="group"
      aria-labelledby={groupId}
    >
      <div className="traveler-multi-select__heading">
        <div className="traveler-multi-select__title-wrap">
          <span className="traveler-multi-select__title" id={groupId}>
            {label}{required && <span className="traveler-multi-select__required" aria-hidden="true"> *</span>}
          </span>
          <span className="traveler-multi-select__description">
            Choose one or more travelers.
          </span>
        </div>
        <span className="traveler-multi-select__count">
          {selected.length} selected
        </span>
      </div>

      {selected.length > 0 && (
        <div className="traveler-multi-select__chips" aria-label="Selected travelers">
          {selected.map((id) => {
            const traveler = available.get(id);
            if (!traveler) return null;
            return (
              <span className="traveler-multi-select__chip" key={id}>
                <span className="traveler-multi-select__chip-name">{traveler.name}</span>
                <button
                  type="button"
                  className="traveler-multi-select__chip-remove"
                  disabled={disabled}
                  aria-label={`Remove ${traveler.name}`}
                  onClick={() => toggle(id)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="traveler-multi-select__toolbar">
        <div className="traveler-multi-select__search-wrap">
          <svg className="traveler-multi-select__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            id={searchId}
            className="traveler-multi-select__search"
            type="search"
            placeholder="Search by name or email"
            aria-label={`Search ${label.toLowerCase()}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={disabled || options.length === 0}
          />
        </div>
        <button
          className="traveler-multi-select__toggle"
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={`${searchId}-options`}
          disabled={disabled || options.length === 0}
        >
          {expanded ? "Hide list" : "Show list"}
        </button>
      </div>

      {expanded && (
        <div
          className="traveler-multi-select__options"
          id={`${searchId}-options`}
          role="group"
          aria-label={`${label} options`}
        >
          {visible.length === 0 ? (
            <p className="traveler-multi-select__empty">
              {options.length === 0 ? emptyMessage : "No matching travelers."}
            </p>
          ) : (
            visible.map((option) => (
              <label className="traveler-multi-select__option" key={option.id}>
                <input
                  className="traveler-multi-select__checkbox"
                  type="checkbox"
                  checked={selectedSet.has(option.id)}
                  disabled={disabled}
                  onChange={() => toggle(option.id)}
                />
                <span className="traveler-multi-select__person">
                  <span className="traveler-multi-select__name">{option.name}</span>
                  {option.email && (
                    <span className="traveler-multi-select__email">{option.email}</span>
                  )}
                </span>
              </label>
            ))
          )}
        </div>
      )}

      {options.length > 1 && (
        <div className="traveler-multi-select__actions">
          <span className="traveler-multi-select__summary">
            {options.length} traveler{options.length === 1 ? "" : "s"} available
          </span>
          <div className="traveler-multi-select__action-buttons">
            <button
              type="button"
              disabled={disabled || selected.length === options.length}
              onClick={() => onChange(options.map((item) => item.id))}
            >
              Select all
            </button>
            <button
              type="button"
              disabled={disabled || selected.length === 0}
              onClick={() => onChange([])}
            >
              Clear
            </button>
          </div>
        </div>
      )}
      {required && (
        <input
          className="traveler-multi-select__validation"
          tabIndex={-1}
          aria-hidden="true"
          value={selected.length > 0 ? "selected" : ""}
          onChange={() => {}}
          required
        />
      )}
    </div>
  );
}
