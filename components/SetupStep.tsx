"use client";

import { useState } from "react";
import Logo from "./Logo";

interface Props {
  onContinue: (instructions: string) => void;
}

const DEFAULT_INSTRUCTIONS =
  "Be conservative when characterizing legal claims. Prefer direct documentary evidence over inference. Flag any element where evidence is marketing language rather than technical documentation.";

export default function SetupStep({ onContinue }: Props) {
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(120% 100% at 0% 0%, #f4ecff 0%, #fdfaf1 55%, #ffffff 100%)",
      }}
    >
      <div className="mx-auto max-w-2xl py-16 px-6">
        <Logo size="sm" />
        <h1 className="mt-4 text-2xl font-semibold text-[var(--ilumos-ink)]">
          Set system instructions
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          These guide how the AI should reason and flag risk throughout your chat session. You can
          change your mind later — this is just a starting posture.
        </p>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={6}
          className="mt-6 w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-800 focus:border-[var(--ilumos-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--ilumos-orange)]"
        />

        <button
          onClick={() => onContinue(instructions)}
          className="mt-6 w-full rounded-full bg-[var(--ilumos-ink)] py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors"
        >
          Start refining chart →
        </button>
      </div>
    </div>
  );
}
