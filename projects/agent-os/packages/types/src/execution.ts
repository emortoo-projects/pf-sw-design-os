export type ExecutionStatus = "pending" | "running" | "success" | "failed" | "cancelled" | "timeout";
export type TriggerType = "manual" | "cron" | "webhook" | "api";

export interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: Record<string, unknown>;
}

export interface ExecutionResult {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  trigger: TriggerType;
  duration?: number;
  totalCost?: number;
  logs: ExecutionLog[];
}
