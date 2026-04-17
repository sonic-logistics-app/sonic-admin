/**
 * Input Components
 * Compliant with UI Replication Guide - Input Field Styling
 */

"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  iconPosition?: "left" | "right";
}

/**
 * Input field with consistent styling
 */
export function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}: InputProps) {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      {label && (
        <label className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
          {label}
          {props.required && <span className="text-[#DC2626] ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === "left" && (
          <i
            className={`${icon} absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525866] pointer-events-none`}
          />
        )}

        {/* Input Field */}
        <input
          className={`h-[38px] ${icon && iconPosition === "left" ? "pl-10" : "pl-3"} ${
            icon && iconPosition === "right" ? "pr-10" : "pr-3"
          } py-2 border ${
            hasError ? "border-[#DC2626]" : "border-[#E1E4EA]"
          } rounded-lg bg-white text-[13px] text-[#111827] placeholder:text-black/30 focus:outline-none ${
            hasError ? "focus:border-[#DC2626]" : "focus:border-[#2563EB]"
          } transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 w-full ${className}`}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === "right" && (
          <i
            className={`${icon} absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525866] pointer-events-none`}
          />
        )}
      </div>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <p
          className={`text-[11px] ${
            hasError ? "text-[#DC2626]" : "text-[#525866]"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Textarea field with consistent styling
 */
export function Textarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: TextareaProps) {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      {label && (
        <label className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
          {label}
          {props.required && <span className="text-[#DC2626] ml-1">*</span>}
        </label>
      )}

      {/* Textarea Field */}
      <textarea
        className={`min-h-[100px] px-3 py-2 border ${
          hasError ? "border-[#DC2626]" : "border-[#E1E4EA]"
        } rounded-lg bg-white text-[13px] text-[#111827] placeholder:text-black/30 focus:outline-none ${
          hasError ? "focus:border-[#DC2626]" : "focus:border-[#2563EB]"
        } transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 resize-y w-full ${className}`}
        {...props}
      />

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <p
          className={`text-[11px] ${
            hasError ? "text-[#DC2626]" : "text-[#525866]"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
}

/**
 * Select field with consistent styling
 */
export function Select({
  label,
  error,
  helperText,
  options,
  className = "",
  ...props
}: SelectProps) {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      {label && (
        <label className="text-[11px] font-medium text-[#525866] uppercase tracking-wider">
          {label}
          {props.required && <span className="text-[#DC2626] ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        {/* Select Field */}
        <select
          className={`h-[38px] px-3 py-2 border ${
            hasError ? "border-[#DC2626]" : "border-[#E1E4EA]"
          } rounded-lg bg-white text-[13px] text-[#111827] focus:outline-none ${
            hasError ? "focus:border-[#DC2626]" : "focus:border-[#2563EB]"
          } transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 appearance-none cursor-pointer w-full pr-10 ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <i className="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#525866] pointer-events-none text-xs" />
      </div>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <p
          className={`text-[11px] ${
            hasError ? "text-[#DC2626]" : "text-[#525866]"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * Checkbox with consistent styling
 */
export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className={`w-4 h-4 border border-[#E1E4EA] rounded text-[#2563EB] focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      <span className="text-[13px] text-[#111827]">{label}</span>
    </label>
  );
}

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/**
 * Radio button with consistent styling
 */
export function Radio({ label, className = "", ...props }: RadioProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        className={`w-4 h-4 border border-[#E1E4EA] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      <span className="text-[13px] text-[#111827]">{label}</span>
    </label>
  );
}
