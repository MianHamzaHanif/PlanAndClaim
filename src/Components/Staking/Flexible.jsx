import React, { useEffect, useState } from "react";
import "./Flexible.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import Modal1 from "./Modal1";

import {
  getUserDetails,
  approveAndDepositFlexible,
  parseUnits,
  getUserStakeLength,
  getUserStakeDetails,
  simulateProcessAutoUnlockedStake,
  getWithdrawRewardFlexiblePlanP,
  getUplineLevelOpen,
  getReferralLevelUnLock,
  getSelfRewardFromUpLinerFlexiblePlan,
  getSelfRewardFromDownLinerFlexiblePlan,
  claimFlexiblePlan,
  unstakeFlexiblePlanP,
  ALLOWED_UNSTAKE_DAYS,
  isValidAddress,
  getTeamHistoryByLevel,
} from "../../Services/planInstant";
import TeamLevelTable from "./common/TeamLevelTable";
import { connectWallet, getExistingConnection, ensureChain } from "../../Services/contract";
import { fetchUSDTMeta, fetchUSDTBalance, formatUnits } from "../../Services/USDTInstant";

// ---- constants / helpers ----
const ZERO = "0x0000000000000000000000000000000000000000";
const isZeroAddr = (a) => !a || String(a).toLowerCase() === ZERO.toLowerCase();
const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

