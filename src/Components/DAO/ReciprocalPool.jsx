import React from "react";
import "./DAO.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const ReciprocalPool = () => {
    return (
        <>
        <Header />
        <div className="DAOPage ResonancePage">
            <div className="container-fluid px-md-3">
                <div className="row g-4">
                    <div className="col-12">
                        <div className="Heading">Reciprocal Pool<span><i className="fa-solid fa-circle-question"></i></span></div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body d-flex align-items-center justify-content-center flex-column h-100">
                                <div className="card-heading">Claimable Bonus (AS)</div>
                                <div className="amount">0</div>
                                <button className="btn">Connect Wallet</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="card-left-heading">Global AS Tax Total</div>
                                    <div className="right_amount">0.0000</div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="card-left-heading">Community Level</div>
                                    <div className="right_amount">-</div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="card-left-heading">Level Tax Allocation Ratio</div>
                                    <div className="right_amount">0%</div>
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
                                            <th>Total Level Tax(AS)	</th>
                                            <th>Total Level Sub-community Volume ($)</th>
                                            <th>My Sub-community Volume($)</th>
                                            <th>Bonus(AS)</th>
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
                                                <th>Amount</th>
                                                <th>Lock Period</th>
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

export default ReciprocalPool;
