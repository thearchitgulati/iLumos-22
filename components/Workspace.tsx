"use client";

import { useState } from "react";
import { ChatMessage, ClaimRow } from "@/lib/types";
import { getAIResponse } from "@/lib/mockAI";
import ConfidenceBadge from "./ConfidenceBadge";
import Logo from "./Logo";
import UploadModal from "./UploadModal";
import ConfirmDialog from "./ConfirmDialog";
import { UploadCloudIcon, PaperclipIcon, WrenchIcon, PencilIcon, UndoIcon, TargetIcon, XIcon } from "./icons";
import { MockFile, PRODUCT_DOC_FILES, SUPPLEMENTAL_DOC_FILE } from "@/lib/mockFiles";

const DOC_LIBRARY: MockFile[] = [...PRODUCT_DOC_FILES, SUPPLEMENTAL_DOC_FILE];

const STARTER_PROMPTS = [
  "Strengthen the evidence for this element",
  "The reasoning here feels vague — make it more specific",
  "Rewrite this to address a claim construction challenge",
];

const QUICK_ACTIONS = [
  { icon: WrenchIcon, label: "Strengthen evidence", fill: "Strengthen the evidence for this element" },
  {
    icon: PencilIcon,
    label: "Correct wrong evidence",
    fill: 'That evidence is wrong, use this instead: "Acme datasheet confirms the module retrains weekly on logged usage data"',
  },
  { icon: UndoIcon, label: "Undo last change", fill: "undo" },
];

interface Props {
  initialChart: ClaimRow[];
  uploadedDocs: string[];
  systemInstructions: string;
  onNewSession: () => void;
}

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

