import { router, publicProcedure } from "./init";
import { authRouter } from "./routers/auth";
import { usersRouter } from "./routers/users";
import { organizationsRouter } from "./routers/organizations";
import { organizationMembersRouter } from "./routers/organization-members";
import { modulesRouter } from "./routers/modules";
import { moduleDependenciesRouter } from "./routers/module-dependencies";
import { installedModulesRouter } from "./routers/installed-modules";
import { aiProvidersRouter } from "./routers/ai-providers";
import { aiConfigurationsRouter } from "./routers/ai-configurations";
import { aiUsageRouter } from "./routers/ai-usage";
import { dashboardRouter } from "./routers/dashboard";
import { dashboardWidgetsRouter } from "./routers/dashboard-widgets";
import { activitiesRouter } from "./routers/activities";
import { notificationsRouter } from "./routers/notifications";
import { mcpToolsRouter } from "./routers/mcp-tools";
import { mcpResourcesRouter } from "./routers/mcp-resources";
import { permissionsRouter } from "./routers/permissions";
import { billingPlansRouter } from "./routers/billing-plans";
import { subscriptionsRouter } from "./routers/subscriptions";
import { apiKeysRouter } from "./routers/api-keys";
import { auditLogsRouter } from "./routers/audit-logs";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: "ok" };
  }),
  auth: authRouter,
  users: usersRouter,
  organizations: organizationsRouter,
  organizationMembers: organizationMembersRouter,
  modules: modulesRouter,
  moduleDependencies: moduleDependenciesRouter,
  installedModules: installedModulesRouter,
  aiProviders: aiProvidersRouter,
  aiConfigurations: aiConfigurationsRouter,
  aiUsage: aiUsageRouter,
  dashboard: dashboardRouter,
  dashboardWidgets: dashboardWidgetsRouter,
  activities: activitiesRouter,
  notifications: notificationsRouter,
  mcpTools: mcpToolsRouter,
  mcpResources: mcpResourcesRouter,
  permissions: permissionsRouter,
  billingPlans: billingPlansRouter,
  subscriptions: subscriptionsRouter,
  apiKeys: apiKeysRouter,
  auditLogs: auditLogsRouter,
});

export type AppRouter = typeof appRouter;
