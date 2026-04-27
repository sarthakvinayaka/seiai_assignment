import type { Intent, IntentDetection, ScopeDecision } from "../types";
import { buildAnswer } from "./faq";

const DEFLECTION =
  "Sorry, I can only help with transfer-tracking questions today. I’m connecting you to a human support agent.";
const CLOSING = "That’s all I can help with on this line today. Goodbye.";

export function normalizeQuestion(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function hasOutOfScopeSignals(q: string): boolean {
  const outSignals = [
    "cancel",
    "refund",
    "fee",
    "fees",
    "pricing",
    "card",
    "debit",
    "credit",
    "identity",
    "verify",
    "verification",
    "login",
    "log in",
    "sign in",
    "password",
    "two factor",
    "2fa",
    "locked",
    "account access"
  ];
  return includesAny(q, outSignals);
}

function hasInScopeSignals(q: string): boolean {
  const inSignals = [
    "where is my money",
    "where's my money",
    "track",
    "tracking",
    "status",
    "arrival",
    "arrive",
    "how long",
    "timeline",
    "delayed",
    "delay",
    "late",
    "not received",
    "hasn't received",
    "has not received",
    "transfer sent",
    "money received",
    "being processed",
    "processing",
    "proof of payment",
    "receipt",
    "reference",
    "banking partner"
  ];
  return includesAny(q, inSignals);
}

export function isInScope(question: string): ScopeDecision {
  const q = normalizeQuestion(question);
  if (!q) {
    return { inScope: false, confidence: 0, reason: "Empty question" };
  }

  if (hasOutOfScopeSignals(q)) {
    return { inScope: false, confidence: 0.95, reason: "Matched explicit out-of-scope keyword" };
  }

  const inSignals = hasInScopeSignals(q);
  if (inSignals) {
    const strong = includesAny(q, ["status", "track", "tracking", "transfer sent", "money received", "being processed"]);
    return {
      inScope: true,
      confidence: strong ? 0.85 : 0.7,
      reason: strong ? "Matched strong transfer-tracking pattern" : "Matched weak transfer-tracking pattern"
    };
  }

  return { inScope: false, confidence: 0.4, reason: "No transfer-tracking signals" };
}

export function detectIntent(question: string): IntentDetection {
  const q = normalizeQuestion(question);
  if (!q) return { intent: null, confidence: 0, reason: "Empty question" };

  if (includesAny(q, ["proof of payment", "receipt"])) {
    return { intent: "proof_of_payment", confidence: 0.85, reason: "Matched proof/receipt keywords" };
  }

  if (includesAny(q, ["banking partner", "partner reference", "bank reference", "reference number"])) {
    return { intent: "banking_partner_reference", confidence: 0.8, reason: "Matched reference keywords" };
  }

  if (includesAny(q, ["transfer sent", "sent but", "sent and", "not received", "has not received", "hasn't received"])) {
    return {
      intent: "transfer_complete_but_not_arrived",
      confidence: 0.8,
      reason: "Matched sent/not-received pattern"
    };
  }

  if (includesAny(q, ["delayed", "delay", "late"])) {
    return { intent: "delayed_transfer", confidence: 0.75, reason: "Matched delay keywords" };
  }

  if (includesAny(q, ["how long", "timeline", "when will", "when does", "arrival", "arrive"])) {
    return { intent: "transfer_timeline", confidence: 0.75, reason: "Matched timeline keywords" };
  }

  if (includesAny(q, ["status", "track", "tracking", "where is my money", "where's my money", "processed", "processing", "money received"])) {
    return { intent: "check_status", confidence: 0.7, reason: "Matched general status/tracking keywords" };
  }

  return { intent: null, confidence: 0.3, reason: "No intent match" };
}

export async function routeQuestion(opts: {
  question: string;
  scopeConfidenceThreshold: number;
}) {
  const normalizedQuestion = normalizeQuestion(opts.question);
  let scope = isInScope(opts.question);
  const intent = detectIntent(opts.question);

  if (!scope.inScope || scope.confidence < opts.scopeConfidenceThreshold || !intent.intent) {
    return {
      kind: "OUT_OF_SCOPE" as const,
      deflectionMessage: DEFLECTION,
      closingMessage: CLOSING,
      debug: { normalizedQuestion, scope, intent }
    };
  }

  return {
    kind: "IN_SCOPE" as const,
    answer: buildAnswer(intent.intent),
    closingMessage: CLOSING,
    debug: { normalizedQuestion, scope, intent }
  };
}

export const MESSAGES = {
  DEFLECTION,
  CLOSING
};

