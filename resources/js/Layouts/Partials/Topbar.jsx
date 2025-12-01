import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Sun, Moon, LogOut, SidebarClose, SidebarOpen } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Topbar({ collapsed, onToggleSidebar }) {
  const { auth } = usePage().props;
  const [isDark, setIsDark] = useState(false);
  const role = auth?.user?.role;

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;

    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    if (!saved) localStorage.setItem("theme", dark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const willBeDark = !isDark;
    setIsDark(willBeDark);

    if (willBeDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="h-14 bg-white dark:bg-gpt-900 border-b border-gray-100 dark:border-gpt-700 px-4 flex items-center justify-between gap-2 shadow-theme-xs">
      {/* LEFT SIDE: collapse / open button + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-800 hover:border-sidebarActive-500 transition md:p-2"
          title={collapsed ? "Open menu" : "Close menu"}
        >
          {collapsed ? <SidebarOpen size={18} /> : <SidebarClose size={18} />}
        </button>

        {/* Hide long welcome text on very small screens */}
        <div className="hidden sm:block text-theme-sm text-gpt-600 dark:text-gpt-300 truncate">
          Welcome,{" "}
          <span className="font-semibold text-gpt-900 dark:text-white">
            {auth.user.name}
          </span>
        </div>

        {/* Role badge (still visible on mobile) */}
        <div className="flex items-center gap-2">
          <span
            className="
              px-3 py-1 rounded-full text-xs font-medium
              bg-sidebarActive-50 text-sidebarActive-700
              dark:bg-sidebarActive-500/20 dark:text-sidebarActive-300
              border border-sidebarActive-200 dark:border-sidebarActive-700
            "
          >
            {role?.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: theme + profile + logout */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-800 hover:border-sidebarActive-500 transition"
          type="button"
          title="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link
          href={route("profile.edit")}
          className="p-2 rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-800 hover:border-sidebarActive-500 transition"
          title="Profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>

        <Link
          href={route("logout")}
          method="post"
          as="button"
          className="p-2 rounded-lg border border-error-200 dark:border-error-700 bg-white dark:bg-gpt-800 text-error-500 hover:bg-error-50 dark:hover:bg-gpt-800 transition"
          title="Logout"
        >
          <LogOut size={18} />
        </Link>
      </div>
    </header>
  );
}
