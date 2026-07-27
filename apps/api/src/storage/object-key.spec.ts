import {
  buildAssetObjectKey,
  contentTypeFromAssetExtension,
  joinPublicObjectUrl,
  organizationAssetsPrefix,
  parseAssetObjectKey,
} from "./object-key";

describe("object-key", () => {
  it("builds scoped asset keys", () => {
    expect(
      buildAssetObjectKey({
        organizationId: "org_1",
        workspaceId: "ws_1",
        assetId: "asset_1",
        extension: "png",
      }),
    ).toBe("orgs/org_1/workspaces/ws_1/assets/asset_1.png");
  });

  it("joins public URLs without double slashes", () => {
    expect(
      joinPublicObjectUrl("https://cdn.example.com/", "/orgs/a/file.png"),
    ).toBe("https://cdn.example.com/orgs/a/file.png");
    expect(joinPublicObjectUrl("https://cdn.example.com", "orgs/a/file.png")).toBe(
      "https://cdn.example.com/orgs/a/file.png",
    );
  });

  it("parses asset keys and rejects unrelated paths", () => {
    expect(
      parseAssetObjectKey("orgs/org_1/workspaces/ws_1/assets/asset_1.png"),
    ).toEqual({
      organizationId: "org_1",
      workspaceId: "ws_1",
      assetId: "asset_1",
      extension: "png",
    });
    expect(parseAssetObjectKey("orgs/org_1/other.png")).toBeNull();
    expect(organizationAssetsPrefix("org_1")).toBe("orgs/org_1/");
    expect(contentTypeFromAssetExtension("jpg")).toBe("image/jpeg");
  });
});
