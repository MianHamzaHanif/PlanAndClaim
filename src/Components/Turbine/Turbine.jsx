// import React, { useEffect, useState } from "react";
// import "./Turbine.css";
// import Header from "../header/Header";
// import Footer from "../footer/Footer";
// import { getUserClaimDetails, getUserClaimsLength } from "../../Services/turbine";
// import { formatUnits } from "../../Services/USDTInstant";

// const Turbine = () => {
//     const [claims, setClaims] = useState([]);
//     const [claimPage, setClaimPage] = useState(1);
//     const CLAIM_PAGE_SIZE = 10;
//     const [account, setAccount] = useState(null);
//     const [chainId, setChainId] = useState(null);

//     const handleConnect = async () => {
//         try {
//             setBusy(true);
//             const { account: acc, chainId: cid } = await connectWallet({ chainKey: "bscTestnet" });
//             setAccount(acc);
//             setChainId(cid);
//             await refreshMetaAndBalance(acc);
//             await refreshReferralStatus(acc);
//         } catch (e) {
//             alert(e?.message || "Failed to connect wallet.");
//         } finally {
//             setBusy(false);
//         }
//     };

//     // ---- MetaMask events (no reload) ----
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

//     // live “now” for countdowns
//     const [nowTs, setNowTs] = useState(() => Math.floor(Date.now() / 1000));
//     useEffect(() => {
//         const id = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
//         return () => clearInterval(id);
//     }, []);

//     const refreshClaimHistory = async () => {
//         if (!account) return;
//         try {
//             setRefreshing(true);
//             await ensureChain("bscTestnet");

//             const count = await getUserClaimsLength(account);
//             const idxs = Array.from({ length: count }, (_, i) => i);

//             const rows = await Promise.all(
//                 idxs.map(async (i) => {
//                     const d = await getUserClaimDetails(account, i);
//                     return {
//                         index: i,
//                         amountRaw: d.claimReward,
//                         amountFmt: formatUnits(d.claimReward, tokenDecimals, 4), // shows in AS/USDT units you use
//                         unlockTs: d.unlockTs,
//                         perDayRaw: d.perDayClaimReward,
//                         perDayFmt: formatUnits(d.perDayClaimReward, tokenDecimals, 4),
//                     };
//                 })
//             );

//             // newest unlock first (optional)
//             rows.sort((a, b) => b.unlockTs - a.unlockTs);

//             setClaims(rows);
//             setClaimPage(1);
//         } catch (e) {
//             console.error("refreshClaimHistory error:", e);
//             setClaims([]);
//         } finally {
//             setRefreshing(false);
//         }
//     };

//     useEffect(() => {
//         refreshClaimHistory();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [account, tokenDecimals]);

//     const fmtCountdown = (secs) => {
//         const s = Math.max(0, secs | 0);
//         const d = Math.floor(s / 86400);
//         const h = Math.floor((s % 86400) / 3600);
//         const m = Math.floor((s % 3600) / 60);
//         const ss = s % 60;
//         return d > 0
//             ? `${d}d ${h}h ${m}m`
//             : h > 0
//                 ? `${h}h ${m}m ${ss}s`
//                 : `${m}m ${ss}s`;
//     };

//     const claimTotal = claims.length;
//     const claimTotalPages = Math.max(1, Math.ceil(claimTotal / CLAIM_PAGE_SIZE));
//     const claimStart = (claimPage - 1) * CLAIM_PAGE_SIZE;
//     const claimRows = claims.slice(claimStart, claimStart + CLAIM_PAGE_SIZE);
//     const claimFirst = Math.min(claimTotal, claimStart + 1);
//     const claimLast = Math.min(claimTotal, claimStart + CLAIM_PAGE_SIZE);

//     const handleClaimRow = async (row) => {
//         // TODO: call your contract claim function for this item.
//         // If there's a specific function per index, invoke it here.
//         // await contract.methods.claimByIndex(row.index).send({ from: account });
//     };



