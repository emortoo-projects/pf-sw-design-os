import { eq, and } from "drizzle-orm";
import { db } from "./index";
import { users, organizations, organizationMembers } from "./schema";
import { hashPassword } from "../auth/password";

const DEFAULT_USER = {
  email: "admin@bmhq.local",
  name: "Emmanuel",
  password: "bmhq1234",
};

const DEFAULT_ORG = {
  name: "BMHQ",
  slug: "bmhq",
};

/** Seeds default user and organization. Idempotent — safe to call multiple times. */
export async function seed(): Promise<{ userId: string; orgId: string }> {
  // Upsert default user
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEFAULT_USER.email))
    .limit(1);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const passwordHash = await hashPassword(DEFAULT_USER.password);
    const [newUser] = await db
      .insert(users)
      .values({
        email: DEFAULT_USER.email,
        name: DEFAULT_USER.name,
        passwordHash,
      })
      .returning({ id: users.id });
    userId = newUser.id;
  }

  // Upsert default org
  const [existingOrg] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, DEFAULT_ORG.slug))
    .limit(1);

  let orgId: string;

  if (existingOrg) {
    orgId = existingOrg.id;
  } else {
    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: DEFAULT_ORG.name,
        slug: DEFAULT_ORG.slug,
        ownerId: userId,
      })
      .returning({ id: organizations.id });
    orgId = newOrg.id;
  }

  // Ensure this user is a member of this org (single upsert)
  const [existingMembership] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      )
    )
    .limit(1);

  if (!existingMembership) {
    await db
      .insert(organizationMembers)
      .values({
        organizationId: orgId,
        userId,
        role: "owner",
      })
      .onConflictDoNothing();
  }

  return { userId, orgId };
}