const Flexible = () => {
  const [account, setAccount] = useState(null);
  // let account = "0x14DE801cFA279A84552B4064351f5205B7A4752f";
  console.log("account", account);
  const [chainId, setChainId] = useState(null);
  const [amount, setAmount] = useState("");
  const [txMsg, setTxMsg] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("USDT");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [rawBalance, setRawBalance] = useState("0");
  const [busy, setBusy] = useState(false);
  const [teamRefreshKey, setTeamRefreshKey] = useState(0);

  // self (your own) stakes
  const [stakes, setStakes] = useState([]);

  // team view states
  const [viewMode, setViewMode] = useState("self"); // 'self' | 'team'
  const [teamLevel, setTeamLevel] = useState(0);    // 1..10 (0 = none selected yet)
  const [teamRows, setTeamRows] = useState([]);

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
  const [refreshTick, setRefreshTick] = useState(0);

  // pagination (shared for both views)
  const PAGE_SIZE = 10;
  const dataSource = viewMode === "self" ? stakes : teamRows;
  const totalPages = Math.max(1, Math.ceil(dataSource.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageRows = dataSource.slice(pageStart, pageStart + PAGE_SIZE);


  const totalSelfRows = stakes.length;
  const selfFirstRow = Math.min(totalSelfRows, pageStart + 1);
  const selfLastRow = Math.min(totalSelfRows, pageStart + PAGE_SIZE);





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
      await refreshHistory();             // self view
      await refreshDashboardStats(account);
      // If team view is already active and a level is selected, refresh that too
      if (viewMode === "team" && teamLevel > 0) {
        await loadTeamLevel(teamLevel);
      }
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
        safe(() => getWithdrawRewardFlexiblePlanP(addr), "0"),
        safe(() => getUplineLevelOpen(addr), 0),                       // ✅ no comma operator
        safe(() => getSelfRewardFromUpLinerFlexiblePlan(addr), "0"),   // ✅ won’t break UI if it fails
        safe(() => getSelfRewardFromDownLinerFlexiblePlan(addr), "0"),
        Promise.all(Array.from({ length: 10 }, (_, i) =>
          getReferralLevelUnLock(addr, i).catch(() => false)
        )),
      ]);

      setWithdrawableRaw(String(withdrawable ?? "0"));
      setUplinerLevelOpen(Number(openLevel || 0));
      setUplinerRewardRaw(String(uplReward ?? "0"));
      setDownlinerRewardRaw(String(downReward ?? "0"));
      setUnlockedLevels((unlockBools || []).filter(Boolean).length);
    } catch (e) {
      console.warn("refreshDashboardStats error:", e);
    }
  };

  const loadTeamLevel = async (level) => {
    if (!account) return;
    try {
      setRefreshing(true);
      await ensureChain("bscTestnet");

      let list = [];
      try {
        list = await getTeamHistoryByLevel(account, level); // [{ address, totalSelfDepositedAmount, totalTeamMember }]
      } catch (e) {
        console.warn("getTeamHistoryByLevel failed:", e);
        list = [];
      }

      const rows = (list || []).map((m, ix) => {
        const raw = String(m.totalSelfDepositedAmount || "0");
        return {
          index: m.index ?? ix + 1,
          address: m.address,
          teamCount: Number(m.totalTeamMember ?? 0), // << new
          depositRaw: raw,
          depositFmt: formatUnits(raw, tokenDecimals, 4),
        };
      });

      setTeamRows(rows);
      setPage(1);
    } catch (e) {
      console.error("loadTeamLevel error:", e);
      setTeamRows([]);
    } finally {
      setRefreshing(false);
    }
  };

  
  const handleConnect = async () => {
    try {
      setBusy(true);
      // const { account: acc, chainId: cid } = await connectWallet({ chainKey: "bscTestnet" });
      // setAccount(acc); setChainId(cid);
      let acc = "0x14DE801cFA279A84552B4064351f5205B7A4752f";
      const cid = chainId;
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
      const receipt = await approveAndDepositFlexible(amount);
      setTxMsg(`Deposit success: ${receipt.transactionHash}`);
      await refreshMetaAndBalance(account);
      await refreshDashboardStats(account);
      await refreshHistory();
      if (viewMode === "team" && teamLevel > 0) await loadTeamLevel(teamLevel);
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
      const receipt = await claimFlexiblePlan(typeNum, { chainKey: "bscTestnet" });
      setTxMsg(`Claim success: ${receipt?.transactionHash || ""}`);
      await refreshMetaAndBalance(account);
      await refreshDashboardStats(account);
      await refreshHistory();
      if (viewMode === "team" && teamLevel > 0) await loadTeamLevel(teamLevel);
    } catch (e) {
      console.error(e);
      setTxMsg(`Claim failed: ${e?.message || e}`);
      alert(e?.message || "Claim failed.");
    } finally {
      setClaiming(false);
    }
  };

  // Day button => directly unstake with selected day
  const handleUnstakeDayClick = async () => {
    console.log("handleunstake working")
    try {
      if (!account) throw new Error("Please connect your wallet first.");
      if (!isValidAddress(account)) throw new Error("Invalid address");
      const idx = Number(unstakeIndex);
      if (!Number.isInteger(idx) || idx < 0) throw new Error("Enter a valid stake index.");

      const count = await getUserStakeLength(account);
      if (idx >= count) throw new Error(`Index out of range (0..${Math.max(0, count - 1)})`);

      setUnstaking(true);
      setTxMsg("Unstaking…");
      console.log("accountaccountaccount", account, idx)
      const receipt = await unstakeFlexiblePlanP({
        from: account,
        index: idx,
        // days: Number(day),
        chainKey: "bscTestnet",
      });
      setTxMsg(`Unstake success: ${receipt?.transactionHash || ""}`);
      await refreshMetaAndBalance(account);
      await refreshDashboardStats(account);
      await refreshHistory();
      if (viewMode === "team" && teamLevel > 0) await loadTeamLevel(teamLevel);
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
              Flexible Staking{" "}
              <span><i className="fa-solid fa-circle-question"></i></span>
            </div>
            {/* Refresh (context-aware) */}
            <button
              className="zv-cta zv-cta--sm"
              onClick={async () => {
                if (!account) return;
                try {
                  setRefreshing(true);
                  await ensureChain("bscTestnet");
                  // if (viewMode === "self") {
                  //   await Promise.all([
                  //     refreshHistory(),
                  //     refreshDashboardStats(account),
                  //     refreshMetaAndBalance(account),
                  //   ]);
                  // } else {
                  //   // Team view: refresh only current level (and optionally dashboard)
                  //   // await Promise.all([
                  //   setTeamRefreshKey((k) => k + 1);
                  //   // teamLevel > 0 ? loadTeamLevel(teamLevel) : Promise.resolve(),
                  //   refreshDashboardStats(account);
                  //   // ]);
                  // }
                  if (viewMode === "self") {
                    await Promise.all([refreshHistory(), refreshDashboardStats(account), refreshMetaAndBalance(account)]);
                  } else {
                    setRefreshTick(t => t + 1); // <- tells TeamLevelTable to reload
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
                      <ul className="list-flex text-white">
                        {/* <li className="justify-content-between d-flex">
                          <h6 className="text-white">Self Reward</h6>
                          <p className="d-flex align-items-center gap-2">
                            {withdrawableFmt} {tokenSymbol}
                          </p>
                          <button className="zv-cta zv-cta--sm" disabled={claiming} onClick={() => handleClaim(1)}>
                            Claim
                          </button>
                        </li> */}
                        <li className="justify-content-between d-flex">
                          <h6 className="text-white">Upline Reward</h6>
                          <p className="d-flex align-items-center gap-2">
                            {uplinerRewardFmt} {tokenSymbol}
                          </p>
                          <button className="zv-cta zv-cta--sm" disabled={claiming} onClick={() => handleClaim(3)}>
                            Claim
                          </button>
                        </li>
                        <li className="justify-content-between d-flex">
                          <h6 className="text-white">Downline Reward</h6>
                          <p className="d-flex align-items-center gap-2">
                            {downlinerRewardFmt} {tokenSymbol}
                          </p>
                          <button className="zv-cta zv-cta--sm" disabled={claiming} onClick={() => handleClaim(2)}>
                            Claim
                          </button>
                        </li>
                        <li className="justify-content-between d-flex">
                          <h6 className="text-white">Upline Open Level</h6>
                          <p>{uplinerLevelOpen}</p>
                        </li>
                        <li className="justify-content-between d-flex">
                          <h6 className="text-white">Unlocked Referral Levels (0–10)</h6>
                          <p>{unlockedLevels} / 10</p>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Unstake tab */}
                  <div className="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabIndex={0}>
                    <div className="card w-100 ">
                      <div className="custom-flex">
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                          <img src="https://akasdao.com/img/common/computed.svg" alt="calc" />
                        </button>
                        <h2>Balance: <span>{displayBalance} {tokenSymbol}</span></h2>
                      </div>

                      {/* Index input */}
                      <div className="row g-2 align-items-center">
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
                        <div className="d-flex flex-wrap gap-2">
                          {/* {ALLOWED_UNSTAKE_DAYS.map((d) => ( */}
                          <button
                            // key={d}
                            type="button"
                            className="zv-cta zv-cta--sm px-5"
                            onClick={() => handleUnstakeDayClick()}
                            disabled={unstaking || !unstakeIndex || !account}
                          >
                            Unstake
                          </button>
                          {/* ))} */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction History */}
      <section id="transaction">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="head d-flex flex-wrap gap-2 justify-content-between align-items-center">
                <h2 className="m-0"> {viewMode === "team" ? "Team History" : "Stake History"}</h2>
                <div className="d-flex gap-2">
                  {/* Team toggle */}
                  <button
                    className={`zv-cta zv-cta--sm ${viewMode === "team" ? "warning" : "outline-warning"}`}
                    style={{ width: "200px" }}
                    onClick={async () => {
                      const isGoingTeam = viewMode !== "team";
                      setViewMode(isGoingTeam ? "team" : "self");
                      setPage(1);
                      // If switching to team and no level chosen yet, default to 1
                      if (isGoingTeam) {
                        const defaultLevel = teamLevel > 0 ? teamLevel : 1;
                        setTeamLevel(defaultLevel);
                        await loadTeamLevel(defaultLevel);
                      }
                    }}
                    title="Show team levels and history"
                    disabled={!account || refreshing}
                  >
                    {viewMode === "team" ? "Self" : "Team"}
                    {/* Team */}
                  </button>
                </div>
              </div>

              {/* Team level chooser */}
              {/* {viewMode === "team" && (
                <div className="mt-2">
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
                      const enabled = true; 
                      return (
                        <button
                          key={lvl}
                          className={`btn-level ${teamLevel === lvl ? "btn-filters" : "btn-outline-filters"}`}
                          disabled={!enabled || refreshing}
                          onClick={async () => {
                            setTeamLevel(lvl);
                            setPage(1);
                            await loadTeamLevel(lvl);
                          }}
                          title={`Show level ${lvl} history`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                  <div className="small text-white mt-1">
                    {teamLevel > 0 ? `Showing Team Level ${teamLevel} history` : "Choose a team level"}
                  </div>
                </div>
              )} */}

              {/* <div className="table-responsive mt-2">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    {viewMode === "team" ? (
                      <tr>
                        <th style={{ whiteSpace: "nowrap" }}>#</th>
                        <th style={{ whiteSpace: "nowrap" }}>Address</th>
                        <th style={{ whiteSpace: "nowrap" }}>Total Team</th> 
                        <th style={{ whiteSpace: "nowrap" }}>Self Deposit ({tokenSymbol})</th>
                      </tr>
                    ) : (
                      <tr>
                        <th style={{ whiteSpace: "nowrap" }}>#</th>
                        <th style={{ whiteSpace: "nowrap" }}>Stake Time</th>
                        <th style={{ whiteSpace: "nowrap" }}>Staked Amount ({tokenSymbol})</th>
                        <th style={{ whiteSpace: "nowrap" }}>Reward ({tokenSymbol})</th>
                        <th style={{ whiteSpace: "nowrap" }}>Status</th>
                      </tr>
                    )}
                  </thead>

                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={viewMode === "team" ? 4 : 5} className="text-center py-4">
                          {account
                            ? viewMode === "team"
                              ? "No team members found for this level."
                              : "No stakes found."
                            : "Connect wallet to see history."}
                        </td>
                      </tr>
                    ) : viewMode === "team" ? (
                   
                      pageRows.map((r, i) => {
                        const displayIndex = Number.isFinite(r?.index) ? r.index : pageStart + i + 1;
                        const depositRaw = String(r?.depositRaw ?? r?.totalSelfDepositedAmount ?? "0");
                        const depositFmt = r?.depositFmt ?? formatUnits(depositRaw, tokenDecimals, 4);
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
                            <td>{r.teamCount ?? 0}</td> 
                            <td className="fw-semibold">{depositFmt}</td>
                          </tr>
                        );
                      })
                    ) : (
                   
                      pageRows.map((r) => (
                        <tr key={`self-${r.index}-${r.ts}`}>
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
              </div> */}

              {/* <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                <div className="text-muted small">
                  {totalSelfRows > 0
                    ? `Showing ${selfFirstRow}–${selfLastRow} of ${totalSelfRows}`
                    : "No rows"}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                    title="First page"
                  >
                    « First
                  </button>

                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    title="Previous page"
                  >
                    ‹ Prev
                  </button>

                  <span className="px-2 referral-input">
                    Page {page} / {totalPages}
                  </span>

                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    title="Next page"
                  >
                    Next ›
                  </button>

                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                    title="Last page"
                  >
                    Last »
                  </button>
                </div>
              </div> */}

              {/* {viewMode !== "team" && ( */}

              {/* )} */}

              {/* TABLE */}
              {viewMode === "team" ? (
                <>
                  {/* Team table (reusable) */}
                  <TeamLevelTable
                    account={account}
                    tokenSymbol={tokenSymbol}
                    tokenDecimals={tokenDecimals}
                    fetchRows={getTeamHistoryByLevel}   // (account, level) => Promise<rows[]>
                    initialLevel={1}
                    pageSize={10}
                    showTeamCount={true}
                    refreshSignal={refreshTick}
                  />
                </>
              ) : (
                <>
                  {/* Self history table (your existing one) */}
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
                            <td colSpan={5} className="text-center py-4">
                              {account ? "No stakes found." : "Connect wallet to see history."}
                            </td>
                          </tr>
                        ) : (
                          pageRows.map((r) => (
                            <tr key={`self-${r.index}-${r.ts}`}>
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

                  {/* Self view pagination footer */}
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                    <div className="text-muted small">
                      {stakes.length > 0
                        ? `Showing ${Math.min(stakes.length, pageStart + 1)}–${Math.min(stakes.length, pageStart + PAGE_SIZE)} of ${stakes.length}`
                        : "No rows"}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-secondary" onClick={() => setPage(1)} disabled={page <= 1} title="First page">« First</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} title="Previous page">‹ Prev</button>
                      <span className="px-2 referral-input">Page {page} / {totalPages}</span>
                      <button className="btn btn-sm btn-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} title="Next page">Next ›</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setPage(totalPages)} disabled={page >= totalPages} title="Last page">Last »</button>
                    </div>
                  </div>
                </>
              )}


              {/* {viewMode !== "team" && (
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    ‹ Prev
                  </button>
                  <span className="px-2 referral-input">Page {page} / {totalPages}</span>
                  <button className="btn btn-sm btn-secondary referral-input" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                    Next ›
                  </button>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </section>

      <Modal1 />
      <Footer />
    </div >
  );
};

export default Flexible;
