import { useEffect, useState } from "react";
import React from "react";
import { useChain } from '@cosmos-kit/react';
import { chainName, testnetAddrs } from '../config';

import { Coin, coin, coins } from "@cosmjs/amino";
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import { PositionsMsgComposer } from "../codegen/positions/Positions.message-composer";
import { Asset, Basket, CollateralInterestResponse, InterestResponse, RedeemabilityResponse } from "../codegen/positions/Positions.types";
import { Prices } from ".";
import { denoms } from "../config";
import Popup from "../components/Popup";
import WidgetPopup from "../components/widgetPopup";
import Image from "next/image";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { onStableswapTextClick } from "./Dashboard";
import { formatNumber } from "./Liquidations";
import BigNumber from "bignumber.js";


declare module 'react' {
    export interface InputHTMLAttributes<T> {
      orient?: string;
    }
  }
export interface ContractInfo {
    osmo: number,
    atom: number,
    axlusdc: number,
    usdc: number,
    stAtom: number,
    stOsmo: number,
    tia: number,
    usdt: number,
    atomosmo_pool: string,
    osmousdc_pool: string,
    max_LTV: number,
    brw_LTV: number,
    cost: number,
    sliderValue: number,
}
export interface CollateralAssets {
    osmo: number | undefined,
    atom: number | undefined,
    axlusdc: number | undefined,
    usdc: number | undefined,
    stAtom: number | undefined,
    stOsmo: number | undefined,
    tia: number | undefined,
    usdt: number | undefined,
    atomosmo_pool: string | undefined,
    osmousdc_pool: string | undefined,
}
export interface DefinedCollateralAssets {
    osmo: number,
    atom: number,
    axlusdc: number,
    usdc: number,
    stAtom: number,
    stOsmo: number,
    tia: number,
    usdt: number,
    atomosmo_pool: string,
    osmousdc_pool: string,
}

interface Props {
    cdp_client: PositionsClient | null;
    queryClient: PositionsQueryClient | null;
    address: string | undefined;
    walletCDT: number;
    pricez: Prices;
    rateRes: CollateralInterestResponse | undefined;
    setrateRes: (rateRes: CollateralInterestResponse) => void;
    creditRateRes: InterestResponse | undefined;
    setcreditRateRes: (creditRateRes: InterestResponse) => void;
    basketRes: Basket | undefined;
    setbasketRes: (basketRes: Basket) => void;
    //State
    popupTrigger: boolean;
    setPopupTrigger: (popupTrigger: boolean) => void;
    popupMsg: ReactJSXElement;
    setPopupMsg: (popupMsg: ReactJSXElement) => void;
    popupStatus: string;
    setPopupStatus: (popupStatus: string) => void;
    //Asset specific
        //qty
    positionQTYz: DefinedCollateralAssets;
    //Positions Visual
    debtAmount: number;
    setdebtAmount: (debtAmount: number) => void;
    maxLTV: number;
    setmaxLTV: (maxLTV: number) => void;
    brwLTV: number;
    setbrwLTV: (brwLTV: number) => void;
    positionID: string;
    setpositionID: (positionID: string) => void;
    user_address: string;
    setAddress: (user_address: string) => void;
    sliderValue: number;
    setsliderValue: (sliderValue: number) => void;
    creditPrice: number;
    setcreditPrice: (creditPrice: number) => void;
    contractQTYz: ContractInfo;
    walletQTYz: CollateralAssets;
    walletChecked: boolean;
    positionChecked: boolean;
    //Functions
    fetch_update_positionData: () => void;
}
    
   export function getassetRatios(TVL: number, positionQTYs: DefinedCollateralAssets, prices: Prices) {
    if (TVL === 0){
        return(
            {
                osmo: 0,
                atom: 0,
                axlusdc: 0,
                usdc: 0,
                stAtom: 0,
                stOsmo: 0,
                tia: 0,
                usdt: 0,
                atomosmo_pool: 0,
                osmousdc_pool: 0,
            }
        )
    }
    return(
        {
            osmo: (positionQTYs.osmo * +prices.osmo) / TVL,
            atom: (positionQTYs.atom * +prices.atom) / TVL,
            axlusdc: (positionQTYs.axlusdc * +prices.axlUSDC) /TVL,
            usdc: (positionQTYs.usdc * +prices.usdc) /TVL,
            stAtom: (positionQTYs.stAtom * +prices.stAtom) /TVL,
            stOsmo: (positionQTYs.stOsmo * +prices.stOsmo) /TVL,
            tia: (positionQTYs.tia * +prices.tia) /TVL,
            usdt: (positionQTYs.usdt * +prices.usdt) /TVL,
            atomosmo_pool: parseFloat((BigNumber(positionQTYs.atomosmo_pool).times(BigNumber(prices.atomosmo_pool)).dividedBy(BigNumber(TVL))).toString()),
            osmousdc_pool: parseFloat((BigNumber(positionQTYs.osmousdc_pool).times(BigNumber(prices.osmousdc_pool)).dividedBy(BigNumber(TVL))).toString()),
        }
    )
   }

   /// Get pro-rata LTV
   export function getRataLTV(TVL: number, positionQTYs: DefinedCollateralAssets, prices: Prices, basketRes: Basket | undefined) {
    var ratios = getassetRatios(TVL, positionQTYs, prices);
    var maxLTV = 0;
    var brwLTV = 0;
    
    basketRes?.collateral_types.forEach((collateral) => {      
        //@ts-ignore
        if (collateral.asset.info.native_token.denom === denoms.osmo){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.osmo;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.osmo;  
        //@ts-ignore          
        } else if (collateral.asset.info.native_token.denom === denoms.atom){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.atom;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.atom;   
        //@ts-ignore          
        } else if (collateral.asset.info.native_token.denom === denoms.axlUSDC){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.axlusdc;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.axlusdc;  
        //@ts-ignore          
        } else if (collateral.asset.info.native_token.denom === denoms.usdc){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.usdc;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.usdc;
        //@ts-ignore
        } else if (collateral.asset.info.native_token.denom === denoms.stAtom){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.stAtom;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.stAtom;  
        //@ts-ignore
        } else if (collateral.asset.info.native_token.denom === denoms.stOsmo){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.stOsmo;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.stOsmo;
        //@ts-ignore
        } else if (collateral.asset.info.native_token.denom === denoms.tia){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.tia;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.tia;
        //@ts-ignore
        } else if (collateral.asset.info.native_token.denom === denoms.usdt){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.usdt;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.usdt;
        //@ts-ignore
        } else if (collateral.asset.info.native_token.denom === denoms.atomosmo_pool){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.atomosmo_pool;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.atomosmo_pool;
            console.log("atomosmo_pool", maxLTV, brwLTV, ratios.atomosmo_pool)
        //@ts-ignore           
        } else if (collateral.asset.info.native_token.denom === denoms.osmousdc_pool){
            maxLTV += (parseFloat(collateral.max_LTV) * +100) * ratios.osmousdc_pool;
            brwLTV += (parseFloat(collateral.max_borrow_LTV) * +100) * ratios.osmousdc_pool;  
        }
    });

    return( [brwLTV, maxLTV] )
   }

