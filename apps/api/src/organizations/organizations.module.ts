import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { OrganizationAccessService } from "src/organizations/organization-access.service";
import { OrganizationGuard } from "src/organizations/guards/organization.guard";
import { OrganizationsController } from "src/organizations/organizations.controller";
import { OrganizationsService } from "src/organizations/organizations.service";

@Module({
  imports: [UsersModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationAccessService, OrganizationGuard],
  exports: [OrganizationsService, OrganizationAccessService, OrganizationGuard],
})
export class OrganizationsModule {}
