import React from "react";

export default function SelectInput({
  value,
  onChange,
  disabled = false,
  className = "",
  children,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full rounded-lg border border-gpt-300 px-3 py-2 text-sm
        bg-white text-gpt-900
        dark:bg-gpt-800 dark:text-white dark:border-gpt-700
        focus:outline-none focus:ring-2 focus:ring-gpt-900
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </select>
  );
}
