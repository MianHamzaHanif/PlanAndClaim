import React, { useEffect, useState } from "react";
import "./Flexible.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import Modal1 from "./Modal1";

import {
  getUserDetails,
  approveAndDepositFixPlan30,
  parseUnits,
  getUserStakeLength,
  getUserStakeDetails,
  simulateProcessAutoUnlockedStake,
  getWithdrawRewardFixPlanP,
  getUplineLevelOpen,
  getReferralLevelUnLock,
  getSelfRewardFromUpLinerFixPlan,
  getSelfRewardFromDownLinerFixPlan,
  claimFixPlan30,
  unstakeFixPlanP30,
  isValidAddress,
} from "../../Services/FixPlan30Instant";
import { connectWallet, getExistingConnection, ensureChain } from "../../Services/contract";
import { fetchUSDTMeta, fetchUSDTBalance, formatUnits } from "../../Services/USDTInstant";
import { getTeamHistoryByLevel } from "../../Services/planInstant";
import TeamLevelTable from "./common/TeamLevelTable";

// ---- constants / helpers ----
const ZERO = "0x0000000000000000000000000000000000000000";
const isZeroAddr = (a) => !a || String(a).toLowerCase() === ZERO.toLowerCase();
const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

const Flexible = () => {
  const [account, setAccount] = useState(null);
  // let account = "0x14DE801cFA279A84552B4064351f5205B7A4752f";
  const [chainId, setChainId] = useState(null);
  const [amount, setAmount] = useState("");
  const [txMsg, setTxMsg] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("USDT");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [rawBalance, setRawBalance] = useState("0");
  const [busy, setBusy] = useState(false);
  const [stakes, setStakes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isJoined, setIsJoined] = useState(null);
  const [referrerAddr, setReferrerAddr] = useState(ZERO);
  const [page, setPage] = useState(1);
  const [withdrawableRaw, setWithdrawableRaw] = useState("0");
  const [uplinerLevelOpen, setUplinerLevelOpen] = useState(0);
  const [uplinerRewardRaw, setUplinerRewardRaw] = useState("0");
  const [downlinerRewardRaw, setDownlinerRewardRaw] = useState("0");
  const [unlockedLevels, setUnlockedLevels] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [unstakeIndex, setUnstakeIndex] = useState("");
  const [unstaking, setUnstaking] = useState(false);

  const [viewMode, setViewMode] = useState("self");   // 'self' | 'team'
  const [teamRefreshTick, setTeamRefreshTick] = useState(0); // to signal table reload


  // pagination
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(stakes.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageRows = stakes.slice(pageStart, pageStart + PAGE_SIZE);

  // ---- restore wallet on mount ----
  useEffect(() => {
    (async () => {
      const { account: acc, chainId: cid } = await getExistingConnection();
      if (acc) {
        setAccount(acc);
        setChainId(cid || null);
      }
    })();
  }, []);

  // ---- MetaMask events (no reload) ----
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

  // ---- initial + on deps change ----
  useEffect(() => {
    (async () => {
      await refreshMetaAndBalance(account);
      await refreshReferralStatus(account);
      await refreshHistory();
      await refreshDashboardStats(account);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId, tokenDecimals]);

  // ---- reads ----
  const refreshMetaAndBalance = async (addr = account) => {
    try {
      await ensureChain("bscTestnet");
      const meta = await fetchUSDTMeta();
      setTokenSymbol(meta.symbol || "TOKEN");
      setTokenDecimals(Number.isFinite(Number(meta.decimals)) ? Number(meta.decimals) : 18);

      if (addr) {
        const raw = await fetchUSDTBalance(addr);
        setRawBalance(raw || "0");
      } else {
        setRawBalance("0");
      }
    } catch (e) {
      console.warn("refreshMetaAndBalance error:", e);
      setRawBalance("0");
    }
  };

  const refreshReferralStatus = async (addr = account) => {
    if (!addr) {
      setIsJoined(null);
      setReferrerAddr(ZERO);
      return;
    }
    try {
      const details = await getUserDetails(addr);
      const ref =
        details?.[0] ??
        details?.referrer ??
        details?.referrerAddress ??
        ZERO;
      setReferrerAddr(ref);
      setIsJoined(!isZeroAddr(ref));
    } catch {
      setReferrerAddr(ZERO);
      setIsJoined(false);
    }
  };

  const refreshHistory = async () => {
    if (!account) return;
    try {
      setRefreshing(true);
      await ensureChain("bscTestnet");

      const count = await getUserStakeLength(account);
      const nowTs = Math.floor(Date.now() / 1000);

      const idxs = Array.from({ length: count }, (_, i) => i);
      const rows = await Promise.all(
        idxs.map(async (i) => {
          const d = await getUserStakeDetails(account, i);
          let rewardRaw = await simulateProcessAutoUnlockedStake(account, i, nowTs);
          if (!rewardRaw || rewardRaw === "0") rewardRaw = d.reward || "0";

          return {
            index: i,
            amountRaw: d.stakedAmount,
            amountFmt: formatUnits(d.stakedAmount, tokenDecimals, 4),
            ts: d.stakeTimestamp,
            tsHuman: d.stakeTimestamp ? new Date(d.stakeTimestamp * 1000).toLocaleString() : "-",
            rewardRaw,
            rewardFmt: formatUnits(rewardRaw, tokenDecimals, 4),
            isUnstaked: d.isUnstaked,
          };
        })
      );

      rows.sort((a, b) => b.ts - a.ts);
      setStakes(rows);
      setPage(1);
    } catch (e) {
      console.error("refreshHistory error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const refreshDashboardStats = async (addr = account) => {
      if (!addr) {
        setWithdrawableRaw("0");
        setUplinerLevelOpen(0);
        setUplinerRewardRaw("0");
        setDownlinerRewardRaw("0");
        setUnlockedLevels(0);
        return;
      }
  
      try {
        await ensureChain("bscTestnet");
  
        const safe = async (fn, fb) => {
          try { return await fn(); } catch { return fb; }
        };
  
        const [withdrawable, openLevel, uplReward, downReward, unlockBools] = await Promise.all([
          safe(() => getWithdrawRewardFixPlanP(addr), "0"),
          safe(() => getUplineLevelOpen(addr), 0),
          safe(() => getSelfRewardFromUpLinerFixPlan(addr), "0"),
          safe(() => getSelfRewardFromDownLinerFixPlan(addr), "0"),
          Promise.all(
            Array.from({ length: 10 }, (_, i) =>
              getReferralLevelUnLock(addr, i).catch(() => false)
            )
          ),
        ]);
  
        console.log("dashboard", { withdrawable, openLevel, uplReward, downReward, unlockBools });
  
        setWithdrawableRaw(String(withdrawable ?? "0"));
        setUplinerLevelOpen(Number(openLevel || 0));
        setUplinerRewardRaw(String(uplReward ?? "0"));
        setDownlinerRewardRaw(String(downReward ?? "0"));
        setUnlockedLevels((unlockBools || []).filter(Boolean).length);
      } catch (e) {
        console.warn("refreshDashboardStats error:", e);
      }
    };

  // const refreshDashboardStats = async (addr = account) => {
  //   if (!addr) {
  //     setWithdrawableRaw("0");
  //     setUplinerLevelOpen(0);
  //     setUplinerRewardRaw("0");
  //     setDownlinerRewardRaw("0");
  //     setUnlockedLevels(0);
  //     return;
  //   }
  //   try {
  //     await ensureChain("bscTestnet");
  //     const safe = async (fn, fb) => { try { return await fn(); } catch { return fb; } };
  //     const withdrawable = await getWithdrawRewardFixPlanP(addr);
  //     const openLevel = await safe(() => getUplineLevelOpen(addr), 0);
  //     const uplReward = await safe(() => getSelfRewardFromUpLinerFixPlan(addr), "0");
  //     const downReward = await safe(() => getSelfRewardFromDownLinerFixPlan(addr), "0");
  //     const unlockBools = await Promise.all(
  //       Array.from({ length: 10 }, (_, i) => getReferralLevelUnLock(addr, i).catch(() => false))
  //     );
  //     console.log("dashboard", { withdrawable, openLevel, uplReward, downReward, unlockBools });

  //     setWithdrawableRaw(String(withdrawable || "0"));
  //     setUplinerLevelOpen(Number(openLevel || 0));
  //     setUplinerRewardRaw(String(uplReward || "0"));
  //     setDownlinerRewardRaw(String(downReward || "0"));
  //     setUnlockedLevels(unlockBools.filter(Boolean).length);
  //   } catch (e) {
  //     console.warn("refreshDashboardStats error:", e);
  //   }
  // };

  // ---- actions ----
  const handleConnect = async () => {
    try {
      setBusy(true);
      const { account: acc, chainId: cid } = await connectWallet({ chainKey: "bscTestnet" });
      setAccount(acc);
      setChainId(cid);
      await refreshMetaAndBalance(acc);
      await refreshReferralStatus(acc);
    } catch (e) {
      alert(e?.message || "Failed to connect wallet.");
    } finally {
      setBusy(false);
    }
  };

  const handleApproveAndStake = async () => {
    if (isJoined === false) return alert("Please join first with a referrer before staking.");
    if (isJoined === null) {
      await refreshReferralStatus(account);
      if (isJoined === false) return alert("Please join first with a referrer before staking.");
    }
    if (!account) return alert("Please connect your wallet first.");
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount.");

    try {
      const want = BigInt(parseUnits(amount, tokenDecimals));
      const have = BigInt(rawBalance || "0");
      if (want > have) return alert("Amount exceeds wallet balance.");
    } catch {
      return alert("Invalid amount.");
    }

    try {
      setBusy(true);
      setTxMsg("Approving (if needed) and depositing…");
      const receipt = await approveAndDepositFixPlan30(amount);
      setTxMsg(`Deposit success: ${receipt.transactionHash}`);
      await refreshMetaAndBalance(account);
      await refreshDashboardStats(account);
      await refreshHistory();
      setAmount("");
    } catch (e) {
      console.error(e);
      setTxMsg(`Deposit failed: ${e?.message || e}`);
      alert(e?.message || "Transaction failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleClaim = async (typeNum) => {
    if (!account) return alert("Please connect your wallet first.");
    try {
      setClaiming(true);
      setTxMsg("Claiming…");
      const receipt = await claimFixPlan30(typeNum, { chainKey: "bscTestnet" });
      setTxMsg(`Claim success: ${receipt?.transactionHash || ""}`);
      await refreshMetaAndBalance(account);
      await refreshDashboardStats(account);
      await refreshHistory();
    } catch (e) {
      console.error(e);
      setTxMsg(`Claim failed: ${e?.message || e}`);
      alert(e?.message || "Claim failed.");
    } finally {
      setClaiming(false);
    }
  };

  // Day button => directly unstake with selected day
  const handleUnstake = async () => {
    try {
      if (!account) throw new Error("Please connect your wallet first.");
      if (!isValidAddress(account)) throw new Error("Invalid address");
      const idx = Number(unstakeIndex);
      if (!Number.isInteger(idx) || idx < 0) throw new Error("Enter a valid stake index.");

      const count = await getUserStakeLength(account);
      if (idx >= count) throw new Error(`Index out of range (0..${Math.max(0, count - 1)})`);

      setUnstaking(true);
      setTxMsg("Unstaking…");
      const receipt = await unstakeFixPlanP30({ from: account, index: idx, chainKey: "bscTestnet" });
      setTxMsg(`Unstake success: ${receipt?.transactionHash || ""}`);

      await Promise.all([
        refreshMetaAndBalance(account),
        refreshDashboardStats(account),
        refreshHistory(),
      ]);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Unstake failed.");
      setTxMsg(`Unstake failed: ${e?.message || e}`);
    } finally {
      setUnstaking(false);
    }
  };

  const displayBalance = formatUnits(rawBalance, tokenDecimals, 6);
  const withdrawableFmt = formatUnits(withdrawableRaw, tokenDecimals, 4);
  const uplinerRewardFmt = formatUnits(uplinerRewardRaw, tokenDecimals, 4);
  const downlinerRewardFmt = formatUnits(downlinerRewardRaw, tokenDecimals, 4);

  return (
    <div className="Flexible">
      <Header />
      <div className="container">
        <div className="row g-3">
          <div className="col-12 d-flex justify-content-between">
            <div className="heading">
              Flix Plan-30 Staking{" "}
              <span><i className="fa-solid fa-circle-question"></i></span>
            </div>
            <button
              className="zv-cta zv-cta--sm"
              onClick={async () => {
                if (!account) return;
                try {
                  setRefreshing(true);
                  await ensureChain("bscTestnet");
                  if (viewMode === "self") {
                    await Promise.all([
                      refreshHistory(),
                      refreshDashboardStats(account),
                      refreshMetaAndBalance(account),
                    ]);
                  } else {
                    // Team view: just ping the reusable table to reload
                    setTeamRefreshTick((t) => t + 1);
                    await refreshDashboardStats(account);
                  }
                } finally {
                  setRefreshing(false);
                }
              }}
              disabled={!account || refreshing}
              title="Refresh history & rewards"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

          </div>
        </div>
      </div>

      <section id="custom-tab">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">
                      Stake
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">
                      Unstake
                    </button>
                  </li>
                </ul>

                <div className="tab-content" id="myTabContent">
                  {/* Stake tab */}
                  <div className="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabIndex={0}>
                    <div className="card w-100">
                      <div className="custom-flex">
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                          <img src="https://akasdao.com/img/common/computed.svg" alt="calc" />
                        </button>
                        <h2>Balance: <span>{displayBalance} {tokenSymbol}</span></h2>
                      </div>

                      {/* Amount input + Max */}
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control text-white"
                          placeholder={`Enter amount in ${tokenSymbol}`}
                          aria-label="amount"
                          aria-describedby="basic-addon2"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                        />
                        <span
                          className="input-group-text"
                          id="basic-addon2"
                          style={{ cursor: "pointer" }}
                          onClick={() => setAmount(formatUnits(rawBalance, tokenDecimals, tokenDecimals))}
                        >
                          Max
                        </span>
                      </div>

                      {/* Connect / Approve & Stake */}
                      <div className="d-flex gap-2 mb-2">
                        {!account ? (
                          <button className="wallet-btn" onClick={handleConnect} disabled={busy}>
                            {busy ? "Connecting..." : "Connect Wallet"}
                          </button>
                        ) : (
                          <button className="wallet-btn" onClick={handleApproveAndStake} disabled={busy || !amount || isJoined === false}>
                            {isJoined === false ? "Join First" : busy ? "Processing…" : `Approve & Stake ${tokenSymbol}`}
                          </button>
                        )}
                      </div>

                      {/* Referral join guard */}
                      {isJoined === false && (
                        <div className="alert alert-warning py-2 mb-3" role="alert">
                          Please join first with a referrer before deposit.
                        </div>
                      )}

                      {/* Rewards + claim */}
                      <ul className="list-flex">
                        {/* <li className="d-flex justify-content-between">
                          <h6>Self Reward</h6>
                          <p className="d-flex align-items-center gap-2">
                            {withdrawableFmt} {tokenSymbol}
                          </p>
                          <button className="zv-cta zv-cta--sm" disabled={claiming} onClick={() => handleClaim(1)}>
                            Claim
                          </button>
                        </li> */}
                        <li className="d-flex justify-content-between">
                          <h6>Upline Reward</h6>
                          <p className="d-flex align-items-center gap-2">
                            {uplinerRewardFmt} {tokenSymbol}
                          </p>
                          <button className="zv-cta zv-cta--sm" disabled={claiming} onClick={() => handleClaim(3)}>
                            Claim
                          </button>
                        </li>
                        <li className="d-flex justify-content-between">
                          <h6>Downline Reward</h6>
                          <p className="d-flex align-items-center gap-2">
                            {downlinerRewardFmt} {tokenSymbol}
                          </p>
                          <button className="zv-cta zv-cta--sm" disabled={claiming} onClick={() => handleClaim(2)}>
                            Claim
                          </button>
                        </li>
                        <li className="d-flex justify-content-between">
                          <h6>Upline Open Level</h6>
                          <p>{uplinerLevelOpen}</p>
                        </li>
                        <li className="d-flex justify-content-between">
                          <h6>Unlocked Referral Levels (0–10)</h6>
                          <p>{unlockedLevels} / 10</p>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Unstake tab */}
                  <div className="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabIndex={0}>
                    <div className="card w-100">
                      <div className="custom-flex">
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                          <img src="https://akasdao.com/img/common/computed.svg" alt="calc" />
                        </button>
                        <h2>Balance: <span>{displayBalance} {tokenSymbol}</span></h2>
                      </div>

                      {/* Index input */}
                      <div className="row g-2">
                        <div className="col-md-12">
                          <label className="form-label">Stake Index</label>
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            className="form-control bg-transparent text-white form-custom"
                            placeholder="Enter stake index (0, 1, 2...)"
                            value={unstakeIndex}
                            onChange={(e) => setUnstakeIndex(e.target.value.replace(/[^\d]/g, ""))}
                          />
                        </div>
                      </div>
                      <div className="mx-auto mt-3">
                        <button
                          type="button"
                          className="zv-cta zv-cta--sm"
                          onClick={handleUnstake}
                          disabled={unstaking || !unstakeIndex || !account}
                        >
                          {unstaking ? "Unstaking…" : "Unstake"}
                        </button>
                      </div>

                      {/* <div className="custom-flex mt-3">
                        <h2 className="m-0">
                          Selected: <span>index #{unstakeIndex || "—"}</span>
                        </h2>
                      </div> */}

                      {/* {!account ? (
                        <button className="wallet-btn" onClick={handleConnect} disabled={busy}>
                          {busy ? "Connecting..." : "Connect Wallet"}
                        </button>
                      ) : (
                        <button className="wallet-btn" disabled>
                          Connected: {short(account)}
                        </button>
                      )} */}
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction History (unchanged) */}
      <section id="transaction">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="head d-flex justify-content-between align-items-center">
              <h2 className="m-0"> {viewMode === "team" ? "Team History" : "Stake History"}</h2>
                <div className="d-flex gap-2">
                  <button
                    className={`zv-cta zv-cta--sm ${viewMode === "team" ? "warning" : "outline-warning"}`}
                    style={{ width: "200px" }}
                    onClick={() => setViewMode(viewMode === "team" ? "self" : "team")}
                    disabled={!account || refreshing}
                    title="Toggle Team/Self view"
                  >
                    {viewMode === "team" ? "Self" : "Team"}
                  </button>
                </div>
              </div>

              {/* <div className="table-responsive mt-2">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ whiteSpace: "nowrap" }}>#</th>
                      <th style={{ whiteSpace: "nowrap" }}>Stake Time</th>
                      <th style={{ whiteSpace: "nowrap" }}>Staked Amount ({tokenSymbol})</th>
                      <th style={{ whiteSpace: "nowrap" }}>Reward ({tokenSymbol})</th>
                      <th style={{ whiteSpace: "nowrap" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          {account ? "No stakes found." : "Connect wallet to see history."}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((r) => (
                        <tr key={r.index}>
                          <td>{r.index}</td>
                          <td>
                            <div className="fw-semibold">{r.tsHuman}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>
                              {r.ts ? `(${r.ts})` : "-"}
                            </div>
                          </td>
                          <td className="fw-semibold">{r.amountFmt}</td>
                          <td className="fw-semibold">{r.rewardFmt}</td>
                          <td>
                            {r.isUnstaked ? (
                              <span className="badge bg-secondary">Unstaked</span>
                            ) : (
                              <span className="badge bg-primary">Staked</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end align-items-center gap-2">
                <button className="btn btn-sm btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  ‹ Prev
                </button>
                <span className="px-2 referral-input">Page {page} / {totalPages}</span>
                <button className="btn btn-sm btn-secondary referral-input" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next ›
                </button>
              </div> */}

              {/* TEAM vs SELF TABLE */}
              {viewMode === "team" ? (
                // --- TEAM LEVEL TABLE (reusable) ---
                <TeamLevelTable
                  account={account}
                  tokenSymbol={tokenSymbol}
                  tokenDecimals={tokenDecimals}
                  fetchRows={getTeamHistoryByLevel}   // must return: [{ address, totalSelfDepositedAmount, totalTeamMember?, index? }, ...]
                  initialLevel={1}
                  pageSize={10}
                  showTeamCount={true}
                  refreshSignal={teamRefreshTick}
                />
              ) : (
                // --- SELF HISTORY TABLE (existing) ---
                <>
                  <div className="table-responsive mt-2">
                    <table className="table table-hover align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ whiteSpace: "nowrap" }}>#</th>
                          <th style={{ whiteSpace: "nowrap" }}>Stake Time</th>
                          <th style={{ whiteSpace: "nowrap" }}>Staked Amount ({tokenSymbol})</th>
                          <th style={{ whiteSpace: "nowrap" }}>Reward ({tokenSymbol})</th>
                          <th style={{ whiteSpace: "nowrap" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4">
                              {account ? "No stakes found." : "Connect wallet to see history."}
                            </td>
                          </tr>
                        ) : (
                          pageRows.map((r) => (
                            <tr key={r.index}>
                              <td>{r.index}</td>
                              <td>
                                <div className="fw-semibold">{r.tsHuman}</div>
                                <div className="text-muted" style={{ fontSize: 12 }}>
                                  {r.ts ? `(${r.ts})` : "-"}
                                </div>
                              </td>
                              <td className="fw-semibold">{r.amountFmt}</td>
                              <td className="fw-semibold">{r.rewardFmt}</td>
                              <td>
                                {r.isUnstaked ? (
                                  <span className="badge bg-secondary">Unstaked</span>
                                ) : (
                                  <span className="zv-cta zv-cta--sm outline-warning">Staked</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Self view pagination */}
                  <div className="d-flex justify-content-end align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      ‹ Prev
                    </button>
                    <span className="px-2 referral-input">Page {page} / {totalPages}</span>
                    <button
                      className="btn btn-sm btn-secondary referral-input"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next ›
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </section>

      <Modal1 />
      <Footer />
    </div>
  );
};

export default Flexible;
