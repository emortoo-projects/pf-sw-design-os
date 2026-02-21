import { router } from "./trpc";
import { credentialsRouter } from "./routers/credentials";
import { activitiesRouter } from "./routers/activities";
import { jobExecutionsRouter } from "./routers/job-executions";
import { costsRouter } from "./routers/costs";
import { alertRulesRouter } from "./routers/alert-rules";
import { dashboardRouter } from "./routers/dashboard";
import { usersRouter } from "./routers/users";
import { agentsRouter } from "./routers/agents";
import { projectsRouter } from "./routers/projects";
import { jobsRouter } from "./routers/jobs";
import { budgetsRouter } from "./routers/budgets";
import { alertsRouter } from "./routers/alerts";
import { webhooksRouter } from "./routers/webhooks";

export const appRouter = router({
  credentials: credentialsRouter,
  activities: activitiesRouter,
  jobExecutions: jobExecutionsRouter,
  costs: costsRouter,
  alertRules: alertRulesRouter,
  dashboard: dashboardRouter,
  users: usersRouter,
  agents: agentsRouter,
  projects: projectsRouter,
  jobs: jobsRouter,
  budgets: budgetsRouter,
  alerts: alertsRouter,
  webhooks: webhooksRouter,
});

export type AppRouter = typeof appRouter;
