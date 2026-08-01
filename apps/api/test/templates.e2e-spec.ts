import { INestApplication } from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  addContentBlock,
  createEmptyTemplateContent,
  type TemplateContentData,
  type TemplateData,
  type TemplateExportData,
  type TemplateRevisionData,
} from "@repo/shared";
import request from "supertest";
import { App } from "supertest/types";
import { createE2eApp } from "./helpers/create-e2e-app";

const testPassword = "TestPass1!";

function buildWorkingContent(): TemplateContentData {
  const base = createEmptyTemplateContent();
  const columnId = base.body[0]!.children[0]!.children[0]!.id;
  const { content } = addContentBlock(base, columnId, "text");
  const column = content.body[0]!.children[0]!.children[0]!;
  const textBlock = column.children[0]!;

  if (textBlock.type !== "text") {
    throw new Error("Expected text block after addContentBlock");
  }

  return {
    ...content,
    body: [
      {
        ...content.body[0]!,
        children: [
          {
            ...content.body[0]!.children[0]!,
            children: [
              {
                ...column,
                children: [
                  {
                    ...textBlock,
                    props: { text: "Hello from e2e template" },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

describe("Templates (e2e)", () => {
  let app: INestApplication<App>;
  let authToken: string;
  let workspaceId: string;
  let otherAuthToken: string;
  let otherWorkspaceId: string;

  beforeAll(async () => {
    app = await createE2eApp();

    const email = `templates-e2e-${randomUUID()}@example.com`;

    const signUpResponse = await request(app.getHttpServer())
      .post("/api/auth/sign-up")
      .send({
        email,
        name: "Templates E2E",
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

    const otherEmail = `templates-e2e-other-${randomUUID()}@example.com`;

    const otherSignUpResponse = await request(app.getHttpServer())
      .post("/api/auth/sign-up")
      .send({
        email: otherEmail,
        name: "Templates E2E Other",
        password: testPassword,
        confirmPassword: testPassword,
      })
      .expect(201);

    otherAuthToken = otherSignUpResponse.body.data.token;

    const otherWorkspacesResponse = await request(app.getHttpServer())
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${otherAuthToken}`)
      .expect(200);

    otherWorkspaceId = otherWorkspacesResponse.body.data[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates template, updates working copy, saves revision, and exports html/text", async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Welcome email" })
      .expect(201);

    const created = createResponse.body.data as TemplateData;
    expect(created.id).toEqual(expect.any(String));
    expect(created.name).toBe("Welcome email");
    expect(created.workspaceId).toBe(workspaceId);

    const workingContent = buildWorkingContent();

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/workspaces/${workspaceId}/templates/${created.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        content: workingContent,
        expectedUpdatedAt: created.updatedAt,
      })
      .expect(200);

    const updated = updateResponse.body.data as TemplateData;
    expect(updated.content.body[0]!.children[0]!.children[0]!.children).toHaveLength(
      1,
    );
    expect(updated.updatedAt).not.toBe(created.updatedAt);

    const revisionResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates/${created.id}/revisions`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        content: workingContent,
        expectedUpdatedAt: updated.updatedAt,
      })
      .expect(201);

    const revision = revisionResponse.body.data as TemplateRevisionData;
    expect(revision.id).toEqual(expect.any(String));
    expect(revision.templateId).toBe(created.id);
    expect(revision.content).toEqual(workingContent);

    const exportResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates/${created.id}/export`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201);

    const exported = exportResponse.body.data as TemplateExportData;
    expect(exported.fileName).toBe("welcome-email.html");
    expect(exported.html).toContain("Hello from e2e template");
    expect(exported.text).toContain("Hello from e2e template");
  });

  it("duplicates a template without carrying revision history", async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Newsletter", content: buildWorkingContent() })
      .expect(201);

    const source = createResponse.body.data as TemplateData;

    await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates/${source.id}/revisions`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        content: source.content,
        expectedUpdatedAt: source.updatedAt,
      })
      .expect(201);

    const duplicateResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates/${source.id}/duplicate`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(201);

    const copy = duplicateResponse.body.data as TemplateData;
    expect(copy.id).not.toBe(source.id);
    expect(copy.name).toBe("Newsletter (copy)");
    expect(copy.workspaceId).toBe(workspaceId);
    expect(copy.content).toEqual(source.content);
    expect(copy.archivedAt).toBeNull();

    const copyRevisions = await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}/templates/${copy.id}/revisions`)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);

    expect(copyRevisions.body.data).toEqual([]);

    await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates/${source.id}/duplicate`)
      .set("Authorization", `Bearer ${otherAuthToken}`)
      .expect(403);
  });

  it("rejects unauthorized and wrong-workspace access", async () => {
    const createResponse = await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Private template" })
      .expect(201);

    const templateId = (createResponse.body.data as TemplateData).id;

    await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}/templates/${templateId}`)
      .expect(401);

    await request(app.getHttpServer())
      .get(`/api/workspaces/${workspaceId}/templates/${templateId}`)
      .set("Authorization", `Bearer ${otherAuthToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .post(`/api/workspaces/${workspaceId}/templates/${templateId}/export`)
      .set("Authorization", `Bearer ${otherAuthToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get(`/api/workspaces/${otherWorkspaceId}/templates/${templateId}`)
      .set("Authorization", `Bearer ${otherAuthToken}`)
      .expect(404);
  });
});
