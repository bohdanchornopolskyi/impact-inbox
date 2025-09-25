import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarTabs } from "./SidebarTabs";

export function LeftSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="top-[10vh] h-[90vh]" {...props}>
      <SidebarHeader className="p-0">
        <SidebarTabs />
      </SidebarHeader>
      <SidebarContent />
    </Sidebar>
  );
}
