"use client";

import { useState } from "react";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingLayout from "./OnboardingLayout";

interface Props {
  onContinue: (instructions: string) => void;
  onBack: () => void;
}

const DEFAULT_INSTRUCTIONS =
  "Be conservative when characterizing legal claims. Prefer direct documentary evidence over inference. Flag any element where evidence is marketing language rather than technical documentation.";

export default function SetupStep({ onContinue, onBack }: Props) {
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);

  return (
    <OnboardingLayout onBack={onBack}>
      <OnboardingHeader
        step={3}
        title="Set system instructions"
        subtitle="These guide how the AI should reason and flag risk throughout your chat session. You can change your mind later — this is just a starting posture."
      />

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={6}
        className="mt-8 w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-800 focus:border-[var(--ilumos-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--ilumos-orange)]"
      />

      <button
        onClick={() => onContinue(instructions)}
        className="ilumos-btn-primary mt-8 w-full rounded-full py-2.5 text-sm font-semibold text-white"
      >
        Start refining chart →
      </button>
    </OnboardingLayout>
  );
}
