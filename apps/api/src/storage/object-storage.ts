export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type PutObjectResult = {
  key: string;
  publicUrl: string;
};

export type ListedObject = {
  key: string;
  size: number;
  publicUrl: string;
};

export interface ObjectStorage {
  putObject(input: PutObjectInput): Promise<PutObjectResult>;
  deleteObject(key: string): Promise<void>;
  listObjects(prefix: string): Promise<ListedObject[]>;
}

export const OBJECT_STORAGE_TOKEN = Symbol("OBJECT_STORAGE");