const Positions = ({cdp_client, queryClient, address, walletCDT, pricez, 
    popupTrigger, setPopupTrigger, popupMsg, setPopupMsg, popupStatus, setPopupStatus,
    rateRes, setrateRes, creditRateRes, basketRes, setcreditRateRes, setbasketRes,
    positionQTYz,
    debtAmount, setdebtAmount,
    maxLTV, setmaxLTV,
    brwLTV, setbrwLTV,
    positionID, setpositionID,
    user_address, setAddress,
    sliderValue, setsliderValue,
    creditPrice, setcreditPrice,
    contractQTYz,
    walletQTYz, walletChecked, positionChecked,
    fetch_update_positionData,
}: Props) => {
    //WidgetPopup
    const [widgetpopupTrigger, setWidgetPopupTrigger] = useState(false);
    const [popupWidget, setPopupWidget] = useState<ReactJSXElement>();
    const [widgetpopupStatus, setWidgetPopupStatus] = useState("");

    const { connect } = useChain(chainName);
    //Rates
    const [rates, setRates] = useState<Prices>({
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
    //Debt Caps
    const [debtCaps, setdebtCaps] = useState<Prices>({
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
    
    //Redemptions
    const [redeemability, setRedeemability] = useState<boolean>();
    const [premium, setPremium] = useState<number>(0);
    const [loanUsage, setloanUsage] = useState<string>("");
    const [restrictedAssets, setRestricted] = useState({
        sentence: "Click Assets on the left to restrict redemption from, currently restricted: ",
        readable_assets: [] as string[],
        assets: [] as string[],
    });
    //Deposit-Withdraw screen
    const [currentfunctionLabel, setcurrentfunctionLabel] = useState("deposit");
    const [currentAsset, setcurrentAsset] = useState("");
    const [assetIntent, setassetIntent] = useState<[string , number][]>([]);
    const [amount, setAmount] = useState<number>(0);
    //Deposit-withdraw Card
    const [depositAmounts, setdepositAmounts] = useState<CollateralAssets>({
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
    const [walletQTYs, setwalletQTYs] = useState<DefinedCollateralAssets>({
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
    const [assetcardTitle, setassetcardTitle] = useState("Show All Assets");
    //Mint-Repay card
    const [mintAmount, setmintAmount] = useState<number | undefined>();
    const [repayAmount, setrepayAmount] = useState<number | undefined>();
    //Menu
    const [open, setOpen] = useState(false);
    const [menuLabel, setMenuLabel] = useState("Value" as string);

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

    const handleOpen = () => {
        setOpen(!open);
      };
      const handleMenuOne = () => {
        setOpen(false);
        setMenuLabel("Rate");
      };
      const handleMenuTwo = () => {
        setOpen(false);
        setMenuLabel("Util");
      };
      const handleMenuThree = () => {
        setOpen(false);
        setMenuLabel("Value");
      };

    const resetPositionQTYs = () => {
        //set position QTYs to contract QTYs
        setpositionQTYs({
            osmo: contractQTYs.osmo,
            atom: contractQTYs.atom,
            axlusdc: contractQTYs.axlusdc,
            usdc: contractQTYs.usdc,
            stAtom: contractQTYs.stAtom,
            stOsmo: contractQTYs.stOsmo,
            tia: contractQTYs.tia,
            usdt: contractQTYs.usdt,
            atomosmo_pool: contractQTYs.atomosmo_pool,
            osmousdc_pool: contractQTYs.osmousdc_pool,
        });
    }
    // const handlecontractQTYupdate = () => {        
    //     //Set new LTVs & costs
    //     let LTVs = getRataLTV(getTVL(), positionQTYs, prices, basketRes);
    //     let cost = getRataCost();
    //     //@ts-ignore
    //     setcontractQTYs(prevState => {
    //         return { 
    //             ...prevState,
    //             max_LTV: LTVs[1],
    //             brw_LTV: LTVs[0],
    //             cost: cost
    //         }
    //     })
    //     //Set QTYs
    //     switch (currentAsset) {
    //         case "OSMO": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         osmo: +prevState.osmo + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         osmo: +prevState.osmo - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //         case "ATOM": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         atom: +prevState.atom + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         atom: +prevState.atom - +(amount??0),
    //                     }
    //                 })
    //             }
                
    //             break;
    //         }
    //         case "axlUSDC": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         axlusdc: +prevState.axlusdc + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         axlusdc: +prevState.axlusdc - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //         case "USDC": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         usdc: +prevState.usdc + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         usdc: +prevState.usdc - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //         case "stATOM": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         stAtom: +prevState.stAtom + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         stAtom: +prevState.stAtom - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //         case "stOSMO": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         stOsmo: +prevState.stOsmo + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         stOsmo: +prevState.stOsmo - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //         case "TIA": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         tia: +prevState.tia + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         tia: +prevState.tia - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //         case "USDT": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs((prevState: ContractInfo) => {
    //                     return { 
    //                         ...prevState,
    //                         usdt: +prevState.usdt + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs((prevState: ContractInfo) => {
    //                     return { 
    //                         ...prevState,
    //                         usdt: +prevState.usdt - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //         case "ATOM-OSMO LP": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         atomosmo_pool: +prevState.atomosmo_pool + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         atomosmo_pool: +prevState.atomosmo_pool - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //         case "OSMO-axlUSDC LP": {
    //             if (currentfunctionLabel === "deposit"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         osmousdc_pool: +prevState.osmousdc_pool + +(amount??0),
    //                     }
    //                 })
    //             }
    //             else if (currentfunctionLabel === "withdraw"){
    //                 //@ts-ignore
    //                 setcontractQTYs(prevState => {
    //                     return { 
    //                         ...prevState,
    //                         osmousdc_pool: +prevState.osmousdc_pool - +(amount??0),
    //                     }
    //                 })
    //             }
    //             break;
    //         }
    //     }
    // }
    const handleExecution = async (fn?: string) => {
        //Test double msg signs
        if (false){
            const cdp_composer = new PositionsMsgComposer(user_address, testnetAddrs.positions);
            let accrue_msg = cdp_composer.accrue({positionIds: [positionID]});
            await cdp_client?.client.signAndBroadcast(user_address, [accrue_msg], "auto",).then((res) => {console.log(res)});
        }

        //Set function label if passed
        var currentfunction_label = fn ?? currentfunctionLabel;
        //Check if wallet is connected & connect if not
        if (address === undefined) {
            connect();
            return;
        }
        ///Set asset intents
        var asset_intent: [string, number | string][] = [];
        if (depositAmounts.osmo != undefined && depositAmounts.osmo > 0){
            asset_intent.push(["OSMO", depositAmounts.osmo])
        }
        if (depositAmounts.atom != undefined && depositAmounts.atom > 0){
            asset_intent.push(["ATOM", depositAmounts.atom])
        }
        if (depositAmounts.usdc != undefined && depositAmounts.usdc > 0){
            asset_intent.push(["USDC", depositAmounts.usdc])
        }
        if (depositAmounts.axlusdc != undefined && depositAmounts.axlusdc > 0){
            asset_intent.push(["axlUSDC", depositAmounts.axlusdc])
        }
        if (depositAmounts.stAtom != undefined && depositAmounts.stAtom > 0){
            asset_intent.push(["stATOM", depositAmounts.stAtom])
        }
        if (depositAmounts.stOsmo != undefined && depositAmounts.stOsmo > 0){
            asset_intent.push(["stOSMO", depositAmounts.stOsmo])
        }
        if (depositAmounts.tia != undefined && depositAmounts.tia > 0){
            asset_intent.push(["TIA", depositAmounts.tia])
        }
        if (depositAmounts.usdt != undefined && depositAmounts.usdt > 0){
            asset_intent.push(["USDT", depositAmounts.usdt])
        }
        if (depositAmounts.atomosmo_pool != undefined && depositAmounts.atomosmo_pool !== "0"){
            asset_intent.push(["ATOM-OSMO LP", depositAmounts.atomosmo_pool])
        }
        if (depositAmounts.osmousdc_pool != undefined && depositAmounts.osmousdc_pool !== "0"){
            asset_intent.push(["OSMO-axlUSDC LP", depositAmounts.osmousdc_pool])
        }

        //switch on functionality
        switch (currentfunction_label){
            case "deposit":{
                var user_coins = getcoinsfromassetIntents(asset_intent);
                //Coins must be in order to send to contract
                user_coins.sort((a, b) => a.denom < b.denom ? -1 : 1,);

                try {
                    ////Execute Deposit////
                    await cdp_client?.deposit({
                        positionId: (positionID === "0" ? undefined : positionID),
                        positionOwner: user_address,
                    },
                    "auto", undefined, user_coins).then(async (res) => {
                        console.log(res?.events.toString())
                        //format pop up
                        setPopupTrigger(true);
                        //map asset intents to readable string
                        var readable_asset_intent = asset_intent.map((asset) => {
                            return asset[1] + " " + asset[0]
                        })
                        setPopupMsg(<div>Deposit of {readable_asset_intent} successful</div>);
                        setPopupStatus("Success");   
                        //Requery position
                        fetch_update_positionData();
                    });
                    //

                    //Clear intents
                    setassetIntent([])
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    //This is a success msg but a cosmjs error
                    if (e.message === "Invalid string. Length must be a multiple of 4"){
                        //format pop up
                        setPopupTrigger(true);
                        //map asset intents to readable string
                        var readable_asset_intent = asset_intent.map((asset) => {
                            return asset[1] + " " + asset[0]
                        })
                        setPopupMsg(<div>Deposit of {readable_asset_intent} successful</div>);
                        setPopupStatus("Success");   
                        //Requery position
                        fetch_update_positionData();
                    } else {
                        ///Format Pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>{e.message}</div>);
                        setPopupStatus("Deposit Error");
                    }
                }
               break;
            }
            case "withdraw":{
                ///parse assets into coin amounts
                var assets = getassetsfromassetIntents(asset_intent);
                
                try {
                    ////Execute Withdraw////
                    await cdp_client?.withdraw({
                        assets: assets,
                        positionId: positionID,
                    },
                    "auto").then((res) => {       
                        console.log(res?.events.toString())   
                        //map asset intents to readable string
                        let readable_asset_intent = asset_intent.map((asset) => {
                            return asset[1] + " " + asset[0]
                        })
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Withdrawal of {readable_asset_intent} successful</div>);
                        setPopupStatus("Success");     
                        //Requery position
                        fetch_update_positionData();
                    })

                    //Clear intents
                    setassetIntent([])
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    //This is a success msg but a cosmjs error
                    if (e.message === "Invalid string. Length must be a multiple of 4"){
                        //map asset intents to readable string
                        let readable_asset_intent = asset_intent.map((asset) => {
                            return asset[1] + " " + asset[0]
                        })
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Withdrawal of {readable_asset_intent} successful</div>);
                        setPopupStatus("Success");       
                        //Requery position
                        fetch_update_positionData();
                    } else {
                        ///Format Pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>{e.message}</div>);
                        setPopupStatus("Withdrawal Error");
                    }
                } 
                break;
            }
            case "mint": {                
                try {
                    ///Execute the Mint
                    await cdp_client?.increaseDebt({
                        positionId: positionID,
                        amount: ((mintAmount ?? 0) * 1_000_000).toString(),
                    }, "auto", undefined).then((res) => {           
                        console.log(res?.events.toString())             
                        //Update mint amount
                        setdebtAmount(+debtAmount + +((mintAmount ?? 0) * 1_000_000));
                        setsliderValue((+debtAmount + +((mintAmount ?? 0) * 1_000_000))/1000000);
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(
                            <div>
                                Mint of {(mintAmount ?? 0)} CDT into your wallet successful. Be aware that now that you have minted, you cannot withdraw collateral that would push your LTV past the borrowable LTV line & you will be liquidated down to said LTV if you reach the Max LTV. Also, you cannot pay below minimum debt so if you have minted at the minimum you will need to repay in full + interest.
                            <p/>
                            <p className="dash-stats mobile-font">
                                Provide Liquidity to the CDT&nbsp;<a style={{cursor:"pointer", textDecoration:"underline"}} onClick={onStableswapTextClick}>stableswap</a>&nbsp;on Osmosis for ~30%+ APR
                            </p>
                            </div>
                                );
                        setPopupStatus("Success");
                    })
                    
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)                    
                    //This is a success msg but a cosmjs error
                    if (e.message === "Invalid string. Length must be a multiple of 4"){
                        //Update mint amount
                        setdebtAmount(+debtAmount + +((mintAmount ?? 0) * 1_000_000));
                        setsliderValue((+debtAmount + +((mintAmount ?? 0) * 1_000_000))/1000000);
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(
                            <div>
                                Mint of {(mintAmount ?? 0)} CDT into your wallet successful. Be aware that now that you have minted, you cannot withdraw collateral that would push your LTV past the borrowable LTV line & you will be liquidated down to said LTV if you reach the Max LTV. Also, you cannot pay below minimum debt so if you have minted at the minimum you will need to repay in full + interest.
                            <p/>
                            <p className="dash-stats mobile-font">
                                Provide Liquidity to the CDT&nbsp;<a style={{cursor:"pointer", textDecoration:"underline"}} onClick={onStableswapTextClick}>stableswap</a>&nbsp;on Osmosis for ~10%+ APR
                            </p>
                            </div>
                                );
                        setPopupStatus("Success");
                    } else {
                        ///Format Pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>{e.message}</div>);
                        setPopupStatus("Mint Error");
                    }
                }
                
                break;
            } 
            case "repay": {
                let repay_amount = ((repayAmount ?? 0)* 1_000_000);
                if (((repayAmount ?? 0)* 1_000_000) >= debtAmount) { 
                    repay_amount = (walletCDT* 1_000_000);
                }
                try {
                    ///Execute the Repay
                    await cdp_client?.repay({
                        positionId: positionID,
                    }, "auto", undefined, coins(repay_amount, denoms.cdt)).then((res) => {           
                        console.log(res?.events.toString())
                        //Update mint amount
                        setdebtAmount(+debtAmount - +(repay_amount* 1_000_000));
                        setsliderValue((+debtAmount - +(repay_amount* 1_000_000))/1000000);
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Repayment of {repay_amount} CDT successful</div>);
                        setPopupStatus("Success");
                    })
                    
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    //This is a success msg but a cosmjs error
                    if (e.message === "Invalid string. Length must be a multiple of 4"){
                        //Update mint amount
                        setdebtAmount(+debtAmount - +(repay_amount* 1_000_000));
                        setsliderValue((+debtAmount - +(repay_amount* 1_000_000))/1000000);
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Repayment of {repay_amount} CDT successful</div>);
                        setPopupStatus("Success");
                    } else {                            
                        ///Format Pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>{e.message}</div>);
                        setPopupStatus("Repay Error");
                    }
                }
                break;                
            }
            case "redemptions": {
                try {                    
                    ///Execute the contract
                    await cdp_client?.editRedeemability(
                    {
                        positionIds: [positionID],
                        maxLoanRepayment: loanUsage ?? undefined,
                        premium: premium ?? undefined,
                        redeemable: redeemability ?? undefined,
                        restrictedCollateralAssets: restrictedAssets.assets ?? undefined,
                    }, "auto", undefined).then(async (res) => {
                        console.log(res?.events.toString())
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Redemption settings updated successfully</div>);
                        setPopupStatus("Success");
                    })

                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    //This is a success msg but a cosmjs error
                    if (e.message === "Invalid string. Length must be a multiple of 4"){
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>Redemption settings updated successfully</div>);
                        setPopupStatus("Success");
                    } else {
                        ///Format Pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>{e.message}</div>);
                        setPopupStatus("Edit Redemption Info Error");
                    }
                }
            }
        }

    };
    //we add decimals to the asset amounts
    const getcoinsfromassetIntents = (intents: [string, number | string][]) => {
        var workingIntents: Coin[] = [];
        intents.map((intent) => {
            switch (intent[0]){
                case "OSMO": {
                    workingIntents.push(coin(intent[1] as number * 1_000_000, denoms.osmo))
                    break;
                }
                case "ATOM": {
                    workingIntents.push(coin(intent[1] as number * 1_000_000, denoms.atom))
                    break;
                }
                case "axlUSDC": {
                    workingIntents.push(coin(intent[1] as number * 1_000_000, denoms.axlUSDC))
                    break;
                }                
                case "USDC": {
                    workingIntents.push(coin(intent[1] as number * 1_000_000, denoms.usdc))
                    break;
                }      
                case "stATOM": {
                    workingIntents.push(coin(intent[1] as number * 1_000_000, denoms.stAtom))
                    break;
                }      
                case "stOSMO": {
                    workingIntents.push(coin(intent[1] as number * 1_000_000, denoms.stOsmo))
                    break;
                }
                case "TIA": {
                    workingIntents.push(coin(intent[1] as number * 1_000_000, denoms.tia))
                    break;
                }
                case "USDT": {
                    workingIntents.push(coin(intent[1] as number * 1_000_000, denoms.usdt))
                    break;
                }
                case "ATOM-OSMO LP": { 
                    workingIntents.push(coin((BigInt(intent[1]) * 1_000_000_000_000_000_000n).toString(), denoms.atomosmo_pool))
                    break;
                }
                case "OSMO-axlUSDC LP": {
                    workingIntents.push(coin((BigInt(intent[1]) * 1_000_000_000_000_000_000n).toString(), denoms.osmousdc_pool))
                    break;
                }
            }
        })
        return workingIntents
    };
    const getassetsfromassetIntents = (intents: [string, number | string][]) => {
        var workingIntents: Asset[] = [];
        intents.map((intent) => {
            switch (intent[0]){
                case "OSMO": {
                    workingIntents.push({
                        amount: (intent[1] as number * 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.osmo,
                        }}
                    })
                    break;
                }
                case "ATOM": {
                    workingIntents.push({
                        amount: (intent[1] as number * 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.atom,
                        }}
                    })
                    break;
                }
                case "axlUSDC": {
                    workingIntents.push({
                        amount: (intent[1] as number * 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.axlUSDC,
                        }}
                    })
                    break;
                }
                case "USDC": {
                    workingIntents.push({
                        amount: (intent[1] as number * 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.usdc,
                        }}
                    })
                    break;
                }
                case "stATOM": {
                    workingIntents.push({
                        amount: (intent[1] as number * 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.stAtom,
                        }}
                    })
                    break;
                }
                case "stOSMO": {
                    workingIntents.push({
                        amount: (intent[1] as number * 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.stOsmo,
                        }}
                    })
                    break;
                }
                case "TIA": {
                    workingIntents.push({
                        amount: (intent[1] as number * 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.tia,
                        }}
                    })
                    break;
                }
                case "USDT": {
                    workingIntents.push({
                        amount: (intent[1] as number * 1_000_000).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.usdt,
                        }}
                    })
                    break;
                }
                case "ATOM-OSMO LP": { //18 decimal instead of 6
                    workingIntents.push({
                        amount: (BigInt(intent[1]) * (1_000_000_000_000_000_000n)).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.atomosmo_pool,
                        }}
                    })
                    break;
                }
                case "OSMO-axlUSDC LP": { //18 decimal instead of 6
                    workingIntents.push({
                        amount: (BigInt(intent[1]) * (1_000_000_000_000_000_000n)).toString(),
                        //@ts-ignore
                        info: {native_token :{
                            //@ts-ignore
                            denom: denoms.osmousdc_pool,
                        }}
                    })
                    break;
                }
            }
        })
        return workingIntents
    };
      
   const onTFMTextClick = () => {
        window.open(
        "https://tfm.com/ibc"
        );
   };  

   function getLPValue(QTY: string, price: number) {
        return parseFloat((BigNumber(QTY).times(BigNumber(price))).toString())
   }
   function istheUserWithdrawing() {
        //Withdraws
        if (contractQTYs.osmo > positionQTYs.osmo || contractQTYs.atom > positionQTYs.atom || contractQTYs.axlusdc > positionQTYs.axlusdc || contractQTYs.usdc > positionQTYs.usdc || contractQTYs.stAtom > positionQTYs.stAtom || contractQTYs.stOsmo > positionQTYs.stOsmo || contractQTYs.tia > positionQTYs.tia || contractQTYs.usdt > positionQTYs.usdt || contractQTYs.atomosmo_pool > positionQTYs.atomosmo_pool || contractQTYs.osmousdc_pool > positionQTYs.osmousdc_pool){
            return true
        }
        //Deposits
        if (contractQTYs.osmo < positionQTYs.osmo || contractQTYs.atom < positionQTYs.atom || contractQTYs.axlusdc < positionQTYs.axlusdc || contractQTYs.usdc < positionQTYs.usdc || contractQTYs.stAtom < positionQTYs.stAtom || contractQTYs.stOsmo < positionQTYs.stOsmo || contractQTYs.tia < positionQTYs.tia || contractQTYs.usdt < positionQTYs.usdt || contractQTYs.atomosmo_pool < positionQTYs.atomosmo_pool || contractQTYs.osmousdc_pool < positionQTYs.osmousdc_pool){
            return false
        }
        return undefined
   }

   function getTVL(QTYs: DefinedCollateralAssets) {
    return(
        (QTYs.osmo * +prices.osmo) + (QTYs.atom * +prices.atom) + (QTYs.axlusdc * +prices.axlUSDC) + (QTYs.usdc * +prices.usdc)
        + getLPValue(QTYs.atomosmo_pool, prices.atomosmo_pool) + getLPValue(QTYs.osmousdc_pool, prices.osmousdc_pool) + (QTYs.stAtom * +prices.stAtom) + (QTYs.stOsmo * +prices.stOsmo)
        + (QTYs.tia * +prices.tia) + (QTYs.usdt * +prices.usdt)
    )
   }
   ///Get pro-rata cost
    function getRataCost(QTYs: DefinedCollateralAssets) {
        var ratios = getassetRatios(getTVL(QTYs), QTYs, prices);
        var cost = 0;

        if (QTYs.osmo > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.osmo
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.osmo).toFixed(4));
            }
        }
        if (QTYs.atom > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.atom
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.atom).toFixed(4));
            }
        }
        if (QTYs.axlusdc > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.axlUSDC
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.axlusdc).toFixed(4));
            }
        }
        if (QTYs.usdc > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.usdc
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.usdc).toFixed(4));
            }
        }
        if (QTYs.stAtom > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.stAtom
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.stAtom).toFixed(4));
            }
        }
        if (QTYs.stOsmo > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.stOsmo
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.stOsmo).toFixed(4));
            }
        }
        if (QTYs.tia > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.tia
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];
                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.tia).toFixed(4));
            }
        }
        if (QTYs.usdt > 0){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.usdt
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];
                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.usdt).toFixed(4));
            }
        }
        if (QTYs.atomosmo_pool !== "0"){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.atomosmo_pool
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.atomosmo_pool).toFixed(4));
            }
        }
        if (QTYs.osmousdc_pool !== "0"){
            //find the asset's index in the basket                
            var rate_index = basketRes?.collateral_types.findIndex((info) => {
                // @ts-ignore
                return info.asset.info.native_token.denom === denoms.osmousdc_pool
            })

            if (rate_index){
                //use the index to get its interest rate
                var asset_rate = rateRes?.rates[rate_index];

                //add pro-rata rate to sum 
                //@ts-ignore
                cost += parseFloat((parseFloat(asset_rate) * ratios.osmousdc_pool).toFixed(4));
            }
        }

        //Now add credit redemption rate to the cost
        if (creditRateRes){
            //Add credit rate to cost
            if (creditRateRes.negative_rate && basketRes?.negative_rates){
                cost -= parseFloat(creditRateRes.credit_interest);
            } else {
                cost += parseFloat(creditRateRes.credit_interest);
            }   
        }
        console.log(cost, QTYs)
        return(cost)
    }
    function getRates() {
        var rates: Prices = {
            osmo: 0,
            atom: 0,
            axlUSDC: 0,
            usdc: 0,
            tia: 0,
            usdt: 0,
            stAtom: 0,
            stOsmo: 0,
            atomosmo_pool: 0,
            osmousdc_pool: 0,
            cdt: 0,
        };
        //find OSMO's index in the basket                
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.osmo
        })

        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.osmo = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }

        //find ATOM's index in the basket                
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.atom
        })
        if (rate_index !== undefined){
        //use the index to get its interest rate
            rates.atom = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }

        //find AXLUSDC's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.axlUSDC
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.axlUSDC = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        
        //find USDC's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.usdc
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.usdc = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        //find stATOM's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.stAtom
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.stAtom = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        //find stOSMO's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.stOsmo
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.stOsmo = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        //find TIA's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.tia
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.tia = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        //find USDT's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.usdt
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.usdt = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        //find ATOMOSMO's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.atomosmo_pool
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.atomosmo_pool = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        //find OSMOUSDC's index in the basket
        var rate_index = basketRes?.collateral_types.findIndex((info) => {
            // @ts-ignore
            return info.asset.info.native_token.denom === denoms.osmousdc_pool
        })
        if (rate_index !== undefined){
            //use the index to get its interest rate
            rates.osmousdc_pool = parseFloat(rateRes?.rates[rate_index] ?? "0");
        }
        
        setRates(rates)
    }
    async function getassetdebtUtil() {
        try {
            var debtcaps: Prices = {
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
            };
            await queryClient?.getBasketDebtCaps().then((res) => {
                ///Find the debt cap util for each collateral denom
                res.forEach((debtCap) => {
                    //@ts-ignore
                    if (debtCap.collateral.native_token.denom === denoms.osmo){
                        debtcaps.osmo = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.atom){
                        debtcaps.atom = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.axlUSDC){
                        debtcaps.axlUSDC = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.usdc){
                        debtcaps.usdc = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.stAtom){
                        debtcaps.stAtom = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.stOsmo){
                        debtcaps.stOsmo = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.tia){
                        debtcaps.tia = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.usdt){
                        debtcaps.usdt = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.atomosmo_pool){
                        debtcaps.atomosmo_pool = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                        //@ts-ignore
                    } else if (debtCap.collateral.native_token.denom === denoms.osmousdc_pool){
                        debtcaps.osmousdc_pool = parseInt(debtCap.debt_total) / parseInt(debtCap.cap);
                    }

                })
                setdebtCaps(debtcaps);
            })

        } catch (error) {
            ////Error message
            const e = error as { message: string }
            console.log(e.message)
        }
    }

    function showDefault() {
        if (positionID === "0"){
            return false
        } else {
            return true
        }
    }
    function handlesetDepositAmount(asset: string, deposit_amount: any) {
        switch (asset){
            case "osmo": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        osmo: deposit_amount,
                    }
                })
                break;
            }
            case "atom": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        atom: deposit_amount,
                    }
                })
                break;
            }
            case "axlusdc": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        axlusdc: deposit_amount,
                    }
                })
                break;
            }
            case "usdc": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        usdc: deposit_amount,
                    }
                })
                break;
            }
            case "stAtom": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        stAtom: deposit_amount,
                    }
                })
                break;
            }
            case "stOsmo": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        stOsmo: deposit_amount,
                    }
                })
                break;
            }
            case "tia": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        tia: deposit_amount,
                    }
                })
                break;
            }
            case "usdt": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        usdt: deposit_amount,
                    }
                })
                break;
            }
            case "atomosmo_pool": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        atomosmo_pool: deposit_amount,
                    }
                })
                break;
            }
            case "osmoaxlusdc_pool": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        osmousdc_pool: deposit_amount,
                    }
                })
                break;
            }
        }
    }
    function handlesetDepositInput(asset: string, deposit: boolean, event: any){
        event.preventDefault();
        var deposit_amount = event.target.value;
        switch (asset){
            case "osmo": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        osmo: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmo: +deposit_amount + +contractQTYs.osmo,
                        }
                    })
                } else {
                    var new_amount = +contractQTYs.osmo - +deposit_amount;
                    if(new_amount < 0){
                        new_amount = 0;
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmo: new_amount,
                        }
                    })
                }
                break;
            }
            case "atom": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        atom: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            atom: +deposit_amount + +contractQTYs.atom,
                        }
                    })
                } else {
                    var new_amount = +contractQTYs.atom - +deposit_amount;
                    if(new_amount < 0){
                        new_amount = 0;
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            atom: new_amount,
                        }
                    })
                }
                break;
            }
            case "axlusdc": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        axlusdc: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            axlusdc: +deposit_amount + +contractQTYs.axlusdc,
                        }
                    })
                } else {
                    var new_amount = +contractQTYs.axlusdc - +deposit_amount;
                    if(new_amount < 0){
                        new_amount = 0;
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            axlusdc: new_amount,
                        }
                    })
                }
                break;
            }
            case "usdc": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        usdc: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            usdc: +deposit_amount + +contractQTYs.usdc,
                        }
                    })
                } else {
                    var new_amount = +contractQTYs.usdc - +deposit_amount;
                    if(new_amount < 0){
                        new_amount = 0;
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            usdc: new_amount,
                        }
                    })
                }
                break;
            }
            case "stAtom": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        stAtom: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            stAtom: +deposit_amount + +contractQTYs.stAtom,
                        }
                    })
                } else {
                    var new_amount = +contractQTYs.stAtom - +deposit_amount;
                    if(new_amount < 0){
                        new_amount = 0;
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            stAtom: new_amount,
                        }
                    })
                }
                break;
            }
            case "stOsmo": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        stOsmo: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            stOsmo: +deposit_amount + +contractQTYs.stOsmo,
                        }
                    })
                } else {
                    var new_amount = +contractQTYs.stOsmo - +deposit_amount;
                    if(new_amount < 0){
                        new_amount = 0;
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            stOsmo: new_amount,
                        }
                    })
                }
                break;
            }
            case "tia": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        tia: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            tia: +deposit_amount + +contractQTYs.tia,
                        }
                    })
                } else {
                    var new_amount = +contractQTYs.tia - +deposit_amount;
                    if(new_amount < 0){
                        new_amount = 0;
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            tia: new_amount,
                        }
                    })
                }
                break;
            }
            case "usdt": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        usdt: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            usdt: +deposit_amount + +contractQTYs.usdt,
                        }
                    })
                } else {
                    var new_amount = +contractQTYs.usdt - +deposit_amount;
                    if(new_amount < 0){
                        new_amount = 0;
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            usdt: new_amount,
                        }
                    })
                }
                break;
            }
            case "atomosmo_pool": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        atomosmo_pool: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            atomosmo_pool: BigNumber(deposit_amount).plus(BigNumber(contractQTYs.atomosmo_pool)).toString(),
                        }
                    })
                } else {
                    var new_lp_amount = BigNumber(contractQTYs.atomosmo_pool).minus(BigNumber(deposit_amount));
                    if(new_lp_amount < BigNumber(0)){
                        new_lp_amount = BigNumber(0);
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            atomosmo_pool: new_lp_amount.toString(),
                        }
                    })
                }
                break;
            }
            case "osmoaxlusdc_pool": {
                setdepositAmounts(prevState => {
                    return { 
                        ...prevState,
                        osmousdc_pool: deposit_amount,
                    }
                })
                //Set positionQTYs
                if (deposit) {
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmousdc_pool: BigNumber(deposit_amount).plus(BigNumber(contractQTYs.osmousdc_pool)).toString(),
                        }
                    })
                } else {
                    var new_lp_amount = BigNumber(contractQTYs.osmousdc_pool).minus(BigNumber(deposit_amount));
                    if(new_lp_amount < BigNumber(0)){
                        new_lp_amount = BigNumber(0);
                    }
                    setpositionQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmousdc_pool: new_lp_amount.toString(),
                        }
                    })
                }
                break;
            }
        }
    }
    function checkIfWalletEmpty() {
        if (address !== undefined) {
            //check if wallet has been checked & is empty
            if (walletChecked && walletQTYs.osmo === 0 && walletQTYs.atom === 0 && walletQTYs.axlusdc === 0 && walletQTYs.usdc === 0 && walletQTYs.atomosmo_pool !== "0" && walletQTYs.osmousdc_pool !== "0" && walletQTYs.stAtom === 0 && walletQTYs.stOsmo === 0 && walletQTYs.tia === 0 && walletQTYs.usdt === 0){
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    function createDepositElements(forVaults: boolean) {
        return(<>
            <div style={forVaults ? {display: "flex", gap: "23px", flexDirection: "column", marginBottom: "5%", alignItems: "center"}: {display: "flex", gap: "23px", flexDirection: "column", alignItems: "center"}}>
            {currentfunctionLabel === "deposit" ? <>
                {walletQTYs.osmo > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/osmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("osmo", walletQTYs.osmo.toString()); setpositionQTYs(prevState => { return {...prevState, osmo: walletQTYs.osmo + contractQTYs.osmo}});}}>max: {walletQTYs.osmo.toFixed(3)}</div>
                        <label className="deposit-amount-label">OSMO amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.osmo ?? ''} type="number" onChange={(event)=>handlesetDepositInput("osmo", true, event)}/>
                    </form>
                </div>: null}
                {walletQTYs.atom > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/atom.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("atom", walletQTYs.atom.toString()); setpositionQTYs(prevState => { return {...prevState, atom: walletQTYs.atom + contractQTYs.atom}});}}>max: {walletQTYs.atom.toFixed(3)}</div>
                        <label className="deposit-amount-label">ATOM amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.atom ?? ''} type="number" onChange={(event)=>handlesetDepositInput("atom", true, event)}/>
                    </form>
                </div>: null}
                {walletQTYs.usdc > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("usdc", walletQTYs.usdc.toString()); setpositionQTYs(prevState => { return {...prevState, usdc: walletQTYs.usdc + contractQTYs.usdc}});}}>max: {walletQTYs.usdc.toFixed(3)}</div>
                        <label className="deposit-amount-label">USDC amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.usdc ?? ''} type="number" onChange={(event)=>handlesetDepositInput("usdc", true, event)}/>
                    </form>
                </div>: null}
                {walletQTYs.axlusdc > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("axlusdc", walletQTYs.axlusdc.toString()); setpositionQTYs(prevState => { return {...prevState, axlusdc: walletQTYs.axlusdc + contractQTYs.axlusdc}});}}>max: {walletQTYs.axlusdc.toFixed(3)}</div>
                        <label className="deposit-amount-label">axlUSDC amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.axlusdc ?? ''} type="number" onChange={(event)=>handlesetDepositInput("axlusdc", true, event)}/>
                    </form>
                </div>: null}
                {walletQTYs.stAtom > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/statom.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("stAtom", walletQTYs.stAtom.toString()); setpositionQTYs(prevState => { return {...prevState, stAtom: walletQTYs.stAtom + contractQTYs.stAtom}});}}>max: {walletQTYs.stAtom.toFixed(3)}</div>
                        <label className="deposit-amount-label">stATOM amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.stAtom ?? ''} type="number" onChange={(event)=>handlesetDepositInput("stAtom", true, event)}/>
                    </form>
                </div>: null}
                {walletQTYs.stOsmo > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/stosmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("stOsmo", walletQTYs.stOsmo.toString()); setpositionQTYs(prevState => { return {...prevState, stOsmo: walletQTYs.stOsmo + contractQTYs.stOsmo}});}}>max: {walletQTYs.stOsmo.toFixed(3)}</div>
                        <label className="deposit-amount-label">stOSMO amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.stOsmo ?? ''} type="number" onChange={(event)=>handlesetDepositInput("stOsmo", true, event)}/>
                    </form>
                </div>: null}
                {walletQTYs.tia > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/tia.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("tia", walletQTYs.tia.toString()); setpositionQTYs(prevState => { return {...prevState, tia: walletQTYs.tia + contractQTYs.tia}});}}>max: {walletQTYs.tia.toFixed(3)}</div>
                        <label className="deposit-amount-label">TIA amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.tia ?? ''} type="number" onChange={(event)=>handlesetDepositInput("tia", true, event)}/>
                    </form>
                </div>: null}
                {walletQTYs.usdt > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdt.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("usdt", walletQTYs.usdt.toString()); setpositionQTYs(prevState => { return {...prevState, usdt: walletQTYs.usdt + contractQTYs.usdt}});}}>max: {walletQTYs.usdt.toFixed(3)}</div>
                        <label className="deposit-amount-label">USDT amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.usdt ?? ''} type="number" onChange={(event)=>handlesetDepositInput("usdt", true, event)}/>
                    </form>
                </div>: null}
                {/* {walletQTYs.atomosmo_pool > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element-lp">
                    <div className="deposit-element-icon-lp">
                        <Image className="deposit-icon-lp-left" width={45} height={45} alt="" src="images/atom.svg" />
                        <Image className="deposit-icon-lp-right" width={45} height={45} alt="" src="images/osmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("atomosmo_pool", walletQTYs.atomosmo_pool.toString()); setpositionQTYs(prevState => { return {...prevState, atomosmo_pool: walletQTYs.atomosmo_pool + contractQTYs.atomosmo_pool}});}}>max: {walletQTYs.atomosmo_pool.toFixed(3)}</div>
                        <label className="deposit-amount-label">ATOM/OSMO LP amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.atomosmo_pool ?? ''} type="number" onChange={(event)=>handlesetDepositInput("atomosmo_pool", true, event)}/>
                    </form>
                </div>: null}
                {walletQTYs.osmousdc_pool > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element-lp">
                    <div className="deposit-element-icon-lp">
                        <Image className="deposit-icon-lp-left" width={45} height={45} alt="" src="images/osmo.svg" />
                        <Image className="deposit-icon-lp-right" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("osmoaxlusdc_pool", walletQTYs.osmousdc_pool.toString()); setpositionQTYs(prevState => { return {...prevState, osmousdc_pool: walletQTYs.osmousdc_pool + contractQTYs.osmousdc_pool}});}}>max: {walletQTYs.osmousdc_pool.toFixed(3)}</div>
                        <label className="deposit-amount-label">OSMO/axlUSDC LP amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.osmousdc_pool ?? ''} type="number" onChange={(event)=>handlesetDepositInput("osmoaxlusdc_pool", true, event)}/>
                    </form>
                </div>: null} */}
                </> : //Withdraw elements
                <> 
                {contractQTYs.osmo > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/osmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("osmo", contractQTYs.osmo.toString()); setpositionQTYs(prevState => { return {...prevState, osmo: 0}});}}>max: {contractQTYs.osmo.toFixed(3)}</div>
                        <label className="deposit-amount-label">OSMO amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.osmo ?? ''} type="number" onChange={(event)=>handlesetDepositInput("osmo", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.atom > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/atom.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("atom", contractQTYs.atom.toString()); setpositionQTYs(prevState => { return {...prevState, atom: 0}});}}>max: {contractQTYs.atom.toFixed(3)}</div>
                        <label className="deposit-amount-label">ATOM amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.atom ?? ''} type="number" onChange={(event)=>handlesetDepositInput("atom", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.usdc > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("usdc", contractQTYs.usdc.toString()); setpositionQTYs(prevState => { return {...prevState, usdc: 0}});}}>max: {contractQTYs.usdc.toFixed(3)}</div>
                        <label className="deposit-amount-label">USDC amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.usdc ?? ''} type="number" onChange={(event)=>handlesetDepositInput("usdc", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.axlusdc > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("axlusdc", contractQTYs.axlusdc.toString()); setpositionQTYs(prevState => { return {...prevState, axlusdc: 0}});}}>max: {contractQTYs.axlusdc.toFixed(3)}</div>
                        <label className="deposit-amount-label">axlUSDC amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.axlusdc ?? ''} type="number" onChange={(event)=>handlesetDepositInput("axlusdc", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.stAtom > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/statom.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("stAtom", contractQTYs.stAtom.toString()); setpositionQTYs(prevState => { return {...prevState, stAtom: 0}});}}>max: {contractQTYs.stAtom.toFixed(3)}</div>
                        <label className="deposit-amount-label">stATOM amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.stAtom ?? ''} type="number" onChange={(event)=>handlesetDepositInput("stAtom", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.stOsmo > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/stosmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("stOsmo", contractQTYs.stOsmo.toString()); setpositionQTYs(prevState => { return {...prevState, stOsmo: 0}});}}>max: {contractQTYs.stOsmo.toFixed(3)}</div>
                        <label className="deposit-amount-label">stOSMO amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.stOsmo ?? ''} type="number" onChange={(event)=>handlesetDepositInput("stOsmo", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.tia > 0 ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/tia.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("tia", contractQTYs.tia.toString()); setpositionQTYs(prevState => { return {...prevState, tia: 0}});}}>max: {contractQTYs.tia.toFixed(3)}</div>
                        <label className="deposit-amount-label">TIA amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.tia ?? ''} type="number" onChange={(event)=>handlesetDepositInput("tia", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.usdt > 0 ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdt.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("usdt", contractQTYs.usdt.toString()); setpositionQTYs(prevState => { return {...prevState, usdt: 0}});}}>max: {contractQTYs.usdt.toFixed(3)}</div>
                        <label className="deposit-amount-label">USDT amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.usdt ?? ''} type="number" onChange={(event)=>handlesetDepositInput("usdt", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.atomosmo_pool !== "0" ?        
                <div className="deposit-element-lp">
                    <div className="deposit-element-icon-lp">
                        <Image className="deposit-icon-lp-left" width={45} height={45} alt="" src="images/atom.svg" />
                        <Image className="deposit-icon-lp-right" width={45} height={45} alt="" src="images/osmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("atomosmo_pool", contractQTYs.atomosmo_pool.toString()); setpositionQTYs(prevState => { return {...prevState, atomosmo_pool: "0"}});}}>max: {parseInt(contractQTYs.atomosmo_pool).toFixed(3)}</div>                        <label className="deposit-amount-label">ATOM/OSMO LP amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.atomosmo_pool ?? ''} type="number" onChange={(event)=>handlesetDepositInput("atomosmo_pool", false, event)}/>
                    </form>
                </div>: null}
                {contractQTYs.osmousdc_pool !== "0" ?        
                <div className="deposit-element-lp">
                    <div className="deposit-element-icon-lp">
                        <Image className="deposit-icon-lp-left" width={45} height={45} alt="" src="images/osmo.svg" />
                        <Image className="deposit-icon-lp-right" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>{handlesetDepositAmount("osmoaxlusdc_pool", contractQTYs.osmousdc_pool.toString()); setpositionQTYs(prevState => { return {...prevState, osmousdc_pool: "0"}});}}>max: {parseInt(contractQTYs.osmousdc_pool).toFixed(3)}</div>
                        <label className="deposit-amount-label">OSMO/axlUSDC LP amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.osmousdc_pool ?? ''} type="number" onChange={(event)=>handlesetDepositInput("osmoaxlusdc_pool", false, event)}/>
                    </form>
                </div> : null}
                </>
                }
            </div>
           {forVaults ? <div className="vault-menu-div">
           <div className="value value-menu-dropdown" onClick={handleOpen}>
                <button onClick={handleOpen} style={{outline: "none"}}>{menuLabel}</button>
                {open ? (
                    <ul className="value-menu">
                    {menuLabel !== "Rate" ? (<li className="value-menu-item" onClick={handleMenuOne}>
                        <button onClick={handleMenuOne} style={{outline: "none"}}>Rate</button>
                    </li>) : null}
                    {menuLabel !== "Util" ? (<li className="value-menu-item" onClick={handleMenuTwo}>
                        <button onClick={handleMenuTwo} style={{outline: "none"}}>Util</button>
                    </li>) : null}
                    {menuLabel !== "Value" ? (<li className="value-menu-item" onClick={handleMenuThree}>
                        <button onClick={handleMenuThree} style={{outline: "none"}}>Value</button>
                    </li>) : null}
                    </ul>
                ) : null}
            </div>
            <div className="vault-menu-items-div">
            {menuLabel === "Value" ? 
                <>
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmo > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmo > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.osmo > 0 ?  "" : "low-opacity") : (positionQTYs.osmo > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(walletQTYs.osmo * +prices.osmo) : formatNumber(positionQTYs.osmo* +prices.osmo)}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.atom > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atom > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.atom > 0 ?  "" : "low-opacity") : (positionQTYs.atom > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(walletQTYs.atom * +prices.atom) : formatNumber(positionQTYs.atom* +prices.atom)}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.usdc > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.usdc > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.usdc > 0 ?  "" : "low-opacity") : (positionQTYs.usdc > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(walletQTYs.usdc * +prices.usdc) : formatNumber(positionQTYs.usdc* +prices.usdc)}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.axlusdc > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.axlusdc > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.axlusdc > 0 ?  "" : "low-opacity") : (positionQTYs.axlusdc > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(walletQTYs.axlusdc * +prices.axlUSDC) : formatNumber(positionQTYs.axlusdc* +prices.axlUSDC)}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.stAtom > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.stAtom > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.stAtom > 0 ?  "" : "low-opacity") : (positionQTYs.stAtom > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(walletQTYs.stAtom * +prices.stAtom) : formatNumber(positionQTYs.stAtom* +prices.stAtom)}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.stOsmo > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.stOsmo > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.stOsmo > 0 ?  "" : "low-opacity") : (positionQTYs.stOsmo > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(walletQTYs.stOsmo * +prices.stOsmo) : formatNumber(positionQTYs.stOsmo* +prices.stOsmo)}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.tia > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.tia > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.tia > 0 ?  "" : "low-opacity") : (positionQTYs.tia > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit"? formatNumber(walletQTYs.tia * +prices.tia) : formatNumber(positionQTYs.tia* +prices.tia)}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.usdt > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.usdt > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.usdt > 0 ?  "" : "low-opacity") : (positionQTYs.usdt > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(walletQTYs.usdt * +prices.usdt) : formatNumber(positionQTYs.usdt* +prices.usdt)}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.atomosmo_pool !== "0" || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atomosmo_pool !== "0" ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.atomosmo_pool !== "0" ?  "" : "low-opacity") : (positionQTYs.atomosmo_pool !== "0" ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(getLPValue(walletQTYs.atomosmo_pool, prices.atomosmo_pool)) : formatNumber(getLPValue(positionQTYs.atomosmo_pool, prices.atomosmo_pool))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmousdc_pool !== "0" || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmousdc_pool !== "0" ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.osmousdc_pool !== "0" ?  "" : "low-opacity") : (positionQTYs.osmousdc_pool !== "0" ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? formatNumber(getLPValue(walletQTYs.atomosmo_pool, prices.atomosmo_pool)) : formatNumber(getLPValue(positionQTYs.osmousdc_pool, prices.osmousdc_pool))}</div> : null}
                </>
            : menuLabel === "Rate" ? 
                <>
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmo > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmo ? <div className={positionQTYs.osmo > 0 ?  "" : "low-opacity"}>{rates.osmo.toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.atom > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atom > 0 ? <div className={positionQTYs.atom > 0 ?  "" : "low-opacity"}>{(rates.atom).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.usdc > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.usdc > 0 ? <div className={positionQTYs.usdc > 0 ?  "" : "low-opacity"}>{(rates.usdc).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.axlusdc > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.axlusdc > 0 ? <div className={positionQTYs.axlusdc > 0 ?  "" : "low-opacity"}>{(rates.axlUSDC).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.stAtom > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.stAtom > 0 ? <div className={positionQTYs.stAtom > 0 ?  "" : "low-opacity"}>{(rates.stAtom).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.stOsmo > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.stOsmo > 0 ? <div className={positionQTYs.stOsmo > 0 ?  "" : "low-opacity"}>{(rates.stOsmo).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.tia > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.tia > 0 ? <div className={positionQTYs.tia > 0 ?  "" : "low-opacity"}>{(rates.tia).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.usdt > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.usdt > 0 ? <div className={positionQTYs.usdt > 0 ?  "" : "low-opacity"}>{(rates.usdt).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.atomosmo_pool !== "0" || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atomosmo_pool !== "0" ? <div className={positionQTYs.atomosmo_pool !== "0" ?  "" : "low-opacity"}>{(rates.atomosmo_pool).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmousdc_pool !== "0" || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmousdc_pool !== "0" ? <div className={positionQTYs.osmousdc_pool !== "0" ?  "" : "low-opacity"}>{(rates.osmousdc_pool).toFixed(4)}%</div> : null}
                </>
            : menuLabel === "Util" ? 
                <>
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmo > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmo > 0 ? <div className={positionQTYs.osmo > 0 ?  "" : "low-opacity"}>{(debtCaps.osmo * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.atom > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atom > 0 ? <div className={positionQTYs.atom > 0 ?  "" : "low-opacity"}>{(debtCaps.atom * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.usdc > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.usdc > 0 ? <div className={positionQTYs.usdc > 0 ?  "" : "low-opacity"}>{(debtCaps.usdc * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.axlusdc > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.axlusdc > 0 ? <div className={positionQTYs.axlusdc > 0 ?  "" : "low-opacity"}>{(debtCaps.axlUSDC * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.stAtom > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.stAtom > 0 ? <div className={positionQTYs.stAtom > 0 ?  "" : "low-opacity"}>{(debtCaps.stAtom * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.stOsmo > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.stOsmo > 0 ? <div className={positionQTYs.stOsmo > 0 ?  "" : "low-opacity"}>{(debtCaps.stOsmo * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.tia > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.tia > 0 ? <div className={positionQTYs.tia > 0 ?  "" : "low-opacity"}>{(debtCaps.tia * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.usdt > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.usdt > 0 ? <div className={positionQTYs.usdt > 0 ?  "" : "low-opacity"}>{(debtCaps.usdt * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.atomosmo_pool !== "0" || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atomosmo_pool !== "0" ? <div className={positionQTYs.atomosmo_pool !== "0" ?  "" : "low-opacity"}>{(debtCaps.atomosmo_pool * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmousdc_pool !== "0" || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmousdc_pool !== "0" ? <div className={positionQTYs.osmousdc_pool !== "0" ?  "" : "low-opacity"}>{(debtCaps.osmousdc_pool * 100).toFixed(2)}%</div> : null}
                </>
            : null}
            </div>
            </div> : null}
            {forVaults ? //Buttons
            <div className="deposit-withdraw-card-btns">
                <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "0%"}} onClick={()=>{if (currentfunctionLabel === "withdraw" || currentfunctionLabel === "deposit"){handleExecution()}}}>
                    {currentfunctionLabel === "deposit" ? "Deposit" : "Withdraw"}
                </a>         
                <div className={"user-redemption-button"} onClick={handlefunctionLabel}>
                    <div className="spacing-btm">{currentfunctionLabel === "deposit" ? "Switch to withdraw" : currentfunctionLabel === "withdraw" ? "Switch to deposit" : "Switch to withdraw" }</div>
                </div> 
            </div>
            : null}
        </>);
    }
    const handlefunctionLabel = () => {
        //resetPositionQTYs
        resetPositionQTYs();
        //resetdepositAmounts
        setdepositAmounts({
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
        if (currentfunctionLabel === "deposit"){
            setcurrentfunctionLabel("withdraw")
        } else if (currentfunctionLabel === "withdraw"){
            setcurrentfunctionLabel("deposit")
        } else {
            setcurrentfunctionLabel("withdraw")
        }
    };
    const onSquidClick = () => {
        window.open(
        "https://app.squidrouter.com/"
        );
    };
    const onIBCClick = () => {
        window.open(
        "https://ibc.fun/"
        );
    };
    const onCCTPClick = () => {
        window.open(
        "https://cctp.money/"
        );
    };
    const handleonboardingDeposit = async () => {
        ///Set asset intents
        var asset_intent: [string, number | string][] = [];
        if (depositAmounts.osmo != undefined && (depositAmounts.osmo??0) > 0){
            asset_intent.push(["OSMO", depositAmounts.osmo])
        }
        if (depositAmounts.atom != undefined && depositAmounts.atom > 0){
            asset_intent.push(["ATOM", depositAmounts.atom])
        }
        if (depositAmounts.usdc != undefined && depositAmounts.usdc > 0){
            asset_intent.push(["USDC", depositAmounts.usdc])
        }
        if (depositAmounts.axlusdc != undefined && depositAmounts.axlusdc > 0){
            asset_intent.push(["axlUSDC", depositAmounts.axlusdc])
        }
        if (depositAmounts.stAtom != undefined && depositAmounts.stAtom > 0){
            asset_intent.push(["stATOM", depositAmounts.stAtom])
        }
        if (depositAmounts.stOsmo != undefined && depositAmounts.stOsmo > 0){
            asset_intent.push(["stOSMO", depositAmounts.stOsmo])
        }
        if (depositAmounts.tia != undefined && depositAmounts.tia > 0){
            asset_intent.push(["TIA", depositAmounts.tia])
        }
        if (depositAmounts.usdt != undefined && depositAmounts.usdt > 0){
            asset_intent.push(["USDT", depositAmounts.usdt])
        }
        if (depositAmounts.atomosmo_pool != undefined && depositAmounts.atomosmo_pool !== "0"){
            asset_intent.push(["ATOM-OSMO LP", depositAmounts.atomosmo_pool])
        }
        if (depositAmounts.osmousdc_pool != undefined && depositAmounts.osmousdc_pool !== "0"){
            asset_intent.push(["OSMO-axlUSDC LP", depositAmounts.osmousdc_pool])
        }
        var user_coins = getcoinsfromassetIntents(asset_intent);
        //Coins must be in order to send to contract
        user_coins.sort((a, b) => a.denom < b.denom ? -1 : 1,);

        try {            
            if (positionChecked === false){
                //Format popup msg
                setPopupTrigger(true);
                setPopupMsg(<div>Signing this message will create a new position, if that is not your goal wait for the query to finish & refresh if you have waited more than a couple minutes.</div>);
                setPopupStatus("WARNING!!! Position has not been queried yet.");
            }
            await cdp_client?.deposit({
                positionId: undefined,
                positionOwner: user_address as string,
            }, "auto", undefined, user_coins).then((res) => {           
                console.log(res?.events.toString())
                //Update mint amount
                setdepositAmounts({
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
                })
                //format pop up
                setPopupTrigger(true);
                //map asset intents to readable string
                var readable_asset_intent = asset_intent.map((asset) => {
                    return asset[1] + " " + asset[0]
                })
                setPopupMsg(<div>Deposit of {readable_asset_intent} successful</div>);
                setPopupStatus("Success");
                
                //Clear intents
                setassetIntent([])
                //Requery position
                fetch_update_positionData();
            })
        } catch (error) {            
            ////Error message
            const e = error as { message: string }
            console.log(e.message)
            //This is a success msg but a cosmjs error
            if (e.message === "Invalid string. Length must be a multiple of 4"){
                //format pop up
                setPopupTrigger(true);
                //map asset intents to readable string
                var readable_asset_intent = asset_intent.map((asset) => {
                    return asset[1] + " " + asset[0]
                })
                setPopupMsg(<div>Deposit of {readable_asset_intent} successful</div>);
                setPopupStatus("Success");
                
                //Clear intents
                setassetIntent([])
                //Requery position
                fetch_update_positionData();
            } else {                
                ///Format Pop up
                setPopupTrigger(true);
                setPopupMsg(<div>{e.message}</div>);
                setPopupStatus("Deposit Error");
            }
            //Requery position
            fetch_update_positionData();
        }
    };
    const handleshowAll = () => {
        setassetcardTitle("Show Relevant Assets")
    };
    const handleshowRelevant = () => {
        setassetcardTitle("Show All Assets")
    };

    //getuserPosition info && set State
    useEffect(() => {    
        if (address) {
            //setAddress
            setAddress(address as string)
        }
        if (prices.osmo === 0 ){ setPrices(pricez) }
        console.log(pricez)
        setrateRes(rateRes as CollateralInterestResponse);
        getRates();
        setcreditRateRes(creditRateRes as InterestResponse)
        setbasketRes(basketRes as Basket)
        getassetdebtUtil();
        //Set walletQTYs
        var walletQTYs: DefinedCollateralAssets = {
            osmo: walletQTYz.osmo??0,
            atom: walletQTYz.atom??0,
            axlusdc: walletQTYz.axlusdc??0,
            usdc: walletQTYz.usdc??0,
            stAtom: walletQTYz.stAtom??0,
            stOsmo: walletQTYz.stOsmo??0,
            tia: walletQTYz.tia??0,
            usdt: walletQTYz.usdt??0,
            atomosmo_pool: walletQTYz.atomosmo_pool??"0",
            osmousdc_pool: walletQTYz.osmousdc_pool??"0",
        };
        setwalletQTYs(walletQTYs);
        //Set contractQTYs
        setcontractQTYs(contractQTYz);
        //Set positionQTYs
        setpositionQTYs(positionQTYz);

    }, [pricez, address, rateRes, creditRateRes, basketRes, walletQTYz, contractQTYz, positionQTYz])
    

  return (
    <div className="page-frame positions">
        <div className="first-vault-component">
            {showDefault() ? <div className="vaults-title-div">
                <div className="vaults-title">
                    VAULTS
                    <div><Image className="pie-chart-icon1" width={48} height={48} alt="" src="images/pie_chart.svg" /></div>
                </div>
                {currentfunctionLabel === "deposit" ? (assetcardTitle === "Show All Assets" ? <a className="asset-card-title" style={{textDecoration: "underline"}} onClick={handleshowAll}>{assetcardTitle}</a> : <a className="asset-card-title" style={{textDecoration: "underline"}} onClick={handleshowRelevant}>{assetcardTitle}</a>) : null}
            </div>
                : 
            checkIfWalletEmpty() === true ?
            <div className="onboarding-deposit-title" style={{left: "0%"}}>
                Bridge to Osmosis
            </div>
            :
            <div className="vaults-title-div" style={{position: "relative", left: "3%"}}>
                <div className="onboarding-deposit-title">
                    Open Vault
                    <div><Image className="pie-chart-icon1" width={48} height={48} alt="" src="images/pie_chart.svg" /></div>
                </div>
                {assetcardTitle === "Show All Assets" ? <a className="asset-card-title" style={{textDecoration: "underline"}} onClick={handleshowAll}>{assetcardTitle}</a> : <a className="asset-card-title" style={{textDecoration: "underline"}} onClick={handleshowRelevant}>{assetcardTitle}</a>}
            </div>
            }
            {showDefault() ?
                <div>
                    <div className="card" style={{borderRadius: "1rem", width: "372px", height: "fit-content"}}>
                    <div className="vault-deposit-card-body vault-deposit-card-design shadow" style={{paddingRight: "0", paddingLeft: "0", paddingTop: ".75rem", paddingBottom: ".75rem"}}>
                        {/*For every collateral asset with a non-zero balance in the wallet, add an amount form */}
                        {createDepositElements(true)}
                    </div>
                    </div>
                </div>
            :
            
                <div>
                    {showDefault() !== true ? <div className="card" style={{borderRadius: "1rem", width: "16.35vw", minWidth: "182px", height: "fit-content"}}>
                    <div className="deposit-card-body deposit-card-design shadow" style={{paddingRight: "0", paddingLeft: "0", paddingTop: ".75rem", paddingBottom: ".75rem"}}>
                        {/*For every collateral asset with a non-zero balance in the wallet, add an amount form */}
                        {createDepositElements(false)}
                        {checkIfWalletEmpty() === false && address !== undefined ? 
                        <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "9%"}} onClick={handleonboardingDeposit}>
                        Deposit
                        </a> 
                        : address === undefined ?
                        <a className="btn buttons" style={assetcardTitle !== "Show Relevant Assets" ? {borderRadius: "1rem", color: "white", marginTop: "0%"} : {borderRadius: "1rem", color: "white", marginTop: "12%"}} onClick={()=>connect()}>                        
                        {/*If wallet is not connected, connect*/}
                        Connect Wallet
                        </a> 
                        :
                        <>
                        {/*If wallet is empty, give Bridge links*/}
                        <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "0%"}} onClick={onIBCClick}>
                        {/*ibc.fun*/}
                        IBC
                        </a>
                        <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "9%"}} onClick={onCCTPClick}>
                        {/*cctp.money*/}
                        1-Click USDC
                        </a>
                        <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "9%"}} onClick={onSquidClick}>
                        {/*https://app.squidrouter.com/*/}
                        Misc.
                        </a>
                        </>
                        }
                    </div>
                    </div> : null}
                </div>
            }
        </div>
        {/* <div>
            <h3>Bundle Fortune teller</h3>
        </div> */}
        {showDefault() ? 
        <div className="mint-card-div">
            <div className="card" style={{borderRadius: "1rem", width: "331px", marginBottom: "0%", marginTop: "14%"}}>
            <div className="mint-card-body mint-card-design shadow" style={{paddingRight: ".75rem", paddingLeft: ".75rem", paddingTop: "1rem", paddingBottom: ".75rem"}}>                
                <div className="mint-stats-grid">
                    <div className="value-div">
                        <div className="mint-card-stats">Debt: <a style={(mintAmount??0) > 0 ? {color: "#FF6961"} : (repayAmount??0) > 0 ? {color: "#77DD77"} : {}}>{((debtAmount/1_000000)+ (mintAmount??0) - (repayAmount??0)).toFixed(0)} CDT</a></div>
                        <div className="mint-card-stats">Cost: <a style={(getRataCost(positionQTYs) < getRataCost(contractQTYs)) ? {color: "#77DD77"} : (getRataCost(positionQTYs) > getRataCost(contractQTYs)) ? {color: "#FF6961"} : {}}>{getRataCost(positionQTYs).toFixed(4)}%</a></div>
                        <div className="mint-card-stats">Liq. Value: <a style={(mintAmount??0) > 0 ? {color: "#FF6961"} : (repayAmount??0) > 0 ? {color: "#77DD77"} : {}}>${(((((debtAmount/1_000000)+ (mintAmount??0) - (repayAmount??0))* creditPrice) / (getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[1] / 100)) ?? 0).toFixed(0)}</a></div>
                        <div className="mint-card-stats">TVL: <a style={istheUserWithdrawing() && istheUserWithdrawing() !== undefined ? {color: "#FF6961"} : !istheUserWithdrawing() && istheUserWithdrawing() !== undefined ? {color: "#77DD77"} : {}}>${(getTVL(positionQTYs) ?? 0).toFixed(0)}</a></div>
                    </div>
                    <div className="ltv-div">
                        <div className="mint-card-stats">LTV: <a style={(mintAmount??0) > 0 || (istheUserWithdrawing() && istheUserWithdrawing() !== undefined) ? {color: "#FF6961"} : (repayAmount??0) > 0 || (!istheUserWithdrawing() && istheUserWithdrawing() !== undefined) ? {color: "#77DD77"} : {}}>{(((((debtAmount/1_000000)+ (mintAmount??0) - (repayAmount??0))* creditPrice)/(getTVL(positionQTYs)+1)) * 100).toFixed(1)}%</a></div>                        
                        <div className="mint-card-stats">Borrowable LTV: <a style={getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[0] > getRataLTV(getTVL(contractQTYs), contractQTYs, prices, basketRes)[0] ? {color: "#77DD77"} : getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[0] < getRataLTV(getTVL(contractQTYs), contractQTYs, prices, basketRes)[0] ? {color: "#FF6961"} : {}}>{(getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[0]).toFixed(0)}%</a></div>
                        <div className="mint-card-stats">Liquidation LTV: <a style={getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[1] > getRataLTV(getTVL(contractQTYs), contractQTYs, prices, basketRes)[1] ? {color: "#77DD77"} : getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[1] < getRataLTV(getTVL(contractQTYs), contractQTYs, prices, basketRes)[1] ? {color: "#FF6961"} : {}}>{(getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[1]).toFixed(0)}%</a></div>
                    </div>
                </div>
                {/*Mint/Repay card with position stats*/}
                <div><div className="mint-element" style={currentfunctionLabel !== "repay" ? {} : {opacity: ".3"}}>
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "0%", width: "61px", top: "-19%"}} onClick={()=>{handleExecution("mint")}}>
                        Mint
                    </a> 
                    <form className="deposit-form" style={{top: "-19%"}}>
                        <div className="mint-max-amount-label" onClick={()=>{setmintAmount(parseFloat(((getTVL(positionQTYs)*(getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[0]/100))/Math.max(creditPrice, 1) - (debtAmount/1_000000)).toFixed(1))); setcurrentfunctionLabel("mint"); setrepayAmount(0);}}>max: {((getTVL(positionQTYs)*(getRataLTV(getTVL(positionQTYs), positionQTYs, prices, basketRes)[0]/100))/Math.max(creditPrice, 1) - (debtAmount/1_000000)).toFixed(1)}</div>
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} defaultValue={mintAmount} value={mintAmount} name="amount" type="number" onClick={()=>{setcurrentfunctionLabel("mint"); setrepayAmount(0);}} onChange={(event)=>{event.preventDefault();
                        if (event.target.value !== "") {
                            setmintAmount(parseFloat(event.target.value))
                        } else {
                            setmintAmount(0)
                        }}}/>
                    </form>
                    <div className="mint-element-icon" style={{top: "-19%"}}>
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/CDT.svg" />
                    </div>
                </div>
                {//Only show if there is minted debt
                debtAmount > 0 ?
                    <div className="mint-element" style={currentfunctionLabel !== "mint" ? {} : {opacity: ".3"}}>
                        <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "9%", width: "61px", top: "-19%"}} onClick={()=>{handleExecution("repay")}}>
                            Repay
                        </a>
                        <form className="deposit-form" style={{top: "-19%"}}>
                            <div className="mint-max-amount-label" onClick={()=>{setrepayAmount(debtAmount/1_000000); setcurrentfunctionLabel("repay"); setmintAmount(0);}}>max: {(walletCDT).toFixed(1)}</div>
                            <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} defaultValue={repayAmount} value={repayAmount} name="amount" type="number" onClick={()=>{setcurrentfunctionLabel("repay"); setmintAmount(0);}} onChange={(event)=>{event.preventDefault(); 
                            if (event.target.value !== "") {
                                setrepayAmount(parseFloat(event.target.value))
                            } else {
                                setrepayAmount(0)
                            }}}/>
                        </form>
                        <div className="mint-element-icon" style={{top: "-19%"}}>
                            <Image className="deposit-icon" width={45} height={45} alt="" src="images/CDT.svg" />
                        </div>
                </div> : null}</div>
            </div>
            </div>
        </div>
        :  null}
        <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
        <WidgetPopup trigger={widgetpopupTrigger} setTrigger={setWidgetPopupTrigger} msgStatus={widgetpopupStatus} errorMsg={popupWidget}/>
    </div>
  );
};

export default Positions;