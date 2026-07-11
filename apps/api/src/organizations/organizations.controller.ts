import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  type AuthenticatedOrganizationContext,
  type InviteData,
  type OrganizationDetailData,
  type OrganizationListItemData,
  type OrganizationMemberData,
  type OrganizationMemberInviteResultData,
  type OrganizationMemberWithUserData,
  type SuccessData,
  type UserProfileData,
} from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { CurrentOrganization } from "src/organizations/decorators/current-organization.decorator";
import { OrganizationRoles } from "src/organizations/decorators/organization-roles.decorator";
import { InviteOrganizationMemberDto } from "src/organizations/dto/invite-organization-member.dto";
import { UpdateOrganizationMemberRoleDto } from "src/organizations/dto/update-organization-member-role.dto";
import { OrganizationGuard } from "src/organizations/guards/organization.guard";
import { OrganizationsService } from "src/organizations/organizations.service";
import { InvitesService } from "src/invites/invites.service";

@Controller("organizations")
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly invitesService: InvitesService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: UserProfileData,
  ): Promise<OrganizationListItemData[]> {
    return this.organizationsService.listOrganizationsForUser(user.id);
  }

  @Get(":orgId")
  @UseGuards(OrganizationGuard)
  getById(
    @CurrentOrganization() context: AuthenticatedOrganizationContext,
  ): OrganizationDetailData {
    return {
      ...context.organization,
      role: context.role,
    };
  }

  @Get(":orgId/members")
  @UseGuards(OrganizationGuard)
  listMembers(
    @Param("orgId") orgId: string,
  ): Promise<OrganizationMemberWithUserData[]> {
    return this.organizationsService.listMembers(orgId);
  }

  @Post(":orgId/members")
  @UseGuards(OrganizationGuard)
  @OrganizationRoles("owner", "org_admin")
  addMember(
    @Param("orgId") orgId: string,
    @CurrentUser() user: UserProfileData,
    @Body() dto: InviteOrganizationMemberDto,
  ): Promise<OrganizationMemberInviteResultData> {
    return this.organizationsService.addMember(orgId, dto, user.id);
  }

  @Patch(":orgId/members/:userId")
  @UseGuards(OrganizationGuard)
  @OrganizationRoles("owner", "org_admin")
  updateMemberRole(
    @Param("orgId") orgId: string,
    @Param("userId") userId: string,
    @Body() dto: UpdateOrganizationMemberRoleDto,
  ): Promise<OrganizationMemberData> {
    return this.organizationsService.updateMemberRole(orgId, userId, dto.role);
  }

  @Delete(":orgId/members/:userId")
  @UseGuards(OrganizationGuard)
  @OrganizationRoles("owner", "org_admin")
  async removeMember(
    @Param("orgId") orgId: string,
    @Param("userId") userId: string,
  ): Promise<SuccessData> {
    await this.organizationsService.removeMember(orgId, userId);
    return { success: true };
  }

  @Get(":orgId/invites")
  @UseGuards(OrganizationGuard)
  @OrganizationRoles("owner", "org_admin")
  listInvites(@Param("orgId") orgId: string): Promise<InviteData[]> {
    return this.invitesService.listOrganizationInvites(orgId);
  }

  @Delete(":orgId/invites/:inviteId")
  @UseGuards(OrganizationGuard)
  @OrganizationRoles("owner", "org_admin")
  async revokeInvite(
    @Param("orgId") orgId: string,
    @Param("inviteId") inviteId: string,
  ): Promise<SuccessData> {
    await this.invitesService.revokeInvite(inviteId, {
      organizationId: orgId,
    });
    return { success: true };
  }

  @Post(":orgId/invites/:inviteId/resend")
  @UseGuards(OrganizationGuard)
  @OrganizationRoles("owner", "org_admin")
  resendInvite(
    @Param("orgId") orgId: string,
    @Param("inviteId") inviteId: string,
  ): Promise<InviteData> {
    return this.invitesService.resendInvite(inviteId, {
      organizationId: orgId,
    });
  }
}
