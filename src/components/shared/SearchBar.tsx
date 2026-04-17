/**
 * SearchBar Component
 * Compliant with UI Replication Guide Pattern 3
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * SearchBar with debounced input and keyboard shortcuts
 */
export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  showClearButton = true,
  className = "",
  disabled = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    },
    [],
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          ".search-bar-input",
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Search Icon */}
      <i className="pi pi-search absolute left-3 w-4 h-4 text-[#525866] pointer-events-none" />

      {/* Input Field */}
      <input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className="search-bar-input h-[38px] pl-10 pr-10 py-2 border border-[#E1E4EA] rounded-lg bg-white text-[13px] text-[#111827] placeholder:text-black/30 focus:outline-none focus:border-[#2563EB] flex-1 max-w-[585px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Clear Button */}
      {showClearButton && localValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 w-4 h-4 text-[#525866] hover:text-[#DC2626] transition-colors"
          aria-label="Clear search"
        >
          <i className="pi pi-times text-xs" />
        </button>
      )}
    </div>
  );
}
