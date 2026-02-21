import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { organizationMembers } from "../schema";

export type OrganizationMember = InferSelectModel<typeof organizationMembers>;
export type NewOrganizationMember = InferInsertModel<typeof organizationMembers>;
