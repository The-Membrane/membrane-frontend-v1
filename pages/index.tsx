import React from "react";
import { useRouter } from 'next/router';

import Dashboard from './Dashboard';
import { useEffect, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import LiquidationPools from './Liquidations';
import Lockdrop from './Lockdrop';
import Governance from './Governance';
import Positions from './Vaults';
import { useClients, useQueryClients } from '../hooks/use-clients';
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import Popup from "../components/Popup";
import Hotjar from '@hotjar/browser';
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Basket, CollateralInterestResponse, InterestResponse, RedeemabilityResponse } from "../codegen/positions/Positions.types";
import { ClaimsResponse } from "../codegen/liquidation_queue/LiquidationQueue.types";

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

  const [activeComponent, setActiveComponent] = useState('dashboard');
  
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(true);
  const [popupMsg, setPopupMsg] = useState<ReactJSXElement>(<div>HITTING THE CLOSE BUTTON OF THIS POP-UP IS ACKNOWLEDGEMENT OF & AGREEMENT TO THE FOLLOWING: This is experimental technology which may or may not be allowed in certain jurisdictions in the past/present/future, and it’s up to you to determine & accept all liability of use. This interface is for an externally deployed codebase that you are expected to do independent research for, for any additional understanding.</div>);
  const [popupStatus, setPopupStatus] = useState("User Agreement");
  
  //Get Clients
  const { cdp_client, launch_client, liq_queue_client, stability_pool_client, governance_client, staking_client, base_client, address } = useClients();
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
            //setLTVs
            //@ts-ignore
            setmaxLTV(parseFloat(userRes[0].positions[0].avg_max_LTV) * +100)
            //@ts-ignore
            setbrwLTV(parseFloat(userRes[0].positions[0].avg_borrow_LTV) * +100)
            
            
            //setAssetQTYs
            //@ts-ignore
            userRes[0].positions[0].collateral_assets.forEach(asset => {
                // @ts-ignore
                var actual_asset = asset.asset.info.native_token.denom;
                
                console.log("actual_asset: ", actual_asset)
                if (actual_asset === denoms.osmo) {
                    setosmoQTY(parseInt(asset.asset.amount) / 1_000_000)      
                } else if (actual_asset === denoms.atom) {
                    setatomQTY(parseInt(asset.asset.amount) / 1_000_000)
                } else if (actual_asset === denoms.axlUSDC) {
                    setaxlusdcQTY(parseInt(asset.asset.amount) / 1_000_000)
                } else if (actual_asset === denoms.atomosmo_pool) {
                    setatomosmo_poolQTY(Number(BigInt(parseInt(asset.asset.amount))/1_000_000_000_000_000_000n))
                } else if (actual_asset === denoms.osmousdc_pool) {
                    setosmousdc_poolQTY(Number(BigInt(parseInt(asset.asset.amount))/1_000_000_000_000_000_000n))
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
                }
                
            }
        }
        
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
    
  }, [oraclequeryClient, cdpqueryClient, prices, address])

  const renderComponent = () => {
    if (activeComponent === 'dashboard') {
      return <Dashboard setActiveComponent={setActiveComponent}/>;
    } else if (activeComponent === 'vault') {
      return <Positions cdp_client={cdp_client} queryClient={cdpqueryClient} address={address as string | undefined} pricez={prices} walletCDT={walletCDT}
          rateRes={rateRes} setrateRes={setrateRes} creditRateRes={creditRateRes} setcreditRateRes={setcreditRateRes} basketRes={basketRes} setbasketRes={setbasketRes}
          popupTrigger={popupTrigger} setPopupTrigger={setPopupTrigger} popupMsg={popupMsg} setPopupMsg={setPopupMsg} popupStatus={popupStatus} setPopupStatus={setPopupStatus}          
          osmoQTY={osmoQTY} setosmoQTY={setosmoQTY} atomQTY={atomQTY} setatomQTY={setatomQTY} axlusdcQTY={axlusdcQTY} setaxlusdcQTY={setaxlusdcQTY} atomosmo_poolQTY={atomosmo_poolQTY} setatomosmo_poolQTY={setatomosmo_poolQTY} osmousdc_poolQTY={osmousdc_poolQTY} setosmousdc_poolQTY={setosmousdc_poolQTY}          
          debtAmount={debtAmount} setdebtAmount={setdebtAmount} maxLTV={maxLTV} setmaxLTV={setmaxLTV} brwLTV={brwLTV} setbrwLTV={setbrwLTV} cost={cost} setCost={setCost} positionID={positionID} setpositionID={setpositionID} user_address={user_address} setAddress={setAddress} sliderValue={sliderValue} setsliderValue={setsliderValue} creditPrice={creditPrice} setcreditPrice={setcreditPrice}

      />;
    } else if (activeComponent === 'liquidation') {
      return <LiquidationPools queryClient={liqqueuequeryClient} liq_queueClient={liq_queue_client} sp_queryClient={stabilitypoolqueryClient} sp_client={stability_pool_client} cdp_queryClient={cdpqueryClient} address={address as string | undefined} pricez={prices} index_lqClaimables={lqClaimables}
        capitalAhead={capitalAhead} userclosestDeposit={userclosestDeposit} userTVL={userTVL} TVL={spTVL} SPclaimables={SPclaimables} unstakingMsg={unstakingMsg} setunstakingMsg={setunstakingMsg} setSPclaimables={setSPclaimables} setTVL={setspTVL} setuserTVL={setuserTVL} setuserclosestDeposit={setuserclosestDeposit} setcapitalAhead={setcapitalAhead}
      />;
    } else if (activeComponent === 'staking') {
      return <Governance govClient={governance_client} govQueryClient={governancequeryClient} stakingClient={staking_client} stakingQueryClient={stakingqueryClient} address={address as string | undefined} />;
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
