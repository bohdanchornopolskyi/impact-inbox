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
  type OrganizationDetailData,
  type OrganizationListItemData,
  type OrganizationMemberData,
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

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

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
    @Body() dto: InviteOrganizationMemberDto,
  ): Promise<OrganizationMemberData> {
    return this.organizationsService.addMember(orgId, dto);
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
}
