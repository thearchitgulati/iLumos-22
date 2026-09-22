"use client";

import { useState } from "react";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingLayout from "./OnboardingLayout";
import UploadModal from "./UploadModal";
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

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">
          Upload a CSV, Excel, or Word file with your claim chart. For this demo, choose from a
          small sample library — preview a file before selecting it.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className={`mt-4 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            file
              ? "border border-green-200 bg-green-50 text-green-700"
              : "bg-[var(--ilumos-ink)] text-white hover:bg-black"
          }`}
        >
          {file ? `✓ ${file.name} uploaded` : "Browse sample claim charts"}
        </button>
      </div>

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
