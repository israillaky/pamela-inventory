import React from "react";
import { Link } from "@inertiajs/react";

export default function Pagination({ meta = null, links: linksProp = [] }) {
  // If a full paginator (Laravel LengthAwarePaginator) is passed:
  const links = meta?.links || linksProp || [];
  if (!links.length) return null;

  const from = meta?.from;
  const to = meta?.to;
  const total = meta?.total;

  return (
    <div className="mb-4 flex flex-col items-center justify-between gap-3  rounded-b-lg border border-t-1 border-gray-100 bg-white px-4 py-2 text-sm
                    dark:border-gray-800 dark:bg-gpt-900 md:flex-row">
      {/* Left: summary */}
      {from != null && to != null && total != null && (
        <div className="text-md text-gray-600 dark:text-gray-300">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {from}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {to}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {total}
          </span>
        </div>
      )}

      {/* Right: page buttons */}
      <div className="inline-flex items-center gap-1 py-2">
        {links.map((l, i) => {
          const label = l.label;
          const isPrev = /Previous/i.test(label);
          const isNext = /Next/i.test(label);
          const isDots = label === "...";

          let content = label;

          if (isPrev) content = "Previous";
          if (isNext) content = "Next";

          return (
            <Link
              key={i}
              href={l.url || "#"}
              className={`
                min-w-[2rem] rounded-md px-3 py-2 text-center text-md font-medium
                ${
                  l.active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gpt-800"
                }
                ${!l.url ? "opacity-40 pointer-events-none" : ""}
                ${isDots ? "cursor-default hover:bg-transparent" : ""}
              `}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          );
        })}
      </div>
    </div>
  );
}
