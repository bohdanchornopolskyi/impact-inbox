import { INestApplication } from "@nestjs/common";
import { randomUUID } from "crypto";
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
  const email = `e2e-members-${name}-${randomUUID()}@example.com`;

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

describe("Organization and workspace member CRUD (e2e)", () => {
  let app: INestApplication<App>;
  let owner: SignedUpUser;
  let invitee: SignedUpUser;
  let limited: SignedUpUser;
  let organizationId: string;
  let workspaceId: string;

  beforeAll(async () => {
    app = await createE2eApp();

    owner = await signUpUser(app, "owner");
    invitee = await signUpUser(app, "invitee");
    limited = await signUpUser(app, "limited");

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

  it("adds an existing user as an organization member", async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/organizations/${organizationId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: invitee.email, role: "member" })
      .expect(201);

    expect(response.body.data.status).toBe("member");
    expect(response.body.data.member.userId).toBe(invitee.userId);
    expect(response.body.data.member.role).toBe("member");
    expect(response.body.data.member.organizationId).toBe(organizationId);

    await request(app.getHttpServer())
      .get(`/api/organizations/${organizationId}`)
      .set("Authorization", `Bearer ${invitee.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(organizationId);
        expect(body.data.role).toBe("member");
      });
  });

  it("updates an organization member role", async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/organizations/${organizationId}/members/${invitee.userId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ role: "org_admin" })
      .expect(200);

    expect(response.body.data.userId).toBe(invitee.userId);
    expect(response.body.data.role).toBe("org_admin");

    await request(app.getHttpServer())
      .get(`/api/organizations/${organizationId}`)
      .set("Authorization", `Bearer ${invitee.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.role).toBe("org_admin");
      });
  });

  it("adds an existing org member to a workspace", async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: invitee.email, role: "member" })
      .expect(201);

    expect(response.body.data.status).toBe("member");
    expect(response.body.data.member.userId).toBe(invitee.userId);
    expect(response.body.data.member.role).toBe("member");
    expect(response.body.data.member.workspaceId).toBe(workspaceId);

    await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${invitee.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(workspaceId);
        expect(body.data.role).toBe("member");
      });
  });

  it("updates a workspace member role", async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/workspaces/${workspaceId}/members/${invitee.userId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ role: "admin" })
      .expect(200);

    expect(response.body.data.userId).toBe(invitee.userId);
    expect(response.body.data.role).toBe("admin");

    await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${invitee.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.role).toBe("admin");
      });
  });

  it("rejects organization member mutations from insufficient roles", async () => {
    await request(app.getHttpServer())
      .post(`/api/organizations/${organizationId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: limited.email, role: "member" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/organizations/${organizationId}/members`)
      .set("Authorization", `Bearer ${limited.token}`)
      .send({ email: `e2e-members-other-${randomUUID()}@example.com`, role: "member" })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/organizations/${organizationId}/members/${invitee.userId}`)
      .set("Authorization", `Bearer ${limited.token}`)
      .send({ role: "member" })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/api/organizations/${organizationId}/members/${invitee.userId}`)
      .set("Authorization", `Bearer ${limited.token}`)
      .expect(403);
  });

  it("rejects workspace member mutations from insufficient roles", async () => {
    await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: limited.email, role: "member" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${limited.token}`)
      .send({ email: invitee.email, role: "member" })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/api/workspaces/${workspaceId}/members/${invitee.userId}`)
      .set("Authorization", `Bearer ${limited.token}`)
      .send({ role: "member" })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/api/workspaces/${workspaceId}/members/${invitee.userId}`)
      .set("Authorization", `Bearer ${limited.token}`)
      .expect(403);
  });

  it("removes a workspace member and denies further workspace access", async () => {
    await request(app.getHttpServer())
      .delete(`/api/workspaces/${workspaceId}/members/${invitee.userId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.success).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${invitee.token}`)
      .expect(403);
  });

  it("removes an organization member and denies further organization access", async () => {
    await request(app.getHttpServer())
      .delete(`/api/organizations/${organizationId}/members/${invitee.userId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.success).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/api/organizations/${organizationId}`)
      .set("Authorization", `Bearer ${invitee.token}`)
      .expect(403);
  });
});