//     return (
//         <>
//             <Header />
//             <div className="DAOPage ResonancePage Turbine">
//                 <div className="container-fluid px-md-3">
//                     <div className="row g-4">
//                         <div className="col-12">
//                             <div className="Heading">Turbine Pool<span><i className="fa-solid fa-circle-question"></i></span></div>
//                         </div>
//                         <div className="col-md-9 mx-auto">
//                             <div className="card Turbinecard">
//                                 <div className="card-body">
//                                     <div className="d-flex align-items-center justify-content-between flex-wrap">
//                                         <div className="lefticonheading"><span data-bs-toggle="modal" data-bs-target="#exampleModal"><i className="fa-solid fa-gear"></i></span>5%</div>
//                                         <div className="righttext">Unlockable Amount: <span>0.0000</span>AS</div>
//                                     </div>
//                                     <div className="input-group mb-3">
//                                         <input type="text" className="form-control" value={0} aria-label="Amount (to the nearest dollar)" />
//                                         <span className="input-group-text">Max</span>
//                                     </div>
//                                     <div className="d-flex align-items-center justify-content-between flex-wrap">
//                                         <div className="lefticonheading text-white">Turbine Trade Amount: 0.0000 DAI</div>
//                                         <div className="righttext">Wallet Balance:<span>0.0000</span>DAI</div>
//                                     </div>
//                                     <button className="btn trabibtn">Connect Wallet</button>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="col-md-12">
//                             <div className="Heading Heading2in mb-4 h4">Claim List</div>

//                             <div className="table-responsive">
//                                 <table className="table table-hover align-middle">
//                                     <thead className="table-dark">
//                                         <tr>
//                                             <th>Locked Amount ({tokenSymbol})</th>
//                                             <th>Unlock Countdown</th>
//                                             <th>Action</th>
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
//                                                 const secsLeft = Math.max(0, (r.unlockTs || 0) - nowTs);
//                                                 const unlocked = secsLeft === 0;
//                                                 return (
//                                                     <tr key={`claim-${r.index}`}>
//                                                         <td className="fw-semibold">{r.amountFmt}</td>
//                                                         <td>{unlocked ? "Unlocked" : fmtCountdown(secsLeft)}</td>
//                                                         <td>
//                                                             <button
//                                                                 className="zv-cta zv-cta--sm"
//                                                                 disabled={!unlocked || refreshing}
//                                                                 onClick={() => handleClaimRow(r)}
//                                                                 title={unlocked ? "Claim" : "Still locked"}
//                                                             >
//                                                                 Claim
//                                                             </button>
//                                                         </td>
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

//                         {/* <div className="col-md-12">
//                             <div className="Heading Heading2in mb-4 h4">Claim List</div>
//                             <div class="table-responsive">
//                                 <table className="table">
//                                     <thead>
//                                         <tr>
//                                             <th>Locked Amount(AS)</th>
//                                             <th>Unlock Countdown</th>
//                                             <th>Action</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         <tr>
//                                             <td colspan="3">No Data</td>
//                                         </tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div> */}
//                         <div className="col-md-12">
//                             <div className="Heading Heading2in mb-4">Turbine Records</div>
//                             <div class="table-responsive">
//                                 <table className="table">
//                                     <thead>
//                                         <tr>
//                                             <th>Time</th>
//                                             <th>Amount (AS)</th>
//                                             <th>Type</th>
//                                             <th>Transaction Hash</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         <tr>
//                                             <td colspan="4">No Data</td>
//                                         </tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <Footer />
//             {/* Modal */}
//             <div className="modal fade mainboldal" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
//                 <div className="modal-dialog modal-dialog-centered">
//                     <div className="modal-content">
//                         <div className="modal-header border-0 mb-3">
//                             <h1 className="modal-title  text-center w-100" id="exampleModalLabel">Slippage Settings</h1>
//                             <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
//                         </div>
//                         <div className="modal-body py-4">
//                             <div className="modalheading">Slippage</div>
//                             <div className="buttonGroup">
//                                 <button className="btn">0.5%</button>
//                                 <button className="btn">1%</button>
//                                 <button className="btn">3%</button>
//                                 <button className="btn">5%</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Turbine;


import React, { useEffect, useState } from "react";
import "./Turbine.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { getUserClaimDetails, getUserClaimsLength } from "../../Services/turbine";
import { formatUnits } from "../../Services/USDTInstant";
import { connectWallet, getExistingConnection, ensureChain } from "../../Services/contract";

