import { INestApplication } from "@nestjs/common";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db, invites } from "@repo/db";
import request from "supertest";
import { App } from "supertest/types";
import { createE2eApp } from "./helpers/create-e2e-app";

const testPassword = "TestPass1!";

type SignedUpUser = {
  email: string;
  token: string;
  userId: string;
};

async function signUpUser(
  app: INestApplication<App>,
  name: string,
): Promise<SignedUpUser> {
  const email = `e2e-invite-${name}-${randomUUID()}@example.com`;

  const signUpResponse = await request(app.getHttpServer())
    .post("/api/auth/sign-up")
    .send({
      email,
      name,
      password: testPassword,
      confirmPassword: testPassword,
    })
    .expect(201);

  const token = signUpResponse.body.data.token as string;

  const meResponse = await request(app.getHttpServer())
    .get("/api/users/me")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  return {
    email,
    token,
    userId: meResponse.body.data.id as string,
  };
}

describe("Invite unknown email accept flow (e2e)", () => {
  let app: INestApplication<App>;
  let owner: SignedUpUser;
  let organizationId: string;
  let workspaceId: string;

  beforeAll(async () => {
    app = await createE2eApp();
    owner = await signUpUser(app, "owner");

    const orgsResponse = await request(app.getHttpServer())
      .get("/api/organizations")
      .set("Authorization", `Bearer ${owner.token}`)
      .expect(200);

    organizationId = orgsResponse.body.data[0].id as string;

    const workspacesResponse = await request(app.getHttpServer())
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${owner.token}`)
      .expect(200);

    workspaceId = workspacesResponse.body.data[0].id as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it("invites an unknown email, accepts, and grants workspace access", async () => {
    const unknownEmail = `e2e-invite-unknown-${randomUUID()}@example.com`;

    const inviteResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: unknownEmail, role: "member" })
      .expect(201);

    expect(inviteResponse.body.data.status).toBe("pending_invite");
    expect(inviteResponse.body.data.invite.email).toBe(unknownEmail);
    expect(inviteResponse.body.data.invite.workspaceId).toBe(workspaceId);

    const listResponse = await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}/invites`)
      .set("Authorization", `Bearer ${owner.token}`)
      .expect(200);

    expect(
      listResponse.body.data.some(
        (invite: { email: string }) => invite.email === unknownEmail,
      ),
    ).toBe(true);

    const [inviteRow] = await db
      .select({ token: invites.token })
      .from(invites)
      .where(eq(invites.email, unknownEmail));

    expect(inviteRow?.token).toBeDefined();

    const previewResponse = await request(app.getHttpServer())
      .get(`/api/invites/preview?token=${inviteRow!.token}`)
      .expect(200);

    expect(previewResponse.body.data.email).toBe(unknownEmail);
    expect(previewResponse.body.data.expired).toBe(false);
    expect(previewResponse.body.data.accepted).toBe(false);

    const acceptResponse = await request(app.getHttpServer())
      .post("/api/invites/accept")
      .send({
        token: inviteRow!.token,
        name: "Invitee User",
        password: testPassword,
        confirmPassword: testPassword,
      })
      .expect(201);

    expect(acceptResponse.body.data.success).toBe(true);
    expect(acceptResponse.body.data.token).toBeDefined();

    const inviteeToken = acceptResponse.body.data.token as string;

    await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${inviteeToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(workspaceId);
        expect(body.data.role).toBe("member");
      });

    await request(app.getHttpServer())
      .get(`/api/organizations/${organizationId}`)
      .set("Authorization", `Bearer ${inviteeToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(organizationId);
        expect(body.data.role).toBe("member");
      });
  });

  it("revokes an invite and blocks accept", async () => {
    const unknownEmail = `e2e-invite-revoked-${randomUUID()}@example.com`;

    const inviteResponse = await request(app.getHttpServer())
      .post(`/api/organizations/${organizationId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: unknownEmail, role: "member" })
      .expect(201);

    const inviteId = inviteResponse.body.data.invite.id as string;

    await request(app.getHttpServer())
      .delete(`/api/organizations/${organizationId}/invites/${inviteId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .expect(200);

    const [inviteRow] = await db
      .select({ token: invites.token })
      .from(invites)
      .where(eq(invites.id, inviteId));

    await request(app.getHttpServer())
      .post("/api/invites/accept")
      .send({
        token: inviteRow!.token,
        name: "Revoked User",
        password: testPassword,
        confirmPassword: testPassword,
      })
      .expect(400);
  });
});
