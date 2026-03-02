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

  const expanded = focused || query.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center gap-2 transition-all duration-300 ease-out"
        style={{
          width: expanded ? 280 : 44,
          height: 44,
          borderRadius: expanded ? 14 : 22,
          background: "rgba(8, 8, 20, 0.75)",
          border: `1px solid ${expanded ? "rgba(200, 160, 32, 0.25)" : "rgba(255,255,255,0.08)"}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: expanded
            ? "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 4px 16px rgba(0,0,0,0.3)",
          padding: expanded ? "0 14px" : "0",
          justifyContent: expanded ? "flex-start" : "center",
          cursor: expanded ? "text" : "pointer",
          overflow: "hidden",
        }}
        onClick={() => {
          if (!expanded) {
            setFocused(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      >
        {loading ? (
          <div
            className="w-4 h-4 rounded-full border-2 border-transparent flex-shrink-0 animate-spin"
            style={{ borderTopColor: "rgba(200, 160, 32, 0.6)" }}
          />
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(200, 160, 32, 0.5)"
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
          className="flex-1 bg-transparent outline-none text-[13px] min-w-0 tracking-wide"
          style={{
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Inter', system-ui, sans-serif",
            opacity: expanded ? 1 : 0,
            width: expanded ? "auto" : 0,
            transition: "opacity 0.2s",
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="flex-shrink-0 p-0.5 rounded-full transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
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
            border: "1px solid rgba(200, 160, 32, 0.12)",
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
              className="text-[9px] uppercase tracking-[0.2em]"
              style={{ color: "rgba(200, 160, 32, 0.35)" }}
            >
              Results
            </span>
          </div>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all duration-150"
              style={{
                borderBottom:
                  i < results.length - 1
                    ? "1px solid rgba(255,255,255,0.03)"
                    : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(200, 160, 32, 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(200, 160, 32, 0.08)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(200, 160, 32, 0.6)" className="flex-shrink-0">
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
