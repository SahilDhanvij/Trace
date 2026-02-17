"use client";

import { useEffect, useRef, useCallback } from "react";
import { Node, Edge } from "@/types";

interface GlobePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude: number;
  color: string;
  size: number;
}

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string[];
}

interface MapViewProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  connectingFromId: string | null;
  onNodeClick: (node: Node) => void;
  onGlobeClick?: (lat: number, lng: number) => void;
}

export default function MapView({
  nodes,
  edges,
  selectedNodeId,
  connectingFromId,
  onNodeClick,
  onGlobeClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // Build points data
  const getPoints = useCallback((): GlobePoint[] => {
    return nodes.map((n) => ({
      id: n.id,
      name: n.name,
      lat: Number(n.latitude),
      lng: Number(n.longitude),
      altitude: 0.018,
      color:
        n.id === connectingFromId
          ? "#f97316"   // orange — source of a new edge
          : n.id === selectedNodeId
          ? "#38bdf8"   // sky blue — selected
          : "#a78bfa",  // violet — default
      size: n.id === selectedNodeId || n.id === connectingFromId ? 0.55 : 0.4,
    }));
  }, [nodes, selectedNodeId, connectingFromId]);

  // Build arcs data
  const getArcs = useCallback((): GlobeArc[] => {
    return edges.flatMap((e) => {
      const from = nodes.find((n) => n.id === e.fromId);
      const to = nodes.find((n) => n.id === e.toId);
      if (!from || !to) return [];
      return [
        {
          startLat: Number(from.latitude),
          startLng: Number(from.longitude),
          endLat: Number(to.latitude),
          endLng: Number(to.longitude),
          color: ["rgba(167,139,250,0.15)", "rgba(56,189,248,0.9)", "rgba(167,139,250,0.15)"],
        },
      ];
    });
  }, [nodes, edges]);

  // Init globe once
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    let destroyed = false;

    import("globe.gl").then((mod) => {
      if (destroyed || !containerRef.current) return;

      const Globe = mod.default as any;

      const globe = Globe({ animateIn: true })(containerRef.current)
        .globeImageUrl(
          "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        )
        .bumpImageUrl(
          "//unpkg.com/three-globe/example/img/earth-topology.png"
        )
        .backgroundImageUrl(
          "//unpkg.com/three-globe/example/img/night-sky.png"
        )
        .showAtmosphere(true)
        .atmosphereColor("#4f8ef7")
        .atmosphereAltitude(0.18)
        // Points
        .pointsData([])
        .pointLat("lat")
        .pointLng("lng")
        .pointColor("color")
        .pointAltitude("altitude")
        .pointRadius("size")
        .pointResolution(16)
        .pointsMerge(false)
        .onPointClick((point: any) => {
          const node = nodes.find((n) => n.id === point.id);
          if (node) onNodeClick(node);
        })
        // Arcs
        .arcsData([])
        .arcStartLat("startLat")
        .arcStartLng("startLng")
        .arcEndLat("endLat")
        .arcEndLng("endLng")
        .arcColor("color")
        .arcAltitude(0.25)
        .arcStroke(0.5)
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(2500)
        // Labels
        .labelsData([])
        .labelLat("lat")
        .labelLng("lng")
        .labelText("name")
        .labelSize(1.2)
        .labelDotRadius(0.3)
        .labelColor(() => "rgba(255,255,255,0.85)")
        .labelResolution(3);

      // Handle clicks on the globe surface itself
      globe.onGlobeClick(({ lat, lng }: { lat: number; lng: number }) => {
        onGlobeClick?.(lat, lng);
      });

      // Responsive sizing
      const resize = () => {
        if (containerRef.current) {
          globe.width(containerRef.current.clientWidth);
          globe.height(containerRef.current.clientHeight);
        }
      };
      resize();
      window.addEventListener("resize", resize);

      // Gentle auto-rotation
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      globe.controls().enableZoom = true;

      // Stop rotation on user interaction
      globe.controls().addEventListener("start", () => {
        globe.controls().autoRotate = false;
      });

      globeRef.current = globe;
    });

    return () => {
      destroyed = true;
      window.removeEventListener("resize", () => {});
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    const points = getPoints();
    globeRef.current.pointsData(points);
    globeRef.current.labelsData(points);
    globeRef.current.onPointClick((point: any) => {
      const node = nodes.find((n) => n.id === point.id);
      if (node) onNodeClick(node);
    });
  }, [getPoints, nodes, onNodeClick]);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.arcsData(getArcs());
  }, [getArcs]);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.onGlobeClick(({ lat, lng }: { lat: number; lng: number }) => {
      onGlobeClick?.(lat, lng);
    });
  }, [onGlobeClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: "#0a0a1a" }}
    />
  );
}
