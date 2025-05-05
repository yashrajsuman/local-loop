"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Search, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { FilterOptions } from "@/lib/types";
import { categories, eventTypes, dateRangeOptions } from "@/lib/mock-data";

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  hideTypeFilter?: boolean;
}

export function FilterBar({
  filters,
  onFilterChange,
  hideTypeFilter = false,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, searchTerm });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      category: value === "all" ? null : (value as any),
    });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value === "all" ? null : (value as any),
    });
  };

  const handleDateRangeChange = (value: string) => {
    if (value === "custom") {
      setShowCustomDateRange(true);
      return;
    }

    setShowCustomDateRange(false);

    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (value) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "tomorrow":
        start.setDate(now.getDate() + 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() + 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case "thisWeekend":
        const daysUntilSaturday = (6 - now.getDay()) % 7;
        start.setDate(now.getDate() + daysUntilSaturday);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.get + daysUntilSaturday);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "nextWeek":
        const daysUntilNextMonday = (8 - now.getDay()) % 7;
        start.setDate(now.getDate() + daysUntilNextMonday);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = null as any;
        end = null as any;
    }

    onFilterChange({
      ...filters,
      dateRange: { start, end },
    });
  };

  const handleCustomDateChange = (
    field: "start" | "end",
    date: Date | undefined
  ) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date,
      } as any,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setShowCustomDateRange(false);
    onFilterChange({
      category: null,
      type: filters.type,
      dateRange: null,
      searchTerm: "",
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.dateRange?.start ||
    filters.dateRange?.end ||
    filters.searchTerm;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        {/* Category filter */}
        <Select
          value={filters.category || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type filter - only show if not hidden */}
        {!hideTypeFilter && (
          <Select
            value={filters.type || "all"}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date range filter */}
        <Select
          value={showCustomDateRange ? "custom" : "all"}
          onValueChange={handleDateRangeChange}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Date</SelectItem>
            {dateRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Custom date range pickers */}
      {showCustomDateRange && (
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="grid gap-2">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Start Date:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !filters.dateRange?.start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.start ? (
                      format(filters.dateRange.start, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.start || undefined}
                    onSelect={(date) => handleCustomDateChange("start", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">End Date:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !filters.dateRange?.end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.end ? (
                      format(filters.dateRange.end, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.end || undefined}
                    onSelect={(date) => handleCustomDateChange("end", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
