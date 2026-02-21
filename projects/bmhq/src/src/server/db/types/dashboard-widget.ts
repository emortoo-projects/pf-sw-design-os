import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { dashboardWidgets } from "../schema";

export type DashboardWidget = InferSelectModel<typeof dashboardWidgets>;
export type NewDashboardWidget = InferInsertModel<typeof dashboardWidgets>;
