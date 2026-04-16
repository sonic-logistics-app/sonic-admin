/**
 * SearchBar Component
 * Compliant with design specification
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

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
          ".search-bar input",
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
    <div className={`search-bar ${className}`}>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full"
        />
        {showClearButton && localValue && (
          <InputIcon
            className="pi pi-times cursor-pointer"
            onClick={handleClear}
          />
        )}
      </IconField>

      {/* Keyboard shortcut hint */}
      <div className="text-xs text-500 mt-1">
        Press {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K to focus
      </div>
    </div>
  );
}
