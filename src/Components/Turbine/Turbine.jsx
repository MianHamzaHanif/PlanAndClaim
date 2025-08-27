// import React, { useEffect, useState } from "react";
// import "./Turbine.css";
// import Header from "../header/Header";
// import Footer from "../footer/Footer";
// import { getUserClaimDetails, getUserClaimsLength } from "../../Services/turbine";
// import { connectWallet, getExistingConnection, ensureChain } from "../../Services/contract";
// import { formatUnits } from "../../Services/USDTInstant";

// const Turbine = () => {
//     // web3/account
//     const [account, setAccount] = useState(null);
//     const [chainId, setChainId] = useState(null);
//     const [busy, setBusy] = useState(false);
//     const [refreshing, setRefreshing] = useState(false);

//     // token display (change if needed)
//     const [tokenSymbol] = useState("AS");
//     const [tokenDecimals] = useState(18);

//     // claim table state
//     const [claims, setClaims] = useState([]);
//     const [claimPage, setClaimPage] = useState(1);
//     const CLAIM_PAGE_SIZE = 10;

//     // live "now" for countdowns
//     const [nowTs, setNowTs] = useState(() => Math.floor(Date.now() / 1000));
//     useEffect(() => {
//         const id = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
//         return () => clearInterval(id);
//     }, []);

//     // restore wallet on mount
//     useEffect(() => {
//         (async () => {
//             const { account: acc, chainId: cid } = await getExistingConnection();
//             if (acc) {
//                 setAccount(acc);
//                 setChainId(cid || null);
//             }
//         })();
//     }, []);

//     // MetaMask events
//     useEffect(() => {
//         if (!window?.ethereum) return;
//         const onAccountsChanged = (accs = []) => setAccount(accs[0] || null);
//         const onChainChanged = (cid) => setChainId(cid || null);
//         const onDisconnect = () => { setAccount(null); setChainId(null); };

//         window.ethereum.on("accountsChanged", onAccountsChanged);
//         window.ethereum.on("chainChanged", onChainChanged);
//         window.ethereum.on("disconnect", onDisconnect);
//         return () => {
//             window.ethereum.removeListener("accountsChanged", onAccountsChanged);
//             window.ethereum.removeListener("chainChanged", onChainChanged);
//             window.ethereum.removeListener("disconnect", onDisconnect);
//         };
//     }, []);

//     // connect button
//     const handleConnect = async () => {
//         try {
//             setBusy(true);
//             const { account: acc, chainId: cid } = await connectWallet({ chainKey: "bscTestnet" });
//             setAccount(acc);
//             setChainId(cid);
//         } catch (e) {
//             alert(e?.message || "Failed to connect wallet.");
//         } finally {
//             setBusy(false);
//         }
//     };

//     // utils
//     const fmtCountdown = (secs) => {
//         const s = Math.max(0, secs | 0);
//         const d = Math.floor(s / 86400);
//         const h = Math.floor((s % 86400) / 3600);
//         const m = Math.floor((s % 3600) / 60);
//         const ss = s % 60;
//         return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${ss}s` : `${m}m ${ss}s`;
//     };

//     // fetch claim history (safe)
//     const refreshClaimHistory = async (addr = account) => {
//         if (!addr) { setClaims([]); return; }
//         try {
//             setRefreshing(true);
//             await ensureChain("bscTestnet");

//             const count = await getUserClaimsLength(addr);
//             if (!Number.isFinite(count) || count <= 0) {
//                 setClaims([]);
//                 setClaimPage(1);
//                 return;
//             }

//             const idxs = Array.from({ length: count }, (_, i) => i);
//             const rows = await Promise.all(
//                 idxs.map(async (i) => {
//                     const d = await getUserClaimDetails(addr, i);
//                     const amountFmt = formatUnits(String(d.amount ?? "0"), tokenDecimals, 4);
//                     return {
//                         index: i,
//                         amountRaw: String(d.amount ?? "0"),
//                         amountFmt,
//                         time: Number(d.time || 0),
//                         status: Boolean(d.status),
//                     };
//                 })
//             );

