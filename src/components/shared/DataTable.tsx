/**
 * DataTable Component
 * Compliant with UI Replication Guide Pattern 4
 */

"use client";

import React, { useState } from "react";
import StatusBadge from "./StatusBadge";

interface TableColumn<T = any> {
  field: string;
  header: string;
  sortable?: boolean;
  body?: (rowData: T) => React.ReactNode;
  width?: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface SelectionConfig<T = unknown> {
  selectedKeys: Set<string | number>;
  onChange: (keys: Set<string | number>) => void;
  getKey: (row: T) => string | number;
  /** Rows that cannot be selected (for example already verified) show a disabled checkbox. */
  isSelectable?: (row: T) => boolean;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRowClick?: (rowData: T) => void;
  emptyMessage?: string;
  className?: string;
  tableMaxHeight?: string;
  /** Adds a checkbox column. Omit it and the table behaves exactly as before. */
  selection?: SelectionConfig<T>;
}

/**
 * Reusable DataTable with desktop table view and mobile card fallback
 */
export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  onPaginationChange,
  onRowClick,
  emptyMessage = "No data found",
  className = "",
  tableMaxHeight = "calc(100vh - 300px)",
  selection,
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);

  // Row selection (only when the page asks for it)
  const selectableRows = selection ? data.filter((row) => selection.isSelectable?.(row) ?? true) : [];
  const selectedOnPage = selection ? selectableRows.filter((row) => selection.selectedKeys.has(selection.getKey(row))).length : 0;
  const allSelected = selectableRows.length > 0 && selectedOnPage === selectableRows.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  const toggleRow = (row: T) => {
    if (!selection) return;
    const next = new Set(selection.selectedKeys);
    const key = selection.getKey(row);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selection.onChange(next);
  };

  const toggleAll = () => {
    if (!selection) return;
    const next = new Set(selection.selectedKeys);
    selectableRows.forEach((row) => {
      const key = selection.getKey(row);
      if (allSelected) next.delete(key);
      else next.add(key);
    });
    selection.onChange(next);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : sortOrder === "desc" ? undefined : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (onPaginationChange && pagination) {
      onPaginationChange({
        ...pagination,
        page: newPage,
      });
    }
  };

  const handleRowsPerPageChange = (newLimit: number) => {
    if (onPaginationChange && pagination) {
      onPaginationChange({
        ...pagination,
        page: 1,
        limit: newLimit,
      });
    }
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className={`rounded-2xl border border-[#E1E4EA] bg-white overflow-hidden ${className}`}>
        <div className="p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 flex items-center gap-6 px-6 border-b border-[#E1E4EA]">
              {columns.map((col, j) => (
                <div
                  key={j}
                  className="h-4 bg-gray-200 rounded-md animate-pulse"
                  style={{ width: col.width || "100px" }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile card view
  const renderMobileCard = (rowData: T, index: number) => (
    <div
      key={index}
      className={`rounded-[12px] border border-[#E1E4EA] bg-white p-4 mb-3 ${
        onRowClick ? "cursor-pointer hover:border-[#2563EB] transition-colors" : ""
      }`}
      onClick={() => onRowClick?.(rowData)}
    >
      {selection && (
        <label
          className="flex items-center gap-2 mb-3 text-[13px] font-semibold text-[#525866]"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#2563EB]"
            checked={selection.selectedKeys.has(selection.getKey(rowData))}
            disabled={!(selection.isSelectable?.(rowData) ?? true)}
            onChange={() => toggleRow(rowData)}
          />
          Select
        </label>
      )}
      {columns.map((col) => (
        <div key={String(col.field)} className="flex justify-between items-center mb-3 last:mb-0">
          <span className="text-[13px] font-semibold text-[#525866]">{col.header}:</span>
          <span className="text-[13px] text-[#111827]">
            {col.body ? col.body(rowData) : String(rowData[col.field] || "")}
          </span>
        </div>
      ))}
    </div>
  );

  // Calculate pagination values
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;
  const startEntry = pagination ? (pagination.page - 1) * pagination.limit + 1 : 1;
  const endEntry = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : data.length;

  return (
    <div className={`w-full flex flex-col min-h-0 flex-1 ${className}`}>
      {/* Desktop Table View */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 rounded-2xl border border-[#E1E4EA] bg-white overflow-hidden w-full">
        <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 w-full">
          <table className="w-full">
            {/* Header — sticky */}
            <thead className="bg-white border-b border-[#E1E4EA] sticky top-0 z-10">
              <tr>
                {selection && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      aria-label="Select all on this page"
                      className="h-4 w-4 accent-[#2563EB]"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      disabled={selectableRows.length === 0}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={String(col.field)}
                    className={`px-6 py-3 text-[13px] font-semibold text-[#111827] text-left ${
                      col.sortable ? "cursor-pointer hover:bg-gray-50" : ""
                    }`}
                    onClick={() => col.sortable && handleSort(String(col.field))}
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable && sortField === col.field && (
                        <span className="text-[#2563EB]">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selection ? 1 : 0)}
                    className="px-6 py-8 text-center text-[13px] text-[#525866]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-[#E1E4EA] hover:bg-gray-50 ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selection && (
                      <td className="px-4 py-4 w-12" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label="Select row"
                          className="h-4 w-4 accent-[#2563EB]"
                          checked={selection.selectedKeys.has(selection.getKey(row))}
                          disabled={!(selection.isSelectable?.(row) ?? true)}
                          onChange={() => toggleRow(row)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={String(col.field)}
                        className="px-6 py-4 text-[13px] text-[#111827]"
                      >
                        {col.body ? col.body(row) : String(row[col.field] || "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-[#E1E4EA] bg-white p-8 text-center">
            <p className="text-[13px] text-[#525866]">{emptyMessage}</p>
          </div>
        ) : (
          data.map((item, index) => renderMobileCard(item, index))
        )}
      </div>

      {/* Pagination */}
      {pagination && onPaginationChange && pagination.total > 0 && (
        <div className="mt-4 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Pagination Info */}
          <div className="text-[13px] text-[#525866]">
            Showing {startEntry} to {endEntry} of {pagination.total} entries
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="h-10 px-4 rounded-lg border border-[#E1E4EA] text-[13px] font-semibold text-[#111827] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-10 w-10 rounded-lg text-[13px] font-semibold transition-colors ${
                      pagination.page === pageNum
                        ? "bg-[#2563EB] text-white"
                        : "border border-[#E1E4EA] text-[#111827] hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="h-10 px-4 rounded-lg border border-[#E1E4EA] text-[13px] font-semibold text-[#111827] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>

            {/* Rows Per Page */}
            <select
              value={pagination.limit}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="h-10 px-3 rounded-lg border border-[#E1E4EA] text-[13px] text-[#111827] bg-white hover:bg-gray-50 cursor-pointer focus:outline-none focus:border-[#2563EB]"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
