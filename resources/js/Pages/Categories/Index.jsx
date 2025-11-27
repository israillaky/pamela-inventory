import { useMemo, useState, useEffect } from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Folder, CornerDownRight } from "lucide-react";
import axios from "axios";

import Table from "@/Components/ui/Table";
import Modal from "@/Components/ui/Modal";
import Button from "@/Components/ui/Button";
import TextInput from "@/Components/ui/TextInput";
import Pagination from "@/Components/ui/Pagination";

export default function CategoriesIndex() {
  // ✅ controller sends `parents`
  const { parents, errors } = usePage().props;

  const parentRows = parents?.data || [];

  // selected parent
  const [selectedId, setSelectedId] = useState(parentRows[0]?.id || null);

  useEffect(() => {
    // when page changes, auto-select first row
    if (!selectedId && parentRows.length) {
      setSelectedId(parentRows[0].id);
    }
  }, [parentRows, selectedId]);

  /* ---------------------------
      CHILDREN (lazy loaded)
  ---------------------------- */
  const [childRows, setChildRows] = useState([]);
  const [childMeta, setChildMeta] = useState({ current_page: 1, last_page: 1 });
  const [loadingChildren, setLoadingChildren] = useState(false);

  const loadChildren = async (parentId, page = 1) => {
    if (!parentId) return;
    setLoadingChildren(true);
    try {
      const res = await axios.get(route("categories.children", parentId), {
        params: { page },
      });

      setChildRows(res.data.data || []);
      setChildMeta({
        current_page: res.data.current_page || 1,
        last_page: res.data.last_page || 1,
      });
    } finally {
      setLoadingChildren(false);
    }
  };

  useEffect(() => {
    if (selectedId) loadChildren(selectedId, 1);
  }, [selectedId]);

  const selectedCategory = useMemo(
    () => parentRows.find((p) => p.id === selectedId) || null,
    [parentRows, selectedId]
  );

  /* ---------------------------
      ADD PARENT MODAL
  ---------------------------- */
  const [showAddParent, setShowAddParent] = useState(false);
  const parentForm = useForm({ name: "" });

  const submitParent = (e) => {
    e.preventDefault();
    parentForm.post(route("categories.store"), {
      preserveScroll: true,
      onSuccess: () => {
        parentForm.reset("name");
        router.reload({ only: ["parents"] }); // refresh parent list
      },
    });
  };

  /* ---------------------------
      ADD CHILD MODAL
  ---------------------------- */
  const [showAddChild, setShowAddChild] = useState(false);
  const childForm = useForm({
    category_id: selectedId,
    name: "",
  });

  useEffect(() => {
    childForm.setData("category_id", selectedId);
  }, [selectedId]);

  const submitChild = (e) => {
    e.preventDefault();
    childForm.post(route("child-categories.store"), {
      preserveScroll: true,
      onSuccess: () => {
        childForm.reset("name");
        loadChildren(selectedId, childMeta.current_page); // refresh children
      },
    });
  };

  /* ---------------------------
      EDIT MODALS
  ---------------------------- */
  const [editParent, setEditParent] = useState(null);
  const [editChild, setEditChild] = useState(null);

  const editParentForm = useForm({ id: null, name: "" });
  const editChildForm = useForm({ id: null, name: "" });

  const startEditParent = (cat) => {
    editParentForm.setData({ id: cat.id, name: cat.name });
    setEditParent(cat);
  };

  const submitEditParent = (e) => {
    e.preventDefault();
    editParentForm.put(route("categories.update", editParentForm.data.id), {
      preserveScroll: true,
      onSuccess: () => {
        setEditParent(null);
        router.reload({ only: ["parents"] });
      },
    });
  };

  const startEditChild = (child) => {
    editChildForm.setData({ id: child.id, name: child.name });
    setEditChild(child);
  };

  const submitEditChild = (e) => {
    e.preventDefault();
    editChildForm.put(route("child-categories.update", editChildForm.data.id), {
      preserveScroll: true,
      onSuccess: () => {
        setEditChild(null);
        loadChildren(selectedId, childMeta.current_page);
      },
    });
  };

  /* ---------------------------
      DELETE
  ---------------------------- */
  const deleteParent = (id) => {
    if (!confirm("Delete this category?")) return;
    router.delete(route("categories.destroy", id), {
      preserveScroll: true,
      onSuccess: () => {
        router.reload({ only: ["parents"] });
        setSelectedId(null);
        setChildRows([]);
      },
    });
  };

  const deleteChild = (id) => {
    if (!confirm("Delete this child category?")) return;
    router.delete(route("child-categories.destroy", id), {
      preserveScroll: true,
      onSuccess: () => loadChildren(selectedId, childMeta.current_page),
    });
  };

  /* ---------------------------
      TABLE COLUMNS
  ---------------------------- */
  const parentColumns = [
    {
      key: "name",
      label: "Parent Category",
      render: (cat) => {
        const active = selectedId === cat.id;

        return (
          <button
            type="button"
            onClick={() => setSelectedId(cat.id)}
            className={`w-full text-left flex items-center gap-2 rounded-md px-2 py-1
              ${active
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "hover:bg-gpt-50 dark:hover:bg-gpt-800"}`}
          >
            <Folder size={16} className="opacity-70" />
            <span>{cat.name}</span>
          </button>
        );
      },
    },
    {
      key: "child_categories_count",
      label: "Children",
      align: "right",
      render: (cat) => cat.child_categories_count ?? 0,
    },
    {
      key: "actions",
      label: "Actions",
      render: (cat) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => startEditParent(cat)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteParent(cat.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const childColumns = [
    {
      key: "name",
      label: "Child Category",
      render: (child) => (
        <div className="flex items-center gap-2">
          <CornerDownRight size={16} className="opacity-70" />
          <span>{child.name}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (child) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => startEditChild(child)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => deleteChild(child.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AuthenticatedLayout
      header={<h2 className="text-title-sm font-semibold">Categories & Child Categories</h2>}
    >
      <Head title="Categories" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: PARENTS TABLE */}
        <div className="bg-white dark:bg-gpt-900 border border-gray-100 dark:border-gpt-700 rounded-lg p-4 shadow-theme-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Parent Categories</h3>

            <Button type="button" variant="primary" onClick={() => setShowAddParent(true)}>
              + Add Parent
            </Button>
          </div>

          <Table
            columns={parentColumns}
            rows={parentRows}
            emptyText="No parent categories."
          />

          {/* Parents Pagination (server-side links) */}
          {parents?.last_page > 1 && (
            <div className="mt-3">
              <Pagination links={parents.links} />
            </div>
          )}
        </div>

        {/* RIGHT: CHILDREN TABLE */}
        <div className="bg-white dark:bg-gpt-900 border border-gray-100 dark:border-gpt-700 rounded-lg p-4 shadow-theme-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Child Categories</h3>

            <Button
              type="button"
              variant="primary"
              onClick={() => setShowAddChild(true)}
              disabled={!selectedCategory}
            >
              + Add Child
            </Button>
          </div>

          {!selectedCategory && (
            <div className="text-sm text-gpt-500 dark:text-gpt-300">
              Select a parent category to manage children.
            </div>
          )}

          {selectedCategory && (
            <>
              <div className="mb-2 text-sm text-gpt-600 dark:text-gpt-300">
                Parent: <span className="font-semibold">{selectedCategory.name}</span>
              </div>

              {loadingChildren ? (
                <div className="text-sm text-gpt-500">Loading children...</div>
              ) : (
                <>
                  <Table
                    columns={childColumns}
                    rows={childRows}
                    emptyText="No child categories."
                  />

                  {/* Children Pagination (numeric) */}
                  {childMeta.last_page > 1 && (
                    <div className="mt-3">
                      <Pagination
                        currentPage={childMeta.current_page}
                        lastPage={childMeta.last_page}
                        onPageChange={(p) => loadChildren(selectedId, p)}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ADD PARENT MODAL */}
      <Modal title="Add Parent Category" open={showAddParent} onClose={() => setShowAddParent(false)}>
        <form onSubmit={submitParent} className="space-y-4">
          <TextInput
            label="Category Name"
            className="w-full"
            value={parentForm.data.name}
            onChange={(e) => parentForm.setData("name", e.target.value)}
            error={errors?.name}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddParent(false)}>
              Close
            </Button>

            <Button type="submit" variant="primary" disabled={parentForm.processing}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD CHILD MODAL */}
      <Modal
        title={selectedCategory ? `Add Child to ${selectedCategory.name}` : "Add Child Category"}
        open={showAddChild}
        onClose={() => setShowAddChild(false)}
      >
        <form onSubmit={submitChild} className="space-y-4">
          <TextInput
            label="Child Name"
            value={childForm.data.name}
            className="w-full"
            onChange={(e) => childForm.setData("name", e.target.value)}
            error={errors?.name}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddChild(false)}>
              Close
            </Button>

            <Button type="submit" variant="primary" disabled={childForm.processing}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PARENT MODAL */}
      <Modal title="Edit Parent Category" open={!!editParent} onClose={() => setEditParent(null)}>
        <form onSubmit={submitEditParent} className="space-y-4">
          <TextInput
            label="Category Name"
            value={editParentForm.data.name}
            className="w-full"
            onChange={(e) => editParentForm.setData("name", e.target.value)}
            error={errors?.name}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditParent(null)}>
              Close
            </Button>

            <Button type="submit" variant="primary" disabled={editParentForm.processing}>
              Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT CHILD MODAL */}
      <Modal title="Edit Child Category" open={!!editChild} onClose={() => setEditChild(null)}>
        <form onSubmit={submitEditChild} className="space-y-4">
          <TextInput
            className="w-full"
            label="Child Name"
            value={editChildForm.data.name}
            onChange={(e) => editChildForm.setData("name", e.target.value)}
            error={errors?.name}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditChild(null)}>
              Close
            </Button>

            <Button type="submit" variant="primary" disabled={editChildForm.processing}>
              Update
            </Button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
