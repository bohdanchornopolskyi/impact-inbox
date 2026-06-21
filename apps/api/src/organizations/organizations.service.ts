import {
  ConflictException,
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
  users,
} from "@repo/db";
import {
  TRIAL_DURATION_MS,
  deriveDefaultOrganizationName,
  type InviteOrganizationMemberInput,
  type OrganizationDetailData,
  type OrganizationListItemData,
  type OrganizationMemberData,
  type OrganizationMemberWithUserData,
  type OrganizationRole,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { UsersService } from "src/users/users.service";

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly usersService: UsersService,
  ) {}

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

  async listMembers(
    organizationId: string,
  ): Promise<OrganizationMemberWithUserData[]> {
    const rows = await this.db
      .select({
        id: organizationMembers.id,
        organizationId: organizationMembers.organizationId,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        name: users.name,
        email: users.email,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, organizationId));

    return rows;
  }

  async addMember(
    organizationId: string,
    dto: InviteOrganizationMemberInput,
  ): Promise<OrganizationMemberData> {
    const user = await this.usersService.findUserByEmail({ email: dto.email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const existing = await this.getMembership(organizationId, user.id);
    if (existing) {
      throw new ConflictException("User is already a member of this organization");
    }

    const [membership] = await this.db
      .insert(organizationMembers)
      .values({
        organizationId,
        userId: user.id,
        role: dto.role,
      })
      .returning();

    if (!membership) {
      throw new InternalServerErrorException("Organization membership creation failed.");
    }

    return membership;
  }

  async updateMemberRole(
    organizationId: string,
    targetUserId: string,
    role: OrganizationMemberData["role"],
  ): Promise<OrganizationMemberData> {
    const membership = await this.getMembership(organizationId, targetUserId);

    if (!membership) {
      throw new NotFoundException("Member not found");
    }

    if (membership.role === "owner") {
      throw new ForbiddenException("Cannot change the organization owner's role");
    }

    const [updatedMembership] = await this.db
      .update(organizationMembers)
      .set({ role })
      .where(eq(organizationMembers.id, membership.id))
      .returning();

    if (!updatedMembership) {
      throw new InternalServerErrorException("Member role update failed.");
    }

    return updatedMembership;
  }

  async removeMember(organizationId: string, targetUserId: string): Promise<void> {
    const membership = await this.getMembership(organizationId, targetUserId);

    if (!membership) {
      throw new NotFoundException("Member not found");
    }

    if (membership.role === "owner") {
      throw new ForbiddenException("Cannot remove the organization owner");
    }

    await this.db
      .delete(organizationMembers)
      .where(eq(organizationMembers.id, membership.id));
  }

  async getMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMembersSelect | undefined> {
    const [membership] = await this.db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      );

    return membership;
  }
}
