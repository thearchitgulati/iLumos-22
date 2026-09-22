"use client";

import { useState } from "react";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingLayout from "./OnboardingLayout";
import UploadModal from "./UploadModal";
import FileTypeBadge from "./FileTypeBadge";
import { UploadCloudIcon, XIcon } from "./icons";
import { PRODUCT_DOC_FILES, MockFile } from "@/lib/mockFiles";

interface Props {
  initialFiles?: MockFile[];
  onFilesChange?: (files: MockFile[]) => void;
  onContinue: (docs: string[]) => void;
  onBack: () => void;
}

export default function UploadDocsStep({ initialFiles = [], onFilesChange, onContinue, onBack }: Props) {
  const [files, setFilesState] = useState<MockFile[]>(initialFiles);
  const [modalOpen, setModalOpen] = useState(false);

  const setFiles = (f: MockFile[]) => {
    setFilesState(f);
    onFilesChange?.(f);
  };

  const removeFile = (id: string) => setFiles(files.filter((x) => x.id !== id));

  return (
    <OnboardingLayout onBack={onBack}>
      <OnboardingHeader
        step={2}
        title="Upload product documentation"
        subtitle="Optional — reference docs the AI can cite as evidence: datasheets, marketing pages, technical specs. You can also upload these later, mid-chat, if the AI can't find evidence."
      />

      {files.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed border-zinc-300 bg-white/70 p-10 text-center transition-colors hover:border-zinc-400">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[var(--ilumos-orange)]">
            <UploadCloudIcon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-700">
            Add datasheets, specs, or marketing pages
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-400">
            Optional — the AI cites these as evidence. Skip this step and add files later if
            you're not sure yet.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 rounded-full bg-[var(--ilumos-ink)] px-5 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            Browse sample documents
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-2">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <FileTypeBadge kind={f.kind} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-green-800">{f.name}</p>
                <p className="text-xs text-green-600">{f.size}</p>
              </div>
              <button
                onClick={() => removeFile(f.id)}
                aria-label={`Remove ${f.name}`}
                className="shrink-0 rounded-full p-1.5 text-green-600 hover:bg-green-100 hover:text-green-800"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full rounded-lg border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50"
          >
            + Add more files
          </button>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => onContinue([])}
          className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
        >
          Skip for now
        </button>
        <button
          onClick={() => onContinue(files.map((f) => f.name))}
          className="ilumos-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold text-white"
        >
          Continue →
        </button>
      </div>

      {modalOpen && (
        <UploadModal
          title="Select product documentation"
          subtitle="Choose one or more files, or preview each before adding it."
          acceptedFormats="PDF, DOCX, HTML, TXT"
          files={PRODUCT_DOC_FILES}
          mode="multi"
          initialSelected={files.map((f) => f.id)}
          onClose={() => setModalOpen(false)}
          onConfirm={(selected) => {
            setFiles(selected);
            setModalOpen(false);
          }}
        />
      )}
    </OnboardingLayout>
  );
}
