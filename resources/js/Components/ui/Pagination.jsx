import React from "react";
import { Link } from "@inertiajs/react";

export default function Pagination({ links = [] }) {
  if (!links.length) return null;

  return (
    <div className="mt-4 flex gap-2 flex-wrap">
      {links.map((l, i) => (
        <Link
          key={i}
          href={l.url || "#"}
          className={`
            px-3 py-1 rounded border text-sm
            border-gpt-300 dark:border-gpt-700
            ${l.active ? "bg-gpt-900 text-white dark:bg-white dark:text-gpt-900" : ""}
            ${!l.url ? "opacity-50 pointer-events-none" : ""}
          `}
          dangerouslySetInnerHTML={{ __html: l.label }}
        />
      ))}
    </div>
  );
}
