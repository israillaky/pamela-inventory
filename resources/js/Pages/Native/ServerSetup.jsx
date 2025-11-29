import { Head, useForm, usePage } from "@inertiajs/react";

export default function ServerSetup() {
  const {
    currentHostname,
    currentIp,
    detectedIp,
    isDesktop,
    errors,
  } = usePage().props;

  const { data, setData, post, processing } = useForm({
    hostname: currentHostname || "pamelasonlineshop.local",
    ip: currentIp || detectedIp || "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("native.server-setup.store"));
  };

  const applyDetectedIp = () => {
    if (detectedIp) {
      setData("ip", detectedIp);
    }
  };

  return (
    <>
      <Head title="Server Connection Setup" />

      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-full max-w-md rounded-xl bg-slate-800 shadow-lg p-6 text-slate-100">
          <h1 className="text-lg font-semibold mb-1">
            Pamela Inventory — Server Setup
          </h1>
          <p className="text-xs text-slate-300 mb-4">
            Configure the LAN hostname and IP address that the desktop app
            should connect to.
          </p>

          {Object.keys(errors || {}).length > 0 && (
            <div className="mb-4 rounded-md bg-red-900/60 border border-red-700 px-3 py-2 text-xs text-red-100">
              <ul className="list-disc list-inside space-y-0.5">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">
                Hostname (vhost)
              </label>
              <input
                type="text"
                value={data.hostname}
                onChange={(e) => setData("hostname", e.target.value)}
                className="w-full rounded-md border border-slate-600 bg-slate-900/70 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                Example: <span className="font-mono">pamelasonlineshop.local</span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">
                Server LAN IP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={data.ip}
                  onChange={(e) => setData("ip", e.target.value)}
                  className="flex-1 rounded-md border border-slate-600 bg-slate-900/70 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={detectedIp || "192.168.x.x"}
                />
                <button
                    type="button"
                    onClick={applyDetectedIp}
                    disabled={!detectedIp}
                    className="rounded-md border border-emerald-500 px-2 py-1 text-[11px] font-medium disabled:opacity-40"
                    >
                    Use detected
                </button>
              </div>
              {detectedIp && (
                <p className="text-[11px] text-slate-400">
                  Detected LAN IP:{" "}
                  <span className="font-mono">{detectedIp}</span>
                </p>
              )}
            </div>

            {isDesktop && (
              <p className="text-[11px] text-amber-300/90">
                You might need to run the Pamela Inventory desktop app as
                Administrator to update the Windows hosts file automatically.
              </p>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="submit"
                disabled={processing}
                className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium hover:bg-emerald-500 disabled:opacity-60"
              >
                {processing ? "Saving..." : "Save & Connect"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
