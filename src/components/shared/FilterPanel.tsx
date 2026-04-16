/**
 * FilterPanel Component
 * Compliant with design specification
 */

"use client";

import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";
import { FilterOption, TableFilters } from "../../lib/types/admin";

interface FilterPanelProps {
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  filterOptions?: {
    status?: FilterOption[];
    type?: FilterOption[];
    priority?: FilterOption[];
    category?: FilterOption[];
  };
  showDateRange?: boolean;
  showSearch?: boolean;
  className?: string;
}

/**
 * FilterPanel with multiple filter types and mobile drawer
 */
export default function FilterPanel({
  filters,
  onFiltersChange,
  filterOptions = {},
  showDateRange = false,
  showSearch = true,
  className = "",
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  // Reset all filters
  const handleReset = () => {
    onFiltersChange({});
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0),
  ).length;

  const FilterContent = () => (
    <div className="filter-content space-y-4">
      {/* Search */}
      {showSearch && (
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <InputText
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search..."
            className="w-full"
          />
        </div>
      )}

      {/* Status Filter */}
      {filterOptions.status && (
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Dropdown
            value={filters.status}
            options={filterOptions.status}
            onChange={(e) => handleFilterChange("status", e.value)}
            placeholder="Select status"
            className="w-full"
            showClear
          />
        </div>
      )}

      {/* Type Filter */}
      {filterOptions.type && (
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <MultiSelect
            value={filters.type || []}
            options={filterOptions.type}
            onChange={(e) => handleFilterChange("type", e.value)}
            placeholder="Select types"
            className="w-full"
            showClear
          />
        </div>
      )}

      {/* Priority Filter */}
      {filterOptions.priority && (
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <Dropdown
            value={filters.priority}
            options={filterOptions.priority}
            onChange={(e) => handleFilterChange("priority", e.value)}
            placeholder="Select priority"
            className="w-full"
            showClear
          />
        </div>
      )}

      {/* Category Filter */}
      {filterOptions.category && (
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Dropdown
            value={filters.category}
            options={filterOptions.category}
            onChange={(e) => handleFilterChange("category", e.value)}
            placeholder="Select category"
            className="w-full"
            showClear
          />
        </div>
      )}

      {/* Date Range Filter */}
      {showDateRange && (
        <div>
          <label className="block text-sm font-medium mb-2">Date Range</label>
          <div className="flex gap-2">
            <Calendar
              value={filters.dateRange?.start}
              onChange={(e) =>
                handleFilterChange("dateRange", {
                  ...filters.dateRange,
                  start: e.value as Date,
                })
              }
              placeholder="Start date"
              className="flex-1"
              showIcon
            />
            <Calendar
              value={filters.dateRange?.end}
              onChange={(e) =>
                handleFilterChange("dateRange", {
                  ...filters.dateRange,
                  end: e.value as Date,
                })
              }
              placeholder="End date"
              className="flex-1"
              showIcon
            />
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="pt-4 border-t">
        <Button
          label="Reset All Filters"
          icon="pi pi-refresh"
          onClick={handleReset}
          className="w-full p-button-outlined p-button-secondary"
          disabled={activeFilterCount === 0}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className={`hidden md:block ${className}`}>
        <Card className="filter-panel">
          <template slot="title">
            <div className="flex items-center justify-between">
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </template>
          <FilterContent />
        </Card>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <Button
          label={`Filters ${activeFilterCount > 0 ? `(${activeFilterCount})` : ""}`}
          icon="pi pi-filter"
          onClick={() => setIsOpen(true)}
          className="w-full mb-4"
        />
      </div>

      {/* Mobile Filter Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  icon="pi pi-times"
                  onClick={() => setIsOpen(false)}
                  className="p-button-text p-button-rounded"
                />
              </div>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
