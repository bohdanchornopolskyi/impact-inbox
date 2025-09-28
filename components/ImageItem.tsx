"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Edit2, Trash2, Check, X, ImageIcon } from "lucide-react";
import NextImage from "next/image";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface ImageItemProps {
  image: {
    _id: Id<"images">;
    storageId: Id<"_storage">;
    name: string;
    type: string;
    url: string | null;
  };
  onSelect?: (storageId: Id<"_storage">) => void;
  draggable?: boolean;
}

export function ImageItem({
  image,
  onSelect,
  draggable = false,
}: ImageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(image.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const renameImage = useMutation(api.images.renameImage);
  const deleteImage = useMutation(api.images.deleteImage);

  const handleRename = async () => {
    if (newName.trim() && newName !== image.name) {
      try {
        await renameImage({ id: image._id, name: newName.trim() });
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to rename image:", error);
        setNewName(image.name);
      }
    } else {
      setNewName(image.name);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) {
      try {
        await deleteImage({ id: image._id });
      } catch (error) {
        console.error("Failed to delete image:", error);
        setIsDeleting(false);
      }
    } else {
      setIsDeleting(true);
    }
  };

  const handleCancel = () => {
    setNewName(image.name);
    setIsEditing(false);
    setIsDeleting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (draggable) {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          type: "image",
          storageId: image.storageId,
          name: image.name,
          url: `/api/images/${image.storageId}`,
        }),
      );
      e.dataTransfer.effectAllowed = "copy";
    }
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(image.storageId);
    }
  };

  return (
    <SidebarMenuButton
      className="group cursor-pointer"
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 w-full pr-16">
        <div className="h-full rounded border overflow-hidden flex-shrink-0">
          {image.url ? (
            <NextImage
              src={image.url}
              alt={image.name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex flex-col items-start flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm px-2 py-1 w-full"
              autoFocus
            />
          ) : (
            <span className="font-medium truncate w-full text-sm">
              {image.name}
            </span>
          )}
        </div>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handleRename}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handleCancel}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : isDeleting ? (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="destructive"
              className="h-6 w-6"
              onClick={handleDelete}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handleCancel}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </SidebarMenuButton>
  );
}
