import React from "react";
import { router } from "@inertiajs/react";

export default function Table({
    columns = [],
    rows = [],
    actions = null,
    pagination = null,
}) {
    return (
        <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-sm table">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className="border px-2 py-2">
                                {col.label}
                            </th>
                        ))}

                        {actions && (
                            <th className="border px-2 py-2 text-center">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (actions ? 1 : 0)}
                                className="border px-2 py-4 text-center text-gray-500"
                            >
                                No records found.
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, i) => (
                                    <td key={i} className="border px-2 py-2">
                                        {typeof col.render === "function"
                                            ? col.render(row)
                                            : row[col.key]}
                                    </td>
                                ))}

                                {actions && (
                                    <td className="border px-2 py-2 text-center space-x-2">
                                        {actions(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* PAGINATION */}
            {pagination?.links && (
                <div className="p-2 flex flex-wrap gap-1">
                    {pagination.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => {
                                if (link.url) router.get(link.url, {}, { preserveState: true });
                            }}
                            className={
                                "px-3 py-1 text-sm border rounded " +
                                (link.active
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100") +
                                (!link.url ? " opacity-50 cursor-default" : "")
                            }
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
