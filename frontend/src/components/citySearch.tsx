"use client";

import { GeoCodingResult } from "@/types";
import { clear } from "console";
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
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{
          background: "rgba(10,10,30,0.9)",
          border: "1px solid rgba(167,139,250,0.3)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        {loading ? (
          <div
            className="w-4 h-4 rounded-full border-2 border-transparent flex-shrink-0 animate-spin"
            style={{ borderTopColor: "#a78bfa" }}
          />
        ) : (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(167,139,250,0.7)"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search a city..."
          disabled= {props.disabled}
          className="flex-1 bg-transparent outline-none text-sm min-w-0"
          style={{ color: "#e0e0ff" }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-50"
          style={{
            background: "rgba(10,10,30,0.97)",
            border: "1px solid rgba(167,139,250,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{
                borderBottom:
                  i < results.length - 1
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(167,139,250,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="#a78bfa"
                className="flex-shrink-0 mt-0.5"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              <div className="min-w-0">
                <span
                  className="block text-sm font-medium truncate"
                  style={{ color: "#e0e0ff" }}
                >
                  {r.name}
                </span>
                <span
                  className="block text-xs truncate"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
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
