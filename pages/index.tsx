import React from "react";
import { useRouter } from 'next/router';

import Dashboard from './Dashboard';
import { useEffect, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import LiquidationPools from './Liquidations';
import Lockdrop from './Lockdrop';
import Governance, { Delegation, Delegator, EmissionsSchedule, ProposalList, UserClaims, UserStake } from './Governance';
import Positions, { ContractInfo } from './Vaults';
import { useClients, useQueryClients } from '../hooks/use-clients';
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import Popup from "../components/Popup";
import Hotjar from '@hotjar/browser';
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Basket, CollateralInterestResponse, InterestResponse, NativeToken, RedeemabilityResponse } from "../codegen/positions/Positions.types";
import { ClaimsResponse } from "../codegen/liquidation_queue/LiquidationQueue.types";
import { Config, ProposalResponse } from "../codegen/governance/Governance.types";
import { delegateList, quadraticVoting } from "../config";

export const denoms = {
  mbrn: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
  cdt: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
  osmo: "uosmo",
  //mainnet atom ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2
  atom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
  //mainnet axlUSDC ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858
  axlUSDC: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
  //mainnet "gamm/pool/1"
  atomosmo_pool: "gamm/pool/1",
  //mainnet "gamm/pool/678"
  osmousdc_pool: "gamm/pool/678",
};

export interface Prices {
  osmo: number,
  atom: number,
  axlUSDC: number,
  atomosmo_pool: number,
  osmousdc_pool: number,
}

