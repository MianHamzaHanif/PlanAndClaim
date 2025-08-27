

import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { getUserClaimDetails, getUserClaimsLength, getUserDirectDetails, getUserDirectLength, getUserPendingClaimedAmount, getUserWithdrawDetails, getUserWithdrawLength, withdrawByDays } from "../../Services/turbine";
import { connectWallet, getExistingConnection, ensureChain } from "../../Services/contract";
import { formatUnits } from "../../Services/USDTInstant";
import { getUserTitleDetails } from "../../Services/planInstant";

const TitleReward = () => {
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
    const [claiming, setClaiming] = useState(false);
    const [withdraw, withdrawDetails] = useState([]);
    console.log("withdrawwithdrawwithdraw", withdraw)

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

            const d = await getUserTitleDetails(addr);
            // console.log("coiunt", count)
            withdrawDetails(d.raw)
            // return {
            //     // index: i,
            //     amountRaw: String(d.amount ?? "0"),
            //     raw
            // };
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
    // const [withdrawPage, setWithdrawPage] = useState(1);
    // const WITHDRAW_PAGE_SIZE = 10;

    // // Slices for withdraw table
    // const withdrawTotal = withdraw.length;
    // const withdrawTotalPages = Math.max(1, Math.ceil(withdrawTotal / WITHDRAW_PAGE_SIZE));
    // const withdrawStart = (withdrawPage - 1) * WITHDRAW_PAGE_SIZE;
    // const withdrawRows = withdraw.slice(withdrawStart, withdrawStart + WITHDRAW_PAGE_SIZE);
    // const withdrawFirst = Math.min(withdrawTotal, withdrawStart + 1);
    // const withdrawLast = Math.min(withdrawTotal, withdrawStart + WITHDRAW_PAGE_SIZE);

    const toBig = (x) => {
        try { return BigInt(String(x ?? "0")); } catch { return 0n; }
    };

    // Use the contract-returned `withdraw` tuple to decide if there’s anything claimable.
    // Adjust the indexes if your contract returns a different shape.
    const hasClaimable = toBig(withdraw?.[0]) > 0n || toBig(withdraw?.[2]) > 0n;

    const handleClaim = async () => {
        if (!account) return alert("Connect wallet first.");
        try {
            await ensureChain("bscTestnet");

            // nothing available?
            if (!hasClaimable) {
                return alert("Nothing to claim right now.");
            }

            setClaiming(true);

            // your pre-built function (do not change its signature)
            const tx = await claimTitlePlan();

            // optional: toast/console
            console.log("Claim TX:", tx);

            // refresh any UI that shows balances/rows
            await Promise.all([
                refreshHeaderStats(account),
                withdrawHistory(account),
                refreshClaimHistory(account),
            ]);
        } catch (err) {
            console.error(err);
            alert(err?.message || "Claim failed.");
        } finally {
            setClaiming(false);
        }
    };


    // put this helper inside your component (top-level)
    const fmtToken = (v) => {
        try {
            return formatUnits(String(v ?? "0"), tokenDecimals, 4);
        } catch {
            return String(v ?? "0");
        }
    };


    return (
        <>
            <Header />
            <div className="DAOPage ResonancePage Turbine">
                <div className="container px-md-3">
                    <div className="row g-4">

                        {/* Records placeholder */}
                        <div className="col-md-12">
                            <div className="Heading Heading2in mb-4">Title Reward History</div>


                            <ul className="list-flex text-white px-0">
                                <li className="justify-content-between d-flex">
                                    <h6 className="text-white">Current One Time Title Reward</h6>
                                    <p className="d-flex align-items-center gap-2">
                                        {fmtToken(withdraw?.[0])} {tokenSymbol}
                                    </p>
                                </li>

                                <li className="justify-content-between d-flex">
                                    <h6 className="text-white">Total One Time Title Reward</h6>
                                    <p className="d-flex align-items-center gap-2">
                                        {fmtToken(withdraw?.[1])} {tokenSymbol}
                                    </p>
                                </li>

                                <li className="justify-content-between d-flex">
                                    <h6 className="text-white">Current Title Reward</h6>
                                    <p>{fmtToken(withdraw?.[2])} {tokenSymbol}</p>
                                </li>

                                <li className="justify-content-between d-flex">
                                    <h6 className="text-white">Total Title Reward (0–10)</h6>
                                    <p>{fmtToken(withdraw?.[3])} {tokenSymbol}</p>
                                </li>

                                <li className="justify-content-between d-flex">
                                    <h6 className="text-white">Total Claimed Title Reward (0–10)</h6>
                                    <p>{fmtToken(withdraw?.[6])} {tokenSymbol}</p>
                                </li>

                                <li className="mx-auto d-flex">
                                    <button
                                        className="zv-cta zv-cta--sm"
                                        onClick={handleClaim}
                                        disabled={!account || claiming || !hasClaimable}
                                        title={!account ? "Connect wallet" : (!hasClaimable ? "Nothing to claim" : "Claim")}
                                    >
                                        {claiming ? "Claiming…" : "Claim"}
                                    </button>

                                </li>
                            </ul>

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

export default TitleReward;
