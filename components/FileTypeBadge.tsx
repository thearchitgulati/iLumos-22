import { FileKind } from "@/lib/mockFiles";

const STYLES: Record<FileKind, string> = {
  csv: "bg-green-50 text-green-700 border-green-200",
  pdf: "bg-red-50 text-red-700 border-red-200",
  html: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function FileTypeBadge({ kind }: { kind: FileKind }) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold uppercase ${STYLES[kind]}`}
    >
      {kind}
    </span>
  );
}
