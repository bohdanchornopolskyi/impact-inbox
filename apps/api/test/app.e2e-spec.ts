import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { createE2eApp } from "./helpers/create-e2e-app";

describe("App (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/health", () => {
    return request(app.getHttpServer())
      .get("/api/health")
      .expect(200)
      .expect({ data: { ok: true } });
  });

  it("allows CORS preflight from the web app origin", () => {
    return request(app.getHttpServer())
      .options("/api/health")
      .set("Origin", process.env.WEB_ORIGIN ?? "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET")
      .expect(204)
      .expect("Access-Control-Allow-Origin", process.env.WEB_ORIGIN ?? "http://localhost:3000");
  });
});
