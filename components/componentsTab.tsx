import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { componentsData } from "@/data/sidebar-data"

export function ComponentsTab() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>UI Components</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {componentsData.map((component) => (
            <SidebarMenuItem key={component.id}>
              <SidebarMenuButton>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{component.name}</span>
                  <span className="text-xs text-muted-foreground">{component.category}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
