// Variables: 10 heights for the bar graph,
// the largest will get the marker at the top by shifting it to the left (40 per premium)
// & place its bottom at the static bottom + bar height + spacing
// (using inline styles from the variables)

import React from "react";
import { useEffect, useState } from "react";
import { LiquidationQueueClient, LiquidationQueueQueryClient } from "../codegen/liquidation_queue/LiquidationQueue.client";
import { ClaimsResponse, QueueResponse, SlotResponse } from "../codegen/liquidation_queue/LiquidationQueue.types";
import { denoms, Prices } from ".";
import { coins } from "@cosmjs/stargate";
import Popup from "../components/Popup";
import { StabilityPoolClient, StabilityPoolQueryClient } from "../codegen/stability_pool/StabilityPool.client";
import { PositionsQueryClient } from "../codegen/positions/Positions.client";
import { NativeToken } from "../codegen/positions/Positions.types";
import Image from "next/image";

//Bar graph scale
const CDTperPIXEL = 100_000_000; //100

interface LQClaims {
  display: string;
  bidFor: string[];
}

interface Props {
  // connect: () => void;
  queryClient: LiquidationQueueQueryClient | null;
  liq_queueClient: LiquidationQueueClient | null;
  sp_queryClient: StabilityPoolQueryClient | null;
  sp_client: StabilityPoolClient | null;
  cdp_queryClient: PositionsQueryClient | null;
  address: string | undefined;
  pricez: Prices;  
  index_lqClaimables: LQClaims;
  //SP
  capitalAhead: number;
  setcapitalAhead: (capitalAhead: number) => void;
  userclosestDeposit: number;
  setuserclosestDeposit: (userclosestDeposit: number) => void;
  userTVL: number;
  setuserTVL: (userTVL: number) => void;
  TVL: number;
  setTVL: (TVL: number) => void;
  SPclaimables: string;
  setSPclaimables: (SPclaimables: string) => void;
  unstakingMsg: string;
  setunstakingMsg: (unstakingMsg: string) => void;
}

