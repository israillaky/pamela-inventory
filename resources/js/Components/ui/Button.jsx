import React from "react";
import clsx from "clsx";

// Tailwind class presets per variant
const variants = {
  primary:
    "bg-gpt-900 text-white hover:bg-gpt-800 dark:bg-white dark:text-gpt-900 dark:hover:bg-gpt-100",
  secondary:
    "bg-white text-gpt-800 border border-gpt-300 hover:bg-gpt-100 dark:bg-gpt-800 dark:text-gpt-200 dark:border-gpt-700 dark:hover:bg-gpt-700 dark:hover:text-white",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
  outline:
    "border border-gpt-300 text-gray-700 hover:bg-gpt-100 dark:border-gpt-700 dark:text-gpt-200 dark:hover:bg-gpt-800 dark:hover:text-white",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        "px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
