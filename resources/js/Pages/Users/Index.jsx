import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

import Modal from "@/Components/ui/Modal";
import Button from "@/Components/ui/Button";
import TextInput from "@/Components/ui/TextInput";
import Pagination from "@/Components/ui/Pagination";
import { Pencil, Trash } from "lucide-react";

export default function UsersIndex() {
  const { users, roles = [], filters = {} } = usePage().props;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, setData, post, put, delete: destroy, reset, processing, errors } =
    useForm({
      name: "",
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "staff",
    });

  useEffect(() => {
    if (!open) {
      reset();
      setEditing(null);
    }
  }, [open]);

  const openCreate = () => {
    setEditing(null);
    reset();
    setOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setData({
      name: u.name || "",
      username: u.username || "",
      email: u.email || "",
      password: "",
      password_confirmation: "",
      role: u.role || "staff",
    });
    setOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    if (editing) {
      put(route("users.update", editing.id), {
        onSuccess: () => setOpen(false),
      });
    } else {
      post(route("users.store"), {
        onSuccess: () => setOpen(true), // keep open after create
      });
    }
  };

  const removeUser = (u) => {
    if (!confirm(`Delete ${u.name}?`)) return;
    destroy(route("users.destroy", u.id));
  };

  const doSearch = (value) => {
    router.get(route("users.index"), { search: value }, { preserveState: true });
  };

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Users</h2>}>
      <Head title="Users" />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <TextInput
          defaultValue={filters.search || ""}
          placeholder="Search users..."
          onKeyDown={(e) => e.key === "Enter" && doSearch(e.target.value)}
          className="w-64"
        />
        <Button onClick={openCreate}>Add User</Button>
      </div>

      {/* Plain table (no custom Table component) */}
      <div className="overflow-x-auto   rounded-t-lg border border-b-1 border-gray-200 dark:border-gpt-700 bg-white dark:bg-gpt-900 shadow-theme-xs">
        <table className="min-w-full text-sm">
          <thead className="bg-gpt-50 dark:bg-gpt-900 text-gpt-600 dark:text-gpt-300">
            <tr>
              <th className="px-3 py-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gpt-200 dark:border-gpt-700 dark:bg-gpt-900 ">Name</th>
              <th className="px-3 py-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gpt-200 dark:border-gpt-700 dark:bg-gpt-900">Username</th>
              <th className="px-3 py-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gpt-200 dark:border-gpt-700 dark:bg-gpt-900">Email</th>
              <th className="px-3 py-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gpt-200 dark:border-gpt-700 dark:bg-gpt-900">Role</th>
              <th className="px-3 py-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gpt-200 dark:border-gpt-700 dark:bg-gpt-900">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gpt-200 dark:divide-gpt-800">
            {(users?.data || []).length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gpt-500 dark:text-gpt-400">
                  No users found.
                </td>
              </tr>
            )}

            {(users?.data || []).map((u) => (
              <tr key={u.id} className="border-t border-gray-100 dark:border-gpt-700 odd:bg-gpt-50 even:bg-white dark:odd:bg-gpt-700 dark:even:bg-gpt-900/80">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.username}</td>
                <td className="px-4 py-3">{u.email || "-"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-sidebarActive-50 text-sidebarActive-700 dark:bg-sidebarActive-500/20 dark:text-sidebarActive-300">
                    {u.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(u)} className="px-1 py-1 border-0   hover:bg-blue-100 dark:hover:bg-blue-900/30">
                        <Pencil size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeUser(u)}    className="px-1 py-1 border-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30">
                      <Trash size={16} />
                    </Button>


                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mb-4">
        <Pagination meta={users} />
      </div>

      {/* Modal */}
     <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit User" : "Add User"}>
        <form onSubmit={submit} className="space-y-8">

            {/* ===========================
                ACCOUNT INFORMATION
            ============================ */}
            <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gpt-300 mb-3">
                Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Full Name */}
                <div>
                <label className="block text-xs font-medium mb-1 text-gpt-600 dark:text-gpt-400">
                    Full Name
                </label>
                <TextInput
                    className="w-full"
                    placeholder="e.g. Anna Dela Cruz"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    error={errors.name}
                />
                </div>

                {/* Username */}
                <div>
                <label className="block text-xs font-medium mb-1 text-gpt-600 dark:text-gpt-400">
                    Username
                </label>
                <TextInput
                    className="w-full"
                    placeholder="e.g. annadcruz"
                    value={data.username}
                    onChange={(e) => setData("username", e.target.value)}
                    error={errors.username}
                />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1 text-gpt-600 dark:text-gpt-400">
                    Email Address (Optional)
                </label>
                <TextInput
                    className="w-full"
                    type="email"
                    placeholder="e.g. anna@example.com"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    error={errors.email}
                />
                </div>
            </div>
            </div>

            {/* ===========================
                SECURITY SETTINGS
            ============================ */}
            <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gpt-300 mb-3">
                Security Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Password */}
                <div>
                <label className="block text-xs font-medium mb-1 text-gpt-600 dark:text-gpt-400">
                    {editing ? "Password (leave blank to keep current)" : "Password"}
                </label>
                <TextInput
                    className="w-full"
                    type="password"
                    placeholder={editing ? "Leave blank" : "Enter password"}
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    error={errors.password}
                />
                </div>

                {/* Confirm Password */}
                <div>
                <label className="block text-xs font-medium mb-1 text-gpt-600 dark:text-gpt-400">
                    Confirm Password
                </label>
                <TextInput
                    className="w-full"
                    type="password"
                    placeholder="Re-enter password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                    setData("password_confirmation", e.target.value)
                    }
                />
                </div>
            </div>
            </div>

            {/* ===========================
                USER ROLE
            ============================ */}
            <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gpt-300 mb-3">
                User Role
            </h3>

            <div>
                <label className="block text-xs font-medium mb-1 text-gpt-600 dark:text-gpt-400">
                Select Role
                </label>

                <select
                className="
                    mt-1 w-full rounded-lg border-gpt-300 dark:border-gpt-700
                    dark:bg-gpt-800 dark:text-gpt-100
                    focus:ring-sidebarActive-500 focus:border-sidebarActive-500
                "
                value={data.role}
                onChange={(e) => setData("role", e.target.value)}
                >
                {roles.map((r) => (
                    <option key={r} value={r}>
                    {r.replace("_", " ")}
                    </option>
                ))}
                </select>

                {errors.role && (
                <div className="text-xs text-red-500 mt-1">{errors.role}</div>
                )}
            </div>
            </div>

            {/* ===========================
                ACTION BUTTONS
            ============================ */}
            <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gpt-700 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Close
            </Button>
            <Button disabled={processing}>
                {editing ? "Update User" : "Create User"}
            </Button>
            </div>
        </form>
    </Modal>


    </AuthenticatedLayout>
  );
}
