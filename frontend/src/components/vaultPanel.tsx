"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Node, VaultEntry } from "@/types";
import toast from "react-hot-toast";
import {
  X,
  Camera,
  Trash2,
  ChevronLeft,
  Archive,
  Settings,
  XSquare,
} from "lucide-react";

interface VaultPanelProps {
  node: Node | null;
  onClose: () => void;
  onDeleteNode?: (nodeId: string) => void;
  pendingEdge?: boolean;
  requiredPhotos?: number;
  onEdgeReady?: (nodeId: string) => void;
}

export default function VaultPanel({
  node,
  onClose,
  onDeleteNode,
  pendingEdge,
  requiredPhotos = 2,
  onEdgeReady,
}: VaultPanelProps) {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [edgeCreated, setEdgeCreated] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const displayedNodeRef = useRef<Node | null>(null);

  const isOpen = !!node;
  if (node) displayedNodeRef.current = node;
  const displayNode = node || displayedNodeRef.current;

  useEffect(() => {
    if (!node) return;
    setEntries([]);
    setSelectedEntry(null);
    setEdgeCreated(false);
    setConfirmDelete(false);
    loadEntries();
  }, [node?.id]);

  const loadEntries = async () => {
    if (!node) return;
    setLoading(true);
    try {
      const data = await api.getVaultEntries(node.id);
      setEntries(data);
    } catch {
      toast.error("Failed to load vault.");
    } finally {
      setLoading(false);
    }
  };

  const compressAndEncode = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/jpeg", 0.78);
        URL.revokeObjectURL(url);
        resolve(base64);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  };

  const handleFiles = async (files: FileList) => {
    if (!node) return;
    const imageFiles = Array.from(files).filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024,
    );
    if (imageFiles.length === 0) {
      toast.error("No valid images selected (max 10 MB each).");
      return;
    }
    setUploading(true);
    let count = 0;
    try {
      for (const file of imageFiles) {
        const base64 = await compressAndEncode(file);
        const entry = await api.createVaultEntry(node.id, {
          photoBase64: base64,
        });
        count++;
        setEntries((prev) => {
          const updated = [entry, ...prev];
          if (
            pendingEdge &&
            !edgeCreated &&
            updated.length >= requiredPhotos &&
            onEdgeReady
          ) {
            setEdgeCreated(true);
            onEdgeReady(node.id);
          }
          return updated;
        });
      }
      toast.success(count > 1 ? `${count} photos added.` : "Photo added.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) setDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragging(false);
    if (e.dataTransfer.files.length > 0) await handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (entryId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.deleteVaultEntry(entryId);
      setEntries((prev) => prev.filter((en) => en.id !== entryId));
      if (selectedEntry?.id === entryId) setSelectedEntry(null);
      toast.success("Deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleCaptionBlur = async () => {
    if (!selectedEntry || editingCaption === (selectedEntry.caption ?? ""))
      return;
    try {
      const updated = await api.updateVaultEntry(selectedEntry.id, {
        caption: editingCaption,
      });
      setEntries((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e)),
      );
      setSelectedEntry(updated);
    } catch {
      toast.error("Failed to save caption.");
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEntry) return;
    const updated = await api.updateVaultEntry(selectedEntry.id, {
      visitedAt: e.target.value,
    });
    setEntries((prev) =>
      prev.map((en) => (en.id === updated.id ? updated : en)),
    );
    setSelectedEntry(updated);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-20 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-30 flex flex-col transition-transform duration-300 ease-out w-full md:w-[380px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          background: "rgba(12,12,20,0.98)",
          borderLeft: "1px solid rgba(255,215,0,0.08)",
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {displayNode && (
          <>
            {/* ── Header ─────────────────────────────────── */}
            <div className="shrink-0 px-5 pt-5 pb-3">
              {selectedEntry ? (
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xs font-medium tracking-[0.15em] uppercase">
                    Back
                  </span>
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-[17px] font-bold tracking-[0.2em] text-gold">
                      VAULT
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mt-1">
                    Celestial Archives: {displayNode.name}
                  </p>
                </>
              )}
            </div>

            {/* ── Detail view ────────────────────────────── */}
            {selectedEntry ? (
              <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
                {selectedEntry.photoUrl && (
                  <img
                    src={selectedEntry.photoUrl}
                    alt={selectedEntry.caption ?? ""}
                    className="w-full rounded-lg object-cover"
                    style={{ maxHeight: "45vh" }}
                  />
                )}

                <div>
                  <label className="block text-[10px] font-medium tracking-[0.2em] uppercase mb-1.5 text-gold-500">
                    Caption
                  </label>
                  <textarea
                    value={editingCaption}
                    onChange={(e) => setEditingCaption(e.target.value)}
                    onBlur={handleCaptionBlur}
                    placeholder="Write a caption..."
                    rows={2}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none bg-white/[0.04] border border-white/[0.06] text-white/80 focus:border-gold-300 transition-colors"
                  />
                  <p className="text-[10px] mt-1 italic text-white/15">
                    Auto-saves on blur
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-medium tracking-[0.2em] uppercase mb-1.5 text-white/25">
                    Date Visited
                  </label>
                  <input
                    type="date"
                    defaultValue={
                      selectedEntry.visitedAt
                        ? new Date(selectedEntry.visitedAt)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleDateChange}
                    className="rounded-lg px-3 py-2 text-sm outline-none bg-white/[0.04] border border-white/[0.06] text-white/50"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <button
                  onClick={() => handleDelete(selectedEntry.id)}
                  className="flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase text-danger-light hover:text-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete photo
                </button>
              </div>
            ) : (
              /* ── Grid / list view ──────────────────────── */
              <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Pending edge progress */}
                {pendingEdge && !edgeCreated && (
                  <div className="px-5 pb-2">
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gold-50 border border-gold-100">
                      <span className="text-[10px] tracking-[0.1em] text-gold-700">
                        Upload {requiredPhotos} photos to connect arc
                      </span>
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          color:
                            entries.length >= requiredPhotos
                              ? "#50c878"
                              : "#FFD700",
                        }}
                      >
                        {Math.min(entries.length, requiredPhotos)}/
                        {requiredPhotos}
                      </span>
                    </div>
                  </div>
                )}

                {/* ADD PHOTO button — bright yellow */}
                <div className="px-5 pb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-lg font-bold text-sm tracking-[0.15em] uppercase transition-all disabled:opacity-40 ${
                      dragging
                        ? "bg-gold/90 text-black ring-2 ring-gold/50"
                        : "bg-gold text-black hover:bg-gold-900"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    {uploading
                      ? "PROCESSING..."
                      : dragging
                        ? "DROP HERE"
                        : "ADD PHOTO"}
                  </button>
                </div>

                {/* Photos — 2-column grid */}
                <div className="flex-1 overflow-y-auto px-5 pb-3">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <span className="text-[10px] font-medium tracking-[0.3em] uppercase animate-pulse text-gold-300">
                        Loading...
                      </span>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-[11px] tracking-[0.2em] uppercase text-white/15">
                        No memories yet
                      </p>
                      <p className="text-xs mt-1 text-white/10">
                        Add your first photo from {displayNode.name}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => {
                          setSelectedEntry(entry);
                          setEditingCaption(entry.caption ?? "");
                        }}
                        className="relative rounded-lg overflow-hidden cursor-pointer group"
                      >
                        {entry.photoUrl ? (
                          <img
                            src={entry.photoUrl}
                            alt={entry.caption ?? ""}
                            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="w-full h-32 bg-white/[0.03] flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white/10" />
                          </div>
                        )}
                        {entry.caption && (
                          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white/70 text-xs truncate">
                              {entry.caption}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={(e) => handleDelete(entry.id, e)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-black/60"
                        >
                          <Trash2 className="w-3 h-3 text-danger" />
                        </button>
                      </div>
                    ))}
                    </div>
                  )}
                </div>

                {/* ── Bottom menu ─────────────────────────── */}
                <div
                  className="shrink-0 px-5 py-3 space-y-0.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-colors text-[13px]">
                    <Archive className="w-4 h-4" />
                    Archives
                  </button>
                  <button
                    onClick={() => setShowHomeModal(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-colors text-[13px]"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  {onDeleteNode && (
                    <>
                      {confirmDelete ? (
                        <div className="flex items-center justify-between px-3 py-2">
                          <span className="text-xs text-white/50">
                            Remove {displayNode.name}?
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDelete(false)}
                              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded text-white/40 hover:text-white/70 transition-colors"
                            >
                              No
                            </button>
                            <button
                              onClick={() => {
                                onDeleteNode(displayNode.id);
                                setConfirmDelete(false);
                              }}
                              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-danger-bg text-danger hover:text-[#ff5050] transition-colors"
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-danger-light hover:bg-danger-bg transition-colors text-[13px]"
                        >
                          <XSquare className="w-4 h-4" />
                          Remove City
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function setShowHomeModal(_v: boolean) {
  // wired through parent — this is a no-op placeholder for the Settings button
}
