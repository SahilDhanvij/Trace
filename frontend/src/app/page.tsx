"use client";
import Image from "next/image";
import LoginPage from "./login/page";
import MapView from "@/components/mapView";
import MapPage from "./map/page";

export default function Home() {
  return (
    // <LoginPage />
<MapView
  nodes={[]}
  edges={[]}
  selectedNodeId={null}
  connectingFromId={null}
  onNodeClick={(node) => console.log(node)}
/>  )
}
