import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"; // ✅ React Router DOM
import "./header.css";
import Logo from "../../../public/logoimg/logo.webp";
import {
  connectWallet,
  attachProviderEvents,
  removeProviderEvents,
  tryRevokePermissions,
  getExistingConnection,
} from "../../Services/contract";

const Header = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef(null);
  const [bootstrapModal, setBootstrapModal] = useState(null);

  // Init Bootstrap Modal
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const modalEl = document.getElementById("connectModal");
      modalRef.current = modalEl;
      if (window.bootstrap && modalEl) {
        const m = new window.bootstrap.Modal(modalEl, { backdrop: "static" });
        setBootstrapModal(m);
      }
    }
  }, []);

  // Silent restore (wallet already connected)
  useEffect(() => {
    (async () => {
      const { account: acc, chainId: cid } = await getExistingConnection();
      if (acc) {
        setAccount(acc);
        setChainId(cid);
      }
    })();
  }, []);

  // Provider events
  useEffect(() => {
    attachProviderEvents({
      onAccountsChanged: (accs) => {
        const next = accs?.[0] || null;
        setAccount(next);
        if (next && bootstrapModal) bootstrapModal.show();
        if (!next) setChainId(null);
      },
      onChainChanged: (cid) => setChainId(cid),
      onDisconnect: () => {
        setAccount(null);
        setChainId(null);
      },
    });
    return () => removeProviderEvents();
  }, [bootstrapModal]);

  const short = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "");

  const handleConnect = useCallback(async () => {
    if (account) {
      if (bootstrapModal) bootstrapModal.show();
      return;
    }
    try {
      const { account: acc, chainId: cid } = await connectWallet({ chainKey: "bscTestnet" });
      setAccount(acc);
      setChainId(cid);
      if (bootstrapModal) bootstrapModal.show();
    } catch (e) {
      alert(e?.message || "Failed to connect wallet.");
    }
  }, [account, bootstrapModal]);

  const handleDisconnect = useCallback(async () => {
    setAccount(null);
    setChainId(null);
    await tryRevokePermissions();
    if (bootstrapModal) bootstrapModal.hide();
  }, [bootstrapModal]);

  return (
    <>
      <header className="main-header">
        <nav className="navbar navbar-expand-xl navbar-dark homepageheader fixed-top">
          <div className="container-fluid">
            <Link className="navbar-brand logo" to="/">
              <img className="w-100 h-100" src={Logo} alt="Logo" />
            </Link>

            <div className="d-flex align-items-center gap-2">
              <div className="buttonGroup d-xl-none">
                <button className="btn1" onClick={handleConnect}>
                  {!mounted ? "…" : account ? short(account) : "Connect Wallet"}
                </button>
              </div>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarsExample06"
              >
                <span className="navbar-toggler-icon" />
              </button>
            </div>

            <div className="collapse navbar-collapse" id="navbarsExample06">
              <ul className="navbar-nav mx-auto mb-2 mb-md-0">
                <li className="nav-item">
                  <Link className="nav-link active" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link active" to="/dashboard">Dashboard</Link>
                </li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Staking</a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/flexible">Flexible Staking</Link></li>
                    <li><Link className="dropdown-item" to="/longterm">Long-term Staking</Link></li>
                  </ul>
                </li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Bonds</a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/liquidity">Liquidity Bonds</Link></li>
                    <li><Link className="dropdown-item" to="/comeson">Treasury Bonds</Link></li>
                    <li><Link className="dropdown-item" to="/comeson">Burn Bonds</Link></li>
                  </ul>
                </li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">DAO</a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/resonance">Resonance Pool</Link></li>
                    <li><Link className="dropdown-item" to="/Title">Level Pool</Link></li>
                    <li><Link className="dropdown-item" to="/referral">Referral Pool</Link></li>
                    <li><Link className="dropdown-item" to="/service">Services Pool</Link></li>
                    <li><Link className="dropdown-item" to="/reciprocal">Reciprocol Pool</Link></li>
                    <li><Link className="dropdown-item" to="/incentive">Incentive Pool</Link></li>
                  </ul>
                </li>

                <li className="nav-item"><Link className="nav-link active" to="/turbine">Turbine</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/swap">Swap</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/invite">Community</Link></li>
              </ul>

              <div className="buttonGroup">
                <button className="btn1" onClick={handleConnect}>
                  {!mounted ? "…" : account ? short(account) : "Connect Wallet"}
                </button>

                {account && (
                  <button className="btn btn-outline-light ms-2" onClick={handleDisconnect}>
                    Disconnect
                  </button>
                )}

                <div className="dropdown ms-2">
                  <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    English
                  </button>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#">中文</a></li>
                    <li><a className="dropdown-item" href="#">日本語</a></li>
                    <li><a className="dropdown-item" href="#">한국어</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
