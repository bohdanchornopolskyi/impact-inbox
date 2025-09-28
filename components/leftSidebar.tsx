import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarTabs } from "./SidebarTabs";
import { Id } from "@/convex/_generated/dataModel";

interface LeftSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onImageSelect?: (storageId: Id<"_storage">) => void;
}

export function LeftSidebar({ onImageSelect, ...props }: LeftSidebarProps) {
  return (
    <Sidebar className="top-[10vh] h-[90vh]" {...props}>
      <SidebarHeader className="p-0">
        <SidebarTabs onImageSelect={onImageSelect} />
      </SidebarHeader>
      <SidebarContent />
    </Sidebar>
  );
}
