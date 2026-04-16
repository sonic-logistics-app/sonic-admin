/**
 * DataTable Component
 * Compliant with design specification
 */

"use client";

import React, { useState, useMemo } from "react";
import { DataTable as PrimeDataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import {
  TableColumn,
  TableFilters,
  PaginationState,
} from "../../lib/types/admin";

interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  filters?: TableFilters;
  onFiltersChange?: (filters: TableFilters) => void;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRowClick?: (rowData: T) => void;
  emptyMessage?: string;
  className?: string;
  showGridlines?: boolean;
  stripedRows?: boolean;
  size?: "small" | "normal" | "large";
}

/**
 * Reusable DataTable component with sorting, pagination, and mobile responsiveness
 */
export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  filters = {},
  onFiltersChange,
  pagination,
  onPaginationChange,
  onRowClick,
  emptyMessage = "No data found",
  className = "",
  showGridlines = true,
  stripedRows = true,
  size = "normal",
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<1 | -1 | undefined>(undefined);

  // Handle sorting
  const handleSort = (e: any) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
  };

  // Handle pagination
  const handlePageChange = (e: any) => {
    if (onPaginationChange && pagination) {
      onPaginationChange({
        ...pagination,
        page: e.page + 1, // PrimeReact uses 0-based, we use 1-based
        limit: e.rows,
      });
    }
  };

  // Handle row click
  const handleRowClick = (e: any) => {
    if (onRowClick) {
      onRowClick(e.data);
    }
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className={`data-table-loading ${className}`}>
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex mb-3">
              {columns.map((col, j) => (
                <Skeleton
                  key={j}
                  width={col.width || "100%"}
                  height="2rem"
                  className="mr-2"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile card view for small screens
  const renderMobileCard = (rowData: T) => (
    <div className="mobile-card p-3 border-1 border-200 border-round mb-2">
      {columns.map((col) => (
        <div
          key={String(col.field)}
          className="flex justify-content-between mb-2"
        >
          <span className="font-medium text-700">{col.header}:</span>
          <span>
            {col.body ? col.body(rowData) : String(rowData[col.field] || "")}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`data-table-container ${className}`}>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <PrimeDataTable
          value={data}
          className="p-datatable-sm"
          showGridlines={showGridlines}
          stripedRows={stripedRows}
          size={size}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onRowClick={handleRowClick}
          selectionMode={onRowClick ? "single" : undefined}
          emptyMessage={emptyMessage}
          paginator={false} // We'll use our own paginator
        >
          {columns.map((col) => (
            <Column
              key={String(col.field)}
              field={String(col.field)}
              header={col.header}
              sortable={col.sortable}
              body={col.body}
              style={{ width: col.width }}
            />
          ))}
        </PrimeDataTable>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {data.length === 0 ? (
          <div className="text-center py-4 text-500">{emptyMessage}</div>
        ) : (
          data.map((item, index) => (
            <div
              key={index}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? "cursor-pointer" : ""}
            >
              {renderMobileCard(item)}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && onPaginationChange && (
        <div className="mt-3">
          <Paginator
            first={(pagination.page - 1) * pagination.limit}
            rows={pagination.limit}
            totalRecords={pagination.total}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={handlePageChange}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          />
          <div className="text-sm text-600 mt-2 text-center">
            Showing{" "}
            {Math.min(
              (pagination.page - 1) * pagination.limit + 1,
              pagination.total,
            )}{" "}
            to {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            of {pagination.total} entries
          </div>
        </div>
      )}
    </div>
  );
}
