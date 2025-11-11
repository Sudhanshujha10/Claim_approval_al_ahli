import { Search, Bell, User } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface HeaderProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ activeFilter, onFilterChange, searchQuery, onSearchChange }: HeaderProps) {
  const filters = ["All", "Pending", "Approved", "Rejected"];

  return (
    <div className="border-b bg-white overflow-x-hidden w-full">
      <div className="flex items-center justify-between gap-4 px-6 py-4 max-w-full min-w-0">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg">
            <span>RC</span>
          </div>
          <div>
            <h1 className="text-blue-600">RapidClaims</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Claim ID, Patient, Doctor"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 shrink-0 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Right Section - Notifications and User */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
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
