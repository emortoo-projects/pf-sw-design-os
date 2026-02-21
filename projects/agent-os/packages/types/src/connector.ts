export type ConnectorType = "crewai" | "langgraph" | "n8n" | "custom";

export interface ConnectorConfig {
  type: ConnectorType;
  baseUrl: string;
  healthCheckPath?: string;
  authHeader?: string;
  timeout?: number;
}

export interface ConnectorHealth {
  connectorType: ConnectorType;
  isHealthy: boolean;
  lastChecked: string;
  latencyMs?: number;
  error?: string;
}
