"use client";

import { api } from "@/lib/api";
import { Edge, GeoCodingResult, Node } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CitySearch from "@/components/citySearch";
import dynamic from "next/dynamic";
import HomeCityModal from "@/components/homeCityModal";
import VaultPanel from "@/components/vaultPanel";
import OnboardingHint from "@/components/onboardingHint";
import type { MapViewHandle } from "@/components/mapView";
import { Search, Bell, LogOut, Sun, Moon, X } from "lucide-react";

const MapView = dynamic(() => import("@/components/mapView"), { ssr: false });

export default function MapPage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [homeNodeId, setHomeNodeId] = useState<string | null>(null);
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [vaultNode, setVaultNode] = useState<Node | null>(null);
  const [pendingEdgeNodeId, setPendingEdgeNodeId] = useState<string | null>(null);
  const [homeJustSet, setHomeJustSet] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [dayMode, setDayMode] = useState(true);
  const mapRef = useRef<MapViewHandle>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, nodesData, edgesData] = await Promise.all([
        api.getMe(),
        api.getNodes(),
        api.getEdges(),
      ]);
      setUser(userData);
      setNodes(nodesData);
      setEdges(edgesData);
      if (!userData.homeNodeId) {
        setShowHomeModal(true);
      } else {
        setHomeNodeId(userData.homeNodeId);
      }
    } catch (error: any) {
      const isAuthError =
        error?.message?.includes("Session expired") ||
        error?.message?.includes("Unauthorized");
      if (!isAuthError) {
        console.error("Error loading data:", error);
        toast.error("Error loading data.");
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Best-effort
    }
    api.clearAccessToken();
    router.push("/login");
  };

  const handleHomeDone = useCallback((homeNode: Node) => {
    setNodes((prev) =>
      prev.find((n) => n.id === homeNode.id) ? prev : [...prev, homeNode],
    );
    setHomeNodeId(homeNode.id);
    setShowHomeModal(false);
    setHomeJustSet(true);
    toast.success(`${homeNode.name} set as home!`);
  }, []);

  const handleCitySelected = useCallback(
    async (result: GeoCodingResult) => {
      if (!homeNodeId) {
        toast("Set your home city first!");
        setShowHomeModal(true);
        return;
      }
      try {
        const newNode = await api.createNode({
          name: result.name,
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setNodes((prev) => [...prev, newNode]);
        setPendingEdgeNodeId(newNode.id);
        setSelectedNodeId(newNode.id);
        setVaultNode(newNode);
        setShowSearch(false);
        toast.success(`${result.name} added — upload 2 photos to connect!`);
      } catch (error: any) {
        toast.error(error.message || "Failed to add city.");
      }
    },
    [homeNodeId],
  );

  const handleEdgeCreated = useCallback(
    async (nodeId: string) => {
      if (!homeNodeId) return;
      try {
        const newEdge = await api.createEdge(homeNodeId, nodeId);
        setEdges((prev) => [...prev, newEdge]);
        setPendingEdgeNodeId(null);
        toast.success("Arc connected!");
      } catch (error: any) {
        toast.error(error.message || "Failed to create arc.");
      }
    },
    [homeNodeId],
  );

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
    setVaultNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="text-sm tracking-[0.3em] font-mono animate-pulse text-gold-500">
          INITIALIZING TRACE...
        </div>
      </div>
    );
  }

  const homeNode = nodes.find((n) => n.id === homeNodeId);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#050508] flex flex-col">
      {showHomeModal && (
        <HomeCityModal
          currentHomeNode={homeNode?.name}
          onDone={handleHomeDone}
          onClose={homeNodeId ? () => setShowHomeModal(false) : undefined}
        />
      )}

      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <nav
        className="shrink-0 flex items-center justify-between px-6 h-14 z-20"
        style={{
          background: "rgba(10,10,16,0.95)",
          borderBottom: "1px solid rgba(255,215,0,0.08)",
        }}
      >
        {/* Left: brand + tabs */}
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold tracking-[0.25em] text-white">
            TRACE
          </span>

          <div className="hidden md:flex items-center gap-1">
            <button className="px-4 py-1.5 text-[13px] font-medium tracking-[0.15em] uppercase text-gold transition-colors">
              Overview
            </button>
            <button className="px-4 py-1.5 text-[13px] font-medium tracking-[0.15em] uppercase text-white/40 hover:text-white/70 transition-colors">
              Archives
            </button>
          </div>
        </div>

        {/* Right: search + icons */}
        <div className="flex items-center gap-1">
          {showSearch ? (
            <div className="flex items-center gap-1">
              <CitySearch onSelect={handleCitySelected} />
              <button
                onClick={() => setShowSearch(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-gold hover:bg-white/[0.04] transition-colors"
              title="Search city"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
          )}
          <button
            onClick={() => setDayMode((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-gold hover:bg-white/[0.04] transition-colors"
            title={dayMode ? "Switch to night" : "Switch to day"}
          >
            {dayMode ? (
              <Moon className="w-[18px] h-[18px]" />
            ) : (
              <Sun className="w-[18px] h-[18px]" />
            )}
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors">
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
            title="Log out"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </nav>

      {/* ── Main content area ───────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Globe */}
        <div className="absolute inset-0">
          <MapView
            ref={mapRef}
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            connectingFromId={null}
            homeNodeId={homeNodeId}
            dayMode={dayMode}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Onboarding tooltip sequence */}
        <OnboardingHint
          nodeCount={nodes.length}
          hasHomeNode={!!homeNodeId}
          homeJustSet={homeJustSet}
        />
      </div>

      {/* ── Vault Panel — right sidebar ─────────────────────────── */}
      <VaultPanel
        node={vaultNode}
        onClose={async () => {
          if (vaultNode && vaultNode.id === pendingEdgeNodeId) {
            try {
              await api.deleteNode(vaultNode.id);
              setNodes((prev) => prev.filter((n) => n.id !== vaultNode.id));
              toast("City removed — no photos were added.");
            } catch {}
            setPendingEdgeNodeId(null);
          }
          setVaultNode(null);
          setSelectedNodeId(null);
        }}
        onDeleteNode={async (nodeId) => {
          try {
            await api.deleteNode(nodeId);
            setNodes((prev) => prev.filter((n) => n.id !== nodeId));
            setEdges((prev) =>
              prev.filter((e) => e.fromId !== nodeId && e.toId !== nodeId),
            );
            setPendingEdgeNodeId(null);
            setVaultNode(null);
            setSelectedNodeId(null);
            toast.success("City removed.");
          } catch (error: any) {
            toast.error(error.message || "Failed to remove city.");
          }
        }}
        pendingEdge={vaultNode?.id === pendingEdgeNodeId}
        requiredPhotos={2}
        onEdgeReady={(nodeId) => handleEdgeCreated(nodeId)}
      />
    </div>
  );
}
