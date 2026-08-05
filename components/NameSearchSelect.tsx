"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

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

  const filtered = options.filter((o) => o.includes(query));

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
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: accentColor }} />
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-10 left-0 right-0 border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto mt-1 bg-white">
          {filtered.map((name) => (
            <button key={name} type="button"
              onMouseDown={() => { onChange(name); setQuery(name); setOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm transition-colors">
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
