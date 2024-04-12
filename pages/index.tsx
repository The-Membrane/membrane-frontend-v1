import React from "react";
import { useRouter } from 'next/router';

import { Coin, coin, coins } from "@cosmjs/amino";
import { calcAmountWithSlippage, calcShareOutAmount, convertGeckoPricesToDenomPriceHash, LiquidityPoolCalculator } from "@osmonauts/math";
import { osmosis } from 'osmojs';
import { asset_list, assets } from '@chain-registry/osmosis';
import { CoinDenom, convertBaseUnitsToDollarValue, getChainDenomBySymbol, getSymbolByChainDenom } from '@chain-registry/utils';
//import priceResponse from "../__fixtures__/coingecko/api/v3/simple/price/data.json";


import Dashboard from './Dashboard';
import { useEffect, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import LiquidationPools from './Liquidations';
import Lockdrop from './Lockdrop';
import Governance, { Delegation, Delegator, EmissionsSchedule, UserClaims, UserStake } from './Governance';
import { ProposalList } from "../components/governance/ProposalPane";
import Positions, { CollateralAssets, ContractInfo, DefinedCollateralAssets, getRataLTV, getassetRatios } from './Vaults';
import { useClients, useQueryClients } from '../hooks/use-clients';
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import { PositionsMsgComposer } from "../codegen/positions/Positions.message-composer";
import Popup from "../components/Popup";
import Hotjar from '@hotjar/browser';
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Asset, Basket, CollateralInterestResponse, InterestResponse, NativeToken, PositionResponse, RedeemabilityResponse } from "../codegen/positions/Positions.types";
import { ClaimsResponse } from "../codegen/liquidation_queue/LiquidationQueue.types";
import { Config, ProposalResponse } from "../codegen/governance/Governance.types";
import { cdtRoutes, chainName, delegateList, denoms, quadraticVoting, skipProposals, testnetAddrs } from "../config";
import { SwapAmountInRoute } from "osmojs/dist/codegen/osmosis/poolmanager/v1beta1/swap_route";
import { CoinSymbol } from "@osmonauts/math/dist/types";
import BigNumber from "bignumber.js";
import { position } from "@chakra-ui/react";
import { EncodeObject } from "@cosmjs/proto-signing";
import { MsgSwapExactAmountIn } from "osmojs/dist/codegen/osmosis/gamm/v1beta1/tx";
import { MsgExecuteContractEncodeObject } from "@cosmjs/cosmwasm-stargate";


