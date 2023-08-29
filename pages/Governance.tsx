import { useState } from "react";
import ProgressBar from "./progress_bar";

const Governance = () => {

    const [open, setOpen] = useState(false);
  
    const handleOpen = () => {
      //Query Proposals and save them in sorted bins
      setOpen(!open);
    };

    //Proposal Table functions//
    const [proposals, setProposals] = useState( () => {
        //Query and set (this only runs on initial load)
    });
    const handleActive = () => {
        //Set the Proposal table state to the Active bin of data
        setOpen(false);
    };
    
    const handlePending = () => {
        //Set the Proposal table state to the Pending bin of data
        setOpen(false);
    };

    const handleCompleted = () => {
        //Set the Proposal table state to the Completed bin of data
        setOpen(false);
    };
    
    const handleExecuted = () => {
        //Set the Proposal table state to the Executed bin of data
        setOpen(false);
    };
      
  return (
    <div className="governance">
    <h1 className="pagetitle-gov">Governance</h1>
      <div className="proposals-frame">
        <div className="proposal-axis" />
        <div className="proposal-axis1" />
        <div className="proposal-axis2" />
        <div className="proposal-axis3" />
        <div className="proposal-axis4" />
        <div className="proposal-axis5" />
        <div className="proposal-axis6" />
        <div className="proposal-axis7" />
        <div className="proposal1-button" />
        <div className="proposal2-button" />
        <div className="proposal3-button" />
        <div className="proposal4-button" />
        <div className="proposal5-button" />
        <div className="proposal6-button" />
        <div className="proposal7-button" />
        <div className="proposal8-button" />
        <div className="proposal-1">Proposal 1</div>
        <div className="proposal-2">Proposal 1</div>
        <div className="proposal-3">Proposal 1</div>
        <div className="proposal-4">Proposal 1</div>
        <div className="proposal-5">Proposal 1</div>
        <div className="proposal-6">Proposal 1</div>
        <div className="proposal-7">Proposal 1</div>
        <div className="proposal-8">Proposal 1</div>
        <div className="submit-proposal-button">
          <div className="submit-proposal">Submit Proposal</div>
        </div>
        <div className="proposal-days">6 days</div>
        <div className="proposal-days1">6 days</div>
        <div className="proposal-days2">6 days</div>
        <div className="proposal-days3">6 days</div>
        <div className="proposal-days4">6 days</div>
        <div className="proposal-days5">6 days</div>
        <div className="proposal-days6">6 days</div>
        <div className="proposal-days7">6 days</div>
        <div className="proposal-result">For</div>
        <div className="proposal-result1">For</div>
        <div className="proposal-result2">For</div>
        <div className="proposal-result3">For</div>
        <div className="proposal-result4">For</div>
        <div className="proposal-result5">For</div>
        <div className="proposal-result6">For</div>
        <div className="proposal-result7">For</div>
      </div>
      <div className="btn delegate-button">
        <div className="delegate">Delegate</div>
      </div>
      <div className="total-vp-label">Total VP: </div>
      <div className="total-vp-amount">200</div>
      <div className="delegated-to">Delegated To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fluid&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Comm.&nbsp;&nbsp;&nbsp;Undele.</div>
      <div className="claim-button-frame"/>
      <div className="btn gov-claim-button">
        <div className="claim">Claim</div>
      </div>
      <div className="btn commission">5% Commission</div>
      <div className="unstake-button-frame"/>
      <div className="btn unstake-button">
        <div className="unstake">Unstake</div>
      </div>
      <div className="stake-button-frame"/>
      <div className="btn stake-button1">
        <div className="stake">Stake</div>
      </div>
      <div className="status-dropdown">
        <img className="button-icon" alt="" src="images/button.svg" />
        <div className="dropdown proposal-dropdown">
            <button onClick={handleOpen}>Proposal Status</button>
            {open ? (
                <ul className="proposal-menu">
                <li className="proposal-menu-item-active">
                    <button onClick={handleActive}>Active</button>
                </li>
                <li className="proposal-menu-item-pending">
                    <button onClick={handlePending}>Pending</button>
                </li>
                <li className="proposal-menu-item-completed">
                    <button onClick={handleCompleted}>Completed</button>
                </li>
                <li className="proposal-menu-item-executed">
                    <button onClick={handleExecuted}>Executed</button>
                </li>
                </ul>
            ) : null}
          </div>
      </div>
      <div className="proposal-axis-labels">Days Left&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Current Result</div>
      <div className="delegate-box" />
        <div className="delegate-1">osmo1988s5h45q...</div>
        <div className="delegate-2">Delegate 1</div>
        <div className="delegate-3">Delegate 1</div>
        <div className="delegate-4">Delegate 1</div>
        <div className="delegate-5">Delegate 1</div>
        <div className="delegate-6">Delegate 1</div>
        <div className="delegate-7">Delegate 1</div>
        <div className="delegate-8">Delegate 1</div>
        <div className="fluid-1">Yes</div>
        <div className="fluid-2">Yes</div>
        <div className="fluid-3">Yes</div>
        <div className="fluid-4">Yes</div>
        <div className="fluid-5">Yes</div>
        <div className="fluid-6">Yes</div>
        <div className="fluid-7">Yes</div>
        <div className="fluid-8">Yes</div>
        <div className="vp-1">100</div>
        <div className="vp-2">100</div>
        <div className="vp-3">100</div>
        <div className="vp-4">100</div>
        <div className="vp-5">100</div>
        <div className="vp-6">100</div>
        <div className="vp-7">100</div>
        <div className="vp-8">100</div>
        <div className="commission-1">10%</div>
        <div className="commission-2">10%</div>
        <div className="commission-3">10%</div>
        <div className="commission-4">10%</div>
        <div className="commission-5">10%</div>
        <div className="commission-6">10%</div>
        <div className="commission-7">10%</div>
        <div className="commission-8">10%</div>
      <div className="delegate-x" />
      <div className="delegate-x1" />
      <div className="delegate-x2" />
      <div className="delegate-x3" />
      <div className="delegate-x4" />
      <div className="delegate-x5" />
      <div className="delegate-x6" />
      <div className="delegates-y1" />
      <div className="delegates-y2" />
      <div className="delegates-y3" />
      <div className="btn delegate-button-1" />
      <div className="btn delegate-button-2" />
      <div className="btn delegate-button-3" />
      <div className="btn delegate-button-4" />
      <div className="btn delegate-button-5" />
      <div className="btn delegate-button-6" />
      <div className="btn delegate-button-7" />
      <div className="btn delegate-button-8" />
      <div className="your-delegators">Your Delegators</div>
      <div className="delegators-box" />
        <div className="delegator-1">Delegator 1</div>
        <div className="delegator-2">Delegator 1</div>
        <div className="delegator-3">Delegator 1</div>
        <div className="delegator-4">Delegator 1</div>
        <div className="delegator-5">Delegator 1</div>
        <div className="delegator-6">Delegator 1</div>
        <div className="delegator-7">Delegator 1</div>
        <div className="delegator-8">Delegator 1</div>        
        <div className="delegator-fluid-1">Yes</div>
        <div className="delegator-fluid-2">Yes</div>
        <div className="delegator-fluid-3">Yes</div>
        <div className="delegator-fluid-4">Yes</div>
        <div className="delegator-fluid-5">Yes</div>
        <div className="delegator-fluid-6">Yes</div>
        <div className="delegator-fluid-7">Yes</div>
        <div className="delegator-fluid-8">Yes</div>
        <div className="delegator-vp-1">100</div>
        <div className="delegator-vp-2">100</div>
        <div className="delegator-vp-3">100</div>
        <div className="delegator-vp-4">100</div>
        <div className="delegator-vp-5">100</div>
        <div className="delegator-vp-6">100</div>
        <div className="delegator-vp-7">100</div>
        <div className="delegator-vp-8">100</div>
      <div className="delegator-x" />
      <div className="delegator-x1" />
      <div className="delegator-x2" />
      <div className="delegator-x3" />
      <div className="delegator-x4" />
      <div className="delegator-x5" />
      <div className="delegator-x6" />
      <div className="delegates-y" />
      <div className="delegators-y1" />
      <div className="delegators-y2" />
      <div className="staked-mbrn1">100</div>
      <div className="unstaking-mbrn">100</div>
      <div className="mbrn-claims">100</div>
      <div className="cdt-claims">100</div>
      <div className="mbrn-stake-logo">
        <img className="logo-icon1  logo-shiftDown" alt="" src="/images/logo.svg" />
      </div>
      <div className="mbrn-unstake-logo">
      <img className="logo-icon1  logo-shiftDown" alt="" src="/images/logo.svg" />
      </div>
      <div className="mbrn-claim-logo">
      <img className="logo-icon1" alt="" src="/images/logo.svg" />
      </div>
      <div className="unstaking-progress-bar" >
        <ProgressBar bgcolor="#50C9BD" progress='30'  height={20} />
      </div>
      <div className="emissions-schedule">33%/8 months</div>
      <img className="cdt-logo-icon" alt="" src="/images/CDT.svg" />
    </div>
  );
};

export default Governance;
