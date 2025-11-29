// resources/js/Components/ProductFields.jsx
import React from "react";

export default function ProductFields({ data, setData, errors = {}, categories = [] }) {
    return (
        <>
            {/* SKU + Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">SKU</label>
                    <input
                        type="text"
                        className="border rounded w-full px-2 py-1"
                        value={data.sku}
                        onChange={(e) => setData("sku", e.target.value)}
                    />
                    {errors.sku && (
                        <p className="text-xs text-red-600 mt-1">{errors.sku}</p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium">Barcode</label>
                    <input
                        type="text"
                        className="border rounded w-full px-2 py-1"
                        value={data.barcode}
                        onChange={(e) => setData("barcode", e.target.value)}
                    />
                    {errors.barcode && (
                        <p className="text-xs text-red-600 mt-1">
                            {errors.barcode}
                        </p>
                    )}
                </div>
            </div>

            {/* Name */}
            <div>
                <label className="text-sm font-medium">Name</label>
                <input
                    type="text"
                    className="border rounded w-full px-2 py-1"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                />
                {errors.name && (
                    <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                    className="border rounded w-full px-2 py-1"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                />
                {errors.description && (
                    <p className="text-xs text-red-600 mt-1">
                        {errors.description}
                    </p>
                )}
            </div>

            {/* Category */}
            <div>
                <label className="text-sm font-medium">Category</label>
                <select
                    className="border rounded w-full px-2 py-1"
                    value={data.category_id}
                    onChange={(e) => setData("category_id", e.target.value)}
                >
                    <option value="">— none —</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {errors.category_id && (
                    <p className="text-xs text-red-600 mt-1">
                        {errors.category_id}
                    </p>
                )}
            </div>

            {/* Unit + prices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium">Unit</label>
                    <input
                        type="text"
                        className="border rounded w-full px-2 py-1"
                        value={data.unit}
                        onChange={(e) => setData("unit", e.target.value)}
                    />
                    {errors.unit && (
                        <p className="text-xs text-red-600 mt-1">
                            {errors.unit}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium">Cost Price</label>
                    <input
                        type="number"
                        step="0.01"
                        className="border rounded w-full px-2 py-1"
                        value={data.cost_price}
                        onChange={(e) => setData("cost_price", e.target.value)}
                    />
                    {errors.cost_price && (
                        <p className="text-xs text-red-600 mt-1">
                            {errors.cost_price}
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium">Selling Price</label>
                    <input
                        type="number"
                        step="0.01"
                        className="border rounded w-full px-2 py-1"
                        value={data.selling_price}
                        onChange={(e) =>
                            setData("selling_price", e.target.value)
                        }
                    />
                    {errors.selling_price && (
                        <p className="text-xs text-red-600 mt-1">
                            {errors.selling_price}
                        </p>
                    )}
                </div>
            </div>

            {/* Reorder level */}
            <div>
                <label className="text-sm font-medium">Reorder Level</label>
                <input
                    type="number"
                    className="border rounded w-full px-2 py-1"
                    value={data.reorder_level}
                    onChange={(e) =>
                        setData("reorder_level", e.target.value)
                    }
                />
                {errors.reorder_level && (
                    <p className="text-xs text-red-600 mt-1">
                        {errors.reorder_level}
                    </p>
                )}
            </div>
        </>
    );
}
