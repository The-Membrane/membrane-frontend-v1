import React from "react";
import { useRouter } from 'next/router';

import { Coin, coin, coins } from "@cosmjs/amino";
import { calcAmountWithSlippage } from "@osmonauts/math";
import { osmosis } from 'osmojs';


import Dashboard from './Dashboard';
import { useEffect, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import LiquidationPools from './Liquidations';
import Lockdrop from './Lockdrop';
import Governance, { Delegation, Delegator, EmissionsSchedule, UserClaims, UserStake } from './Governance';
import { ProposalList } from "../components/governance/ProposalPane";
import Positions, { CollateralAssets, ContractInfo, DefinedCollateralAssets, getRataLTV } from './Vaults';
import { useClients, useQueryClients } from '../hooks/use-clients';
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import Popup from "../components/Popup";
import Hotjar from '@hotjar/browser';
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Basket, CollateralInterestResponse, InterestResponse, NativeToken, PositionResponse, RedeemabilityResponse } from "../codegen/positions/Positions.types";
import { ClaimsResponse } from "../codegen/liquidation_queue/LiquidationQueue.types";
import { Config, ProposalResponse } from "../codegen/governance/Governance.types";
import { cdtRoutes, delegateList, denoms, quadraticVoting, skipProposals } from "../config";
import { SwapAmountInRoute } from "osmojs/dist/codegen/osmosis/poolmanager/v1beta1/swap_route";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Box } from "@chakra-ui/react";


export const SECONDS_PER_DAY = 86400;
export const BLOCK_TIME_IN_SECONDS = 6;
export const unstakingPeriod = 4; //days
const SWAP_SLIPPAGE = 0.5; //0.5% slippage

const {
  joinPool,
  exitPool,
  exitSwapExternAmountOut,
  exitSwapShareAmountIn,
  joinSwapExternAmountIn,
  joinSwapShareAmountOut,
  swapExactAmountIn,
  swapExactAmountOut
} = osmosis.gamm.v1beta1.MessageComposer.withTypeUrl;

export interface Prices {
  osmo: number,
  atom: number,
  axlUSDC: number,
  atomosmo_pool: number,
  osmousdc_pool: number,
  usdc: number,
  stAtom: number,
  stOsmo: number,
  tia: number,
  usdt: number,
  cdt: number,
}

export interface swapRoutes {
  osmo: SwapAmountInRoute[],
  atom: SwapAmountInRoute[],
  axlUSDC: SwapAmountInRoute[],
  usdc: SwapAmountInRoute[],
  stAtom: SwapAmountInRoute[],
  stOsmo: SwapAmountInRoute[],
  tia: SwapAmountInRoute[],
  usdt: SwapAmountInRoute[],
}

