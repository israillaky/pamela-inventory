import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

import TextInput from "@/Components/ui/TextInput";
import SelectInput from "@/Components/ui/SelectInput";
import FormGroup from "@/Components/ui/FormGroup";
import Button from "@/Components/ui/Button";
import Pagination from "@/Components/ui/Pagination";
import Modal from "@/Components/ui/Modal";
import BarcodePreview from "@/Components/ui/BarcodePreview";
import Table from "@/Components/ui/Table";
import { Pencil,Trash } from "lucide-react";

export default function ProductsIndex() {
  const {
    products,
    filters = {},
    brands = [],
    categories = [],
    flash,
  } = usePage().props;

  /* ---------------------------
      Filters
  ----------------------------*/
  const [search, setSearch] = useState(filters.search || "");
  const [brandId, setBrandId] = useState(filters.brand_id || "");
  const [categoryId, setCategoryId] = useState(filters.category_id || "");

  useEffect(() => {
    const t = setTimeout(() => {
      router.get(
        route("products.index"),
        { search, brand_id: brandId, category_id: categoryId },
        {
          preserveState: true,
          replace: true,
          only: ["products", "filters"],
        }
      );
    }, 350);

    return () => clearTimeout(t);
  }, [search, brandId, categoryId]);

  const rows = (products?.data || []).map((p) => {
    const qty = Number(p.quantity ?? 0);

    const rowClass =
        qty <= 0
        ? "bg-red-50 dark:bg-red-900/20"
        : qty < 10
        ? "bg-amber-50 dark:bg-amber-900/20"
        : "";

    return { ...p, _rowClass: rowClass };
    });

  /* ---------------------------
      Modal State
  ----------------------------*/
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  /* ---------------------------
      Shared form for Add/Edit
  ----------------------------*/
  const form = useForm({
    name: "",
    sku: "",
    brand_id: "",
    category_id: "",
    child_category_id: "",
    price: "",
    sales_price: "",
  });

  // child category options based on selected category
  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === Number(form.data.category_id)),
    [categories, form.data.category_id]
  );

  const childOptions =
  selectedCategory?.childCategories ||
  selectedCategory?.child_categories ||
  [];

  useEffect(() => {
    if (
      form.data.child_category_id &&
      !childOptions.some((cc) => cc.id === Number(form.data.child_category_id))
    ) {
      form.setData("child_category_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.data.category_id]);

  const openAdd = () => {
    form.reset();
    setEditProduct(null);
    setAddOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    form.setData({
      name: p.name || "",
      sku: p.sku || "",
      brand_id: p.brand_id || "",
      category_id: p.category_id || "",
      child_category_id: p.child_category_id || "",
      price: p.price || "",
      sales_price: p.sales_price || "",
    });
    setEditOpen(true);
  };

  const submitAdd = (e) => {
    e.preventDefault();
    form.post(route("products.store"), {
      preserveScroll: true,
      onSuccess: () => {
        // keep open after create
        form.reset("name", "sku", "price", "sales_price");
      },
    });
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editProduct) return;

    form.put(route("products.update", editProduct.id), {
      preserveScroll: true,
      onSuccess: () => {
        // close on update
        setEditOpen(false);
        setEditProduct(null);
      },
    });
  };

  const destroy = (id) => {
    if (!confirm("Delete this product?")) return;
    router.delete(route("products.destroy", id), { preserveScroll: true });
  };

  /* ---------------------------
      Table Columns
  ----------------------------*/
  const columns = [
    { key: "name", label: "Name" },
    { key: "sku", label: "SKU" },
    {
      key: "brand",
      label: "Brand",
      render: (p) => p.brand?.name || "-",
    },
    {
      key: "category",
      label: "Category",
      render: (p) => p.category?.name || "-",
    },
    {
      key: "child_category",
      label: "Child",
      render: (p) => p.child_category?.name || "-",
    },
    {
      key: "price",
      label: "ProductPrice",
      align: "right",
      render: (p) => `₱${p.price}`,
    },
    {
      key: "sales_price",
      label: "Product Sales Price",
      align: "right",
      render: (p) => (p.sales_price ? `₱${p.sales_price}` : "-"),
    },
    {
        key: "quantity",
        label: "Qty",
        align: "right",
        render: (p) => {
            const qty = Number(p.quantity ?? 0);

            const cls =
            qty <= 0
                ? "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                : qty < 10
                ? "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30"
                : "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30";

            return (
            <span
                className={`inline-flex min-w-[48px] justify-end rounded-md px-2 py-0.5 text-sm font-semibold ${cls}`}
                title={
                qty <= 0
                    ? "Out of stock"
                    : qty < 10
                    ? "Low stock"
                    : "In stock"
                }
            >
                {qty}
            </span>
            );
        },
    },

    {
        key: "created_at",
        label: "Created At",
        align: "right",
        render: (p) => (p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'  }) : "-"), // format date
    },



    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            className="px-1 py-1 border-0   hover:bg-blue-100 dark:hover:bg-blue-900/30"
            onClick={() => openEdit(p)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="outline"
            type="button"
            className="px-1 py-1 border-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={() => destroy(p.id)}
          >
            <Trash size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Products</h2>}>
      <Head title="Products" />

      {flash?.success && (
        <div className="mb-4 rounded-lg bg-green-100 text-green-800 px-3 py-2 dark:bg-green-900 dark:text-green-200">
          {flash.success}
        </div>
      )}

      {/* Filters + Add */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <TextInput
          placeholder="Search name / sku / barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-1/3"
        />

        <SelectInput
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="md:w-1/4"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="md:w-1/4"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectInput>

        <Button variant="primary" type="button" onClick={openAdd}>
          + Add Product
        </Button>
      </div>

      {/* Reusable Table */}
      <Table columns={columns} rows={rows} emptyText="No products found."
        rowClassName={(p) => {
            const qty = Number(p.quantity ?? 0);
            if (qty <= 0) return "bg-red-50 dark:bg-red-900/20";
            if (qty < 10) return "bg-amber-50 dark:bg-amber-900/20";
            return "";
        }} />
      <div className="mb-4">
        <Pagination meta={products} />
      </div>

      {/* ADD MODAL */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Product">
        <form onSubmit={submitAdd} className="space-y-4">
          <FormGroup label="Product Name" error={form.errors.name}>
            <TextInput
              className="w-full"
              value={form.data.name}
              onChange={(e) => form.setData("name", e.target.value)}
            />
          </FormGroup>

          <FormGroup label="SKU (optional)" error={form.errors.sku}>
            <TextInput
               className="w-full"
              value={form.data.sku}
              onChange={(e) => form.setData("sku", e.target.value)}
            />
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Brand" error={form.errors.brand_id}>
              <SelectInput
                className="w-full"
                value={form.data.brand_id}
                onChange={(e) => form.setData("brand_id", e.target.value)}
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </SelectInput>
            </FormGroup>

            <FormGroup label="Category" error={form.errors.category_id}>
              <SelectInput
                className="w-full"

                value={form.data.category_id}
                onChange={(e) => form.setData("category_id", e.target.value)}
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

          <FormGroup label="Child Category" error={form.errors.child_category_id}>
            <SelectInput
                className="w-full"

              value={form.data.child_category_id || ""}
              onChange={(e) => form.setData("child_category_id", e.target.value)}
              disabled={!form.data.category_id}
            >
              <option value="">None</option>
              {childOptions.map((cc) => (
                <option key={cc.id} value={cc.id}>
                  {cc.name}
                </option>
              ))}
            </SelectInput>
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Price" error={form.errors.price}>
              <TextInput
                className="w-full"

                type="number"
                value={form.data.price}
                onChange={(e) => form.setData("price", e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Sales Price (optional)" error={form.errors.sales_price}>
              <TextInput
                className="w-full"

                type="number"
                value={form.data.sales_price || ""}
                onChange={(e) => form.setData("sales_price", e.target.value)}
              />
            </FormGroup>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="primary" disabled={form.processing}>
              Save Product
            </Button>
            <Button variant="secondary" type="button" onClick={() => setAddOpen(false)}>
              Close
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Product">
        {editProduct && (
          <form onSubmit={submitEdit} className="space-y-4">
            <FormGroup label="Product Name" error={form.errors.name}>
              <TextInput
                className="w-full"

                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
              />
            </FormGroup>

            <FormGroup label="SKU" error={form.errors.sku}>
              <TextInput
                className="w-full"

                value={form.data.sku}
                onChange={(e) => form.setData("sku", e.target.value)}
              />
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Brand" error={form.errors.brand_id}>
                <SelectInput
                className="w-full"

                  value={form.data.brand_id}
                  onChange={(e) => form.setData("brand_id", e.target.value)}
                >
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </SelectInput>
              </FormGroup>

              <FormGroup label="Category" error={form.errors.category_id}>
                <SelectInput
                className="w-full"

                  value={form.data.category_id}
                  onChange={(e) => form.setData("category_id", e.target.value)}
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

            <FormGroup label="Child Category" error={form.errors.child_category_id}>
              <SelectInput
                className="w-full"

                value={form.data.child_category_id || ""}
                onChange={(e) => form.setData("child_category_id", e.target.value)}
                disabled={!form.data.category_id}
              >
                <option value="">None</option>
                {childOptions.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.name}
                  </option>
                ))}
              </SelectInput>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Price" error={form.errors.price}>
                <TextInput
                className="w-full"

                  type="number"
                  value={form.data.price}
                  onChange={(e) => form.setData("price", e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Sales Price (optional)" error={form.errors.sales_price}>
                <TextInput
                className="w-full"

                  type="number"
                  value={form.data.sales_price || ""}
                  onChange={(e) => form.setData("sales_price", e.target.value)}
                />
              </FormGroup>
            </div>

           <BarcodePreview
                png={editProduct.barcode_png}
                code={editProduct.barcode}
                name={editProduct.name}
                meta={
                    [
                    editProduct.brand?.name,
                    editProduct.category?.name
                    ]
                    .filter(Boolean)
                    .join(" - ")
                }
            />


            <div className="flex justify-end gap-2 pt-2">
              <Button variant="primary" disabled={form.processing}>
                Update Product
              </Button>
              <Button variant="secondary" type="button" onClick={() => setEditOpen(false)}>
                Close
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AuthenticatedLayout>
  );
}
