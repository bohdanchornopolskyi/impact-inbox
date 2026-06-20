import { INestApplication } from "@nestjs/common";
import { randomUUID } from "crypto";
import request from "supertest";
import { App } from "supertest/types";
import { createE2eApp } from "./helpers/create-e2e-app";

const testPassword = "TestPass1!";

describe("Auth and workspaces (e2e)", () => {
  let app: INestApplication<App>;
  let authToken: string;
  let workspaceId: string;

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

  it("GET /api/workspaces lists the default workspace from sign-up", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBeTruthy();
    expect(response.body.data[0].slug).toBeTruthy();

    workspaceId = response.body.data[0].id;
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

  it("rejects unauthenticated workspace access", () => {
    return request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}`)
      .expect(401);
  });
});
