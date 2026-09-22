import Logo from "./Logo";

interface Props {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
}

const STEPS = ["Claim chart", "Product docs", "Instructions"];

export default function OnboardingHeader({ step, title, subtitle }: Props) {
  return (
    <div>
      <Logo />

      <div className="mt-8 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const idx = i + 1;
          const state = idx < step ? "done" : idx === step ? "active" : "upcoming";
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                    state === "done"
                      ? "bg-[var(--ilumos-orange)] text-white"
                      : state === "active"
                      ? "border-2 border-[var(--ilumos-orange)] text-[var(--ilumos-orange)]"
                      : "border border-zinc-300 text-zinc-400"
                  }`}
                >
                  {state === "done" ? "✓" : idx}
                </div>
                <span
                  className={`text-xs font-medium ${
                    state === "upcoming" ? "text-zinc-400" : "text-zinc-700"
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < STEPS.length && <div className="h-px w-6 bg-zinc-200" />}
            </div>
          );
        })}
      </div>

      <h1 className="mt-6 text-2xl font-semibold text-[var(--ilumos-ink)]">{title}</h1>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
    </div>
  );
}