export const SECONDS_PER_DAY = 86400;
export const BLOCK_TIME_IN_SECONDS = 6;
export const unstakingPeriod = 4; //days
const SWAP_SLIPPAGE = 1.5; //1.5% slippage

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

  const [activeComponent, setActiveComponent] = useState('dashboard');
  
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(true);
  const [popupMsg, setPopupMsg] = useState<ReactJSXElement>(<div>EXITING THIS POP-UP IS ACKNOWLEDGEMENT OF & AGREEMENT TO THE FOLLOWING: This is experimental technology which may or may not be allowed in certain jurisdictions in the past/present/future, and it’s up to you to determine & accept all liability of use. This interface is for an externally deployed codebase that you are expected to do independent research for, for any additional understanding.</div>);
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
    axlUSDC: 0,
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
    axlUSDC: undefined,
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
    axlUSDC: 0,
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
                        denom: denoms.osmo[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.atom[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.axlUSDC[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.atomosmo_pool[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.osmousdc_pool[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.usdc[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.stAtom[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.stOsmo[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.tia[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.usdt[0] as string
                    }
                },
                {
                    native_token: {
                        denom: denoms.cdt[0] as string
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
      axlUSDC: 0,
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
                axlUSDC: 0,
                usdc: 0,
                stAtom: 0,
                stOsmo: 0,
                tia: 0,
                usdt: 0,
                atomosmo_pool: "0",
                osmousdc_pool: "0",
            };
            console.log(userRes)
            //@ts-ignore
            userRes[0].positions[0].collateral_assets.forEach(asset => {
                // @ts-ignore
                var actual_asset = asset.asset.info.native_token.denom;

                if (actual_asset === denoms.osmo[0]) {
                  position_qtys.osmo = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.osmo = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.atom[0]) {
                  position_qtys.atom = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.atom = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.axlUSDC[0]) {
                  position_qtys.axlUSDC = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.axlUSDC = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.atomosmo_pool[0]) {
                  position_qtys.atomosmo_pool = (BigInt(asset.asset.amount)/1_000_000_000_000_000_000n).toString();
                  contract_info.atomosmo_pool = (BigInt(asset.asset.amount)/1_000_000_000_000_000_000n).toString();
                } else if (actual_asset === denoms.osmousdc_pool[0]) {
                  position_qtys.osmousdc_pool = (BigInt(asset.asset.amount)/1_000_000_000_000_000_000n).toString();
                  contract_info.osmousdc_pool = (BigInt(asset.asset.amount)/1_000_000_000_000_000_000n).toString();
                } else if (actual_asset === denoms.usdc[0]) {
                  position_qtys.usdc = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.usdc = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.stAtom[0]) {
                  position_qtys.stAtom = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.stAtom = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.stOsmo[0]) {
                  position_qtys.stOsmo = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.stOsmo = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.tia[0]) {
                  position_qtys.tia = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.tia = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.usdt[0]) {
                  position_qtys.usdt = parseInt(asset.asset.amount) / 1_000_000;
                  contract_info.usdt = parseInt(asset.asset.amount) / 1_000_000;
                }
            })
            console.log(position_qtys)
            setpositionQTYs(position_qtys);

            if (basketRes != undefined){
                
              //calc Debt
              //@ts-ignore
              setcreditPrice(parseFloat(basketRes.credit_price.price))
            }
        } else {
          console.log(userRes)
        }
        console.log(contract_info)
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
              case denoms.osmo[0] as string: {     
                new_display += asset_claims + " OSMO, ";
                break;
              }
              case denoms.atom[0] as string: {
                new_display += asset_claims + " ATOM, ";
                break;
              }
              case denoms.axlUSDC[0] as string: {
                new_display += asset_claims + " axlUSDC, ";
                break;
              }
              case denoms.usdc[0] as string: {
                new_display += asset_claims + " USDC, ";
                break;
              }
              case denoms.stAtom[0] as string: {
                new_display += asset_claims + " stATOM, ";
                break;
              }
              case denoms.stOsmo[0] as string: {
                new_display += asset_claims + " stOSMO, ";
                break;
              }
              case denoms.tia[0] as string: {
                new_display += asset_claims + " TIA, ";
                break;
              }
              case denoms.usdt[0] as string: {
                new_display += asset_claims + " USDT, ";
                break;
              }
              case denoms.atomosmo_pool[0] as string: {
                new_display += (asset_claims/1_000000_000000) + " ATOM-OSMO LP, ";
                break;
              }
              case denoms.osmousdc_pool[0] as string: {
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
            case denoms.osmo[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " OSMO, "
              break;
            }
            case denoms.atom[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " ATOM, "
              break;
            }
            case denoms.axlUSDC[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " axlUSDC, "
              break;
            }
            case denoms.usdc[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " USDC, "
              break;
            }
            case denoms.stAtom[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " stATOM, "
              break;
            }
            case denoms.stOsmo[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " stOSMO, "
              break;
            }
            case denoms.tia[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " TIA, "
              break;
            }
            case denoms.usdt[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000 + " USDT, "
              break;
            }
            case denoms.atomosmo_pool[0] as string: {
              claims += parseInt(res.claims[i].amount)/1_000_000_000_000_000_000 + " ATOM-OSMO LP, "
              break;
            }
            case denoms.osmousdc_pool[0] as string: {
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
            if ((res.claimables[i].info as unknown as NativeToken).denom === denoms.cdt[0]) {
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
          console.log(completed_proposals)
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
    return !((walletCDT != undefined && walletCDT > 0) || (walletMBRN != undefined && walletMBRN > 0) || (inLaunch != undefined && inLaunch === true))
  }
  
  //Calculate the position value using prices and collateral quantities
  function getPositionValue(position: PositionResponse){
    var position_value = 0;
    //Calc position value
    if (position.collateral_assets.length > 0) {
      position.collateral_assets.forEach((collateral) => {//@ts-ignore   
        if (collateral.asset.info.native_token.denom === denoms.osmo[0]) {
          position_value += prices.osmo * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.atom[0]) {
          position_value += prices.atom * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.axlUSDC[0]) {
          position_value += prices.axlUSDC * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.usdc[0]) {
          position_value += prices.usdc * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.stAtom[0]) {
          position_value += prices.stAtom * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.stOsmo[0]) {
          position_value += prices.stOsmo * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore  
        } else if (collateral.asset.info.native_token.denom === denoms.tia[0]) {
          position_value += prices.tia * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore  
        } else if (collateral.asset.info.native_token.denom === denoms.usdt[0]) {
          position_value += prices.usdt * parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore 
        } else if (collateral.asset.info.native_token.denom === denoms.atomosmo_pool[0]) {
          position_value += prices.atomosmo_pool * parseInt(collateral.asset.amount) / 1_000_000_000_000_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.osmousdc_pool[0]) {
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
      axlUSDC: 0,
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
        if (collateral.asset.info.native_token.denom === denoms.osmo[0]) {
          position_collateral_qtys.osmo = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.atom[0]) {
          position_collateral_qtys.atom = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.axlUSDC[0]) {
          position_collateral_qtys.axlUSDC = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.usdc[0]) {
          position_collateral_qtys.usdc = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.stAtom[0]) {
          position_collateral_qtys.stAtom = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.stOsmo[0]) {
          position_collateral_qtys.stOsmo = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.tia[0]) {
          position_collateral_qtys.tia = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.usdt[0]) {
          position_collateral_qtys.usdt = parseInt(collateral.asset.amount) / 1_000_000;//@ts-ignore
        } else if (collateral.asset.info.native_token.denom === denoms.atomosmo_pool[0]) {
          position_collateral_qtys.atomosmo_pool = (BigInt(collateral.asset.amount)/1_000_000_000_000_000_000n).toString();//@ts-ignore   
        } else if (collateral.asset.info.native_token.denom === denoms.osmousdc_pool[0]) {
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
        console.log(riskyPositions)
        setriskyPositions(riskyPositions);
      })
    } catch (error) {
      console.log(error)
    }  
  }

//////Quick Action functions
//Initialize osmosis client
const [osmosisQueryClient, setosmosisQueryClient] = useState<any | null>( null );
//Get Osmosis Client
useEffect(() => {
  if (osmosisQueryClient === null || osmosisQueryClient === undefined) {
    const { createRPCQueryClient } = osmosis.ClientFactory;
    const osmosisClient = createRPCQueryClient({ rpcEndpoint: "https://osmosis-rpc.polkachu.com/" }).then((osmosisClient) => {
      if (!osmosisClient) {
        console.error('osmosisClient undefined.');
        return;
      }

      //Set client
      setosmosisQueryClient(osmosisClient);
    });
  }
}, []); //We'll add dependencies for Quick Actions clicks so that this requeries if the user is about to need it & its undefined
//Initialize osmosis variables
//@ts-ignore
// let cg_prices;
// const osmosisAssets = [
//   ...assets.assets,
//   ...asset_list.assets,
// ].filter(({ type_asset }) => type_asset !== 'ics20').filter((asset) => asset !== undefined);
// //@ts-ignore
// cg_prices = convertGeckoPricesToDenomPriceHash(osmosisAssets, priceResponse);
// //@ts-ignore
// let calculator = new LiquidityPoolCalculator({ assets: osmosisAssets});

// /////functions/////
// const unloopPosition = async ( positionId: string, loops: number ) => {
//   //Create CDP Message Composer
//   const cdp_composer = new PositionsMsgComposer(user_address, testnetAddrs.positions);
//   //getPosition
//   const userRes = await cdpqueryClient?.getBasketPositions(
//     {
//         user: address as string,
//     }
//   );

//   //Set Position value
//   var positionValue = getPositionValue(userRes![0].positions[0]);
//   //Set credit amount
//   var creditAmount = parseInt(userRes![0].positions[0].credit_amount);
//   //Get borrowable LTV
//   let rataLTVs = getRataLTV(getPositionValue(userRes![0].positions[0]), getPositionQTYs(userRes![0].positions[0]), prices, basketRes);
//   let borrowLTV = rataLTVs[0]/100;
  
//   //Get Position's LTV
//   var currentLTV = getPositionLTV(positionValue, creditAmount);
//   //If current LTV is over the borrowable LTV, we can't withdraw anything
//   if (currentLTV > borrowLTV) {
//     console.log("Current LTV is over the Position's borrowable LTV, we can't withdraw collateral")
//     return;
//   }
//   //Get position cAsset ratios 
//   //Ratios won't change in btwn loops so we can set them outside the loop
//   let cAsset_ratios = getassetRatios(positionValue, getPositionQTYs(userRes![0].positions[0]), prices);

//   //Repeat until no more CDT or Loops are done
//   var iter = 0;
//   var all_msgs: EncodeObject[] = [];
//   while ((creditAmount > 0 || iter == 0) && iter < loops){
//     //Set LTV range
//     //We can withdraw value up to the borrowable LTV
//     //Or the current LTV, whichever is lower
//     let LTV_range = Math.min(borrowLTV - currentLTV, currentLTV);
//     //Set value to withdraw
//     var withdrawValue = positionValue * LTV_range;
//     console.log(withdrawValue, positionValue, LTV_range, borrowLTV, currentLTV)

//     //.Divvy withdraw value to the cAssets based on ratio
//     //Transform the value to the cAsset's amount using its price & decimals
//     let cAsset_amounts = Object.keys(cAsset_ratios).map((key) => {
//       return [key, parseInt(((cAsset_ratios[key as keyof DefinedCollateralAssets] * withdrawValue) / prices[key as keyof DefinedCollateralAssets] * Math.pow(10, denoms[key as keyof DefinedCollateralAssets][1] as number)).toFixed(0))];
//     });
//     //Save amounts as assets for withdraw msg
//     var assets: Asset[] = [];
//     cAsset_amounts.forEach((amount) => {
//       if (amount[1] as number != 0) {
//         assets.push(
//           {
//             amount: amount[1].toString(), 
//             //@ts-ignore
//             info: {native_token: {
//               denom: denoms[amount[0] as keyof DefinedCollateralAssets][0] as string
//             }}
//           });
//       }
//     });

    
//     //Create withdraw msg for assets
//     var withdraw_msg: MsgExecuteContractEncodeObject = cdp_composer.withdraw({
//       positionId: positionId,
//       assets, 
//     });
    
//     //Create Swap msgs to CDT for each cAsset & save tokenOutMinAmount
//     var swap_msgs: EncodeObject[] = [];
//     var tokenOutMin = 0;
//     cAsset_amounts.forEach((amount) => {
//       if (amount[1] as number != 0) {
//         let swap_output = handleCDTswaps(amount[0] as keyof swapRoutes, parseInt(amount[1].toString()) as number)!;
//         swap_msgs.push(swap_output);         
//         tokenOutMin += parseInt((swap_output.value as MsgSwapExactAmountIn).tokenOutMinAmount);
//       }
//     });

//     //Create repay msg with newly swapped CDT
//     var repay_msg: EncodeObject = cdp_composer.repay({
//       positionId: positionId,
//     });    
//     repay_msg.value.funds = [coin(tokenOutMin.toString(), denoms.cdt[0] as string)];
    
//     console.log(repay_msg.value.funds)

    
//     //Subtract slippage to mint value
//     withdrawValue = parseFloat(calcAmountWithSlippage(withdrawValue.toString(), SWAP_SLIPPAGE));
//     //Calc new TVL (w/ slippage calculated into the mintValue)
//     positionValue = positionValue - withdrawValue;
    
    
//     //Repayments under 100 CDT will fail unless fully repaid
//     //NOTE: This will leave the user with leftover CDT in their wallet, maximum 50 CDT
//     if ((creditAmount - repay_msg.value.funds[0].amount) < 100_000_000 && (creditAmount - repay_msg.value.funds[0].amount) > 0){
//       //Set repay amount so that credit amount is 100
//       repay_msg.value.funds = [coin((creditAmount - 100_000_000).toString(), denoms.cdt[0] as string)];
//       //break loop
//       iter = loops;
//     } 

//     //Attempted full repay
//     if (LTV_range === currentLTV) {      
//       //Set credit amount to 0
//       creditAmount = 0;
//       //Add any walletCDT to the repay amount to account for interest & slippage
//       repay_msg.value.funds = [coin((creditAmount +  ((walletCDT??0) * 1_000_000)).toString(), denoms.cdt[0] as string)];
//     } else {      
//       //Set credit amount including slippage
//       creditAmount -= repay_msg.value.funds[0].amount;
//     }

//     //Calc new LTV
//     currentLTV = getPositionLTV(positionValue, creditAmount);

//     //Add msgs to all_msgs
//     all_msgs = all_msgs.concat([withdraw_msg]).concat(swap_msgs).concat([repay_msg]);

//     //Increment iter
//     iter += 1;
//   }

//   console.log(all_msgs, iter)

//   await base_client?.signAndBroadcast(user_address, all_msgs, "auto",).then((res) => {console.log(res)});

// }
// //Ledger has a msg max of 3 msgs per tx (untested), so users can only loop with a max of 1 collateral
// //LTV as a decimal
// const loopPosition = async ( LTV: number, positionId: string, loops: number ) => {
//   //Create CDP Message Composer
//   const cdp_composer = new PositionsMsgComposer(user_address, testnetAddrs.positions);
//   //getPosition
//   const userRes = await cdpqueryClient?.getBasketPositions(
//     {
//         user: address as string,
//     }
//   );

//   //Set Position value
//   var positionValue = getPositionValue(userRes![0].positions[0]);
//   //Set credit amount
//   var creditAmount = parseInt(userRes![0].positions[0].credit_amount);
//   //Confirm desired LTV isn't over the borrowable LTV
//   let rataLTVs = getRataLTV(getPositionValue(userRes![0].positions[0]), getPositionQTYs(userRes![0].positions[0]), prices, basketRes);
//   let borrowLTV = rataLTVs[0]/100;
  
//   if (LTV >= borrowLTV) {
//     console.log("Desired LTV is over the Position's borrowable LTV")
//     return;
//   }
//   //Get position cAsset ratios 
//   //Ratios won't change in btwn loops so we can set them outside the loop
//   let cAsset_ratios = getassetRatios(positionValue, getPositionQTYs(userRes![0].positions[0]), prices);
//   //Get Position's LTV
//   var currentLTV = getPositionLTV(positionValue, creditAmount);
//   if (LTV < currentLTV) {
//     console.log("Desired LTV is under the Position's current LTV")
//     return;
//   }

//   //Repeat until CDT to mint is under 1 or Loops are done
//   var mintAmount = 0;
//   var iter = 0;
//   var all_msgs: EncodeObject[] = [];
//   while ((mintAmount > 1_000_000 || iter == 0) && iter < loops){
//     //Set LTV range
//     let LTV_range = LTV - currentLTV;
//     //Set value to mint
//     var mintValue = positionValue * LTV_range;
//     //Set amount to mint
//     mintAmount = parseInt(((mintValue / parseFloat(basketRes!.credit_price.price)) * 1_000_000).toFixed(0));
    
//     //Create mint msg
//     let mint_msg: EncodeObject = cdp_composer.increaseDebt({
//       positionId: positionId,
//       amount: mintAmount.toString(),
//     });  
//     //Divvy mint amount to the cAssets based on ratio
//     let cAsset_amounts = Object.keys(cAsset_ratios).map((key) => {
//       return [key, (cAsset_ratios[key as keyof DefinedCollateralAssets] * mintAmount)];
//     });
    
//     //Create Swap msgs from CDT for each cAsset & save tokenOutMinAmount
//     var swap_msgs: EncodeObject[] = [];
//     var tokenOutMins: Coin[] = [];
//     cAsset_amounts.forEach((amount) => {
//       if (amount[1] as number > 0) {
//         let swap_output = handleCollateralswaps(amount[0] as keyof swapRoutes, parseInt(amount[1].toString()) as number)!;
//         swap_msgs.push(swap_output);         
//         tokenOutMins.push(coin((swap_output.value as MsgSwapExactAmountIn).tokenOutMinAmount, denoms[amount[0] as keyof DefinedCollateralAssets][0] as string));
//       }
//     });
//     //Create deposit msgs for newly swapped assets
//     var deposit_msg: MsgExecuteContractEncodeObject = cdp_composer.deposit({
//       positionId: positionId,
//     });
//     //Sort tokenOutMins alphabetically
//     tokenOutMins.sort((a, b) => (a.denom > b.denom) ? 1 : -1);
//     deposit_msg.value.funds = tokenOutMins;
//     //////////////////////////

//     //Subtract slippage to mint value
//     mintValue = parseFloat(calcAmountWithSlippage(mintValue.toString(), SWAP_SLIPPAGE));
//     //Calc new TVL (w/ slippage calculated into the mintValue)
//     positionValue = positionValue + mintValue;
    
//     //Set credit amount
//     creditAmount += mintAmount;
//     //Calc new LTV
//     currentLTV = getPositionLTV(positionValue, creditAmount);

//     //Add msgs to all_msgs
//     all_msgs = all_msgs.concat([mint_msg]).concat(swap_msgs).concat([deposit_msg]);

//     //Increment iter
//     iter += 1;
//   }

//   console.log(all_msgs, iter)

//   await base_client?.signAndBroadcast(user_address, all_msgs, "auto",).then((res) => {console.log(res)});
// }
// const exitCLPools = async (poolId: number) => {
//   console.log("exit_cl_attempt")
  
//   //Query CL pool
//   const userPoolResponse = await osmosisQueryClient!.osmosis.concentratedliquidity.v1beta1.userPositions({
//     address: address! as string,
//     poolId,
//   });
//   console.log(userPoolResponse)
//   //Convert user positions to a list of position IDs
//   //@ts-ignore
//   let positionIds = userPoolResponse.positions.map((position) => {
//     return position.position.positionId;
//   });

//   let collect_msg = osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.collectSpreadRewards({
//     positionIds,
//     sender: address! as string,
//   });
//   let collect_msg_2 = osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.collectIncentives({
//     positionIds,
//     sender: address! as string,
//   });
//   let withdraw_msg = osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.withdrawPosition({
//     positionId: userPoolResponse.positions[0].position.positionId,
//     sender: address! as string,
//     liquidityAmount: userPoolResponse.positions[0].position.liquidity,
//   });
//   await base_client?.signAndBroadcast(user_address, [collect_msg, collect_msg_2, withdraw_msg], "auto",).then((res) => {console.log(res)});
// }
// const exitGAMMPools = async (poolId: number, shareInAmount: string) => {
//   console.log("exit_pool_attempt")

//   //Query pool
//   const poolResponse = await osmosisQueryClient!.osmosis.gamm.v1beta1.pool({
//     poolId
//   });
//   let pool = poolResponse.pool;
//   let poolAssets = pool.poolAssets;
//   let totalShares = pool.totalShares;
//   //Calc user's share of pool
//   let shareAmount = new BigNumber(shareInAmount);
//   let totalShareAmount = new BigNumber(totalShares.amount);
//   let userShare =  shareAmount.div(totalShareAmount);
//   console.log(userShare)
//   //Calc user's share of poolAssets
//   //@ts-ignore
//   let tokenOutMins = poolAssets.map((asset) => {
//     if (asset.token.amount !== undefined) {
//       return coin(
//         parseInt(calcAmountWithSlippage((parseInt(asset.token.amount) * parseFloat(userShare.valueOf())).toFixed(0), SWAP_SLIPPAGE)), 
//         asset.token.denom);
//     }
//   });
//   console.log(tokenOutMins)

//   //Exit pool
//   const msg = exitPool({
//     poolId: BigInt(poolId),
//     sender: address! as string,
//     shareInAmount,
//     tokenOutMins,
//   });
//   await base_client?.signAndBroadcast(user_address, [msg], "auto",).then((res) => {console.log(res)});

// }
// //////joinPools
// //The input tokens must be in the order of the pool's assets
// //pool 1268 is CDT/USDC
// const joinCLPools = async (tokenIn1: Coin, poolId: number, tokenIn2: Coin) => {
//   console.log("join_CL_pool_attempt")
//   let joinCoins = [tokenIn1, tokenIn2];
  
//   let msg = osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl.createPosition({
//     poolId: BigInt(poolId),
//     sender: address! as string,
//     //This range is .98 to 1.02
//     // lowerTick: BigInt("-200000"),
//     // upperTick: BigInt(20000),
//     //This is range .99 to 1.01
//     lowerTick: BigInt("-100000"),
//     upperTick: BigInt(10000),
//     /**
//      * tokens_provided is the amount of tokens provided for the position.
//      * It must at a minimum be of length 1 (for a single sided position)
//      * and at a maximum be of length 2 (for a position that straddles the current
//      * tick).
//      */
//     tokensProvided: joinCoins,
//     //Do we care about input minimums since we are depositing both?
//     tokenMinAmount0: "0",
//     tokenMinAmount1: "0",
//   });

//   await base_client?.signAndBroadcast(user_address, [msg], "auto",).then((res) => {console.log(res)});
// }
// //This is used primarily to loop GAMM shares used as collateral
// const joinGAMMPools = async (tokenIn1: Coin, poolId: number, tokenIn2?: Coin) => {
//     //@ts-ignore
//     if (osmosisQueryClient !== null && cg_prices !== null && osmosisAssets !== undefined) {
//       console.log("join_pool_attempt")
//       //Query pool
//       const poolResponse = await osmosisQueryClient!.osmosis.gamm.v1beta1.pool({
//         poolId
//       });
//       let pool = poolResponse.pool;
//       //JoinPool no Swap
//       if (tokenIn2 !== undefined) {
//         let joinCoins = [tokenIn1, tokenIn2];
//         const shareOutAmount = calcShareOutAmount(pool, joinCoins);
//         const tokenInMaxs = joinCoins.map((c: Coin) => {
//           return coin(c.amount, c.denom);
//         });

//         const msg = joinPool( {
//           poolId: BigInt(poolId),
//           sender: address! as string,
//           tokenInMaxs: tokenInMaxs,
//           shareOutAmount: parseInt(calcAmountWithSlippage(shareOutAmount, SWAP_SLIPPAGE)).toString(),
//         });
        
//         await base_client?.signAndBroadcast(user_address, [msg], "auto",).then((res) => {console.log(res)});    
//       } else {
//         //Join with Swap        
//         //@ts-ignore
//         let tokenPrice = cg_prices[tokenIn1.denom as CoinDenom];
        
//         //Find the key for the denom
//         let tokenKey = Object.keys(denoms).find(key => denoms[key as keyof swapRoutes][0] === tokenIn1.denom);
//         let tokenInValue = (parseFloat(tokenPrice)* parseFloat(tokenIn1.amount) / Math.pow(10, denoms[tokenKey as keyof swapRoutes][1] as number));
//         // console.log(tokenInValue)
//         //@ts-ignore
//         const coinsNeeded = calculator.convertDollarValueToCoins(tokenInValue, pool, cg_prices);
//         // console.log(coinsNeeded)
//         const shareOutAmount = calcShareOutAmount(pool, coinsNeeded);
//         // console.log(shareOutAmount)

//         const msg = joinSwapExternAmountIn({
//           poolId: BigInt(poolId),
//           sender: address! as string,
//           tokenIn: tokenIn1,
//           shareOutMinAmount: parseInt(calcAmountWithSlippage(shareOutAmount, SWAP_SLIPPAGE)).toString(),
//         })
        
//         await base_client?.signAndBroadcast(user_address, [msg], "auto",).then((res) => {console.log(res)});    
//       }  
//   }
// }
// ///Exit Pools

// //This is for CDT using the oracle's prices
// const getCDTtokenOutAmount = (tokenInAmount: number, tokenIn: keyof Prices ) => {
//   let basePrice = prices[tokenIn]
//   let tokenOut = prices.cdt

//   return tokenInAmount * (basePrice / tokenOut)
// }
// //Parse through saved Routes until we reach CDT
// const getCDTRoute = (tokenIn: keyof swapRoutes) => {
//   var route = cdtRoutes[tokenIn];
//   //to protect against infinite loops
//   var iterations = 0;
  
//   while (route != undefined && route[route.length-1].tokenOutDenom as string !== denoms.cdt[0] && iterations < 5){
//     //Find the key from this denom
//     let routeDenom = route[route.length-1].tokenOutDenom as string;
//     //Set the next node in the route path
//     let routeKey = Object.keys(denoms).find(key => denoms[key as keyof swapRoutes][0] === routeDenom);
//     //Add the next node to the route
//     route = route.concat(cdtRoutes[routeKey as keyof swapRoutes]);
    
//     //output to test
//     console.log(route)
//     iterations += 1;
//   }

//   return route;
// }
// //This is getting Swaps To CDT
// const handleCDTswaps = (tokenIn: keyof swapRoutes, tokenInAmount: number) => {
//   console.log("swap_attempt")
//   //Asserting prices were queried
//   if (prices.osmo !== 0) {
//     //Get tokenOutAmount
//     const tokenOutAmount = getCDTtokenOutAmount(tokenInAmount, tokenIn);
//     //Swap routes
//     const routes: SwapAmountInRoute[] = getCDTRoute(tokenIn); 
    
//     const tokenOutMinAmount = parseInt(calcAmountWithSlippage(tokenOutAmount.toString(), SWAP_SLIPPAGE)).toString();

//     const msg = swapExactAmountIn( {
//       sender: address! as string,
//       routes,
//       tokenIn: coin(tokenInAmount, denoms[tokenIn][0] as string),
//       tokenOutMinAmount
//     });
    
//     return msg;
//     // await base_client?.signAndBroadcast(user_address, [msg], "auto",).then((res) => {console.log(res)});
//     // handleCDTswaps("atom", 1000000)
//   }
// };

// //Parse through saved Routes until we reach CDT
// const getCollateralRoute = (tokenOut: keyof swapRoutes) => {//Swap routes
//   const temp_routes: SwapAmountInRoute[] = getCDTRoute(tokenOut);

//   //Reverse the route
//   var routes = temp_routes.reverse();
//   //Swap tokenOutdenom of the route to the key of the route
//   routes = routes.map((route) => {
//     let routeDenom = route.tokenOutDenom as string;
//     let routeKey = Object.keys(cdtRoutes).find(key => cdtRoutes[key as keyof swapRoutes][0].tokenOutDenom === routeDenom && route.poolId === cdtRoutes[key as keyof swapRoutes][0].poolId);
    
//     let keyDenom = denoms[routeKey as keyof swapRoutes][0] as string;
//     return {
//       poolId: route.poolId,
//       tokenOutDenom: keyDenom,
//     }
//   });

//   if (tokenOut === "usdc") {
//     console.log(temp_routes, routes)
//   }

//   return routes;
// }
// //This is for Collateral using the oracle's prices
// const getCollateraltokenOutAmount = (CDTInAmount: number, tokenOut: keyof Prices ) => {
//   let basePrice = prices.cdt;
//   let tokenOutPrice = prices[tokenOut];

//   return CDTInAmount * (basePrice / tokenOutPrice)
// }
// //Swapping CDT to collateral
// const handleCollateralswaps = (tokenOut: keyof swapRoutes, CDTInAmount: number) => {
//   console.log("collateral_swap_attempt")
//   //Asserting prices were queried
//   if (prices.osmo !== 0) {
//     //Get tokenOutAmount
//     const tokenOutAmount = getCollateraltokenOutAmount(CDTInAmount, tokenOut);
//     //Swap routes
//     const routes: SwapAmountInRoute[] = getCollateralRoute(tokenOut);
    
//     const tokenOutMinAmount = parseInt(calcAmountWithSlippage(tokenOutAmount.toString(), SWAP_SLIPPAGE)).toString();

//     const msg = swapExactAmountIn( {
//       sender: address! as string,
//       routes,
//       tokenIn: coin(CDTInAmount.toString(), denoms.cdt[0] as string),
//       tokenOutMinAmount
//     });
    
//     // await base_client?.signAndBroadcast(user_address, [msg], "auto",).then((res) => {console.log(res)});
//     return msg;
//   }
// };

  
  //Hotjar browser mouse tracking
  useEffect(() => {    
    Hotjar.init(siteId, hotjarVersion);
  }, []);
  
  useEffect(() => {
    // if (osmosisQueryClient !== null && positionID !== "0" && prices.osmo !== 0) {
      // handleCollateralswaps("atom", 1000000)
      // unloopPosition(positionID, 1)
    // } else { console.log("osmosisQueryClient not set")}
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
        oraclequeryClient?.client.getBalance(address as string, denoms.cdt[0] as string).then((res) => {
          setwalletCDT(parseInt(res.amount) / 1_000_000);
        })
      }
      if (walletMBRN === undefined){
        //Get account's balance of MBRN
        oraclequeryClient?.client.getBalance(address as string, denoms.mbrn[0] as string).then((res) => {
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
      if (walletQTYs.osmo === undefined || walletQTYs.atom === undefined || walletQTYs.axlUSDC === undefined || walletQTYs.usdc === undefined || walletQTYs.atomosmo_pool === undefined || walletQTYs.osmousdc_pool === undefined || walletQTYs.stAtom === undefined || walletQTYs.stOsmo === undefined || walletQTYs.tia === undefined || walletQTYs.usdt === undefined){
        var wallet_qtys: CollateralAssets = {
          osmo: walletQTYs.osmo,
          atom: walletQTYs.atom,
          axlUSDC: walletQTYs.axlUSDC,
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
          oraclequeryClient?.client.getBalance(address as string, denoms.osmo[0] as string).then((res) => {
            wallet_qtys.osmo = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of ATOM
          oraclequeryClient?.client.getBalance(address as string, denoms.atom[0] as string).then((res) => {
            wallet_qtys.atom = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of axlUSDC
          oraclequeryClient?.client.getBalance(address as string, denoms.axlUSDC[0] as string).then((res) => {
            wallet_qtys.axlUSDC = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of USDC
          oraclequeryClient?.client.getBalance(address as string, denoms.usdc[0] as string).then((res) => {
            wallet_qtys.usdc = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of stATOM
          oraclequeryClient?.client.getBalance(address as string, denoms.stAtom[0] as string).then((res) => {
            wallet_qtys.stAtom = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of stOSMO
          oraclequeryClient?.client.getBalance(address as string, denoms.stOsmo[0] as string).then((res) => {
            wallet_qtys.stOsmo = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of TIA
          oraclequeryClient?.client.getBalance(address as string, denoms.tia[0] as string).then((res) => {
            wallet_qtys.tia = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of USDT
          oraclequeryClient?.client.getBalance(address as string, denoms.usdt[0] as string).then((res) => {
            wallet_qtys.usdt = (parseInt(res.amount) / 1_000_000)
          })
          //Get account's balance of ATOM - OSMO LP
          oraclequeryClient?.client.getBalance(address as string, denoms.atomosmo_pool[0] as string).then((res) => {
            wallet_qtys.atomosmo_pool = (BigInt(res.amount) / 1_000_000_000_000_000_000n).toString()
          })
          //Get account's balance of OSMO - USDC LP
          oraclequeryClient?.client.getBalance(address as string, denoms.osmousdc_pool[0] as string).then((res) => {
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
    // if (activeComponent === "vault"){
      if (positionID === "0"){
        //fetch & Update position data
        fetch_update_positionData()
      }
    // }

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
    <div className="fullHeight">
        <NavBar setActiveComponent={setActiveComponent}/> 
        {renderComponent()}        
        <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </div>
    
  </>
  );
}
