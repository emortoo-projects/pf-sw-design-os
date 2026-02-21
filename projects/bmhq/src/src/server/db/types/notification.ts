import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { notifications } from "../schema";

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
