import { useEffect, useState } from "react";
import Sidebar from "./Partials/Sidebar";
import Topbar from "./Partials/Topbar";

export default function AuthenticatedLayout({ header, children }) {
  const [collapsed, setCollapsed] = useState(false);

  // remember sidebar collapsed
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="min-h-screen flex bg-bg-[#eeeeee] text-gpt-900 dark:bg-[#212121] dark:text-gpt-100">
      <Sidebar collapsed={collapsed} />

      <div className="flex-1 flex flex-col">
        <Topbar collapsed={collapsed} onToggleSidebar={toggleSidebar} />

        {header && (
          <div className="px-6 py-4 border-b bg-white dark:bg-gpt-900 border-gray-100 dark:border-gpt-700 shadow-theme-xs">
            {header}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
