import React from "react";
import "./DAO.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const Incentive = () => {
    return (
        <>
        <Header />
        <div className="DAOPage ResonancePage">
            <div className="container-fluid px-md-3">
                <div className="row g-4">
                    <div className="col-12">
                        <div className="Heading">Incentive Pool <span><i className="fa-solid fa-circle-question"></i></span></div>
                        <div className="Heading2">Total Bonus: <span>0/0</span></div>
                    </div>
                    <div className="col-md-12">
                        <div class="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Release Period</th>
                                        <th>Pending Release(AS)</th>
                                        <th>Released(AS)</th>
                                        <th>Action</th>
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
                    <div className="col-md-12">
                        <div className="Heading mb-4">Transaction History</div>
                        <div class="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Amount(AS)</th>
                                        <th>Release Period</th>
                                        <th>Tax %</th>
                                        <th>Type</th>
                                        <th>Transaction Hash</th>
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
        </div>
        <Footer />
        </>
    );
};

export default Incentive;
