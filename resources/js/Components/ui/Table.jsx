import React from "react";

/**
 * Reusable Table
 *
 * props:
 * - columns: [{ key, label, align?, className?, render? }]
 *      key: string (field name)
 *      label: string (header title)
 *      align: "left" | "center" | "right" (default left)
 *      render: (row) => ReactNode (optional custom cell)
 *
 * - rows: array of objects
 * - emptyText: string
 * - rowKey: string | (row)=>string (default "id")
 */
export default function Table({
  columns = [],
  rows = [],
  emptyText = "No records found.",
  rowKey = "id",
  footer = null,
}) {

  const getRowKey = (row, i) =>
    typeof rowKey === "function" ? rowKey(row) : row[rowKey] ?? i;

  const headAlignClass = (align) =>
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";

  const cellAlignClass = headAlignClass;

  return (
    <div className="overflow-x-auto rounded-t-lg border border-b-1 border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900">
      <table className="min-w-full text-sm">
        <thead className="bg-gpt-50 dark:bg-gpt-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2 font-semibold text-gray-700 dark:text-gpt-200 ${headAlignClass(
                  col.align
                )} ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              className="border-t border-gray-100 dark:border-gpt-700 odd:bg-gpt-50 even:bg-white dark:odd:bg-gpt-700 dark:even:bg-gpt-900/80"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-2 text-gpt-900 dark:text-gpt-100 ${cellAlignClass(
                    col.align
                  )} ${col.tdClassName || ""}`}
                >
                  {col.render ? col.render(row) : row[col.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}

          {!rows.length && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-gpt-500 dark:text-gpt-400"
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
        {/* 👇 NEW: tfoot support */}
        {footer && (
          <tfoot className="bg-gray-50 dark:bg-gpt-800/80 border-t border-gpt-200 dark:border-gpt-700">
            {footer}
          </tfoot>
        )}
      </table>
    </div>
  );
}
