export type ScopeDecision = {
  inScope: boolean;
  confidence: number;
  reason: string;
};

export type Intent =
  | "check_status"
  | "transfer_timeline"
  | "transfer_complete_but_not_arrived"
  | "delayed_transfer"
  | "proof_of_payment"
  | "banking_partner_reference";

export type IntentDetection = {
  intent: Intent | null;
  confidence: number;
  reason: string;
};

export type AgentRouteResult =
  | {
      kind: "OUT_OF_SCOPE";
      deflectionMessage: string;
      closingMessage: string;
      debug: {
        normalizedQuestion: string;
        scope: ScopeDecision;
        intent: IntentDetection;
      };
    }
  | {
      kind: "IN_SCOPE";
      answer: string;
      closingMessage: string;
      debug: {
        normalizedQuestion: string;
        scope: ScopeDecision;
        intent: IntentDetection;
      };
    };

