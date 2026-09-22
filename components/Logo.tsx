export default function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const wordmark = size === "sm" ? "text-lg" : "text-2xl";
  const sub = size === "sm" ? "text-[9px]" : "text-[11px]";
  return (
    <div className="leading-none select-none">
      <div className={`${wordmark} font-extrabold tracking-tight text-[var(--ilumos-ink)]`}>
        <span className="text-[var(--ilumos-orange)]">i</span>Lumos
      </div>
      <div className={`${sub} font-semibold uppercase tracking-wide text-zinc-400`}>
        by Lumenci
      </div>
    </div>
  );
}
