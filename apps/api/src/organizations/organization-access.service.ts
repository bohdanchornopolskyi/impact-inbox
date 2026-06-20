import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
  type Database,
  type OrganizationMembersSelect,
  type OrganizationsSelect,
  organizationMembers,
  organizations,
} from "@repo/db";
import { type AuthenticatedOrganizationContext } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";

@Injectable()
export class OrganizationAccessService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async resolve(
    organizationId: string,
    userId: string,
  ): Promise<AuthenticatedOrganizationContext> {
    const [organization] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    const [membership] = await this.db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      );

    if (!membership) {
      throw new ForbiddenException("You are not a member of this organization");
    }

    return this.toAuthenticatedContext(organization, membership);
  }

  private toAuthenticatedContext(
    organization: OrganizationsSelect,
    membership: OrganizationMembersSelect,
  ): AuthenticatedOrganizationContext {
    return {
      organization: {
        id: organization.id,
        name: organization.name,
        planTier: organization.planTier,
        trialEndsAt: organization.trialEndsAt,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
      role: membership.role,
    };
  }
}
