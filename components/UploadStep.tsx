"use client";

import { useState } from "react";

interface Props {
  onContinue: (docs: string[]) => void;
}

export default function UploadStep({ onContinue }: Props) {
  const [chartUploaded, setChartUploaded] = useState(false);
  const [docs, setDocs] = useState<string[]>([]);

  const addMockDoc = (name: string) => {
    setDocs((d) => (d.includes(name) ? d : [...d, name]));
  };

  return (
    <div className="mx-auto max-w-2xl py-16 px-6">
      <h1 className="text-2xl font-semibold text-zinc-900">iLumos</h1>
      <p className="mt-1 text-sm text-zinc-500">
        AI-assisted claim chart refinement — patent infringement analysis
      </p>

      <div className="mt-10 space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="font-medium text-zinc-900">1. Upload claim chart</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Upload the draft claim chart (patent claim → accused product feature → AI reasoning).
          </p>
          <button
            onClick={() => setChartUploaded(true)}
            className={`mt-3 rounded-md px-4 py-2 text-sm font-medium ${
              chartUploaded
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-zinc-900 text-white hover:bg-zinc-700"
            }`}
          >
            {chartUploaded ? "✓ US123456-vs-Acme-claim-chart.csv uploaded" : "Upload claim chart (US123456 vs. Acme)"}
          </button>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="font-medium text-zinc-900">2. Upload product documentation (optional)</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Reference docs the AI can cite as evidence — datasheets, marketing pages, technical specs.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["acme-marketing-page.html", "acme-thermostat-datasheet.pdf"].map((name) => (
              <button
                key={name}
                onClick={() => addMockDoc(name)}
                className={`rounded-md px-3 py-1.5 text-sm border ${
                  docs.includes(name)
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400"
                }`}
              >
                {docs.includes(name) ? `✓ ${name}` : `Upload ${name}`}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!chartUploaded}
          onClick={() => onContinue(docs)}
          className="w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-zinc-700"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
