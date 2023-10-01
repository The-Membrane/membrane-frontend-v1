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
import { PositionsQueryClient } from "../codegen/Positions.client";
import { NativeToken } from "../codegen/Positions.types";
import Image from "next/image";

//Bar graph scale
const CDTperPIXEL = 100_000_000; //100

interface Props {
  queryClient: LiquidationQueueQueryClient | null;
  liq_queueClient: LiquidationQueueClient | null;
  sp_queryClient: StabilityPoolQueryClient | null;
  sp_client: StabilityPoolClient | null;
  cdp_queryClient: PositionsQueryClient | null;
  address: string | undefined;
  prices: Prices;  
}

const LiquidationPools = ({queryClient, liq_queueClient, sp_queryClient, sp_client, cdp_queryClient, address, prices}: Props) => {
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [popupStatus, setPopupStatus] = useState("");
  //Stability Pool execution  
  const [omnidepositAmount, setomnidAmount] = useState();
  const [omniwithdrawAmount, setomniwAmount] = useState();
  //Stability Pool Visual
  const [capitalAhead, setcapitalAhead] = useState(0);
  const [userclosestDeposit, setuserclosestDeposit] = useState(0);
  const [userTVL, setuserTVL] = useState(0);
  const [TVL, setTVL] = useState(0);
  const [SPclaimables, setSPclaimables] = useState("");
  const [unstakingMsg, setunstakingMsg] = useState("");
  //Menu
  const [open, setOpen] = useState(false);
  const [menuAsset, setMenuAsset] = useState("OSMO" as string);
  //Liq Queue execution
  interface LQClaims {
    display: string;
    bidFor: string[];
  }
  const [depositAmount, setdAmount] = useState();
  const [withdrawAmount, setwAmount] = useState();
  const [premium, setPremium] = useState<number>();
  const [lqClaimables, setlqClaimables] = useState<LQClaims>({
    display: "",
    bidFor: [""],
  });
  //Pool visuals
  interface Bar {
    height: number;
    color: string;
    tvl: string;
  }
  const [barGraph, setbarGraph] = useState<Bar[][]>([[
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
  ],[
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
  ],
  [
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
  ],
  [
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
  ],[
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
    { height: 0, color: "#000000", tvl: "0K" },
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
  const handlesetdAmount = (event: any) => {
    event.preventDefault();
    setdAmount(event.target.value);
  };
  const handlesetwAmount = (event: any) => {
    event.preventDefault();
    setwAmount(event.target.value);
  };  
  const handlesetomnidAmount = (event: any) => {
    event.preventDefault();
    setomnidAmount(event.target.value);
  };
  const handlesetomniwAmount = (event: any) => {
    event.preventDefault();
    setomniwAmount(event.target.value);
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
            barGraph[barIndex][premium_index].tvl = (parseFloat(resp[i].total_bid_amount) / 1_000_000000).toFixed(2)+ "K";

            //Check if this is the highest bar
            if (barGraph[barIndex][premium_index].height > barGraph[barIndex][highest].height) {
              highest = premium_index;
            }
            //Reset color of bar
            barGraph[barIndex][premium_index].color = "#000000";
          }
        }
        //Set the color of any slots the user is in to blue
        if (address !== undefined) {
          for (let i = 0; i < resp.length; i++) {
            let premium_index =  parseInt((parseFloat(resp[i].liq_premium) * 100).toFixed(0));
            if (premium_index < 10){
              for (let x = 0; x < resp[i].bids.length; x++) {
                if (resp[i].bids[x].user === address){
                  barGraph[barIndex][premium_index].color = "rgba(79, 202, 187, 0.85)";
                }
              }
            }
          }
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

  }

  const setqueueClaimables = async () => {
    try {
      await queryClient?.userClaims({
        user: address ?? "",
      }).then((res) => {
        let resp = res as ClaimsResponse[];
        let new_display = "";
        let new_bidFor: string[] = [];

        //Add claims from each response
        for (let i = 0; i < resp.length; i++) {
          let asset_claims = parseInt(resp[i].pending_liquidated_collateral) / 1_000_000; //Remove native token decimals
          
          if (asset_claims > 1) {           
            //Add asset to display
            switch (resp[i].bid_for) {
              case denoms.osmo: {     
                new_display += asset_claims + " OSMO, ";
                break;
              }
              case denoms.atom: {
                new_display += asset_claims + " ATOM, ";
                break;
              }
              case denoms.axlUSDC: {
                new_display += asset_claims + " axlUSDC, ";
                break;
              }
              case denoms.atomosmo_pool: {
                new_display += asset_claims + " ATOM-OSMO LP, ";
                break;
              }
              case denoms.osmousdc_pool: {
                new_display += asset_claims + " OSMO-axlUSDC LP, ";
                break;
              }
            }

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
        if (resp.length === 0 || new_display === "") {
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
    try {
      await sp_client?.deposit({}
        , "auto", undefined, coins(((omnidepositAmount ?? 0) * 1_000_000), denoms.cdt)
        ).then(async (res) => {
          console.log(res)
          //Format popup
          setPopupStatus("Success")
          setPopupMsg("Deposited " + omnidepositAmount + " CDT")
          setPopupTrigger(true)

          //Query capital ahead of user deposit
          await sp_queryClient?.capitalAheadOfDeposit({
            user: address ?? "",
          }).then((res) => {
            console.log(res)
            //set capital ahead of user deposit in K
            setcapitalAhead(parseInt(res.capital_ahead ?? 0) / 1000_000_000)
            //set user closest deposit in K
            if (res.deposit !== undefined) {
              setuserclosestDeposit(parseInt(res.deposit.amount ?? 0) / 1_000_000)
            } else {  
              //use TVL if no deposit        
              setuserclosestDeposit(TVL)
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
    try {
      await sp_client?.withdraw({
        amount: ((omniwithdrawAmount ?? 0) * 1_000_000).toString(),
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
            //set capital ahead of user deposit in K
            setcapitalAhead(parseInt(res.capital_ahead ?? 0) / 1000_000_000)
            //set user closest deposit in K
            if (res.deposit !== undefined) {
              setuserclosestDeposit(parseInt(res.deposit.amount ?? 0) / 1_000_000)
            } else {  
              //use TVL if no deposit        
              setuserclosestDeposit(TVL)
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
              setPopupMsg("Withdrew " + omnidepositAmount + " CDT")
              //set user tvl
              setuserTVL(tvl)
            } else {              
              setPopupMsg("Unstaked " + omnidepositAmount + " CDT")
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

  const getSPTVL = async () => {
    try {
      //Query total deposits
      await sp_queryClient?.assetPool({
        depositLimit: 0,
      }).then((res) => {
        //set TVL in Ms
        setTVL(parseFloat((parseInt(res.credit_asset.amount) / 1000_000_000).toFixed(2)))
      })
    } catch (error) {
      console.log(error)
    }

    //User specific
    try {      
      var tvl = 0;      
      //Query user's total deposit
      await sp_queryClient?.assetPool({
        user: address ?? "",
      }).then((res) => {
        console.log(res)
        //Calc user tvl
        for (let i = 0; i < res.deposits.length; i++) {
          tvl += parseInt(res.deposits[i].amount) / 1_000_000;
        }
        //set user tvl
        setuserTVL(tvl)
      })

      //Query capital ahead of user deposit
      await sp_queryClient?.capitalAheadOfDeposit({
        user: address ?? "",
      }).then((res) => {
        //set capital ahead of user deposit in K
        //@ts-ignore
        setcapitalAhead(parseInt(res[0]?.capital_ahead ?? 0) / 1000_000_000)
        //set user closest deposit in K
        if (res.deposit !== undefined) {
          setuserclosestDeposit(parseInt(res.deposit.amount ?? 0) / 1_000_000)
        } else {  
          //use TVL if no deposit        
          setuserclosestDeposit(tvl)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleStabilityClaim = async () => {
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
  const getSPclaimables = async () => {
    var claims = "";
    //Claimable Liquidations
    try {
      await sp_queryClient?.userClaims({
        user: address ?? "",
      }).then((res) => {
        console.log(res)

        //add SP claimables
        for (let i = 0; i < res.claims.length; i++) {
          console.log(res.claims)
          switch (res.claims[i].denom) {
            case denoms.osmo: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " OSMO, "
              break;
            }
            case denoms.atom: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " ATOM, "
              break;
            }
            case denoms.axlUSDC: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " axlUSDC, "
              break;
            }
            case denoms.atomosmo_pool: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " ATOM-OSMO LP, "
              break;
            }
            case denoms.osmousdc_pool: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " OSMO-axlUSDC LP, "
              break;
            }
          }
        }
      })
    } catch (error) {
      console.log(error)
    }

    //Incentives
    try {
      await sp_queryClient?.unclaimedIncentives({
        user: address ?? "",
      }).then((res) => {
        //add SP incentives
        if (parseInt(res)/1_000_000 < 1) {
          claims += parseInt(res)/1_000_000 + " MBRN, "
        }
        
      })
    } catch (error) {
      console.log(error)
    }

    if (claims === "") {
      claims = "No Claims"
    }    
    setSPclaimables(claims)
  }
  //Get leading unstaking deposit from the SP for the user
  const getunstakingSP = async () => {
    try {
      await sp_queryClient?.assetPool({
        user: address ?? "",
      }).then((res) => {
        //Check if user has an unstaking deposit
        if (res.deposits.length > 0) {
          for (let i = 0; i < res.deposits.length; i++) {
            if (res.deposits[i].unstake_time !== null && res.deposits[i].unstake_time !== undefined) {
              //Get block time
              var current_time = 0; 
              liq_queueClient?.client.getBlock().then( (block) => {
                current_time = Date.parse(block.header.time)
              })
              var unstake_time_left_seconds = res.deposits[i].unstake_time? - current_time : 0;
              //Format tooltip
              setunstakingMsg("You have an unstaking deposit of " + parseInt(res.deposits[i].amount)/1_000_000 + " CDT finished in " + unstake_time_left_seconds + " seconds")
              break;
            }
          }
        }

      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    console.log(prices)
    switch(menuAsset){
      case "OSMO": {
        if (barGraph[0][0].tvl === "0K" && prices.osmo !== 0) {
          console.log("efe")
          queryQueuesaveHeights(denoms.osmo)
        }
        break;
      }
      case "ATOM": {
        if (barGraph[1][0].tvl === "0K" && prices.atom !== 0) {
          queryQueuesaveHeights(denoms.atom)
        }
        break;
      }
      case "axlUSDC": {
        if (barGraph[2][0].tvl === "0K" && prices.axlUSDC !== 0) {
          queryQueuesaveHeights(denoms.axlUSDC)
        }
        break;
      }
      case "ATOM-OSMO": {
        if (barGraph[3][0].tvl === "0K" && prices.atomosmo_pool !== 0) {
          queryQueuesaveHeights(denoms.atomosmo_pool)
        }
        break;
      }
      case "OSMO-axlUSDC": {
        if (barGraph[4][0].tvl === "0K" && prices.osmousdc_pool !== 0) {
          queryQueuesaveHeights(denoms.osmousdc_pool)
        }
        break;
      }
    }
    //Set LQ claimables
    if (lqClaimables.display === "" || lqClaimables.display === "No Claims"){
      setqueueClaimables()
    }

    //Set SP claimables
    getSPclaimables()
    //Set SP TVL
    getSPTVL()
    //Check for unstaking positions
    getunstakingSP()

  }, [menuAsset, prices, address, queryClient, liq_queueClient, sp_queryClient, sp_client, cdp_queryClient])

  return (
    <div className="fullHeight" style={{overflow:"hidden"}}>
    <div className="row ">
    <div className="col shiftRight">
    <div className="liquidation-pools">
    <h1 className="pagetitle">Liquidation Pools</h1>
        <div className="singleassetframe">
          <h3 className="pool-titles">SINGLE ASSET</h3>
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
            <button onClick={handleOpen}>{menuAsset}</button>
            {open ? (
                <ul className="menu">
                {menuAsset !== "ATOM" ? (<li className="menu-item">
                    <button onClick={handleMenuOne}>ATOM</button>
                </li>) : null}
                {menuAsset !== "axlUSDC" ? (<li className="menu-item">
                    <button onClick={handleMenuTwo}>axlUSDC</button>
                </li>) : null}
                {menuAsset !== "OSMO" ? (<li className="menu-item">
                    <button onClick={handleMenuThree}>OSMO</button>
                </li>) : null}
                {menuAsset !== "ATOM-OSMO" ? (<li className="menu-item">
                    <button onClick={handleMenuFour}>ATOM-OSMO</button>
                </li>) : null}
                {menuAsset !== "OSMO-axlUSDC" ? (<li className="menu-item">
                    <button onClick={handleMenuFive}>OSMO-axlUSDC</button>
                </li>) : null}
                </ul>
            ) : null}
          </div>
          <div className="collateral-tvl-label">TVL as Collateral: {collateralTVL}K</div>
          <div className="highest-tvl-bar-label" style={{top: (344 - barGraph[barIndex][highestBar[barIndex]].height), left: 42 + ((highestBar[barIndex]) * 33)}}>{barGraph[barIndex][highestBar[barIndex]].tvl}</div>
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
          <div className="pool-subtitle">1 day unstaking</div>
          <div className="captial-ahead-box" />
          <div className="user-tvl-box" />
          <div className="user-tvl-label" data-descr={"Closest TVL: "+userclosestDeposit+", Total TVL: "+userTVL}>{userclosestDeposit /1000}K</div>
          <div className="captial-ahead-label" data-descr="Capital ahead of you">{capitalAhead}K</div>
          <div className="x-axis1" />
          <div className="total-tvl-label">TVL: {TVL}K</div>
          <Image className="tvl-container-icon" width={253} height={236} alt="" src="/images/tvl_container.svg" />
          <div className="premium">10%</div>
          <form>
            <input className="omni-deposit-amount" name="amount" value={omnidepositAmount} type="number" onChange={handlesetomnidAmount}/>
            <button className="btn buttons deposit-button-omni" onClick={handleStabilityDeposit}  type="button">
              <div className="deposit-button-label" onClick={handleStabilityDeposit}>
                <span tabIndex={0} style={{cursor:"pointer"}} data-descr="NOTE: Funds can be used to liquidate during the 1 day unstaking">Deposit:</span>
              </div>
            </button>
            <input className="omni-withdraw-amount" name="amount" value={omniwithdrawAmount}  type="number" onChange={handlesetomniwAmount}/>
            <button className="btn buttons withdraw-button-omni" onClick={handleStabilityWithdraw}  type="button">
              <div className="withdraw-button-label" onClick={handleStabilityWithdraw}>
              {(unstakingMsg !== "") ? (
                <span tabIndex={0} data-descr={unstakingMsg}>Withdraw:</span>
              ) : <>Withdraw:</>}
              </div>
            </button>
          </form> 
          <a className="btn buttons claim-button" onClick={handleStabilityClaim}>
            <p tabIndex={0} data-descr={SPclaimables} style={{color: "black"}} onClick={handleStabilityClaim}>Claim</p>
          </a>
          <Image
            width={82} height={145} 
            className="water-drops-deco-icon"
            alt=""
            src="/images/Water_drops_deco.svg"
          />
        </div>
        <Image className="titleicon" width={45} height={45} alt="" src="/images/liquidation_pool.svg" />
        <div className="middleborder" />
      </div>
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </div>
    </div>
    </div>
  );
};

export default LiquidationPools;