const Turbine = () => {
    // web3/account
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // token display (AS defaults; change if needed)
    const [tokenSymbol] = useState("AS");
    const [tokenDecimals] = useState(18);

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

    // restore existing wallet on mount
    useEffect(() => {
        (async () => {
            const { account: acc, chainId: cid } = await getExistingConnection();
            if (acc) {
                setAccount(acc);
                setChainId(cid || null);
            }
        })();
    }, []);

    // MetaMask events (no reload)
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

    // connect
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

    // load claim history
    const refreshClaimHistory = async (addr = account) => {
        if (!addr) { setClaims([]); return; }
        try {
            setRefreshing(true);
            await ensureChain("bscTestnet");

            const count = await getUserClaimsLength(addr);
            console.log("countcountcount",count)
            const idxs = Array.from({ length: count }, (_, i) => i);
            const rows = await Promise.all(
                idxs.map(async (i) => {
                    const d = await getUserClaimDetails(addr, i);
                    console.log("dddddd",d)
                    return {
                        index: i,
                        amountRaw: d.claimReward,
                        amountFmt: formatUnits(d.claimReward, tokenDecimals, 4),
                        unlockTs: d.unlockTs,
                        perDayRaw: d.perDayClaimReward,
                        perDayFmt: formatUnits(d.perDayClaimReward, tokenDecimals, 4),
                    };
                })
            );

            rows.sort((a, b) => b.unlockTs - a.unlockTs);
            setClaims(rows);
            setClaimPage(1);
        } catch (e) {
            console.error("refreshClaimHistory error:", e);
            setClaims([]);
        } finally {
            setRefreshing(false);
        }
    };

    // reload when account/decimals change
    useEffect(() => { refreshClaimHistory(); /* eslint-disable-next-line */ }, [account, tokenDecimals]);

    // utils
    const fmtCountdown = (secs) => {
        const s = Math.max(0, secs | 0);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const ss = s % 60;
        return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${ss}s` : `${m}m ${ss}s`;
    };

    // pagination slices
    const claimTotal = claims.length;
    const claimTotalPages = Math.max(1, Math.ceil(claimTotal / CLAIM_PAGE_SIZE));
    const claimStart = (claimPage - 1) * CLAIM_PAGE_SIZE;
    const claimRows = claims.slice(claimStart, claimStart + CLAIM_PAGE_SIZE);
    const claimFirst = Math.min(claimTotal, claimStart + 1);
    const claimLast = Math.min(claimTotal, claimStart + CLAIM_PAGE_SIZE);

    // action for row (wire up contract call if applicable)
    const handleClaimRow = async (row) => {
        // e.g. await contract.methods.claimByIndex(row.index).send({ from: account });
        // then refreshClaimHistory();
    };

    return (
        <>
            <Header />
            <div className="DAOPage ResonancePage Turbine">
                <div className="container-fluid px-md-3">
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="Heading">Turbine Pool<span><i className="fa-solid fa-circle-question"></i></span></div>
                        </div>

                        <div className="col-md-9 mx-auto">
                            <div className="card Turbinecard">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                                        <div className="lefticonheading">
                                            <span data-bs-toggle="modal" data-bs-target="#exampleModal"><i className="fa-solid fa-gear"></i></span>5%
                                        </div>
                                        <div className="righttext">Unlockable Amount: <span>0.0000</span>{tokenSymbol}</div>
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" value={0} readOnly aria-label="Amount" />
                                        <span className="input-group-text">Max</span>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                                        <div className="lefticonheading text-white">Turbine Trade Amount: 0.0000 DAI</div>
                                        <div className="righttext">Wallet Balance:<span>0.0000</span>DAI</div>
                                    </div>

                                    {!account ? (
                                        <button className="btn trabibtn" onClick={handleConnect} disabled={busy}>
                                            {busy ? "Connecting…" : "Connect Wallet"}
                                        </button>
                                    ) : (
                                        <button className="btn trabibtn" onClick={() => refreshClaimHistory()} disabled={refreshing}>
                                            {refreshing ? "Refreshing…" : "Refresh"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Claim List */}
                        <div className="col-md-12">
                            <div className="Heading Heading2in mb-4 h4">Claim List</div>

                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Locked Amount ({tokenSymbol})</th>
                                            <th>Unlock Countdown</th>
                                            <th>Action</th>
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
                                                const secsLeft = Math.max(0, (r.unlockTs || 0) - nowTs);
                                                const unlocked = secsLeft === 0;
                                                return (
                                                    <tr key={`claim-${r.index}`}>
                                                        <td className="fw-semibold">{r.amountFmt}</td>
                                                        <td>{unlocked ? "Unlocked" : fmtCountdown(secsLeft)}</td>
                                                        <td>
                                                            <button
                                                                className="zv-cta zv-cta--sm"
                                                                disabled={!unlocked || refreshing}
                                                                onClick={() => handleClaimRow(r)}
                                                                title={unlocked ? "Claim" : "Still locked"}
                                                            >
                                                                Claim
                                                            </button>
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
                            <div className="Heading Heading2in mb-4">Turbine Records</div>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Amount ({tokenSymbol})</th>
                                            <th>Type</th>
                                            <th>Transaction Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan="4">No Data</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />

            {/* Modal */}
            <div className="modal fade mainboldal" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default Turbine;
