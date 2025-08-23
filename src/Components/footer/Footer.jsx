import React from "react";
import "./footer.css";
import Logo1 from "../../../public/Websiteimg/ftr-logo1.webp";
import Logo2 from "../../../public/Websiteimg/ftr-logo2.webp";
import Logo3 from "../../../public/Websiteimg/ftr-logo3.webp";

const Footer = () => {
  return (
    <>
      <footer className="">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="social-icon">
                <ul>
                  <li>
                    <a href="">
                      <i class="fa-brands fa-x-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="">
                      <i class="fa-brands fa-telegram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="">
                      <i class="fa-brands fa-discord"></i>
                    </a>
                  </li>
                </ul>
                <p>Copyright © 2025 Akasdao</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="logo">
                <img src={Logo1} width="54" height="54" alt="Footer Logo" />
                <img src={Logo2} width="102" height="38" alt="Footer Logo" />
                <img src={Logo3} width="76" height="23" alt="Footer Logo" />
                <p>Unleash Conscious Energy, Build On-Chain Resonance Value</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="links">
                <a href="">support@akasdao.com</a>
                <p>AKAS DAO. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
