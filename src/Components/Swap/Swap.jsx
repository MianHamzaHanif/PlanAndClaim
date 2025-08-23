import React from "react";
import "./Swap.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const Swap = () => {
  return (
    <div className="Swap">
      <Header />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2>Swap</h2>
            <div className="card">
              <p>Go to Dexscreener →</p>
            </div>
            <div className="card">
              <p>Go to AVE →</p>
            </div>
            <div className="card">
              <p>Go to QuickSwap →</p>
            </div>
            <div className="card">
              <div className="custom-flex">
                <h5>Pay</h5>
                <div className="custom-flex2">
                  <span>Slippage</span>
                  <input type="" placeholder="1" />
                  <span>%</span>
                </div>
              </div>
              <div className="des">
                <h5>Connect Wallet to Continue</h5>
                <p>Please connect your wallet to trade</p>
                <button>Connect Wallet</button>
                <p className="p2">Trading liquidity provided by QuickSwap</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Swap;
