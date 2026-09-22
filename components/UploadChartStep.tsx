"use client";

import { useState } from "react";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingLayout from "./OnboardingLayout";
import UploadModal from "./UploadModal";
import FileTypeBadge from "./FileTypeBadge";
import { UploadCloudIcon } from "./icons";
import { CLAIM_CHART_FILES, MockFile } from "@/lib/mockFiles";

interface Props {
  onContinue: () => void;
}

export default function UploadChartStep({ onContinue }: Props) {
  const [file, setFile] = useState<MockFile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <OnboardingLayout>
      <OnboardingHeader
        step={1}
        title="Upload your claim chart"
        subtitle="Start with the draft chart you want to refine — patent claim → accused product feature → AI reasoning."
      />

      {file ? (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <FileTypeBadge kind={file.kind} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-green-800">{file.name}</p>
            <p className="text-xs text-green-600">{file.size} · ready to refine</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="shrink-0 rounded-full border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border-2 border-dashed border-zinc-300 bg-white/70 p-10 text-center transition-colors hover:border-zinc-400">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[var(--ilumos-orange)]">
            <UploadCloudIcon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-zinc-700">
            Upload a CSV, Excel, or Word file with your claim chart
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-400">
            For this demo, choose from a small sample library — you can preview a file before
            selecting it.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 rounded-full bg-[var(--ilumos-ink)] px-5 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            Browse sample claim charts
          </button>
        </div>
      )}

      <button
        disabled={!file}
        onClick={onContinue}
        className="ilumos-btn-primary mt-8 w-full rounded-full py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed"
      >
        Continue →
      </button>

      {modalOpen && (
        <UploadModal
          title="Select a claim chart"
          subtitle="Pick a sample file, or preview it first to see what's inside."
          files={CLAIM_CHART_FILES}
          mode="single"
          onClose={() => setModalOpen(false)}
          onConfirm={(files) => {
            setFile(files[0]);
            setModalOpen(false);
          }}
        />
      )}
    </OnboardingLayout>
  );
}
