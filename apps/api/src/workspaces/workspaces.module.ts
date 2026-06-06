import { Module, forwardRef } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { WorkspacesController } from "src/workspaces/workspaces.controller";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { WorkspacesService } from "src/workspaces/workspaces.service";

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceGuard],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
