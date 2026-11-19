
export default function Table({
  columns,
  rows,
  rowKey = "id",
  onRowClick
}) {
  const cellValue = (column, row) =>
    column.render
      ? column.render(row)
      : row[column.key] ?? "—";

  const clickable = Boolean(onRowClick);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={
                  clickable ? () => onRowClick(row) : undefined
                }
                className={
                  clickable
                    ? "cursor-pointer hover:bg-green-50/50"
                    : ""
                }
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 align-middle text-slate-700 ${column.className || ""}`}
                  >
                    {cellValue(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => (
          <li
            key={row[rowKey]}
            onClick={
              clickable ? () => onRowClick(row) : undefined
            }
            className={`space-y-2 px-4 py-4 ${
              clickable
                ? "cursor-pointer active:bg-green-50/50"
                : ""
            }`}
          >
            {columns
              .filter((column) => !column.hideOnMobile)
              .map((column) => (
                <div
                  key={column.key}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {column.header}
                  </span>

                  <span className="text-right text-slate-700">
                    {cellValue(column, row)}
                  </span>
                </div>
              ))}
          </li>
        ))}
      </ul>
    </>
  );
}