const LiquidationPools = ({queryClient, liq_queueClient, sp_queryClient, sp_client, cdp_queryClient, address, pricez, index_lqClaimables,
  capitalAhead, setcapitalAhead, userclosestDeposit, setuserclosestDeposit, userTVL, setuserTVL, TVL, setTVL, SPclaimables, setSPclaimables, unstakingMsg, setunstakingMsg
}: Props) => {
  const [prices, setPrices] = useState<Prices>({
    osmo: 0,
    atom: 0,
    axlUSDC: 0,
    atomosmo_pool: 0,
    osmousdc_pool: 0,
  });
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [popupStatus, setPopupStatus] = useState("");
  //Stability Pool execution
  const [omniAmount, setomniAmount] = useState(5);
  //Menu
  const [open, setOpen] = useState(false);
  const [menuAsset, setMenuAsset] = useState("OSMO" as string);
  //Liq Queue execution
  const [bidAmount, setbidAmount] = useState(5);
  const [premium, setPremium] = useState<number>();
  const [lqClaimables, setlqClaimables] = useState<LQClaims>({
    display: "",
    bidFor: [""],
  });
  const [saFunctionLabel, setsaFunctionLabel] = useState("Place");
  const [oaFunctionLabel, setoaFunctionLabel] = useState("Join");
  //Pool visuals
  const [queueuserBids, setqueueuserBids] = useState(0);
  const [queue, setQueue] = useState<QueueResponse>();
  interface Bar {
    height: number;
    color: string;
    tvl: string;
  }
  const [barGraph, setbarGraph] = useState<Bar[][]>([[
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
  ],[
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
  ],
  [
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
  ],
  [
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
  ],[
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
    { height: 0, color: "#000000", tvl: "0" },
  ]]);
  const [collateralTVL, setcollateralTVL] = useState(0);
  //index for highest bar in barGraph
  const [highestBar, sethighestBar] = useState<number[]>([0,0,0,0,0]);
  //index for the barGraph to display
  const [barIndex, setbarIndex] = useState(0);

  const handleOpen = () => {
    setOpen(!open);
  };
  const handleMenuOne = () => {
    setOpen(false);
    setMenuAsset("ATOM");
    setbarIndex(1);
  };
  const handleMenuTwo = () => {
    setOpen(false);
    setMenuAsset("axlUSDC");
    setbarIndex(2);
  };
  const handleMenuThree = () => {
    setOpen(false);
    setMenuAsset("OSMO");
    setbarIndex(0);
  };
  const handleMenuFour = () => {
    setOpen(false);
    setMenuAsset("ATOM-OSMO");
    setbarIndex(3);
  };
  const handleMenuFive = () => {
    setOpen(false);
    setMenuAsset("OSMO-axlUSDC");
    setbarIndex(4);
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
      }).then((res) => {
        let resp = res as SlotResponse[];
        let highest = highestBar[barIndex];

        //Set new heights
        for (let i = 0; i < resp.length; i++) {
          let premium_index =  parseInt((parseFloat(resp[i].liq_premium) * 100).toFixed(0));
          if (premium_index < 10){
            //Divide to get X per pixel.Add 6 decimals to account for the extra decimals of a native token
            barGraph[barIndex][premium_index].height = parseFloat(resp[i].total_bid_amount) / CDTperPIXEL;
            //Set tvl            
            var tvl = parseInt(resp[i].total_bid_amount) / 1_000000;
            var tvl_label = tvl.toString();
            if (tvl >= 1000){
              tvl_label = (tvl/1000).toString() + "K";
            } else if (tvl >= 1000000){
              tvl_label = (tvl/1000000).toString() + "M";
            }
            barGraph[barIndex][premium_index].tvl = tvl_label;
            //Check if this is the highest bar
            if (barGraph[barIndex][premium_index].height > barGraph[barIndex][highest].height) {
              highest = premium_index;
            }
            //Reset color of bar
            barGraph[barIndex][premium_index].color = "#000000";
          }
        }
        //Set the color of any slots the user is in to blue & tally user's bids
        if (address !== undefined) {
          var user_bids = 0;

          for (let i = 0; i < resp.length; i++) {
            let premium_index =  parseInt((parseFloat(resp[i].liq_premium) * 100).toFixed(0));
            if (premium_index < 10){
              for (let x = 0; x < resp[i].bids.length; x++) {
                if (resp[i].bids[x].user === address){
                  //Set bar to colored
                  barGraph[barIndex][premium_index].color = "rgba(79, 202, 187, 0.85)";
                  //Add to user's bids
                  user_bids += parseInt(resp[i].bids[x].amount) / 1_000_000;
                }
              }
            }
          }
          //Set user's bids
          setqueueuserBids(user_bids);
        }
        //Save new barGraph
        setbarGraph(barGraph);
        //Set highest 
        highestBar[barIndex] = highest;
        sethighestBar(highestBar);
      })
    } catch (error) {
      //We don't popup for query errors
      console.log(error)
    }

    //Query TVL as collateral in Basket
    try {
      await cdp_queryClient?.getBasket().then((res) => {
        console.log(res)
        //Get price
        var price = 0;
        switch (asset) {
          case denoms.osmo: {
            price = prices.osmo;
            break;
          } 
          case denoms.atom: {
            price = prices.atom;
            break;
          }
          case denoms.axlUSDC: {
            price = prices.axlUSDC;
            break;
          }
          case denoms.atomosmo_pool: {
            price = prices.atomosmo_pool;
            break;
          }
          case denoms.osmousdc_pool: {
            price = prices.osmousdc_pool;
            break;
          }
        }
        //Set collateral TVL
        for (let i = 0; i < res.collateral_types.length; i++) {
          //@ts-ignore
          if (res.collateral_types[i].asset.info.native_token.denom === asset) {
            console.log(res.collateral_types[i].asset.amount, price)
            console.log(parseFloat(((parseInt(res.collateral_types[i].asset.amount)) * price).toFixed(2)))
            if (asset === denoms.atomosmo_pool || asset === denoms.osmousdc_pool) {
              setcollateralTVL(parseFloat(((parseInt(res.collateral_types[i].asset.amount)/1000) * price).toFixed(2)));
              break;
            } else {
              setcollateralTVL(parseFloat(((parseInt(res.collateral_types[i].asset.amount) / 1000_000_000) * price).toFixed(2)));
              break;
            }
          }
        }
      })
    } catch (error) {
      //We don't popup for query errors
      console.log(error)
    }

    //Query queue
    try {
      await queryClient?.queue({
        bidFor: {
          native_token: {
            denom: asset,
          }
        },
      }).then((res) => {
        setQueue(res);
      })
    } catch (error) {
      //We don't popup for query errors
      console.log(error)
    }

  }

  const handledepositClick = async () => {
    var depositAmount = bidAmount;
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      // connect();
    }
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
      case "ATOM-OSMO": {
        workingDenom = denoms.atomosmo_pool;
        break;
      }
      case "OSMO-axlUSDC": {
        workingDenom = denoms.osmousdc_pool;
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
      }, "auto", undefined, coins(((depositAmount ?? 0) * 1_000_000), denoms.cdt)).then((res) => {
        console.log(res)
        //Format popup
        setPopupStatus("Success")
        setPopupMsg("Bid of "+ depositAmount +" CDT at a " +premium+ "% premium successful")
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
    var withdrawAmount = bidAmount;
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      // connect();
    }
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
      case "ATOM-OSMO": {
        workingDenom = denoms.atomosmo_pool;
        break;
      }
      case "OSMO-axlUSDC": {
        workingDenom = denoms.osmousdc_pool;
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
                amount: ((withdrawAmount ?? 0) * 1_000_000).toString(),
                bidId: bidId,
              
            }, "auto", undefined).then((res) => {
                console.log(res)
                //Format popup
                setPopupStatus("Success")
                setPopupMsg("Retracted " +withdrawAmount+ " CDT from bid "+ bidId)
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
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      // connect();
    }
    try {
      //Claim for each bidFor asset
      for (let i = 0; i < lqClaimables.bidFor.length; i++) {     
        console.log(lqClaimables.bidFor[i])   
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

  const handleStabilityDeposit = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      // connect();
    }
    try {
      await sp_client?.deposit({}
        , "auto", undefined, coins(((omniAmount ?? 0) * 1_000_000), denoms.cdt)
        ).then(async (res) => {
          console.log(res)
          //Format popup
          setPopupStatus("Success")
          setPopupMsg("Deposited " + omniAmount + " CDT")
          setPopupTrigger(true)

          //Query capital ahead of user deposit
          await sp_queryClient?.capitalAheadOfDeposit({
            user: address ?? "",
          }).then((res) => {
            console.log(res)
            //set capital ahead of user deposit
            setcapitalAhead(parseInt(res.capital_ahead ?? 0) / 1_000_000)
            //set user closest deposit in K
            if (res.deposit !== undefined) {
              setuserclosestDeposit(parseInt(res.deposit.amount ?? 0) / 1_000_000)
            } else {  
              //set to 0 if no deposit        
              setuserclosestDeposit(0)
            }
          })
          //Query user's total deposit
          await sp_queryClient?.assetPool({
            user: address ?? "",
          }).then((res) => {
            console.log(res)
            //Calc user tvl
            var tvl = 0;
            for (let i = 0; i < res.deposits.length; i++) {
              tvl += parseInt(res.deposits[i].amount) / 1_000_000;
            }
            //set user tvl
            setuserTVL(tvl)
          })
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
  const handleStabilityWithdraw = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      // connect();
    }
    try {
      await sp_client?.withdraw({
        amount: ((omniAmount ?? 0) * 1_000_000).toString(),
      }, "auto", undefined)
        .then(async (res) => {
          console.log(res)
          //Format popup
          setPopupStatus("Success")
          setPopupTrigger(true)

          //Query capital ahead of user deposit
          await sp_queryClient?.capitalAheadOfDeposit({
            user: address ?? "",
          }).then((res) => {
            console.log(res)
            //set capital ahead of user deposit
            setcapitalAhead(parseInt(res.capital_ahead ?? 0) / 1_000_000)
            //set user closest deposit in K
            if (res.deposit !== undefined) {
              setuserclosestDeposit(parseInt(res.deposit.amount ?? 0) / 1_000_000)
            } else {  
              //set to 0 if no deposit        
              setuserclosestDeposit(0)
            }
          })
          //Query user's total deposit
          await sp_queryClient?.assetPool({
            user: address ?? "",
          }).then((res) => {
            console.log(res)
            //Calc user tvl
            var tvl = 0;
            for (let i = 0; i < res.deposits.length; i++) {
              tvl += parseInt(res.deposits[i].amount) / 1_000_000;
            }
            //Format pop-up
            if (tvl < userTVL){
              setPopupMsg("Withdrew " + omniAmount + " CDT")
              //set user tvl
              setuserTVL(tvl)
            } else {              
              setPopupMsg("Unstaked " + omniAmount + " CDT")
            }

          })
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

  

  const handleStabilityClaim = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      // connect();
    }
    try { 
      await sp_client?.claimRewards("auto", undefined).then((res) => {
        console.log(res)
        //Format popup
        setPopupStatus("Success")
        setPopupMsg("Claimed " + SPclaimables)
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
  

  useEffect(() => {
    //Set prices
    if (prices.osmo === 0 ){ setPrices(pricez) }
    //Set barGraph
    switch(menuAsset){
      case "OSMO": {
        if (barGraph[0][0].tvl === "0" && prices.osmo !== 0) {
          queryQueuesaveHeights(denoms.osmo)
        }
        break;
      }
      case "ATOM": {
        if (barGraph[1][0].tvl === "0" && prices.atom !== 0) {
          queryQueuesaveHeights(denoms.atom)
        }
        break;
      }
      case "axlUSDC": {
        if (barGraph[2][0].tvl === "0" && prices.axlUSDC !== 0) {
          queryQueuesaveHeights(denoms.axlUSDC)
        }
        break;
      }
      case "ATOM-OSMO": {
        if (barGraph[3][0].tvl === "0" && prices.atomosmo_pool !== 0) {
          queryQueuesaveHeights(denoms.atomosmo_pool)
        }
        break;
      }
      case "OSMO-axlUSDC": {
        if (barGraph[4][0].tvl === "0" && prices.osmousdc_pool !== 0) {
          queryQueuesaveHeights(denoms.osmousdc_pool)
        }
        break;
      }
    }
    //Set LQ claimables
    setlqClaimables(index_lqClaimables);

  }, [menuAsset, prices, address, queryClient, liq_queueClient, sp_queryClient, sp_client, cdp_queryClient])

  function plusPremium() {
    if (((premium??0) < parseInt(queue?.max_premium ?? "9")) && saFunctionLabel === "Place") {
      setPremium(prevState => (prevState??0) + 1)
    }
    //If user is retracting, only allow them to retract from premiums they have bids in
    var already_set = false;
    if (saFunctionLabel === "Retract") {
      barGraph[barIndex].forEach((bar, index) => {
        if (bar.color !== "#000000" && index > (premium??0) && !already_set) {
          already_set = true;
          setPremium(index)
        }
        return;
      })
    }
  }
  function minusPremium() {
    if (((premium??0) > 0) && saFunctionLabel === "Place") {
      setPremium(prevState => (prevState??0) - 1)
    }
    //If user is retracting, only allow them to retract from premiums they have bids in
    if (saFunctionLabel === "Retract") {
      barGraph[barIndex].forEach((bar, index) => {
        if (bar.color !== "#000000" && index < (premium??0)) {
          setPremium(index)
        }
        return;
      })
    }
  }
  function getmenuAssetPrice() {
    switch(menuAsset){
      case "OSMO": {
        return prices.osmo;
      }
      case "ATOM": {
        return prices.atom;
      }
      case "axlUSDC": {
        return prices.axlUSDC;
      }
      case "ATOM-OSMO": {
        return prices.atomosmo_pool;
      }
      case "OSMO-axlUSDC": {
        return prices.osmousdc_pool;
      }
    }
  }
  function setBidAmount(event: any) {
    event.preventDefault();
    setbidAmount(event.target.value)
  }
  function setOmniAmount(event: any) {
    event.preventDefault();
    setomniAmount(event.target.value)
  }
  function handlebidExecution() {    
    switch (saFunctionLabel) {
      case "Place": {
        handledepositClick();
        break;
      }
      case "Retract": {
        handlewithdrawClick();
        break;
      }
    }
  }
  function handleOmniExecution() {    
    switch (oaFunctionLabel) {
      case "Join": {
        handleStabilityDeposit();
        break;
      }
      case "Exit": {
        handleStabilityWithdraw();
        break;
      }
    }
  }
  

  return (
    
    <div className="liquidations">
    {/* // <div className="row ">
    // <div className="col shiftRight"> */}
    <div className="liquidation-pools">
    <h1 className="pagetitle">Liquidation Pools</h1>
        <div className="singleassetframe">
          <h3 className="pool-titles" data-descr="Liquidations start at the lowest, capitalized premium & distribute assets based on your proportion of the premium's TVL">SINGLE ASSET*</h3>
          <div className="single-asset-info-circle" />
          <div className="bar-icon" data-descr={barGraph[barIndex][0].tvl} style={{height: barGraph[barIndex][0].height, backgroundColor: barGraph[barIndex][0].color,}}/>
          <div className="bar-icon1" data-descr={barGraph[barIndex][1].tvl} style={{height: barGraph[barIndex][1].height, backgroundColor: barGraph[barIndex][1].color,}}/>
          <div className="bar-icon2" data-descr={barGraph[barIndex][2].tvl} style={{height: barGraph[barIndex][2].height, backgroundColor: barGraph[barIndex][2].color,}}/>
          <div className="bar-icon3" data-descr={barGraph[barIndex][3].tvl} style={{height: barGraph[barIndex][3].height, backgroundColor: barGraph[barIndex][3].color,}}/>
          <div className="bar-icon4" data-descr={barGraph[barIndex][4].tvl} style={{height: barGraph[barIndex][4].height, backgroundColor: barGraph[barIndex][4].color,}}/>
          <div className="bar-icon5" data-descr={barGraph[barIndex][5].tvl} style={{height: barGraph[barIndex][5].height, backgroundColor: barGraph[barIndex][5].color,}}/>
          <div className="bar-icon6" data-descr={barGraph[barIndex][6].tvl} style={{height: barGraph[barIndex][6].height, backgroundColor: barGraph[barIndex][6].color,}}/>
          <div className="bar-icon7" data-descr={barGraph[barIndex][7].tvl} style={{height: barGraph[barIndex][7].height, backgroundColor: barGraph[barIndex][7].color,}}/>
          <div className="bar-icon8" data-descr={barGraph[barIndex][8].tvl} style={{height: barGraph[barIndex][8].height, backgroundColor: barGraph[barIndex][8].color,}}/>
          <div className="bar-icon9" data-descr={barGraph[barIndex][9].tvl} style={{height: barGraph[barIndex][9].height, backgroundColor: barGraph[barIndex][9].color,}}/>
          <div className="label4" data-tvl={barGraph[barIndex][0].tvl} style={(premium === 0) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(0)}}>0%</div>
          <div className="label5" data-tvl={barGraph[barIndex][1].tvl} style={(premium === 1) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(1)}}>1%</div>
          <div className="label6" data-tvl={barGraph[barIndex][2].tvl} style={(premium === 2) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(2)}}>2%</div>
          <div className="label7" data-tvl={barGraph[barIndex][3].tvl} style={(premium === 3) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(3)}}>3%</div>
          <div className="label8" data-tvl={barGraph[barIndex][4].tvl} style={(premium === 4) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(4)}}>4%</div>
          <div className="label9" data-tvl={barGraph[barIndex][5].tvl} style={(premium === 5) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(5)}}>5%</div>
          <div className="label10" data-tvl={barGraph[barIndex][6].tvl} style={(premium === 6) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(6)}}>6%</div>
          <div className="label11" data-tvl={barGraph[barIndex][7].tvl} style={(premium === 7) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(7)}}>7%</div>
          <div className="label12" data-tvl={barGraph[barIndex][8].tvl} style={(premium === 8) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(8)}}>8%</div>
          <div className="label13" data-tvl={barGraph[barIndex][9].tvl} style={(premium === 9) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(9)}}>9%</div>
          <div className="dropdown asset-dropdown">
            <button onClick={handleOpen} style={{outline: "none"}}>{menuAsset}</button>
            {open ? (
                <ul className="menu">
                {menuAsset !== "ATOM" ? (<li className="menu-item">
                    <button onClick={handleMenuOne} style={{outline: "none"}}>ATOM</button>
                </li>) : null}
                {menuAsset !== "axlUSDC" ? (<li className="menu-item">
                    <button onClick={handleMenuTwo} style={{outline: "none"}}>axlUSDC</button>
                </li>) : null}
                {menuAsset !== "OSMO" ? (<li className="menu-item">
                    <button onClick={handleMenuThree} style={{outline: "none"}}>OSMO</button>
                </li>) : null}
                {/* {menuAsset !== "ATOM-OSMO" ? (<li className="menu-item">
                    <button onClick={handleMenuFour}>ATOM-OSMO</button>
                </li>) : null}
                {menuAsset !== "OSMO-axlUSDC" ? (<li className="menu-item">
                    <button onClick={handleMenuFive}>OSMO-axlUSDC</button>
                </li>) : null} */}
                </ul>
            ) : null}
          </div>
          <div className="queue-stats-box">
            <div className="queue-stats-item">
              <div style={{textAlign: "center", borderBottom: "2px solid #50C9BD", fontSize: "large"}}>{collateralTVL}K</div>
             <div className="collateral-tvl-label" >TVL as Collateral</div>
            </div>
            <div className="queue-stats-item">
              <div style={{textAlign: "center", borderBottom: "2px solid #50C9BD", fontSize: "large"}}>{ parseInt(queue?.bid_asset.amount ?? "0") > 1000000_000000 ? (parseInt(queue?.bid_asset.amount ?? "0") / 1000000_000_000).toFixed(2)+"M CDT" : parseInt(queue?.bid_asset.amount ?? "0") > 1000_000000 ? (parseInt(queue?.bid_asset.amount ?? "0") / 1000_000_000).toFixed(1)+"K CDT" : (parseInt(queue?.bid_asset.amount ?? "0") / 1_000_000) + " CDT" }</div>
             <div className="collateral-tvl-label" >Total Bids</div>
            </div>
            <div className="queue-stats-item">
              <div style={{textAlign: "center", borderBottom: "2px solid #50C9BD", fontSize: "large"}}>${getmenuAssetPrice()?.toFixed(4)}</div>
             <div className="collateral-tvl-label" >Collateral Price</div>
             </div>
            <div className="queue-stats-item">
              <div style={{textAlign: "center", borderBottom: "2px solid #50C9BD", fontSize: "large"}}>{queueuserBids} CDT</div>
             <div className="collateral-tvl-label" >Your Bids</div>
            </div>
          </div>
          <div className="highest-tvl-bar-label" style={{top: (344 - barGraph[barIndex][highestBar[barIndex]].height), left: 42 + ((highestBar[barIndex]) * 39) - (7 - highestBar[barIndex])}}>{barGraph[barIndex][highestBar[barIndex]].tvl} CDT</div>
          <div className="x-axis" />
          <form className="bid-actionbox" style={{top: "-9vh"}}>
            <div>
              <div className="bid-actionlabel" style={saFunctionLabel === "Place" ? {} : {opacity: 0.3}} onClick={()=>{setsaFunctionLabel("Place"); setbidAmount(5)}}>Place </div>
              <>/ </>
              <div className="bid-actionlabel" style={saFunctionLabel === "Retract" ? {} : {opacity: 0.3}} onClick={()=>{setsaFunctionLabel("Retract")}}>Retract </div>
               Bid
            </div>
            <div className="bid-actionbox-labels">Premium: </div>
            <input className="bid-actionbox-input" value={premium} defaultValue={0} style={{width: "3.2vw"}}/>
            <div style={{display: "inline-block", backgroundColor: "#454444", height: "4vh"}}>%</div>
            <div className="premium-toggle">
              <a className="plus-premium" onClick={plusPremium}>+</a>
              <a className="minus-premium" onClick={minusPremium}>-</a>
            </div>
            <div className="bid-actionbox-labels">Amount: </div><input className="bid-actionbox-input" style={{marginTop: "0.3vh"}} value={bidAmount} onChange={setBidAmount}/><div className="bid-actionbox-labels"  style={{textAlign: "center", width: "3vw"}}> CDT</div>
            <div className="btn bid-button" onClick={handlebidExecution}>{saFunctionLabel} Bid</div>
            <div className="btn sa-claim-button" data-descr={lqClaimables.display} style={lqClaimables.display === "No Claims" ? {opacity: 0.1, color: "black", padding: "0px", cursor: "default"} : {color: "black", padding: "0px"}} onClick={handleclaimClick}>Claim</div>
          </form>
        </div>
        <div className="omniassetframe">
          <h3 className="pool-titles" data-descr="Liquidations are distributed to deposits first-in-first-out (FIFO) so you are essentially waiting in line for the liquidated collateral.">OMNI-ASSET*</h3>
          <div className="pool-subtitle" data-descr="NOTE: Funds can be used to liquidate during the 1 day unstaking">1 day unstaking*
          </div>
          <div className="capital-ahead-box" />
          <div className="user-tvl-box" />
          <div className="user-tvl-label" data-descr={"Your TVL: "+userTVL}>{userclosestDeposit > 1000000 ? (userclosestDeposit /1000000).toFixed(2) + "M" : userclosestDeposit > 1000 ? (userclosestDeposit /1000).toFixed(1) + "K" : userclosestDeposit}</div>
          <div className="captial-ahead-label" data-descr="Capital ahead of you">{capitalAhead > 1000000 ? (capitalAhead /1000000).toFixed(2) + "M" : capitalAhead > 1000 ? (capitalAhead /1000).toFixed(1) + "K" : capitalAhead}</div>
          <div className="total-tvl-label">TVL: {TVL > 1000000 ? TVL /1000000 + "M" : TVL > 1000 ? TVL /1000 + "K" : TVL} CDT</div>
          <Image className="tvl-container-icon" width={253} height={236} alt="" src="/images/tvl_container.svg" />
          <div className="premium">10%</div>
          <form className="bid-actionbox">
            <div>
              <div className="bid-actionlabel" style={oaFunctionLabel === "Join" ? {} : {opacity: 0.3}} onClick={()=>{setoaFunctionLabel("Join"); setomniAmount(5)}}>Join </div>
              <>/ </>
              <div className="bid-actionlabel" style={oaFunctionLabel === "Exit" ? {} : {opacity: 0.3}} onClick={()=>{setoaFunctionLabel("Exit")}}>Exit </div>
               the Queue
            </div>
            <div className="bid-actionbox-labels">Amount: </div><input className="bid-actionbox-input" style={{marginTop: "0.3vh"}} value={omniAmount} onChange={setOmniAmount}/><div className="bid-actionbox-labels"  style={{textAlign: "center", width: "3vw"}}> CDT</div>
            <div className="btn bid-button" onClick={handleOmniExecution} style={oaFunctionLabel === "Join" ? {opacity: 0.3} : {}}>{oaFunctionLabel} Queue</div>
            <div className="btn sa-claim-button" data-descr={SPclaimables} style={SPclaimables === "No Claims" ? {opacity: 0.1, color: "black", padding: "0px", cursor: "default"} : {color: "black", padding: "0px"}} onClick={handleStabilityClaim}>Claim</div>
          </form>
          <div className="omni-stats-box">
            <div className="queue-stats-item">
              <div style={{textAlign: "center", borderBottom: "2px solid #798EFF", fontSize: "large"}}>{TVL > 1000000 ? (TVL /1000000).toFixed(2) + "M" : TVL > 1000 ? (TVL /1000).toFixed(1) + "K" : TVL} CDT</div>
             <div className="collateral-tvl-label" >Total TVL</div>
            </div>
            <div className="queue-stats-item">
              <div style={{textAlign: "center", borderBottom: "2px solid #798EFF", fontSize: "large"}}>{userTVL > 1000000 ? (userTVL /1000000).toFixed(2) + "M" : userTVL > 1000 ? (userTVL /1000).toFixed(1) + "K" : userTVL} CDT</div>
             <div className="collateral-tvl-label" >Your TVL</div>
            </div>
            <div className="queue-stats-item">
              <div style={{textAlign: "center", borderBottom: "2px solid #798EFF", fontSize: "large"}}>{userclosestDeposit > 1000000 ? (userclosestDeposit /1000000).toFixed(2) + "M" : userclosestDeposit > 1000 ? (userclosestDeposit /1000).toFixed(1) + "K" : userclosestDeposit} CDT</div>
             <div className="collateral-tvl-label" >Your Nearest Position</div>
            </div>
            <div className="queue-stats-item">
              <div style={{textAlign: "center", borderBottom: "2px solid #798EFF", fontSize: "large"}}>{capitalAhead > 1000000 ? (capitalAhead /1000000).toFixed(2) + "M" : capitalAhead > 1000 ? (capitalAhead /1000).toFixed(1) + "K" : capitalAhead} CDT</div>
             <div className="collateral-tvl-label" >Capital Ahead of Nearest</div>
            </div>
          </div>          
            {(unstakingMsg !== "") ? (
              <div className="omni-unstaking-msg">
                <div style={{top: "1vh", position: "relative"}}>{unstakingMsg}</div>
              </div>
            ) : null}
        </div>
        <Image className="titleicon" width={45} height={45} alt="" src="/images/liquidation_pool.svg" />
        <div className="middleborder" />
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
      </div>
    {/* // </div>
    // </div> */}
    </div>
  );
};

export default LiquidationPools;