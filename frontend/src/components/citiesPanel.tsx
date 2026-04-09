"use client";

import { useState, useMemo } from "react";
import { Node } from "@/types";
import { MapPin, ChevronLeft, ChevronRight, Home, Search } from "lucide-react";

interface CitiesPanelProps {
  nodes: Node[];
  homeNodeId: string | null;
  onCityClick: (node: Node) => void;
}

export default function CitiesPanel({
  nodes,
  homeNodeId,
  onCityClick,
}: CitiesPanelProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const sorted = useMemo(() => {
    const filtered = nodes.filter((n) =>
      n.name.toLowerCase().includes(filter.toLowerCase()),
    );
    return filtered.sort((a, b) => {
      if (a.id === homeNodeId) return -1;
      if (b.id === homeNodeId) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [nodes, homeNodeId, filter]);

  return (
    <div className="absolute left-0 top-14 bottom-0 z-10 hidden md:flex">
      {/* Panel */}
      <div
        className={`h-full flex flex-col transition-all duration-300 ease-out overflow-hidden ${
          open ? "w-64" : "w-0"
        }`}
        style={{
          background: "rgba(4,4,12,0.92)",
          borderRight: open ? "1px solid rgba(212,175,55,0.12)" : "none",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] font-medium tracking-[0.3em] uppercase"
              style={{ color: "rgba(212,175,55,0.7)" }}
            >
              My Cities
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {nodes.length}
            </span>
          </div>

          {nodes.length > 4 && (
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Search
                className="w-3 h-3 shrink-0"
                style={{ color: "rgba(255,255,255,0.2)" }}
              />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter..."
                className="flex-1 bg-transparent outline-none text-xs min-w-0"
                style={{ color: "rgba(255,255,255,0.7)" }}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {sorted.length === 0 ? (
            <p
              className="text-center text-xs py-8"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              {filter ? "No matches" : "No cities yet"}
            </p>
          ) : (
            sorted.map((node) => {
              const isHome = node.id === homeNodeId;
              return (
                <button
                  key={node.id}
                  onClick={() => onCityClick(node)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all group hover:bg-white/[0.04]"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isHome
                        ? "rgba(212,175,55,0.12)"
                        : "rgba(255,255,255,0.04)",
                    }}
                  >
                    {isHome ? (
                      <Home
                        className="w-3 h-3"
                        style={{ color: "rgba(212,175,55,0.8)" }}
                      />
                    ) : (
                      <MapPin
                        className="w-3 h-3"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className="block text-[13px] truncate transition-colors group-hover:text-white/90"
                      style={{
                        color: isHome
                          ? "rgba(212,175,55,0.85)"
                          : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {node.name}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Toggle tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="self-start mt-4 flex items-center justify-center rounded-r-lg transition-all hover:bg-white/[0.06]"
        style={{
          width: 28,
          height: 48,
          background: "rgba(4,4,12,0.85)",
          borderTop: "1px solid rgba(212,175,55,0.1)",
          borderRight: "1px solid rgba(212,175,55,0.1)",
          borderBottom: "1px solid rgba(212,175,55,0.1)",
          color: "rgba(212,175,55,0.5)",
        }}
        title={open ? "Close cities panel" : "Open cities panel"}
      >
        {open ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
