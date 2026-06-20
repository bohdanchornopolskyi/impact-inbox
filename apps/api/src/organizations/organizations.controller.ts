import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  type AuthenticatedOrganizationContext,
  type OrganizationDetailData,
  type OrganizationListItemData,
  type UserProfileData,
} from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { CurrentOrganization } from "src/organizations/decorators/current-organization.decorator";
import { OrganizationGuard } from "src/organizations/guards/organization.guard";
import { OrganizationsService } from "src/organizations/organizations.service";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  list(@CurrentUser() user: UserProfileData): Promise<OrganizationListItemData[]> {
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
}
