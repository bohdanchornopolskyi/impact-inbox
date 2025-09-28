"use client";

import { useState } from "react";
import { Upload, Image as ImageIcon, Check, X } from "lucide-react";
import NextImage from "next/image";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UploadImageModal } from "@/components/UploadImageModal";
import { useImageSelection } from "@/hooks/useImageSelection";

interface ImageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function ImageSelector({
  value,
  onChange,
  placeholder = "Select an image...",
  label = "Image",
}: ImageSelectorProps) {
  const { images } = useImageSelection();
  const [isOpen, setIsOpen] = useState(false);

  const handleImageSelect = (imageUrl: string) => {
    onChange(imageUrl);
    setIsOpen(false);
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
  };

  const clearImage = () => {
    onChange("");
  };

  const selectedImage = images?.find((img) => img.url === value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Current image preview */}
      {value && (
        <div className="relative group">
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <NextImage
              src={value}
              alt="Selected image"
              width={200}
              height={120}
              className="w-full h-24 object-cover"
              onError={() => {
                // Fallback for invalid URLs
                onChange("");
              }}
            />
          </div>
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* URL input */}
      <div className="space-y-1">
        <Input
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Choose
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="max-h-80 overflow-y-auto">
              {images === undefined ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading images...
                </div>
              ) : images.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No images found. Upload some images first.
                </div>
              ) : (
                <div className="p-2">
                  {images.map((image) => (
                    <div
                      key={image._id}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                      onClick={() => image.url && handleImageSelect(image.url)}
                    >
                      <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                        {image.url ? (
                          <NextImage
                            src={image.url}
                            alt={image.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {image.type}
                        </p>
                      </div>
                      {selectedImage?._id === image._id && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <UploadImageModal>
          <Button type="button" variant="outline" size="sm" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </UploadImageModal>
      </div>
    </div>
  );
}
