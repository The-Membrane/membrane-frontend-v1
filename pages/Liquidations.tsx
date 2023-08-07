// Variables: 10 heights for the bar graph,
// the largest will get the marker at the top by shifting it to the left (40 per premium)
// & place its bottom at the static bottom + bar height + spacing
// (using inline styles from the variables)

import { useState } from "react";

const LiquidationPools = () => {

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleMenuOne = () => {
    // Query premiums slots and save new heights
    //Heights are denominated 10K per pixel
    setOpen(false);
  };

  const handleMenuTwo = () => {
    // Query premiums slots and save new heights
    //Heights are denominated 10K per pixel
    setOpen(false);
  };


  

  return (
    <div className="fullHeight">
    <div className="row ">
    <div className="col shiftRight">
    <div className="liquidation-pools">
    <h1 className="pagetitle">Liquidation Pools</h1>
        <div className="singleassetframe">
          <h3 className="pool-titles">SINGLE ASSET</h3>
          <div className="single-asset-info-circle" />
          <div className="bar-icon" />
          <div className="bar-icon1" />
          <div className="bar-icon2" />
          <div className="bar-icon3" />
          <div className="bar-icon4" />
          <div className="bar-icon5" />
          <div className="bar-icon6" />
          <div className="bar-icon7" />
          <div className="bar-icon8" />
          <div className="bar-icon9" />
          <div className="label4">0%</div>
          <div className="label5">1%</div>
          <div className="label6">2%</div>
          <div className="label7">3%</div>
          <div className="label8">4%</div>
          <div className="label9">5%</div>
          <div className="label10">6%</div>
          <div className="label11">7%</div>
          <div className="label12">8%</div>
          <div className="label13">9%</div>
          <div className="dropdown asset-dropdown">
            <button onClick={handleOpen}>OSMO</button>
            {open ? (
                <ul className="menu">
                <li className="menu-item">
                    <button onClick={handleMenuOne}>ATOM</button>
                </li>
                <li className="menu-item">
                    <button onClick={handleMenuTwo}>axlUSDC</button>
                </li>
                </ul>
            ) : null}
          </div>
          <div className="collateral-tvl-label">TVL as Collateral: 10M</div>
          <div className="highest-tvl-bar-label">2M</div>
          <div className="x-axis" />
          <a className="btn buttons deposit-button" onClick={() => {}}>
                    Deposit
          </a>
          <a className="btn buttons withdraw-button" onClick={() => {}}>
                    Withdraw
          </a>
          <a className="btn buttons claim-button single-asset-btn" onClick={() => {}}>
                    Claim
          </a>
        </div>
        <div className="omniassetframe">
          <h3 className="pool-titles">OMNI-ASSET</h3>
          <div className="captial-ahead-box" />
          <div className="user-tvl-box" />
          <div className="user-tvl-label">50K</div>
          <div className="captial-ahead-label">10M</div>
          <div className="x-axis1" />
          <div className="total-tvl-label">TVL: 50M</div>
          <div className="omni-asset-info-circle" />
          <div className="user-tvl-info-circle" />
          <div className="capital-ahead-info-circle" />
          <img className="tvl-container-icon" alt="" src="/images/tvl-container.svg" />
          <div className="premium">10%</div>
          <a className="btn buttons deposit-button-omni" onClick={() => {}}>
                    Deposit
          </a>
          <a className="btn buttons withdraw-button-omni" onClick={() => {}}>
                    Withdraw
          </a>
          <a className="btn buttons claim-button" onClick={() => {}}>
                    Claim
          </a>
          <img
            className="water-drops-deco-icon"
            alt=""
            src="/images/Water_drops_deco.svg"
          />
        </div>
        <img className="titleicon" alt="" src="/images/liquidation_pool.svg" />
        <div className="middleborder" />
      </div>
    </div>
    </div>
    </div>
  );
};

export default LiquidationPools;