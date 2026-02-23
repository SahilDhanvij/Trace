"use client";

import { api } from "@/lib/api";
import { GeoCodingResult, Node } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { exp } from "three/tsl";

interface HomeCityModalProps {
  currentHomeNode?: string;
  onDone: (homeNode: Node) => void;
}

export default function HomeCityModal({
  currentHomeNode,
  onDone,
}: HomeCityModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoCodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

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
      setResults(
        (data.results || []).map((r: any) => ({
          name: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          country: r.country,
          admin1: r.admin1,
        })),
      );
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

  const handleSelect = async (result: GeoCodingResult) => {
    setSaving(true);
    try {
      const newNode = await api.createNode({
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
      });
      await api.setHomeNode(newNode.id);
      onDone(newNode);
    } catch (err: any) {
      alert(err.message || "Failed to save home city.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl p-6"
        style={{
          background: "rgba(10,10,30,0.98)",
          border: "1px solid rgba(200,160,32,0.4)",
          boxShadow: "0 0 60px rgba(200,160,32,0.1)",
        }}
      >
        <div className="mb-6 text-center">
          <div
            className="text-xs font-mono tracking-widest mb-2"
            style={{ color: "#c8a020" }}
          >
            {currentHomeNode ? "CHANGE HOME CITY" : "WELCOME TO TRACE"}
          </div>
          <div
            className="text-sm font-mono"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {currentHomeNode
              ? `Current: ${currentHomeNode}`
              : "Where do you call home?"}
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-2"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(200,160,32,0.3)",
          }}
        >
          {loading ? (
            <div
              className="w-4 h-4 rounded-full border-2 border-transparent flex-shrink-0 animate-spin"
              style={{ borderTopColor: "#c8a020" }}
            />
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(200,160,32,0.6)"
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
            placeholder="Search your home city..."
            className="flex-1 bg-transparent outline-none text-sm font-mono"
            style={{ color: "#e0e0ff" }}
            disabled={saving}
          />
        </div>

        {results.length > 0 && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelect(r)}
                disabled={saving}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  borderBottom:
                    i < results.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                  opacity: saving ? 0.5 : 1,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(200,160,32,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span style={{ color: "#c8a020" }}>⌂</span>
                <div className="min-w-0">
                  <span
                    className="block text-sm font-mono truncate"
                    style={{ color: "#e0e0ff" }}
                  >
                    {r.name}
                  </span>
                  <span
                    className="block text-xs font-mono truncate"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {[r.admin1, r.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {saving && (
          <div
            className="mt-4 text-center text-xs font-mono"
            style={{ color: "rgba(200,160,32,0.6)" }}
          >
            SAVING...
          </div>
        )}
      </div>
    </div>
  );
}
