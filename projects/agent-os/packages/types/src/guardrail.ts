export type GuardrailType = "cost_cap" | "rate_limit" | "token_limit" | "timeout";
export type GuardrailScope = "global" | "workspace" | "agent" | "workflow";
export type GuardrailAction = "block" | "warn" | "log";

export interface GuardrailConfig {
  id: string;
  name: string;
  type: GuardrailType;
  scope: GuardrailScope;
  scopeId?: string;
  enabled: boolean;
  action: GuardrailAction;
  limit?: number;
  period?: string;
}
