import React from "react";

export default function ResourceIndexLayout({
    title,
    flash,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    children,
}) {
    return (
        <div className="p-6 space-y-6">
            {title && (
                <h1 className="text-2xl font-bold mb-2">
                    {title}
                </h1>
            )}

            {flash?.success && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded">
                    {flash.success}
                </div>
            )}

            {typeof onSearchChange === "function" && (
                <div className="max-w-md">
                    <input
                        type="text"
                        className="border rounded px-3 py-1 w-full"
                        placeholder={searchPlaceholder}
                        value={searchValue ?? ""}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            )}

            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}
