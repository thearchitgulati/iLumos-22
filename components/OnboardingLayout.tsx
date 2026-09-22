"use client";

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
            className="mb-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
          >
            ← Back
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
