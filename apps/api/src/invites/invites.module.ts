import { Module, forwardRef } from "@nestjs/common";
import { BillingModule } from "src/billing/billing.module";
import { EmailModule } from "src/email/email.module";
import { InviteAcceptController } from "src/invites/invite-accept.controller";
import { InvitesController } from "src/invites/invites.controller";
import { InvitesService } from "src/invites/invites.service";
import { OnboardingModule } from "src/onboarding/onboarding.module";
import { OrganizationsModule } from "src/organizations/organizations.module";

@Module({
  imports: [
    EmailModule,
    BillingModule,
    forwardRef(() => OnboardingModule),
    forwardRef(() => OrganizationsModule),
  ],
  controllers: [InvitesController, InviteAcceptController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
