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
  const isCashier = role === "cashier";

  const chartColors = {
    bar: isDark ? "#60a5fa" : "#2563eb",
    grid: isDark ? "#1f2937" : "#e5e7eb",
    axis: isDark ? "#9ca3af" : "#6b7280",
    tooltipBg: isDark ? "#111827" : "#ffffff",
    tooltipBorder: isDark ? "#374151" : "#e5e7eb",
    tooltipText: isDark ? "#e5e7eb" : "#111827",
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
            href="/reports?tab=stock_in"
          />
        )}

        {/* Everyone sees Stock Out */}
        <KpiCard
          title="Total Stock Out"
          value={num(totals.stock_out_qty)}
          icon={ArrowUp}
          href="/reports?tab=stock_out"
        />

        {/* ✦ Admin/Staff/Warehouse Manager Only */}
        {!isCashier && (
          <KpiCard
            title="Total Sales In"
            value={money(totals.sales_in)}
            icon={CircleDollarSign}
            href="/reports?tab=sales_in"
          />
        )}

        {/* Everyone sees Sales Out */}
        <KpiCard
          title="Total Sales Out"
          value={money(totals.sales_out)}
          icon={ReceiptText}
          href="/reports?tab=sales_out"
        />
      </div>

      {/* EXTRA STATS ROW (hide for cashier) */}
      {!isCashier && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-5 shadow-theme-xs">
            <div className="flex items-center gap-2 text-sm text-gpt-500 dark:text-gpt-400">
              <Package size={16} /> Total Products
            </div>
            <div className="mt-2 text-2xl font-semibold">{num(totals.products)}</div>
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-5 shadow-theme-xs">
            <div className="flex items-center gap-2 text-sm text-gpt-500 dark:text-gpt-400">
              <Boxes size={16} /> Total Inventory Value (Price)
            </div>
            <div className="mt-2 text-2xl font-semibold">{money(totals.inventory_value)}</div>
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-5 shadow-theme-xs">
            <div className="flex items-center gap-2 text-sm text-gpt-500 dark:text-gpt-400">
              <Boxes size={16} /> Inventory Value (Sales Price)
            </div>
            <div className="mt-2 text-2xl font-semibold">{money(totals.inventory_value_sales)}</div>
          </div>
        </div>
      )}

      {/* GRAPH (everyone sees it) */}
      {graphData.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-100 dark:border-gpt-700 bg-white dark:bg-gpt-900 p-5 shadow-theme-xs">
          <div className="mb-3 text-sm font-medium text-gray-700 dark:text-gpt-200">
            Stock Out — Last 7 Days
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />

                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: chartColors.axis }}
                  axisLine={{ stroke: chartColors.axis }}
                  tickLine={{ stroke: chartColors.axis }}
                />

                <YAxis
                  tick={{ fontSize: 12, fill: chartColors.axis }}
                  axisLine={{ stroke: chartColors.axis }}
                  tickLine={{ stroke: chartColors.axis }}
                  allowDecimals={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    borderRadius: 10,
                    color: chartColors.tooltipText,
                  }}
                  itemStyle={{ color: chartColors.tooltipText }}
                  labelStyle={{ color: chartColors.tooltipText }}
                  cursor={{ fill: isDark ? "#0b1220" : "#f3f4f6" }}
                />

                <Bar
                  dataKey="stock_out"
                  fill={chartColors.bar}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
