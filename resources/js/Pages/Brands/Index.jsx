import { useState, useEffect } from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import Table from "@/Components/ui/Table";
import Modal from "@/Components/ui/Modal";
import Button from "@/Components/ui/Button";
import TextInput from "@/Components/ui/TextInput";
import Pagination from "@/Components/ui/Pagination";
import { Pencil, Trash } from "lucide-react";

export default function BrandsIndex() {
    const { brands, filters = {}, errors } = usePage().props;

    const rows = brands?.data ?? [];

    // -----------------------------------
    // SEARCH + FILTERS
    // -----------------------------------
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                route("brands.index"),
                { search },
                {
                    preserveState: true,
                    replace: true,
                    only: ["brands", "filters"],
                }
            );
        }, 400);

        return () => clearTimeout(t);
    }, [search]);

    // -----------------------------------
    // ADD MODAL
    // -----------------------------------
    const [showAdd, setShowAdd] = useState(false);

    const addForm = useForm({
        name: "",
    });

    const submitAdd = (e) => {
        e.preventDefault();

        addForm.post(route("brands.store"), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset("name"); // stay open
            },
        });
    };

    // -----------------------------------
    // EDIT MODAL
    // -----------------------------------
    const [showEdit, setShowEdit] = useState(false);

    const editForm = useForm({
        id: null,
        name: "",
    });

    const startEdit = (brand) => {
        editForm.setData({
            id: brand.id,
            name: brand.name,
        });
        setShowEdit(true);
    };

    const submitEdit = (e) => {
        e.preventDefault();

        editForm.put(route("brands.update", editForm.data.id), {
            preserveScroll: true,
            onSuccess: () => setShowEdit(false), // close modal
        });
    };

    // -----------------------------------
    // DELETE
    // -----------------------------------
    const deleteBrand = (id) => {
        if (!confirm("Delete this brand?")) return;
        router.delete(route("brands.destroy", id));
    };

    // -----------------------------------
    // TABLE COLUMNS
    // -----------------------------------
    const columns = [
        { key: "name", label: "Brand Name" },
        {
            key: "actions",
            label: "Actions",
            render: (brand) => (
                <div className="flex items-center gap-2">
                     <Button
                        variant="outline"
                        type="button"
                        className="px-1 py-1 border-0   hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        onClick={() => startEdit(brand)}
                    >
                        <Pencil size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        className="px-1 py-1 border-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={() => deleteBrand(brand.id)}
                    >
                        <Trash size={16} />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-title-sm font-semibold">Brands</h2>}
        >
            <Head title="Brands" />

            <div className="p-4 bg-white dark:bg-gpt-900 border rounded-lg shadow-theme-sm">

                {/* HEADER WITH SEARCH + ADD */}
                <div className="flex items-center justify-between mb-4 gap-3">
                    <h3 className="text-lg font-semibold">Brand List</h3>

                    <div className="flex items-center gap-2">
                        <TextInput
                            placeholder="Search brand..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => setShowAdd(true)}
                        >
                            + Add Brand
                        </Button>
                    </div>
                </div>

                {/* TABLE */}
                <Table columns={columns} rows={rows} />

                {/* PAGINATION */}
                {brands?.links && brands.links.length > 3 && (
                    <div className="mb-4">
                        <Pagination links={brands} />
                    </div>
                )}
            </div>

            {/* -----------------------------------
                ADD BRAND MODAL
            ----------------------------------- */}
            <Modal

                title="Add Brand"
                open={showAdd}
                onClose={() => setShowAdd(false)}
            >
                <form onSubmit={submitAdd} className="space-y-4">
                    <TextInput
                        className="w-full"
                        label="Brand Name"
                        value={addForm.data.name}
                        onChange={(e) =>
                            addForm.setData("name", e.target.value)
                        }
                        error={errors?.name}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowAdd(false)}
                        >
                            Close
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={addForm.processing}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* -----------------------------------
                EDIT BRAND MODAL
            ----------------------------------- */}
            <Modal
                title="Edit Brand"
                open={showEdit}
                onClose={() => setShowEdit(false)}
            >
                <form onSubmit={submitEdit} className="space-y-4">
                    <TextInput
                        className="w-full"
                        label="Brand Name"
                        value={editForm.data.name}
                        onChange={(e) =>
                            editForm.setData("name", e.target.value)
                        }
                        error={errors?.name}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowEdit(false)}
                        >
                            Close
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={editForm.processing}
                        >
                            Update
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
