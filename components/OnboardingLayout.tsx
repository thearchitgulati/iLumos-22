"use client";

import { ArrowLeftIcon } from "./icons";

interface Props {
  onBack?: () => void;
  children: React.ReactNode;
}

export default function OnboardingLayout({ onBack, children }: Props) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(120% 100% at 0% 0%, #f4ecff 0%, #fdfaf1 55%, #ffffff 100%)",
      }}
    >
      <div className="mx-auto max-w-2xl px-6 py-16">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
