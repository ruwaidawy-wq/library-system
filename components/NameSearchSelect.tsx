"use client";
import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";

export default function NameSearchSelect({
  value, onChange, options, placeholder, accentColor = "#065f46",
}: {
  value: string;
  onChange: (name: string) => void;
  options: string[];
  placeholder?: string;
  accentColor?: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => { setQuery(value); }, [value]);

  const trimmedQuery = query.trim();
  const filtered = options.filter((o) => o.includes(query));
  const exactMatch = options.some((o) => o === trimmedQuery);
  const canAddCustom = trimmedQuery.length > 0 && !exactMatch;

  function selectOption(name: string) {
    onChange(name);
    setQuery(name);
    setOpen(false);
  }

  function commitFreeText() {
    const trimmed = query.trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!canAddCustom && filtered.length > 0) selectOption(filtered[0]);
      else commitFreeText();
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-9 pr-8 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
          placeholder={placeholder || "พิมพ์เพื่อค้นหา..."}
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => { commitFreeText(); setOpen(false); }, 200)}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: accentColor }} />
        )}
      </div>
      {open && (filtered.length > 0 || canAddCustom) && (
        <div className="absolute z-10 left-0 right-0 border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto mt-1 bg-white">
          {filtered.map((name) => (
            <button key={name} type="button"
              onMouseDown={() => selectOption(name)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors">
              {name}
            </button>
          ))}
          {canAddCustom && (
            <button type="button"
              onMouseDown={() => selectOption(trimmedQuery)}
              className="w-full flex items-center gap-1.5 text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors border-t border-slate-100"
              style={{ color: accentColor }}>
              <Plus size={14} /> ใช้ชื่อ &quot;{trimmedQuery}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
