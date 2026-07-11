import { Module } from "@nestjs/common";
import { BillingModule } from "src/billing/billing.module";
import { EmailModule } from "src/email/email.module";
import { InvitesController } from "src/invites/invites.controller";
import { InvitesService } from "src/invites/invites.service";
import { MembershipModule } from "src/membership/membership.module";

@Module({
  imports: [EmailModule, BillingModule, MembershipModule],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
