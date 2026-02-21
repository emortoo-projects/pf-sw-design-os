import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { refreshTokens } from "../schema";

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
export type NewRefreshToken = InferInsertModel<typeof refreshTokens>;
