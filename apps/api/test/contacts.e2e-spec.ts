import { INestApplication } from "@nestjs/common";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db, listConfirmTokens, listMembers } from "@repo/db";
import request from "supertest";
import { App } from "supertest/types";
import { createE2eApp } from "./helpers/create-e2e-app";

const testPassword = "TestPass1!";

describe("Contacts (e2e)", () => {
  let app: INestApplication<App>;
  let authToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    app = await createE2eApp();

    const email = `contacts-e2e-${randomUUID()}@example.com`;

    const signUpResponse = await request(app.getHttpServer())
      .post("/api/auth/sign-up")
      .send({
        email,
        name: "Contacts E2E",
        password: testPassword,
        confirmPassword: testPassword,
      })
      .expect(201);

    authToken = signUpResponse.body.data.token;

    const workspacesResponse = await request(app.getHttpServer())
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    workspaceId = workspacesResponse.body.data[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates list, contact, and confirms double opt-in", async () => {
    const listResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/contact-lists`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Newsletter", doubleOptInEnabled: true })
      .expect(201);

    const listId = listResponse.body.data.id as string;

    const memberResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/contact-lists/${listId}/members`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: `subscriber-${randomUUID()}@example.com`, firstName: "Pat" })
      .expect(201);

    expect(memberResponse.body.data.status).toBe("pending");

    const contactId = memberResponse.body.data.contactId as string;

    const [membership] = await db
      .select({ id: listMembers.id })
      .from(listMembers)
      .where(eq(listMembers.contactId, contactId));

    const [tokenRow] = await db
      .select({ token: listConfirmTokens.token })
      .from(listConfirmTokens)
      .where(eq(listConfirmTokens.listMemberId, membership!.id));

    await request(app.getHttpServer())
      .post("/api/list-confirm/accept")
      .send({ token: tokenRow!.token })
      .expect(201);

    const membersResponse = await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}/contact-lists/${listId}/members`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(membersResponse.body.data[0].status).toBe("subscribed");
  });

  it("imports contacts via preview and execute", async () => {
    const listResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/contact-lists`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Import list" })
      .expect(201);

    const listId = listResponse.body.data.id as string;
    const csv = "email,firstName\nimport1@example.com,Ada\nimport2@example.com,Grace";

    const previewResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/contact-lists/${listId}/import/preview`)
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", Buffer.from(csv), "contacts.csv")
      .expect(201);

    const importId = previewResponse.body.data.importId as string;

    const executeResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/contact-imports/${importId}/execute`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        columnMapping: previewResponse.body.data.suggestedMapping,
      })
      .expect(201);

    expect(executeResponse.body.data.status).toBe("completed");
    expect(executeResponse.body.data.processedCount).toBe(2);
  });
});
