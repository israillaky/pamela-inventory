import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
  ArrowDown,
  ArrowUp,
  CircleDollarSign,
  ReceiptText,
  Package,
  Boxes
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useEffect, useState } from "react";

function useIsDarkMode() {
  const getDark = () =>
    document.documentElement.classList.contains("dark");

  const [isDark, setIsDark] = useState(getDark());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getDark());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

const money = (n) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const num = (n) => new Intl.NumberFormat().format(Number(n || 0));

function KpiCard({ title, value, icon: Icon, href, subtitle }) {
  return (
    <Link
      href={href}
      className="
        group block rounded-2xl border border-gray-100 dark:border-gpt-700
        bg-white dark:bg-gpt-900 p-5 shadow-theme-xs
        hover:border-sidebarActive-500/60 dark:hover:border-sidebarActive-500/60
        transition-all duration-200
      "
    >
      <div className="flex items-center justify-between">
        <div
          className="grid place-items-center h-10 w-10 rounded-xl
                     bg-sidebarActive-50 dark:bg-sidebarActive-500/10"
        >
          <Icon className="text-sidebarActive-500" size={20} />
        </div>

        <div className="text-xs text-gray-400 dark:text-gpt-400 group-hover:text-sidebarActive-500 transition">
          View report →
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-gpt-500 dark:text-gpt-400">{title}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">
          {value}
        </div>

        {subtitle && (
          <div className="mt-1 text-xs text-gray-400 dark:text-gpt-400">
            {subtitle}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { totals, graphData = [], auth } = usePage().props;
  const isDark = useIsDarkMode();

  const role = auth?.user?.role;
  const userId = auth?.user?.id;
  const isCashier = role === "cashier";

  const chartColors = { /* ...same as before... */ };

  // 🔹 Base report params: cashier auto-filters by created_by
  const baseReportParams = isCashier && userId
    ? { created_by: userId }
    : {};

  const reportUrls = {
    stock_in: route("reports.index", { ...baseReportParams, tab: "stock_in" }),
    stock_out: route("reports.index", { ...baseReportParams, tab: "stock_out" }),
    sales_in: route("reports.index", { ...baseReportParams, tab: "sales_in" }),
    sales_out: route("reports.index", { ...baseReportParams, tab: "sales_out" }),
  };

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Dashboard</h2>}>
      <Head title="Dashboard" />

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* ✦ Admin/Staff/Warehouse Manager Only */}
        {!isCashier && (
          <KpiCard
            title="Total Stock In"
            value={num(totals.stock_in_qty)}
            icon={ArrowDown}
            href={reportUrls.stock_in}
          />
        )}

        {/* Everyone sees Stock Out */}
        <KpiCard
          title="Total Stock Out"
          value={num(totals.stock_out_qty)}
          icon={ArrowUp}
          href={reportUrls.stock_out}
        />

        {/* ✦ Admin/Staff/Warehouse Manager Only */}
        {!isCashier && (
          <KpiCard
            title="Total Sales In"
            value={money(totals.sales_in)}
            icon={CircleDollarSign}
            href={reportUrls.sales_in}
          />
        )}

        {/* Everyone sees Sales Out */}
        <KpiCard
          title="Total Sales Out"
          value={money(totals.sales_out)}
          icon={ReceiptText}
          href={reportUrls.sales_out}
        />
      </div>

      {/* rest of the component unchanged … */}
    </AuthenticatedLayout>
  );
}