export default function Home() {

  const siteId = 3709543;
  const hotjarVersion = 6;

  const [activeComponent, setActiveComponent] = useState('vault');
  
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(true);
  const [popupMsg, setPopupMsg] = useState<ReactJSXElement>(<Box mt={5}>EXITING THIS POP-UP IS ACKNOWLEDGEMENT OF & AGREEMENT TO THE FOLLOWING: This is experimental technology which may or may not be allowed in certain jurisdictions in the past/present/future, and it’s up to you to determine & accept all liability of use. This interface is for an externally deployed codebase that you are expected to do independent research for, for any additional understanding.</Box>);
  const [popupStatus, setPopupStatus] = useState("User Agreement");
  
  //Get Clients
  const { cdp_client, launch_client, liq_queue_client, stability_pool_client, governance_client, staking_client, vesting_client, base_client, address } = useClients();
  const { cdpqueryClient, launchqueryClient, liqqueuequeryClient, stabilitypoolqueryClient, governancequeryClient, stakingqueryClient, oraclequeryClient } = useQueryClients();
  
  //Set Prices
  const [prices, setPrices] = useState<Prices>({
    osmo: 0,
    atom: 0,
    axlUSDC: 0,
    atomosmo_pool: 0,
    osmousdc_pool: 0,
    usdc: 0,
    stAtom: 0,
    stOsmo: 0,
    tia: 0,
    usdt: 0,
    cdt: 0,
  });
  const [rateRes, setrateRes] = useState<CollateralInterestResponse>();
  const [creditRateRes, setcreditRateRes] = useState<InterestResponse>();
  const [basketRes, setbasketRes] = useState<Basket>();
  const [walletCDT, setwalletCDT] = useState<number | undefined>(undefined);
  const [walletMBRN, setwalletMBRN] = useState<number | undefined>(undefined);
  const [inLaunch, setinLaunch] = useState<boolean | undefined>(undefined);
  const [riskyPositions, setriskyPositions] = useState<[string, number, PositionResponse][]>([]);

  ////Positions////
  //This is used to keep track of what asses the user has in the contract
  //bc the input/output asset quantities are updated in responsive to the user's actions    
  const [contractQTYs, setcontractQTYs] = useState<ContractInfo>({
    osmo: 0,
    atom: 0,
    axlusdc: 0,
    usdc: 0,
    stAtom: 0,
    stOsmo: 0,
    tia: 0,
    usdt: 0,
    atomosmo_pool: "0",
    osmousdc_pool: "0",
    brw_LTV: 0,
    max_LTV: 0,
    cost: 0,
    sliderValue: 0,
  });
  const [walletQTYs, setwalletQTYs] = useState<CollateralAssets>({
    osmo: undefined,
    atom: undefined,
    axlusdc: undefined,
    usdc: undefined,
    stAtom: undefined,
    stOsmo: undefined,
    tia: undefined,
    usdt: undefined,
    atomosmo_pool: undefined,
    osmousdc_pool: undefined,
  });
  const [walletChecked, setwalletChecked] = useState<boolean>(false);
  const [positionChecked, setpositionChecked] = useState<boolean>(false);
  //Asset specific
  //qty
  const [positionQTYs, setpositionQTYs] = useState<DefinedCollateralAssets>({
    osmo: 0,
    atom: 0,
    axlusdc: 0,
    usdc: 0,
    stAtom: 0,
    stOsmo: 0,
    tia: 0,
    usdt: 0,
    atomosmo_pool: "0",
    osmousdc_pool: "0",
  });
  //Positions Visual
  const [debtAmount, setdebtAmount] = useState(0);
  const [maxLTV, setmaxLTV] = useState(100);
  const [brwLTV, setbrwLTV] = useState(0);
  const [cost, setCost] = useState(0);
  const [positionID, setpositionID] = useState("0");
  const [user_address, setAddress] = useState("");
  const [sliderValue, setsliderValue] = useState(0);
  const [creditPrice, setcreditPrice] = useState(0);

  //Query prices
  const queryPrices = async () => {        
    try {
        await oraclequeryClient?.prices({
            assetInfos: [
                {
                    native_token: {
                        denom: denoms.osmo
                    }
                },
                {
                    native_token: {
                        denom: denoms.atom
                    }
                },
                {
                    native_token: {
                        denom: denoms.axlUSDC
                    }
                },
                {
                    native_token: {
                        denom: denoms.atomosmo_pool
                    }
                },
                {
                    native_token: {
                        denom: denoms.osmousdc_pool
                    }
                },
                {
                    native_token: {
                        denom: denoms.usdc
                    }
                },
                {
                    native_token: {
                        denom: denoms.stAtom
                    }
                },
                {
                    native_token: {
                        denom: denoms.stOsmo
                    }
                },
                {
                    native_token: {
                        denom: denoms.tia
                    }
                },
                {
                    native_token: {
                        denom: denoms.usdt
                    }
                },
                {
                    native_token: {
                        denom: denoms.cdt
                    }
                }

            ],
            oracleTimeLimit: 10,
            twapTimeframe: 0,
        }).then((res) => {
            setPrices({
                osmo: parseFloat(res[0].price),
                atom: parseFloat(res[1].price), 
                axlUSDC: parseFloat(res[2].price),
                atomosmo_pool: parseFloat(res[3].price),
                osmousdc_pool: parseFloat(res[4].price),
                usdc: parseFloat(res[5].price),
                stAtom: parseFloat(res[6].price),
                stOsmo: parseFloat(res[7].price),
                tia: parseFloat(res[8].price),
                usdt: parseFloat(res[9].price),
                cdt: parseFloat(res[10].price),
            })
        })
    } catch (error) {
        console.log(error)
    }
  }

  const fetch_update_positionData = async () => {
    //blank ContractInfo
    var contract_info: ContractInfo = {
      osmo: 0,
      atom: 0,
      axlusdc: 0,
      atomosmo_pool: "0",
      osmousdc_pool: "0",
      usdc: 0,
      stAtom: 0,
      stOsmo: 0,
      tia: 0,
      usdt: 0,
      brw_LTV: 0,
      max_LTV: 0,
      cost: 0,
      sliderValue: 0,
    };
    //Query for position data
    try {
        //getBasket
        const basketRes = await cdpqueryClient?.getBasket();
        setbasketRes(basketRes as Basket);        
        //query rates
        const rateRes = await cdpqueryClient?.getCollateralInterest();
        setrateRes(rateRes as CollateralInterestResponse);
        const creditRateRes = await cdpqueryClient?.getCreditRate();
        setcreditRateRes(creditRateRes as InterestResponse);

        //getPosition
        const userRes = await cdpqueryClient?.getBasketPositions(
            {
                user: address as string,
            }
        );

        //Set state
        if (userRes != undefined && address != undefined){
          setpositionChecked(true)
            //setPositionID
            //@ts-ignore
            setpositionID(userRes[0].positions[0].position_id)
            //Set debtAmount
            var debt_amount = parseInt(userRes[0].positions[0].credit_amount);
            setdebtAmount(debt_amount);
            setsliderValue(debt_amount/1000000);
            contract_info.sliderValue = debt_amount/1000000;
            //setLTVs
            //@ts-ignore
            setmaxLTV(parseFloat(userRes[0].positions[0].avg_max_LTV) * +100)
            contract_info.max_LTV = (parseFloat(userRes[0].positions[0].avg_max_LTV) * +100);
            //@ts-ignore
            setbrwLTV(parseFloat(userRes[0].positions[0].avg_borrow_LTV) * +100)
            contract_info.brw_LTV = (parseFloat(userRes[0].positions[0].avg_borrow_LTV) * +100);            
            
            //setAssetQTYs
            var position_qtys: DefinedCollateralAssets = {
                osmo: 0,
                atom: 0,
                axlusdc: 0,
                usdc: 0,
                stAtom: 0,
                stOsmo: 0,
                tia: 0,
                usdt: 0,
                atomosmo_pool: "0",
                osmousdc_pool: "0",
            };
            //@ts-ignore
            userRes[0].positions[0].collateral_assets.forEach(asset => {
                // @ts-ignore
                var actual_asset = asset.asset.info.native_token.denom;

                if (actual_asset === denoms.osmo) {
                  position_qtys.osmo = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.osmo = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.atom) {
                  position_qtys.atom = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.atom = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.axlUSDC) {
                  position_qtys.axlusdc = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.axlusdc = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.atomosmo_pool) {
                  position_qtys.atomosmo_pool = (BigInt(asset.asset.amount)/1_000_000_000_000_000_000n).toString();
                  contract_info.atomosmo_pool = (BigInt(asset.asset.amount)/1_000_000_000_000_000_000n).toString();
                } else if (actual_asset === denoms.osmousdc_pool) {
                  position_qtys.osmousdc_pool = (BigInt(asset.asset.amount)/1_000_000_000_000_000_000n).toString();
                  contract_info.osmousdc_pool = (BigInt(asset.asset.amount)/1_000_000_000_000_000_000n).toString();
                } else if (actual_asset === denoms.usdc) {
                  position_qtys.usdc = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.usdc = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.stAtom) {
                  position_qtys.stAtom = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.stAtom = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.stOsmo) {
                  position_qtys.stOsmo = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.stOsmo = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.tia) {
                  position_qtys.tia = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.tia = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.usdt) {
                  position_qtys.usdt = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.usdt = parseInt(asset.asset.amount) / 1_000_000;
                }
            })
            setpositionQTYs(position_qtys);

            if (basketRes != undefined){
                
              //calc Debt
              //@ts-ignore
              setcreditPrice(parseFloat(basketRes.credit_price.price))
            }
        }
        setcontractQTYs(contract_info);
    } catch (error) {
        const e = error as { message: string }
        console.log(e.message)
        if (e.message.includes("No User Positions")){
          setpositionChecked(true)
        }
    }
  };

  //Liquidation Page state
  interface LQClaims {
    display: string;
    bidFor: string[];
  }
  const [lqClaimables, setlqClaimables] = useState<LQClaims>({
    display: "",
    bidFor: [""],
  });
  const [capitalAhead, setcapitalAhead] = useState(0);
  const [userclosestDeposit, setuserclosestDeposit] = useState(0);
  const [userTVL, setuserTVL] = useState(0);
  const [spTVL, setspTVL] = useState(0);
  const [SPclaimables, setSPclaimables] = useState("");
  const [unstakingMsg, setunstakingMsg] = useState("");

  const setqueueClaimables = async () => {
    try {
      await liqqueuequeryClient?.userClaims({
        user: address as string ?? "",
      }).then((res) => {
        let resp = res as ClaimsResponse[];
        let new_display = "";
        let new_bidFor: string[] = [];

        //Add claims from each response
        for (let i = 0; i < resp.length; i++) {
          let asset_claims = parseInt(resp[i].pending_liquidated_collateral) / 1_000_000; //Remove native token decimals
          
          if (asset_claims > 0) {           
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
              case denoms.usdc: {
                new_display += asset_claims + " USDC, ";
                break;
              }
              case denoms.stAtom: {
                new_display += asset_claims + " stATOM, ";
                break;
              }
              case denoms.stOsmo: {
                new_display += asset_claims + " stOSMO, ";
                break;
              }
              case denoms.tia: {
                new_display += asset_claims + " TIA, ";
                break;
              }
              case denoms.usdt: {
                new_display += asset_claims + " USDT, ";
                break;
              }
              case denoms.atomosmo_pool: {
                new_display += (asset_claims/1_000000_000000) + " ATOM-OSMO LP, ";
                break;
              }
              case denoms.osmousdc_pool: {
                new_display += (asset_claims/1_000000_000000) + " OSMO-axlUSDC LP, ";
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
  const getSPclaimables = async () => {
    var claims = "";
    //Claimable Liquidations
    try {
      await stabilitypoolqueryClient?.userClaims({
        user: address as string ?? "",
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
            case denoms.usdc: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " USDC, "
              break;
            }
            case denoms.stAtom: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " stATOM, "
              break;
            }
            case denoms.stOsmo: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " stOSMO, "
              break;
            }
            case denoms.tia: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " TIA, "
              break;
            }
            case denoms.usdt: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " USDT, "
              break;
            }
            case denoms.atomosmo_pool: {
              claims += parseInt(res.claims[i].amount)/1_000_000_000_000_000_000 + " ATOM-OSMO LP, "
              break;
            }
            case denoms.osmousdc_pool: {
              claims += parseInt(res.claims[i].amount)/1_000_000_000_000_000_000 + " OSMO-axlUSDC LP, "
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
      await stabilitypoolqueryClient?.unclaimedIncentives({
        user: address as string ?? "",
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
      await stabilitypoolqueryClient?.assetPool({
        user: address as string ?? "",
      }).then((res) => {
        //Check if user has an unstaking deposit
        if (res.deposits.length > 0) {
          var got_first_unstaking = false;
          var total_unstaking_deposits = 0;
          for (let i = 0; i < res.deposits.length; i++) {
            if (res.deposits[i].unstake_time !== null && res.deposits[i].unstake_time !== undefined) {
              if (!got_first_unstaking){                  
                //Get block time
                var current_time = 0; 
                liq_queue_client?.client.getBlock().then( (block) => {
                  current_time = Date.parse(block.header.time)
                })
                var unstake_time_left_seconds = res.deposits[i].unstake_time? - current_time : 0;
                //Format tooltip
                setunstakingMsg(parseInt(res.deposits[i].amount)/1_000_000 + " CDT finishing in " + unstake_time_left_seconds + " seconds")
              }
              //Otherwise just count number of unstaking deposits
              total_unstaking_deposits += 1;
              
              got_first_unstaking = true;
            }
          }
          //Update msg with unstaking deposit total
          setunstakingMsg(prevState => {
            return "You have " +total_unstaking_deposits+" unstaking deposit(s), the first of which is " + prevState
          })
        }

      })
    } catch (error) {
      console.log(error)
    }
  }
  const getSPTVL = async () => {
    try {
      //Query total deposits
      await stabilitypoolqueryClient?.assetPool({
        depositLimit: 0,
      }).then((res) => {
        //set TVL
        setspTVL((parseInt(res.credit_asset.amount) / 1_000_000))
      })
    } catch (error) {
      console.log(error)
    }

    //User specific
    try {      
      var tvl = 0;      
      //Query user's total deposit
      await stabilitypoolqueryClient?.assetPool({
        user: address as string ?? "",
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
      await stabilitypoolqueryClient?.capitalAheadOfDeposit({
        user: address as string ?? "",
      }).then((res) => {
        //set capital ahead of user deposit
        //@ts-ignore
        setcapitalAhead(parseInt(res[0]?.capital_ahead ?? 0) / 1_000_000)
        //set user closest deposit
        if (res.deposit !== undefined) {
          setuserclosestDeposit(parseInt(res.deposit.amount ?? 0) / 1_000_000)
        } else {  
          //set to 0 if no deposit        
          setuserclosestDeposit(0)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  ///Governance state and functions///
  const [delegations, setDelegations] = useState<Delegation[]>([
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }
  ]);
  const [delegators, setDelegators] = useState<Delegator[]>([
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }
  ]);
  const [quorum, setQuorum] = useState(0);
  //Proposal, Days left, Current Status, Quorum 
  const [proposals, setProposals] = useState<ProposalList>({
    active: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
    pending: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
    completed: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
    executed: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
});
  const [userVP, setuserVP] = useState({
    userStake: 0,
    userDelegations: 0,
  });
  //Staking//
  //Emissions Schedule
  const [emissionsSchedule, setEmissionsSchedule] = useState<EmissionsSchedule>({
    rate: 0,
    monthsLeft: 0,
  })
  const [userStake, setUserStake] = useState<UserStake>({
    staked: 0,
    unstaking_total: 0,
    unstaking: {
      amount: 0,
      timeLeft: 0,
    },
  });
  const [userClaims, setuserClaims] = useState<UserClaims>({
    mbrnClaims: 0,
    cdtClaims: 0,
  });
  const [maxCommission, setmaxCommission] = useState(0);
  //Delegations
  
  const getDelegations = async () => {
    try {
      await stakingqueryClient?.delegations({
        user: address as string ?? undefined,
      }).then( async (res) => {
        var delegationVP = 0;
        var delegatedStake = 0;

        if (res.length > 0) {
          //Set delegation state for the listed delegates
          delegateList.forEach((delegate, index) => {
            let delegate_index = res[0].delegation_info.delegated_to.findIndex((delegate) => { delegate.delegate === delegateList[index].address});
            if (delegate_index !== -1) {
              delegations[index].amount = parseInt(res[0].delegation_info.delegated_to[delegate_index].amount)
              delegations[index].fluid = res[0].delegation_info.delegated_to[delegate_index].fluidity
              //Remove delegate from list
              delegateList.splice(index, 1);
            }
            delegations[index].delegator = delegate.name;
          })
          console.log(delegations)

          //Set delegations
          //We add the delegateList length bc we are going to remove them from the list
          for (let i = 0; i < res[0].delegation_info.delegated_to.length; i++) {
            //Set delegations if within the list length of 8
            let index = i + delegateList.length;
            if (index < 8) {
              delegations[index].amount = parseInt(res[index].delegation_info.delegated_to[index].amount)
              delegations[index].delegator = res[index].delegation_info.delegated_to[index].delegate.slice(13) + '...';
              delegations[index].fluid = res[index].delegation_info.delegated_to[index].fluidity
              
              //Query and set commission
              await stakingqueryClient?.delegations({
                user: res[index].delegation_info.delegated_to[index].delegate,
              }).then((res) => {
                delegations[index].commission = parseInt(res[0].delegation_info.commission) * 100 //Commission is a % so multiply by 100
              })
              //////Move this to query when clicking on a delegate//////
            }
            //Subtract from user VP
            if (res[index].delegation_info.delegated_to[index].voting_power_delegation === true) {
              delegatedStake += parseInt(res[index].delegation_info.delegated_to[index].amount)
            }
          }
          
          //Set Delegators
          for (let i = 0; i < res[0].delegation_info.delegated.length; i++) {          
            //Add to user total VP
            if (res[i].delegation_info.delegated[i].voting_power_delegation === true) {
              if (quadraticVoting === true){
                delegationVP += Math.sqrt(parseInt(res[i].delegation_info.delegated[i].amount))            
              } else {              
                delegationVP += parseInt(res[i].delegation_info.delegated_to[i].amount)
              }
            }          
            //Add to user VP
            setuserVP(prevState => {
              return {
                userStake: prevState.userStake - delegatedStake,
                userDelegations: delegationVP,
              }
            })
          }
        } else {          
          //Set delegation state for the listed delegates
          delegateList.forEach((delegate, index) => {
            delegations[index].amount = 0;
            delegations[index].fluid = true;            
            delegations[index].delegator = delegate.name;
          })
        }
        //Set delegations
        setDelegations(delegations)
      })

    } catch (error) {
      console.log(error)
      //Set delegateList even though the VP amounts are not set
      delegateList.forEach((delegate, index) => {
        delegations[index].amount = 0;
        delegations[index].fluid = true;
        delegations[index].delegator = delegate.name;
      })
      //Set delegations
      setDelegations(delegations)
    }
  }
  
  const getuserClaims = async () => {
    try {
      await stakingqueryClient?.userRewards({
        user: address as string ?? "",
      }).then((res) => {
        console.log(res)
        //Set user claims
        for (let i = 0; i < res.claimables.length; i++) {
          if("denom" in res.claimables[i].info) {
            if ((res.claimables[i].info as unknown as NativeToken).denom === denoms.cdt) {
              setuserClaims(prevState => {
                return {
                  ...prevState,
                  cdtClaims: parseInt(res.claimables[i].amount) / 1_000_000,
                }
              })
            }
          }
        }
        //Set MBRN claims
        setuserClaims(prevState => {
          return {
            ...prevState,
            mbrnClaims: parseInt(res.accrued_interest) / 1_000_000,
          }
        })
      })
    } catch (error) {
      console.log(error)
    }
  }
  
  //Get user staked & unstaking MBRN
  const getUserStake = async () => {
    // await stakingqueryClient?.staked({
    //   limit: 1024,
    //   unstaking: false,
    // }).then((res) => {
    //   console.log(res.stakers.length)
    // })
    try {
      await stakingqueryClient?.userStake({
        staker: address as string ?? "",
      }).then((res) => {
        //Get staking total & closest unstaking deposit
        var stakingTotal = 0;
        var unstakingTotal = 0;
        var closestUnstakingDeposit = 0;
        var closestUnstakingDepositTime = 0;
        console.log(res.deposit_list)
        for (let i = 0; i < res.deposit_list.length; i++) {
          if (res.deposit_list[i].unstake_start_time === null || res.deposit_list[i].unstake_start_time === undefined) {
            stakingTotal += parseInt(res.deposit_list[i].amount)
          } else {
            if (closestUnstakingDepositTime === 0){
              closestUnstakingDepositTime = res.deposit_list[i].unstake_start_time ?? 0
              closestUnstakingDeposit = parseInt(res.deposit_list[i].amount)
            } else if ((res.deposit_list[i].unstake_start_time ?? 0) < closestUnstakingDepositTime) {
              closestUnstakingDepositTime = res.deposit_list[i].unstake_start_time ?? 0
              closestUnstakingDeposit = parseInt(res.deposit_list[i].amount)
            }
            unstakingTotal += parseInt(res.deposit_list[i].amount)
          }
        }
        //Set stake
        setUserStake(prevState => {
          return {
            staked: stakingTotal,
            unstaking_total: unstakingTotal,
            unstaking: {
              amount: closestUnstakingDeposit,
              timeLeft: unstakingPeriod,
            },
          }
        })
        //Calc time left to unstake
        var currentTime = 0;
        staking_client?.client.getBlock().then( (block) => {
          currentTime = Date.parse(block.header.time) / 1000;
          var secondsLeft = Math.max(closestUnstakingDepositTime - currentTime, 0);
          var daysLeft = secondsLeft / SECONDS_PER_DAY;
          //Set user stake
          setUserStake(prevState => {
            return {              
              staked: stakingTotal,
              unstaking_total: unstakingTotal,
              unstaking: {
                amount: closestUnstakingDeposit,
                timeLeft: daysLeft,
              },
            }
          })
        })

        //Set user VP
        setuserVP(prevState => {
          return {
            userStake: prevState.userStake + stakingTotal,
            userDelegations: prevState.userDelegations,
          }
        })
      })
    } catch (error) {
      console.log(error)
    }
  }  
  //Get emissions schedule
  const getEmissionsSchedule = async () => {
    try {
      //Get emissions schedule
      await stakingqueryClient?.incentiveSchedule()
      .then(async (res) => {
        //Set emissions schedule
        setEmissionsSchedule({
          rate: parseFloat(res.ownership_distribution.rate) * 100,
          monthsLeft: ((Date.parse("6/2/2024")/1000) - (Date.now() / 1000)) / (SECONDS_PER_DAY * 30),
        })
        //Get block time
        staking_client?.client.getBlock().then((block) => {
          let start_in_seconds = res.start_time;
          let durations_in_seconds = res.ownership_distribution.duration * SECONDS_PER_DAY;
          //Calc months left
          let seconds_left = (start_in_seconds + durations_in_seconds) - (Date.parse(block.header.time) / 1000);
          //Seconds to months
          let monthsLeft = seconds_left / (SECONDS_PER_DAY * 30);
          //Set emissions schedule
          setEmissionsSchedule({
            rate: parseInt(res.ownership_distribution.rate),
            monthsLeft: monthsLeft,
          })
        })

      })
    } catch (error) {
      console.log(error)
    }
  }
  //Get staking max commission
  const getStakingCommission = async () => {
    try {
      await stakingqueryClient?.config()
      .then((res) => {
        setmaxCommission(parseInt(res.max_commission_rate))
      })
    } catch (error) {
      console.log(error)
    }
  }

  //This won't work with muliple proposals of separate types since it sets based on the length of the array
  //We'd need to sort the proposal list by status beforehand
  const getProposals = async () => {
    try {
      //Query Gov config
      await governancequeryClient?.config().then(async (config_res) => {        
        //Set quorum from config
        setQuorum(parseFloat(config_res.proposal_required_quorum))
        //Get active
        await governancequeryClient?.activeProposals({ start: 19, limit: 32 })
        .then(async (res) => {
          //Sort then Set active, completed & executed
          var active_proposals = res.proposal_list.filter(proposal => proposal.status === "active" && !skipProposals.includes(proposal.proposal_id));
          var completed_proposals = res.proposal_list.filter(proposal => proposal.status === "passed" || proposal.status === "rejected" || proposal.status === "amendment_desired" || proposal.status === "expired");
          var executed_proposals = res.proposal_list.filter(proposal => proposal.status === "executed");

          console.log(active_proposals)
          // console.log(completed_proposals)
          // console.log(executed_proposals)
          //Active
          for (let i = 0; i < active_proposals.length; i++) {
            let proposal = active_proposals[i];
            // if (skipProposals.includes(proposal.proposal_id)) {
            //   skipped += 1;
            //   continue
            // }
              if (proposals.active[7][0] === undefined){                              
                //Query total voting power
                await governancequeryClient?.totalVotingPower({
                  proposalId: parseInt(proposal.proposal_id)
                }).then( async (vp_res) => {
                  //Set total voting power
                  var totalVotingPower = parseInt(vp_res);
                  //Calc aligned power
                  //Sqrt_Root it if necessary
                  var aligned_power = parseInt(proposal.aligned_power);
                  if (config_res.quadratic_voting === true){
                    if (aligned_power > 1000000000){
                      aligned_power -= 1000000000;
                      aligned_power += Math.sqrt(1000000000);
                    }
                  }
                  //Calc quorum
                  var quorum = (parseInt(proposal.against_power) + parseInt(proposal.for_power) + aligned_power + parseInt(proposal.amendment_power) + parseInt(proposal.removal_power)) / totalVotingPower;
                  //Get current result
                  let current_result = getProposalResult(parseInt(proposal.for_power), parseInt(proposal.amendment_power), parseInt(proposal.removal_power), parseInt(proposal.against_power), config_res, (proposal.messages !== undefined))
                  //Update active
                  proposals.active[i] = [proposal, 0, current_result, quorum] as [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined];                })
              }               
            }
            console.log(proposals.active)
            //Set Active proposals
            setProposals(prevState => {
              return {
                ...prevState,
                active: proposals.active,
              }
            })  
            
            //Executed
            for (let i = 0; i < executed_proposals.length; i++) {
              let proposal = executed_proposals[i];
              if (skipProposals.includes(proposal.proposal_id)) {continue}
              if (proposals.executed[7][0] === undefined && proposals.executed[i][0] === undefined){
                //Update executed
                proposals.executed[i] = [proposal, 0, "Executed", 100] as [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined];
              }
            }

            //Set Executed proposals
            setProposals(prevState => {
              return {
                ...prevState,
                executed: proposals.executed,
              }
            })   
            
            //Completed
            for (let i = 0; i < completed_proposals.length; i++) {
              let proposal = completed_proposals[i];
              if (skipProposals.includes(proposal.proposal_id)) {continue}
              if (proposals.completed[7][0] === undefined && proposals.completed[i][0] === undefined){
                //Update completed
                proposals.completed[i] = [proposal, 0, "Completed", 100] as [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined];
              }
            }                         
            //Set Completed proposals
            setProposals(prevState => {
              return {
                ...prevState,
                completed: proposals.completed,
              }
            })   
          
        })
      })

      //Get pending
      await governancequeryClient?.pendingProposals({
        limit: 8,
      })
      .then((res) => {
        //Set pending
        for (let i = 0; i < res.proposal_list.length; i++) {
          let proposal = res.proposal_list[i];
          if (proposals.pending[i][0] === undefined){
            //Push to front
            proposals.pending = ([[proposal, 1, "Pending", 0]] as [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][]).concat(proposals.pending)
            //pop end
            proposals.pending.pop()
          }
        }
        //Set Pending proposals
        setProposals(prevState => {
          return {
            ...prevState,
            pending: proposals.pending,
          }
        })   
      })

    } catch (error) {
      console.log(error)
    }
  }
  
  const getProposalResult = (forVotes: number, amend: number, remove: number, against: number, config: Config, msgs: boolean) => {
    //Calc total votes
    var totalVotes = forVotes + amend + remove + against;
    //Set threshold
    var threshold = parseFloat(config.proposal_required_threshold);
    if (msgs) {
      threshold = 0.50;
    } 
    console.log(forVotes, totalVotes)
    if (forVotes / totalVotes > threshold){
      return "For";
    } else if (amend / totalVotes > threshold){
      return "Amend";
    } else if (remove / totalVotes > threshold) {
      return "Remove";
    } else {
      return "Against";
    }
  }

  function onlyVaultPage(){
    return true;
  }
  
  //Calculate the position value using prices and collateral quantities
  function getPositionValue(position: PositionResponse){
    var position_value = 0;
    //Calc position value
    if (position.collateral_assets.length > 0) {
      position.collateral_assets.forEach((collateral) => {//@ts-ignore   
        if (collateral.asset.info.native_token.denom === denoms.osmo) {
          position_value += prices.osmo * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.atom) {
          position_value += prices.atom * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.axlUSDC) {
          position_value += prices.axlUSDC * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.usdc) {
          position_value += prices.usdc * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.stAtom) {
          position_value += prices.stAtom * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.stOsmo) {
          position_value += prices.stOsmo * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore  
        } else if (collateral.asset.info.native_token.denom === denoms.tia) {
          position_value += prices.tia * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore  
        } else if (collateral.asset.info.native_token.denom === denoms.usdt) {
          position_value += prices.usdt * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore 
        } else if (collateral.asset.info.native_token.denom === denoms.atomosmo_pool) {
          position_value += prices.atomosmo_pool * parseInt(collateral.asset.amount) / 1_000_000_000_000_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.osmousdc_pool) {
          position_value += prices.osmousdc_pool * parseInt(collateral.asset.amount) / 1_000_000_000_000_000_000;//@ts-ignore   
        }
      })
    }  
    return position_value;
  }

  function getPositionLTV(position_value: number, credit_amount: number){
    let debt_value = (credit_amount / 1_000_000) * parseFloat(basketRes?.credit_price.price ?? "1");

    return debt_value / position_value;
  }

  function getPositionQTYs(position: PositionResponse){
    var position_collateral_qtys: DefinedCollateralAssets = {
      osmo: 0,
      atom: 0,
      axlusdc: 0,
      usdc: 0,
      stAtom: 0,
      stOsmo: 0,
      tia: 0,
      usdt: 0,
      atomosmo_pool: "0",
      osmousdc_pool: "0",
    };
    //Set position collateral QTYs
    if (position.collateral_assets.length > 0) {
      position.collateral_assets.forEach((collateral) => {//@ts-ignore   
        if (collateral.asset.info.native_token.denom === denoms.osmo) {
          position_collateral_qtys.osmo = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.atom) {
          position_collateral_qtys.atom = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.axlUSDC) {
          position_collateral_qtys.axlusdc = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.usdc) {
          position_collateral_qtys.usdc = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.stAtom) {
          position_collateral_qtys.stAtom = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.stOsmo) {
          position_collateral_qtys.stOsmo = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.tia) {
          position_collateral_qtys.tia = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.usdt) {
          position_collateral_qtys.usdt = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore
        } else if (collateral.asset.info.native_token.denom === denoms.atomosmo_pool) {
          position_collateral_qtys.atomosmo_pool = (BigInt(collateral.asset.amount)/1_000_000_000_000_000_000n).toString();//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.osmousdc_pool) {
          position_collateral_qtys.osmousdc_pool = (BigInt(collateral.asset.amount)/1_000_000_000_000_000_000n).toString();//@ts-ignore   
        }
      })
    }
    return position_collateral_qtys;
  }

  function nonZeroPrices(){
    return prices.osmo !== 0 || prices.atom !== 0 || prices.axlUSDC !== 0 || prices.usdc !== 0 || prices.stAtom !== 0 || prices.stOsmo !== 0 || prices.tia !== 0 || prices.usdt !== 0 || prices.atomosmo_pool !== 0 || prices.osmousdc_pool !== 0;
  }

 //query positions and add any above 90% LTV to risky positions
 const getRiskyPositions = async () => {
    var riskyPositions = [] as [string, number, PositionResponse][];
    try {
      await cdpqueryClient?.getBasketPositions({
        limit: 1024,
      }).then((res) => {
        //Check if any positions are above 90% LTV
        res.forEach((user) => {
          user.positions.forEach((position) => {
            if ((parseInt(position.credit_amount) != 0) && nonZeroPrices()) {
              //Calc position value
              var position_value = getPositionValue(position);
              //Set position collateral QTYs
              var position_collateral_qtys = getPositionQTYs(position);
              //Get positions max LTV
              var max_LTV = getRataLTV(position_value, position_collateral_qtys, prices, basketRes)[1];
      
              //Check insolvency
              var insolvency = (getPositionLTV(position_value, parseInt(position.credit_amount)) / (max_LTV/100));
              if ((insolvency > 0.95) && (insolvency < Infinity)) {
                riskyPositions.push([user.user, insolvency, position]);
              }
            }
          })
        })   
        setriskyPositions(riskyPositions);
      })
    } catch (error) {
      console.log(error)
    }  
  }

//////Quick Action functions


//This is for CDT using the oracle's prices
const gettokenOutAmount = (tokenInAmount: number, tokenIn: keyof Prices ) => {
  let basePrice = prices[tokenIn]
  let tokenOut = prices.cdt

  return tokenInAmount * (basePrice / tokenOut)

}

//This is getting Swaps To CDT
const handleCDTswaps = async (tokenIn: keyof swapRoutes, tokenInAmount: number) => {
  console.log("swap_attempt")
  //Asserting prices were queried
  if (prices.osmo !== 0) {
    //Get tokenOutAmount
    const tokenOutAmount = gettokenOutAmount(tokenInAmount, tokenIn);
    //Swap routes
    const routes: SwapAmountInRoute[] = cdtRoutes[tokenIn]; 
    
    const tokenOutMinAmount = parseInt(calcAmountWithSlippage(tokenOutAmount.toString(), SWAP_SLIPPAGE)).toString();

    const msg = swapExactAmountIn( {
      sender: address! as string,
      routes,
      tokenIn: coin(tokenInAmount, denoms[tokenIn]),
      tokenOutMinAmount
    });
    
    await base_client?.signAndBroadcast(user_address, [msg], "auto",).then((res) => {console.log(res)});
  }
};

  useEffect(() => {    
    Hotjar.init(siteId, hotjarVersion);
  }, []);

  
  useEffect(() => {

    // handleCDTswaps("osmo", 1000000)
    if (prices.osmo === 0) {
      //Get prices
      queryPrices()
    }
    if (address !== undefined) {
      console.log("here")
      //setAddress
      setAddress(address as string)

      //Get account's balance of CDT
      if (walletCDT === undefined){
        oraclequeryClient?.client.getBalance(address as string, denoms.cdt).then((res) => {
          setwalletCDT(parseInt(res.amount) / 1_000_000);
        })
      }
      if (walletMBRN === undefined){
        //Get account's balance of MBRN
        oraclequeryClient?.client.getBalance(address as string, denoms.mbrn).then((res) => {
          setwalletMBRN(parseInt(res.amount) / 1_000_000);
        })
      }
      //Check if user participated in the lockdrop
      if (inLaunch === undefined){
        launchqueryClient?.userInfo({user: address as string}).then((res) => {
          setinLaunch(true);
        })
      }
      ///Get wallet's available collateral balances
      if (walletQTYs.osmo === undefined || walletQTYs.atom === undefined || walletQTYs.axlusdc === undefined || walletQTYs.usdc === undefined || walletQTYs.atomosmo_pool === undefined || walletQTYs.osmousdc_pool === undefined || walletQTYs.stAtom === undefined || walletQTYs.stOsmo === undefined || walletQTYs.tia === undefined || walletQTYs.usdt === undefined){
        var wallet_qtys: CollateralAssets = {
          osmo: walletQTYs.osmo,
          atom: walletQTYs.atom,
          axlusdc: walletQTYs.axlusdc,
          usdc: walletQTYs.usdc,
          stAtom: walletQTYs.stAtom,
          stOsmo: walletQTYs.stOsmo,
          tia: walletQTYs.tia,
          usdt: walletQTYs.usdt,
          atomosmo_pool: walletQTYs.atomosmo_pool,
          osmousdc_pool: walletQTYs.osmousdc_pool,
        };
        try {
          //Get account's balance of OSMO
          oraclequeryClient?.client.getBalance(address as string, denoms.osmo).then((res) => {
            wallet_qtys.osmo = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of ATOM
          oraclequeryClient?.client.getBalance(address as string, denoms.atom).then((res) => {
            wallet_qtys.atom = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of axlUSDC
          oraclequeryClient?.client.getBalance(address as string, denoms.axlUSDC).then((res) => {
            wallet_qtys.axlusdc = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of USDC
          oraclequeryClient?.client.getBalance(address as string, denoms.usdc).then((res) => {
            wallet_qtys.usdc = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of stATOM
          oraclequeryClient?.client.getBalance(address as string, denoms.stAtom).then((res) => {
            wallet_qtys.stAtom = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of stOSMO
          oraclequeryClient?.client.getBalance(address as string, denoms.stOsmo).then((res) => {
            wallet_qtys.stOsmo = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of TIA
          oraclequeryClient?.client.getBalance(address as string, denoms.tia).then((res) => {
            wallet_qtys.tia = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of USDT
          oraclequeryClient?.client.getBalance(address as string, denoms.usdt).then((res) => {
            wallet_qtys.usdt = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of ATOM - OSMO LP
          oraclequeryClient?.client.getBalance(address as string, denoms.atomosmo_pool).then((res) => {
            wallet_qtys.atomosmo_pool = (BigInt(res.amount) / 1_000_000_000_000_000_000n).toString()
          })
          //Get account's balance of OSMO - USDC LP
          oraclequeryClient?.client.getBalance(address as string, denoms.osmousdc_pool).then((res) => {
            wallet_qtys.osmousdc_pool = (BigInt(res.amount) / 1_000_000_000_000_000_000n).toString()
          })
          //Set walletChecked
          setwalletChecked(true)
          console.log("checked")
        } catch (error) {
          console.log(error)
        }
        //Set walletQTYs
        setwalletQTYs(wallet_qtys)
      }
    }
    //Get at risk positions
    if (riskyPositions.length === 0) {
      getRiskyPositions()
    }
    //Get basket for Dashboard total minted
    if (basketRes === undefined){
      cdpqueryClient?.getBasket().then((res) => {
        setbasketRes(res);
      })
    }
    //////Positions Page Queries
    if (activeComponent === "vault"){
      if (positionID === "0"){
        //fetch & Update position data
        fetch_update_positionData()
      }
    }

    /////Liquidation Page Queries    
    if (activeComponent === "liquidation"){
      //Set LQ claimables
      if (lqClaimables.display === "" || lqClaimables.display === "No Claims"){
        setqueueClaimables()
      }
      if (SPclaimables === ""){
        //Set SP claimables
        getSPclaimables()
      }    
      if (spTVL === 0){
        //Set SP TVL
        getSPTVL()
      }
      if (unstakingMsg === "") {
        //Check for unstaking positions
        getunstakingSP()
      }
    }
    ///////Governance queries
    if (activeComponent === "staking"){
      if (quorum === 0 || proposals.active[0][0] === undefined){
        //Query & set proposals
        getProposals()
      }
      if (emissionsSchedule.rate === 0){
        //Query & set emissions schedule
        getEmissionsSchedule()
      }
      if (userStake.staked === 0){
        //Get user staked & unstaking MBRN
        getUserStake()
      }
      if (userClaims.mbrnClaims === 0 && userClaims.cdtClaims === 0){
        //Get user claims
        getuserClaims()
      }
      if (delegations[0].amount === 0 || delegations[0].amount === undefined){
        console.log("attempt")
        //Get delegation info
        getDelegations()
      }
      if (maxCommission === 0){
        //Get staking max commission
        getStakingCommission()
      }
    }
    
  }, [oraclequeryClient, cdpqueryClient, prices, address, activeComponent, walletChecked])

  const renderComponent = () => {
    ///If the dashboard is only going to show the vault page then load the vault page only
    if (onlyVaultPage() && activeComponent === 'dashboard'){
      return <Positions cdp_client={cdp_client} queryClient={cdpqueryClient} address={address as string | undefined} pricez={prices} walletCDT={walletCDT??0}
        rateRes={rateRes} setrateRes={setrateRes} creditRateRes={creditRateRes} setcreditRateRes={setcreditRateRes} basketRes={basketRes} setbasketRes={setbasketRes}
        popupTrigger={popupTrigger} setPopupTrigger={setPopupTrigger} popupMsg={popupMsg} setPopupMsg={setPopupMsg} popupStatus={popupStatus} setPopupStatus={setPopupStatus}
        positionQTYz={positionQTYs} positionChecked={positionChecked}
        debtAmount={debtAmount} setdebtAmount={setdebtAmount} maxLTV={maxLTV} setmaxLTV={setmaxLTV} brwLTV={brwLTV} setbrwLTV={setbrwLTV} positionID={positionID} setpositionID={setpositionID} user_address={user_address} setAddress={setAddress} sliderValue={sliderValue} setsliderValue={setsliderValue} creditPrice={creditPrice} setcreditPrice={setcreditPrice}
        contractQTYz={contractQTYs} walletQTYz={walletQTYs} walletChecked={walletChecked} fetch_update_positionData={fetch_update_positionData}
    />;
    } else if (activeComponent === 'dashboard') {
      return <Dashboard setActiveComponent={setActiveComponent} basketRes={basketRes} walletCDT={walletCDT} walletMBRN={walletMBRN} inLaunch={inLaunch}/>;
    } else if (activeComponent === 'vault') {
      return <Positions cdp_client={cdp_client} queryClient={cdpqueryClient} address={address as string | undefined} pricez={prices} walletCDT={walletCDT??0}
          rateRes={rateRes} setrateRes={setrateRes} creditRateRes={creditRateRes} setcreditRateRes={setcreditRateRes} basketRes={basketRes} setbasketRes={setbasketRes}
          popupTrigger={popupTrigger} setPopupTrigger={setPopupTrigger} popupMsg={popupMsg} setPopupMsg={setPopupMsg} popupStatus={popupStatus} setPopupStatus={setPopupStatus}
          positionQTYz={positionQTYs} positionChecked={positionChecked}
          debtAmount={debtAmount} setdebtAmount={setdebtAmount} maxLTV={maxLTV} setmaxLTV={setmaxLTV} brwLTV={brwLTV} setbrwLTV={setbrwLTV} positionID={positionID} setpositionID={setpositionID} user_address={user_address} setAddress={setAddress} sliderValue={sliderValue} setsliderValue={setsliderValue} creditPrice={creditPrice} setcreditPrice={setcreditPrice}
          contractQTYz={contractQTYs} walletQTYz={walletQTYs} walletChecked={walletChecked} fetch_update_positionData={fetch_update_positionData}
      />;
    } else if (activeComponent === 'liquidation') {
      return <LiquidationPools queryClient={liqqueuequeryClient} liq_queueClient={liq_queue_client} sp_queryClient={stabilitypoolqueryClient} sp_client={stability_pool_client} cdp_client={cdp_client} cdp_queryClient={cdpqueryClient} address={address as string | undefined} pricez={prices} index_lqClaimables={lqClaimables}        capitalAhead={capitalAhead} userclosestDeposit={userclosestDeposit} userTVL={userTVL} TVL={spTVL} SPclaimables={SPclaimables} unstakingMsg={unstakingMsg} setunstakingMsg={setunstakingMsg} setSPclaimables={setSPclaimables} setTVL={setspTVL} setuserTVL={setuserTVL}
        setuserclosestDeposit={setuserclosestDeposit} setcapitalAhead={setcapitalAhead} riskyPositionz={riskyPositions}
      />;
    } else if (activeComponent === 'staking') {
      return <Governance govClient={governance_client} govQueryClient={governancequeryClient} stakingClient={staking_client} stakingQueryClient={stakingqueryClient} vestingClient={vesting_client} address={address as string | undefined} 
        Delegations={delegations} Delegators={delegators} quorum={quorum} Proposals={proposals} UserVP={userVP} EmissionsSchedule={emissionsSchedule} UserStake={userStake} UserClaims={userClaims} WalletMBRN={walletMBRN??0}
        setQuorum={setQuorum} maxCommission={maxCommission} setmaxCommission={setmaxCommission}
      />;
    } else if (activeComponent === 'launch') {
      return <Lockdrop launch_client={launch_client} queryClient={launchqueryClient} baseClient={base_client} address={address as string | undefined} prices={prices} />;
    }
  };

  return (
    <>    
    {/* Required meta tags */}
    <meta charSet="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    {/* Bootstrap CSS */}
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
      integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
      crossOrigin="anonymous"
    />
    <title>Membrane</title>  
    <link rel="icon" type="image/png" href="favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Abel&display=swap"
      rel="stylesheet"
    />
    <Box bg="gray.900" className="page-frame">
        <NavBar setPage={setActiveComponent}/> 
        {renderComponent()}        
        <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </Box>
    
  </>
  );
}