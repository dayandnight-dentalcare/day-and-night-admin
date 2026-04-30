import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ToolbarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
}

export function Toolbar({
  title,
  description,
  actions,
  onSearch,
  searchPlaceholder = "Search...",
  filters,
}: ToolbarProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-9 w-full sm:w-64 bg-white border-slate-200"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        
        {filters && <div className="flex items-center space-x-2">{filters}</div>}
        
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </div>
  );
}
