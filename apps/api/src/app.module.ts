import { Module } from "@nestjs/common";
import { OrganizationsModule } from "src/organizations/organizations.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AccountsModule } from "./accounts/accounts.module";
import { AuthModule } from "./auth/auth.module";
import { WorkspacesModule } from "src/workspaces/workspaces.module";
import { TemplatesModule } from "src/templates/templates.module";
import { DatabaseModule } from "src/database/database.module";

@Module({
  imports: [
    DatabaseModule,
    OrganizationsModule,
    UsersModule,
    AccountsModule,
    WorkspacesModule,
    TemplatesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
