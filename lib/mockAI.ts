import { ChatMessage, ClaimRow } from "./types";

interface AIContext {
  message: string;
  activeRow: ClaimRow;
  hasSupplementalDoc: boolean; // has the analyst uploaded extra evidence for this row's topic
  systemInstructions: string;
}

export interface AIResult {
  text: string;
  proposal?: ChatMessage["proposal"];
  needsEvidence?: { rowId: string };
}

const includesAny = (text: string, words: string[]) =>
  words.some((w) => text.toLowerCase().includes(w));

/**
 * Deterministic mock "AI" so the demo is reproducible. Real product would call
 * an LLM with the row context + uploaded docs + system instructions as context.
 */
export function getAIResponse({
  message,
  activeRow,
  hasSupplementalDoc,
  systemInstructions,
}: AIContext): AIResult {
  const msg = message.toLowerCase();

  // Edge case 1: analyst flags AI evidence as wrong / provides a correction
  if (
    includesAny(msg, ["that's wrong", "thats wrong", "incorrect", "wrong quote", "use this instead", "not accurate"])
  ) {
    const quoteMatch = message.match(/["“](.+?)["”]/);
    if (quoteMatch) {
      return {
        text: `Got it — thanks for the correction. I'll replace the evidence for "${activeRow.element}" with the quote you provided and adjust the reasoning to match.`,
        proposal: {
          rowId: activeRow.id,
          field: "feature",
          newValue: quoteMatch[1],
          newConfidence: "strong",
        },
      };
    }
    return {
      text: "Understood — that evidence looks wrong. Can you paste the correct quote or source text so I update the chart accurately?",
    };
  }

  // Edge case 3: AI can't find evidence (weak-confidence row, no supplemental doc yet)
  if (
    activeRow.confidence === "weak" &&
    !hasSupplementalDoc &&
    includesAny(msg, ["strengthen", "stronger", "more technical", "weak", "improve", "better evidence"])
  ) {
    return {
      text: `I checked the uploaded product docs but couldn't find explicit technical detail on the ML algorithm's implementation — marketing language alone is a thin basis for this claim element. Could you upload a technical spec/whitepaper, or paste a URL, so I can pull stronger evidence? ${
        systemInstructions.toLowerCase().includes("conservative")
          ? "(Flagging this now since your instructions ask me to be conservative on legal claims.)"
          : ""
      }`,
      needsEvidence: { rowId: activeRow.id },
    };
  }

  // Strengthen evidence / fix weak reasoning (after supplemental doc provided, or for non-weak rows)
  if (includesAny(msg, ["strengthen", "stronger", "more technical", "improve", "better evidence", "vague", "weak"])) {
    if (activeRow.confidence === "weak" && hasSupplementalDoc) {
      return {
        text: `Using the technical documentation you uploaded, here's a stronger version:\n\nEvidence: "Auto-Schedule module uses a gradient-based preference model that logs thermostat adjustments and retrains weekly to predict optimal setpoints."\nReasoning: The datasheet confirms an iterative learning process (retraining on logged adjustments), which directly supports "algorithm that learns... over time" rather than inferring it from marketing copy alone.\n\nAccept, reject, or tell me what to adjust.`,
        proposal: {
          rowId: activeRow.id,
          field: "reasoning",
          newValue:
            'The datasheet confirms an iterative learning process (retraining on logged adjustments), which directly supports "algorithm that learns... over time" rather than inferring it from marketing copy alone.',
          newConfidence: "strong",
        },
      };
    }
    return {
      text: `Here's a tightened version of the reasoning for "${activeRow.element}":\n\n"${activeRow.feature}" — this is direct documentary evidence (not inference), and the language maps one-to-one onto the claim element, leaving little room for a non-infringement argument.\n\nAccept, reject, or tell me what to adjust.`,
      proposal: {
        rowId: activeRow.id,
        field: "reasoning",
        newValue: `"${activeRow.feature}" is direct documentary evidence that maps one-to-one onto the claim element, leaving little room for a non-infringement argument.`,
        newConfidence: "strong",
      },
    };
  }

  // Legal language clarification
  if (includesAny(msg, ["claim construction", "legal language", "rewrite", "legal argument"])) {
    return {
      text: `Reworded to anticipate a claim construction dispute:\n\n"Even under a narrower construction requiring active computation (not mere data logging), the retraining behavior described satisfies the 'learns... over time' limitation because it involves iterative adjustment of stored preference data."\n\nAccept, reject, or tell me what to adjust.`,
      proposal: {
        rowId: activeRow.id,
        field: "reasoning",
        newValue:
          "Even under a narrower construction requiring active computation (not mere data logging), the retraining behavior described satisfies the 'learns... over time' limitation because it involves iterative adjustment of stored preference data.",
      },
    };
  }

  // Missing feature
  if (includesAny(msg, ["missed", "missing", "also has", "add a", "add another"])) {
    return {
      text: "Good catch — I don't have that in the current chart. Add it as a new row: tell me the claim element it maps to and I'll draft the evidence + reasoning for your review (I won't add it automatically).",
    };
  }

  return {
    text: `Tell me what you'd like to do with "${activeRow.element}" — for example: "strengthen the evidence", "the reasoning is too vague", or "rewrite for claim construction".`,
  };
}
