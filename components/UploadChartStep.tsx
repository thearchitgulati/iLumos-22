"use client";

import { useState } from "react";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingLayout from "./OnboardingLayout";

interface Props {
  onContinue: () => void;
}

export default function UploadChartStep({ onContinue }: Props) {
  const [chartUploaded, setChartUploaded] = useState(false);

  return (
    <OnboardingLayout>
      <OnboardingHeader
        step={1}
        title="Upload your claim chart"
        subtitle="Start with the draft chart you want to refine — patent claim → accused product feature → AI reasoning."
      />

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">
          Upload a CSV, Excel, or Word file with your claim chart. For this demo, we&apos;ll load
          the sample US123456 vs. Acme Corp Thermostat chart.
        </p>
        <button
          onClick={() => setChartUploaded(true)}
          className={`mt-4 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            chartUploaded
              ? "border border-green-200 bg-green-50 text-green-700"
              : "bg-[var(--ilumos-ink)] text-white hover:bg-black"
          }`}
        >
          {chartUploaded
            ? "✓ US123456-vs-Acme-claim-chart.csv uploaded"
            : "Upload claim chart (US123456 vs. Acme)"}
        </button>
      </div>

      <button
        disabled={!chartUploaded}
        onClick={onContinue}
        className="ilumos-btn-primary mt-8 w-full rounded-full py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </OnboardingLayout>
  );
}
