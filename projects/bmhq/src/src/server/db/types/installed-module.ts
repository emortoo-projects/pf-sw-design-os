import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { installedModules } from "../schema";

export type InstalledModule = InferSelectModel<typeof installedModules>;
export type NewInstalledModule = InferInsertModel<typeof installedModules>;
