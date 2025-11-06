import { Search, Bell } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AppHeader({ searchQuery, onSearchChange }: AppHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Right Section - Notifications and User */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative shrink-0">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="text-sm">CP</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div>Claims Processor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
