import React from "react";
import "./liquidity.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const LiquidityBonds = () => {
  return (
    <div className="LiquidityBonds">
      <Header />
      <div className="container-fluid">
        <div className="row g-3">
          <div className="col-12">
            <div className="heading">Liquidity Bonds <span><i className="fa-solid fa-circle-question"></i></span></div>
          </div>
          <div className="col-12 px-lg-3">
            <div className="card graphcard">
              <div className="card-body pb-4">
              <div className="card-heading">Liquidity Bonds Market Cap</div>
              <div className="card-amount">$ 0</div>
                <svg
    tabIndex={0}
    role="application"
    className="recharts-surface"
    width={1232}
    height={330}
    viewBox="0 0 1232 330"
    style={{ width: "100%", height: "100%" }}
  >
    <title />
    <desc />
    <defs>
      <clipPath id="recharts5-clip">
        <rect x={70} y={20} height={280} width={1142} />
      </clipPath>
    </defs>
    <g className="recharts-cartesian-grid">
      <g className="recharts-cartesian-grid-horizontal">
        <line
          strokeDasharray={3}
          stroke="#ccc"
          fill="none"
          x={70}
          y={20}
          width={1142}
          height={280}
          x1={70}
          y1={20}
          x2={1212}
          y2={20}
        />
        <line
          strokeDasharray={3}
          stroke="#ccc"
          fill="none"
          x={70}
          y={20}
          width={1142}
          height={280}
          x1={70}
          y1={300}
          x2={1212}
          y2={300}
        />
      </g>
    </g>
    <defs>
      <linearGradient id="customGradient" x1={0} y1={0} x2={0} y2={1}>
        <stop offset="0%" stopColor="#FF8908" stopOpacity={1} />
        <stop offset="100%" stopColor="rgb(255,137,8,0)" stopOpacity={1} />
      </linearGradient>
    </defs>
  </svg>
              </div>
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
                      Liquidity Bonds
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
                      My Bonds
                    </button>
                  </li>
                </ul>
                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="home-tab-pane"
                    role="tabpanel"
                    aria-labelledby="home-tab"
                    tabIndex={0}
                  >
                    <section id="transaction">
                      <div className="container">
                        <div className="row">
                          <div className="col-md-12">
                            <div class="table-responsive">
                              <table className="table">
                                <thead>
                                  <tr className="custom-none">
                                    <th className="custom-bg">
                                      Staking Period
                                    </th>
                                    <th className="custom-bg">
                                      Rebase Reward Rate & Boost
                                    </th>
                                    <th className="custom-bg">
                                      Global Total AS Staked
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td colspan="4">No Data</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="profile-tab-pane"
                    role="tabpanel"
                    aria-labelledby="profile-tab"
                    tabIndex={0}
                  >
                    <section id="transaction">
                      <div className="container">
                        <div className="row">
                          <div className="col-md-12">
                            <div class="table-responsive">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th className="custom-bg">Bond</th>
                                    <th className="custom-bg">
                                      Rebase Reward(AS)
                                    </th>
                                    <th className="custom-bg">Released(AS)</th>
                                    <th className="custom-bg">
                                      Releasing(AS)(AS)
                                    </th>
                                    <th className="custom-bg">
                                      Time to Maturity
                                    </th>
                                    <th className="custom-bg">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td colspan="6">No Data</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
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
              <div className="head">
                <h2>Transaction History</h2>
              </div>
              <div class="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time </th>
                      <th>Amount(AS)</th>
                      <th>Type </th>
                      <th>Transaction Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colspan="4">No Data</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LiquidityBonds;
