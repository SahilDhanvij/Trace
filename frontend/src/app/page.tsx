"use client";

import MapView from "@/components/mapView";

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <MapView
        nodes={[]}
        edges={[]}
        selectedNodeId={null}
        connectingFromId={null}
        homeNodeId={null}
        onNodeClick={(node) => console.log(node)}
      />
    </div>
  );
}
