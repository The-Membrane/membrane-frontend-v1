// Variables: 10 heights for the bar graph,
// the largest will get the marker at the top by shifting it to the left (40 per premium)
// & place its bottom at the static bottom + bar height + spacing
// (using inline styles from the variables)

import React from "react";
import { useEffect, useState } from "react";
import { LiquidationQueueClient, LiquidationQueueQueryClient } from "../codegen/liquidation_queue/LiquidationQueue.client";
import { QueueResponse, SlotResponse } from "../codegen/liquidation_queue/LiquidationQueue.types";
import { Prices } from ".";
import { denoms } from "../config";
import Popup from "../components/Popup";
import { StabilityPoolClient, StabilityPoolQueryClient } from "../codegen/stability_pool/StabilityPool.client";
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import Image from "next/image";
import { useChain } from "@cosmos-kit/react";
import { chainName } from "../config";
import { PositionResponse } from "../codegen/positions/Positions.types";
import { QueueStatsItem } from "../components/liquidations/QueueStatsItem";
import AssetDropdownMenu from "../components/liquidations/AssetDropdownMenu";
import Chart from "../components/liquidations/Chart";
import { queryPremiumSlots, queryQueue } from "../components/liquidations/HelperFunctions";
import OmniAssetBid from "../components/liquidations/OmniAssetBid";
import { SingleAssetBid } from "../components/liquidations/SingleAssetBid";

//Bar graph scale
const CDTperPIXEL = 10_000_000; //10

interface LQClaims {
  display: string;
  bidFor: string[];
}

interface Props {
  queryClient: LiquidationQueueQueryClient | null;
  liq_queueClient: LiquidationQueueClient | null;
  sp_queryClient: StabilityPoolQueryClient | null;
  sp_client: StabilityPoolClient | null;
  cdp_client: PositionsClient | null;
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
  riskyPositionz: [string, number, PositionResponse][];
}

