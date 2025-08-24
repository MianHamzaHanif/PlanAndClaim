import React, { useEffect, useState } from "react";
import "./Invite.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { connectWallet, getExistingConnection, ensureChain } from "../../Services/contract";
import { joinWithReferrer, getUserDetails, getReferralCount, getReferralNodeAddress } from "../../Services/InviteInstant.js";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const Invite = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [referrer, setReferrer] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error'|'info', text: string }
  const [refRows, setRefRows] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false); 
  const navigate = useNavigate();
  const { ref } = useParams(); // /invite/:ref
  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // options: 5/10/25/50

  // derived
  const totalPages = Math.max(1, Math.ceil(refRows.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = refRows.slice(start, end);

  // clamp page if data/size changes
  useEffect(() => {
    const tp = Math.max(1, Math.ceil(refRows.length / pageSize));
    if (page > tp) setPage(tp);
  }, [refRows.length, pageSize]); // eslint-disable-line

  // page list helper (compact window with ellipses)
  const getPageList = (curr, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const out = [1];
    const left = Math.max(2, curr - 1);
    const right = Math.min(total - 1, curr + 1);
    if (left > 2) out.push("…");
    for (let p = left; p <= right; p++) out.push(p);
    if (right < total - 1) out.push("…");
    out.push(total);
    return out;
  };

  const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

const fromWeiToNum = (wei) => {
  try { return Number(Web3.utils.fromWei(wei?.toString() || "0", "ether")); }
  catch { return 0; }
};

const formatDateTime = (sec) => {
  const n = Number(sec || 0);
  if (!n) return "-";
  return new Date(n * 1000).toLocaleString();
};

  /** Auto-hide alerts after 10s */
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  /** Read /invite/:ref, prefill input, then redirect to /invite */
  useEffect(() => {
    if (ref && Web3.utils.isAddress(ref)) {
      setReferrer(ref);
      // clean URL to /invite (no param) without adding history
      navigate("/invite", { replace: true });
    }
  }, [ref, navigate]);

  /** Silent restore wallet on mount */
  useEffect(() => {
    (async () => {
      const { account: acc, chainId: cid } = await getExistingConnection();
      if (acc) {
        setAccount(acc);
        setChainId(cid);
      }
    })();
  }, []);

  /** On wallet connect/chain change, build "My Referral Link" using userDetails */
  useEffect(() => {
    (async () => {
      try {
        if (!account) {
          setReferralLink(`${window.location.origin}/invite/`);
          setRefRows([]);
          return;
        }
        await ensureChain("bscTestnet");
        const details = await getUserDetails(account, { chainKey: "bscTestnet", chainId });
        // Support both array-return and struct-return
        const onChainRef =
          Array.isArray(details)
            ? details[0]
            : (details?.referrerAddress || details?.referrer || ZERO_ADDRESS);

        const hasRef =
          onChainRef && Web3.utils.isAddress(onChainRef) && onChainRef !== ZERO_ADDRESS;

        const link = hasRef
          ? `${window.location.origin}/invite/${onChainRef}`
          : `${window.location.origin}/invite/`;

        setReferralLink(link);
        await loadDirectReferrals(account, chainId);
      } catch {
        setReferralLink(`${window.location.origin}/invite/`);
        setRefRows([]);
      }
    })();
  }, [account, chainId]);

  /** Hard reload on account/chain/disconnect */
  useEffect(() => {
    if (window?.ethereum) {
      const handleAccountsChanged = () => window.location.reload();
      const handleChainChanged = () => window.location.reload();
      const handleDisconnect = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      };
    }
  }, []);

  /** Join flow (connect if needed → ensure 97 → pre-check userDetails → join) */
  const handleJoin = async () => {
    setMessage(null);

    if (!referrer || !Web3.utils.isAddress(referrer)) {
      setMessage({ type: "error", text: "Please enter a valid referrer address (0x...)" });
      return;
    }

    try {
      setBusy(true);

      // Connect if needed
      let useAccount = account;
      let useChainId = chainId;

      if (!useAccount) {
        const { account: acc, chainId: cid } = await connectWallet({ chainKey: "bscTestnet" });
        useAccount = acc;
        useChainId = cid;
        setAccount(acc);
        setChainId(cid);
      }

      // Ensure BSC Testnet (97)
      await ensureChain("bscTestnet");
      if (window?.ethereum) {
        const cidHex = await window.ethereum.request({ method: "eth_chainId" });
        useChainId = parseInt(cidHex, 16);
        setChainId(useChainId);
      }
      if (useChainId !== 97) {
        setMessage({ type: "error", text: "Please switch to BSC Testnet (chainId 97)." });
        setBusy(false);
        return;
      }

      // PRE-CHECK: already registered?
      const details = await getUserDetails(useAccount, { chainKey: "bscTestnet", chainId: useChainId });
      const alreadyRef =
        Array.isArray(details)
          ? details[0]
          : (details?.referrerAddress || details?.referrer || ZERO_ADDRESS);

      if (alreadyRef && Web3.utils.isAddress(alreadyRef) && alreadyRef !== ZERO_ADDRESS) {
        setMessage({ type: "info", text: "You are already registered." });
        setBusy(false);
        return;
      }

      // guard: self-referral not allowed
      if (useAccount?.toLowerCase() === referrer.toLowerCase()) {
        setMessage({ type: "error", text: "You cannot use your own address as referrer." });
        setBusy(false);
        return;
      }

      // Call join(referrer)
      const tx = await joinWithReferrer(referrer, useAccount, {
        chainKey: "bscTestnet",
        chainId: useChainId,
      });

      setMessage({
        type: "success",
        text: `Joined successfully! Tx: ${tx?.transactionHash || "sent"}`,
      });

      // Refresh link after join
      try {
        const after = await getUserDetails(useAccount, { chainKey: "bscTestnet", chainId: useChainId });
        const newRef =
          Array.isArray(after)
            ? after[0]
            : (after?.referrerAddress || after?.referrer || ZERO_ADDRESS);

        const hasRef = newRef && Web3.utils.isAddress(newRef) && newRef !== ZERO_ADDRESS;
        const link = hasRef
          ? `${window.location.origin}/invite/${newRef}`
          : `${window.location.origin}/invite/`;
        setReferralLink(link);
      } catch {}
    } catch (e) {
      setMessage({ type: "error", text: e?.message || "Transaction failed." });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink || `${window.location.origin}/invite/`);
      setMessage({ type: "info", text: "Link copied!" });
    } catch {
      setMessage({ type: "error", text: "Copy failed. Please copy manually." });
    }
  };

  const loadDirectReferrals = async (owner, cid) => {
    try {
      setLoadingRefs(true);
      setRefRows([]);

      // 1) Count
      const count = await getReferralCount(owner, 0, { chainKey: "bscTestnet" });
      if (!count) { setLoadingRefs(false); return; }

      // 2) All referral addresses (parallel)
      const idx = Array.from({ length: count }, (_, i) => i);
      const addresses = await Promise.all(
        idx.map(i => getReferralNodeAddress(owner, 0, i, { chainKey: "bscTestnet" }))
      );

      // 3) userDetails for each (parallel)
      const detailsList = await Promise.all(
        addresses.map(a => getUserDetails(a, { chainKey: "bscTestnet", chainId: cid }))
      );

      // 4) Normalize rows
      const rows = addresses.map((addr, i) => {
        const d = detailsList[i] || {};
        // support either struct props OR array order
        const registrationTime =
          d.registrationTime ?? d.registerTime ?? d[1] ?? 0;
        const totalTeamMember =
          (d.totalTeamMember ?? d.teamCount ?? d[2] ?? 0);
        const totalTeamMemberDepositWei =
          (d.totalTeamMemberDeposit ?? d.teamDeposit ?? d[3] ?? "0");
        const totalTeamMemberDeposit = fromWeiToNum(totalTeamMemberDepositWei);

        return {
          joinTime: formatDateTime(registrationTime),
          address: addr,
          team: Number(totalTeamMember || 0),
          teamDeposit: totalTeamMemberDeposit,
        };
      });

      setRefRows(rows);
    } catch (e) {
      // optional: show an alert
      // setMessage({ type: "error", text: e?.message || "Failed loading referrals." });
    } finally {
      setLoadingRefs(false);
    }
  };


  return (
    <div className="Invite">
      <Header />

      <div className="container-fluid">
        <div className="row">
          <div className="col-12"><h2>My Community</h2></div>

          <div className="col-12">
            {message && (
              <div
                className={`alert ${
                  message.type === "success"
                    ? "alert-success"
                    : message.type === "error"
                    ? "alert-danger"
                    : "alert-info"
                }`}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <div className="d-block d-md-flex align-items-center justify-content-between mb-4 gap-3">
              <h3 className="mb-2 mb-md-0">My Referrer</h3>
              <input
                type="text"
                value={referrer}
                onChange={(e) => setReferrer(e.target.value.trim())}
                className="form-control referral-input"
                placeholder="Enter referrer address (0x...)"
              />
              <button className="btn btn-primary" onClick={handleJoin} disabled={busy}>
                {busy ? "Joining..." : "Join"}
              </button>
            </div>
          </div>

          {/* My Referral Link */}
          <div className="col-12">
            <div className="d-block d-md-flex align-items-center justify-content-between mb-5 gap-3">
              <h3 className="mb-2 mb-md-0">My Referral Link</h3>
              <input
                type="text"
                className="form-control referral-input"
                value={referralLink}
                placeholder="No Link Available"
                readOnly
              />
              <button className="btn" onClick={handleCopy} disabled={!referralLink}>
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Rest of your page... */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card p-3">
              <h4>Direct Referral / Community Address Count</h4>
              <p>-/-</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3">
              <h4 className="d-flex align-items-center gap-2">
                <span>Total Community Bonus Amount (AS)</span>
                <div className="tooltips d-inline-flex align-items-center">
                  <img width={20} src="https://akasdao.com/img/common/info.png" alt="info" />
                  <span className="tooltip-text">
                    Here is your total earned bonus. The maximum bonus you can receive is 6 times your Net Position.
                    Once your bonus reaches 0AS, you will no longer earn additional bonuses (this does not affect your
                    ability to continue receiving block rewards).
                  </span>
                </div>
              </h4>
              <p>-</p>
            </div>
          </div>
        </div>
      </div>

      <section id="transaction">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="head"><h2>Direct Referral Details</h2></div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Join Time</th>
                      <th>Address</th>
                      <th>Team</th>
                      <th>Team Deposit</th>
                    </tr>
                  </thead>
                    <tbody>
                      {loadingRefs && (
                        <tr>
                          <td colSpan="4">Loading…</td>
                        </tr>
                      )}

                      {!loadingRefs && refRows.length === 0 && (
                        <tr>
                          <td colSpan="4">No Data</td>
                        </tr>
                      )}

                      {!loadingRefs && pageRows.map((r, i) => (
                        <tr key={`${r.address}-${start + i}`}>
                          <td>{r.joinTime}</td>
                          <td>{r.address}</td>
                          <td>{r.team}</td>
                          <td>{r.teamDeposit?.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                        </tr>
                      ))}
                    </tbody>
                </table>
                {/* Pagination toolbar */}
<div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
  <div className="d-flex align-items-center gap-2">
    <label className="form-label m-0 small referral-input">Rows per page</label>
    <select
      className="form-select form-select-sm w-auto"
      value={pageSize}
      onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
    </select>

    <span className="small ms-2 referral-input">
      Showing {refRows.length === 0 ? 0 : (start + 1)}–{Math.min(end, refRows.length)} of {refRows.length}
    </span>
  </div>

  <nav aria-label="Referral pagination">
    <ul className="pagination pagination-sm mb-0">
      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => setPage(1)} aria-label="First">«</button>
      </li>
      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous">‹</button>
      </li>

      {getPageList(page, totalPages).map((p, idx) =>
        typeof p === "string" ? (
          <li className="page-item disabled" key={`dots-${idx}`}>
            <span className="page-link">…</span>
          </li>
        ) : (
          <li className={`page-item ${page === p ? "active" : ""}`} key={`p-${p}`}>
            <button className="page-link" onClick={() => setPage(p)}>{p}</button>
          </li>
        )
      )}

      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next">›</button>
      </li>
      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => setPage(totalPages)} aria-label="Last">»</button>
      </li>
    </ul>
  </nav>
</div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Invite;
