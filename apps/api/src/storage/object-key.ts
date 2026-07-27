export function buildAssetObjectKey(input: {
  organizationId: string;
  workspaceId: string;
  assetId: string;
  extension: string;
}): string {
  return `orgs/${input.organizationId}/workspaces/${input.workspaceId}/assets/${input.assetId}.${input.extension}`;
}

export function organizationAssetsPrefix(organizationId: string): string {
  return `orgs/${organizationId}/`;
}

export function joinPublicObjectUrl(publicBaseUrl: string, key: string): string {
  const base = publicBaseUrl.replace(/\/+$/, "");
  const path = key.replace(/^\/+/, "");
  return `${base}/${path}`;
}

const ASSET_KEY_PATTERN =
  /^orgs\/([^/]+)\/workspaces\/([^/]+)\/assets\/([^/]+)\.([a-z0-9]+)$/i;

export type ParsedAssetObjectKey = {
  organizationId: string;
  workspaceId: string;
  assetId: string;
  extension: string;
};

export function parseAssetObjectKey(key: string): ParsedAssetObjectKey | null {
  const match = ASSET_KEY_PATTERN.exec(key);
  if (!match) {
    return null;
  }
  return {
    organizationId: match[1]!,
    workspaceId: match[2]!,
    assetId: match[3]!,
    extension: match[4]!.toLowerCase(),
  };
}

export function contentTypeFromAssetExtension(extension: string): string {
  switch (extension.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
