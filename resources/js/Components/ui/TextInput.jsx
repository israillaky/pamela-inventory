import React from "react";

const TextInput = React.forwardRef(function TextInput(
  {
    value,
    onChange,
    type = "text",
    placeholder = "",
    disabled = false,
    className = "",
    ...props
  },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
         rounded-lg border border-gpt-300 px-3 py-2 text-sm
        bg-white text-gpt-900
        dark:bg-gpt-800 dark:text-white dark:border-gpt-700
        focus:outline-none focus:ring-2 focus:ring-gpt-800
        disabled:opacity-60 disabled:cursor-not-allowed
        dark:placeholder-gpt-300
        ${className}
      `}
      {...props}
    />
  );
});

export default TextInput;
