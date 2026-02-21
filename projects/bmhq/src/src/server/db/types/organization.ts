import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { organizations } from "../schema";

export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = InferInsertModel<typeof organizations>;
