// Variables: 10 heights for the bar graph,
// the largest will get the marker at the top by shifting it to the left (40 per premium)
// & place its bottom at the static bottom + bar height + spacing
// (using inline styles from the variables)

import { useEffect, useState } from "react";
import { LiquidationQueueClient, LiquidationQueueQueryClient } from "../codegen/liquidation_queue/LiquidationQueue.client";
import { ClaimsResponse, QueueResponse, SlotResponse } from "../codegen/liquidation_queue/LiquidationQueue.types";
import { denoms } from ".";
import { coins } from "@cosmjs/stargate";
import Popup from "./Popup";

const CDTperPIXEL = 10000_000_000;

const LiquidationPools = ({lqQClient, lqclient, addr}) => {

  const queryClient = lqQClient as LiquidationQueueQueryClient;
  const liq_queueClient = lqclient as LiquidationQueueClient;
  const address = addr as string | undefined;

  //Popup
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [popupStatus, setPopupStatus] = useState("");
  //Menu
  const [open, setOpen] = useState(false);
  const [menuAsset, setMenuAsset] = useState("OSMO" as string);
  //Liq Queue execution
  interface LQClaims {
    display: string;
    bidFor: string[];
  }
  const [depositAmount, setdAmount] = useState(0);
  const [withdrawAmount, setwAmount] = useState(0);
  const [premium, setPremium] = useState<number>();
  const [lqClaimables, setlqClaimables] = useState({
    display: "",
    bidFor: [""],
  });
  //Pool visuals
  interface Bar {
    height: number;
    color: string;
    tvl: string;
  }
  const [barGraph, setbarGraph] = useState<Bar[]>([
    { height: 100, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
    { height: 0, color: "#000000", tvl: "0M" },
  ]);
  //index for highest bar in barGraph
  const [highestBar, sethighestBar] = useState<number>(0);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleMenuOne = () => {
    setOpen(false);
    setMenuAsset("ATOM");
  };

  const handleMenuTwo = () => {
    setOpen(false);
    setMenuAsset("axlUSDC");
  };
  const handlesetdAmount = (event) => {
    event.preventDefault();
    setdAmount(event.target.value);
  };
  const handlesetwAmount = (event) => {
    event.preventDefault();
    setwAmount(event.target.value);
  };
  
  // Query premiums slots and save new heights
  //Heights are denominated 10K per pixel
  const queryQueuesaveHeights = async (asset: string) => {
    try {
      await queryClient?.premiumSlots({
        bidFor: {
          native_token: {
            denom: asset,
          }
        },
        limit: 10,
      }).then((res) => {
        let resp = res as SlotResponse[];
        let highest = 0;

        for (let i = 0; i < resp.length; i++) {
          //Divide to get X per pixel.Add 6 decimals to account for the extra decimals of a native token
          barGraph[i].height = parseInt(resp[i].total_bid_amount) / CDTperPIXEL;
          //Set tvl
          barGraph[i].tvl = (parseInt(resp[i].total_bid_amount) / 1_000_000_000000).toString() + "M";

          //Check if this is the highest bar
          if (barGraph[i].height > barGraph[highest].height) {
            highest = i;
          }
          //Reset color of bar
          barGraph[i].color = "#000000";
        }
        //Set the color of any slots the user is in to blue
        if (address !== undefined) {
          for (let i = 0; i < resp.length; i++) {
            for (let x = 0; x < resp[i].bids.length; x++) {
              if (resp[i].bids[x].user === address){
                barGraph[i].color = "rgba(79, 202, 187, 0.85)";
              }
            }
          }
        }
        //Set highest 
        sethighestBar(highest);
      })
    } catch (error) {
      //We don't popup for query errors
      console.log(error)
    }
  }

  const setqueueClaimables = async () => {
    try {
      await queryClient?.userClaims({
        user: address ?? "",
      }).then((res) => {
        let resp = res as ClaimsResponse[];
        let new_display = lqClaimables.display;
        let new_bidFor: string[] = [];

        //Add claims from each response
        for (let i = 0; i < resp.length; i++) {
          let asset_claims = parseInt(resp[i].pending_liquidated_collateral) / 1_000_000; //Remove native token decimals
          if (asset_claims > 0) {
            //Add asset to display
            new_display += asset_claims + " " + resp[i].bid_for + ", ";
            //Add asset to bidFor
            new_bidFor.push(resp[i].bid_for);
          }
        }
        //Set lqClaimables
        setlqClaimables(prevState => {
          return { 
            bidFor: new_bidFor, 
            display: new_display
          }
        });
        //If no claims, set display to "No Claims"
        if (resp.length === 0) {
          setlqClaimables(prevState => {
            return { ...prevState, display: "No Claims"}
          });
        }
      })
    } catch (error) {
      setlqClaimables(prevState => {
        return { ...prevState, display: "No Claims"}
      });
      console.log(error)
    }
  }

  const handledepositClick = async () => {
    //Get denom from menu asset
    let workingDenom: string = "";
    switch(menuAsset){
      case "OSMO": {  
        workingDenom = denoms.osmo; 
        break;
      }
      case "ATOM": {
        workingDenom = denoms.atom;
        break;
      }
      case "axlUSDC": {
        workingDenom = denoms.axlUSDC;
        break;
      }
    }
    ///Try execution
    try {
      await liq_queueClient?.submitBid({
        bidInput: {          
          bid_for: {
            native_token: {
              denom: workingDenom,
            }
          },          
          liq_premium: premium ?? 0,
        }
      }, "auto", undefined, coins((depositAmount * 1_000_000), denoms.cdt)).then((res) => {
        console.log(res)
        //Format popup
        setPopupStatus("Success")
        setPopupMsg("Bid of "+ depositAmount +" CDT at a " +premium+ " premium successful")
        setPopupTrigger(true)
      })
    } catch (error) {
      console.log(error)
      const e = error as { message: string }
      //Format popup
      setPopupStatus("Error")
      setPopupMsg(e.message)
      setPopupTrigger(true)
    }
  }

  const handlewithdrawClick = async () => {
    //Get denom from menu asset
    let workingDenom: string = "";
    switch(menuAsset){
      case "OSMO": {  
        workingDenom = denoms.osmo; 
        break;
      }
      case "ATOM": {
        workingDenom = denoms.atom;
        break;
      }
      case "axlUSDC": {
        workingDenom = denoms.axlUSDC;
        break;
      }
    }
    ///Try execution
    try {
      //Query bidId in slot
      await queryClient?.bidsByUser({
        bidFor: {
          native_token: {
            denom: workingDenom,
          }
        }, 
        user: address ?? "",
      }).then(async (res) => {
        //Find bidId in slot of premium
        let bidId: string = "";
        for (let i = 0; i < res.length; i++) {
          if (res[i].liq_premium === premium) {
            bidId = res[i].id;
            break;
          }
        }

        //If bidId is not empty, retract bid
        if (bidId !== "") {
          try{
            await liq_queueClient?.retractBid({
                bidFor: {
                  native_token: {
                    denom: workingDenom,
                  }
                },
                amount: (withdrawAmount * 1_000_000).toString(),
                bidId: bidId,
              
            }, "auto", undefined).then((res) => {
                console.log(res)
                //Format popup
                setPopupStatus("Success")
                setPopupMsg("Retracted" +withdrawAmount+ " CDT of bid "+ bidId)
                setPopupTrigger(true)
              })
          } catch (error) {
            console.log(error)
            const e = error as { message: string }
            //Format popup
            setPopupStatus("Error")
            setPopupMsg(e.message)
            setPopupTrigger(true)
          }
        }
      })
    } catch (error) {
      //We popup for the query error here bc its an execution function that is dependent on this
      console.log(error)
      const e = error as { message: string }
      //Format popup
      setPopupStatus("Error")
      setPopupMsg(e.message)
      setPopupTrigger(true)
    }
  }

  const handleclaimClick = async () => {
    try {
      //Claim for each bidFor asset
      for (let i = 0; i < lqClaimables.bidFor.length; i++) {        
        await liq_queueClient?.claimLiquidations({
          bidFor: {
            native_token: {
              denom: lqClaimables.bidFor[i],
            }
          }
        }).then((res) => {
          console.log(res)
          //Format popup
          setPopupStatus("Success")
          setPopupMsg("Claimed " + lqClaimables.bidFor[i])
          setPopupTrigger(true)
        })
      }
    } catch (error) {
      console.log(error)
      const e = error as { message: string }
      //Format popup
      setPopupStatus("Error")
      setPopupMsg(e.message)
      setPopupTrigger(true)

    }
    
    //Reset claimables
    setlqClaimables(prevState => {
      return { bidFor: [""], display: "No Claims"}
    });
  }

  useEffect(() => {
    switch(menuAsset){
      case "OSMO": {
        queryQueuesaveHeights(denoms.osmo)
        break;
      }
      case "ATOM": {
        queryQueuesaveHeights(denoms.atom)
        break;
      }
      case "axlUSDC": {
        queryQueuesaveHeights(denoms.axlUSDC)
        break;
      }
    }
    //Set claimables
    if (lqClaimables.display !== "No Claims") {
      setqueueClaimables()
    }
    

  }, [menuAsset])

  return (
    <div className="fullHeight">
    <div className="row ">
    <div className="col shiftRight">
    <div className="liquidation-pools">
    <h1 className="pagetitle">Liquidation Pools</h1>
        <div className="singleassetframe">
          <h3 className="pool-titles">SINGLE ASSET</h3>
          <div className="single-asset-info-circle" />
          <div className="bar-icon" data-descr={barGraph[0].tvl} style={{height: barGraph[0].height, backgroundColor: barGraph[0].color,}}/>
          <div className="bar-icon1" data-descr={barGraph[1].tvl} style={{height: barGraph[1].height, backgroundColor: barGraph[1].color,}}/>
          <div className="bar-icon2" data-descr={barGraph[2].tvl} style={{height: barGraph[2].height, backgroundColor: barGraph[2].color,}}/>
          <div className="bar-icon3" data-descr={barGraph[3].tvl} style={{height: barGraph[3].height, backgroundColor: barGraph[3].color,}}/>
          <div className="bar-icon4" data-descr={barGraph[4].tvl} style={{height: barGraph[4].height, backgroundColor: barGraph[4].color,}}/>
          <div className="bar-icon5" data-descr={barGraph[5].tvl} style={{height: barGraph[5].height, backgroundColor: barGraph[5].color,}}/>
          <div className="bar-icon6" data-descr={barGraph[6].tvl} style={{height: barGraph[6].height, backgroundColor: barGraph[6].color,}}/>
          <div className="bar-icon7" data-descr={barGraph[7].tvl} style={{height: barGraph[7].height, backgroundColor: barGraph[7].color,}}/>
          <div className="bar-icon8" data-descr={barGraph[8].tvl} style={{height: barGraph[8].height, backgroundColor: barGraph[8].color,}}/>
          <div className="bar-icon9" data-descr={barGraph[9].tvl} style={{height: barGraph[9].height, backgroundColor: barGraph[9].color,}}/>
          <div className="label4" onClick={()=>{setPremium(0)}}>0%</div>
          <div className="label5" onClick={()=>{setPremium(1)}}>1%</div>
          <div className="label6" onClick={()=>{setPremium(2)}}>2%</div>
          <div className="label7" onClick={()=>{setPremium(3)}}>3%</div>
          <div className="label8" onClick={()=>{setPremium(4)}}>4%</div>
          <div className="label9" onClick={()=>{setPremium(5)}}>5%</div>
          <div className="label10" onClick={()=>{setPremium(6)}}>6%</div>
          <div className="label11" onClick={()=>{setPremium(7)}}>7%</div>
          <div className="label12" onClick={()=>{setPremium(8)}}>8%</div>
          <div className="label13" onClick={()=>{setPremium(9)}}>9%</div>
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
          <div className="highest-tvl-bar-label" style={{top: (344 - barGraph[highestBar].height), left: 42 + ((highestBar) * 40)}}>{barGraph[highestBar].tvl}</div>
          <div className="x-axis" />
          <form>
            <input className="deposit-amount" name="amount" value={depositAmount} disabled={premium === undefined} type="number" onChange={handlesetdAmount}/>
            <button className="btn buttons deposit-button" onClick={handledepositClick} disabled={premium === undefined} type="button">
              <div className="deposit-button-label" onClick={handledepositClick}>
                {premium === undefined ? (
                <span tabIndex={0} data-descr="select a premium">Deposit:</span>
                ) : <>Deposit:</> }                
              </div>
            </button>
            <input className="withdraw-amount" name="amount" value={withdrawAmount} disabled={premium === undefined} type="number" onChange={handlesetwAmount}/>
            <button className="btn buttons withdraw-button" onClick={handlewithdrawClick} disabled={premium === undefined} type="button">
              <div className="withdraw-button-label"  onClick={handlewithdrawClick}>
                {premium === undefined ? (
                <span tabIndex={0} data-descr="select a premium">Withdraw:</span>
                ) : <>Withdraw:</> }     
              </div>
            </button>
          </form> 
          <a className="btn buttons claim-button single-asset-btn" onClick={handleclaimClick}>
            <p tabIndex={0} data-descr={lqClaimables.display} style={{color: "black"}} onClick={handleclaimClick}>Claim</p>
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
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </div>
    </div>
    </div>
  );
};

export default LiquidationPools;