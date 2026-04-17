/**
 * Button Component
 * Compliant with UI Replication Guide - Button Styling
 */

"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Button with pill shape, semantic variants, and proper sizing
 */
export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant styles
  const variantStyles = {
    primary:
      "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB]",
    secondary:
      "bg-white border border-[#E1E4EA] text-[#111827] hover:bg-gray-50 focus:ring-[#2563EB]",
    outline:
      "bg-white border border-[#E1E4EA] text-[#525866] hover:bg-[#F9FAFB] focus:ring-[#2563EB]",
    danger:
      "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626]",
    success:
      "bg-[#059669] text-white hover:bg-[#047857] focus:ring-[#059669]",
    ghost:
      "bg-transparent text-[#2563EB] hover:bg-[#EFF6FF] focus:ring-[#2563EB]",
  };

  // Size styles
  const sizeStyles = {
    sm: "h-8 px-4 text-[12px] rounded-[50px]",
    md: "h-10 px-6 text-[13px] rounded-[50px]",
    lg: "h-[44px] px-8 text-[15px] rounded-[50px]",
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  // Combine all styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  return (
    <button
      className={buttonStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && <i className={icon} />}
          {children}
          {icon && iconPosition === "right" && <i className={icon} />}
        </>
      )}
    </button>
  );
}

/**
 * Icon Button - Square button with just an icon
 */
export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  className = "",
  ...props
}: Omit<ButtonProps, "children"> & { icon: string }) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB]",
    secondary:
      "bg-white border border-[#E1E4EA] text-[#111827] hover:bg-gray-50 focus:ring-[#2563EB]",
    danger:
      "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626]",
    ghost:
      "bg-transparent text-[#525866] hover:bg-gray-50 focus:ring-[#2563EB]",
    outline:
      "bg-white border border-[#E1E4EA] text-[#525866] hover:bg-[#F9FAFB] focus:ring-[#2563EB]",
    success:
      "bg-[#059669] text-white hover:bg-[#047857] focus:ring-[#059669]",
  };

  const sizeStyles = {
    sm: "w-8 h-8 text-[12px] rounded-lg",
    md: "w-10 h-10 text-[14px] rounded-lg",
    lg: "w-[44px] h-[44px] text-[16px] rounded-lg",
  };

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button className={buttonStyles} {...props}>
      <i className={icon} />
    </button>
  );
}