export default function Workspace({ initialChart, uploadedDocs: initialDocs, systemInstructions, onNewSession }: Props) {
  const [chart, setChart] = useState<ClaimRow[]>(initialChart);
  const [activeRowId, setActiveRowId] = useState<string | null>(initialChart[0]?.id ?? null);
  // Each claim element keeps its own isolated conversation — switching rows must never
  // leave a previous element's messages on screen under a new element's context.
  const [messagesByRow, setMessagesByRow] = useState<Record<string, ChatMessage[]>>({});
  const [docsNotice, setDocsNotice] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(initialDocs);
  const [supplementalByRow, setSupplementalByRow] = useState<Record<string, boolean>>({});
  const [waitingForUploadRowId, setWaitingForUploadRowId] = useState<string | null>(null);
  const [modifyingMessageId, setModifyingMessageId] = useState<string | null>(null);
  const [modifyDraft, setModifyDraft] = useState("");
  const [lastExported, setLastExported] = useState<string | null>(null);
  const [evidenceModalRowId, setEvidenceModalRowId] = useState<string | null>(null);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [newSessionConfirmOpen, setNewSessionConfirmOpen] = useState(false);

  const activeRow = chart.find((r) => r.id === activeRowId) ?? null;
  const messages = activeRowId ? messagesByRow[activeRowId] ?? [] : [];

  function pushMessage(rowId: string, m: ChatMessage) {
    setMessagesByRow((prev) => ({ ...prev, [rowId]: [...(prev[rowId] ?? []), m] }));
  }

  function setMessageResolved(rowId: string, messageId: string, resolvedAs: ChatMessage["resolved"]) {
    setMessagesByRow((prev) => ({
      ...prev,
      [rowId]: (prev[rowId] ?? []).map((m) => (m.id === messageId ? { ...m, resolved: resolvedAs } : m)),
    }));
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

    setMessageResolved(rowId, msg.id, resolvedAs);
    pushMessage(rowId, {
      id: nextId("sys"),
      role: "system",
      text: `${field === "feature" ? "Evidence" : "Reasoning"} updated for "${chart.find((r) => r.id === rowId)?.element}". You can undo this from the chart panel if needed.`,
    });
    setModifyingMessageId(null);
    setModifyDraft("");
  }

  function rejectProposal(msg: ChatMessage) {
    if (!msg.proposal) return;
    const { rowId } = msg.proposal;
    setMessageResolved(rowId, msg.id, "rejected");
    pushMessage(rowId, {
      id: nextId("sys"),
      role: "system",
      text: "Suggestion rejected. Tell me what's wrong with it so I can try again.",
    });
  }

  function undoLast(rowId: string) {
    const row = chart.find((r) => r.id === rowId);
    if (!row || row.history.length === 0) {
      pushMessage(rowId, { id: nextId("sys"), role: "system", text: "Nothing to undo for this element." });
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
    pushMessage(rowId, {
      id: nextId("sys"),
      role: "system",
      text: `Undone — reverted "${row.element}" to its previous version.`,
    });
  }

  function handleUploadForEvidence(rowId: string, docName: string) {
    setUploadedDocs((d) => [...d, docName]);
    setSupplementalByRow((s) => ({ ...s, [rowId]: true }));
    setWaitingForUploadRowId(null);
    pushMessage(rowId, { id: nextId("user"), role: "user", text: `Uploaded ${docName}` });
    const row = chart.find((r) => r.id === rowId)!;
    const res = getAIResponse({
      message: "strengthen the evidence",
      activeRow: row,
      hasSupplementalDoc: true,
      systemInstructions,
    });
    pushMessage(rowId, { id: nextId("ai"), role: "ai", text: res.text, proposal: res.proposal, needsEvidence: res.needsEvidence });
  }

  function handleSend() {
    if (!input.trim() || !activeRow) return;
    const rowId = activeRow.id;
    const text = input.trim();
    setInput("");
    pushMessage(rowId, { id: nextId("user"), role: "user", text });

    if (text.toLowerCase().includes("undo")) {
      undoLast(rowId);
      return;
    }

    const res = getAIResponse({
      message: text,
      activeRow,
      hasSupplementalDoc: !!supplementalByRow[rowId],
      systemInstructions,
    });

    pushMessage(rowId, {
      id: nextId("ai"),
      role: "ai",
      text: res.text,
      proposal: res.proposal,
      needsEvidence: res.needsEvidence,
    });

    if (res.needsEvidence) setWaitingForUploadRowId(res.needsEvidence.rowId);
  }

  function handleExport() {
    const escapeHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const rowsHtml = chart
      .map(
        (row) => `
        <tr>
          <td style="border:1px solid #ccc;padding:8px;vertical-align:top;font-weight:bold;">${escapeHtml(row.element)}</td>
          <td style="border:1px solid #ccc;padding:8px;vertical-align:top;">${escapeHtml(row.feature)}</td>
          <td style="border:1px solid #ccc;padding:8px;vertical-align:top;">
            <strong>[${row.confidence.toUpperCase()}]</strong><br/>${escapeHtml(row.reasoning)}
          </td>
        </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Refined Claim Chart</title></head>
<body style="font-family:Calibri, Arial, sans-serif;">
  <h2>US123456 vs. Acme Corp Thermostat — Refined Claim Chart</h2>
  <p style="color:#666;font-size:11px;">Exported from iLumos on ${new Date().toLocaleString()}</p>
  <table style="border-collapse:collapse;width:100%;font-size:13px;">
    <thead>
      <tr>
        <th style="border:1px solid #ccc;padding:8px;background:#f3f3f3;text-align:left;">Patent Claim Element</th>
        <th style="border:1px solid #ccc;padding:8px;background:#f3f3f3;text-align:left;">Accused Product Feature (Evidence)</th>
        <th style="border:1px solid #ccc;padding:8px;background:#f3f3f3;text-align:left;">AI Reasoning</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "US123456-vs-Acme-claim-chart-refined.doc";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setLastExported(new Date().toLocaleTimeString());
  }

  function handleDocsConfirm(selected: MockFile[]) {
    setUploadedDocs(selected.map((f) => f.name));
    setDocsModalOpen(false);
    setDocsNotice(
      selected.length > 0
        ? `Reference documents updated: ${selected.map((f) => f.name).join(", ")}.`
        : "All reference documents removed."
    );
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
              <button
                onClick={() => setDocsModalOpen(true)}
                className="underline decoration-dotted underline-offset-2 hover:text-zinc-800"
              >
                {uploadedDocs.length} reference doc(s) loaded
              </button>
              {" · system instructions active"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewSessionConfirmOpen(true)}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
          >
            New session
          </button>
          <button
            onClick={handleExport}
            className="rounded-full bg-[var(--ilumos-ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
          >
            Export to Word
          </button>
        </div>
      </header>
      {lastExported && (
        <div className="bg-green-50 px-6 py-2 text-xs text-green-700 border-b border-green-200">
          ✓ Downloaded refined claim chart at {lastExported} — open the .doc file in Word to review.
        </div>
      )}
      {docsNotice && (
        <div className="flex items-center justify-between bg-blue-50 px-6 py-2 text-xs text-blue-700 border-b border-blue-200">
          <span>ℹ {docsNotice}</span>
          <button onClick={() => setDocsNotice(null)} className="text-blue-400 hover:text-blue-700">
            <XIcon className="h-3 w-3" />
          </button>
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
              {chart.map((row) => {
                const isSelected = row.id === activeRowId;
                return (
                <tr
                  key={row.id}
                  onClick={() => setActiveRowId(row.id)}
                  className={`cursor-pointer border-t border-zinc-100 align-top transition-colors ${
                    isSelected ? "bg-orange-50/70" : "hover:bg-zinc-50"
                  }`}
                >
                  <td
                    className={`border-l-4 p-3 font-medium ${
                      isSelected
                        ? "border-[var(--ilumos-orange)] text-[var(--ilumos-ink)]"
                        : "border-transparent text-zinc-900"
                    }`}
                  >
                    {row.element}
                    {isSelected && (
                      <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--ilumos-orange)] px-2 py-0.5 align-middle text-[10px] font-semibold text-white">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        Refining
                      </span>
                    )}
                  </td>
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
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-zinc-400">
            Click a row to select it, then refine it via chat →
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-lg border-2 border-dashed border-zinc-300 bg-white/60 px-4 py-3 transition-colors hover:border-zinc-400">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[var(--ilumos-orange)]">
              <UploadCloudIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-700">Need stronger evidence?</p>
              <p className="truncate text-xs text-zinc-400">
                Upload docs anytime — the AI can cite them in chat.
              </p>
            </div>
            <button
              onClick={() => setDocsModalOpen(true)}
              className="shrink-0 rounded-full bg-[var(--ilumos-ink)] px-3.5 py-2 text-xs font-medium text-white hover:bg-black"
            >
              Upload documents
            </button>
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex w-2/5 flex-col bg-white">
          <div className="border-b border-zinc-200 px-4 py-2 text-xs text-zinc-500">
            {activeRow ? (
              <>
                Refining: <span className="font-medium text-zinc-800">{activeRow.element}</span>
              </>
            ) : (
              <span className="italic text-zinc-400">No element selected</span>
            )}
          </div>
          <div className="flex flex-1 flex-col space-y-3 overflow-y-auto p-4">
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

            {!activeRow && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-xl">
                  💬
                </div>
                <p className="max-w-[15rem] text-sm text-zinc-400">
                  Select a claim element on the left to start refining it.
                </p>
              </div>
            )}

            {activeRow && messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-xl">
                  💬
                </div>
                <p className="max-w-[15rem] text-sm text-zinc-400">Try one of these to get started:</p>
                <div className="flex w-full max-w-sm flex-col gap-2">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setInput(p)}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-600 transition-colors hover:border-[var(--ilumos-orange)] hover:bg-orange-50"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-zinc-200 p-3">
            {activeRow ? (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <TargetIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-green-800">
                  Refining: {activeRow.element}
                </span>
                <button
                  onClick={() => setActiveRowId(null)}
                  title="Deselect this element"
                  aria-label="Deselect this element"
                  className="shrink-0 rounded-full p-0.5 text-green-600 hover:bg-green-100 hover:text-green-800"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5">
                <TargetIcon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="truncate text-xs text-zinc-500">
                  No element selected — pick a row on the left to refine it
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setDocsModalOpen(true)}
                title="Upload reference documents"
                aria-label="Upload reference documents"
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md border border-zinc-300 text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
              >
                <PaperclipIcon className="h-4 w-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={!activeRow}
                placeholder={
                  activeRow ? 'e.g. "Strengthen the evidence for this element"' : "Select a claim element first…"
                }
                className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-50"
              />
              <button
                onClick={handleSend}
                disabled={!activeRow}
                className="rounded-full bg-[var(--ilumos-ink)] px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            {messages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => setInput(qa.fill)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:border-[var(--ilumos-orange)] hover:bg-orange-50 hover:text-orange-700"
                  >
                    <qa.icon className="h-3.5 w-3.5" />
                    {qa.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {evidenceModalRowId && (
        <UploadModal
          title="Select technical documentation"
          subtitle="Choose a file the AI can cite as stronger evidence, or preview it first."
          acceptedFormats="PDF, DOCX, HTML, TXT"
          files={[SUPPLEMENTAL_DOC_FILE]}
          mode="single"
          onClose={() => setEvidenceModalRowId(null)}
          onConfirm={(files) => {
            handleUploadForEvidence(evidenceModalRowId, files[0].name);
            setEvidenceModalRowId(null);
          }}
        />
      )}

      {docsModalOpen && (
        <UploadModal
          title="Manage reference documents"
          subtitle="Add or remove documents the AI can cite as evidence across any claim element."
          acceptedFormats="PDF, DOCX, HTML, TXT"
          files={DOC_LIBRARY}
          mode="multi"
          initialSelected={DOC_LIBRARY.filter((f) => uploadedDocs.includes(f.name)).map((f) => f.id)}
          allowEmptyConfirm
          confirmVerb="Save"
          onClose={() => setDocsModalOpen(false)}
          onConfirm={handleDocsConfirm}
        />
      )}

      {newSessionConfirmOpen && (
        <ConfirmDialog
          title="Start a new session?"
          message="This clears the current chart, chat history, and uploaded documents, and takes you back to step 1. This can't be undone."
          confirmLabel="Start new session"
          onCancel={() => setNewSessionConfirmOpen(false)}
          onConfirm={() => {
            setNewSessionConfirmOpen(false);
            onNewSession();
          }}
        />
      )}
    </div>
  );
}