//             // newest first
//             rows.sort((a, b) => b.time - a.time);
//             setClaims(rows);
//             setClaimPage(1);
//         } catch (e) {
//             console.error("refreshClaimHistory error:", e);
//             setClaims([]);
//         } finally {
//             setRefreshing(false);
//         }
//     };

//     // reload when account/decimals change
//     useEffect(() => { refreshClaimHistory(); /* eslint-disable-next-line */ }, [account, tokenDecimals]);

//     // pagination
//     const claimTotal = claims.length;
//     const claimTotalPages = Math.max(1, Math.ceil(claimTotal / CLAIM_PAGE_SIZE));
//     const claimStart = (claimPage - 1) * CLAIM_PAGE_SIZE;
//     const claimRows = claims.slice(claimStart, claimStart + CLAIM_PAGE_SIZE);
//     const claimFirst = Math.min(claimTotal, claimStart + 1);
//     const claimLast = Math.min(claimTotal, claimStart + CLAIM_PAGE_SIZE);

//     return (
//         <>
//             <Header />
//             <div className="DAOPage ResonancePage Turbine">
//                 <div className="container-fluid px-md-3">
//                     <div className="row g-4">
//                         <div className="col-12">
//                             <div className="Heading">Turbine Pool <span><i className="fa-solid fa-circle-question" /></span></div>
//                         </div>

//                         <div className="col-md-9 mx-auto">
//                             <div className="card Turbinecard">
//                                 <div className="card-body">
//                                     <div className="d-flex align-items-center justify-content-between flex-wrap">
//                                         <div className="lefticonheading">
//                                             <span data-bs-toggle="modal" data-bs-target="#exampleModal"><i className="fa-solid fa-gear" /></span>5%
//                                         </div>
//                                         <div className="righttext">Unlockable Amount: <span>0.0000</span>{tokenSymbol}</div>
//                                     </div>

//                                     {!account ? (
//                                         <button className="btn trabibtn" onClick={handleConnect} disabled={busy}>
//                                             {busy ? "Connecting…" : "Connect Wallet"}
//                                         </button>
//                                     ) : (
//                                         <button className="btn trabibtn" onClick={() => refreshClaimHistory()} disabled={refreshing}>
//                                             {/* {refreshing ? "Refreshing…" : "Refresh"} */}
//                                             Withdraw
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Claim List (exactly 3 variables) */}
//                         <div className="col-md-12">
//                             <div className="Heading Heading2in mb-4 h4">Claim List</div>

//                             <div className="table-responsive">
//                                 <table className="table table-hover align-middle">
//                                     <thead className="table-dark">
//                                         <tr>
//                                             <th>Amount ({tokenSymbol})</th>
//                                             <th>Time</th>
//                                             {/* <th>Status</th> */}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {claimRows.length === 0 ? (
//                                             <tr>
//                                                 <td colSpan={3} className="text-center py-4">
//                                                     {refreshing ? "Loading…" : account ? "No Data" : "Connect wallet to see history."}
//                                                 </td>
//                                             </tr>
//                                         ) : (
//                                             claimRows.map((r) => {
//                                                 const secsLeft = Math.max(0, (r.time || 0) - nowTs);
//                                                 const unlocked = secsLeft === 0 || r.status === true;
//                                                 return (
//                                                     <tr key={`claim-${r.index}`}>
//                                                         <td className="fw-semibold">{r.amountFmt}</td>
//                                                         <td>
//                                                             <div className="fw-semibold">
//                                                                 {r.time ? new Date(r.time * 1000).toLocaleString() : "-"}
//                                                             </div>
//                                                             <div className="text-muted" style={{ fontSize: 12 }}>
//                                                                 {r.time ? (unlocked ? "Unlocked" : `in ${fmtCountdown(secsLeft)}`) : ""}
//                                                             </div>
//                                                         </td>
//                                                         {/* <td>
//                               {unlocked ? (
//                                 <span className="badge bg-success">Unlocked</span>
//                               ) : (
//                                 <span className="badge bg-secondary">Locked</span>
//                               )}
//                             </td> */}
//                                                     </tr>
//                                                 );
//                                             })
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {/* Pagination */}
//                             <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
//                                 <div className="text-muted small">
//                                     {claimTotal > 0 ? `Showing ${claimFirst}–${claimLast} of ${claimTotal}` : "No rows"}
//                                 </div>

