import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function NotFound({ message }) {
  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Page Not Found</h2>}>
      <Head title="404 Not Found" />
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-6 shadow">
          <div className="mb-2 text-lg font-semibold text-gpt-900 dark:text-gpt-100">
            404 — Not Found
          </div>
          <p className="text-sm text-gray-700 dark:text-gpt-200">
            {message || "The page you are looking for could not be found."}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
