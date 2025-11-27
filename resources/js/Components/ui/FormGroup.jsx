import React from "react";

export default function FormGroup({ label, error, children, className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gpt-200">
          {label}
        </label>
      )}

      {children}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
