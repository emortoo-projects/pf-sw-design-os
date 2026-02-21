import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export function getDbUrl(): string {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Missing or invalid DATABASE_URL environment variable: ${parsed.error.message}`
    );
  }
  return parsed.data.DATABASE_URL;
}
