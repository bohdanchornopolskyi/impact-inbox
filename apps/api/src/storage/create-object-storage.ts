import { DisabledObjectStorage } from "src/storage/disabled-object-storage";
import type { ObjectStorage } from "src/storage/object-storage";
import { S3CompatibleObjectStorage } from "src/storage/s3-compatible-object-storage";

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var ${name} for object storage`);
  }
  return value;
}

export function createObjectStorageFromEnv(): ObjectStorage {
  const driver = (process.env.OBJECT_STORAGE_DRIVER ?? "none").trim().toLowerCase();

  if (driver === "none" || driver === "") {
    return new DisabledObjectStorage();
  }

  if (driver !== "s3" && driver !== "r2") {
    throw new Error(
      `Unsupported OBJECT_STORAGE_DRIVER="${driver}". Use none, s3, or r2.`,
    );
  }

  const endpoint = process.env.OBJECT_STORAGE_ENDPOINT?.trim() || undefined;
  const forcePathStyleEnv = process.env.OBJECT_STORAGE_FORCE_PATH_STYLE?.trim();
  const forcePathStyle =
    forcePathStyleEnv === undefined || forcePathStyleEnv === ""
      ? endpoint
        ? true
        : undefined
      : forcePathStyleEnv === "true" || forcePathStyleEnv === "1";

  return new S3CompatibleObjectStorage({
    bucket: readRequired("OBJECT_STORAGE_BUCKET"),
    publicBaseUrl: readRequired("OBJECT_STORAGE_PUBLIC_BASE_URL"),
    region: process.env.OBJECT_STORAGE_REGION?.trim() || (driver === "r2" ? "auto" : "us-east-1"),
    endpoint,
    accessKeyId: readRequired("OBJECT_STORAGE_ACCESS_KEY_ID"),
    secretAccessKey: readRequired("OBJECT_STORAGE_SECRET_ACCESS_KEY"),
    forcePathStyle,
  });
}