export default function Home() {

  const siteId = 3709543;
  const hotjarVersion = 6;

  const SECONDS_PER_DAY = 86400;
  const BLOCK_TIME_IN_SECONDS = 6;
  const unstakingPeriod = 4; //days

  const [activeComponent, setActiveComponent] = useState('dashboard');
  
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(true);
  const [popupMsg, setPopupMsg] = useState<ReactJSXElement>(<div>HITTING THE CLOSE BUTTON OF THIS POP-UP IS ACKNOWLEDGEMENT OF & AGREEMENT TO THE FOLLOWING: This is experimental technology which may or may not be allowed in certain jurisdictions in the past/present/future, and it’s up to you to determine & accept all liability of use. This interface is for an externally deployed codebase that you are expected to do independent research for, for any additional understanding.</div>);
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
  });
  const [rateRes, setrateRes] = useState<CollateralInterestResponse>();
  const [creditRateRes, setcreditRateRes] = useState<InterestResponse>();
  const [basketRes, setbasketRes] = useState<Basket>();
  const [walletCDT, setwalletCDT] = useState(0);

  ////Positions////
  //This is used to keep track of what asses the user has in the contract
  //bc the input/output asset quantities are updated in responsive to the user's actions    
  const [contractQTYs, setcontractQTYs] = useState<ContractInfo>({
    osmo: 0,
    atom: 0,
    axlusdc: 0,
    atomosmo_pool: 0,
    osmousdc_pool: 0,
    brw_LTV: 0,
    max_LTV: 0,
    cost: 0,
    sliderValue: 0,
  });
  //Asset specific
  //qty
  const [osmoQTY, setosmoQTY] = useState(0);
  const [atomQTY, setatomQTY] = useState(0);
  const [axlusdcQTY, setaxlusdcQTY] = useState(0);
  const [atomosmo_poolQTY, setatomosmo_poolQTY] = useState(0);
  const [osmousdc_poolQTY, setosmousdc_poolQTY] = useState(0);
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
            })
        })
    } catch (error) {
        console.log(error)
    }
  }

  const fetch_update_positionData = async () => {
    //blank ContractInfo
    var contract_info = {
      osmo: 0,
      atom: 0,
      axlusdc: 0,
      atomosmo_pool: 0,
      osmousdc_pool: 0,
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
            //@ts-ignore
            userRes[0].positions[0].collateral_assets.forEach(asset => {
                // @ts-ignore
                var actual_asset = asset.asset.info.native_token.denom;
                
                console.log("actual_asset: ", actual_asset)
                if (actual_asset === denoms.osmo) {
                    setosmoQTY(parseInt(asset.asset.amount) / 1_000_000)      
                    contract_info.osmo = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.atom) {
                    setatomQTY(parseInt(asset.asset.amount) / 1_000_000)
                    contract_info.atom = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.axlUSDC) {
                    setaxlusdcQTY(parseInt(asset.asset.amount) / 1_000_000)
                    contract_info.axlusdc = parseInt(asset.asset.amount) / 1_000_000;
                } else if (actual_asset === denoms.atomosmo_pool) {
                    setatomosmo_poolQTY(Number(BigInt(parseInt(asset.asset.amount))/1_000_000_000_000_000_000n))
                    contract_info.atomosmo_pool = Number(BigInt(parseInt(asset.asset.amount))/1_000_000_000_000_000_000n);
                } else if (actual_asset === denoms.osmousdc_pool) {
                    setosmousdc_poolQTY(Number(BigInt(parseInt(asset.asset.amount))/1_000_000_000_000_000_000n))
                    contract_info.osmousdc_pool = Number(BigInt(parseInt(asset.asset.amount))/1_000_000_000_000_000_000n);
                }                    
            })


            if (basketRes != undefined){
                
                //calc Debt
                //@ts-ignore
                setcreditPrice(parseFloat(basketRes.credit_price.price))
                
                if (rateRes != undefined){
                    ///setCost///
                    var total_rate = 0.0;
                    //get the positions collateral indices in Basket rates
                    //@ts-ignore
                    userRes[0].positions[0].collateral_assets.forEach((asset, index, _) => {
                        //find the asset's index                
                        var rate_index = basketRes.collateral_types.findIndex((info) => {
                            // @ts-ignore
                            return info.asset.info.native_token.denom === asset.asset.info.native_token.denom
                        })

                        //use the index to get its interest rate
                        var asset_rate = rateRes.rates[rate_index];

                        //add pro-rata rate to sum 
                        //@ts-ignore
                        total_rate += parseFloat((parseFloat(asset_rate) * parseFloat(userRes[0].positions[0].cAsset_ratios[index])).toFixed(4));
                    })

                    if (creditRateRes != undefined){
                        //Add credit rate to cost
                        if (creditRateRes.negative_rate && basketRes.negative_rates){
                            total_rate -= parseFloat(creditRateRes.credit_interest);
                            console.log(creditRateRes.negative_rate && basketRes.negative_rates)
                        } else {
                            total_rate += parseFloat(creditRateRes.credit_interest);
                        }   
                    }
                    //setCost 
                    setCost(total_rate);
                    contract_info.cost = total_rate;
                }
                
            }
        }
        setcontractQTYs(contract_info);
    } catch (error) {
        console.log(error)
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
  const [walletMBRN, setwalletMBRN] = useState(0);
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
        console.log(res)
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
  //WE'd need to sort the proposal list by status beforehand
  const getProposals = async () => {
    try {
      //Get current time in seconds
      var currentBlockHeight = 0;
      
      await governance_client?.client?.getHeight().then( async (height) => {
          currentBlockHeight = height;
          console.log(currentBlockHeight)
      })

      //Get active
      await governancequeryClient?.activeProposals({})
      .then(async (res) => {
        //Set active, completed & executed
        for (let i = 0; i < res.proposal_list.length; i++) {
          if (res.proposal_list[i].status == "active") {
            if (proposals.active[7][0] === undefined && proposals.active[i][0] === undefined){
              //Calc days left
              var daysLeft = (res.proposal_list[i].end_block - currentBlockHeight) * BLOCK_TIME_IN_SECONDS / SECONDS_PER_DAY;            
              //If height isn't queried set to 0
              //Once the query work's we'll have to change the logic anyway
              if (currentBlockHeight == 0) {
                daysLeft = 0;
              } 
              
              //Query total voting power
              await governancequeryClient?.totalVotingPower({
                proposalId: parseInt(res.proposal_list[i].proposal_id)
              }).then( async (vp_res) => {
                //Set total voting power
                var totalVotingPower = parseInt(vp_res);
                //Query Gov config
                await governancequeryClient?.config().then((config_res) => {
                  //Calc aligned power
                  //Sqrt_Root it if necessary
                  var aligned_power = parseInt(res.proposal_list[i].aligned_power);
                  if (config_res.quadratic_voting === true){
                    aligned_power = Math.sqrt(aligned_power);
                  }
                  //Calc quorum
                  var quorum = (parseInt(res.proposal_list[i].against_power) + parseInt(res.proposal_list[i].for_power) + aligned_power + parseInt(res.proposal_list[i].amendment_power) + parseInt(res.proposal_list[i].removal_power)) / totalVotingPower;
                  //Query config
                  //Set quorum from config
                  setQuorum(parseInt(config_res.proposal_required_quorum))
                  //Get current result
                  let current_result = getProposalResult(totalVotingPower, parseInt(res.proposal_list[i].for_power), parseInt(res.proposal_list[i].amendment_power), parseInt(res.proposal_list[i].removal_power), config_res)
                  //Update active
                  proposals.active[i] = [res.proposal_list[i], daysLeft, current_result, quorum] as [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined];
                })
              })
            }
          } else if (res.proposal_list[i].status == "executed") {
            if (proposals.executed[7][0] === undefined && proposals.executed[i][0] === undefined){
              //Get days left to execute
              //implementation todo
              var daysLeft = (res.proposal_list[i].end_block - currentBlockHeight) * BLOCK_TIME_IN_SECONDS / SECONDS_PER_DAY;            
              //Update executed
              proposals.executed[i] = [res.proposal_list[i], daysLeft, "Executed", 100] as [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined];
            }
          } else { //Completed
            if (proposals.completed[7][0] === undefined && proposals.completed[i][0] === undefined){
              //Get days left until expiration
              //implementation todo
              var daysLeft = (res.proposal_list[i].end_block - currentBlockHeight) * BLOCK_TIME_IN_SECONDS / SECONDS_PER_DAY;            
              //Update completed
              proposals.completed[i] = [res.proposal_list[i], daysLeft, "Completed", 100] as [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined];
            }
          }
        }
      })

      //Get pending
      await governancequeryClient?.pendingProposals({
        limit: 8,
      })
      .then((res) => {
        //Set pending
        for (let i = 0; i < res.proposal_list.length; i++) {
          if (proposals.pending[i][0] === undefined){
            //Push to front
            proposals.pending = ([[res.proposal_list[i], 1, "Pending", 0]] as [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][]).concat(proposals.pending)
            //pop end
            proposals.pending.pop()
        }
        }
      })

      //Set proposals
      setProposals(proposals)
    } catch (error) {
      console.log(error)
    }
  }
  
  const getProposalResult = (totalVotes: number, forVotes: number, amend: number, remove: number, config: Config) => {
    if (forVotes / totalVotes > parseInt(config.proposal_required_threshold)) {
      return "For";
    } else if (amend / totalVotes > parseInt(config.proposal_required_threshold)) {
      return "Amend";
    } else if (remove / totalVotes > parseInt(config.proposal_required_quorum)) {
      return "Remove";
    } else {
      return "Against";
    }
  }
  

  useEffect(() => {    
    Hotjar.init(siteId, hotjarVersion);
  }, []);

  useEffect(() => {

    if (prices.osmo === 0) {
      //Get prices
      queryPrices()
    }
    if (address !== undefined) {
      //setAddress
      setAddress(address as string)
      //Get account's balance of cDT
      oraclequeryClient?.client.getBalance(address as string, denoms.cdt).then((res) => {
        setwalletCDT(parseInt(res.amount));
      })
    }    
    if (positionID === "0"){
      //fetch & Update position data
      fetch_update_positionData()
    }
    /////Liquidation Page Queries
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
    ///Governance queries
    if (quorum === 0){
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
    if (walletMBRN === 0 && address !== undefined){
      //Get account's balance of MBRN
      governancequeryClient?.client.getBalance(address as string, denoms.mbrn).then((res) => {
        setwalletMBRN(parseInt(res.amount) / 1_000_000);
      })
    }
    if (maxCommission === 0){
      //Get staking max commission
      getStakingCommission()
    }
    
  }, [oraclequeryClient, cdpqueryClient, prices, address])

  const renderComponent = () => {
    if (activeComponent === 'dashboard') {
      return <Dashboard setActiveComponent={setActiveComponent}/>;
    } else if (activeComponent === 'vault') {
      // return <Positions cdp_client={cdp_client} queryClient={cdpqueryClient} address={address as string | undefined} pricez={prices} walletCDT={walletCDT}
      //     rateRes={rateRes} setrateRes={setrateRes} creditRateRes={creditRateRes} setcreditRateRes={setcreditRateRes} basketRes={basketRes} setbasketRes={setbasketRes}
      //     popupTrigger={popupTrigger} setPopupTrigger={setPopupTrigger} popupMsg={popupMsg} setPopupMsg={setPopupMsg} popupStatus={popupStatus} setPopupStatus={setPopupStatus}          
      //     osmoQTY={osmoQTY} setosmoQTY={setosmoQTY} atomQTY={atomQTY} setatomQTY={setatomQTY} axlusdcQTY={axlusdcQTY} setaxlusdcQTY={setaxlusdcQTY} atomosmo_poolQTY={atomosmo_poolQTY} setatomosmo_poolQTY={setatomosmo_poolQTY} osmousdc_poolQTY={osmousdc_poolQTY} setosmousdc_poolQTY={setosmousdc_poolQTY}          
      //     debtAmount={debtAmount} setdebtAmount={setdebtAmount} maxLTV={maxLTV} setmaxLTV={setmaxLTV} brwLTV={brwLTV} setbrwLTV={setbrwLTV} cost={cost} setCost={setCost} positionID={positionID} setpositionID={setpositionID} user_address={user_address} setAddress={setAddress} sliderValue={sliderValue} setsliderValue={setsliderValue} creditPrice={creditPrice} setcreditPrice={setcreditPrice}
      //     contractQTYs={contractQTYs} setcontractQTYs={setcontractQTYs}

      // />;
    } else if (activeComponent === 'liquidation') {
      return <LiquidationPools queryClient={liqqueuequeryClient} liq_queueClient={liq_queue_client} sp_queryClient={stabilitypoolqueryClient} sp_client={stability_pool_client} cdp_queryClient={cdpqueryClient} address={address as string | undefined} pricez={prices} index_lqClaimables={lqClaimables}
        capitalAhead={capitalAhead} userclosestDeposit={userclosestDeposit} userTVL={userTVL} TVL={spTVL} SPclaimables={SPclaimables} unstakingMsg={unstakingMsg} setunstakingMsg={setunstakingMsg} setSPclaimables={setSPclaimables} setTVL={setspTVL} setuserTVL={setuserTVL} setuserclosestDeposit={setuserclosestDeposit} setcapitalAhead={setcapitalAhead}
      />;
    } else if (activeComponent === 'staking') {
      return <Governance govClient={governance_client} stakingClient={staking_client} stakingQueryClient={stakingqueryClient} vestingClient={vesting_client} address={address as string | undefined} 
        Delegations={delegations} Delegators={delegators} quorum={quorum} Proposals={proposals} UserVP={userVP} EmissionsSchedule={emissionsSchedule} UserStake={userStake} UserClaims={userClaims} WalletMBRN={walletMBRN}
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
