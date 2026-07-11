import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { OrganizationsModule } from "src/organizations/organizations.module";
import { InvitesModule } from "src/invites/invites.module";
import { MembershipModule } from "src/membership/membership.module";
import { WorkspacesController } from "src/workspaces/workspaces.controller";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { WorkspaceAccessService } from "src/workspaces/workspace-access.service";
import { WorkspacesService } from "src/workspaces/workspaces.service";

@Module({
  imports: [UsersModule, OrganizationsModule, InvitesModule, MembershipModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceAccessService, WorkspaceGuard],
  exports: [WorkspacesService, WorkspaceAccessService, WorkspaceGuard],
})
export class WorkspacesModule {}
