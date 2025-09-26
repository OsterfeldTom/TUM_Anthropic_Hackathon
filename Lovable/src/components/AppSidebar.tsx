import { NavLink, useLocation } from "react-router-dom";
import { Home, Upload, FileBarChart, BarChart3, Settings, Building2, ChevronDown, MessageCircle, PieChart } from "lucide-react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Overview",
    url: "/overview",
    icon: PieChart,
  },
  {
    title: "Upload",
    url: "/upload", 
    icon: Upload,
  },
  {
    title: "Applications",
    url: "/applications",
    icon: Building2,
  },
  {
    title: "Potentials",
    url: "/potentials",
    icon: FileBarChart,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Preferences",
    url: "/preferences",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [selectedChallenge, setSelectedChallenge] = useState("hackathon");

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
  };

  return (
    <Sidebar className="border-sidebar-border">
      <SidebarContent>
        {/* Header */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {state !== "collapsed" && (
                <div>
                  <h2 className="text-base font-bold text-sidebar-foreground">Analysa</h2>
                  <p className="text-xs text-sidebar-foreground/70">Research Investment Analyst</p>
                </div>
              )}
            </div>
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Challenge Selector */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            {state !== "collapsed" ? "Challenge" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {state !== "collapsed" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-9 text-sm">
                    <span className="capitalize">{selectedChallenge}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setSelectedChallenge("hackathon")}>
                    Hackathon
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    TECH METAL TRANSFORMATION
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    ANTI-DRONE RESPONSE
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    FULLY AUTONOMOUS FLIGHT
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    COMPOSITE LEARNING
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="px-2">
                <div className="h-9 w-9 rounded border flex items-center justify-center bg-muted">
                  <span className="text-xs font-medium">H</span>
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            {state !== "collapsed" ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClass(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {state !== "collapsed" && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}