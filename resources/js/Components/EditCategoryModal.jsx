import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";

export default function EditCategoryModal({ show, onClose, category }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: "",
    });

    useEffect(() => {
        if (!category) return;
        setData({ name: category.name || "" });
    }, [category]);

    const handleClose = () => {
        reset();
        onClose && onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!category) return;

        patch(route("categories.update", category.id), {
            onSuccess: handleClose,
        });
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="sm">
            <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Edit Category</h2>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <input
                            type="text"
                            className="border rounded w-full px-2 py-1"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-300 rounded"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            {processing ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
