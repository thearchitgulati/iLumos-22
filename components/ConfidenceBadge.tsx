import { ConfidenceLevel } from "@/lib/types";

const STYLES: Record<ConfidenceLevel, string> = {
  strong: "bg-green-50 text-green-700 border-green-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  weak: "bg-red-50 text-red-700 border-red-200",
};

export default function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[level]}`}>
      {level}
    </span>
  );
}
