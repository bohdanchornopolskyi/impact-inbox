"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { UploadImageModal } from "@/components/UploadImageModal";
import { ImageItem } from "@/components/ImageItem";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";

interface AssetsTabProps {
  onImageSelect?: (storageId: Id<"_storage">) => void;
}

export function AssetsTab({ onImageSelect }: AssetsTabProps) {
  const images = useQuery(api.images.listImages);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Project Assets</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <UploadImageModal>
              <Button
                variant="outline"
                size="sm"
                className="w-full cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </Button>
            </UploadImageModal>
          </SidebarMenuItem>

          {images === undefined && (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <ImageIcon className="w-4 h-4" />
                <span>Loading...</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {images && images.length === 0 && (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <ImageIcon className="w-4 h-4" />
                <span>No images found</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {images &&
            images.map((asset) => (
              <SidebarMenuItem key={asset._id}>
                <ImageItem
                  image={asset}
                  onSelect={onImageSelect}
                  draggable={true}
                />
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
