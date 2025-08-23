import { Link } from "react-router-dom";
import "./home.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import BannerLogo from "../../../public/Websiteimg/banner-logo.webp";

const Home = () => {
  return (
    <>
      <div className="page_wrapper" id="bg">
        <Header />
        <section id="banner">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="banner-content">
                  <img
                    src="https://akasdao.com/img/main/Cloud1.png"
                    className="cloud1"
                  />
                  <img
                    src="https://akasdao.com/img/main/Cloud2.png"
                    className="cloud2"
                  />

                  <h2>
                    <img src={BannerLogo} alt="Banner Logo" />
                    DAO
                  </h2>
                  <h3>Unleash Conscious Energy</h3>
                  <h4>
                    Build On-Chain Resonance <br></br> Value
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="about">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="des">
                  <p>Welcome to explore AKAS DAO —</p>
                  <p>A decentralized utopia hidden in the deep web,</p>
                  <p>A digital temple of advanced civilization.</p>
                </div>
                <div className="des">
                  <p>We center around the AS token,</p>
                  <p>
                    Creating a financial protocol free from central constraints
                    — transparent, stable, free resonance.
                  </p>
                </div>
                <div className="des">
                  <p>
                    The secret pulse of blockchain is deconstructing traditional
                    power;
                  </p>
                  <p>
                    Smart contracts whisper ancient vows of fairness in the
                    undercurrents;
                  </p>
                  <p>
                    Distributed networks stand like cosmic halls, safeguarding
                    each participant's anonymity and sovereignty.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="user-value">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="heading">
                  <h2>
                    <span>Users :</span>
                    184,516
                  </h2>
                </div>
              </div>
              <div className="col-md-6">
                <div className="user-box">
                  <h3>
                    <span>$</span>
                    114,180,805
                  </h3>
                  <p>Total Market Value</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="user-box">
                  <h3>
                    <span>$</span>
                    2,550,001
                  </h3>
                  <p>Treasury Value</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="user-box">
                  <h3>
                    <span>$</span>
                    57,024,406
                  </h3>
                  <p>LP Value</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="user-box">
                  <h3>
                    <span>$</span>
                    56,265,637
                  </h3>
                  <p>Staking Value</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="user-des">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-10">
                <div className="des">
                  <p>
                    AKAS DAO, through protocol-owned liquidity (POL) and
                    treasury reserves, creates a decentralized freely floating
                    reserve currency independent of fiat, overturning the DeFi
                    paradigm and reshaping on-chain value logic.
                  </p>
                  <p>
                    Interwoven with anonymous power and decentralized
                    governance, AS holders co-create a new financial order
                    through staking and bond mechanisms.
                  </p>
                  <p>
                    The AKAS treasury is backed by diversified assets like DAI,
                    DAI, and BTC, ensuring AS intrinsic value ≥ $1, realizing an
                    algorithmic stablecoin model with uncapped upside and a
                    price floor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cta">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-10">
                <div className="des">
                  <h2>Inheriting the spiritual spark of OlympusDAO</h2>
                  <h2>Igniting decentralized consciousness awakening</h2>
                  <p>
                    Come! Become a member of AKAS DAO, co-build decentralized
                    glory, and forge a new on-chain world
                  </p>
                  <button>Join Us Now</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;