//                                 <div className="d-flex align-items-center gap-2">
//                                     <button className="btn btn-sm btn-secondary" onClick={() => setClaimPage(1)} disabled={claimPage <= 1} title="First page">« First</button>
//                                     <button className="btn btn-sm btn-secondary" onClick={() => setClaimPage((p) => Math.max(1, p - 1))} disabled={claimPage <= 1} title="Previous page">‹ Prev</button>
//                                     <span className="px-2 referral-input">Page {claimPage} / {claimTotalPages}</span>
//                                     <button className="btn btn-sm btn-secondary" onClick={() => setClaimPage((p) => Math.min(claimTotalPages, p + 1))} disabled={claimPage >= claimTotalPages} title="Next page">Next ›</button>
//                                     <button className="btn btn-sm btn-secondary" onClick={() => setClaimPage(claimTotalPages)} disabled={claimPage >= claimTotalPages} title="Last page">Last »</button>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Records placeholder */}
//                         <div className="col-md-12">
//                             <div className="Heading Heading2in mb-4">Turbine Records</div>
//                             <div className="table-responsive">
//                                 <table className="table">
//                                     <thead>
//                                         <tr>
//                                             <th>Time</th>
//                                             <th>Amount ({tokenSymbol})</th>
//                                             <th>Type</th>
//                                             <th>Transaction Hash</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         <tr><td colSpan="4">No Data</td></tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             </div>

//             <Footer />
//             {/* Slippage modal kept as-is */}
//             <div className="modal fade mainboldal" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
//                 <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
//                     <div className="modal-header border-0 mb-3">
//                         <h1 className="modal-title text-center w-100" id="exampleModalLabel">Slippage Settings</h1>
//                         <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
//                     </div>
//                     <div className="modal-body py-4">
//                         <div className="modalheading">Slippage</div>
//                         <div className="buttonGroup">
//                             <button className="btn">0.5%</button>
//                             <button className="btn">1%</button>
//                             <button className="btn">3%</button>
//                             <button className="btn">5%</button>
//                         </div>
//                     </div>
//                 </div></div>
//             </div>
//         </>
//     );
// };

// export default Turbine;


import React, { useEffect, useState } from "react";
import "./Turbine.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { getUserClaimDetails, getUserClaimsLength, getUserPendingClaimedAmount, getUserWithdrawDetails, getUserWithdrawLength, withdrawByDays } from "../../Services/turbine";
import { connectWallet, getExistingConnection, ensureChain } from "../../Services/contract";
import { formatUnits } from "../../Services/USDTInstant";

