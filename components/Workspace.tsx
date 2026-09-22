"use client";

import { useState } from "react";
import { ChatMessage, ClaimRow } from "@/lib/types";
import { getAIResponse } from "@/lib/mockAI";
import ConfidenceBadge from "./ConfidenceBadge";
import Logo from "./Logo";
import UploadModal from "./UploadModal";
import { SUPPLEMENTAL_DOC_FILE } from "@/lib/mockFiles";

interface Props {
  initialChart: ClaimRow[];
  uploadedDocs: string[];
  systemInstructions: string;
}

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

export default function Workspace({ initialChart, uploadedDocs: initialDocs, systemInstructions }: Props) {
  const [chart, setChart] = useState<ClaimRow[]>(initialChart);
  const [activeRowId, setActiveRowId] = useState<string>(initialChart[0]?.id ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId("sys"),
      role: "system",
      text: `System instructions set. Select a claim element on the left, then ask me to refine it. Example: "Strengthen the evidence for this element."`,
    },
  ]);
  const [input, setInput] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(initialDocs);
  const [supplementalByRow, setSupplementalByRow] = useState<Record<string, boolean>>({});
  const [waitingForUploadRowId, setWaitingForUploadRowId] = useState<string | null>(null);
  const [modifyingMessageId, setModifyingMessageId] = useState<string | null>(null);
  const [modifyDraft, setModifyDraft] = useState("");
  const [lastExported, setLastExported] = useState<string | null>(null);
  const [evidenceModalRowId, setEvidenceModalRowId] = useState<string | null>(null);

  const activeRow = chart.find((r) => r.id === activeRowId) ?? chart[0];

  function pushMessage(m: ChatMessage) {
    setMessages((prev) => [...prev, m]);
  }

  function applyProposal(msg: ChatMessage, resolvedAs: "accepted" | "modified", overrideValue?: string) {
    if (!msg.proposal) return;
    const { rowId, field, newConfidence } = msg.proposal;
    const finalValue = overrideValue ?? msg.proposal.newValue;

    setChart((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const snapshot = { element: row.element, feature: row.feature, reasoning: row.reasoning, confidence: row.confidence };
        return {
          ...row,
          [field]: finalValue,
          confidence: newConfidence ?? row.confidence,
          history: [...row.history, snapshot],
        };
      })
    );

    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, resolved: resolvedAs } : m)));
    pushMessage({
      id: nextId("sys"),
      role: "system",
      text: `${field === "feature" ? "Evidence" : "Reasoning"} updated for "${chart.find((r) => r.id === rowId)?.element}". You can undo this from the chart panel if needed.`,
    });
    setModifyingMessageId(null);
    setModifyDraft("");
  }

  function rejectProposal(msg: ChatMessage) {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, resolved: "rejected" } : m)));
    pushMessage({
      id: nextId("sys"),
      role: "system",
      text: "Suggestion rejected. Tell me what's wrong with it so I can try again.",
    });
  }

  function undoLast(rowId: string) {
    const row = chart.find((r) => r.id === rowId);
    if (!row || row.history.length === 0) {
      pushMessage({ id: nextId("sys"), role: "system", text: "Nothing to undo for this element." });
      return;
    }
    const previous = row.history[row.history.length - 1];
    setChart((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, ...previous, history: r.history.slice(0, -1) }
          : r
      )
    );
    pushMessage({
      id: nextId("sys"),
      role: "system",
      text: `Undone — reverted "${row.element}" to its previous version.`,
    });
  }

  function handleUploadForEvidence(rowId: string, docName: string) {
    setUploadedDocs((d) => [...d, docName]);
    setSupplementalByRow((s) => ({ ...s, [rowId]: true }));
    setWaitingForUploadRowId(null);
    pushMessage({ id: nextId("user"), role: "user", text: `Uploaded ${docName}` });
    const row = chart.find((r) => r.id === rowId)!;
    const res = getAIResponse({
      message: "strengthen the evidence",
      activeRow: row,
      hasSupplementalDoc: true,
      systemInstructions,
    });
    pushMessage({ id: nextId("ai"), role: "ai", text: res.text, proposal: res.proposal, needsEvidence: res.needsEvidence });
  }

  function handleSend() {
    if (!input.trim() || !activeRow) return;
    const text = input.trim();
    setInput("");
    pushMessage({ id: nextId("user"), role: "user", text });

    if (text.toLowerCase().includes("undo")) {
      undoLast(activeRow.id);
      return;
    }

    const res = getAIResponse({
      message: text,
      activeRow,
      hasSupplementalDoc: !!supplementalByRow[activeRow.id],
      systemInstructions,
    });

    pushMessage({
      id: nextId("ai"),
      role: "ai",
      text: res.text,
      proposal: res.proposal,
      needsEvidence: res.needsEvidence,
    });

    if (res.needsEvidence) setWaitingForUploadRowId(res.needsEvidence.rowId);
  }

  function handleExport() {
    setLastExported(new Date().toLocaleTimeString());
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="border-l border-zinc-200 pl-4">
            <h1 className="text-sm font-semibold text-[var(--ilumos-ink)]">
              US123456 vs. Acme Corp Thermostat
            </h1>
            <p className="text-xs text-zinc-500">
              {uploadedDocs.length} reference doc(s) loaded · system instructions active
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="rounded-full bg-[var(--ilumos-ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
        >
          Export to Word
        </button>
      </header>
      {lastExported && (
        <div className="bg-green-50 px-6 py-2 text-xs text-green-700 border-b border-green-200">
          ✓ Exported refined claim chart at {lastExported} (mock export — in production this generates a .docx)
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Claim chart panel */}
        <div className="w-3/5 overflow-y-auto border-r border-zinc-200 p-4">
          <table className="w-full border-collapse overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm">
            <thead>
              <tr className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="p-3">Patent Claim Element</th>
                <th className="p-3">Accused Product Feature (Evidence)</th>
                <th className="p-3">AI Reasoning</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {chart.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setActiveRowId(row.id)}
                  className={`cursor-pointer border-t border-zinc-100 align-top transition-colors ${
                    row.id === activeRowId ? "bg-orange-50" : "hover:bg-zinc-50"
                  }`}
                >
                  <td className="p-3 font-medium text-zinc-900">{row.element}</td>
                  <td className="p-3 text-zinc-700">{row.feature}</td>
                  <td className="p-3 text-zinc-700">
                    <div className="mb-1">
                      <ConfidenceBadge level={row.confidence} />
                    </div>
                    {row.reasoning}
                  </td>
                  <td className="p-3">
                    {row.history.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          undoLast(row.id);
                        }}
                        className="text-xs text-zinc-400 hover:text-zinc-700 underline"
                      >
                        Undo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-zinc-400">
            Click a row to select it, then refine it via chat →
          </p>
        </div>

        {/* Chat panel */}
        <div className="flex w-2/5 flex-col bg-white">
          <div className="border-b border-zinc-200 px-4 py-2 text-xs text-zinc-500">
            Refining: <span className="font-medium text-zinc-800">{activeRow?.element}</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[var(--ilumos-ink)] text-white"
                      : m.role === "system"
                      ? "bg-zinc-100 text-zinc-500 text-xs italic"
                      : "bg-orange-50 text-zinc-800 border border-orange-100"
                  }`}
                >
                  {m.text}

                  {m.needsEvidence &&
                    !m.resolved &&
                    waitingForUploadRowId === m.needsEvidence.rowId &&
                    messages[messages.length - 1]?.id === m.id && (
                    <button
                      onClick={() => setEvidenceModalRowId(m.needsEvidence!.rowId)}
                      className="mt-2 block rounded-md border border-[var(--ilumos-orange)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ilumos-orange)] hover:bg-orange-50"
                    >
                      📎 Browse technical documentation
                    </button>
                  )}

                  {m.proposal && !m.resolved && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => applyProposal(m, "accepted")}
                        className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectProposal(m)}
                        className="rounded-md bg-white border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setModifyingMessageId(m.id);
                          setModifyDraft(m.proposal!.newValue);
                        }}
                        className="rounded-md bg-white border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        Modify
                      </button>
                    </div>
                  )}

                  {modifyingMessageId === m.id && (
                    <div className="mt-2">
                      <textarea
                        value={modifyDraft}
                        onChange={(e) => setModifyDraft(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-zinc-300 p-2 text-xs text-zinc-800"
                      />
                      <div className="mt-1 flex gap-2">
                        <button
                          onClick={() => applyProposal(m, "modified", modifyDraft)}
                          className="rounded-md bg-[var(--ilumos-ink)] px-3 py-1 text-xs font-medium text-white hover:bg-black"
                        >
                          Confirm edit
                        </button>
                        <button
                          onClick={() => setModifyingMessageId(null)}
                          className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {m.resolved && (
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-400">{m.resolved}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-200 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder='e.g. "Strengthen the evidence for this element"'
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="rounded-full bg-[var(--ilumos-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "Strengthen the evidence for this element",
                'That evidence is wrong, use this instead: "Acme datasheet confirms the module retrains weekly on logged usage data"',
                "undo",
              ].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 hover:border-zinc-400"
                  >
                    {s}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {evidenceModalRowId && (
        <UploadModal
          title="Select technical documentation"
          subtitle="Choose a file the AI can cite as stronger evidence, or preview it first."
          files={[SUPPLEMENTAL_DOC_FILE]}
          mode="single"
          onClose={() => setEvidenceModalRowId(null)}
          onConfirm={(files) => {
            handleUploadForEvidence(evidenceModalRowId, files[0].name);
            setEvidenceModalRowId(null);
          }}
        />
      )}
    </div>
  );
}
