import { createObjectStorageFromEnv } from "./create-object-storage";
import { DisabledObjectStorage } from "./disabled-object-storage";
import { S3CompatibleObjectStorage } from "./s3-compatible-object-storage";

describe("createObjectStorageFromEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.OBJECT_STORAGE_DRIVER;
    delete process.env.OBJECT_STORAGE_BUCKET;
    delete process.env.OBJECT_STORAGE_PUBLIC_BASE_URL;
    delete process.env.OBJECT_STORAGE_ENDPOINT;
    delete process.env.OBJECT_STORAGE_REGION;
    delete process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
    delete process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
    delete process.env.OBJECT_STORAGE_FORCE_PATH_STYLE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("defaults to disabled storage", () => {
    expect(createObjectStorageFromEnv()).toBeInstanceOf(DisabledObjectStorage);
  });

  it("builds an S3-compatible adapter for r2 and s3 drivers", () => {
    process.env.OBJECT_STORAGE_DRIVER = "r2";
    process.env.OBJECT_STORAGE_BUCKET = "assets";
    process.env.OBJECT_STORAGE_PUBLIC_BASE_URL = "https://cdn.example.com";
    process.env.OBJECT_STORAGE_ENDPOINT =
      "https://abc123.r2.cloudflarestorage.com";
    process.env.OBJECT_STORAGE_ACCESS_KEY_ID = "key";
    process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY = "secret";

    expect(createObjectStorageFromEnv()).toBeInstanceOf(
      S3CompatibleObjectStorage,
    );

    process.env.OBJECT_STORAGE_DRIVER = "s3";
    delete process.env.OBJECT_STORAGE_ENDPOINT;
    process.env.OBJECT_STORAGE_REGION = "eu-west-1";

    expect(createObjectStorageFromEnv()).toBeInstanceOf(
      S3CompatibleObjectStorage,
    );
  });

  it("rejects unknown drivers", () => {
    process.env.OBJECT_STORAGE_DRIVER = "gcs";
    expect(() => createObjectStorageFromEnv()).toThrow(/Unsupported/);
  });
});
