"use client";

import { useState } from "react";

interface Props {
  onContinue: (instructions: string) => void;
}

const DEFAULT_INSTRUCTIONS =
  "Be conservative when characterizing legal claims. Prefer direct documentary evidence over inference. Flag any element where evidence is marketing language rather than technical documentation.";

export default function SetupStep({ onContinue }: Props) {
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);

  return (
    <div className="mx-auto max-w-2xl py-16 px-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Set system instructions</h1>
      <p className="mt-1 text-sm text-zinc-500">
        These guide how the AI should reason and flag risk throughout your chat session. You can
        change your mind later — this is just a starting posture.
      </p>

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={6}
        className="mt-6 w-full rounded-lg border border-zinc-300 p-3 text-sm text-zinc-800 focus:border-zinc-500 focus:outline-none"
      />

      <button
        onClick={() => onContinue(instructions)}
        className="mt-6 w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Start refining chart →
      </button>
    </div>
  );
}
