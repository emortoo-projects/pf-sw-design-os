export type WorkflowStatus = "draft" | "active" | "paused" | "archived";

export interface WorkflowNode {
  id: string;
  type: "agent" | "condition" | "parallel" | "merge" | "input" | "output";
  agentId?: string;
  config?: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
