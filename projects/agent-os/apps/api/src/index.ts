import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agent-os-api" });
});

// Auth routes
import authRouter from "./routes/auth";
app.use("/auth", authRouter);

// Users routes
import usersRouter from "./routes/users";
app.use("/users", usersRouter);

// Workspaces routes
import workspacesRouter from "./routes/workspaces";
app.use("/workspaces", workspacesRouter);

// Workspace Members routes
import workspaceMembersRouter from "./routes/workspace-members";
app.use("/workspaces/:workspaceId/members", workspaceMembersRouter);

// Agents routes
import agentsRouter from "./routes/agents";
app.use("/workspaces/:workspaceId/agents", agentsRouter);

// Connectors routes
import connectorsRouter from "./routes/connectors";
app.use("/workspaces/:workspaceId/connectors", connectorsRouter);

// Workflows routes
import workflowsRouter from "./routes/workflows";
app.use("/workspaces/:workspaceId/workflows", workflowsRouter);

// Executions routes (includes workflow execute + execution management)
import executionsRouter from "./routes/executions";
app.use("/workspaces/:workspaceId", executionsRouter);

// Schedules routes
import schedulesRouter from "./routes/schedules";
app.use("/workspaces/:workspaceId/schedules", schedulesRouter);

// Webhooks routes
import webhooksRouter, { webhookTriggerRouter } from "./routes/webhooks";
app.use("/workspaces/:workspaceId/webhooks", webhooksRouter);
app.use("/webhooks", webhookTriggerRouter);

// Credentials routes
import credentialsRouter from "./routes/credentials";
app.use("/workspaces/:workspaceId/credentials", credentialsRouter);

// Guardrails routes
import guardrailsRouter from "./routes/guardrails";
app.use("/workspaces/:workspaceId/guardrails", guardrailsRouter);

// Router Rules routes
import routerRulesRouter from "./routes/router-rules";
app.use("/workspaces/:workspaceId/router-rules", routerRulesRouter);

// A/B Tests routes
import abTestsRouter from "./routes/ab-tests";
app.use("/workspaces/:workspaceId/ab-tests", abTestsRouter);

// Observability routes (LLM Calls, Cost Summary, Audit Logs)
import { llmCallsRouter, costSummaryRouter, auditLogsRouter } from "./routes/observability";
app.use("/workspaces/:workspaceId/llm-calls", llmCallsRouter);
app.use("/workspaces/:workspaceId/cost-summary", costSummaryRouter);
app.use("/workspaces/:workspaceId/audit-logs", auditLogsRouter);

// Notifications routes
import notificationsRouter from "./routes/notifications";
app.use("/workspaces/:workspaceId/notifications", notificationsRouter);

// Templates routes
import templatesRouter, { publicTemplatesRouter } from "./routes/templates";
app.use("/workspaces/:workspaceId/templates", templatesRouter);
app.use("/templates", publicTemplatesRouter);

app.listen(PORT, () => {
  console.log(`Agent OS API running on port ${PORT}`);
});

export default app;
