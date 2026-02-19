"use client";

import { api } from "@/lib/api";
import { GeoCodingResult, Node } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MapPage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);

      const nodesData = await api.getNodes();
      setNodes(nodesData);
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
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleCitySelected = useCallback(async (result: GeoCodingResult) => {
    try {
      const newNode = await api.createNode({
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setNodes((prev) => [...prev, newNode]);
      toast.success(`📍 ${result.name} added!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to add city.");
    }
  }, []);

  const handleNodeclick = useCallback(
    async (node: Node) => {
      if (connectingFromId) {
        if (connectingFromId === node.id) {
          setConnectingFromId(null);
          return;
        }
        try {
          // const newEdge = await api.createEdge(connectingFromId, node.id);
          // setEdges((prev) => [...prev, newEdge]);
          toast("Edge drawing ready — wire backend in Step 3!", { icon: "🔗" });
        } catch (error: any) {
          toast.error(error.message || "Failed to connect nodes.");
        } finally {
          setConnectingFromId(null);
          setSelectedNodeId(node.id);
        }
      } else {
        setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
      }
    },
    [connectingFromId],
  );

  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your travel map...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trace</h1>
          <p className="text-sm text-gray-600">
            {user?.email} • {nodes.length} places
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      {}
    </div>
  );
}
