import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function SystemError({ message }) {
  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold">System Error</h2>}
    >
      <Head title="System Error" />

      {/* Full-screen overlay */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gpt-900 p-6 shadow-xl border border-red-200 dark:border-red-800">
          <div className="mb-3 text-lg font-semibold text-red-700 dark:text-red-400">
            Something went wrong
          </div>

          <p className="mb-4 text-sm text-gray-700 dark:text-gpt-200">
            {message ??
              "Something went wrong with the system. Please contact your developer."}
          </p>

          <p className="mb-6 text-xs text-gray-400 dark:text-gpt-400">
            This issue has been recorded in the system logs.
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
