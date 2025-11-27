import React from "react";
import { Link, usePage } from "@inertiajs/react";

const nav = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Brands", href: "/brands" },
  { name: "Categories", href: "/categories" },
  { name: "Products", href: "/products" },
  { name: "Stock In", href: "/stock-in" },
  { name: "Stock Out", href: "/stock-out" },
  { name: "Reports", href: "/reports" },
];

export default function Sidebar({ open, onClose }) {
  const { url } = usePage();

  return (
    <>
      {/* Overlay (mobile) */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white border-r border-gray-100
        transform transition lg:trangpt-x-0 lg:z-auto
        ${open ? "trangpt-x-0" : "-trangpt-x-full"}`}
      >
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <div className="font-bold text-lg tracking-wide">
            pamela-inventory
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {nav.map((item) => {
            const active = url.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition
                ${active
                  ? "bg-gpt-900 text-white"
                  : "text-gpt-700 hover:bg-gpt-100"}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
