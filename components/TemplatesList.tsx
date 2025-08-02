"use client";

import TemplateListItem from "@/components/TemplateListItem";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export function TemplatesList() {
  const templates = useQuery(api.emailTemplates.getAll);

  return (
    <div className="space-y-2">
      {templates?.map((template) => (
        <TemplateListItem
          key={template._id}
          id={template._id}
          name={template.name}
        />
      ))}
    </div>
  );
}
