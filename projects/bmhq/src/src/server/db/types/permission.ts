import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { permissions } from "../schema";

export type Permission = InferSelectModel<typeof permissions>;
export type NewPermission = InferInsertModel<typeof permissions>;
