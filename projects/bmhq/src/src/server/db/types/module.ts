import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { modules } from "../schema";

export type Module = InferSelectModel<typeof modules>;
export type NewModule = InferInsertModel<typeof modules>;
