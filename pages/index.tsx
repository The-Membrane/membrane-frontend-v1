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
import { RedeemabilityResponse } from "../codegen/positions/Positions.types";

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
  const [walletCDT, setwalletCDT] = useState(0);

  ////Positions////
  
  //Redemptions
  const [posClick, setposClick] = useState("mint-button-icon3");
  const [negClick, setnegClick] = useState("mint-button-icon4");
  const [redeemScreen, setredeemScreen] = useState("redemption-screen");
  const [redeemInfoScreen, setredeemInfoScreen] = useState("redemption-screen");
  const [redeemButton, setredeemButton] = useState("user-redemption-button");
  const [redeemability, setRedeemability] = useState<boolean>();
  const [premium, setPremium] = useState<number>(0);
  const [loanUsage, setloanUsage] = useState<string>("");
  //Asset specific
      //qty
  const [osmoQTY, setosmoQTY] = useState(0);
  const [atomQTY, setatomQTY] = useState(0);
  const [axlusdcQTY, setaxlusdcQTY] = useState(0);
  const [atomosmo_poolQTY, setatomosmo_poolQTY] = useState(0);
  const [osmousdc_poolQTY, setosmousdc_poolQTY] = useState(0);
      //style
  const [osmoStyle, setosmoStyle] = useState("low-opacity");
  const [atomStyle, setatomStyle] = useState("low-opacity");
  const [axlusdcStyle, setaxlusdcStyle] = useState("low-opacity");
  const [atomosmo_poolStyle, setatomosmo_poolStyle] = useState("low-opacity");
  const [osmousdc_poolStyle, setosmousdc_poolStyle] = useState("low-opacity");
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

        //getPosition
        const userRes = await cdpqueryClient?.getBasketPositions(
            {
                user: address as string,
            }
        );
        
        //query rates
        const rateRes = await cdpqueryClient?.getCollateralInterest();
        const creditRateRes = await cdpqueryClient?.getCreditRate();


        // console.log("userRes: ", userRes)
        //Set state
        if (userRes != undefined){
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
                    setosmoStyle("");
                } else if (actual_asset === denoms.atom) {
                    setatomQTY(parseInt(asset.asset.amount) / 1_000_000)
                    setatomStyle("");
                } else if (actual_asset === denoms.axlUSDC) {
                    setaxlusdcQTY(parseInt(asset.asset.amount) / 1_000_000)
                    setaxlusdcStyle("");
                } else if (actual_asset === denoms.atomosmo_pool) {
                    setatomosmo_poolQTY(parseInt(asset.asset.amount))
                    setatomosmo_poolStyle("");
                } else if (actual_asset === denoms.osmousdc_pool) {
                    setosmousdc_poolQTY(parseInt(asset.asset.amount))
                    setosmousdc_poolStyle("");
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
      if (positionID === "0"){
        //fetch & Update position data
        fetch_update_positionData()
      }
    }
    
  }, [oraclequeryClient, cdpqueryClient, prices, address])

  const renderComponent = () => {
    if (activeComponent === 'dashboard') {
      return <Dashboard setActiveComponent={setActiveComponent}/>;
    } else if (activeComponent === 'vault') {
      return <Positions cdp_client={cdp_client} queryClient={cdpqueryClient} address={address as string | undefined} pricez={prices} walletCDT={walletCDT}
          popupTrigger={popupTrigger} setPopupTrigger={setPopupTrigger} popupMsg={popupMsg} setPopupMsg={setPopupMsg} popupStatus={popupStatus} setPopupStatus={setPopupStatus}
          posClick={posClick} setposClick={setposClick} negClick={negClick} setnegClick={setnegClick} redeemScreen={redeemScreen} setredeemScreen={setredeemScreen} redeemInfoScreen={redeemInfoScreen} setredeemInfoScreen={setredeemInfoScreen} redeemButton={redeemButton} setredeemButton={setredeemButton} redeemability={redeemability} setRedeemability={setRedeemability} premium={premium} setPremium={setPremium} loanUsage={loanUsage} setloanUsage={setloanUsage}
          osmoQTY={osmoQTY} setosmoQTY={setosmoQTY} atomQTY={atomQTY} setatomQTY={setatomQTY} axlusdcQTY={axlusdcQTY} setaxlusdcQTY={setaxlusdcQTY} atomosmo_poolQTY={atomosmo_poolQTY} setatomosmo_poolQTY={setatomosmo_poolQTY} osmousdc_poolQTY={osmousdc_poolQTY} setosmousdc_poolQTY={setosmousdc_poolQTY}
          osmoStyle={osmoStyle} setosmoStyle={setosmoStyle} atomStyle={atomStyle} setatomStyle={setatomStyle} axlusdcStyle={axlusdcStyle} setaxlusdcStyle={setaxlusdcStyle} atomosmo_poolStyle={atomosmo_poolStyle} setatomosmo_poolStyle={setatomosmo_poolStyle} osmousdc_poolStyle={osmousdc_poolStyle} setosmousdc_poolStyle={setosmousdc_poolStyle}
          debtAmount={debtAmount} setdebtAmount={setdebtAmount} maxLTV={maxLTV} setmaxLTV={setmaxLTV} brwLTV={brwLTV} setbrwLTV={setbrwLTV} cost={cost} setCost={setCost} positionID={positionID} setpositionID={setpositionID} user_address={user_address} setAddress={setAddress} sliderValue={sliderValue} setsliderValue={setsliderValue} creditPrice={creditPrice} setcreditPrice={setcreditPrice}

      />;
    } else if (activeComponent === 'liquidation') {
      return <LiquidationPools queryClient={liqqueuequeryClient} liq_queueClient={liq_queue_client} sp_queryClient={stabilitypoolqueryClient} sp_client={stability_pool_client} cdp_queryClient={cdpqueryClient} address={address as string | undefined} prices={prices} />;
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