const Turbine = () => {
    // web3/account
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [pendingRaw, setPendingRaw] = useState("0");


    // NEW: withdraw state
    const [selectedDay, setSelectedDay] = useState(null);   // 5 | 10 | 15 | 20
    const [withdrawing, setWithdrawing] = useState(false);

    // token display
    const [tokenSymbol] = useState("AS");
    const [tokenDecimals] = useState(18);

    const [withdraw, withdrawDetails] = useState([]);

    // claim table state
    const [claims, setClaims] = useState([]);
    const [claimPage, setClaimPage] = useState(1);
    const CLAIM_PAGE_SIZE = 10;

    // live “now” for countdowns
    const [nowTs, setNowTs] = useState(() => Math.floor(Date.now() / 1000));
    useEffect(() => {
        const id = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(id);
    }, []);

    // restore wallet on mount
    useEffect(() => {
        (async () => {
            const { account: acc, chainId: cid } = await getExistingConnection();
            if (acc) {
                setAccount(acc);
                setChainId(cid || null);
            }
        })();
    }, []);

    const refreshHeaderStats = async (addr = account) => {
        if (!addr) { setPendingRaw("0"); return; }
        try {
            await ensureChain("bscTestnet");
            const v = await getUserPendingClaimedAmount(addr);
            let formatRaw = formatUnits(v, tokenDecimals, 4)
            setPendingRaw(String(formatRaw || "0"));
        } catch (e) {
            console.warn("pending amount fetch error:", e);
            setPendingRaw("0");
        }
    };

    useEffect(() => {
        refreshHeaderStats();
        refreshClaimHistory();
        // eslint-disable-next-line
    }, [account, tokenDecimals]);



    // MetaMask events
    useEffect(() => {
        if (!window?.ethereum) return;
        const onAccountsChanged = (accs = []) => setAccount(accs[0] || null);
        const onChainChanged = (cid) => setChainId(cid || null);
        const onDisconnect = () => { setAccount(null); setChainId(null); };
        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);
        window.ethereum.on("disconnect", onDisconnect);
        return () => {
            window.ethereum.removeListener("accountsChanged", onAccountsChanged);
            window.ethereum.removeListener("chainChanged", onChainChanged);
            window.ethereum.removeListener("disconnect", onDisconnect);
        };
    }, []);

    // connect button
    const handleConnect = async () => {
        try {
            setBusy(true);
            const { account: acc, chainId: cid } = await connectWallet({ chainKey: "bscTestnet" });
            setAccount(acc);
            setChainId(cid);
        } catch (e) {
            alert(e?.message || "Failed to connect wallet.");
        } finally {
            setBusy(false);
        }
    };

    // utils
    const fmtCountdown = (secs) => {
        const s = Math.max(0, secs | 0);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const ss = s % 60;
        return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${ss}s` : `${m}m ${ss}s`;
    };

    // fetch claim history (safe)
    const refreshClaimHistory = async (addr = account) => {
        if (!addr) { setClaims([]); return; }
        try {
            setRefreshing(true);
            await ensureChain("bscTestnet");

            const count = await getUserClaimsLength(addr);
            if (!Number.isFinite(count) || count <= 0) {
                setClaims([]);
                setClaimPage(1);
                return;
            }

            const idxs = Array.from({ length: count }, (_, i) => i);
            const rows = await Promise.all(
                idxs.map(async (i) => {
                    const d = await getUserClaimDetails(addr, i);
                    const amountFmt = formatUnits(String(d.amount ?? "0"), tokenDecimals, 4);
                    return {
                        index: i,
                        amountRaw: String(d.amount ?? "0"),
                        amountFmt,
                        time: Number(d.time || 0),
                        status: Boolean(d.status),
                    };
                })
            );

            rows.sort((a, b) => b.time - a.time);
            setClaims(rows);
            setClaimPage(1);
        } catch (e) {
            console.error("refreshClaimHistory error:", e);
            setClaims([]);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { refreshClaimHistory(); withdrawHistory(); /* eslint-disable-next-line */ }, [account, tokenDecimals]);


    const withdrawHistory = async (addr = account) => {
        if (!addr) { setClaims([]); return; }
        try {
            setRefreshing(true);
            await ensureChain("bscTestnet");

            const count = await getUserWithdrawLength(addr);
            console.log("coiunt", count)
            if (!Number.isFinite(count) || count <= 0) {
                setClaims([]);
                setClaimPage(1);
                return;
            }

            const idxs = Array.from({ length: count }, (_, i) => i);
            const rows = await Promise.all(
                idxs.map(async (i) => {
                    const d = await getUserWithdrawDetails(addr, i);
                    const amountFmt = formatUnits(String(d.amount ?? "0"), tokenDecimals, 4);
                    return {
                        index: i,
                        amountRaw: String(d.amount ?? "0"),
                        amountFmt,
                        time: Number(d.time || 0),
                        status: Boolean(d.status),
                    };
                })
            );

            rows.sort((a, b) => b.time - a.time);
            withdrawDetails(rows);
            setClaimPage(1);
        } catch (e) {
            console.error("refreshClaimHistory error:", e);
            setClaims([]);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => { withdrawHistory(); /* eslint-disable-next-line */ }, [account, tokenDecimals]);


    // pagination
    const claimTotal = claims.length;
    const claimTotalPages = Math.max(1, Math.ceil(claimTotal / CLAIM_PAGE_SIZE));
    const claimStart = (claimPage - 1) * CLAIM_PAGE_SIZE;
    const claimRows = claims.slice(claimStart, claimStart + CLAIM_PAGE_SIZE);
    const claimFirst = Math.min(claimTotal, claimStart + 1);
    const claimLast = Math.min(claimTotal, claimStart + CLAIM_PAGE_SIZE);

    // NEW: withdraw click
    const handleWithdraw = async () => {
        if (!account) return alert("Connect wallet first.");
        if (selectedDay == null) return alert("Choose a day (5/10/15/20).");
        try {
            setWithdrawing(true);
            await withdrawByDays(selectedDay, account);  // opens MetaMask
            await refreshClaimHistory(account);
            // optional toast: success
        } catch (e) {
            console.error(e);
            alert(e?.message || "Withdraw failed.");
        } finally {
            setWithdrawing(false);
        }
    };

    const DAY_OPTIONS = [5, 10, 15, 20];

    // Withdraw pagination
    const [withdrawPage, setWithdrawPage] = useState(1);
    const WITHDRAW_PAGE_SIZE = 10;

    // Slices for withdraw table
    const withdrawTotal = withdraw.length;
    const withdrawTotalPages = Math.max(1, Math.ceil(withdrawTotal / WITHDRAW_PAGE_SIZE));
    const withdrawStart = (withdrawPage - 1) * WITHDRAW_PAGE_SIZE;
    const withdrawRows = withdraw.slice(withdrawStart, withdrawStart + WITHDRAW_PAGE_SIZE);
    const withdrawFirst = Math.min(withdrawTotal, withdrawStart + 1);
    const withdrawLast = Math.min(withdrawTotal, withdrawStart + WITHDRAW_PAGE_SIZE);


    return (
        <>
            <Header />
            <div className="DAOPage ResonancePage Turbine">
                <div className="container px-md-3">
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="Heading">Turbine Pool <span><i className="fa-solid fa-circle-question" /></span></div>
                        </div>

                        <div className="col-md-12 mx-auto">
                            <div className="card w-100 Turbinecard">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                                        <div className="lefticonheading">
                                            <span data-bs-toggle="modal" data-bs-target="#exampleModal"></span>Claimable Amount: {pendingRaw} {tokenSymbol}
                                        </div>
                                        {/* <div className="righttext">Unlockable Amount: <span>0.0000</span>{tokenSymbol}</div> */}
                                    </div>

                                    {/* NEW: day selector */}
                                    <div className="mt-3 d-flex gap-2 flex-wrap">
                                        {DAY_OPTIONS.map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                className={`btn btn-sm ${selectedDay === d ? "btn-primary" : "btn-outline-primary"}`}
                                                onClick={() => setSelectedDay(d)}
                                                disabled={!account || withdrawing}
                                                title={`Withdraw for ${d} days`}
                                            >
                                                {d} days
                                            </button>
                                        ))}
                                    </div>

                                    {/* Connect / Withdraw */}
                                    <div className="mt-3">
                                        {!account ? (
                                            <button className="btn trabibtn" onClick={handleConnect} disabled={busy}>
                                                {busy ? "Connecting…" : "Connect Wallet"}
                                            </button>
                                        ) : (
                                            <button
                                                className="btn trabibtn"
                                                onClick={handleWithdraw}
                                                disabled={withdrawing || selectedDay == null}
                                                title={selectedDay == null ? "Select a day" : `Withdraw (${selectedDay} days)`}
                                            >
                                                {withdrawing ? "Withdrawing…" : `Withdraw${selectedDay ? ` (${selectedDay}d)` : ""}`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Claim List (3 columns) */}
                        <div className="col-md-12">
                            <div className="Heading Heading2in mb-4 h4">Claim List</div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Amount ({tokenSymbol})</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {claimRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-4">
                                                    {refreshing ? "Loading…" : account ? "No Data" : "Connect wallet to see history."}
                                                </td>
                                            </tr>
                                        ) : (
                                            claimRows.map((r) => {
                                                const secsLeft = Math.max(0, (r.time || 0) - nowTs);
                                                const unlocked = secsLeft === 0 || r.status === true;
                                                return (
                                                    <tr key={`claim-${r.index}`}>
                                                        <td className="fw-semibold">{r.amountFmt}</td>
                                                        <td>
                                                            <div className="fw-semibold">
                                                                {r.time ? new Date(r.time * 1000).toLocaleString() : "-"}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: 12 }}>
                                                                {r.time ? (unlocked ? "Unlocked" : `in ${fmtCountdown(secsLeft)}`) : ""}
                                                            </div>
                                                        </td>
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
                                    {claimTotal > 0 ? `Showing ${claimFirst}–${claimLast} of ${claimTotal}` : "No rows"}
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <button className="btn btn-sm btn-secondary" onClick={() => setClaimPage(1)} disabled={claimPage <= 1} title="First page">« First</button>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setClaimPage((p) => Math.max(1, p - 1))} disabled={claimPage <= 1} title="Previous page">‹ Prev</button>
                                    <span className="px-2 referral-input">Page {claimPage} / {claimTotalPages}</span>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setClaimPage((p) => Math.min(claimTotalPages, p + 1))} disabled={claimPage >= claimTotalPages} title="Next page">Next ›</button>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setClaimPage(claimTotalPages)} disabled={claimPage >= claimTotalPages} title="Last page">Last »</button>
                                </div>
                            </div>
                        </div>

                        {/* Records placeholder */}
                        <div className="col-md-12">
                            <div className="Heading Heading2in mb-4">Withdraw History</div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Amount ({tokenSymbol})</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdraw.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-4">
                                                    {refreshing ? "Loading…" : account ? "No Data" : "Connect wallet to see history."}
                                                </td>
                                            </tr>
                                        ) : (
                                            withdraw.map((r) => {
                                                const secsLeft = Math.max(0, (r.time || 0) - nowTs);
                                                const unlocked = secsLeft === 0 || r.status === true;
                                                return (
                                                    <tr key={`claim-${r.index}`}>
                                                        <td className="fw-semibold">{r.amountFmt}</td>
                                                        <td>
                                                            <div className="fw-semibold">
                                                                {r.time ? new Date(r.time * 1000).toLocaleString() : "-"}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: 12 }}>
                                                                {r.time ? (unlocked ? "Unlocked" : `in ${fmtCountdown(secsLeft)}`) : ""}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                                <div className="text-muted small">
                                    {withdrawTotal > 0
                                        ? `Showing ${withdrawFirst}–${withdrawLast} of ${withdrawTotal}`
                                        : "No rows"}
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setWithdrawPage(1)}
                                        disabled={withdrawPage <= 1}
                                        title="First page"
                                    >
                                        « First
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setWithdrawPage((p) => Math.max(1, p - 1))}
                                        disabled={withdrawPage <= 1}
                                        title="Previous page"
                                    >
                                        ‹ Prev
                                    </button>
                                    <span className="px-2 referral-input">
                                        Page {withdrawPage} / {withdrawTotalPages}
                                    </span>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setWithdrawPage((p) => Math.min(withdrawTotalPages, p + 1))}
                                        disabled={withdrawPage >= withdrawTotalPages}
                                        title="Next page"
                                    >
                                        Next ›
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setWithdrawPage(withdrawTotalPages)}
                                        disabled={withdrawPage >= withdrawTotalPages}
                                        title="Last page"
                                    >
                                        Last »
                                    </button>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <Footer />

            {/* Slippage modal unchanged */}
            <div className="modal fade mainboldal" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
                    <div className="modal-header border-0 mb-3">
                        <h1 className="modal-title text-center w-100" id="exampleModalLabel">Slippage Settings</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>
                    <div className="modal-body py-4">
                        <div className="modalheading">Slippage</div>
                        <div className="buttonGroup">
                            <button className="btn">0.5%</button>
                            <button className="btn">1%</button>
                            <button className="btn">3%</button>
                            <button className="btn">5%</button>
                        </div>
                    </div>
                </div></div>
            </div>
        </>
    );
};

export default Turbine;
