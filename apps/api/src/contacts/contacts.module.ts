import { Module } from "@nestjs/common";
import { BillingModule } from "src/billing/billing.module";
import { EmailModule } from "src/email/email.module";
import { WorkspacesModule } from "src/workspaces/workspaces.module";
import { ContactsController } from "src/contacts/contacts.controller";
import { ContactListsController } from "src/contacts/contact-lists.controller";
import { ListMembersController } from "src/contacts/list-members.controller";
import { ListConfirmController } from "src/contacts/list-confirm.controller";
import { ContactsService } from "src/contacts/contacts.service";
import { ContactListsService } from "src/contacts/contact-lists.service";
import { ListMembersService } from "src/contacts/list-members.service";
import { ListConfirmService } from "src/contacts/list-confirm.service";
import { ContactImportsService } from "src/contacts/contact-imports.service";

@Module({
  imports: [WorkspacesModule, BillingModule, EmailModule],
  controllers: [
    ContactsController,
    ContactListsController,
    ListMembersController,
    ListConfirmController,
  ],
  providers: [
    ContactsService,
    ContactListsService,
    ListMembersService,
    ListConfirmService,
    ContactImportsService,
  ],
  exports: [ContactsService, ContactListsService],
})
export class ContactsModule {}
