import React from "react";
import "./Turbine.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const Turbine = () => {
    return (
        <>
            <Header />
            <div className="DAOPage ResonancePage Turbine">
                <div className="container-fluid px-md-3">
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="Heading">Turbine Pool<span><i className="fa-solid fa-circle-question"></i></span></div>
                        </div>
                        <div className="col-md-9 mx-auto">
                            <div className="card Turbinecard">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                                        <div className="lefticonheading"><span  data-bs-toggle="modal" data-bs-target="#exampleModal"><i className="fa-solid fa-gear"></i></span>5%</div>
                                        <div className="righttext">Unlockable Amount: <span>0.0000</span>AS</div>
                                    </div>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" value={0} aria-label="Amount (to the nearest dollar)"/>
                                        <span className="input-group-text">Max</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                                        <div className="lefticonheading text-white">Turbine Trade Amount: 0.0000 DAI</div>
                                        <div className="righttext">Wallet Balance:<span>0.0000</span>DAI</div>
                                    </div>
                                    <button className="btn trabibtn">Connect Wallet</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="Heading Heading2in mb-4 h4">Claim List</div>
                            <div class="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Locked Amount(AS)</th>
                                            <th>Unlock Countdown</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="3">No Data</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="Heading Heading2in mb-4">Turbine Records</div>
                            <div class="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Amount (AS)</th>
                                            <th>Type</th>
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
            </div>
            <Footer />
            {/* Modal */}
            <div className="modal fade mainboldal" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel"aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header border-0 mb-3">
                            <h1 className="modal-title  text-center w-100" id="exampleModalLabel">Slippage Settings</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"/>
                        </div>
                        <div className="modal-body py-4">
                            <div className="modalheading">Slippage</div>
                            <div className="buttonGroup">
                                <button className="btn">0.5%</button>
                                <button className="btn">1%</button>
                                <button className="btn">3%</button>
                                <button className="btn">5%</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Turbine;
