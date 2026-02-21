import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { activities } from "../schema";

export type Activity = InferSelectModel<typeof activities>;
export type NewActivity = InferInsertModel<typeof activities>;
