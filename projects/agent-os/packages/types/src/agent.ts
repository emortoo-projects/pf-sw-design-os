export type FrameworkType = "crewai" | "langgraph" | "n8n" | "custom" | "native";
export type AgentStatus = "active" | "paused" | "archived";

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  framework: FrameworkType;
  endpointUrl?: string;
  capabilities: AgentCapability[];
  status: AgentStatus;
}
