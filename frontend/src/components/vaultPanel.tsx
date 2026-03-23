"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Node, VaultEntry } from "@/types";
import toast from "react-hot-toast";
import { X, Upload, Trash2, Calendar, ChevronLeft } from "lucide-react";

interface VaultPanelProps {
  node: Node | null;
  onClose: () => void;
}

export default function VaultPanel({ node, onClose }: VaultPanelProps) {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<VaultEntry | null>(null);
  const [editingCaption, setEditingCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!node) return;
    setEntries([]);
    setSelectedEntry(null);
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

  // Compress + strip EXIF by redrawing on canvas
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
        // JPEG re-encode strips EXIF automatically
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !node) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }

    setUploading(true);
    try {
      const base64 = await compressAndEncode(file);
      const entry = await api.createVaultEntry(node.id, {
        photoBase64: base64,
      });
      setEntries((prev) => [entry, ...prev]);
      toast.success("Photo added.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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

  const handleSaveCaption = async () => {
    if (!selectedEntry) return;
    try {
      const updated = await api.updateVaultEntry(selectedEntry.id, {
        caption: editingCaption,
      });
      setEntries((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e)),
      );
      setSelectedEntry(updated);
      toast.success("Saved.");
    } catch {
      toast.error("Failed to save.");
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

  if (!node) return null;

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div className="absolute inset-0 z-20" onClick={onClose} />

      {/* Slide-in panel */}
      <div
        className="absolute right-0 top-0 h-full z-30 flex flex-col"
        style={{
          width: "400px",
          background: "rgba(4,4,12,0.96)",
          borderLeft: "1px solid rgba(212,175,55,0.12)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          {selectedEntry ? (
            <button
              onClick={() => setSelectedEntry(null)}
              className="flex items-center gap-1.5 transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
              }
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase">
                Back
              </span>
            </button>
          ) : (
            <div>
              <div
                className="text-[9px] font-medium tracking-[0.35em] uppercase"
                style={{ color: "rgba(212,175,55,0.7)" }}
              >
                Vault
              </div>
              <div
                className="text-sm font-serif italic mt-0.5"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {node.name}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: "rgba(255,255,255,0.25)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.25)")
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detail view */}
        {selectedEntry ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {selectedEntry.photoUrl && (
              <img
                src={selectedEntry.photoUrl}
                alt={selectedEntry.caption ?? ""}
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: "280px" }}
              />
            )}

            {/* Caption */}
            <div>
              <label
                className="block text-[9px] font-medium tracking-[0.25em] uppercase mb-2"
                style={{ color: "rgba(212,175,55,0.5)" }}
              >
                Caption
              </label>
              <textarea
                value={editingCaption}
                onChange={(e) => setEditingCaption(e.target.value)}
                placeholder="What do you remember about this place..."
                rows={3}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "inherit",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
                }
              />
              <button
                onClick={handleSaveCaption}
                className="mt-2 text-[10px] font-medium tracking-[0.2em] uppercase px-4 py-2 rounded-lg transition-all"
                style={{
                  background: "rgba(212,175,55,0.08)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  color: "rgba(212,175,55,0.8)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.14)";
                  e.currentTarget.style.color = "#D4AF37";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.08)";
                  e.currentTarget.style.color = "rgba(212,175,55,0.8)";
                }}
              >
                Save Caption
              </button>
            </div>

            {/* Date */}
            <div>
              <label
                className="block text-[9px] font-medium tracking-[0.25em] uppercase mb-2"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
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
                className="rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.5)",
                  colorScheme: "dark",
                }}
              />
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(selectedEntry.id)}
              className="flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase transition-colors mt-2"
              style={{ color: "rgba(255,80,80,0.4)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,80,80,0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,80,80,0.4)")
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete photo
            </button>
          </div>
        ) : (
          /* Grid view */
          <div className="flex-1 overflow-y-auto">
            {/* Upload */}
            <div className="p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all disabled:opacity-40"
                style={{
                  background: "rgba(212,175,55,0.05)",
                  border: "1px dashed rgba(212,175,55,0.25)",
                  color: "rgba(212,175,55,0.7)",
                }}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.currentTarget.style.background = "rgba(212,175,55,0.09)";
                    e.currentTarget.style.borderColor = "rgba(212,175,55,0.45)";
                    e.currentTarget.style.color = "#D4AF37";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.05)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)";
                  e.currentTarget.style.color = "rgba(212,175,55,0.7)";
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase">
                  {uploading ? "Processing..." : "Add Photo"}
                </span>
              </button>
            </div>

            {/* Photos */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span
                  className="text-[10px] font-medium tracking-[0.3em] uppercase animate-pulse"
                  style={{ color: "rgba(212,175,55,0.3)" }}
                >
                  Loading...
                </span>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div
                  className="text-3xl mb-3"
                  style={{ color: "rgba(212,175,55,0.15)" }}
                >
                  ◉
                </div>
                <p
                  className="text-[10px] font-medium tracking-[0.25em] uppercase"
                  style={{ color: "rgba(255,255,255,0.15)" }}
                >
                  No memories yet
                </p>
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "rgba(255,255,255,0.08)" }}
                >
                  Add your first photo from {node.name}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-4 pb-6">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setEditingCaption(entry.caption ?? "");
                    }}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    {entry.photoUrl ? (
                      <img
                        src={entry.photoUrl}
                        alt={entry.caption ?? ""}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar
                          className="w-5 h-5"
                          style={{ color: "rgba(255,255,255,0.08)" }}
                        />
                      </div>
                    )}

                    {/* Caption overlay */}
                    {entry.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white/60 text-xs truncate leading-tight">
                          {entry.caption}
                        </p>
                      </div>
                    )}

                    {/* Delete on hover */}
                    <button
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.65)" }}
                    >
                      <Trash2
                        className="w-3 h-3"
                        style={{ color: "rgba(255,80,80,0.8)" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
