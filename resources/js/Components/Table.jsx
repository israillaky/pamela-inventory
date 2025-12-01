import React from "react";
import { router } from "@inertiajs/react";

export default function Table({
    columns = [],
    rows = [],
    actions = null,
    pagination = null,
}) {
    return (
        <div className="bg-white shadow-sm sm:rounded-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 border-b"
                                >
                                    {col.label}
                                </th>
                            ))}

                            {actions && (
                                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 border-b text-right">
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
                                    className="px-3 py-6 text-center text-gray-500 text-sm"
                                >
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-b last:border-0 odd:bg-white even:bg-gray-50 hover:bg-gray-100"
                                >
                                    {columns.map((col, i) => (
                                        <td
                                            key={i}
                                            className="px-3 py-2 align-top text-sm text-gray-800"
                                        >
                                            {typeof col.render === "function"
                                                ? col.render(row)
                                                : row[col.key]}
                                        </td>
                                    ))}

                                    {actions && (
                                        <td className="px-3 py-2 align-top text-right space-x-1">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            {pagination?.links && pagination.links.length > 0 && (
                <div className="px-3 py-2 border-t flex flex-wrap items-center justify-between gap-2">
                    {/* left side: summary (optional) */}
                    {pagination.total && (
                        <div className="text-xs text-gray-500">
                            Showing{" "}
                            <span className="font-medium">
                                {pagination.from ?? 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                                {pagination.to ?? 0}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                                {pagination.total ?? 0}
                            </span>{" "}
                            results
                        </div>
                    )}

                    {/* right side: links */}
                    <div className="flex flex-wrap gap-1 ml-auto">
                        {pagination.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) {
                                        router.get(link.url, {}, { preserveState: true });
                                    }
                                }}
                                className={
                                    "px-2.5 py-1 text-xs border rounded " +
                                    (link.active
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 hover:bg-gray-100") +
                                    (!link.url
                                        ? " opacity-50 cursor-default"
                                        : "")
                                }
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
