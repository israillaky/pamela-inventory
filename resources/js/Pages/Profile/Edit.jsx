import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Button from "@/Components/ui/Button";
import TextInput from "@/Components/ui/TextInput";

export default function ProfileEdit() {
  const { user } = usePage().props;

  const { data, setData, put, processing, errors } = useForm({
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    password: "",
    password_confirmation: "",
  });

  const submit = (e) => {
    e.preventDefault();
    put(route("profile.update"));
  };

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">My Profile</h2>}>
      <Head title="Profile" />

      {/* Role badge */}
      <div className="mb-4">
        <span
          className="
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            bg-sidebarActive-50 text-sidebarActive-700
            dark:bg-sidebarActive-500/20 dark:text-sidebarActive-300
            border border-sidebarActive-200 dark:border-sidebarActive-700
          "
        >
          {user.role?.replace("_", " ")}
        </span>
      </div>

      <form onSubmit={submit} className="max-w-2xl space-y-8">

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
            {/* New Password */}
            <div>
              <label className="block text-xs font-medium mb-1 text-gpt-600 dark:text-gpt-400">
                New Password (Optional)
              </label>
              <TextInput
                className="w-full"
                type="password"
                placeholder="Leave blank to keep current"
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
                placeholder="Re-enter new password"
                value={data.password_confirmation}
                onChange={(e) => setData("password_confirmation", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ===========================
            ACTION BUTTONS
        ============================ */}
        <div className="flex justify-end border-t border-gray-100 dark:border-gpt-700 pt-4">
          <Button disabled={processing}>
            Save Changes
          </Button>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}
