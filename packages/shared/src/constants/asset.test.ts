import { describe, expect, it } from "vitest";
import {
  ASSET_UPLOAD_MIME_EXTENSIONS,
  isAssetUploadMimeType,
} from "./asset";

describe("asset upload constants", () => {
  it("accepts supported image mime types", () => {
    expect(isAssetUploadMimeType("image/png")).toBe(true);
    expect(isAssetUploadMimeType("image/svg+xml")).toBe(false);
    expect(ASSET_UPLOAD_MIME_EXTENSIONS["image/jpeg"]).toBe("jpg");
  });
});
