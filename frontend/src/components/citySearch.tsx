"use client";

import { GeoCodingResult } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface CitySearchProps {
  onSelect: (result: GeoCodingResult) => void;
  disabled?: boolean;
}
export default function CitySearch(props: CitySearchProps) {
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`,
      );
      const data = await res.json();
      const mapped: GeoCodingResult[] = (data.results || []).map((r: any) => ({
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country,
        admin1: r.admin1,
      }));
      setResults(mapped);
      setOpen(mapped.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (result: GeoCodingResult) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    props.onSelect(result);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center gap-2.5 px-3.5 cursor-text w-[140px] md:w-[220px]"
        style={{
          height: 38,
          borderRadius: 12,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {loading ? (
          <div
            className="w-3.5 h-3.5 rounded-full border-2 border-transparent flex-shrink-0 animate-spin"
            style={{ borderTopColor: "rgba(255, 215, 0, 0.6)" }}
          />
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 215, 0, 0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            className="flex-shrink-0"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => {
            if (!query) setTimeout(() => setFocused(false), 200);
          }}
          placeholder="Search a city…"
          disabled={props.disabled}
          className="flex-1 bg-transparent outline-none text-[12px] min-w-0"
          style={{
            color: "rgba(255,255,255,0.8)",
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: "0.03em",
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="flex-shrink-0 p-0.5 rounded-full transition-colors text-white/30 hover:text-white/60"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute top-full right-0 mt-2 overflow-hidden z-50"
          style={{
            width: 300,
            borderRadius: 14,
            background: "rgba(8, 8, 20, 0.92)",
            border: "1px solid rgba(255, 215, 0, 0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="px-3.5 py-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.2em]"
              style={{ color: "rgba(255, 215, 0, 0.5)" }}
            >
              Results
            </span>
          </div>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all duration-150 hover:bg-gold-50"
              style={{
                borderBottom:
                  i < results.length - 1
                    ? "1px solid rgba(255,255,255,0.03)"
                    : "none",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255, 215, 0, 0.08)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255, 215, 0, 0.6)" className="flex-shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {r.name}
                </span>
                <span className="block text-[11px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {[r.admin1, r.country].filter(Boolean).join(", ")}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
