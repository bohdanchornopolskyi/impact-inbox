import { Module } from "@nestjs/common";
import { InviteAcceptController } from "src/invites/invite-accept.controller";
import { InvitesModule } from "src/invites/invites.module";
import { OnboardingModule } from "src/onboarding/onboarding.module";

@Module({
  imports: [InvitesModule, OnboardingModule],
  controllers: [InviteAcceptController],
})
export class InviteAcceptModule {}
