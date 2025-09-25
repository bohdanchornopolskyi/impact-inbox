"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { UploadCloud, File, X } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function UploadImage() {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const sendImage = useMutation(api.images.sendImage);

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      const postUrl = await generateUploadUrl();

      const result = await new Promise<{ storageId: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", postUrl, true);

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round(
                (event.loaded / event.total) * 100,
              );
              setUploadProgress(percentComplete);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Network error during upload.")),
          );
          xhr.addEventListener("abort", () =>
            reject(new Error("Upload aborted.")),
          );

          xhr.send(file);
        },
      );

      await sendImage({
        storageId: result.storageId as Id<"_storage">,
        name: file.name,
        type: file.type,
      });

      setFileToUpload(null);
      setUploadProgress(0);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFileToUpload(acceptedFiles[0]);
      setUploadError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif", ".webp"] },
    multiple: false,
    disabled: isUploading,
  });

  const handleUpload = () => {
    if (fileToUpload) {
      uploadFile(fileToUpload);
    }
  };

  const handleRemoveFile = () => {
    setFileToUpload(null);
    setUploadError(null);
  };

  const dropzoneClassName = cn(
    "flex flex-col items-center justify-center w-full h-32 px-4 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors",
    "border-gray-300 dark:border-gray-600",
    "hover:border-gray-400 dark:hover:border-gray-500",
    isDragActive
      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
      : "bg-gray-50 dark:bg-gray-900/50",
    isUploading && "opacity-50 cursor-not-allowed",
  );

  return (
    <Card>
      <CardContent className="p-6">
        {fileToUpload === null ? (
          <div {...getRootProps()} className={dropzoneClassName}>
            <input {...getInputProps()} />
            <UploadCloud className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2" />
            {isDragActive ? (
              <p>Drop the image here ...</p>
            ) : (
              <p>Drag 'n' drop an image here, or click to select</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <File className="w-6 h-6 text-gray-500" />
                <span className="font-medium truncate max-w-xs">
                  {fileToUpload.name}
                </span>
              </div>
              <Button
                onClick={handleRemoveFile}
                variant="ghost"
                size="icon"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {uploadError && (
              <p className="text-sm text-center mt-2 text-red-600 dark:text-red-500">
                {uploadError}
              </p>
            )}

            {!isUploading && (
              <Button onClick={handleUpload} className="w-full mt-4">
                Upload Image
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
