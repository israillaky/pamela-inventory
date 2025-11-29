import React from "react";
import Modal from "@/Components/Modal";
import { router } from "@inertiajs/react";

export default function DeleteConfirmModal({ show, onClose, product }) {
    if (!show || !product) return null;

    const handleDelete = () => {
        router.delete(route("products.destroy", product.id), {
            onSuccess: onClose,
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-red-600">
                    Delete Product
                </h2>

                <p>
                    Are you sure you want to delete{" "}
                    <span className="font-bold">{product.name}</span>?
                </p>

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
}
