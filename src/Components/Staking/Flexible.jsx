import React from "react";
import "./Flexible.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import Modal1 from "./Modal1"

const Flexible = () => {
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
          <div className="col-12 px-lg-3">
            <div className="card graphcard">
              <div className="card-body pb-4">
                <div className="card-heading">Staking Data</div>
                <div className="card-amount">Staking Data</div>
                <svg
                  tabIndex={0}
                  role="application"
                  className="recharts-surface"
                  width={1248}
                  height={330}
                  viewBox="0 0 1248 330"
                  style={{ width: "100%", height: "100%" }}
                >
                  <title />
                  <desc />
                  <defs>
                    <clipPath id="recharts1-clip">
                      <rect x={70} y={20} height={280} width={1158} />
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
                        width={1158}
                        height={280}
                        x1={70}
                        y1={300}
                        x2={1228}
                        y2={300}
                      />
                      <line
                        strokeDasharray={3}
                        stroke="#ccc"
                        fill="none"
                        x={70}
                        y={20}
                        width={1158}
                        height={280}
                        x1={70}
                        y1={230}
                        x2={1228}
                        y2={230}
                      />
                      <line
                        strokeDasharray={3}
                        stroke="#ccc"
                        fill="none"
                        x={70}
                        y={20}
                        width={1158}
                        height={280}
                        x1={70}
                        y1={160}
                        x2={1228}
                        y2={160}
                      />
                      <line
                        strokeDasharray={3}
                        stroke="#ccc"
                        fill="none"
                        x={70}
                        y={20}
                        width={1158}
                        height={280}
                        x1={70}
                        y1={90}
                        x2={1228}
                        y2={90}
                      />
                      <line
                        strokeDasharray={3}
                        stroke="#ccc"
                        fill="none"
                        x={70}
                        y={20}
                        width={1158}
                        height={280}
                        x1={70}
                        y1={20}
                        x2={1228}
                        y2={20}
                      />
                    </g>
                  </g>
                  <g className="recharts-layer recharts-cartesian-axis recharts-yAxis yAxis">
                    <line
                      orientation="left"
                      width={60}
                      height={280}
                      x={10}
                      y={20}
                      className="recharts-cartesian-axis-line"
                      stroke="#666"
                      fill="none"
                      x1={70}
                      y1={20}
                      x2={70}
                      y2={300}
                    />
                    <g className="recharts-cartesian-axis-ticks">
                      <g className="recharts-layer recharts-cartesian-axis-tick">
                        <line
                          orientation="left"
                          width={60}
                          height={280}
                          x={10}
                          y={20}
                          className="recharts-cartesian-axis-tick-line"
                          stroke="#666"
                          fill="none"
                          x1={64}
                          y1={300}
                          x2={70}
                          y2={300}
                        />
                        <text
                          orientation="left"
                          width={60}
                          height={280}
                          stroke="none"
                          x={52}
                          y={300}
                          className="recharts-text recharts-cartesian-axis-tick-value"
                          textAnchor="end"
                          fill="#666"
                        >
                          <tspan x={52} dy="0.355em">
                            0
                          </tspan>
                        </text>
                      </g>
                      <g className="recharts-layer recharts-cartesian-axis-tick">
                        <line
                          orientation="left"
                          width={60}
                          height={280}
                          x={10}
                          y={20}
                          className="recharts-cartesian-axis-tick-line"
                          stroke="#666"
                          fill="none"
                          x1={64}
                          y1={230}
                          x2={70}
                          y2={230}
                        />
                        <text
                          orientation="left"
                          width={60}
                          height={280}
                          stroke="none"
                          x={52}
                          y={230}
                          className="recharts-text recharts-cartesian-axis-tick-value"
                          textAnchor="end"
                          fill="#666"
                        >
                          <tspan x={52} dy="0.355em">
                            1
                          </tspan>
                        </text>
                      </g>
                      <g className="recharts-layer recharts-cartesian-axis-tick">
                        <line
                          orientation="left"
                          width={60}
                          height={280}
                          x={10}
                          y={20}
                          className="recharts-cartesian-axis-tick-line"
                          stroke="#666"
                          fill="none"
                          x1={64}
                          y1={160}
                          x2={70}
                          y2={160}
                        />
                        <text
                          orientation="left"
                          width={60}
                          height={280}
                          stroke="none"
                          x={52}
                          y={160}
                          className="recharts-text recharts-cartesian-axis-tick-value"
                          textAnchor="end"
                          fill="#666"
                        >
                          <tspan x={52} dy="0.355em">
                            2
                          </tspan>
                        </text>
                      </g>
                      <g className="recharts-layer recharts-cartesian-axis-tick">
                        <line
                          orientation="left"
                          width={60}
                          height={280}
                          x={10}
                          y={20}
                          className="recharts-cartesian-axis-tick-line"
                          stroke="#666"
                          fill="none"
                          x1={64}
                          y1={90}
                          x2={70}
                          y2={90}
                        />
                        <text
                          orientation="left"
                          width={60}
                          height={280}
                          stroke="none"
                          x={52}
                          y={90}
                          className="recharts-text recharts-cartesian-axis-tick-value"
                          textAnchor="end"
                          fill="#666"
                        >
                          <tspan x={52} dy="0.355em">
                            3
                          </tspan>
                        </text>
                      </g>
                      <g className="recharts-layer recharts-cartesian-axis-tick">
                        <line
                          orientation="left"
                          width={60}
                          height={280}
                          x={10}
                          y={20}
                          className="recharts-cartesian-axis-tick-line"
                          stroke="#666"
                          fill="none"
                          x1={64}
                          y1={20}
                          x2={70}
                          y2={20}
                        />
                        <text
                          orientation="left"
                          width={60}
                          height={280}
                          stroke="none"
                          x={52}
                          y={20}
                          className="recharts-text recharts-cartesian-axis-tick-value"
                          textAnchor="end"
                          fill="#666"
                        >
                          <tspan x={52} dy="0.355em">
                            4
                          </tspan>
                        </text>
                      </g>
                    </g>
                  </g>
                  <defs>
                    <linearGradient
                      id="customGradient"
                      x1={0}
                      y1={0}
                      x2={0}
                      y2={1}
                    >
                      <stop offset="0%" stopColor="#FF8908" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="rgb(255,137,8,0)"
                        stopOpacity={1}
                      />
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
                          <img src="https://akasdao.com/img/common/computed.svg" />
                        </button>
                        <h2>
                          Staked Amount: <span>0.0000AS</span>
                        </h2>
                      </div>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Recipient's username"
                          aria-label="Recipient's username"
                          aria-describedby="basic-addon2"
                        />
                        <span className="input-group-text" id="basic-addon2">
                          Max
                        </span>
                      </div>
                      <div className="custom-flex">
                        <img src="" />
                        <h2>
                          Wallet Balance: <span>0 AS</span>
                        </h2>
                      </div>
                      <button className="wallet-btn">Connect Wallet</button>
                      <ul className="list-flex">
                        <li>
                          <h6>Locked Amount</h6>
                          <p>0 AS</p>
                        </li>
                        <li>
                          <h6>Next Rebase Reward</h6>
                          <p>0 AS</p>
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
                          <p>0 AS</p>
                        </li>
                        <li>
                          <h6></h6>
                          <button className="claim-btn">Claim</button>
                        </li>
                      </ul>
                    </div>
                  </div>
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
                          <img src="https://akasdao.com/img/common/computed.svg" />
                        </button>
                        <h2>
                          Staked Amount: <span>0.0000AS</span>
                        </h2>
                      </div>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Recipient's username"
                          aria-label="Recipient's username"
                          aria-describedby="basic-addon2"
                        />
                        <span className="input-group-text" id="basic-addon2">
                          Max
                        </span>
                      </div>
                      <div className="custom-flex">
                        <img src="" />
                        <h2>
                          Unstakable Amount: <span> 0.0000 AS </span>
                        </h2>
                      </div>
                      <button className="wallet-btn">Connect Wallet</button>
                      <ul className="list-flex">
                        <li>
                          <h6>Locked Amount</h6>
                          <p>0 AS</p>
                        </li>
                        <li>
                          <h6>Next Rebase Reward</h6>
                          <p>0 AS</p>
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
                          <p>0 AS</p>
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
      <Modal1/>
      <Footer />
    </div>
  );
};

export default Flexible;
