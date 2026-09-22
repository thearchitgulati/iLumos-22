"use client";

import { useState } from "react";
import { MockFile } from "@/lib/mockFiles";
import FileTypeBadge from "./FileTypeBadge";

interface Props {
  title: string;
  subtitle: string;
  files: MockFile[];
  mode: "single" | "multi";
  initialSelected?: string[];
  onClose: () => void;
  onConfirm: (files: MockFile[]) => void;
}

export default function UploadModal({
  title,
  subtitle,
  files,
  mode,
  initialSelected = [],
  onClose,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showLocalNotice, setShowLocalNotice] = useState(false);

  const toggleSelect = (file: MockFile) => {
    if (mode === "single") {
      onConfirm([file]);
      return;
    }
    setSelected((s) => (s.includes(file.id) ? s.filter((id) => id !== file.id) : [...s, file.id]));
  };

  const togglePreview = (id: string) => setPreviewId((p) => (p === id ? null : id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--ilumos-ink)]">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {files.map((file) => {
            const isSelected = selected.includes(file.id);
            const isPreviewOpen = previewId === file.id;
            return (
              <div key={file.id} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex items-center gap-3">
                  <FileTypeBadge kind={file.kind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800">{file.name}</p>
                    <p className="text-xs text-zinc-400">{file.size}</p>
                  </div>
                  <button
                    onClick={() => togglePreview(file.id)}
                    className="shrink-0 rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    {isPreviewOpen ? "Hide" : "👁 Preview"}
                  </button>
                  <button
                    onClick={() => toggleSelect(file)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-[var(--ilumos-ink)] text-white hover:bg-black"
                    }`}
                  >
                    {isSelected ? "✓ Added" : "Select"}
                  </button>
                </div>

                {isPreviewOpen && (
                  <div className="mt-3 rounded-md border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-600">
                    {file.preview.type === "text" ? (
                      <p className="italic leading-relaxed">{file.preview.excerpt}</p>
                    ) : (
                      <div className="space-y-2">
                        {file.preview.rows.map((row, i) => (
                          <div key={i} className="grid grid-cols-3 gap-2 border-b border-zinc-200 pb-2 last:border-0">
                            {row.map((cell, j) => (
                              <div key={j} className={j === 0 ? "font-medium text-zinc-700" : ""}>
                                {cell}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowLocalNotice(true)}
          className="mt-4 w-full rounded-lg border-2 border-dashed border-zinc-300 py-4 text-sm text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50"
        >
          ⤴ Upload new from your Mac
        </button>

        {showLocalNotice && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">Hold that thought — local uploads aren&apos;t wired up yet.</p>
            <p className="mt-1 text-amber-700">
              This prototype pulls from a small sample library so every reviewer sees the same
              walkthrough. Real file uploads are next on the list — for now, pick one of the
              samples above.
            </p>
            <button
              onClick={() => setShowLocalNotice(false)}
              className="mt-2 text-xs font-semibold text-amber-800 underline"
            >
              Got it
            </button>
          </div>
        )}

        {mode === "multi" && (
          <div className="mt-5 flex items-center gap-3">
            <button onClick={onClose} className="text-sm font-medium text-zinc-500 hover:text-zinc-800">
              Cancel
            </button>
            <button
              disabled={selected.length === 0}
              onClick={() => onConfirm(files.filter((f) => selected.includes(f.id)))}
              className="ilumos-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed"
            >
              {selected.length === 0
                ? "Select a file to continue"
                : `Add ${selected.length} selected file${selected.length === 1 ? "" : "s"}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
