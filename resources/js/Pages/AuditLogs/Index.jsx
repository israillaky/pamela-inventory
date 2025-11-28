import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import Pagination from "@/Components/ui/Pagination";

export default function AuditLogsIndex() {
  const {
    logs: logsProp = [],
    filters = {},
    users = [],
    actions = [],
    modules = [],
  } = usePage().props;

  // Support both paginator and plain array
  const isPaginated =
    logsProp &&
    typeof logsProp === "object" &&
    !Array.isArray(logsProp) &&
    Object.prototype.hasOwnProperty.call(logsProp, "data");

  const items = isPaginated ? logsProp.data ?? [] : logsProp;
  const paginationLinks = isPaginated ? logsProp.links ?? [] : [];

  const [localFilters, setLocalFilters] = useState({
    user_id: filters.user_id || "",
    action: filters.action || "",
    module: filters.module || "",
    ip_address: filters.ip_address || "",
    from: filters.from || "",
    to: filters.to || "",
    search: filters.search || "",
  });

  const onChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    router.get(route("audit-logs.index"), localFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const exportCsv = () => {
    router.get(route("audit-logs.export"), localFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const actionBadgeClass = (action) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-700";
      case "updated":
        return "bg-blue-100 text-blue-700";
      case "deleted":
        return "bg-red-100 text-red-700";
      case "login":
        return "bg-emerald-100 text-emerald-700";
      case "stock_in":
        return "bg-indigo-100 text-indigo-700";
      case "stock_out":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gpt-100 text-gray-700";
    }
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold">Audit Logs</h2>}
    >
      <Head title="Audit Logs" />

      {/* Filters card */}
      <div className="mb-4 rounded-2xl border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-4">
        <form
          onSubmit={applyFilters}
          className="grid gap-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {/* User */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gpt-600 dark:text-gpt-300">
              User
            </label>
            <select
              className="rounded-lg border border-gpt-300 dark:border-gpt-700 bg-white dark:bg-gpt-900 px-2 py-1.5 text-sm"
              value={localFilters.user_id}
              onChange={(e) => onChange("user_id", e.target.value)}
            >
              <option value="">All</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gpt-600 dark:text-gpt-300">
              Action
            </label>
            <select
              className="rounded-lg border border-gpt-300 dark:border-gpt-700 bg-white dark:bg-gpt-900 px-2 py-1.5 text-sm"
              value={localFilters.action}
              onChange={(e) => onChange("action", e.target.value)}
            >
              <option value="">All</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Module */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gpt-600 dark:text-gpt-300">
              Module
            </label>
            <select
              className="rounded-lg border border-gpt-300 dark:border-gpt-700 bg-white dark:bg-gpt-900 px-2 py-1.5 text-sm"
              value={localFilters.module}
              onChange={(e) => onChange("module", e.target.value)}
            >
              <option value="">All</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* IP */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gpt-600 dark:text-gpt-300">
              IP Address
            </label>
            <input
              type="text"
              className="rounded-lg border border-gpt-300 dark:border-gpt-700 bg-white dark:bg-gpt-900 px-2 py-1.5 text-sm"
              value={localFilters.ip_address}
              onChange={(e) => onChange("ip_address", e.target.value)}
            />
          </div>

          {/* From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gpt-600 dark:text-gpt-300">
              From Date
            </label>
            <input
              type="date"
              className="rounded-lg border border-gpt-300 dark:border-gpt-700 bg-white dark:bg-gpt-900 px-2 py-1.5 text-sm"
              value={localFilters.from}
              onChange={(e) => onChange("from", e.target.value)}
            />
          </div>

          {/* To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gpt-600 dark:text-gpt-300">
              To Date
            </label>
            <input
              type="date"
              className="rounded-lg border border-gpt-300 dark:border-gpt-700 bg-white dark:bg-gpt-900 px-2 py-1.5 text-sm"
              value={localFilters.to}
              onChange={(e) => onChange("to", e.target.value)}
            />
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-medium text-gpt-600 dark:text-gpt-300">
              Search
            </label>
            <input
              type="text"
              placeholder="Description / IP / User agent..."
              className="rounded-lg border border-gpt-300 dark:border-gpt-700 bg-white dark:bg-gpt-900 px-2 py-1.5 text-sm"
              value={localFilters.search}
              onChange={(e) => onChange("search", e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2 md:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center justify-center rounded-lg border border-gpt-300 dark:border-gpt-700 bg-white dark:bg-gpt-900 px-3 py-1.5 text-sm font-medium text-gpt-800 dark:text-gpt-100 hover:bg-gpt-50 dark:hover:bg-gpt-800"
            >
              Export CSV
            </button>
          </div>
        </form>
      </div>

      {/* Table card */}
      <div className="rounded-t-md border-b-1 border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gpt-700 text-xs uppercase text-gpt-500 dark:text-gpt-400">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Module</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-sm text-gpt-500"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                items.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 dark:border-gpt-700"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm">
                        {/* convert to local date time string  in a M/d/yyyy, h:mm:ss AM/PM format */}

                      {new Date(log.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true,
                      })}

                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm">
                      {log.user?.name || "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm">
                      {log.user?.role || "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm">
                      <span
                        className={
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                          actionBadgeClass(log.action)
                        }
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm">
                      {log.module}
                    </td>
                    <td className="px-3 py-2 text-xs md:text-sm max-w-md">
                      <div className="line-clamp-3 break-words">
                        {log.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs md:text-sm">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {paginationLinks.length > 0 && (
            <div className="mb-4">
                <Pagination links={paginationLinks} />
            </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
