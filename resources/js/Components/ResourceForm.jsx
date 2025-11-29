// resources/js/Components/ResourceForm.jsx
import React from "react";
import { useForm } from "@inertiajs/react";

export default function ResourceForm({
    title,
    routeName,          // e.g. "products.store"
    method = "post",     // "post" | "put" | "patch"
    initialValues = {},  // object with default values
    renderFields,        // function: ({ data, setData, errors }) => JSX
    onSuccess,           // optional callback
    submitLabel = "Save",
    className = "",
}) {
    const { data, setData, processing, errors, reset, post, put, patch } =
        useForm(initialValues);

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                if (onSuccess) onSuccess();
                // optional reset for create forms:
                // reset();
            },
        };

        if (method === "post") {
            post(route(routeName), options);
        } else if (method === "put") {
            put(route(routeName), options);
        } else if (method === "patch") {
            patch(route(routeName), options);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={
                "space-y-4 border p-4 rounded shadow-sm bg-white " + className
            }
        >
            {title && (
                <h2 className="text-lg font-semibold mb-2 border-b pb-2">
                    {title}
                </h2>
            )}

            {renderFields({ data, setData, errors })}

            <div className="flex justify-end gap-2 pt-2">
                {/* Optional: cancel button can be passed in via children/props if needed */}
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    {processing ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
