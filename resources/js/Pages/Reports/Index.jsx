import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState, useEffect, useRef } from "react";

import SelectInput from "@/Components/ui/SelectInput";
import TextInput from "@/Components/ui/TextInput";
import Button from "@/Components/ui/Button";
import Table from "@/Components/ui/Table";
import Select from "react-select";
import {
  ArrowDown,    // Stock In
  ArrowUp,      // Stock Out
  CircleDollarSign, // Sales In
  ReceiptText,   // Sales Out
  PackageSearch  // Inventory
} from "lucide-react";


const tabs = [
  {
    key: "stock_in",
    label: "Stock In",
    icon: ArrowDown,
  },
  {
    key: "stock_out",
    label: "Stock Out",
    icon: ArrowUp,
  },
  {
    key: "sales_in",
    label: "Sales In",
    icon: CircleDollarSign,
  },
  {
    key: "sales_out",
    label: "Sales Out",
    icon: ReceiptText,
  },
  { key: "inventory", label: "Inventory", icon: PackageSearch }, // NEW
];


export default function ReportsIndex() {
  const {
    tab = "stock_in",
    filters = {},
    rows = [],
    totals = {},
    footer = {},
    products = [],
    users = [],
  } = usePage().props;

    // put this near the top of the component
    const money = (v) => {
    const n = Number(v ?? 0);
    return (Number.isFinite(n) ? n : 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    };


  const [activeTab, setActiveTab] = useState(tab);
  const [dateFrom, setDateFrom] = useState(filters.date_from || "");
  const [dateTo, setDateTo] = useState(filters.date_to || "");
  const [productId, setProductId] = useState(filters.product_id || "");
  const [createdBy, setCreatedBy] = useState(filters.created_by || "");

  // Build export/print URLs with current filters
  const exportParams = useMemo(() => {
    return {
      tab: activeTab,
      date_from: dateFrom || null,
      date_to: dateTo || null,
      product_id: productId || null,
      created_by: createdBy || null,
    };
  }, [activeTab, dateFrom, dateTo, productId, createdBy]);

  const applyFilters = (next = {}) => {
  router.get(
    route("reports.index"),
    {
      tab: activeTab,
      date_from: dateFrom || null,
      date_to: dateTo || null,
      product_id: productId || null,
      created_by: createdBy || null,
      ...next,
    },
    {
      preserveScroll: true,
      preserveState: true, // ✅ IMPORTANT: stops remount loop
      replace: true,
      only: ["rows", "totals", "footer", "filters", "tab"],
    }
  );
};


  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);


  const columns = useMemo(() => {
    // INVENTORY TAB COLUMNS
    if (activeTab === "inventory") {
        return [
        {
            key: "name",
            label: "Product",
            render: (r) => (
            <div className="leading-tight">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-gray-400">
                {r.sku} • {r.barcode}
                </div>
            </div>
            ),
        },
        {
            key: "remaining_qty",
            label: "Remaining Qty",
            align: "right",
            render: (r) => r.remaining_qty,
        },
        {
            key: "price",
            label: "Price",
            align: "right",
            render: (r) => `₱${money(r.price)}`,
        },
        {
            key: "total_value",
            label: "Total Value",
            align: "right",
            render: (r) => `₱${money(r.total_value)}`,
        },
        ];
    }
    const base = [
      {
        key: "product",
        label: "Product",
        render: (r) => (
          <div className="leading-tight">
            <div className="font-medium">{r.product?.name}</div>
            <div className="text-xs text-gray-400">
              {r.product?.sku} • {r.product?.barcode}
            </div>
          </div>
        ),
      },
      { key: "quantity", label: "Qty", align: "right" },
      {
        key: "timestamp",
        label: "Date",
        render: (r) =>
          new Date(r.timestamp || r.created_at).toLocaleString(),
      },
      {
        key: "created_by",
        label: "By",
        render: (r) => r.user?.name || r.created_by,
     },

      { key: "note", label: "Note", render: (r) => r.note || "—" },
    ];

    if (activeTab === "sales_in" || activeTab === "sales_out") {
      base.splice(2, 0, {
        key: "amount",
        label: "Amount",
        align: "right",
        render: (r) => {
            const price = Number(r.product?.price || 0);
            const qty = Number(r.quantity || 0);
            return `₱${money(price * qty)}`;
        },
      });
    }

    return base;
  }, [activeTab]);

  const totalQty = totals.qty ?? 0;
  const totalAmount = totals.amount ?? 0;
  const dateFromRef = useRef(null);
  const dateToRef = useRef(null);
  const openCalendar = (ref) => {
        // Chrome/Edge: showPicker exists
        if (ref?.current?.showPicker) {
            ref.current.showPicker();
        } else {
            // fallback: just focus
            ref?.current?.focus();
        }
  };
  const productOptions = useMemo(() => {
        return [
            { value: "", label: "All Products" },
            ...products.map((p) => ({
            value: String(p.id),
            label: `${p.name} (${p.sku})`,
            })),
        ];
 }, [products]);

 const selectedProductOption =
    productOptions.find((o) => o.value === String(productId)) ||
    productOptions[0];


  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Reports</h2>}>
      <Head title="Reports" />

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`
                px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1
                ${activeTab === t.key
                ? "bg-blue-600 text-white"
                : "bg-gpt-100 dark:bg-gpt-800 text-gray-700 dark:text-gpt-300"}
            `}
          >
             {/* Icon after text */}
             <t.icon size={16} className="opacity-80" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <TextInput
          ref={dateFromRef}
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          onClick={() => openCalendar(dateFromRef)}
          onFocus={() => openCalendar(dateFromRef)}
        />
        <TextInput
          ref={dateToRef}
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          onClick={() => openCalendar(dateToRef)}
          onFocus={() => openCalendar(dateToRef)}
        />

        <div className="md:col-span-1">
            <Select
                value={selectedProductOption}
                options={productOptions}
                onChange={(opt) => setProductId(opt?.value || "")}
                isSearchable
                placeholder="All Products"
                className="text-sm"
                classNamePrefix="rs"
                menuPortalTarget={document.body}
                styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                theme={(theme) => ({
                ...theme,
                borderRadius: 8,
                })}
            />
        </div>

        <SelectInput value={createdBy} onChange={(e) => setCreatedBy(e.target.value)}>
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </SelectInput>

        <div className="flex gap-2">
          <Button type="button" variant="primary" onClick={() => applyFilters()}>
            Apply
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setProductId("");
              setCreatedBy("");
              applyFilters({
                date_from: null,
                date_to: null,
                product_id: null,
                created_by: null,
              });
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Export Bar (use normal anchors, not Inertia) */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <a
          href={route("reports.export.csv", exportParams)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium
                     bg-gpt-100 dark:bg-gpt-800 text-gray-700 dark:text-gpt-200
                     hover:bg-gpt-200 dark:hover:bg-gpt-700 transition"
        >
          Export CSV
        </a>

        <a
          href={route("reports.export.pdf", exportParams)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium
                     bg-gpt-100 dark:bg-gpt-800 text-gray-700 dark:text-gpt-200
                     hover:bg-gpt-200 dark:hover:bg-gpt-700 transition"
        >
          Export PDF
        </a>

        <a
          href={route("reports.print", exportParams)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium
                     bg-gpt-100 dark:bg-gpt-800 text-gray-700 dark:text-gpt-200
                     hover:bg-gpt-200 dark:hover:bg-gpt-700 transition"
        >
          Print
        </a>
      </div>


      {/* Table */}
      <Table columns={columns} rows={rows} emptyText="No records found." />

      {/* Totals Bar (for current tab) */}
      {activeTab !== "inventory" && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
            <div className="text-xs text-gray-400 dark:text-gpt-400">Total Qty</div>
            <div className="text-lg font-semibold">{totals.qty ?? 0}</div>
            </div>

            {(activeTab === "sales_in" || activeTab === "sales_out") && (
            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
                <div className="text-xs text-gray-400 dark:text-gpt-400">Total Amount</div>
                <div className="text-lg font-semibold">
                ₱{money(totals.amount ?? 0)}
                </div>
            </div>
            )}
        </div>
        )}

        {activeTab === "inventory" && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
            <div className="text-xs text-gray-400 dark:text-gpt-400">Total Products</div>
            <div className="text-lg font-semibold">{totals.total_products ?? 0}</div>
            </div>

            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
            <div className="text-xs text-gray-400 dark:text-gpt-400">Total Remaining Qty</div>
            <div className="text-lg font-semibold">{totals.remaining_qty ?? 0}</div>
            </div>

            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
            <div className="text-xs text-gray-400 dark:text-gpt-400">Total Inventory Value</div>
            <div className="text-lg font-semibold">
                ₱{money(totals.inventory_value ?? 0)}
            </div>
            </div>

            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
            <div className="text-xs text-gray-400 dark:text-gpt-400">Value @ Sales Price</div>
            <div className="text-lg font-semibold">
                ₱{money(totals.inventory_value_sales ?? 0)}
            </div>
            </div>
        </div>
        )}


      {/* Footer Totals (Products summary) */}
      <div className="mt-6 rounded-xl border border-gray-100 dark:border-gpt-700 bg-gpt-50 dark:bg-gpt-800 p-4">
        <div className="mb-2 font-semibold text-gpt-800 dark:text-gpt-100">
          Products Summary
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-white dark:bg-gpt-900 p-3 border border-gray-100 dark:border-gpt-700">
            <span>Total Products</span>
            <span className="font-semibold">{footer.total_products ?? 0}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white dark:bg-gpt-900 p-3 border border-gray-100 dark:border-gpt-700">
            <span>Total Price</span>
            <span className="font-semibold">
              ₱{money(footer.total_price ?? 0)}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white dark:bg-gpt-900 p-3 border border-gray-100 dark:border-gpt-700">
            <span>Total Sales Price</span>
            <span className="font-semibold">
              ₱{money(footer.total_sales_price ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
