import React from "react";
import "./liquidity.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const Comeson = () => {
  return (
    <>
      <Header />
      <div className="LiquidityBonds ComesonPage">
          <div className="container-fluid h-100">
            <div className="row h-100">
              <div className="col-lg-5 col-md-6 col-sm-7 col-12 d-flex flex-column align-items-center justify-content-center mx-auto">
                <div className="subheading">Our platform is constantly evolving...</div>
                <div className="Heading">Stay tuned!</div>
                <div className="subheading">AKAS is launching new features soon</div>
              </div>
            </div>
          </div>
      </div>
      <Footer />
    </>
  );
};

export default Comeson;
