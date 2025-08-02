"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

interface CreateTemplateFormProps {
  onSuccess: () => void;
}

export function CreateTemplateForm({ onSuccess }: CreateTemplateFormProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const createTemplate = useMutation(api.emailTemplates.create);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Template name cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      const newTemplateId = await createTemplate({ name });
      toast.success("Template created successfully!");
      onSuccess();
      router.push(`/build/${newTemplateId}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to create template.");
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          placeholder="My Awesome Template"
        />
      </div>
      <DialogFooter>
        <Button onClick={handleCreate} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Template
        </Button>
      </DialogFooter>
    </div>
  );
}
