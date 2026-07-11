import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import {
  organizationMembers,
  workspaceMembers,
  type Database,
  type OrganizationMembersSelect,
  type Transaction,
  type WorkspaceMembersSelect,
} from "@repo/db";
import { type OrganizationRole, type WorkspaceRole } from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";

@Injectable()
export class MembershipCommandsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

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
      throw new InternalServerErrorException(
        "Organization membership creation failed.",
      );
    }

    return membership;
  }

  async ensureWorkspaceMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    tx?: Transaction,
  ): Promise<WorkspaceMembersSelect> {
    const db = tx ?? this.db;

    const [existing] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    if (existing) {
      return existing;
    }

    const [membership] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId,
        role,
      })
      .returning();

    if (!membership) {
      throw new InternalServerErrorException(
        "Workspace membership creation failed.",
      );
    }

    return membership;
  }
}
