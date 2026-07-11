import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  invites,
  organizations,
  users,
  workspaces,
  type Database,
  type InvitesSelect,
} from "@repo/db";
import {
  INVITE_DURATION_MS,
  type InviteAcceptInput,
  type InviteAcceptResultData,
  type InviteData,
  type InvitePreviewData,
  type OrganizationRole,
  type UserProfileData,
  type WorkspaceRole,
} from "@repo/shared";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { EmailService } from "src/email/email.service";
import { MembershipCommandsService } from "src/membership/membership-commands.service";
import { PlanLimitsService } from "src/billing/plan-limits.service";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toInviteData(row: InvitesSelect): InviteData {
  return {
    id: row.id,
    email: row.email,
    organizationId: row.organizationId,
    organizationRole: row.organizationRole,
    workspaceId: row.workspaceId,
    workspaceRole: row.workspaceRole,
    invitedByUserId: row.invitedByUserId,
    expiresAt: row.expiresAt,
    acceptedAt: row.acceptedAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
    expired: row.expiresAt < new Date(),
  };
}

@Injectable()
export class InvitesService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly emailService: EmailService,
    private readonly planLimitsService: PlanLimitsService,
    private readonly membershipCommands: MembershipCommandsService,
  ) {}

  async createOrganizationInvite(input: {
    organizationId: string;
    email: string;
    organizationRole: Exclude<OrganizationRole, "owner">;
    invitedByUserId: string;
  }): Promise<InviteData> {
    await this.planLimitsService.assertCanInviteAdmin(
      input.organizationId,
      input.organizationRole,
    );

    return this.upsertPendingInvite({
      organizationId: input.organizationId,
      email: input.email,
      organizationRole: input.organizationRole,
      workspaceId: null,
      workspaceRole: null,
      invitedByUserId: input.invitedByUserId,
    });
  }

  async createWorkspaceInvite(input: {
    organizationId: string;
    workspaceId: string;
    email: string;
    workspaceRole: Exclude<WorkspaceRole, "owner">;
    invitedByUserId: string;
  }): Promise<InviteData> {
    await this.planLimitsService.assertCanInviteAdmin(
      input.organizationId,
      "member",
    );

    return this.upsertPendingInvite({
      organizationId: input.organizationId,
      email: input.email,
      organizationRole: "member",
      workspaceId: input.workspaceId,
      workspaceRole: input.workspaceRole,
      invitedByUserId: input.invitedByUserId,
    });
  }

  async listOrganizationInvites(organizationId: string): Promise<InviteData[]> {
    const rows = await this.db
      .select()
      .from(invites)
      .where(
        and(
          eq(invites.organizationId, organizationId),
          isNull(invites.acceptedAt),
          isNull(invites.revokedAt),
          isNull(invites.workspaceId),
        ),
      );

    return rows.map(toInviteData);
  }

  async listWorkspaceInvites(workspaceId: string): Promise<InviteData[]> {
    const rows = await this.db
      .select()
      .from(invites)
      .where(
        and(
          eq(invites.workspaceId, workspaceId),
          isNull(invites.acceptedAt),
          isNull(invites.revokedAt),
        ),
      );

    return rows.map(toInviteData);
  }

  async revokeInvite(
    inviteId: string,
    scope: { organizationId?: string; workspaceId?: string },
  ): Promise<void> {
    const invite = await this.requireScopedPendingInvite(inviteId, scope);

    await this.db
      .update(invites)
      .set({ revokedAt: new Date() })
      .where(eq(invites.id, invite.id));
  }

  async resendInvite(
    inviteId: string,
    scope: { organizationId?: string; workspaceId?: string },
  ): Promise<InviteData> {
    const invite = await this.requireScopedPendingInvite(inviteId, scope);
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + INVITE_DURATION_MS);

    const [updated] = await this.db
      .update(invites)
      .set({ token, expiresAt })
      .where(eq(invites.id, invite.id))
      .returning();

    if (!updated) {
      throw new InternalServerErrorException("Invite resend failed.");
    }

    await this.emailService.sendInviteEmail(updated.email, updated.token);
    return toInviteData(updated);
  }

  async preview(tokenValue: string): Promise<InvitePreviewData> {
    const invite = await this.findByToken(tokenValue);

    if (!invite) {
      throw new NotFoundException("Invalid invite link");
    }

    const [organization] = await this.db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, invite.organizationId));

    if (!organization) {
      throw new NotFoundException("Invalid invite link");
    }

    let workspaceName: string | null = null;
    if (invite.workspaceId) {
      const [workspace] = await this.db
        .select({ name: workspaces.name })
        .from(workspaces)
        .where(eq(workspaces.id, invite.workspaceId));
      workspaceName = workspace?.name ?? null;
    }

    return {
      email: invite.email,
      organizationName: organization.name,
      organizationRole: invite.organizationRole,
      workspaceName,
      workspaceRole: invite.workspaceRole,
      expired: invite.expiresAt < new Date(),
      revoked: Boolean(invite.revokedAt),
      accepted: Boolean(invite.acceptedAt),
    };
  }

  async acceptInvite(
    input: InviteAcceptInput,
    currentUser: UserProfileData | undefined,
    signUp: (dto: {
      email: string;
      name: string;
      password: string;
      confirmPassword: string;
    }) => Promise<{ token: string }>,
  ): Promise<InviteAcceptResultData> {
    const wantsSignUp =
      input.name !== undefined ||
      input.password !== undefined ||
      input.confirmPassword !== undefined;

    if (!wantsSignUp) {
      return this.acceptForSession(input.token, currentUser);
    }

    if (currentUser) {
      throw new BadRequestException(
        "Sign out before creating an account for this invite",
      );
    }

    if (!input.name || !input.password || !input.confirmPassword) {
      throw new BadRequestException("Sign-up fields are required");
    }

    const invite = await this.requireAcceptableInvite(input.token);

    const signUpResult = await signUp({
      email: invite.email,
      name: input.name,
      password: input.password,
      confirmPassword: input.confirmPassword,
    });

    await this.applyMembershipForEmail(invite, invite.email);
    return { success: true, token: signUpResult.token };
  }

  private async acceptForSession(
    tokenValue: string,
    currentUser?: UserProfileData,
  ): Promise<InviteAcceptResultData> {
    const invite = await this.requireAcceptableInvite(tokenValue);

    if (!currentUser) {
      throw new UnauthorizedException(
        "Sign in or create an account to accept this invite",
      );
    }

    if (normalizeEmail(currentUser.email) !== invite.email) {
      throw new ForbiddenException(
        "This invite was sent to a different email address",
      );
    }

    await this.applyMembership(invite, currentUser.id);
    return { success: true };
  }

  private async applyMembershipForEmail(
    invite: InvitesSelect,
    email: string,
  ): Promise<void> {
    if (normalizeEmail(email) !== invite.email) {
      throw new ForbiddenException(
        "This invite was sent to a different email address",
      );
    }

    const [row] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, invite.email));

    if (!row) {
      throw new InternalServerErrorException("Invite accept failed.");
    }

    await this.applyMembership(invite, row.id);
  }

  private async requireAcceptableInvite(
    tokenValue: string,
  ): Promise<InvitesSelect> {
    const invite = await this.findByToken(tokenValue);

    if (!invite) {
      throw new NotFoundException("Invalid invite link");
    }

    if (invite.revokedAt) {
      throw new BadRequestException("Invite has been revoked");
    }

    if (invite.acceptedAt) {
      throw new BadRequestException("Invite has already been accepted");
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException("Invite has expired");
    }

    return invite;
  }

  private async applyMembership(
    invite: InvitesSelect,
    userId: string,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.membershipCommands.ensureOrgMember(
        invite.organizationId,
        userId,
        invite.organizationRole,
        tx,
      );

      if (invite.workspaceId && invite.workspaceRole) {
        await this.membershipCommands.ensureWorkspaceMember(
          invite.workspaceId,
          userId,
          invite.workspaceRole,
          tx,
        );
      }

      const [updated] = await tx
        .update(invites)
        .set({ acceptedAt: new Date() })
        .where(
          and(
            eq(invites.id, invite.id),
            isNull(invites.acceptedAt),
            isNull(invites.revokedAt),
          ),
        )
        .returning();

      if (!updated) {
        throw new ConflictException("Invite is no longer available");
      }
    });
  }

  private async upsertPendingInvite(input: {
    organizationId: string;
    email: string;
    organizationRole: OrganizationRole;
    workspaceId: string | null;
    workspaceRole: WorkspaceRole | null;
    invitedByUserId: string;
  }): Promise<InviteData> {
    const email = normalizeEmail(input.email);
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + INVITE_DURATION_MS);

    const [existing] = await this.db
      .select()
      .from(invites)
      .where(
        and(
          eq(invites.organizationId, input.organizationId),
          eq(invites.email, email),
          isNull(invites.acceptedAt),
          isNull(invites.revokedAt),
        ),
      );

    let row: InvitesSelect;

    if (existing) {
      const [updated] = await this.db
        .update(invites)
        .set({
          token,
          expiresAt,
          organizationRole: input.organizationRole,
          workspaceId: input.workspaceId,
          workspaceRole: input.workspaceRole,
          invitedByUserId: input.invitedByUserId,
        })
        .where(eq(invites.id, existing.id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException("Invite update failed.");
      }

      row = updated;
    } else {
      const [created] = await this.db
        .insert(invites)
        .values({
          token,
          email,
          organizationId: input.organizationId,
          organizationRole: input.organizationRole,
          workspaceId: input.workspaceId,
          workspaceRole: input.workspaceRole,
          invitedByUserId: input.invitedByUserId,
          expiresAt,
        })
        .returning();

      if (!created) {
        throw new InternalServerErrorException("Invite creation failed.");
      }

      row = created;
    }

    await this.emailService.sendInviteEmail(row.email, row.token);
    return toInviteData(row);
  }

  private async requireScopedPendingInvite(
    inviteId: string,
    scope: { organizationId?: string; workspaceId?: string },
  ): Promise<InvitesSelect> {
    const [invite] = await this.db
      .select()
      .from(invites)
      .where(eq(invites.id, inviteId));

    if (!invite) {
      throw new NotFoundException("Invite not found");
    }

    if (scope.workspaceId !== undefined) {
      if (invite.workspaceId !== scope.workspaceId) {
        throw new NotFoundException("Invite not found");
      }
    } else if (scope.organizationId !== undefined) {
      if (
        invite.organizationId !== scope.organizationId ||
        invite.workspaceId
      ) {
        throw new NotFoundException("Invite not found");
      }
    }

    if (invite.acceptedAt || invite.revokedAt) {
      throw new BadRequestException("Invite is no longer pending");
    }

    return invite;
  }

  private async findByToken(tokenValue: string): Promise<InvitesSelect | null> {
    const [invite] = await this.db
      .select()
      .from(invites)
      .where(eq(invites.token, tokenValue));

    return invite ?? null;
  }
}
