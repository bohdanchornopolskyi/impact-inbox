import { Module } from "@nestjs/common";
import { MembershipCommandsService } from "src/membership/membership-commands.service";

@Module({
  providers: [MembershipCommandsService],
  exports: [MembershipCommandsService],
})
export class MembershipModule {}
