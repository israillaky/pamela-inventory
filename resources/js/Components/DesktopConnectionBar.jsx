// resources/js/Components/DesktopConnectionBar.jsx
import { usePage } from "@inertiajs/react";

export default function DesktopConnectionBar() {
  const { desktopConnection } = usePage().props;

  if (!desktopConnection) return null;

  const { hostname, ip, reachable } = desktopConnection;

  const bgClass = reachable ? "bg-emerald-700" : "bg-amber-700";
  const statusText = reachable
    ? `Connected to ${ip} (${hostname})`
    : `Cannot reach ${ip} (${hostname})`;

  const handleClick = () => {
    // Just send the user to the setup page (works in desktop + browser)
    window.location.href = route("native.server-setup.show");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`fixed bottom-0 inset-x-0 z-40 ${bgClass} text-xs text-white px-3 py-1.5 flex items-center justify-between`}
    >
      <span>{statusText}</span>
      <span className="underline">Change connection</span>
    </button>
  );
}
