import React, { useEffect, useState } from "react";
import "./Flexible.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import Modal1 from "./Modal1";

import { approveAndDepositFlexible, parseUnits, getUserStakeLength,
getUserStakeDetails,
simulateProcessAutoUnlockedStake } from "../../Services/FlexibleInstant";
import { connectWallet, getExistingConnection, ensureChain } from "../../Services/contract";
import { fetchUSDTMeta, fetchUSDTBalance, formatUnits } from "../../Services/USDTInstant";
import { getUserDetails } from "../../Services/InviteInstant";

// ---- constants / helpers (declare BEFORE use) ----
const ZERO = "0x0000000000000000000000000000000000000000";
const isZeroAddr = (a) => !a || String(a).toLowerCase() === ZERO.toLowerCase();
const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

const Flexible = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [amount, setAmount] = useState("");
  const [txMsg, setTxMsg] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("USDT");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [rawBalance, setRawBalance] = useState("0");
  const [busy, setBusy] = useState(false);
  const [stakes, setStakes] = useState([]);     // rows for the table
  const [refreshing, setRefreshing] = useState(false);
  const [isJoined, setIsJoined] = useState(null); // null=unknown
  const [referrerAddr, setReferrerAddr] = useState(ZERO);
  const [page, setPage] = useState(1);

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

  // ---- reload on MetaMask events ----
  useEffect(() => {
    if (!window?.ethereum) return;
    const reload = () => window.location.reload();
    window.ethereum.on("accountsChanged", reload);
    window.ethereum.on("chainChanged", reload);
    window.ethereum.on("disconnect", reload);
    return () => {
      window.ethereum.removeListener("accountsChanged", reload);
      window.ethereum.removeListener("chainChanged", reload);
      window.ethereum.removeListener("disconnect", reload);
    };
  }, []);

  // ---- single refresh effect (balance + referral) ----
  useEffect(() => {
    (async () => {
      await refreshMetaAndBalance(account);
      await refreshReferralStatus(account);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId]);

  useEffect(() => {
  (async () => {
    await refreshMetaAndBalance(account);
    await refreshReferralStatus(account);
    await refreshHistory(); // ⬅️ load table
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [account, chainId, tokenDecimals]);

  // ---- reads ----
  const refreshMetaAndBalance = async (addr = account) => {
    try {
      await ensureChain("bscTestnet");
      const meta = await fetchUSDTMeta();
      setTokenSymbol(meta.symbol || "TOKEN");
      setTokenDecimals(meta.decimals || 18);

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
      const details = await getUserDetails(addr); // tuple or object
      const ref =
        details?.[0] ??
        details?.referrer ??
        details?.referrerAddress ??
        ZERO;

      setReferrerAddr(ref);
      setIsJoined(!isZeroAddr(ref));
    } catch (e) {
      console.warn("getUserDetails failed:", e);
      setReferrerAddr(ZERO);
      setIsJoined(false);
    }
  };

  // ---- connect ----
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

  // ---- stake (approve -> deposit) ----
  const handleApproveAndStake = async () => {
    if (isJoined === false) {
      alert("Please join first with a referrer before staking.");
      return;
    }
    if (isJoined === null) {
      await refreshReferralStatus(account);
      if (isJoined === false) {
        alert("Please join first with a referrer before staking.");
        return;
      }
    }
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    // balance guard
    try {
      const want = BigInt(parseUnits(amount, tokenDecimals));
      const have = BigInt(rawBalance || "0");
      if (want > have) {
        alert("Amount exceeds wallet balance.");
        return;
      }
    } catch {
      alert("Invalid amount.");
      return;
    }

    try {
      setBusy(true);
      setTxMsg("Approving (if needed) and depositing…");
      const receipt = await approveAndDepositFlexible(amount);
      setTxMsg(`Deposit success: ${receipt.transactionHash}`);
      await refreshMetaAndBalance(account);
      setAmount("");
    } catch (e) {
      console.error(e);
      setTxMsg(`Deposit failed: ${e?.message || e}`);
      alert(e?.message || "Transaction failed.");
    } finally {
      setBusy(false);
    }
  };

  const refreshHistory = async () => {
  if (!account) return;
  try {
    setRefreshing(true);
    await ensureChain("bscTestnet");

    const count = await getUserStakeLength(account);
    console.log("User stake count:", count, account);
    
    const nowTs = Math.floor(Date.now() / 1000);

    const idxs = Array.from({ length: count }, (_, i) => i);
    const rows = await Promise.all(
      idxs.map(async (i) => {
        const d = await getUserStakeDetails(account, i);

        // Prefer simulated reward at "now"
        let rewardRaw = await simulateProcessAutoUnlockedStake(account, i, nowTs);
        if (!rewardRaw || rewardRaw === "0") {
          // fallback to detail reward if simulation not available
          rewardRaw = d.reward || "0";
        }

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

    // newest first
    rows.sort((a, b) => b.ts - a.ts);

    setStakes(rows);
    setPage(1);
  } catch (e) {
    console.error("refreshHistory error:", e);
  } finally {
    setRefreshing(false);
  }
};


  const displayBalance = formatUnits(rawBalance, tokenDecimals, 6);

  return (
    <div className="Flexible">
      <Header />

      <div className="container-fluid">
        <div className="row g-3">
          <div className="col-12">
            <div className="heading">
              Flexible Staking{" "}
              <span>
                <i className="fa-solid fa-circle-question"></i>
              </span>
            </div>
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
                    <button
                      className="nav-link active"
                      id="home-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#home-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="home-tab-pane"
                      aria-selected="true"
                    >
                      Stake
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="profile-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#profile-tab-pane"
                      type="button"
                      role="tab"
                      aria-controls="profile-tab-pane"
                      aria-selected="false"
                    >
                      Unstake
                    </button>
                  </li>
                </ul>

                <div className="tab-content" id="myTabContent">
                  {/* Stake tab */}
                  <div
                    className="tab-pane fade show active"
                    id="home-tab-pane"
                    role="tabpanel"
                    aria-labelledby="home-tab"
                    tabIndex={0}
                  >
                    <div className="card">
                      <div className="custom-flex">
                        <button
                          type="button"
                          className="btn btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                        >
                          <img src="https://akasdao.com/img/common/computed.svg" alt="calc" />
                        </button>

                        <h2>
                          Balance: <span>{displayBalance} {tokenSymbol}</span>
                        </h2>
                      </div>

                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
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
                          onClick={() => {
                            // fill full balance (no truncation)
                            setAmount(formatUnits(rawBalance, tokenDecimals, tokenDecimals));
                          }}
                        >
                          Max
                        </span>
                      </div>

                      <div className="d-flex gap-2 mb-2">
                        {!account ? (
                          <button className="wallet-btn" onClick={handleConnect} disabled={busy}>
                            {busy ? "Connecting..." : "Connect Wallet"}
                          </button>
                        ) : (
                          <button
                            className="wallet-btn"
                            onClick={handleApproveAndStake}
                            disabled={busy || !amount || isJoined === false}
                          >
                            {isJoined === false
                              ? "Join First"
                              : busy
                                ? "Processing…"
                                : `Approve & Stake ${tokenSymbol}`}
                          </button>
                        )}
                      </div>

                      {/* referral status */}
                      {isJoined === false && (
                        <div className="alert alert-warning py-2 mb-3" role="alert">
                          Please join first with a referrer before deposit.
                        </div>
                      )}
                      {/* {isJoined === true && (
                        <div className="alert alert-success py-2 mb-3" role="alert">
                          Referral linked ✔ Referrer: {short(referrerAddr)}
                        </div>
                      )} */}

                      {/* tx status */}
                      {/* {txMsg ? (
                        <p style={{ marginTop: 8, wordBreak: "break-all" }}>
                          {txMsg}{" "}
                          {txMsg.startsWith("Deposit success: ") && (
                            <a
                              href={`https://testnet.bscscan.com/tx/${txMsg.replace("Deposit success: ", "")}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View on BscScan
                            </a>
                          )}
                        </p>
                      ) : null} */}

                      <ul className="list-flex">
                        <li>
                          <h6>Locked Amount</h6>
                          <p>0 {tokenSymbol}</p>
                        </li>
                        <li>
                          <h6>Next Rebase Reward</h6>
                          <p>0 {tokenSymbol}</p>
                        </li>
                        <li>
                          <h6>Next Rebase APY</h6>
                          <p>0%</p>
                        </li>
                        <li>
                          <h6>Countdown to Next Rebase</h6>
                          <p>Countdown not started</p>
                        </li>
                        <li>
                          <h6>Rebase Rewards</h6>
                          <p>0 {tokenSymbol}</p>
                        </li>
                        <li>
                          <h6></h6>
                          <button className="claim-btn">Claim</button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Unstake tab */}
                  <div
                    className="tab-pane fade"
                    id="profile-tab-pane"
                    role="tabpanel"
                    aria-labelledby="profile-tab"
                    tabIndex={0}
                  >
                    <div className="card">
                      <div className="custom-flex">
                        <button
                          type="button"
                          className="btn btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                        >
                          <img src="https://akasdao.com/img/common/computed.svg" alt="calc" />
                        </button>
                        <h2>
                          Balance: <span>{displayBalance} {tokenSymbol}</span>
                        </h2>
                      </div>

                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`Enter amount in ${tokenSymbol}`}
                          aria-label="amount"
                          aria-describedby="basic-addon2"
                          disabled
                        />
                        <span className="input-group-text" id="basic-addon2">
                          Max
                        </span>
                      </div>

                      <div className="custom-flex">
                        <img src="" alt="" />
                        <h2>
                          Unstakable Amount: <span>0.0000 {tokenSymbol}</span>
                        </h2>
                      </div>

                      {!account ? (
                        <button className="wallet-btn" onClick={handleConnect} disabled={busy}>
                          {busy ? "Connecting..." : "Connect Wallet"}
                        </button>
                      ) : (
                        <button className="wallet-btn" disabled>
                          Connected: {short(account)}
                        </button>
                      )}

                      <ul className="list-flex">
                        <li>
                          <h6>Locked Amount</h6>
                          <p>0 {tokenSymbol}</p>
                        </li>
                        <li>
                          <h6>Next Rebase Reward</h6>
                          <p>0 {tokenSymbol}</p>
                        </li>
                        <li>
                          <h6>Next Rebase APY</h6>
                          <p>0%</p>
                        </li>
                        <li>
                          <h6>Countdown to Next Rebase</h6>
                          <p>Countdown not started</p>
                        </li>
                        <li>
                          <h6>Rebase Rewards</h6>
                          <p>0 {tokenSymbol}</p>
                        </li>
                        <li>
                          <h6></h6>
                          <button className="claim-btn">Claim</button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </section>
      <section id="transaction">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="head d-flex justify-content-between align-items-center">
                <h2 className="m-0">Transaction History</h2>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={refreshHistory}
                  disabled={!account || refreshing}
                  title="Refresh latest rewards using current time"
                >
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
              </div>

              <div className="table-responsive mt-2">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th style={{whiteSpace:"nowrap"}}>#</th>
                      <th style={{whiteSpace:"nowrap"}}>Stake Time</th>
                      <th style={{whiteSpace:"nowrap"}}>Staked Amount ({tokenSymbol})</th>
                      <th style={{whiteSpace:"nowrap"}}>Reward ({tokenSymbol})</th>
                      <th style={{whiteSpace:"nowrap"}}>Status</th>
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
                            <div className="text-muted" style={{fontSize:12}}>
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

              {/* Pagination */}
              <div className="d-flex justify-content-end align-items-center gap-2">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ‹ Prev
                </button>
                <span className="px-2 .referral-input referral-input">Page {page} / {totalPages}</span>
                <button
                  className="btn btn-sm btn-secondary referral-input"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next ›
                </button>
              </div>
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
