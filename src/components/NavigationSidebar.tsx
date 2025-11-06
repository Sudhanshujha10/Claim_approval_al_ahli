import { useState } from "react";
import { Button } from "./ui/button";
import { Home, BarChart2, Mail, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./ui/utils";

interface NavigationSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function NavigationSidebar({ currentPage, onNavigate }: NavigationSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", route: "dashboard" },
    { icon: BarChart2, label: "Reports", route: "reports" },
    { icon: Mail, label: "Email Center", route: "emails" },
    { icon: Settings, label: "Admin Config", route: "admin" },
  ];

  return (
    <div
      className={cn(
        "bg-white border-r h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg">
            <span>RC</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-blue-600">RapidClaims</h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.route;
          
          return (
            <Button
              key={item.route}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                collapsed && "justify-center px-2"
              )}
              onClick={() => onNavigate(item.route)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            collapsed && "justify-center px-2"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
