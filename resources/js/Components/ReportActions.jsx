export default function ReportActions({ exportBaseRoute, params = {} }) {
  const qs = new URLSearchParams(params).toString();

  const url = (type) => route(exportBaseRoute, { ...params, type });

  return (
    <div className="flex gap-2 flex-wrap">
      <a className="btn-secondary" href={url("print")} target="_blank">
        Print
      </a>
      <a className="btn-secondary" href={url("csv")}>
        Export CSV
      </a>
      <a className="btn-secondary" href={url("xlsx")}>
        Export Excel
      </a>
      <a className="btn-secondary" href={url("pdf")} target="_blank">
        Export PDF
      </a>
    </div>
  );
}
