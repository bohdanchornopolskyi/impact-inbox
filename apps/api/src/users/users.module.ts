import { Module, forwardRef } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AuthModule } from "src/auth/auth.module";
import { EmailModule } from "src/email/email.module";

@Module({
  imports: [forwardRef(() => AuthModule), EmailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
