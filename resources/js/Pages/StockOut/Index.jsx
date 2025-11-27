import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import TextInput from "@/Components/ui/TextInput";
import Button from "@/Components/ui/Button";
import Table from "@/Components/ui/Table";
import Pagination from "@/Components/ui/Pagination";
import { Pencil } from "lucide-react";

export default function StockOutIndex() {
  const { stockOuts, flash } = usePage().props;

  /* ---------------------------
      Toast + Beep
  ----------------------------*/
  const [toast, setToast] = useState({ show: false, type: "info", message: "" });
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "info") => {
    setToast({ show: true, type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 1800);
  };

  const beepSuccess = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 120);
    } catch {}
  };

  /* ---------------------------
      Scanner / Search
  ----------------------------*/
  const inputRef = useRef(null);
  const qtyRef = useRef(null);
  const noteRef = useRef(null);

  const suppressSearchRef = useRef(false);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const addForm = useForm({
    product_id: "",
    quantity: 1,
    note: "",
    timestamp: "",
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusQtyStrong = () => {
    let tries = 0;
    const tick = () => {
      tries++;
      qtyRef.current?.focus();
      qtyRef.current?.select?.();
      if (tries < 4) setTimeout(tick, 30);
    };
    tick();
  };

  useEffect(() => {
    if (suppressSearchRef.current) {
      suppressSearchRef.current = false;
      return;
    }

    if (!query.trim()) {
      setSuggestions([]);
      setOpenSuggest(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoadingSuggest(true);
        const res = await axios.get(route("stock-out.products.search"), {
          params: { q: query },
        });

        const list = res.data || [];
        setSuggestions(list);
        setOpenSuggest(true);
        setHighlight(0);

        const q = query.trim().toLowerCase();
        if (list.length === 1) {
          const p = list[0];
          const isExact =
            String(p.barcode || "").toLowerCase() === q ||
            String(p.sku || "").toLowerCase() === q;

          if (isExact) {
            selectProduct(p);
            return;
          }
        }
      } catch {
        setSuggestions([]);
        setOpenSuggest(false);
      } finally {
        setLoadingSuggest(false);
      }
    }, 180);

    return () => clearTimeout(t);
  }, [query]);

  const selectProduct = (p) => {
    suppressSearchRef.current = true;

    setSelectedProduct(p);
    addForm.setData("product_id", p.id);

    setQuery(`${p.barcode || p.sku} - ${p.name}`);
    setOpenSuggest(false);
    setSuggestions([]);

    focusQtyStrong();
  };

  const tryExactSelect = () => {
    const q = query.trim();
    if (!q) return false;

    const exact = suggestions.find(
      (p) =>
        String(p.barcode || "").toLowerCase() === q.toLowerCase() ||
        String(p.sku || "").toLowerCase() === q.toLowerCase()
    );

    if (exact) {
      selectProduct(exact);
      return true;
    }

    showToast(`Unknown barcode / SKU: ${q}`, "error");
    return false;
  };

  const onSearchKeyDown = (e) => {
    if (!openSuggest || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        tryExactSelect();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = suggestions[highlight];
      if (chosen) selectProduct(chosen);
    } else if (e.key === "Escape") {
      setOpenSuggest(false);
    }
  };

  /* ---------------------------
      Add (ONLY from qty-enter or Add button)
  ----------------------------*/
  const submitAdd = () => {
    if (!selectedProduct || !addForm.data.product_id) {
      showToast("Select a product first", "error");
      inputRef.current?.focus();
      return;
    }

    const qty = Number(addForm.data.quantity || 1);
    if (qty < 1) {
      showToast("Quantity must be at least 1", "error");
      focusQtyStrong();
      return;
    }

    addForm.post(route("stock-out.store"), {
      preserveScroll: true,
      onSuccess: () => {
        beepSuccess();
        showToast("Stock Out added", "success");

        setSelectedProduct(null);
        setQuery("");
        setSuggestions([]);
        setOpenSuggest(false);

        addForm.setData({
          product_id: "",
          quantity: 1,
          note: "",
          timestamp: "",
        });

        inputRef.current?.focus();
      },
    });
  };

  const onQtyKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitAdd();
    }
  };

  /* ---------------------------
      Inline edit existing rows (ONLY via icon)
  ----------------------------*/
  const updateQty = (row, qty) => {
    router.put(
      route("stock-out.update", row.id),
      {
        product_id: row.product_id,
        quantity: qty,
        note: row.note || "",
        timestamp: row.timestamp || row.created_at,
      },
      { preserveScroll: true }
    );
  };

  const destroyRow = (id) => {
    if (!confirm("Delete this Stock Out record?")) return;
    router.delete(route("stock-out.destroy", id), { preserveScroll: true });
  };

  // NEW: edit state (input only shows after clicking edit icon)
  const [editingQtyId, setEditingQtyId] = useState(null);
  const [draftQty, setDraftQty] = useState({});

  const rows = stockOuts?.data || [];

  const columns = useMemo(
    () => [
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <div className="leading-tight">
            <div className="font-medium text-gpt-900 dark:text-gpt-100">
              {r.product?.name || "—"}
            </div>
            <div className="text-xs text-gpt-400 dark:text-gpt-400">
              {r.product?.sku} • {r.product?.barcode}
            </div>
          </div>
        ),
      },
      {
        key: "quantity",
        label: "Qty",
        align: "center",
        render: (r) => {
          const isEditing = editingQtyId === r.id;

          if (!isEditing) {
            return <span className="text-sm">{r.quantity}</span>;
          }

          return (
            <input
              type="number"
              min="1"
              className="w-20 rounded-md border border-gpt-300 bg-white px-2 py-1 text-sm text-center
                         dark:border-gpt-700 dark:bg-gpt-800 dark:text-gpt-100"
              value={draftQty[r.id] ?? r.quantity}
              onChange={(e) =>
                setDraftQty((p) => ({ ...p, [r.id]: e.target.value }))
              }
              autoFocus
              onBlur={(e) => {
                const v = Number(e.target.value || 1);
                if (v !== r.quantity) updateQty(r, v);
                setEditingQtyId(null);
              }}
            />
          );
        },
      },
      {
        key: "timestamp",
        label: "Date",
        render: (r) =>
          new Date(r.timestamp || r.created_at).toLocaleString(),
      },
      { key: "note", label: "Note", render: (r) => r.note || "—" },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (r) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditingQtyId(r.id);
                setDraftQty((p) => ({ ...p, [r.id]: r.quantity }));
              }}
              title="Edit Qty"
            >
              <Pencil size={16} />
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => destroyRow(r.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [editingQtyId, draftQty]
  );

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold">Stock Out</h2>}
    >
      <Head title="Stock Out" />

      {/* Toast */}
      {toast.show && (
        <div
          className={`
            fixed top-5 right-5 z-50 rounded-lg px-4 py-2 text-sm shadow-lg
            ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-gpt-800 text-white"
            }
          `}
        >
          {toast.message}
        </div>
      )}

      {flash?.success && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-green-700 dark:bg-green-900/30 dark:text-green-200">
          {flash.success}
        </div>
      )}

      {/* Scan/Search + Qty + Add */}
      <div className="mb-2 w-full max-w-3xl">
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <TextInput
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedProduct(null);
                addForm.setData("product_id", "");
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Scan barcode or type name / SKU..."
              className="w-full h-11"
            />

            {openSuggest && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-100 bg-white shadow-lg
                              dark:border-gpt-700 dark:bg-gpt-900">
                {loadingSuggest && (
                  <div className="px-3 py-2 text-sm text-gpt-500 dark:text-gpt-400">
                    Searching...
                  </div>
                )}

                {!loadingSuggest &&
                  query.trim() !== "" &&
                  suggestions.length === 0 &&
                  !selectedProduct && (
                    <div className="px-3 py-2 text-sm text-gpt-500 dark:text-gpt-400">
                      No matches
                    </div>
                  )}

                {!loadingSuggest &&
                  suggestions.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectProduct(p);
                      }}
                      onMouseEnter={() => setHighlight(i)}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        i === highlight
                          ? "bg-gpt-100 dark:bg-gpt-800"
                          : "bg-transparent"
                      }`}
                    >
                      <div className="font-medium text-gpt-900 dark:text-gpt-100">
                        {p.name}
                      </div>
                      <div className="text-xs text-gpt-400 dark:text-gpt-400">
                        SKU: {p.sku} • BAR: {p.barcode}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <TextInput
            ref={qtyRef}
            type="number"
            min="1"
            value={addForm.data.quantity}
            onChange={(e) =>
              addForm.setData("quantity", Number(e.target.value || 1))
            }
            onKeyDown={onQtyKeyDown}
            className="w-24 h-11 text-center"
            title="Quantity"
          />

          <Button
            type="button"
            onClick={submitAdd}
            disabled={addForm.processing}
            className="h-11 px-6"
          >
            {addForm.processing ? "Adding..." : "Add"}
          </Button>
        </div>

        {/* Optional Note */}
        <div className="mt-2">
          <TextInput
            ref={noteRef}
            value={addForm.data.note}
            onChange={(e) => addForm.setData("note", e.target.value)}
            placeholder="Note (optional)"
            className="w-full h-11"
          />
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} rows={rows} empty="No Stock Out yet." />

      <div className="mt-4">
        <Pagination links={stockOuts?.links || []} />
      </div>
    </AuthenticatedLayout>
  );
}
