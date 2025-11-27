import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Forbidden({ message }) {
  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Forbidden</h2>}>
      <Head title="Forbidden" />
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-gpt-900 p-6 shadow">
          <div className="mb-2 text-lg font-semibold text-amber-700 dark:text-amber-400">
            Access Denied
          </div>
          <p className="text-sm text-gray-700 dark:text-gpt-200">
            {message || "You are not allowed to perform this action."}
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
