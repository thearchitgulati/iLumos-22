"use client";

import { useState } from "react";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingLayout from "./OnboardingLayout";

interface Props {
  onContinue: (docs: string[]) => void;
  onBack: () => void;
}

const AVAILABLE_DOCS = ["acme-marketing-page.html", "acme-thermostat-datasheet.pdf"];

export default function UploadDocsStep({ onContinue, onBack }: Props) {
  const [docs, setDocs] = useState<string[]>([]);

  const toggleDoc = (name: string) => {
    setDocs((d) => (d.includes(name) ? d.filter((x) => x !== name) : [...d, name]));
  };

  return (
    <OnboardingLayout onBack={onBack}>
      <OnboardingHeader
        step={2}
        title="Upload product documentation"
        subtitle="Optional — reference docs the AI can cite as evidence: datasheets, marketing pages, technical specs. You can also upload these later, mid-chat, if the AI can't find evidence."
      />

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_DOCS.map((name) => (
            <button
              key={name}
              onClick={() => toggleDoc(name)}
              className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                docs.includes(name)
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
            >
              {docs.includes(name) ? `✓ ${name}` : `Upload ${name}`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={() => onContinue([])}
          className="rounded-full px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
        >
          Skip for now
        </button>
        <button
          onClick={() => onContinue(docs)}
          className="ilumos-btn-primary flex-1 rounded-full py-2.5 text-sm font-semibold text-white"
        >
          Continue →
        </button>
      </div>
    </OnboardingLayout>
  );
}