const LiquidationPools = ({queryClient, liq_queueClient, sp_queryClient, sp_client, cdp_client, cdp_queryClient, address, pricez, index_lqClaimables,
  capitalAhead, setcapitalAhead, userclosestDeposit, setuserclosestDeposit, userTVL, setuserTVL, TVL, setTVL, SPclaimables, setSPclaimables,
  unstakingMsg, setunstakingMsg, riskyPositionz
}: Props) => {
  const { connect } = useChain(chainName);
  
  //Prices
  const [prices, setPrices] = useState<Prices>({
    osmo: 0,
    atom: 0,
    axlUSDC: 0,
    usdc: 0,
    stAtom: 0,
    stOsmo: 0,
    tia: 0,
    usdt: 0,
    atomosmo_pool: 0,
    osmousdc_pool: 0,
  });
  //At risk positions  
  const [riskyPositions, setriskyPositions] = useState<[string, number, PositionResponse][]>([]);
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [popupStatus, setPopupStatus] = useState("");
  //Stability Pool execution
  const [omniAmount, setomniAmount] = useState(5);
  //Menu
  const [open, setOpen] = useState(false);
  const [menuAsset, setMenuAsset] = useState("OSMO" as string);

 //Assets (used as a lookup for prices and denoms)
  type AssetInfo = {
    price: number;
    denom: string;
  };

  type Assets = {
    [key: string]: AssetInfo;
  };

 const assets: Assets = {
  "OSMO": {
    price: prices.osmo,
    denom: denoms.osmo,
  },
  "ATOM": {
    price: prices.atom,
    denom: denoms.atom,
  },
  "axlUSDC": {
    price: prices.axlUSDC,
    denom: denoms.axlUSDC,
  },
  "USDC": {
    price: prices.usdc,
    denom: denoms.usdc,
  },
  "stATOM": {
    price: prices.stAtom,
    denom: denoms.stAtom,
  },
  "stOSMO": {
    price: prices.stOsmo,
    denom: denoms.stOsmo,
  },
  "TIA": {
    price: prices.tia,
    denom: denoms.tia,
  },
  "USDT": {
    price: prices.usdt,
    denom: denoms.usdt,
  },
  "ATOM-OSMO": {
    price: prices.atomosmo_pool,
    denom: denoms.atomosmo_pool,
  },
  "OSMO-axlUSDC": {
    price: prices.osmousdc_pool,
    denom: denoms.osmousdc_pool,
  },
}

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
    asset: string;
  }
  
  // Concise method of chart creation
  const createBar = (asset: string) => ({ height: 0, color: "#000000", tvl: "0", asset });
  
  const [barGraph, setbarGraph] = useState<Bar[][]>(
    Object.keys(assets).map(asset => Array.from({ length: 10 }, () => createBar(asset)))
  );

  const [collateralTVL, setcollateralTVL] = useState(0);
  //index for highest bar in barGraph
  const [highestBar, sethighestBar] = useState<number[]>([0,0,0,0,0,0,0,0,0,0]);
  //index for the barGraph to display
  const [barIndex, setbarIndex] = useState(0);

  const handleOpen = () => {
    setOpen(!open);
  };
  
  const handleMenu = (asset: string, index: number) => {
    setOpen(false);
    setMenuAsset(asset);
    setbarIndex(index);
  };
  // Query premiums slots and save new heights
  //Heights are denominated 10K per pixel
  const queryQueuesaveHeights = async (asset: string) => {
    try {
      let resp = await queryPremiumSlots(asset, queryClient) as SlotResponse[];
      let highest = highestBar[barIndex];

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
    } catch (error) {
      //We don't popup for query errors
      console.log(error)
    }

    //Query TVL as collateral in Basket
    try {
      await cdp_queryClient?.getBasket().then((res) => {
        console.log(prices)

        //Get price by iterating asset lookup until denom matches
        var price = 0;
        for (let key in assets) {
          if (assets[key].denom === asset) {
            price = assets[key].price;
            break;
          }
        }

        //Set collateral TVL
        for (let i = 0; i < res.collateral_types.length; i++) {
          //@ts-ignore
          if (res.collateral_types[i].asset.info.native_token.denom === asset) {
            if (asset === denoms.atomosmo_pool || asset === denoms.osmousdc_pool) {
              setcollateralTVL(parseFloat(((parseInt(res.collateral_types[i].asset.amount)/1000_000_000_000_000_000_000) * price).toFixed(2)));
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
      let res = await queryQueue(asset, queryClient);
      setQueue(res);
    } catch (error) {
      //We don't popup for query errors
      console.log(error)
    }

  }

  useEffect(() => {
    //Set prices
    if (prices.osmo === 0 ){ setPrices(pricez) }
    
    //Set barGraph
    const assetBars = barGraph.find(bars => bars[0].asset === menuAsset);
    if (assetBars && assetBars[0].tvl === "0" && assets[menuAsset].price !== 0) {
      queryQueuesaveHeights(assets[menuAsset].denom);
    }

    //Set LQ claimables
    setlqClaimables(index_lqClaimables);
    //Set risky positions
    setriskyPositions(riskyPositionz);

  }, [menuAsset, prices, address, queryClient, liq_queueClient, sp_queryClient, sp_client, cdp_queryClient, riskyPositionz])

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
    if (menuAsset in assets) {
      return assets[menuAsset].price;
    }
  }
  function getLiquidatiblePositions() {
    var liquidatiblePositions: [string, string][] = []; //user, position_id
    riskyPositions.forEach((position) => {
      if (position[1] > 1) {
        liquidatiblePositions.push([position[0], position[2].position_id]);
      }
    })

    return liquidatiblePositions;
  }
  const handleLiquidation = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      return;
    }
    var liquidatiblePositions = getLiquidatiblePositions();
    if (liquidatiblePositions.length !== 0) {
      liquidatiblePositions.forEach(async (position) => {
        try {
          await cdp_client?.liquidate({
            positionOwner: position[0],
            positionId: position[1]
          }, "auto", undefined).then((res) => {
            console.log(res)
            //Format popup
            setPopupStatus("Success")
            setPopupMsg("Liquidated position " + position[1])
            setPopupTrigger(true)
          })
        } catch (error) {
          console.log(error)
          const e = error as { message: string }
          //This is a success msg but a cosmjs error
          if (e.message === "Invalid string. Length must be a multiple of 4"){
            //Format popup
            setPopupStatus("Success")
            setPopupMsg("Liquidated position " + position[1])
            setPopupTrigger(true)
          } else {
            //Format popup
            setPopupStatus("Error")
            setPopupMsg(e.message)
            setPopupTrigger(true)
          }
        }
      })
    }
  }
  function formatNumber(TVL: number) {
    if (TVL > 1000000) {
        return (TVL / 1000000).toFixed(2) + "M";
    } else if (TVL > 1000) {
        return (TVL / 1000).toFixed(1) + "K";
    } else {
        return TVL.toString();
    }
}
  return (
    
    <div className="liquidations">
    {/* // <div className="row ">
    // <div className="col shiftRight"> */}
    <div className="liquidation-pools">
        <div className="liquidation-pool-header">
        <div className="liquidation-pool-title">
            <h1 className="pagetitle">Liquidation Pools</h1>
            <Image className="titleicon" width={45} height={45} alt="" src="/images/liquidation_pool.svg" />
          </div>
          <div className="liquidatible-positions">
            <div className="at-risk-positions">At-Risk Positions: {riskyPositions.length}</div>
            <div className="btn liquidate-button" style={getLiquidatiblePositions().length > 0 ? {} : {opacity: 0.3}} onClick={handleLiquidation}>Liquidate</div>
          </div>
        </div>
        <div className="singleassetframe">
          <h3 className="pool-titles" data-descr="Liquidations start at the lowest, capitalized premium & distribute assets based on your proportion of the premium's TVL">SINGLE ASSET*</h3>
          <div className="single-asset-info-circle" />
          <Chart barGraph={barGraph} barIndex={barIndex} setPremium={setPremium} premium={premium} />
          <AssetDropdownMenu menuAsset={menuAsset} open={open} handleOpen={handleOpen} handleMenu={handleMenu}/>
          <div className="queue-stats-box">
            <QueueStatsItem metric={collateralTVL+ " K"} label='TVL as Collateral' color={"#50C9BD"}/>            
            <QueueStatsItem metric={ parseInt(queue?.bid_asset.amount ?? "0") > 1000000_000000 ? (parseInt(queue?.bid_asset.amount ?? "0") / 1000000_000_000).toFixed(2)+"M CDT" : parseInt(queue?.bid_asset.amount ?? "0") > 1000_000000 ? (parseInt(queue?.bid_asset.amount ?? "0") / 1000_000_000).toFixed(1)+"K CDT" : (parseInt(queue?.bid_asset.amount ?? "0") / 1_000_000) + " CDT" } label='Total Bids' color={"#50C9BD"}/>
            <QueueStatsItem metric={"$" + (getmenuAssetPrice()?.toFixed(4) as string)} label="Collateral Price" color={"#50C9BD"}/>
            <QueueStatsItem metric={queueuserBids + " CDT"} label="Your Bids" color={"#50C9BD"}/>
          </div>
          <div className="highest-tvl-bar-label" style={{top: (344 - barGraph[barIndex][highestBar[barIndex]].height), left: 42 + ((highestBar[barIndex]) * 39) - (7 - highestBar[barIndex])}}>{barGraph[barIndex][highestBar[barIndex]].tvl} CDT</div>
          <div className="x-axis" />
          <SingleAssetBid 
            premium={premium} 
            plusPremium={plusPremium} 
            minusPremium={minusPremium} 
            lqClaimables={lqClaimables} 
            address={address} 
            connect={connect} 
            menuAsset={menuAsset} 
            assets={assets} 
            liq_queueClient={liq_queueClient} 
            queryClient={queryClient} 
            setlqClaimables={setlqClaimables} 
          />
        </div>
        <div className="omniassetframe">
          <h3 className="pool-titles" data-descr="Liquidations are distributed to deposits first-in-first-out (FIFO) so you are essentially waiting in line for the liquidated collateral.">OMNI-ASSET*</h3>
          <div className="pool-subtitle" data-descr="NOTE: Funds can be used to liquidate during the 1 day unstaking">1 day unstaking*
          </div>
          <div className="capital-ahead-box" />
          <div className="user-tvl-box" />
          <div className="user-tvl-label" data-descr={"Your TVL: "+userTVL}>{formatNumber(userclosestDeposit)}</div>
          <div className="captial-ahead-label" data-descr="Capital ahead of you">{formatNumber(capitalAhead)}</div>
          <div className="total-tvl-label">TVL: {TVL > 1000000 ? TVL /1000000 + "M" : TVL > 1000 ? TVL /1000 + "K" : TVL} CDT</div>
          <Image className="tvl-container-icon" width={253} height={236} alt="" src="/images/tvl_container.svg" />
          <div className="premium">10%</div>
          <OmniAssetBid 
            address={address} 
            connect={connect}
            sp_client={sp_client} 
            sp_queryClient={sp_queryClient} 
            setcapitalAhead={setcapitalAhead} 
            setuserclosestDeposit={setuserclosestDeposit} 
            userTVL={userTVL} 
            setuserTVL={setuserTVL} 
            SPclaimables={SPclaimables} 
          />
          <div className="omni-stats-box">
            <QueueStatsItem metric={formatNumber(TVL) + " CDT"} label='Total TVL' color={"#798EFF"}/>
            <QueueStatsItem metric={formatNumber(TVL) + " CDT"} label='Your TVL' color={"#798EFF"}/>
            <QueueStatsItem metric={formatNumber(userclosestDeposit) + "CDT"} label='Your Nearest Position' color={"#798EFF"}/>
            <QueueStatsItem metric={formatNumber(capitalAhead)+ " CDT"} label='Capital Ahead of Nearest' color={"#798EFF"}/>
          </div>          
            {(unstakingMsg !== "") ? (
              <div className="omni-unstaking-msg">
                <div style={{top: "1vh", position: "relative"}}>{unstakingMsg}</div>
              </div>
            ) : null}
        </div>
        <div className="middleborder" />
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
      </div>
    {/* // </div>
    // </div> */}
    </div>
  );
};

export default LiquidationPools;