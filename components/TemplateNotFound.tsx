"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function TemplateNotFound() {
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  useEffect(() => {
    if (error === "not_found") {
      toast.error("Template not found", {
        description:
          "Please choose a template from your list or create a new one.",
      });
    }
  }, [error]);

  return <></>;
}
