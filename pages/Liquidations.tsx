import React from "react";
import { useEffect, useState } from "react";
import { LiquidationQueueClient, LiquidationQueueQueryClient } from "../codegen/liquidation_queue/LiquidationQueue.client";
import { QueueResponse, SlotResponse } from "../codegen/liquidation_queue/LiquidationQueue.types";
import { Prices } from ".";
import { denoms } from "../config";
import Popup from "../components/Popup";
import { StabilityPoolClient, StabilityPoolQueryClient } from "../codegen/stability_pool/StabilityPool.client";
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import { useChain } from "@cosmos-kit/react";
import { chainName } from "../config";
import { PositionResponse } from "../codegen/positions/Positions.types";
import { queryPremiumSlots, queryQueue } from "../components/liquidations/HelperFunctions";
import OmniAssetBid from "../components/liquidations/OmniAssetBid";
import { SingleAssetBid } from "../components/liquidations/SingleAssetBid";
import { Box, Flex, Heading, SimpleGrid, VStack, useBreakpointValue } from "@chakra-ui/react";
import SingleAssetPane from "../components/liquidations/SingleAssetPane";
import OmniAssetPane from "../components/liquidations/OmniAssetPane";
import { DataItem } from "../components/liquidations/OmniChart";

export interface LQClaims {
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

export function formatNumber(TVL: number) {
  if (TVL > 1000000) {
      return (TVL / 1000000).toFixed(2) + "M";
  } else if (TVL > 1000) {
      return (TVL / 1000).toFixed(1) + "K";
  } else if (TVL != undefined) {
      return TVL.toFixed(0);
  } else {
      return "0";    
  }
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
    cdt: 0,
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
    asset: string;
    tvl: string;
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
  
  const handleSelect = (asset: string, index: number) => {
    setMenuAsset(asset);
    setbarIndex(index);
  };

  const queryQueuesaveHeights = async (asset: string) => {
    try {
      let resp = await queryPremiumSlots(asset, queryClient) as SlotResponse[];
      let highest = highestBar[barIndex];

        for (let i = 0; i < resp.length; i++) {
          let premium_index =  parseInt((parseFloat(resp[i].liq_premium) * 100).toFixed(0));
          if (premium_index < 10){          
            var tvl = parseInt(resp[i].total_bid_amount) / 1_000000;
            var tvl_label = formatNumber(tvl);
            barGraph[barIndex][premium_index].tvl = tvl_label;
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

  function getmenuAssetPrice() {
    if (menuAsset in assets) {
      return assets[menuAsset].price;
    }
  }
  const saStats: string[] = [
    collateralTVL+"K", 
    parseInt(queue?.bid_asset.amount ?? "0") > 1000000_000000 ? (parseInt(queue?.bid_asset.amount ?? "0") / 1000000_000_000).toFixed(2)+"M CDT" : parseInt(queue?.bid_asset.amount ?? "0") > 1000_000000 ? (parseInt(queue?.bid_asset.amount ?? "0") / 1000_000_000).toFixed(1)+"K CDT" : (parseInt(queue?.bid_asset.amount ?? "0") / 1_000_000) + " CDT",
    "$" + (getmenuAssetPrice()?.toFixed(4) as string),
    queueuserBids + " CDT"
  ]
  const omniStats: string[] = [ 
    formatNumber(TVL) + " CDT",
    formatNumber(TVL) + " CDT",
    formatNumber(userclosestDeposit) + "CDT",
    formatNumber(capitalAhead)+ " CDT"
  ]
 
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Box bg="gray.900" color="white" minH="full">
      <Flex direction="column" alignItems="center">
        {/* Header */}
        <Flex
          w="full"
          maxW="8xl"
          justifyContent="flex-start"
          gap={isMobile ? 0 : 8}
          alignItems="center"
          wrap={isMobile ? "wrap" : "nowrap"}
          pt={isMobile ?"4" : "8"}
          p={4}
        >
          <Heading size={isMobile ? "2xl" : "lg"} ml={isMobile ? 0 : 8} mt={4} pb="2">
            Liquidation Pools
          </Heading>
          <div className="liquidation-pool-header">
          <div className="liquidatible-positions">
            <div className="at-risk-positions">At-Risk Positions: {riskyPositions.length}</div>
            <div className="btn liquidate-button" style={getLiquidatiblePositions().length > 0 ? {} : {opacity: 0.3}} onClick={handleLiquidation}>Liquidate</div>
          </div>
        </div>
        </Flex>
        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} maxWidth="7xl">
          <VStack
            direction={{ base: "column", lg: "row" }}
            spacing="21"
            justifyContent="center"
            alignItems="center"
            w="full"
            maxW="5xl"
            pr={4}
            pl={4}
          >
            <SingleAssetPane barGraph={barGraph} handleSelect={handleSelect} selectedAsset={menuAsset} stats={saStats} />
            <SingleAssetBid
              assets={assets}
              liq_queueClient={liq_queueClient}
              queryClient={queryClient}
              setlqClaimables={setlqClaimables}
              lqClaimables={lqClaimables}
              address={address}
              connect={connect}
              menuAsset={menuAsset}
            />
          </VStack>
          <VStack
            direction={{ base: "column", lg: "row" }}
            spacing="21"
            justifyContent="flex-start"
            alignItems="center"
            w="full"
            maxW="5xl"
            pr={4}
            pl={4}
          >
            <OmniAssetPane stats={omniStats} data={[{ name: "", user: Number(formatNumber(userclosestDeposit)), others: Number(formatNumber(capitalAhead))} as DataItem]}/>
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
          </VStack>
          </SimpleGrid>
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
      </Flex>
    </Box>
  );
};

export default LiquidationPools;