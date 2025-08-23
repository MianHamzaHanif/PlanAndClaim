import React from "react";

const Modal1 = () => {
  return (
    <>
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                {" "}
                Reward Calculator
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <input
                className="px-3 border"
                type=""
                placeholder="Enter Staked AS Amount"
              />
              <>
                <ul
                  className="nav nav-pills my-3 flex-wrap gap-3 p-2"
                  id="pills-tab"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="pills-home-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-home"
                      type="button"
                      role="tab"
                      aria-controls="pills-home"
                      aria-selected="true"
                    >
                      7-Day
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="pills-profile-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-profile"
                      type="button"
                      role="tab"
                      aria-controls="pills-profile"
                      aria-selected="false"
                    >
                      1-Month
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="pills-contact-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-contact"
                      type="button"
                      role="tab"
                      aria-controls="pills-contact"
                      aria-selected="false"
                    >
                      6-Month
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="pills-year-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-year"
                      type="button"
                      role="tab"
                      aria-controls="pills-year"
                      aria-selected="false"
                    >
                      1-Year
                    </button>
                  </li>
                </ul>
                <div className="d-flex align-items-center justify-content-between mt-3">
                  <h4 className="text-white mb-2">Next Rebase APY</h4>
                  <h4 className="text-white mb-2" id="rebase-value">
                    0.506%
                  </h4>
                </div>
                <div className="containerin">
                  <input
                    type="range"
                    className="form-range"
                    min={0}
                    max={2}
                    step="0.001"
                    defaultValue="0.506"
                    id="rebase-slider"
                  />
                </div>
                <div className="des">
                  <p>Projected Returns (Amount)</p>
                  <h6>AS0.0000</h6>
                </div>
                <div className="des">
                  <p>Projected Returns (Amount)</p>
                  <h6>AS0.0000</h6>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel1">
                {" "}
                Reward Calculator
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <input type="" placeholder="Enter Staked AS Amount" />
              <>
                <ul
                  className="nav nav-pills mb-3"
                  id="pills-tab"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="pills-home-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-home"
                      type="button"
                      role="tab"
                      aria-controls="pills-home"
                      aria-selected="true"
                    >
                      7-Day
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="pills-profile-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-profile"
                      type="button"
                      role="tab"
                      aria-controls="pills-profile"
                      aria-selected="false"
                    >
                      1-Month
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="pills-contact-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-contact"
                      type="button"
                      role="tab"
                      aria-controls="pills-contact"
                      aria-selected="false"
                    >
                      {" "}
                      6-Month{" "}
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="pills-year-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-year"
                      type="button"
                      role="tab"
                      aria-controls="pills-year"
                      aria-selected="false"
                    >
                      {" "}
                      1-Year{" "}
                    </button>
                  </li>
                </ul>
                <div className="des">
                  <p>Projected Returns (Amount)</p>
                  <h6>AS0.0000</h6>
                </div>
                <div className="des">
                  <p>Projected Returns (Amount)</p>
                  <h6>AS0.0000</h6>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal1;
