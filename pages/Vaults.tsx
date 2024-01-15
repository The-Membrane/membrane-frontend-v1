import { useEffect, useState } from "react";
import React from "react";
import { useChain } from '@cosmos-kit/react';
import { chainName } from '../config';

import { Coin, coin, coins } from "@cosmjs/amino";
import { PositionsClient, PositionsQueryClient } from "../codegen/positions/Positions.client";
import { Asset, Basket, CollateralInterestResponse, InterestResponse, RedeemabilityResponse } from "../codegen/positions/Positions.types";
import { Prices } from ".";
import { denoms } from "../config";
import Popup from "../components/Popup";
import WidgetPopup from "../components/widgetPopup";
import Image from "next/image";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { onStableswapTextClick } from "./Dashboard";

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
    atomosmo_pool: number,
    osmousdc_pool: number,
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
    atomosmo_pool: number | undefined,
    osmousdc_pool: number | undefined,
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
    atomosmo_pool: number,
    osmousdc_pool: number,
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
            atomosmo_pool: (positionQTYs.atomosmo_pool * +prices.atomosmo_pool) /TVL,
            osmousdc_pool: (positionQTYs.osmousdc_pool * +prices.osmousdc_pool) /TVL,
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
      atomosmo_pool: 0,
      osmousdc_pool: 0,
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
      atomosmo_pool: 0,
      osmousdc_pool: 0,
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
      atomosmo_pool: 0,
      osmousdc_pool: 0,
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

    //Logo functionality activation
    // const handleQTYaddition = (current_asset: string, amount: number) => {

    //     switch(current_asset) {
    //         case 'OSMO': {
    //             var new_qty = Math.max(+positionQTYs.osmo + +amount, 0);
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     osmo: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'ATOM':{
    //             var new_qty =  Math.max(+positionQTYs.atom + +amount, 0);
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     atom: new_qty,
    //                 }
    //             });
                
    //             break;
    //         }
    //         case 'axlUSDC':{
    //             var new_qty =  Math.max(+positionQTYs.axlusdc + +amount, 0);
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     axlusdc: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'USDC':{
    //             var new_qty =  Math.max(+positionQTYs.usdc + +amount, 0);
    //             //@ts-ignore
    //             setpositionQTYs((prevState: DefinedCollateralAssets) => {
    //                 return { 
    //                     ...prevState,
    //                     usdc: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'stATOM':{
    //             var new_qty =  Math.max(+positionQTYs.stAtom + +amount, 0);
    //             //@ts-ignore
    //             setpositionQTYs((prevState: DefinedCollateralAssets) => {
    //                 return { 
    //                     ...prevState,
    //                     stAtom: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'stOSMO':{
    //             var new_qty =  Math.max(+positionQTYs.stOsmo + +amount, 0);
    //             //@ts-ignore
    //             setpositionQTYs((prevState: DefinedCollateralAssets) => {
    //                 return { 
    //                     ...prevState,
    //                     stOsmo: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'atomosmo_pool':{
    //             var new_qty =  Math.max(+positionQTYs.atomosmo_pool + +amount, 0);
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     atomosmo_pool: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'osmousdc_pool':{
    //             var new_qty =  Math.max(+positionQTYs.osmousdc_pool + +amount, 0);
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     osmousdc_pool: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //       }
    // };
    // const handleQTYsubtraction = (current_asset: string, amount: number) => {

    //     switch(current_asset) {
    //         case 'OSMO': {
    //             var new_qty = Math.max(+positionQTYs.osmo - +amount, 0);
    //             //Set to 0 if below
    //             if (new_qty <= 0){
    //                 new_qty = 0;
    //             }
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     osmo: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'ATOM':{
    //             var new_qty = Math.max(+positionQTYs.atom - +amount, 0);
    //             //Set to 0 if below
    //             if (new_qty <= 0){
    //                 new_qty = 0;
    //             }
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     atom: new_qty,
    //                 }
    //             });
                
    //             break;
    //         }
    //         case 'axlUSDC':{
    //             var new_qty = Math.max(+positionQTYs.axlusdc - +amount, 0);
    //             //Set to 0 if below
    //             if (new_qty <= 0){
    //                 new_qty = 0;
    //             }
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     axlusdc: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'USDC':{
    //             var new_qty = Math.max(+positionQTYs.usdc - +amount, 0);
    //             //Set to 0 if below
    //             if (new_qty <= 0){
    //                 new_qty = 0;
    //             }
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     usdc: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'stATOM':{
    //             var new_qty = Math.max(+positionQTYs.stAtom - +amount, 0);
    //             //Set to 0 if below
    //             if (new_qty <= 0){
    //                 new_qty = 0;
    //             }
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     stAtom: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'stOSMO':{
    //             var new_qty = Math.max(+positionQTYs.stOsmo - +amount, 0);
    //             //Set to 0 if below
    //             if (new_qty <= 0){
    //                 new_qty = 0;
    //             }
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     stOsmo: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'atomosmo_pool':{
    //             var new_qty = Math.max(+positionQTYs.atomosmo_pool - +amount, 0);
    //             //Set to 0 if below
    //             if (new_qty <= 0){
    //                 new_qty = 0;
    //             }
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     atomosmo_pool: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //         case 'osmousdc_pool':{
    //             var new_qty = Math.max(+positionQTYs.osmousdc_pool - +amount, 0);
    //             //Set to 0 if below
    //             if (new_qty <= 0){
    //                 new_qty = 0;
    //             }
    //             //@ts-ignore
    //             setpositionQTYs(prevState => {
    //                 return { 
    //                     ...prevState,
    //                     osmousdc_pool: new_qty,
    //                 }
    //             });

    //             break;
    //         }
    //       }
    // };
    const handlecontractQTYupdate = () => {        
        //Set new LTVs & costs
        let LTVs = getRataLTV(getTVL(), positionQTYs, prices, basketRes);
        let cost = getRataCost();
        //@ts-ignore
        setcontractQTYs(prevState => {
            return { 
                ...prevState,
                max_LTV: LTVs[1],
                brw_LTV: LTVs[0],
                cost: cost
            }
        })
        //Set QTYs
        switch (currentAsset) {
            case "OSMO": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmo: +prevState.osmo + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmo: +prevState.osmo - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "ATOM": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            atom: +prevState.atom + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            atom: +prevState.atom - +(amount??0),
                        }
                    })
                }
                
                break;
            }
            case "axlUSDC": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            axlusdc: +prevState.axlusdc + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            axlusdc: +prevState.axlusdc - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "USDC": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            usdc: +prevState.usdc + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            usdc: +prevState.usdc - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "stATOM": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            stAtom: +prevState.stAtom + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            stAtom: +prevState.stAtom - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "stOSMO": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            stOsmo: +prevState.stOsmo + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            stOsmo: +prevState.stOsmo - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "TIA": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            tia: +prevState.tia + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            tia: +prevState.tia - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "USDT": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs((prevState: ContractInfo) => {
                        return { 
                            ...prevState,
                            usdt: +prevState.usdt + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs((prevState: ContractInfo) => {
                        return { 
                            ...prevState,
                            usdt: +prevState.usdt - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "ATOM-OSMO LP": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            atomosmo_pool: +prevState.atomosmo_pool + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            atomosmo_pool: +prevState.atomosmo_pool - +(amount??0),
                        }
                    })
                }
                break;
            }
            case "OSMO-axlUSDC LP": {
                if (currentfunctionLabel === "deposit"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmousdc_pool: +prevState.osmousdc_pool + +(amount??0),
                        }
                    })
                }
                else if (currentfunctionLabel === "withdraw"){
                    //@ts-ignore
                    setcontractQTYs(prevState => {
                        return { 
                            ...prevState,
                            osmousdc_pool: +prevState.osmousdc_pool - +(amount??0),
                        }
                    })
                }
                break;
            }
        }
    }
    const handleExecution = async (fn?: string) => {
        //Set function label if passed
        var currentfunction_label = fn ?? currentfunctionLabel;
        //Check if wallet is connected & connect if not
        if (address === undefined) {
            connect();
            return;
        }///Set asset intents
        var asset_intent: [string, number][] = [];
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
        if (depositAmounts.atomosmo_pool != undefined && depositAmounts.atomosmo_pool > 0){
            asset_intent.push(["ATOM-OSMO LP", depositAmounts.atomosmo_pool])
        }
        if (depositAmounts.osmousdc_pool != undefined && depositAmounts.osmousdc_pool > 0){
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
                        //Update contract QTYs
                        handlecontractQTYupdate();
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
                        //Update contract QTYs
                        handlecontractQTYupdate();
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
                        //Update contract QTYs
                        handlecontractQTYupdate();   
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
                        //Update contract QTYs
                        handlecontractQTYupdate();   
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
                                Mint of {(mintAmount ?? 0)} CDT into your wallet successful. Be aware that now that you have minted, you cannot withdraw collateral that would push your LTV past the yellow line & you will be liquidated down to said line if you reach the red. Also, you cannot pay below minimum debt so if you have minted at the minimum you will need to repay in full + interest.
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
                                Mint of {(mintAmount ?? 0)} CDT into your wallet successful. Be aware that now that you have minted, you cannot withdraw collateral that would push your LTV past the yellow line & you will be liquidated down to said line if you reach the red. Also, you cannot pay below minimum debt so if you have minted at the minimum you will need to repay in full + interest.
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
                //if trying to full repay, because sending back excess debt doesn't work...
                //repay needs to accrue & then query new debt amount and then repay
                if (((repayAmount ?? 0)* 1_000_000) >= debtAmount) {
                    //execute an accrue msg first
                    try {
                        ///Execute the Accrue
                        await cdp_client?.accrue({
                            positionIds: [positionID],
                            positionOwner: user_address,
                        }, "auto", undefined).then(async (res) => {           
                            console.log(res?.events.toString())
                            //Query position
                            //getPosition
                            await queryClient?.getBasketPositions(
                                {
                                    user: address as string,
                                }
                            ).then(async (res) => {
                                //Set amount to new debt amount
                                var repay_amount = parseInt(res[0].positions[0].credit_amount);
                                //Execute the Repay
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
                            })
                        })
                        
                    } catch (error){
                        ////Error message
                        const e = error as { message: string }
                        console.log(e.message)
                        ///Format Pop up
                        setPopupTrigger(true);
                        setPopupMsg(<div>{e.message}</div>);
                        setPopupStatus("Accrue Error");
                    }
                } else {
                    try {
                        var res = await cdp_client?.repay({
                            positionId: positionID,
                        }, "auto", undefined, coins(Math.ceil(((repayAmount??0) * 1_000_000)), denoms.cdt))
                        .then((res) => {           
                            console.log(res?.events.toString())
                            //Update mint amount
                            setdebtAmount(+debtAmount - +((repayAmount ?? 0)* 1_000_000));
                            setsliderValue((+debtAmount - +((repayAmount ?? 0)* 1_000_000))/1000000);
                            //format pop up
                            setPopupTrigger(true);
                            setPopupMsg(<div>Repayment of {(repayAmount ?? 0)} CDT successful</div>);
                            setPopupStatus("Success");
                        })
                        
                    } catch (error){
                        ////Error message
                        const e = error as { message: string }
                        console.log(e.message)
                        //This is a success msg but a cosmjs error
                        if (e.message === "Invalid string. Length must be a multiple of 4"){
                            //Update mint amount
                            setdebtAmount(+debtAmount - +((repayAmount ?? 0)* 1_000_000));
                            setsliderValue((+debtAmount - +((repayAmount ?? 0)* 1_000_000))/1000000);
                            //format pop up
                            setPopupTrigger(true);
                            setPopupMsg(<div>Repayment of {(repayAmount ?? 0)} CDT successful</div>);
                            setPopupStatus("Success");
                        } else {
                            ///Format Pop up
                            setPopupTrigger(true);
                            setPopupMsg(<div>{e.message}</div>);
                            setPopupStatus("Repay Error");
                        }
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
    const getcoinsfromassetIntents = (intents: [string, number][]) => {
        var workingIntents: Coin[] = [];
        intents.map((intent) => {
            switch (intent[0]){
                case "OSMO": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.osmo))
                    break;
                }
                case "ATOM": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.atom))
                    break;
                }
                case "axlUSDC": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.axlUSDC))
                    break;
                }                
                case "USDC": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.usdc))
                    break;
                }      
                case "stATOM": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.stAtom))
                    break;
                }      
                case "stOSMO": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.stOsmo))
                    break;
                }
                case "TIA": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.tia))
                    break;
                }
                case "USDT": {
                    workingIntents.push(coin(intent[1] * 1_000_000, denoms.usdt))
                    break;
                }
                case "ATOM-OSMO LP": { 
                    workingIntents.push(coin((BigInt(intent[1] * 1_000_000_000_000_000_000)).toString(), denoms.atomosmo_pool))
                    break;
                }
                case "OSMO-axlUSDC LP": {
                    workingIntents.push(coin((BigInt(intent[1] * 1_000_000_000_000_000_000)).toString(), denoms.osmousdc_pool))
                    break;
                }
            }
        })
        return workingIntents
    };
    const getassetsfromassetIntents = (intents: [string, number][]) => {
        var workingIntents: Asset[] = [];
        intents.map((intent) => {
            switch (intent[0]){
                case "OSMO": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
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
                        amount: (intent[1]* 1_000_000).toString(),
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
                        amount: (intent[1]* 1_000_000).toString(),
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
                        amount: (intent[1]* 1_000_000).toString(),
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
                        amount: (intent[1]* 1_000_000).toString(),
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
                        amount: (intent[1]* 1_000_000).toString(),
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
                        amount: (intent[1]* 1_000_000).toString(),
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
                        amount: (intent[1]* 1_000_000).toString(),
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
                        amount: (BigInt(intent[1] * 1_000_000_000_000_000_000)).toString(),
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
                        amount: (BigInt(intent[1] * 1_000_000_000_000_000_000)).toString(),
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

   function getTVL() {
    return(
        (positionQTYs.osmo * +prices.osmo) + (positionQTYs.atom * +prices.atom) + (positionQTYs.axlusdc * +prices.axlUSDC) + (positionQTYs.usdc * +prices.usdc)
        + (positionQTYs.atomosmo_pool * +prices.atomosmo_pool) + (positionQTYs.osmousdc_pool * +prices.osmousdc_pool) + (positionQTYs.stAtom * +prices.stAtom) + (positionQTYs.stOsmo * +prices.stOsmo)
        + (positionQTYs.tia * +prices.tia) + (positionQTYs.usdt * +prices.usdt)
    )
   }
   ///Get pro-rata cost
    function getRataCost() {
        var ratios = getassetRatios(getTVL(), positionQTYs, prices);
        var cost = 0;

        if (positionQTYs.osmo > 0){
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
        if (positionQTYs.atom > 0){
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
        if (positionQTYs.axlusdc > 0){
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
        if (positionQTYs.usdc > 0){
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
        if (positionQTYs.stAtom > 0){
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
        if (positionQTYs.stOsmo > 0){
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
        if (positionQTYs.tia > 0){
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
        if (positionQTYs.usdt > 0){
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
        if (positionQTYs.atomosmo_pool > 0){
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
        if (positionQTYs.osmousdc_pool > 0){
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
    function handlesetDepositAmount(asset: string, deposit_amount: number) {
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
    function handlesetDepositInput(asset: string, event: any){
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
    function checkIfWalletEmpty() {
        if (address !== undefined) {
            //check if wallet has been checked & is empty
            if (walletChecked && walletQTYs.osmo === 0 && walletQTYs.atom === 0 && walletQTYs.axlusdc === 0 && walletQTYs.usdc === 0 && walletQTYs.atomosmo_pool === 0 && walletQTYs.osmousdc_pool === 0 && walletQTYs.stAtom === 0 && walletQTYs.stOsmo === 0 && walletQTYs.tia === 0 && walletQTYs.usdt === 0){
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
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("osmo", walletQTYs.osmo)}>max: {walletQTYs.osmo.toFixed(3)}</div>
                        <label className="deposit-amount-label">OSMO amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.osmo ?? ''} type="number" onChange={(event)=>handlesetDepositInput("osmo", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.atom > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/atom.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("atom", walletQTYs.atom)}>max: {walletQTYs.atom.toFixed(3)}</div>
                        <label className="deposit-amount-label">ATOM amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.atom ?? ''} type="number" onChange={(event)=>handlesetDepositInput("atom", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.usdc > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("usdc", walletQTYs.usdc)}>max: {walletQTYs.usdc.toFixed(3)}</div>
                        <label className="deposit-amount-label">USDC amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.usdc ?? ''} type="number" onChange={(event)=>handlesetDepositInput("usdc", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.axlusdc > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("axlusdc", walletQTYs.axlusdc)}>max: {walletQTYs.axlusdc.toFixed(3)}</div>
                        <label className="deposit-amount-label">axlUSDC amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.axlusdc ?? ''} type="number" onChange={(event)=>handlesetDepositInput("axlusdc", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.stAtom > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/statom.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("stAtom", walletQTYs.stAtom)}>max: {walletQTYs.stAtom.toFixed(3)}</div>
                        <label className="deposit-amount-label">stATOM amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.stAtom ?? ''} type="number" onChange={(event)=>handlesetDepositInput("stAtom", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.stOsmo > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/stosmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("stOsmo", walletQTYs.stOsmo)}>max: {walletQTYs.stOsmo.toFixed(3)}</div>
                        <label className="deposit-amount-label">stOSMO amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.stOsmo ?? ''} type="number" onChange={(event)=>handlesetDepositInput("stOsmo", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.tia > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/tia.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("tia", walletQTYs.tia)}>max: {walletQTYs.tia.toFixed(3)}</div>
                        <label className="deposit-amount-label">TIA amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.tia ?? ''} type="number" onChange={(event)=>handlesetDepositInput("tia", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.usdt > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdt.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("usdt", walletQTYs.usdt)}>max: {walletQTYs.usdt.toFixed(3)}</div>
                        <label className="deposit-amount-label">USDT amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.usdt ?? ''} type="number" onChange={(event)=>handlesetDepositInput("usdt", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.atomosmo_pool > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element-lp">
                    <div className="deposit-element-icon-lp">
                        <Image className="deposit-icon-lp-left" width={45} height={45} alt="" src="images/atom.svg" />
                        <Image className="deposit-icon-lp-right" width={45} height={45} alt="" src="images/osmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("atomosmo_pool", walletQTYs.atomosmo_pool)}>max: {walletQTYs.atomosmo_pool.toFixed(3)}</div>
                        <label className="deposit-amount-label">ATOM/OSMO LP amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.atomosmo_pool ?? ''} type="number" onChange={(event)=>handlesetDepositInput("atomosmo_pool", event)}/>
                    </form>
                </div>: null}
                {walletQTYs.osmousdc_pool > 0 || assetcardTitle === "Show Relevant Assets" ?
                <div className="deposit-element-lp">
                    <div className="deposit-element-icon-lp">
                        <Image className="deposit-icon-lp-left" width={45} height={45} alt="" src="images/osmo.svg" />
                        <Image className="deposit-icon-lp-right" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("osmoaxlusdc_pool", walletQTYs.osmousdc_pool)}>max: {walletQTYs.osmousdc_pool.toFixed(3)}</div>
                        <label className="deposit-amount-label">OSMO/axlUSDC LP amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.osmousdc_pool ?? ''} type="number" onChange={(event)=>handlesetDepositInput("osmoaxlusdc_pool", event)}/>
                    </form>
                </div>: null}
                </> : //Withdraw elements
                <> 
                {contractQTYs.osmo > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/osmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("osmo", contractQTYs.osmo)}>max: {contractQTYs.osmo.toFixed(3)}</div>
                        <label className="deposit-amount-label">OSMO amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.osmo ?? ''} type="number" onChange={(event)=>handlesetDepositInput("osmo", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.atom > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/atom.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("atom", contractQTYs.atom)}>max: {contractQTYs.atom.toFixed(3)}</div>
                        <label className="deposit-amount-label">ATOM amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.atom ?? ''} type="number" onChange={(event)=>handlesetDepositInput("atom", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.usdc > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("usdc", contractQTYs.usdc)}>max: {contractQTYs.usdc.toFixed(3)}</div>
                        <label className="deposit-amount-label">USDC amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.usdc ?? ''} type="number" onChange={(event)=>handlesetDepositInput("usdc", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.axlusdc > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("axlusdc", contractQTYs.axlusdc)}>max: {contractQTYs.axlusdc.toFixed(3)}</div>
                        <label className="deposit-amount-label">axlUSDC amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.axlusdc ?? ''} type="number" onChange={(event)=>handlesetDepositInput("axlusdc", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.stAtom > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/statom.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("stAtom", contractQTYs.stAtom)}>max: {contractQTYs.stAtom.toFixed(3)}</div>
                        <label className="deposit-amount-label">stATOM amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.stAtom ?? ''} type="number" onChange={(event)=>handlesetDepositInput("stAtom", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.stOsmo > 0 ?        
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                        <Image className="deposit-icon" width={45} height={45} alt="" src="images/stosmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("stOsmo", contractQTYs.stOsmo)}>max: {contractQTYs.stOsmo.toFixed(3)}</div>
                        <label className="deposit-amount-label">stOSMO amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.stOsmo ?? ''} type="number" onChange={(event)=>handlesetDepositInput("stOsmo", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.tia > 0 ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/tia.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("tia", contractQTYs.tia)}>max: {contractQTYs.tia.toFixed(3)}</div>
                        <label className="deposit-amount-label">TIA amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.tia ?? ''} type="number" onChange={(event)=>handlesetDepositInput("tia", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.usdt > 0 ?
                <div className="deposit-element">
                    <div className="deposit-element-icon">
                    <Image className="deposit-icon" width={45} height={45} alt="" src="images/usdt.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("usdt", contractQTYs.usdt)}>max: {contractQTYs.usdt.toFixed(3)}</div>
                        <label className="deposit-amount-label">USDT amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.usdt ?? ''} type="number" onChange={(event)=>handlesetDepositInput("usdt", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.atomosmo_pool > 0 ?        
                <div className="deposit-element-lp">
                    <div className="deposit-element-icon-lp">
                        <Image className="deposit-icon-lp-left" width={45} height={45} alt="" src="images/atom.svg" />
                        <Image className="deposit-icon-lp-right" width={45} height={45} alt="" src="images/osmo.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("atomosmo_pool", contractQTYs.atomosmo_pool)}>max: {contractQTYs.atomosmo_pool.toFixed(3)}</div>
                        <label className="deposit-amount-label">ATOM/OSMO LP amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.atomosmo_pool ?? ''} type="number" onChange={(event)=>handlesetDepositInput("atomosmo_pool", event)}/>
                    </form>
                </div>: null}
                {contractQTYs.osmousdc_pool > 0 ?        
                <div className="deposit-element-lp">
                    <div className="deposit-element-icon-lp">
                        <Image className="deposit-icon-lp-left" width={45} height={45} alt="" src="images/osmo.svg" />
                        <Image className="deposit-icon-lp-right" width={45} height={45} alt="" src="images/usdc.axl.svg" />
                    </div>
                    <form className="deposit-form">
                        <div className="deposit-max-amount-label" onClick={()=>handlesetDepositAmount("osmoaxlusdc_pool", contractQTYs.osmousdc_pool)}>max: {contractQTYs.osmousdc_pool.toFixed(3)}</div>
                        <label className="deposit-amount-label">OSMO/axlUSDC LP amount:</label>     
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} name="amount" value={depositAmounts.osmousdc_pool ?? ''} type="number" onChange={(event)=>handlesetDepositInput("osmoaxlusdc_pool", event)}/>
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
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmo > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmo > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.osmo > 0 ?  "" : "low-opacity") : (positionQTYs.osmo > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.osmo * +prices.osmo) > 1000 ? (((walletQTYs.osmo * +prices.osmo)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.osmo * +prices.osmo) ?? 0).toFixed(2)) : ((positionQTYs.osmo * +prices.osmo) > 1000 ? (((positionQTYs.osmo * +prices.osmo)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.osmo * +prices.osmo) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.atom > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atom > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.atom > 0 ?  "" : "low-opacity") : (positionQTYs.atom > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.atom * +prices.atom) > 1000 ? (((walletQTYs.atom * +prices.atom)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.atom * +prices.atom) ?? 0).toFixed(2)) : ((positionQTYs.atom * +prices.atom) > 1000 ? (((positionQTYs.atom * +prices.atom)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.atom * +prices.atom) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.usdc > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.usdc > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.usdc > 0 ?  "" : "low-opacity") : (positionQTYs.usdc > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.usdc * +prices.usdc) > 1000 ? (((walletQTYs.usdc * +prices.usdc)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.usdc * +prices.usdc) ?? 0).toFixed(2)) : ((positionQTYs.usdc * +prices.usdc) > 1000 ? (((positionQTYs.usdc * +prices.usdc)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.usdc * +prices.usdc) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.axlusdc > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.axlusdc > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.axlusdc > 0 ?  "" : "low-opacity") : (positionQTYs.axlusdc > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.axlusdc * +prices.axlUSDC) > 1000 ? (((walletQTYs.axlusdc * +prices.axlUSDC)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.axlusdc * +prices.axlUSDC) ?? 0).toFixed(2)) : ((positionQTYs.axlusdc * +prices.axlUSDC) > 1000 ? (((positionQTYs.axlusdc * +prices.axlUSDC)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.axlusdc * +prices.axlUSDC) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.stAtom > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.stAtom > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.stAtom > 0 ?  "" : "low-opacity") : (positionQTYs.stAtom > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.stAtom * +prices.stAtom) > 1000 ? (((walletQTYs.stAtom * +prices.stAtom)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.stAtom * +prices.stAtom) ?? 0).toFixed(2)) : ((positionQTYs.stAtom * +prices.stAtom) > 1000 ? (((positionQTYs.stAtom * +prices.stAtom)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.stAtom * +prices.stAtom) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.stOsmo > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.stOsmo > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.stOsmo > 0 ?  "" : "low-opacity") : (positionQTYs.stOsmo > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.stOsmo * +prices.stOsmo) > 1000 ? (((walletQTYs.stOsmo * +prices.stOsmo)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.stOsmo * +prices.stOsmo) ?? 0).toFixed(2)) : ((positionQTYs.stOsmo * +prices.stOsmo) > 1000 ? (((positionQTYs.stOsmo * +prices.stOsmo)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.stOsmo * +prices.stOsmo) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.tia > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.tia > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.tia > 0 ?  "" : "low-opacity") : (positionQTYs.tia > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.tia * +prices.tia) > 1000 ? (((walletQTYs.tia * +prices.tia)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.tia * +prices.tia) ?? 0).toFixed(2)) : ((positionQTYs.tia * +prices.tia) > 1000 ? (((positionQTYs.tia * +prices.tia)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.tia * +prices.tia) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.usdt > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.usdt > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.usdt > 0 ?  "" : "low-opacity") : (positionQTYs.usdt > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.usdt * +prices.usdt) > 1000 ? (((walletQTYs.usdt * +prices.usdt)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.usdt * +prices.usdt) ?? 0).toFixed(2)) : ((positionQTYs.usdt * +prices.usdt) > 1000 ? (((positionQTYs.usdt * +prices.usdt)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.usdt * +prices.usdt) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.atomosmo_pool > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atomosmo_pool > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.atomosmo_pool > 0 ?  "" : "low-opacity") : (positionQTYs.atomosmo_pool > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.atomosmo_pool * +prices.atomosmo_pool) > 1000 ? (((walletQTYs.atomosmo_pool * +prices.atomosmo_pool)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.atomosmo_pool * +prices.atomosmo_pool) ?? 0).toFixed(2)) : ((positionQTYs.atomosmo_pool * +prices.atomosmo_pool) > 1000 ? (((positionQTYs.atomosmo_pool * +prices.atomosmo_pool)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.atomosmo_pool * +prices.atomosmo_pool) ?? 0).toFixed(2))}</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmousdc_pool > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmousdc_pool > 0 ? <div className={currentfunctionLabel === "deposit" ? (walletQTYs.osmousdc_pool > 0 ?  "" : "low-opacity") : (positionQTYs.osmousdc_pool > 0 ?  "" : "low-opacity")}>${currentfunctionLabel === "deposit" ? ((walletQTYs.osmousdc_pool * +prices.osmousdc_pool) > 1000 ? (((walletQTYs.osmousdc_pool * +prices.osmousdc_pool)/1000) ?? 0).toFixed(2)+"k" : ((walletQTYs.osmousdc_pool * +prices.osmousdc_pool) ?? 0).toFixed(2)) : ((positionQTYs.osmousdc_pool * +prices.osmousdc_pool) > 1000 ? (((positionQTYs.osmousdc_pool * +prices.osmousdc_pool)/1000) ?? 0).toFixed(2)+"k" : ((positionQTYs.osmousdc_pool * +prices.osmousdc_pool) ?? 0).toFixed(2))}</div> : null}
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
                {(currentfunctionLabel === "deposit" && (walletQTYs.atomosmo_pool > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atomosmo_pool > 0 ? <div className={positionQTYs.atomosmo_pool > 0 ?  "" : "low-opacity"}>{(rates.atomosmo_pool).toFixed(4)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmousdc_pool > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmousdc_pool > 0 ? <div className={positionQTYs.osmousdc_pool > 0 ?  "" : "low-opacity"}>{(rates.osmousdc_pool).toFixed(4)}%</div> : null}
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
                {(currentfunctionLabel === "deposit" && (walletQTYs.atomosmo_pool > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.atomosmo_pool > 0 ? <div className={positionQTYs.atomosmo_pool > 0 ?  "" : "low-opacity"}>{(debtCaps.atomosmo_pool * 100).toFixed(2)}%</div> : null}
                {(currentfunctionLabel === "deposit" && (walletQTYs.osmousdc_pool > 0 || assetcardTitle === "Show Relevant Assets")) || currentfunctionLabel !== "deposit" && contractQTYs.osmousdc_pool > 0 ? <div className={positionQTYs.osmousdc_pool > 0 ?  "" : "low-opacity"}>{(debtCaps.osmousdc_pool * 100).toFixed(2)}%</div> : null}
                </>
            : null}
            </div>
            </div> : null}
            {forVaults ? //Buttons
            <div className="deposit-withdraw-card-btns">
                <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "0%"}} onClick={()=>{if (currentfunctionLabel === "withdraw" || currentfunctionLabel === "deposit"){handleExecution()}}}>
                    {currentfunctionLabel === "deposit" ? "Deposit" : currentfunctionLabel === "withdraw" ? "Withdraw" : "---->"}
                </a>         
                <div className={"user-redemption-button"} onClick={handlefunctionLabel}>
                    <div className="spacing-btm">{currentfunctionLabel === "deposit" ? "Switch to withdraw" : currentfunctionLabel === "withdraw" ? "Switch to deposit" : "Switch to withdraw" }</div>
                </div> 
            </div>
            : null}
        </>);
    }
    const handlefunctionLabel = () => {
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
        var asset_intent: [string, number][] = [];
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
        if (depositAmounts.atomosmo_pool != undefined && depositAmounts.atomosmo_pool > 0){
            asset_intent.push(["ATOM-OSMO LP", depositAmounts.atomosmo_pool])
        }
        if (depositAmounts.osmousdc_pool != undefined && depositAmounts.osmousdc_pool > 0){
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
                setPopupStatus("Position has not been queried yet");
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
            atomosmo_pool: walletQTYz.atomosmo_pool??0,
            osmousdc_pool: walletQTYz.osmousdc_pool??0,
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
            <div className="vaults-title-div" style={{left: "3%"}}>
                <div className="onboarding-deposit-title">
                    Fund Position
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
                        <div className="mint-card-stats">Debt: {(debtAmount/1_000000).toFixed(2)} CDT</div>
                        <div className="mint-card-stats">Cost: {getRataCost()}%</div>
                        <div className="mint-card-stats">Liq. Value: ${((((debtAmount/1_000000)* creditPrice) / (maxLTV / 100)) ?? 0).toFixed(2)}</div>
                        <div className="mint-card-stats">TVL: ${(getTVL() ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="ltv-div">
                        <div className="mint-card-stats">LTV: {((((debtAmount/1_000000)* creditPrice)/(getTVL()+1)) * 100).toFixed(1)}%</div>                        
                        <div className="mint-card-stats">Borrowable LTV: {(brwLTV ?? 0).toFixed(0)}%</div>
                        <div className="mint-card-stats">Liquidation LTV: {(maxLTV ?? 0).toFixed(0)}%</div>
                    </div>
                </div>
                {/*Mint/Repay card with position stats*/}
                <div><div className="mint-element" style={currentfunctionLabel !== "repay" ? {} : {opacity: ".3"}}>
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop: "0%", width: "61px", top: "-19%"}} onClick={()=>{handleExecution("mint")}}>
                        Mint
                    </a> 
                    <form className="deposit-form" style={{top: "-19%"}}>
                        <div className="mint-max-amount-label" onClick={()=>setmintAmount(parseFloat(((getTVL()*(brwLTV/100))/Math.max(creditPrice, 1) - debtAmount/1_000000).toFixed(1)))}>max: {((getTVL()*(brwLTV/100))/Math.max(creditPrice, 1) - debtAmount/1_000000).toFixed(1)}</div>
                        <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} value={mintAmount} name="amount" type="number" onClick={()=>setcurrentfunctionLabel("mint")} onChange={(event)=>{event.preventDefault(); setmintAmount(parseFloat(event.target.value))}}/>
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
                            <div className="mint-max-amount-label" onClick={()=>setrepayAmount(debtAmount/1_000000)}>max: {(debtAmount/1_000000).toFixed(1)}</div>
                            <input className="card-deposit-amount" style={{backgroundColor:"#454444"}} value={repayAmount} name="amount" type="number" onClick={()=>setcurrentfunctionLabel("repay")} onChange={(event)=>{event.preventDefault(); setrepayAmount(parseFloat(event.target.value))}}/>
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
