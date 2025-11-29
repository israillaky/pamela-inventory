import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState, useEffect, useRef } from "react";

import SelectInput from "@/Components/ui/SelectInput";
import TextInput from "@/Components/ui/TextInput";
import Button from "@/Components/ui/Button";
import Table from "@/Components/ui/Table";
import Pagination from "@/Components/ui/Pagination";
import Select from "react-select";
import {
  ArrowDown, // Stock In
  ArrowUp, // Stock Out
  CircleDollarSign, // Sales In
  ReceiptText, // Sales Out
  PackageSearch, // Inventory
} from "lucide-react";

const tabs = [
  { key: "stock_in", label: "Stock In", icon: ArrowDown },
  { key: "stock_out", label: "Stock Out", icon: ArrowUp },
  { key: "sales_in", label: "Sales In", icon: CircleDollarSign },
  { key: "sales_out", label: "Sales Out", icon: ReceiptText },
  { key: "inventory", label: "Inventory", icon: PackageSearch },
];

export default function ReportsIndex() {
  const {
    tab = "stock_in",
    filters = {},
    rows: rawRows = [],
    totals = {},
    footer = {},
    products = [],
    users = [],
  } = usePage().props;

  const money = (v) => {
    const n = Number(v ?? 0);
    return (Number.isFinite(n) ? n : 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ---------- Default 30-day range (only used when backend gives no dates) ----------
  const computeDefaultDates = () => {
    const today = new Date();
    const to = today.toISOString().slice(0, 10); // YYYY-MM-DD

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const from = fromDate.toISOString().slice(0, 10);

    return { defaultFrom: from, defaultTo: to };
  };

  const { defaultFrom, defaultTo } = computeDefaultDates();

  const [activeTab, setActiveTab] = useState(tab);
  const [dateFrom, setDateFrom] = useState(
    filters.date_from || defaultFrom
  );
  const [dateTo, setDateTo] = useState(
    filters.date_to || defaultTo
  );
  const [productId, setProductId] = useState(filters.product_id || "");
  const [createdBy, setCreatedBy] = useState(filters.created_by || "");

  // paginator support
  const hasPaginator =
    rawRows && typeof rawRows === "object" && Array.isArray(rawRows.data);
  const tableRows = hasPaginator ? rawRows.data : rawRows || [];
  const paginationLinks = hasPaginator && rawRows.links ? rawRows.links : [];

  const exportParams = useMemo(
    () => ({
      tab: activeTab,
      date_from: dateFrom || null,
      date_to: dateTo || null,
      product_id: productId || null,
      created_by: createdBy || null,
    }),
    [activeTab, dateFrom, dateTo, productId, createdBy]
  );

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
        preserveState: true,
        replace: true,
        only: ["rows", "totals", "footer", "filters", "tab"],
      }
    );
  };

  // avoid resetting page on first load; but if server came with no dates, apply our default 30-day range once
  const firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;

      // If backend did not send date filters, push the default 30-day range once
      if (!filters.date_from && !filters.date_to) {
        applyFilters({
          date_from: dateFrom,
          date_to: dateTo,
        });
      }
      return;
    }

    // On later tab changes, re-apply filters (keeps current dateFrom/dateTo)
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const dateFromRef = useRef(null);
  const dateToRef = useRef(null);
  const openCalendar = (ref) => {
    if (ref?.current?.showPicker) {
      ref.current.showPicker();
    } else {
      ref?.current?.focus();
    }
  };

  const productOptions = useMemo(
    () => [
      { value: "", label: "All Products" },
      ...products.map((p) => ({
        value: String(p.id),
        label: `${p.name} (${p.sku})`,
      })),
    ],
    [products]
  );

  const selectedProductOption =
    productOptions.find((o) => o.value === String(productId)) ||
    productOptions[0];

  // Sales Out summary (sale vs non-sale split, page-level)
  const salesOutSummary = useMemo(() => {
    if (activeTab !== "sales_out") {
      return { saleSubtotal: 0, regularSubtotal: 0 };
    }

    let saleSubtotal = 0;
    let regularSubtotal = 0;

    tableRows.forEach((r) => {
      const qty = Number(r.quantity || 0);
      if (qty <= 0) return;

      const unitPrice =
        r.unit_price != null
          ? Number(r.unit_price)
          : Number(r.product?.price || 0);
      const unitSaleRaw = r.unit_sales_price;
      const unitSale =
      unitSaleRaw != null ? Number(unitSaleRaw) : null;

      const hasSale =
        unitSale != null &&
        Number.isFinite(unitSale) &&
        unitSale > 0 &&
        unitSale !== unitPrice;

      if (hasSale) {
        saleSubtotal += qty * unitSale;
      } else {
        regularSubtotal += qty * unitPrice;
      }
    });

    return { saleSubtotal, regularSubtotal };
  }, [activeTab, tableRows]);

  const columns = useMemo(() => {
    // INVENTORY
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
          key: "sales_price",
          label: "Sales Price",
          align: "right",
          render: (r) =>
            r.sales_price != null ? `₱${money(r.sales_price)}` : "—",
        },
        {
          key: "total_value",
          label: "Total @ Price",
          align: "right",
          render: (r) => `₱${money(r.total_value)}`,
        },
        {
          key: "total_value_sales",
          label: "Total @ Sales Price",
          align: "right",
          render: (r) => `₱${money(r.total_value_sales)}`,
        },
      ];
    }

    // SALES IN
    if (activeTab === "sales_in") {
      return [
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
        {
          key: "quantity",
          label: "Qty",
          align: "right",
        },
        {
          key: "price",
          label: "Price",
          align: "right",
          render: (r) => {
            const unitPrice =
              r.unit_price != null
                ? Number(r.unit_price)
                : Number(r.product?.price || 0);
            return `₱${money(unitPrice)}`;
          },
        },
        {
          key: "sales_price",
          label: "Sale Price",
          align: "right",
          render: (r) => {
            const unitSaleRaw =
              r.unit_sales_price ?? r.product?.sales_price ?? null;
            const unitSale =
              unitSaleRaw != null ? Number(unitSaleRaw) : null;
            return unitSale != null && Number.isFinite(unitSale) && unitSale > 0
              ? `₱${money(unitSale)}`
              : "—";
          },
        },
        {
          key: "total_amount",
          label: "Total Amount",
          align: "right",
          render: (r) => {
            const qty = Number(r.quantity || 0);
            const unitPrice =
              r.unit_price != null
                ? Number(r.unit_price)
                : Number(r.product?.price || 0);
            const total = qty * unitPrice;
            return `₱${money(total)}`;
          },
        },
        {
          key: "total_sales_amount",
          label: "Total Sale Amount",
          align: "right",
          render: (r) => {
            const qty = Number(r.quantity || 0);
            const unitSaleRaw =
              r.unit_sales_price ?? r.product?.sales_price ?? null;
            const unitSale =
              unitSaleRaw != null ? Number(unitSaleRaw) : null;
            const total =
              unitSale != null && Number.isFinite(unitSale) && unitSale > 0
                ? qty * unitSale
                : 0;
            return total > 0 ? `₱${money(total)}` : "—";
          },
        },

        {
          key: "note",
          label: "Note",
          render: (r) => r.note || "—",
        },
        {
          key: "timestamp",
          label: "Date",
          render: (r) =>
            new Date(r.timestamp || r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric'  }),
        },
        {
          key: "created_by",
          label: "By",
          render: (r) => r.user?.name || r.created_by,
        },
      ];
    }

    // SALES OUT
    if (activeTab === "sales_out") {
      return [
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
        {
          key: "quantity",
          label: "Qty",
          align: "right",
        },
        {
            key: "price",
            label: "Price",
            align: "right",
            render: (r) => {
                const unitPrice =
                r.unit_price != null
                    ? Number(r.unit_price)
                    : Number(r.product?.price || 0);
                const unitSaleRaw =
                r.unit_sales_price ?? r.product?.sales_price ?? null;
                const unitSale =
                unitSaleRaw != null ? Number(unitSaleRaw) : null;

                const hasSale =
                unitSale != null &&
                Number.isFinite(unitSale) &&
                unitSale > 0 &&
                unitSale !== unitPrice;

                if (hasSale) {
                return (
                    <div className="text-right text-sm">
                    <div className="text-xs text-gray-400 line-through">
                        ₱{money(unitPrice)}
                    </div>
                    <div className="font-semibold text-emerald-500">
                        ₱{money(unitSale)}
                    </div>
                    </div>
                );
                }

                return (
                <span className="tabular-nums text-sm">
                    ₱{money(unitPrice)}
                </span>
                );
            },
            },
        {
            key: "total",
            label: "Total",
            align: "right",
            render: (r) => {
                const qty = Number(r.quantity || 0);
                const unitPrice =
                r.unit_price != null
                    ? Number(r.unit_price)
                    : Number(r.product?.price || 0);

                const unitSaleRaw = r.unit_sales_price;
                const unitSale =
                unitSaleRaw != null ? Number(unitSaleRaw) : null;

                const hasSale =
                unitSale != null &&
                Number.isFinite(unitSale) &&
                unitSale > 0 &&
                unitSale !== unitPrice;

                const eff = hasSale ? unitSale : unitPrice;
                const total = qty * eff;

                return (
                <span className="tabular-nums text-sm font-medium">
                    ₱{money(total)}
                </span>
                );
            },
            },
        {
          key: "note",
          label: "Note",
          render: (r) => r.note || "—",
        },
        {
          key: "timestamp",
          label: "Date",
          render: (r) =>
            new Date(r.timestamp || r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric'  }),

        },

        {
          key: "created_by",
          label: "By",
          render: (r) => r.user?.name || r.created_by,
        },
      ];
    }

    // STOCK IN / STOCK OUT default
    return [
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
          new Date(r.timestamp || r.created_at).toLocaleString( 'en-US', { month: 'short', day: 'numeric', year: 'numeric'  }),
      },
      {
        key: "created_by",
        label: "By",
        render: (r) => r.user?.name || r.created_by,
      },
      {
        key: "note",
        label: "Note",
        render: (r) => r.note || "—",
      },
    ];
  }, [activeTab, money, tableRows]);

  const tableFooter = useMemo(() => {
    if (tableRows.length === 0) return null;

    // INVENTORY
    if (activeTab === "inventory") {
        return (
        <tr className="bg-gpt-50 dark:bg-gpt-900 text-gpt-600 dark:text-gpt-300 border-t border-gpt-200 dark:border-gpt-700">
            <td
            colSpan={2}
            className="px-3 py-2 text-xs font-semibold text-right"
            >
            Totals:
            </td>
            <td className="px-3 py-2 text-md font-semibold text-right">
            ₱{money(footer.total_price ?? 0)}
            </td>
            <td className="px-3 py-2 text-md font-semibold text-right">
            ₱{money(footer.total_sales_price ?? 0)}
            </td>
            <td className="px-3 py-2 text-md font-semibold text-right">
            ₱{money(totals.inventory_value ?? 0)}
            </td>
            <td className="px-3 py-2 text-md font-semibold text-right">
            ₱{money(totals.inventory_value_sales ?? 0)}
            </td>
        </tr>
        );
    }

    // SALES IN
    if (activeTab === "sales_in") {
        // Columns: Product, Qty, Price, Sale Price, Total Amount,
        // Total Sale Amount, Date, By, Note (9 cols)
        return (
        <tr className="bg-gpt-50 dark:bg-gpt-900 text-gpt-600 dark:text-gpt-300 border-t border-gpt-200 dark:border-gpt-700">
            <td
            colSpan={2}
            className="px-3 py-2 text-md font-semibold text-right text-gpt-900 dark:text-gpt-200"
            >
            Totals:
            </td>
            <td className="px-3 py-2" /> {/* Price */}
            <td className="px-3 py-2" /> {/* Sale Price */}
            <td className="px-3 py-2 text-md font-semibold text-right text-gpt-900 dark:text-gpt-200">
            ₱{money(totals.amount ?? 0)}
            </td>
            <td className="px-3 py-2 text-md font-semibold text-right text-gpt-900 dark:text-gpt-200">
            ₱{money(totals.sale_amount ?? 0)}
            </td>
            <td className="px-3 py-2" /> {/* Date */}
            <td className="px-3 py-2" /> {/* By */}
            <td className="px-3 py-2" /> {/* Note */}
        </tr>
        );
    }

    // SALES OUT
    if (activeTab === "sales_out") {
        // Columns: Product, Qty, Price, Total, Date, By, Note (7 cols)
        return (
        <tr className="bg-gpt-50 dark:bg-gpt-900 text-gpt-600 dark:text-gpt-300 border-t border-gpt-200 dark:border-gpt-700">
            <td
            colSpan={3}
            className="px-3 py-2 text-md font-semibold text-right text-gpt-900 dark:text-gpt-200"
            >
            Total:
            </td>
            <td className="px-3 py-2 text-md font-semibold text-right text-gpt-900 dark:text-gpt-200">
            ₱{money(totals.amount ?? 0)}
            </td>
            <td className="px-3 py-2" /> {/* Date */}
            <td className="px-3 py-2" /> {/* By */}
            <td className="px-3 py-2" /> {/* Note */}
        </tr>
        );
    }

    // STOCK IN / STOCK OUT: no tfoot
    return null;
    }, [activeTab, tableRows, totals, footer, money]);

  const totalQty = totals.qty ?? 0;

  function triggerDownload(url) {
    const link = document.createElement("a");
    link.href = url;
    link.download = ""; // allow file to download normally
    document.body.appendChild(link);
    link.click();
    link.remove();
}

  const exportCsv = () => {
     triggerDownload(route("reports.export.csv", exportParams));
  };
  const exportPdf = () => {
    triggerDownload(route("reports.export.pdf", exportParams));
  };
  const printView = () => {
    window.open(route("reports.print", exportParams), "_blank");
  };

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
              ${
                activeTab === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-gpt-100 dark:bg-gpt-800 text-gray-700 dark:text-gpt-300"
              }
            `}
          >
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

        <SelectInput
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
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
              setDateFrom(defaultFrom);
              setDateTo(defaultTo);
              setProductId("");
              setCreatedBy("");
              applyFilters({
                date_from: defaultFrom,
                date_to: defaultTo,
                product_id: null,
                created_by: null,
              });
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Export Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={exportCsv}
          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium
                     bg-gpt-100 dark:bg-gpt-800 text-gray-700 dark:text-gpt-200
                     hover:bg-gpt-200 dark:hover:bg-gpt-700 transition"
        >
          Export CSV
        </button>

        <button
          onClick={exportPdf}
          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium
                     bg-gpt-100 dark:bg-gpt-800 text-gray-700 dark:text-gpt-200
                     hover:bg-gpt-200 dark:hover:bg-gpt-700 transition"
        >
          Export PDF
        </button>

        <button
          onClick={printView}
          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium
                     bg-gpt-100 dark:bg-gpt-800 text-gray-700 dark:text-gpt-200
                     hover:bg-gpt-200 dark:hover:bg-gpt-700 transition"
        >
          Print
        </button>
      </div>

      {/* Table */}
      <Table columns={columns} rows={tableRows} emptyText="No records found." footer={tableFooter} />

      {/* Pagination */}
      {paginationLinks.length > 0 && (
        <div className="mb-4">
            <Pagination links={paginationLinks} />
        </div>
        )}

      {/* Totals / Footer Cards */}
      {activeTab !== "inventory" && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
            <div className="text-xs text-gray-400 dark:text-gpt-400">
              Total Qty
            </div>
            <div className="text-lg font-semibold">{totalQty}</div>
          </div>

          {/* SALES IN FOOTER */}
          {activeTab === "sales_in" && (
            <>
              <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
                <div className="text-xs text-gray-400 dark:text-gpt-400">
                  Total Product Amount
                </div>
                <div className="text-lg font-semibold">
                  ₱{money(totals.amount ?? 0)}
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
                <div className="text-xs text-gray-400 dark:text-gpt-400">
                  Total Product Sale Amount
                </div>
                <div className="text-lg font-semibold">
                  ₱{money(totals.sale_amount ?? 0)}
                </div>
              </div>
            </>
          )}

          {/* SALES OUT FOOTER */}
          {activeTab === "sales_out" && (
            <>
              <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
                <div className="text-xs text-gray-400 dark:text-gpt-400">
                  Subtotal (Sale items)
                </div>
                <div className="text-lg font-semibold">
                  ₱{money(salesOutSummary.saleSubtotal)}
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
                <div className="text-xs text-gray-400 dark:text-gpt-400">
                  Subtotal (Non-sale items)
                </div>
                <div className="text-lg font-semibold">
                  ₱{money(salesOutSummary.regularSubtotal)}
                </div>
              </div>
              <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
                <div className="text-xs text-gray-400 dark:text-gpt-400">
                  Final Total
                </div>
                <div className="text-lg font-semibold">
                  ₱{money(totals.amount ?? 0)}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* INVENTORY FOOTER (includes footer.total_price, footer.total_sales_price) */}
      {activeTab === "inventory" && (
        <>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
              <div className="text-xs text-gray-400 dark:text-gpt-400">
                Total Products
              </div>
              <div className="text-lg font-semibold">
                {totals.total_products ?? 0}
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
              <div className="text-xs text-gray-400 dark:text-gpt-400">
                Total Remaining Qty
              </div>
              <div className="text-lg font-semibold">
                {totals.remaining_qty ?? 0}
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
              <div className="text-xs text-gray-400 dark:text-gpt-400">
                Total Inventory Value
              </div>
              <div className="text-lg font-semibold">
                ₱{money(totals.inventory_value ?? 0)}
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
              <div className="text-xs text-gray-400 dark:text-gpt-400">
                Value @ Sales Price
              </div>
              <div className="text-lg font-semibold">
                ₱{money(totals.inventory_value_sales ?? 0)}
              </div>
            </div>
          </div>

          {/* extra row for footer totals based on footer.total_price / footer.total_sales_price */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
              <div className="text-xs text-gray-400 dark:text-gpt-400">
                Total Product Price
              </div>
              <div className="text-lg font-semibold">
                ₱{money(footer.total_price ?? 0)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-3">
              <div className="text-xs text-gray-400 dark:text-gpt-400">
                Total Product Sales Price
              </div>
              <div className="text-lg font-semibold">
                ₱{money(footer.total_sales_price ?? 0)}
              </div>
            </div>
          </div>
        </>
      )}
    </AuthenticatedLayout>
  );
}
