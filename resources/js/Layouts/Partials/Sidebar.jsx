import { Link, usePage } from "@inertiajs/react";
import {
  Home,
  Package,
  Tag,
  Layers,
  BoxIcon,
  Boxes,
  FileChartColumn,
  Users,
  ScrollText,
  Settings,
} from "lucide-react";

const nav = [
  {
    name: "Dashboard",
    icon: Home,
    href: route("dashboard"),
    roles: ["admin", "staff", "warehouse_manager", "cashier", "warehouse_staff"],
  },
  {
    name: "Products",
    icon: Package,
    href: route("products.index"),
    roles: ["admin", "staff", "warehouse_manager"],
  },
  {
    name: "Brands",
    icon: Tag,
    href: route("brands.index"),
    roles: ["admin", "staff"],
  },
  {
    name: "Categories",
    icon: Layers,
    href: route("categories.index"),
    roles: ["admin", "staff"],
  },
  {
    name: "Stock In",
    icon: BoxIcon,
    href: route("stock-in.index"),
    roles: ["admin", "staff", "warehouse_manager"],
  },
  {
    name: "Stock Out",
    icon: Boxes,
    href: route("stock-out.index"),
    roles: ["admin", "staff", "warehouse_manager", "cashier", "warehouse_staff"],
  },
  {
    name: "Reports",
    icon: FileChartColumn,
    href: route("reports.index"),
    roles: ["admin", "staff"],
  },
  {
    name: "Users",
    icon: Users,
    href: route("users.index"),
    roles: ["admin"],
  },
  {
    name: "Audit Logs",
    icon: ScrollText,
    href: route("audit-logs.index"),
    roles: ["admin"],
  },
  {
    name: "Settings",
    icon: Settings,
    href: route("settings.index"),
    roles: ["admin"],
  },
];

export default function Sidebar({ collapsed = false }) {
  const { url, props } = usePage();
  const role = props?.auth?.user?.role || "staff";

  const visibleNav = nav.filter((item) => item.roles.includes(role));

  // On mobile:
  //   collapsed = true  → hidden (off-screen)
  //   collapsed = false → visible (overlay)
  //
  // On md+:
  //   collapsed = true  → narrow sidebar (w-20)
  //   collapsed = false → full sidebar (w-64)

  const mobileTransform = collapsed ? "-translate-x-full" : "translate-x-0";
  const desktopWidth = collapsed ? "md:w-20" : "md:w-64";

  return (
    <aside
      className={`
        sidebar
        fixed inset-y-0 left-0 z-40
        w-64
        transform ${mobileTransform}
        transition-transform duration-300 ease-in-out
        bg-white text-gpt-900 dark:bg-gpt-900 dark:text-gpt-100
        flex flex-col border-r border-gray-100 dark:border-gpt-700
        md:static md:translate-x-0
        ${desktopWidth}
      `}
    >
      {/* Header / Logo */}
      <div
        className={`
          sidebar-header
          px-4 py-5 text-lg font-bold tracking-wide
          border-b border-gray-100 dark:border-gpt-700
          flex items-center
          ${collapsed ? "justify-center" : "justify-center text-center"}
        `}
      >
        <div className="relative">
          {/* Short logo */}
          <span
            className={`
              block text-sidebarActive-500 transition-all duration-200
              ${collapsed ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute"}
            `}
          >
            PI
          </span>

          {/* Full logo */}
          <span
            className={`
              block transition-all duration-200
              ${collapsed ? "opacity-0 scale-95 absolute" : "opacity-100 scale-100"}
            `}
          >
            Pamela&apos;s
            <br />
            Online Shop
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const path = new URL(item.href).pathname;
          const active = url.startsWith(path);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                menu-item group relative flex items-center gap-3
                ${collapsed ? "justify-center px-2" : "px-3"}
                py-2 rounded-lg transition
                ${active ? "menu-item-active" : "menu-item-inactive"}
              `}
            >
              {/* Active left indicator (desktop only, when expanded) */}
              {active && !collapsed && (
                <span className="absolute left-0 h-6 w-1 rounded-full bg-sidebarActive-500 hidden md:block" />
              )}

              {/* Icon */}
              <span
                className={`
                  grid place-items-center h-8 w-8 rounded-lg transition
                  ${
                    active
                      ? "bg-sidebarActive-50 dark:bg-sidebarActive-500/10"
                      : "bg-transparent group-hover:bg-gpt-100 dark:group-hover:bg-white/5"
                  }
                `}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-sidebarActive-500"
                      : "text-gpt-500 dark:text-gpt-400"
                  }
                />
              </span>

              {/* Text hidden when collapsed (desktop) */}
              {!collapsed && (
                <span
                  className={`
                    menu-item-text whitespace-nowrap overflow-hidden
                    transition-all duration-200 ease-in-out
                  `}
                >
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer (hidden when collapsed) */}
      {!collapsed && (
        <div
          className={`
            px-4 py-3 text-xs
            text-gpt-500 dark:text-gpt-400
            border-t border-gray-100 dark:border-gpt-700
            transition-all duration-200 ease-in-out
          `}
        >
          Inventory System
        </div>
      )}
    </aside>
  );
}
