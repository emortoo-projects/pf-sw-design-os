import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { billingPlans } from "../schema";

export type BillingPlan = InferSelectModel<typeof billingPlans>;
export type NewBillingPlan = InferInsertModel<typeof billingPlans>;
