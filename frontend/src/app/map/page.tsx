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
import type { MapViewHandle } from "@/components/mapView";

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
      api.clearAccessToken();
      router.push("/login");
    } catch {
      toast.error("Logout failed.");
    }
  };

  const handleHomeDone = useCallback((homeNode: Node) => {
    setNodes((prev) =>
      prev.find((n) => n.id === homeNode.id) ? prev : [...prev, homeNode],
    );
    setHomeNodeId(homeNode.id);
    setShowHomeModal(false);
    toast.success(`🏠 ${homeNode.name} set as home!`);
  }, []);

  const handleCitySelected = useCallback(
    async (result: GeoCodingResult) => {
      if (!homeNodeId) {
        toast("Set your home city first!", { icon: "🏠" });
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
        toast.success(`📍 ${result.name} added — upload 2 photos to connect!`);
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div
          className="text-sm tracking-widest font-mono animate-pulse"
          style={{ color: "rgba(0,220,255,0.5)" }}
        >
          LOADING TRACE...
        </div>
      </div>
    );
  }

  const homeNode = nodes.find((n) => n.id === homeNodeId);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {showHomeModal && (
        <HomeCityModal
          currentHomeNode={homeNode?.name}
          onDone={handleHomeDone}
          onClose={homeNodeId ? () => setShowHomeModal(false) : undefined}
        />
      )}

      <div className="absolute inset-0">
        <MapView
          ref={mapRef}
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          connectingFromId={null}
          homeNodeId={homeNodeId} // ← add this
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-4">
        {/* Left: brand */}
        <div
          className="text-[11px] font-medium tracking-[0.35em] pointer-events-none"
          style={{
            color: "rgba(200,160,32,0.8)",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          TRACE
        </div>

        {/* Right: toolbar */}
        <div
          className="flex items-center gap-0.5 px-2 py-1.5"
          style={{
            borderRadius: 14,
            background: "rgba(12, 12, 28, 0.8)",
            border: "1px solid rgba(200, 160, 32, 0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 6px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset",
          }}
        >
          <CitySearch onSelect={handleCitySelected} />

          <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.06)" }} />

          <button
            onClick={() => setShowHomeModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 transition-all duration-200"
            style={{
              borderRadius: 12,
              color: "rgba(200,160,32,0.7)",
              fontSize: 11,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "0.06em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(200,160,32,0.08)";
              e.currentTarget.style.color = "rgba(200,160,32,0.95)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(200,160,32,0.7)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            Home
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 transition-all duration-200"
            style={{
              borderRadius: 12,
              color: "rgba(255,255,255,0.35)",
              fontSize: 11,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "0.06em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {!showHomeModal && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[10px] tracking-[0.2em]"
          style={{
            color: "rgba(255,255,255,0.1)",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          DRAG TO ROTATE · SCROLL TO ZOOM
        </div>
      )}
      <VaultPanel
        node={vaultNode}
        onClose={async () => {
          if (vaultNode && vaultNode.id === pendingEdgeNodeId) {
            try {
              await api.deleteNode(vaultNode.id);
              setNodes((prev) => prev.filter((n) => n.id !== vaultNode.id));
              toast("City removed — no photos were added.", { icon: "🗑️" });
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
            setEdges((prev) => prev.filter((e) => e.fromId !== nodeId && e.toId !== nodeId));
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
