export const ASSET_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;

export const ASSET_UPLOAD_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type AssetUploadMimeType =
  (typeof ASSET_UPLOAD_ALLOWED_MIME_TYPES)[number];

export const ASSET_UPLOAD_MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
} as const satisfies Record<AssetUploadMimeType, string>;

export function isAssetUploadMimeType(
  value: string,
): value is AssetUploadMimeType {
  return (ASSET_UPLOAD_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}
