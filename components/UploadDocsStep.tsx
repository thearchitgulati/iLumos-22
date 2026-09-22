"use client";

import { useState } from "react";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingLayout from "./OnboardingLayout";
import UploadModal from "./UploadModal";
import { PRODUCT_DOC_FILES, MockFile } from "@/lib/mockFiles";

interface Props {
  onContinue: (docs: string[]) => void;
  onBack: () => void;
}

export default function UploadDocsStep({ onContinue, onBack }: Props) {
  const [files, setFiles] = useState<MockFile[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <OnboardingLayout onBack={onBack}>
      <OnboardingHeader
        step={2}
        title="Upload product documentation"
        subtitle="Optional — reference docs the AI can cite as evidence: datasheets, marketing pages, technical specs. You can also upload these later, mid-chat, if the AI can't find evidence."
      />

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
        {files.length === 0 ? (
          <p className="text-sm text-zinc-500">No documents added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <span
                key={f.id}
                className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm text-green-700"
              >
                ✓ {f.name}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => setModalOpen(true)}
          className="mt-4 rounded-full bg-[var(--ilumos-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Browse sample documents
        </button>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => onContinue([])}
          className="rounded-full px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
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
