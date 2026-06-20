import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  type Database,
  type OrganizationsSelect,
  type OrganizationMembersSelect,
  type Transaction,
  organizationMembers,
  organizations,
} from "@repo/db";
import {
  TRIAL_DURATION_MS,
  deriveDefaultOrganizationName,
  type OrganizationDetailData,
  type OrganizationListItemData,
  type OrganizationRole,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";

@Injectable()
export class OrganizationsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async createDefaultOrganizationForUser(
    userId: string,
    userName: string,
    tx?: Transaction,
  ): Promise<OrganizationsSelect> {
    const db = tx ?? this.db;

    const [createdOrganization] = await db
      .insert(organizations)
      .values({
        name: deriveDefaultOrganizationName(userName),
      })
      .returning();

    if (!createdOrganization) {
      throw new InternalServerErrorException("Organization creation failed.");
    }

    const [membership] = await db
      .insert(organizationMembers)
      .values({
        organizationId: createdOrganization.id,
        userId,
        role: "owner",
      })
      .returning();

    if (!membership) {
      throw new InternalServerErrorException("Organization membership creation failed.");
    }

    return createdOrganization;
  }

  async listOrganizationsForUser(
    userId: string,
  ): Promise<OrganizationListItemData[]> {
    const rows = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        planTier: organizations.planTier,
        trialEndsAt: organizations.trialEndsAt,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(eq(organizationMembers.userId, userId));

    return rows;
  }

  async getOrganizationForUser(
    userId: string,
    organizationId: string,
    role?: OrganizationRole,
  ): Promise<OrganizationDetailData> {
    const [row] = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        planTier: organizations.planTier,
        trialEndsAt: organizations.trialEndsAt,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizations.id, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      );

    if (!row) {
      throw new NotFoundException("Organization not found");
    }

    if (role && row.role !== role) {
      throw new ForbiddenException("Insufficient organization permissions");
    }

    return row;
  }

  async ensureOrgMember(
    organizationId: string,
    userId: string,
    role: OrganizationRole = "member",
    tx?: Transaction,
  ): Promise<OrganizationMembersSelect> {
    const db = tx ?? this.db;

    const [existing] = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      );

    if (existing) {
      return existing;
    }

    const [membership] = await db
      .insert(organizationMembers)
      .values({
        organizationId,
        userId,
        role,
      })
      .returning();

    if (!membership) {
      throw new InternalServerErrorException("Organization membership creation failed.");
    }

    return membership;
  }

  async assertCanManageWorkspaces(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const [membership] = await this.db
      .select({ role: organizationMembers.role })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      );

    if (
      !membership ||
      (membership.role !== "owner" && membership.role !== "org_admin")
    ) {
      throw new ForbiddenException(
        "Insufficient organization permissions to manage workspaces",
      );
    }
  }

  async startTrialIfEligible(
    userId: string,
    emailVerifiedAt: Date | null,
  ): Promise<void> {
    if (!emailVerifiedAt) {
      return;
    }

    const ownerMemberships = await this.db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.role, "owner"),
        ),
      );

    if (ownerMemberships.length === 0) {
      return;
    }

    const organizationIds = ownerMemberships.map(
      (membership) => membership.organizationId,
    );

    await this.db
      .update(organizations)
      .set({
        trialEndsAt: new Date(Date.now() + TRIAL_DURATION_MS),
      })
      .where(
        and(
          inArray(organizations.id, organizationIds),
          isNull(organizations.trialEndsAt),
        ),
      );
  }
}
