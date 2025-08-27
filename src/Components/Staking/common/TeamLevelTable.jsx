import React, { useEffect, useState } from "react";
import { formatUnits } from "../../../Services/USDTInstant";
// import { formatUnits } from "../../Services/USDTInstant";

/**
 * Reusable Team Level browser.
 *
 * Props:
 * - account: string
 * - tokenSymbol: string
 * - tokenDecimals: number
 * - fetchRows: (account, level) => Promise<
 *      { address: string, totalSelfDepositedAmount: string|bigint, totalTeamMember?: number, index?: number }[]
 *   >
 * - initialLevel?: number (default 1)
 * - pageSize?: number (default 10)
 * - showTeamCount?: boolean (default true)
 * - refreshSignal?: any  -> when this value changes, table reloads
 */
export default function TeamLevelTable({
  account,
  tokenSymbol = "TOKEN",
  tokenDecimals = 18,
  fetchRows,
  initialLevel = 1,
  pageSize = 10,
  showTeamCount = true,
  refreshSignal,
}) {
  const [level, setLevel] = useState(initialLevel);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageRows = rows.slice(pageStart, pageStart + pageSize);
  const firstRow = Math.min(total, pageStart + 1);
  const lastRow = Math.min(total, pageStart + pageSize);

  const load = async (lvl = level) => {
    if (!account || !fetchRows) return setRows([]);
    setLoading(true);
    try {
      const list = (await fetchRows(account, lvl)) || [];
      const normalized = list.map((m, ix) => {
        const raw = String(m.totalSelfDepositedAmount ?? "0");
        return {
          index: m.index ?? ix + 1,
          address: m.address,
          teamCount: Number(m.totalTeamMember ?? 0),
          depositRaw: raw,
          depositFmt: formatUnits(raw, tokenDecimals, 4),
        };
      });
      setRows(normalized);
      setPage(1);
    } catch (e) {
      console.warn("TeamLevelTable load error:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (account) load(level); /* eslint-disable-next-line */ }, [account, tokenDecimals, level, refreshSignal]);

  return (
    <>
      {/* Level chooser */}
      <div className="mt-2">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
            <button
              key={lvl}
              className={`btn-level ${level === lvl ? "btn-filters" : "btn-outline-filters"}`}
              disabled={loading}
              onClick={() => { setLevel(lvl); setPage(1); }}
              title={`Show level ${lvl} history`}
            >
              {lvl}
            </button>
          ))}
        </div>
        <div className="small text-white mt-1">{`Showing Team Level ${level} history`}</div>
      </div>

      {/* Table */}
      <div className="table-responsive mt-2">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>#</th>
              <th style={{ whiteSpace: "nowrap" }}>Address</th>
              {showTeamCount && <th style={{ whiteSpace: "nowrap" }}>Total Team</th>}
              <th style={{ whiteSpace: "nowrap" }}>Self Deposit ({tokenSymbol})</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={showTeamCount ? 4 : 3} className="text-center py-4">
                  {loading ? "Loading…" : account ? "No team members found for this level." : "Connect wallet to see history."}
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => {
                const displayIndex = Number.isFinite(r?.index) ? r.index : pageStart + i + 1;
                return (
                  <tr key={`${r.address}-${displayIndex}`}>
                    <td>{displayIndex}</td>
                    <td
                      title={r.address}
                      style={{
                        fontFamily: "monospace",
                        maxWidth: 360,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.address}
                    </td>
                    {showTeamCount && <td>{r.teamCount ?? 0}</td>}
                    <td className="fw-semibold">{r.depositFmt}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
        <div className="text-muted small">
          {total > 0 ? `Showing ${firstRow}–${lastRow} of ${total}` : "No rows"}
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-sm btn-secondary" onClick={() => setPage(1)} disabled={page <= 1} title="First page">« First</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} title="Previous page">‹ Prev</button>
          <span className="px-2 referral-input">Page {page} / {totalPages}</span>
          <button className="btn btn-sm btn-secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} title="Next page">Next ›</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setPage(totalPages)} disabled={page >= totalPages} title="Last page">Last »</button>
        </div>
      </div>
    </>
  );
}
