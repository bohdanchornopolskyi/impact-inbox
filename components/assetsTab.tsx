import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { assetsData } from "@/data/sidebar-data"

export function AssetsTab() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Project Assets</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {assetsData.map((asset) => (
            <SidebarMenuItem key={asset.id}>
              <SidebarMenuButton>
                <div className="flex flex-col items-start w-full">
                  <span className="font-medium truncate w-full">{asset.name}</span>
                  <div className="flex justify-between w-full text-xs text-muted-foreground">
                    <span>{asset.type}</span>
                    <span>{asset.size}</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
