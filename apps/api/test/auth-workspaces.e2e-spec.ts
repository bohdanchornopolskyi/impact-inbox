import { INestApplication } from "@nestjs/common";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import { authTokens, db, organizations, users } from "@repo/db";
import request from "supertest";
import { App } from "supertest/types";
import { createE2eApp } from "./helpers/create-e2e-app";

const testPassword = "TestPass1!";

describe("Auth and workspaces (e2e)", () => {
  let app: INestApplication<App>;
  let authToken: string;
  let workspaceId: string;
  let workspaceSlug: string;
  let organizationId: string;

  beforeAll(async () => {
    app = await createE2eApp();

    const email = `e2e-${randomUUID()}@example.com`;

    const signUpResponse = await request(app.getHttpServer())
      .post("/api/auth/sign-up")
      .send({
        email,
        name: "E2E User",
        password: testPassword,
        confirmPassword: testPassword,
      })
      .expect(201);

    authToken = signUpResponse.body.data.token;

    await request(app.getHttpServer())
      .post("/api/auth/sign-in")
      .send({
        email,
        password: testPassword,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.data.token).toEqual(expect.any(String));
      });
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/users/me returns the session user", () => {
    return request(app.getHttpServer())
      .get("/api/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.email).toMatch(/^e2e-.*@example\.com$/);
        expect(body.data.name).toBe("E2E User");
      });
  });

  it("GET /api/organizations lists the default organization from sign-up", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/organizations")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("E2E User's Organization");
    expect(response.body.data[0].role).toBe("owner");
    expect(response.body.data[0].trialEndsAt).toBeNull();

    organizationId = response.body.data[0].id;
  });

  it("GET /api/organizations/:orgId returns organization details", () => {
    return request(app.getHttpServer())
      .get(`/api/organizations/${organizationId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(organizationId);
        expect(body.data.role).toBe("owner");
      });
  });

  it("GET /api/workspaces lists the default workspace from sign-up", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBeTruthy();
    expect(response.body.data[0].slug).toBeTruthy();
    expect(response.body.data[0].organizationId).toBe(organizationId);

    workspaceId = response.body.data[0].id;
    workspaceSlug = response.body.data[0].slug;
  });

  it("GET /api/workspaces/by-slug/:slug resolves the workspace", () => {
    return request(app.getHttpServer())
      .get(`/api/workspaces/by-slug/${workspaceSlug}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(workspaceId);
        expect(body.data.slug).toBe(workspaceSlug);
      });
  });

  it("GET /api/workspaces/:id returns workspace details", () => {
    return request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.id).toBe(workspaceId);
        expect(body.data.role).toBe("owner");
      });
  });

  it("starts the trial when email is confirmed while signed in", async () => {
    const meResponse = await request(app.getHttpServer())
      .get("/api/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    const [verificationToken] = await db
      .select({ token: authTokens.token })
      .from(authTokens)
      .where(
        and(
          eq(authTokens.type, "email_verification"),
          eq(authTokens.userId, meResponse.body.data.id),
        ),
      )
      .limit(1);

    expect(verificationToken).toBeDefined();

    await request(app.getHttpServer())
      .post("/api/auth/confirm-email")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ token: verificationToken!.token })
      .expect(201);

    const [organization] = await db
      .select({ trialEndsAt: organizations.trialEndsAt })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    expect(organization?.trialEndsAt).not.toBeNull();
  });

  it("does not start the trial on confirm-email without an active session", async () => {
    const email = `e2e-confirm-no-session-${randomUUID()}@example.com`;

    const signUpResponse = await request(app.getHttpServer())
      .post("/api/auth/sign-up")
      .send({
        email,
        name: "Confirm No Session",
        password: testPassword,
        confirmPassword: testPassword,
      })
      .expect(201);

    const signupToken = signUpResponse.body.data.token as string;

    const meResponse = await request(app.getHttpServer())
      .get("/api/users/me")
      .set("Authorization", `Bearer ${signupToken}`)
      .expect(200);

    const userId = meResponse.body.data.id as string;

    const orgsResponse = await request(app.getHttpServer())
      .get("/api/organizations")
      .set("Authorization", `Bearer ${signupToken}`)
      .expect(200);

    const orgId = orgsResponse.body.data[0].id as string;

    await request(app.getHttpServer())
      .post("/api/auth/sign-out")
      .set("Authorization", `Bearer ${signupToken}`)
      .expect(201);

    const [verificationToken] = await db
      .select({ token: authTokens.token })
      .from(authTokens)
      .where(
        and(
          eq(authTokens.type, "email_verification"),
          eq(authTokens.userId, userId),
        ),
      )
      .limit(1);

    expect(verificationToken).toBeDefined();

    await request(app.getHttpServer())
      .post("/api/auth/confirm-email")
      .send({ token: verificationToken!.token })
      .expect(201);

    const [beforeSignIn] = await db
      .select({ trialEndsAt: organizations.trialEndsAt })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    expect(beforeSignIn?.trialEndsAt).toBeNull();

    await request(app.getHttpServer())
      .post("/api/auth/sign-in")
      .send({
        email,
        password: testPassword,
      })
      .expect(201);

    const [afterSignIn] = await db
      .select({ trialEndsAt: organizations.trialEndsAt })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    expect(afterSignIn?.trialEndsAt).not.toBeNull();
  });

  it("starts the trial on sign-in when the owner is already verified", async () => {
    const email = `e2e-verified-signin-${randomUUID()}@example.com`;

    const signUpResponse = await request(app.getHttpServer())
      .post("/api/auth/sign-up")
      .send({
        email,
        name: "Verified Sign-In User",
        password: testPassword,
        confirmPassword: testPassword,
      })
      .expect(201);

    const signupToken = signUpResponse.body.data.token as string;

    const meResponse = await request(app.getHttpServer())
      .get("/api/users/me")
      .set("Authorization", `Bearer ${signupToken}`)
      .expect(200);

    const userId = meResponse.body.data.id as string;

    const orgsResponse = await request(app.getHttpServer())
      .get("/api/organizations")
      .set("Authorization", `Bearer ${signupToken}`)
      .expect(200);

    const orgId = orgsResponse.body.data[0].id as string;
    expect(orgsResponse.body.data[0].trialEndsAt).toBeNull();

    await request(app.getHttpServer())
      .post("/api/auth/sign-out")
      .set("Authorization", `Bearer ${signupToken}`)
      .expect(201);

    await db
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(users.id, userId));

    await request(app.getHttpServer())
      .post("/api/auth/sign-in")
      .send({
        email,
        password: testPassword,
      })
      .expect(201);

    const [organization] = await db
      .select({ trialEndsAt: organizations.trialEndsAt })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    expect(organization?.trialEndsAt).not.toBeNull();
  });

  it("rejects unauthenticated workspace access", () => {
    return request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}`)
      .expect(401);
  });
});
