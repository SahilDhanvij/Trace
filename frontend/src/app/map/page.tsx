"use client";

import { api } from "@/lib/api";
import { Edge, GeoCodingResult, Node } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CitySearch from "@/components/citySearch";
import dynamic from "next/dynamic";
import HomeCityModal from "@/components/homeCityModal";

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
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Top-left: brand */}
      <div className="absolute top-5 left-6 z-10 pointer-events-none">
        <div
          className="text-xs font-mono tracking-widest"
          style={{
            color: "#c8a020",
            textShadow: "0 0 20px rgba(200,160,32,0.9)",
          }}
        >
          T R A C E
        </div>
        {homeNode && (
          <div
            className="text-xs mt-1 font-mono"
            style={{ color: "rgba(200,160,32,0.45)", letterSpacing: "3px" }}
          >
            ⌂ {homeNode.name}
          </div>
        )}
        <div
          className="text-xs mt-0.5 font-mono"
          style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "2px" }}
        >
          {edges.length} DESTINATIONS
        </div>
      </div>

      {/* Top-right: search + buttons */}
      <div className="absolute top-5 right-6 z-10 flex flex-col items-end gap-3">
        <CitySearch onSelect={handleCitySelected} />
        <div className="flex gap-2">
          <button
            onClick={() => setShowHomeModal(true)}
            className="text-xs font-mono px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{
              background: "rgba(10,10,30,0.8)",
              border: "1px solid rgba(200,160,32,0.3)",
              color: "rgba(200,160,32,0.7)",
              backdropFilter: "blur(12px)",
            }}
          >
            ⌂ HOME
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-mono px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{
              background: "rgba(10,10,30,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(12px)",
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {!showHomeModal && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-xs font-mono pointer-events-none"
          style={{ color: "rgba(255,255,255,0.15)", letterSpacing: "3px" }}
        >
          DRAG TO ROTATE · SCROLL TO ZOOM
        </div>
      )}
    </div>
  );
}
