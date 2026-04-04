import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AccountsModule } from "./accounts/accounts.module";
import { AuthModule } from "./auth/auth.module";
import { AuthGuard } from "src/auth/auth.guard";
import { APP_GUARD } from "@nestjs/core";

@Module({
  imports: [UsersModule, AuthModule, AccountsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
