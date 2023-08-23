import { useEffect, useState } from "react";
import ProgressBar from "./progress_bar";

const Lockdrop = () => {
  const [progress, setProgress] = useState(0);
  const [lockedOSMO, setlockedOSMO] = useState(0);
  const [MBRNreward, setMBRNreward] = useState(0);
  //Lock
  const [amount, setAmount] = useState(0);

  const handlelockClick = () => {
    var success = true;
    //Lock OSMO
    try {
      //execute lock
    } catch (error) {
      success = false;
      console.log(error);
    } finally {
      if (success) {
        //Update OSMO total
        setlockedOSMO(+lockedOSMO + +amount);

        ///Query for these
        //Update lock list

        //Update MBRN reward total
      }
    }
  }

  const getdepositList = () => {
    //Query for deposit list
    //var res = ;
    const depositList = []

    var i = 0;
    try {    
      for (i; i < depositList.length; i++) {
        //Update lock object
        setdepositAmount1()
      }

    } catch (error) {

    }

  }

  useEffect(() => {
    //Query lockdrop progress
    // var res: Lockdrop;
    // var current_block = base_client?.getBlock();
    // setProgress((current_time - res.start_time) / (res.withdrawal_end - res.start_time) );
  }, []);

  const handlesetAmount = (event) => {
    event.preventDefault();
    setAmount(event.target.value);
  };

  return (    
    <div className="lockdrop">
    <h1 className="pagetitle-lockdrop">Lockdrop</h1>
    <img className="titleicon-lockdrop" alt="" src="/images/lockdrop.svg" />
        <div className="lockdrop-page">
            <div className="lockdrop-frame"/>
            <div className="infobox" />
            <div className="durationbar">
              <ProgressBar bgcolor="#50C9BD" progress={progress}  height={30} />
              <div className='y-axis'/>
              <div className="deposit">DEPOSIT</div>
              <div className="withdraw">WITHDRAW</div>
            </div>
            
            <div className="mbrn-reward-circle" />
            <div className="osmo-deposit-circle" />
            <div className="osmo-deposit-amount">{lockedOSMO} OSMO</div>
            <div className="mbrn-reward-total">{MBRNreward} MBRN</div>
            <div className="rates-box-title">Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rates </div>
            <img className="mbrn-rate-logo" alt="" src="/images/Logo.svg" />
            <div className="rates-box"/>
            <img className="osmo-rate-logo" alt="" src="/images/osmo.svg" />
            <img className="axlusdc-rate-logo" alt="" src="/images/usdc.svg" />
            <div className="price-in-osmo">: {12588}</div>
            <div className="price-in-axlusdc">: {15588}</div>
            <div className="infomsg">
              <p className="there-is-10m-mbrn-up-for-grabs">
                There is 10M MBRN up for grabs in this 7 day event. If you want a larger share for your deposit you must lock for longer.
              </p>
              <p/>
              <p>Locks boost your “shares” and the full 10M is split & STAKED (4 day lock) in accordance to said shares.</p>
            </div>
            <div className="allocationmsg">
              <span className="allocationmsg-txt">
              <p>Pre-launch contributors: 10%, vested for 2y cliff/1y linear</p>
              <p>Community: 90%</p>
              <p>Stakers have control over vested stake.</p>
              </span>
            </div>
            <a className="info" target="_blank" rel="noopener noreferrer" href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/lockdrop-launch">INFO</a>
            <a className="allocations" target="_blank" rel="noopener noreferrer" href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/mbrn-tokenomics">ALLOCATIONS</a>
          </div>
          <div className="deposits-list">
            <div className="yourdepositstext">
              YOUR DEPOSITS
            </div>
            <div className="edit">EDIT</div>
            <div className="btn button" />
            <div className="deposit-list-x-axis" />
            <div className="btn button1" />
            <div className="deposit-list-x-axis1" />
            <div className="btn button2" />
            <div className="deposit-list-x-axis2" />
            <div className="btn button3" />
            <div className="deposit-list-x-axis3" />
            <div className="btn button4" />
            <div className="deposit-list-x-axis4" />
            <div className="btn button5" />
            <div className="deposit-list-x-axis5" />
            <div className="btn button6" />
            <div className="deposit-list-x-axis6" />
            <div className="btn button7" />
            <div className="div2">100</div>
            <div className="days">14 days</div>
            <div className="div3">100</div>
            <div className="days1">14 days</div>
            <div className="div4">100</div>
            <div className="days2">14 days</div>
            <div className="div5">100</div>
            <div className="days3">14 days</div>
            <div className="days4">14 days</div>
            <div className="days5">14 days</div>
            <div className="div6">100</div>
            <div className="div7">100</div>
            <div className="div8">100</div>
            <div className="days6">14 days</div>
            <div className="div9">100</div>
            <div className="days7">14 days</div>
          </div>
          <form>
            <input className="lock-amount" name="amount" value={amount} type="number" onChange={handlesetAmount}/>
            <button className="lock-button" type="button" onClick={handlelockClick}>
              <div className="lock-button-label">LOCK:</div>
            </button>
        </form>
        </div>
  );
};

export default Lockdrop;
