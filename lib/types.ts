export type ConfidenceLevel = "strong" | "moderate" | "weak";

export interface ClaimRow {
  id: string;
  element: string;
  feature: string;
  reasoning: string;
  confidence: ConfidenceLevel;
  history: Omit<ClaimRow, "history" | "id">[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  text: string;
  // when the AI proposes a change awaiting accept/reject/modify
  proposal?: {
    rowId: string;
    field: "feature" | "reasoning";
    newValue: string;
    newConfidence?: ConfidenceLevel;
  };
  // when the AI is asking the analyst to supply missing evidence
  needsEvidence?: { rowId: string };
  resolved?: "accepted" | "rejected" | "modified" | "undone";
}

export type AppStage = "upload-chart" | "upload-docs" | "setup" | "workspace";
