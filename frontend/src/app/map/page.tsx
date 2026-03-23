"use client";

import { api } from "@/lib/api";
import { Edge, GeoCodingResult, Node } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CitySearch from "@/components/citySearch";
import dynamic from "next/dynamic";
import HomeCityModal from "@/components/homeCityModal";
import VaultPanel from "@/components/vaultPanel";

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
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error loading data.");
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
        const newEdge = await api.createEdge(homeNodeId, newNode.id);
        setNodes((prev) => [...prev, newNode]);
        setEdges((prev) => [...prev, newEdge]);
        toast.success(`📍 ${result.name} added!`);
      } catch (error: any) {
        toast.error(error.message || "Failed to add city.");
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
        />
      )}

      <div className="absolute inset-0">
        <MapView
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          connectingFromId={null}
          homeNodeId={homeNodeId} // ← add this
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-6 pt-5">
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

        {/* Right: search + actions */}
        <div className="flex items-center gap-2">
          <CitySearch onSelect={handleCitySelected} />
          <button
            onClick={() => setShowHomeModal(true)}
            className="group flex items-center justify-center transition-all duration-200"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "rgba(8, 8, 20, 0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(200,160,32,0.25)";
              e.currentTarget.style.background = "rgba(200,160,32,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(8, 8, 20, 0.75)";
            }}
            title="Change home city"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(200,160,32,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center transition-all duration-200"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "rgba(8, 8, 20, 0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,80,80,0.25)";
              e.currentTarget.style.background = "rgba(255,80,80,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(8, 8, 20, 0.75)";
            }}
            title="Logout"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
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
        onClose={() => {
          setVaultNode(null);
          setSelectedNodeId(null);
        }}
      />
    </div>
  );
}
