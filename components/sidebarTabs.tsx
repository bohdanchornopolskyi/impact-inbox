import { Layers, Component, FolderOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayersTab } from "@/components/LayersTab";
import { ComponentsTab } from "@/components/componentsTab";
import { AssetsTab } from "@/components/assetsTab";

export function SidebarTabs() {
  return (
    <Tabs defaultValue="layers" className="w-full">
      <TabsList className="grid w-full grid-cols-3 gap-2 h-12 bg-sidebar-accent/50 p-2">
        <TabsTrigger
          value="layers"
          className="relative cursor-pointer hover:shadow flex items-center gap-2 data-[state=active]:bg-sidebar-accent"
        >
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="absolute inset-0 w-full h-full" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Layers</p>
            </TooltipContent>
          </Tooltip>
          <Layers className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger
          value="components"
          className="relative cursor-pointer hover:shadow flex items-center gap-2 data-[state=active]:bg-sidebar-accent"
        >
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="absolute inset-0 w-full h-full" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Components</p>
            </TooltipContent>
          </Tooltip>
          <Component className="h-4 w-4" />
          {/* <span className="hidden sm:inline">Components</span> */}
        </TabsTrigger>
        <TabsTrigger
          value="assets"
          className="relative cursor-pointer hover:shadow flex items-center gap-2 data-[state=active]:bg-sidebar-accent"
        >
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="absolute inset-0 w-full h-full" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Assets</p>
            </TooltipContent>
          </Tooltip>
          <FolderOpen className="h-4 w-4" />
          {/* <span className="hidden sm:inline">Assets</span> */}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="layers" className="mt-0">
        <LayersTab />
      </TabsContent>

      <TabsContent value="components" className="mt-0">
        <ComponentsTab />
      </TabsContent>

      <TabsContent value="assets" className="mt-0">
        <AssetsTab />
      </TabsContent>
    </Tabs>
  );
}
