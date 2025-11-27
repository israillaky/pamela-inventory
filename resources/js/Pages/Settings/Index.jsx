import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import TextInput from "@/Components/ui/TextInput";
import Button from "@/Components/ui/Button";

export default function SettingsIndex() {
  const { settings } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    company_name: settings.company_name || "Pamila Online Shop",
    company_logo: null,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("settings.update"), { forceFormData: true });
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-lg font-semibold">Global Settings</h2>}
    >
      <Head title="Settings" />

      <form
        onSubmit={submit}
        className="max-w-3xl space-y-6 bg-white dark:bg-gpt-900 rounded-2xl shadow-theme-xs p-6"
      >
        {/* Company Name */}
        <TextInput
          label="Company Name"
          value={data.company_name}
          onChange={(e) => setData("company_name", e.target.value)}
          error={errors.company_name}
        />

        {/* Logo Upload */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gpt-200">
            Company Logo (also used as favicon)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setData("company_logo", e.target.files[0])}
            className="mt-1 text-sm text-gray-700 dark:text-gpt-100"
          />
          {errors.company_logo && (
            <p className="text-xs text-red-500 mt-1">
              {errors.company_logo}
            </p>
          )}

          {settings.company_logo && (
            <div className="mt-3 flex items-center gap-4">
              <img
                src={settings.company_logo}
                alt="Current logo"
                className="h-14 w-auto rounded-lg shadow bg-gpt-100 dark:bg-gpt-800 p-1"
              />
              <p className="text-xs text-gray-400 dark:text-gpt-400">
                This image is also used as the favicon.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={processing}>
            {processing ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}
