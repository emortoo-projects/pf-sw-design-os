import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { subscriptions } from "../schema";

export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;
