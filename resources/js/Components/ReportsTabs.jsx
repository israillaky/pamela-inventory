import NavLink from "@/Components/NavLink";

export default function ReportsTabs() {
  const tabs = [
    { label: "Low Stock", routeName: "reports.lowStock" },
    { label: "Expiry Soon", routeName: "reports.expirySoon" },
    { label: "Sales Summary", routeName: "reports.salesSummary" },
    { label: "Stock Movements", routeName: "reports.stockMovements" },
    { label: "Fast Moving", routeName: "reports.fastMoving" },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b pb-2">
      {tabs.map((t) => (
        <NavLink
          key={t.routeName}
          href={route(t.routeName)}
          active={route().current(t.routeName)}
          className={
            "px-3 py-2 rounded-t text-sm " +
            (route().current(t.routeName)
              ? "bg-white border border-b-0 font-semibold"
              : "text-gray-600 hover:text-gray-900")
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
