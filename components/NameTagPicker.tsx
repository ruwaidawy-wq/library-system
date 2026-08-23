"use client";
import { useState } from "react";
import { Search, X, Plus } from "lucide-react";

export default function NameTagPicker({
  value, onChange, options, placeholder, accentColor = "#065f46",
}: {
  value: string[];
  onChange: (names: string[]) => void;
  options: string[];
  placeholder?: string;
  accentColor?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const trimmedQuery = query.trim();
  const filtered = options.filter((o) => o.includes(query) && !value.includes(o));
  const exactMatch = options.some((o) => o === trimmedQuery);
  const canAddCustom = trimmedQuery.length > 0 && !exactMatch && !value.includes(trimmedQuery);

  function addName(name: string) {
    if (!value.includes(name)) onChange([...value, name]);
    setQuery("");
    setOpen(false);
  }

  function removeName(name: string) {
    onChange(value.filter((n) => n !== name));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canAddCustom) addName(trimmedQuery);
      else if (filtered.length > 0) addName(filtered[0]);
    }
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((name) => (
            <span key={name} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: `${accentColor}1a`, color: accentColor }}>
              {name}
              <button type="button" onClick={() => removeName(name)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400"
          placeholder={placeholder || "พิมพ์เพื่อค้นหาแล้วเลือก..."}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
        />
        {open && (filtered.length > 0 || canAddCustom) && (
          <div className="absolute z-10 left-0 right-0 border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto mt-1 bg-white">
            {filtered.map((name) => (
              <button key={name} type="button"
                onMouseDown={() => addName(name)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors">
                {name}
              </button>
            ))}
            {canAddCustom && (
              <button type="button"
                onMouseDown={() => addName(trimmedQuery)}
                className="w-full flex items-center gap-1.5 text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors border-t border-slate-100"
                style={{ color: accentColor }}>
                <Plus size={14} /> เพิ่ม &quot;{trimmedQuery}&quot;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
