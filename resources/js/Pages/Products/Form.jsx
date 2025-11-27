import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

import FormGroup from "@/Components/ui/FormGroup";
import TextInput from "@/Components/ui/TextInput";
import SelectInput from "@/Components/ui/SelectInput";
import Button from "@/Components/ui/Button";
import BarcodePreview from "@/Components/ui/BarcodePreview";

export default function ProductForm() {
    const { mode, product, brands = [], categories = [] } = usePage().props;

    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name || "",
        sku: product?.sku || "",
        brand_id: product?.brand_id || "",
        category_id: product?.category_id || "",
        child_category_id: product?.child_category_id || "",
        price: product?.price || "",
        sales_price: product?.sales_price || "",
    });

    const [childOptions, setChildOptions] = useState([]);

    // find selected category (for filtering children)
    const selectedCategory = useMemo(
        () => categories.find((c) => c.id === Number(data.category_id)),
        [categories, data.category_id]
    );

    useEffect(() => {
        const children = selectedCategory?.children || [];
        setChildOptions(children);

        // reset child if not in selected category
        if (
            data.child_category_id &&
            !children.some((cc) => cc.id === Number(data.child_category_id))
        ) {
            setData("child_category_id", "");
        }
    }, [selectedCategory]);

    const submit = (e) => {
        e.preventDefault();
        if (mode === "edit") {
            put(route("products.update", product.id));
        } else {
            post(route("products.store"));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold">
                    {mode === "edit" ? "Edit Product" : "Add Product"}
                </h2>
            }
        >
            <Head title="Products" />

            <form onSubmit={submit} className="space-y-6 max-w-3xl">

                {/* Product Name */}
                <FormGroup label="Product Name" error={errors.name}>
                    <TextInput
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                    />
                </FormGroup>

                {/* SKU */}
                <FormGroup
                    label="SKU (leave empty to auto-generate)"
                    error={errors.sku}
                >
                    <TextInput
                        value={data.sku}
                        onChange={(e) => setData("sku", e.target.value)}
                    />
                </FormGroup>

                {/* Brand + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup label="Brand" error={errors.brand_id}>
                        <SelectInput
                            value={data.brand_id}
                            onChange={(e) => setData("brand_id", e.target.value)}
                        >
                            <option value="">Select brand</option>
                            {brands.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </SelectInput>
                    </FormGroup>

                    <FormGroup label="Category" error={errors.category_id}>
                        <SelectInput
                            value={data.category_id}
                            onChange={(e) => setData("category_id", e.target.value)}
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </SelectInput>
                    </FormGroup>
                </div>

                {/* Child Category */}
                <FormGroup label="Child Category" error={errors.child_category_id}>
                    <SelectInput
                        value={data.child_category_id || ""}
                        onChange={(e) => setData("child_category_id", e.target.value)}
                        disabled={!data.category_id}
                    >
                        <option value="">None</option>
                        {childOptions.map((cc) => (
                            <option key={cc.id} value={cc.id}>
                                {cc.name}
                            </option>
                        ))}
                    </SelectInput>
                </FormGroup>

                {/* Prices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup label="Price" error={errors.price}>
                        <TextInput
                            type="number"
                            value={data.price}
                            onChange={(e) => setData("price", e.target.value)}
                        />
                    </FormGroup>

                    <FormGroup label="Sales Price (optional)" error={errors.sales_price}>
                        <TextInput
                            type="number"
                            value={data.sales_price || ""}
                            onChange={(e) => setData("sales_price", e.target.value)}
                        />
                    </FormGroup>
                </div>

                {/* Barcode Preview (only edit mode gets png from controller) */}
                <BarcodePreview
                    png={product?.barcode_png}
                    code={product?.barcode}
                    name={product?.name}
                />

                {/* Actions */}
                <div className="flex gap-2">
                    <Button variant="primary" disabled={processing}>
                        {mode === "edit" ? "Update Product" : "Create Product"}
                    </Button>

                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => (window.location.href = route("products.index"))}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
