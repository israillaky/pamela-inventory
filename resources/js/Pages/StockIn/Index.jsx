import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

import TextInput from "@/Components/ui/TextInput";
import Button from "@/Components/ui/Button";
import Table from "@/Components/ui/Table";
import Pagination from "@/Components/ui/Pagination";
import { Pencil, Trash } from "lucide-react";

export default function StockInIndex() {
  const { stockIns, flash } = usePage().props;

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

  // prevent searching when we set query from selectProduct
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

  // ultra-strong qty focus
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

  // fetch suggestions (manual typing OR scan)
  useEffect(() => {
    // skip if we just set query programmatically
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
        const res = await axios.get(route("stock-in.products.search"), {
          params: { q: query },
        });

        const list = res.data || [];
        setSuggestions(list);
        setOpenSuggest(true);
        setHighlight(0);

        // auto-select if single exact match (scanner)
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
    // prevent next query-change from causing search
    suppressSearchRef.current = true;

    setSelectedProduct(p);
    addForm.setData("product_id", p.id);

    // show selected value but don't re-search it
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

    //showToast(`Unknown barcode / SKU: ${q}`, "error");
    return false;
  };

  const onSearchKeyDown = (e) => {
    if (!openSuggest || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        tryExactSelect(); // select only, NOT add
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
      if (chosen) selectProduct(chosen); // select only
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

    addForm.post(route("stock-in.store"), {
      preserveScroll: true,
      onSuccess: () => {
        beepSuccess();
        showToast("Added successfully", "success");

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

  // Enter in qty triggers add
  const onQtyKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitAdd();
    }
  };

  /* ---------------------------
      Inline edit existing rows
  ----------------------------*/
  const updateQty = (row, qty) => {
    router.put(
      route("stock-in.update", row.id),
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
    if (!confirm("Delete this Stock In record?")) return;
    router.delete(route("stock-in.destroy", id), { preserveScroll: true });
  };

  // edit state
  const [editingQtyId, setEditingQtyId] = useState(null);
  const [draftQty, setDraftQty] = useState({});

  const rows = stockIns?.data || [];

  /* ---------------------------
      Pricing helpers (snapshot-aware)
  ----------------------------*/
  const getUnitPrice = (r) => {
    // Prefer snapshot (historical) if available
    const fromSnapshot =
      r.price_snapshot?.unit_price ??
      r.product_price_snapshot?.unit_price ??
      null;

    const fromProduct = r.product?.price ?? null;

    const raw = fromSnapshot ?? fromProduct ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const getUnitSalesPrice = (r) => {
    const fromSnapshot =
      r.price_snapshot?.unit_sales_price ??
      r.product_price_snapshot?.unit_sales_price ??
      null;

    const fromProduct = r.product?.sales_price ?? null;

    const raw = fromSnapshot ?? fromProduct;
    if (raw == null) return null;

    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const formatMoney = (value) => {
    if (!Number.isFinite(value)) return "—";
    if (value <= 0) return "—";

    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // separate formatter for totals (always show 0.00+)
  const formatMoneyTotal = (value) => {
    if (!Number.isFinite(value)) value = 0;
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* ---------------------------
      Totals (for footer)
  ----------------------------*/
  const totals = useMemo(() => {
    let totalQty = 0;
    let totalProductPrice = 0;
    let totalAmount = 0;
    let totalProductSalesPrice = 0;
    let totalSalesAmount = 0;

    rows.forEach((r) => {
      const qty = Number(r.quantity || 0);
      const unitPrice = getUnitPrice(r);
      const unitSales = getUnitSalesPrice(r) ?? 0;

      totalQty += qty;
      totalProductPrice += unitPrice;
      totalAmount += qty * unitPrice;
      totalProductSalesPrice += unitSales;
      totalSalesAmount += qty * unitSales;
    });

    return {
      totalQty,
      totalProductPrice,
      totalAmount,
      totalProductSalesPrice,
      totalSalesAmount,
    };
  }, [rows]);

  /* ---------------------------
      Table columns
  ----------------------------*/
  const columns = useMemo(
    () => [
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <div className="leading-tight">
            <div className="text-md font-medium text-gpt-900 dark:text-gpt-100">
              {r.product?.name || "—"}
            </div>
            <div className="text-xs text-gray-400 dark:text-gpt-400">
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
        key: "amount",
        label: "Product Price",
        align: "right",
        render: (r) => {
          const qty = Number(r.quantity || 0);
          const unitPrice = getUnitPrice(r);
          const amount = unitPrice;

          return (
            <span className="tabular-nums text-sm">
              ₱ {formatMoney(amount)}
            </span>
          );
        },
      },
      {
        key: "amount",
        label: "Amount",
        align: "right",
        render: (r) => {
          const qty = Number(r.quantity || 0);
          const unitPrice = getUnitPrice(r);
          const amount = qty * unitPrice;

          return (
            <span className="tabular-nums text-sm">
              ₱ {formatMoney(amount)}
            </span>
          );
        },
      },
      {
        key: "sale_price",
        label: "Product Sales Price",
        align: "right",
        render: (r) => {
          const qty = Number(r.quantity || 0);
          const unitSalesPrice = getUnitSalesPrice(r);
          const salesTotal = unitSalesPrice ?? 0;

          return (
            <span className="tabular-nums text-sm">
              ₱ {formatMoney(salesTotal)}
            </span>
          );
        },
      },
      /*{
        key: "timestamp",
        label: "Date",
        render: (r) =>
          new Date(r.timestamp || r.created_at).toLocaleString(),
      },
      {
        key: "created_by",
        label: "Created By",
        render: (r) => (
          <span className="text-sm">
            {r.creator?.name ??
              (r.created_by ? `User #${r.created_by}` : "—")}
          </span>
        ),
      },*/
      {
        key: "note",
        label: "Note",
        render: (r) => r.note || "—",
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (r) => (
          <div className="flex justify-end gap-2">

            <Button
              size="sm"
             className="px-1 py-1 border-0   hover:bg-blue-100 dark:hover:bg-blue-900/30"
              variant="outline"
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
              variant="outline"
              onClick={() => destroyRow(r.id)}
             className="px-1 py-1 border-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Trash size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [editingQtyId, draftQty]
  );
  /* ---------------------------
      Table footer (tfoot)
  ----------------------------*/
  const tableFooter = useMemo(() => {
    if (!rows.length) return null;

    // Columns: Product | Qty | Product Price | Amount | Product Sales Price | Sales Amount | Note | Actions
    return (
      <tr className="bg-gpt-50 dark:bg-gpt-900 text-gpt-900 dark:text-gpt-200 border-t border-gpt-200 dark:border-gpt-700">
        <td className="px-3 py-2 text-xs font-semibold text-right">
          Totals:
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-center">
          {totals.totalQty}
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-right">
          ₱ {formatMoneyTotal(totals.totalProductPrice)}
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-right">
          ₱ {formatMoneyTotal(totals.totalAmount)}
        </td>
        <td className="px-3 py-2 text-sm font-semibold text-right">
          ₱ {formatMoneyTotal(totals.totalProductSalesPrice)}
        </td>
        <td className="px-3 py-2" colSpan={3} />
      </tr>
    );
  }, [rows, totals]);

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold">Stock In</h2>}
    >
      <Head title="Stock In" />

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

      {/* Backend flash */}
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

            {/* Suggestions dropdown */}
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
                      <div className="text-xs text-gray-400 dark:text-gpt-400">
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
            className="w-24 min-w-[7.5rem] h-11 text-center"
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
      <Table columns={columns} rows={rows} empty="No Stock In yet." footer={tableFooter} />
      <div className="mb-4">
        <Pagination meta={stockIns} />
      </div>

      {/* Optional extra summary card if you still want it */}
      {rows.length > 0 && (
        <div className="mt-3 flex justify-end">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm
                          dark:border-gray-800 dark:bg-gpt-900">
            <div className="flex justify-between gap-6">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Total Qty:
              </span>
              <span className="tabular-nums text-gray-900 dark:text-gray-100">
                {totals.totalQty}
              </span>
            </div>

            <div className="mt-1 flex justify-between gap-6">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Total Product Price:
              </span>
              <span className="tabular-nums text-gray-900 dark:text-gray-100">
                ₱ {formatMoneyTotal(totals.totalProductPrice)}
              </span>
            </div>

            <div className="mt-1 flex justify-between gap-6">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Total Amount:
              </span>
              <span className="tabular-nums text-gray-900 dark:text-gray-100">
                ₱ {formatMoneyTotal(totals.totalAmount)}
              </span>
            </div>

            <div className="mt-1 flex justify-between gap-6">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Total Product Sales Price:
              </span>
              <span className="tabular-nums text-gray-900 dark:text-gray-100">
                ₱ {formatMoneyTotal(totals.totalProductSalesPrice)}
              </span>
            </div>

            <div className="mt-1 flex justify-between gap-6">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Total Sales Amount:
              </span>
              <span className="tabular-nums text-gray-900 dark:text-gray-100">
                ₱ {formatMoneyTotal(totals.totalSalesAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

    </AuthenticatedLayout>
  );
}
