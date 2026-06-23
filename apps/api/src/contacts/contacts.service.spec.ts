import { Test, TestingModule } from "@nestjs/testing";
import { DATABASE_TOKEN } from "src/database/database.constants";
import { PlanLimitsService } from "src/billing/plan-limits.service";
import { ContactsService } from "src/contacts/contacts.service";

describe("ContactsService", () => {
  let service: ContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: DATABASE_TOKEN,
          useValue: {
            select: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PlanLimitsService,
          useValue: { assertCanCreateContact: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ContactsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
