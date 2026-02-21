import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { moduleDependencies } from "../schema";

export type ModuleDependency = InferSelectModel<typeof moduleDependencies>;
export type NewModuleDependency = InferInsertModel<typeof moduleDependencies>;
