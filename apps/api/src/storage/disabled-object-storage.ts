import { ServiceUnavailableException } from "@nestjs/common";
import type {
  ListedObject,
  ObjectStorage,
  PutObjectInput,
  PutObjectResult,
} from "src/storage/object-storage";

export class DisabledObjectStorage implements ObjectStorage {
  async putObject(_input: PutObjectInput): Promise<PutObjectResult> {
    throw new ServiceUnavailableException(
      "Object storage is not configured. Set OBJECT_STORAGE_DRIVER=s3 (or r2) and credentials.",
    );
  }

  async deleteObject(_key: string): Promise<void> {
    throw new ServiceUnavailableException(
      "Object storage is not configured. Set OBJECT_STORAGE_DRIVER=s3 (or r2) and credentials.",
    );
  }

  async listObjects(_prefix: string): Promise<ListedObject[]> {
    return [];
  }
}
