import React from "react";
import { Link, usePage } from "@inertiajs/react";

export default function Topbar({ onMenuClick }) {
  const { auth } = usePage().props;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 flex items-center px-4 md:px-6">
      <button
        className="lg:hidden mr-3 p-2 rounded-md hover:bg-gpt-100"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        ☰
      </button>

      <div className="flex-1 font-semibold">Dashboard</div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-gpt-600">
          {auth?.user?.name}
        </div>

        <Link
          href="/logout"
          method="post"
          as="button"
          className="text-sm px-3 py-1.5 rounded-md bg-gpt-900 text-white hover:bg-gpt-800"
        >
          Logout
        </Link>
      </div>
    </header>
  );
}
