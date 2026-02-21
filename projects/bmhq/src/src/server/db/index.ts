import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return url;
}

// Query client — uses connection pooling for app queries
const queryClient = postgres(getConnectionString());

export const db = drizzle(queryClient, { schema });

// Migration client — single connection, used only for migrations
export function createMigrationClient() {
  return postgres(getConnectionString(), { max: 1 });
}
