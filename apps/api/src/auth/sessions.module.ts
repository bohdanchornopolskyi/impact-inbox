import { Module } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [UsersModule],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
