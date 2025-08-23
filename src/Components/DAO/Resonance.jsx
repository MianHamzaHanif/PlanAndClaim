import React from "react";
import "./DAO.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const Resonance = () => {
    return (
        <>
        <Header />
        <div className="DAOPage ResonancePage">
            <div className="container-fluid px-md-3">
                <div className="row g-4">
                    <div className="col-12">
                        <div className="Heading">Resonance Pool <span><i className="fa-solid fa-circle-question"></i></span></div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="card-heading">Claimable Bonus (AS)</div>
                                <div className="amount">0</div>
                                <button className="btn mx-auto">Connect Wallet</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="card-left-heading">Net Position (AS)</div>
                                    <div className="right_amount">0</div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="card-left-heading">Net Position Valuation ($)</div>
                                    <div className="right_amount">0</div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="card-left-heading">Direct Referral Count</div>
                                    <div className="right_amount">0 / 0</div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="card-left-heading">Unlocked Generations(Up/Down)</div>
                                    <div className="right_amount">0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="card-Heding">Bonus Records</div>
                                <div class="table-responsive">
                                    <table className="table">
                                    <thead>
                                        <tr>
                                        <th>Time </th>
                                        <th>Unlocked Generations</th>
                                        <th>Net Position(AS) </th>
                                        <th>Actual Bonus(AS)</th>
                                        <th>Forfeited Bonus(AS)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                        <td colspan="5">No Data</td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="card-Heding">Claim Records</div>
                                <div class="table-responsive">
                                    <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Time </th>
                                            <th>Amount(AS)</th>
                                            <th>Lock Period	 </th>
                                            <th>Tax %</th>
                                            <th>Transaction Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="5">No Data</td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
};

export default Resonance;
