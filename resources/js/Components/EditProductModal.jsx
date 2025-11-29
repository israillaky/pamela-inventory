import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import ProductFields from "@/Components/ProductFields";

export default function EditProductModal({ show, onClose, product, categories }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        sku: "",
        barcode: "",
        name: "",
        description: "",
        category_id: "",
        unit: "pc",
        cost_price: "",
        selling_price: "",
        reorder_level: 0,
    });

    useEffect(() => {
        if (!product) return;

        setData({
            sku: product.sku || "",
            barcode: product.barcode || "",
            name: product.name || "",
            description: product.description || "",
            category_id: product.category_id || "",
            unit: product.unit || "pc",
            cost_price: product.cost_price || "",
            selling_price: product.selling_price || "",
            reorder_level: product.reorder_level || 0,
        });
    }, [product, setData]);

    const handleClose = () => {
        reset();
        onClose && onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!product) return;

        put(route("products.update", product.id), {
            onSuccess: handleClose,
        });
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Edit Product</h2>

                {!product ? (
                    <p>No product selected.</p>
                ) : (
                    <form onSubmit={submit} className="space-y-4">
                        <ProductFields
                            data={data}
                            setData={setData}
                            errors={errors}
                            categories={categories}
                        />

                        <div className="flex justify-end gap-2 pt-2">
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
                                {processing ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
