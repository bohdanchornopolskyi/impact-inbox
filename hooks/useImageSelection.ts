import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface ImageAsset {
  _id: Id<"images">;
  storageId: Id<"_storage">;
  name: string;
  type: string;
  url: string | null;
}

export function useImageSelection() {
  const images = useQuery(api.images.listImages);

  return {
    images,
  };
}
