import React from "react";

export default function TextInput({
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  className = "",
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full rounded-lg border border-gpt-300 px-3 py-2 text-sm
        bg-white text-gpt-900
        dark:bg-gpt-900 dark:text-gpt-100 dark:border-gpt-700
        focus:outline-none focus:ring-2 focus:ring-gpt-900
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );
}
