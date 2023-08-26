import { background } from "@chakra-ui/react";
import { color, px } from "framer-motion";
import { useEffect, useState } from "react";

import { contracts } from "../codegen";
import { usePositionsClient, usePositionsQueryClient } from "../hooks/use-positions-client";
import { testnetAddrs } from "../config";
import { Asset, AssetInfo, NativeToken, PositionResponse, RedeemabilityResponse } from "../codegen/Positions.types";
import { Coin, coin, coins, parseCoins } from "@cosmjs/amino";
import { StargateClient } from "@cosmjs/stargate";
import { PositionsClient, PositionsQueryClient } from "../codegen/Positions.client";
import { denoms } from ".";
import Popup from "./Popup";

const Positions = ({client, qClient, addr, prices}) => {

    const cdp_client = client as PositionsClient;
    const queryClient = qClient as PositionsQueryClient;
    const address = addr as string | undefined;

    //Popup
    const [popupTrigger, setPopupTrigger] = useState(true);
    const [popupMsg, setPopupMsg] = useState("Hitting the close button is acknowledgement & agreement to the below: ");
    const [popupStatus, setPopupStatus] = useState("User Agreement");
    //Start screen
    const [startingParagraph, setStarting] = useState("Click an Asset's Quantity to initiate deposits");
    //Redemptions
    const [posClick, setposClick] = useState("mint-button-icon3");
    const [negClick, setnegClick] = useState("mint-button-icon4");
    const [redeemScreen, setredeemScreen] = useState("redemption-screen");
    const [redeemInfoScreen, setredeemInfoScreen] = useState("redemption-screen");
    const [redeemButton, setredeemButton] = useState("user-redemption-button");
    const [redeemability, setRedeemability] = useState<boolean>();
    const [premium, setPremium] = useState();
    const [loanUsage, setloanUsage] = useState();
    const [restrictedAssets, setRestricted] = useState({
        sentence: "Click Assets on the left to restrict redemption from, currently restricted: ",
        readable_assets: [] as string[],
        assets: [] as string[],
    });
    const [redemptionRes, setredemptionRes] = useState<RedeemabilityResponse>();
    //Mint repay
    const [mintrepayScreen, setmintrepayScreen] = useState("mintrepay-screen");
    const [mintrepayLabel, setmintrepayLabel] = useState("");
    const [amount, setAmount] = useState(0);
    //Close position screen
    const [closeScreen, setcloseScreen] = useState("mintrepay-screen");
    const [maxSpread, setSpread] = useState(0.01);
    //Deposit-Withdraw screen
    const [depositwithdrawScreen, setdepositwithdrawScreen] = useState("deposit-withdraw-screen");
    const [currentfunctionLabel, setcurrentfunctionLabel] = useState("deposit");
    const [currentAsset, setcurrentAsset] = useState("");
    const [workingAsset, setworkingAsset] = useState("");
    const [depositStyle, setdepositStyle] = useState("cdp-deposit-label bold");
    const [withdrawStyle, setwithdrawStyle] = useState("cdp-withdraw-label low-opacity");
    const [assetIntent, setassetIntent] = useState<[string , number][]>([]);
    //Asset specific
    const [osmoQTY, setosmoQTY] = useState(0);
    const [atomQTY, setatomQTY] = useState(0);
    const [axlusdcQTY, setaxlusdcQTY] = useState(0);
    const [osmoValue, setosmoValue] = useState(0);
    const [atomValue, setatomValue] = useState(0);
    const [axlUSDCValue, setaxlusdcValue] = useState(0);
    const [osmoStyle, setosmoStyle] = useState("low-opacity");
    const [atomStyle, setatomStyle] = useState("low-opacity");
    const [axlusdcStyle, setaxlusdcStyle] = useState("low-opacity");
    //Positions Visual
    const [debt, setDebt] = useState(0);
    const [maxLTV, setmaxLTV] = useState(100);
    const [brwLTV, setbrwLTV] = useState(0);
    const [currentLTV, setcurrentLTV] = useState(0);
    const [cost, setCost] = useState(0);
    const [positionID, setpositionID] = useState("0");
    const [user_address, setAddress] = useState("");


    const handleOSMOqtyClick = () => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setworkingAsset(denoms.osmo);
        setcurrentAsset("OSMO");
        handledepositClick();
        //Send to back
        setredeemScreen("redemption-screen");
        setmintrepayScreen("mintrepay-screen");
        setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
        setStarting("");
    };
    const handleATOMqtyClick = () => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setworkingAsset(denoms.atom);
        setcurrentAsset("ATOM");
        handledepositClick();
        //Send to back
        setredeemScreen("redemption-screen");
        setmintrepayScreen("mintrepay-screen");
        setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
        setStarting("");
    };
    const handleaxlUSDCqtyClick = () => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setworkingAsset(denoms.axlUSDC);
        setcurrentAsset("axlUSDC");
        handledepositClick();
        //Send to back
        setredeemScreen("redemption-screen");
        setmintrepayScreen("mintrepay-screen");
        setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
        setStarting("");
    };

   //Redeem
    const handleredeemScreen = () => {
        setredeemScreen("redemption-screen front-screen");
        setmintrepayScreen("mintrepay-screen");
        setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
        setdepositwithdrawScreen("deposit-withdraw-screen");
        setStarting("");
        //Set functionality        
        setcurrentfunctionLabel("redemptions");
    };
    const handleredeeminfoClick = async () => {

        try {
            console.log("trying")
            await queryClient?.getBasketRedeemability({
                limit: 1,
                positionOwner: user_address,
            }).then((res) => {

            if (res?.premium_infos.length > 0) {
                setredemptionRes(res)
                setredeemScreen("redemption-screen");
                setredeemInfoScreen("redemption-screen front-screen");
                setredeemButton("user-redemption-button")
            } else {
                setredeemButton("user-redemption-button red-border")
            }
            console.log(res)
        })
        } catch (error) {
            setredeemButton("user-redemption-button red-border")
            console.log(error)
        }   

    };
    const handlesetPremium = (event) => {
        event.preventDefault();
        setPremium(event.target.value);
      };
    const handlesetloanUsage = (event) => {
        event.preventDefault();
        setloanUsage(event.target.value);
    };
    const handleposClick = () => {
        if (posClick == "mint-button-icon3") {
            setposClick("mint-button-icon3-solid");
            setnegClick("mint-button-icon4");
            setRedeemability(true);
        } else {
            setposClick("mint-button-icon3");
            setRedeemability(undefined);
        }
      };

    const handlenegClick = () => {
        if (negClick == "mint-button-icon4") {
            setnegClick("mint-button-icon4-solid");
            setposClick("mint-button-icon3");
            setRedeemability(false);
        } else {
            setnegClick("mint-button-icon4");
            setRedeemability(undefined);
        }
      };
    const handleOSMOClick = () => {
        //Search for OSMO_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.osmo)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "OSMO"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.osmo
                    ]
                }
            })
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.osmo)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "OSMO")
            //Update assets
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleATOMClick = () => {
        //Search for ATOM_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.atom)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "ATOM"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.atom
                    ]
                }
            })
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.atom)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "ATOM")
            //Update assets
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    const handleaxlUSDCClick = () => {
        //Search for axlUSDC_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === denoms.axlUSDC)
        
        //If unadded, add to assets && sentence
        if (asset_check.length == 0) {
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: [
                        ...prevState.readable_assets,
                        "axlUSDC"
                    ],
                    assets: [
                        ...prevState.assets,
                        denoms.axlUSDC
                    ]
                }
            })
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        } else {
            //Remove from assets list
            let asset_check = restrictedAssets.assets.filter(asset => asset != denoms.axlUSDC)
            let readable_asset_check = restrictedAssets.readable_assets.filter(asset => asset != "axlUSDC")
            //Update assets
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    readable_assets: readable_asset_check,
                    assets: asset_check
                }
            })
            //Update sentence
            setRestricted(prevState => {
                return { 
                    ...prevState,
                    sentence: "Click Assets on the left to restrict redemption from, currently restricted: " + prevState.readable_assets,
                }
            })
        }
    };
    //Mint
    const handlemintScreen = () => {
        //Update screens
        setmintrepayScreen("mintrepay-screen front-screen");
        setredeemScreen("redemption-screen");
        setcloseScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
        setStarting("");
        setdepositwithdrawScreen("deposit-withdraw-screen");
        //Update label
        setmintrepayLabel("Mint");
        //Set functionality        
        setcurrentfunctionLabel("mint");
    };
    //Repay
    const handlerepayScreen = () => {
        //Update screens
        setmintrepayScreen("mintrepay-screen front-screen");
        setredeemScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
        setcloseScreen("redemption-screen");
        setStarting("");
        setdepositwithdrawScreen("deposit-withdraw-screen");
        //Update label
        setmintrepayLabel("Repay");
        //Set functionality        
        setcurrentfunctionLabel("repay");
    };
    const handlesetAmount = (event) => {
        event.preventDefault();
        setAmount(event.target.value);
      };
    //Close
    const handlecloseScreen = () => {
        setcloseScreen("redemption-screen front-screen");
        setmintrepayScreen("mintrepay-screen");
        setredeemScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen");
        setdepositwithdrawScreen("deposit-withdraw-screen");
        setStarting("");
        setcurrentfunctionLabel("closePosition");
    };
    const handlesetSpread = (event) => {
        event.preventDefault();
        setSpread(event.target.value);
      };
    //Deposit-Withdraw screen    
    const handledepositClick = () => {
        setdepositStyle("cdp-deposit-label bold");
        setwithdrawStyle("cdp-withdraw-label low-opacity");
        setcurrentfunctionLabel("deposit");
    };
    const handlewithdrawClick = () => {
        setwithdrawStyle("cdp-withdraw-label bold");
        setdepositStyle("cdp-deposit-label low-opacity");
        setcurrentfunctionLabel("withdraw");
    };

    //Logo functionality activation
    // const handleQTYaddition = (current_asset: string, amount: number) => {

    //     switch(current_asset) {
    //         case 'OSMO': {
    //             var new_qty = +osmoQTY + +amount;
    //             setosmoQTY(new_qty);
    //             setAmount(0);
    //             setosmoValue(new_qty * +prices.osmo);

    //             //Remove opacity if above 0
    //             if (new_qty > 0){
    //                 setosmoStyle("");
    //             }
    //             break;
    //           }
    //         case 'ATOM':{
    //             var new_qty = +atomQTY + +amount;
    //             setatomQTY(new_qty);
    //             setAmount(0);
    //             setatomValue(new_qty * +prices.atom);
                
    //             //Remove opacity if above 0
    //             if (new_qty > 0){
    //                 setatomStyle("");
    //             }
    //             break;
    //           }
    //         case 'axlUSDC':{
    //             var new_qty = +axlusdcQTY + +amount;
    //             setaxlusdcQTY(new_qty);
    //             setAmount(0);
    //             setaxlusdcValue(new_qty * +prices.axlUSDC);

    //             //Remove opacity if above 0
    //             if (new_qty > 0){
    //                 setaxlusdcStyle("");
    //             }
    //             break;
    //           }
    //       }
    // };
    const handleQTYsubtraction = (current_asset: string, amount: number) => {

        switch(current_asset) {
            case 'OSMO': {
                var new_qty = +osmoQTY - +amount;
                setosmoQTY(new_qty);
                setAmount(0);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setosmoStyle("low-opacity");
                    setosmoQTY(0);
                    new_qty = 0;
                }
                setosmoValue(new_qty * +prices.osmo);
                break;
              }
            case 'ATOM':{
                var new_qty = +atomQTY - +amount;
                setatomQTY(new_qty);
                setAmount(0);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setatomStyle("low-opacity");
                    setatomQTY(0);
                    new_qty = 0;
                }
                setatomValue(new_qty * +prices.atom);
                break;
              }
            case 'axlUSDC':{
                var new_qty = +axlusdcQTY - +amount;
                setaxlusdcQTY(new_qty);
                setAmount(0);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setaxlusdcStyle("low-opacity");
                    setaxlusdcQTY(0);
                    new_qty = 0;
                }
                setaxlusdcValue(new_qty * +prices.axlUSDC);
                break;
              }
          }
    };
    const handleLogoClick = async () => {
        //create a variable for asset_intents so we can mutate it within the function
        //duplicate intents dont work
        var asset_intent = assetIntent;
        //switch on functionality
        switch (currentfunctionLabel){
            case "deposit":{
                if (asset_intent.length === 0){
                    asset_intent = [[currentAsset, amount]];
                }
                ///parse assets into coin amounts
                var user_coins = getcoinsfromassetIntents(asset_intent);

                try {
                    ////Execute Deposit////
                    await cdp_client?.deposit({
                        positionId: positionID,
                        positionOwner: user_address,
                    },
                    "auto", undefined, user_coins).then((res) => {
                        console.log(res?.events.toString())
                        //update data
                        fetch_update_positionData()
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Deposit of" +{asset_intent}+ "successful");
                        setPopupStatus("Success");
                    });

                    //Clear intents
                    setassetIntent([])
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Deposit Error");
                }
               break;
            }
            case "withdraw":{
                if (asset_intent.length === 0){
                    asset_intent = [[currentAsset, amount]];
                }                
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
                        //Update Position specific data
                        fetch_update_positionData()
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Withdrawal of" +{asset_intent}+ "successful");
                        setPopupStatus("Success");
                    })

                    //Clear intents
                    setassetIntent([])
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Withdrawal Error");
                } 
                break;
            }
            case "mint": {                
                try {
                    ///Execute the Mint
                    await cdp_client?.increaseDebt({
                        positionId: positionID,
                        amount: (amount * 1_000_000).toString(),
                    }).then((res) => {           
                        console.log(res?.events.toString())             
                        //Update Position specific data
                        fetch_update_positionData()
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Mint of" +{amount}+ "CDT successful");
                        setPopupStatus("Success");
                    })
                    
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Mint Error");
                }
                
                break;
            } 
            case "repay": {
                try {
                    ///Execute the contract
                    var res = await cdp_client?.repay({
                        positionId: positionID,
                    }, "auto", undefined, coins(amount * 1_000_000, denoms.cdt))
                    .then((res) => {           
                        console.log(res?.events.toString())             
                        //Update Position specific data
                        fetch_update_positionData()
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Repayment of" +{amount}+ "CDT successful");
                        setPopupStatus("Success");
                    })
                    
                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Repay Error");
                }
                break;
            }
            case "closePosition":{
                try { 
                    ///Execute the contract
                    await cdp_client?.closePosition({
                        maxSpread: maxSpread.toString(),
                        positionId: positionID,
                    }, "auto", undefined).then((res) => {
                        console.log(res?.events.toString())
                        //set all position data to 0 on success
                        zeroData()
                        //format pop up
                        setPopupTrigger(true);
                        setPopupMsg("Position closed successfully");
                        setPopupStatus("Success");
                    })

                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("ClosePosition Error");
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
                        setPopupMsg("Redemption settings updated successfully");
                        setPopupStatus("Success");
                    })

                } catch (error){
                    ////Error message
                    const e = error as { message: string }
                    console.log(e.message)
                    ///Format Pop up
                    setPopupTrigger(true);
                    setPopupMsg(e.message);
                    setPopupStatus("Edit Redemption Info Error");
                }
            }
        }

    };
    const handleassetIntent = () => {
        setassetIntent(prevState => [
            ...prevState,
            [currentAsset, amount]
        ]);
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
                        info: {
                            denom: denoms.osmo,
                        },
                    })
                    break;
                }
                case "ATOM": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        info: {
                            denom: denoms.atom,
                        },
                    })
                    break;
                }
                case "axlUSDC": {
                    workingIntents.push({
                        amount: (intent[1]* 1_000_000).toString(),
                        info: {
                            denom: denoms.axlUSDC,
                        },
                    })
                    break;
                }
            }
        })
        return workingIntents
    };
    /// zero asset QTY, TVL, debt, liq. value
    const zeroData = () => {
        handleQTYsubtraction("OSMO", osmoQTY);
        handleQTYsubtraction("ATOM", atomQTY);
        handleQTYsubtraction("axlUSDC", axlusdcQTY);
        setDebt(0); setmaxLTV(0);
    };

   const fetch_update_positionData = async () => {
        //Query for position data
        try {
            
            //getBasket
            const basketRes = await queryClient?.getBasket();

            //getPosition
            const userRes = await queryClient?.getUserPositions(
                {
                    limit: 1,
                    user: address as string,
                }
            );
            
            //query rates
            const rateRes = await queryClient?.getCollateralInterest();
          

            //Set state
            if (userRes && basketRes && rateRes){
                //setPositionID
                setpositionID(userRes[0].position_id)
                //calc Debt
                var new_debt = parseInt(userRes[0].credit_amount) * parseFloat(basketRes.credit_price);
                //setDebt
                setDebt(new_debt)
                //setLTVs
                setmaxLTV(parseFloat(userRes[0].avg_max_LTV) * +100)
                setbrwLTV(parseFloat(userRes[0].avg_borrow_LTV) * +100)
                setcurrentLTV(
                    (new_debt) / (osmoValue + atomValue + axlUSDCValue)
                )
                //setAssetQTYs
                userRes[0].collateral_assets.forEach(asset => {
                    var actual_asset = asset.asset;
                    //Cast to AssetInfo::NativeToken
                    if ("denom" in actual_asset.info) {
                        if (actual_asset.info.denom === denoms.osmo) {
                            setosmoQTY(parseInt(actual_asset.amount) / 1_000_000)                            
                            setosmoValue(parseInt(actual_asset.amount) * +prices.osmo);
                        } else if (actual_asset.info.denom === denoms.atom) {
                            setatomQTY(parseInt(actual_asset.amount) / 1_000_000)
                            setatomValue(parseInt(actual_asset.amount) * +prices.atom);
                        } else if (actual_asset.info.denom === denoms.axlUSDC) {
                            setaxlusdcQTY(parseInt(actual_asset.amount) / 1_000_000)
                            setaxlusdcValue(parseInt(actual_asset.amount) * +prices.axlUSDC);
                        }
                    }
                })

                ///setCost///
                var total_rate = 0.0;
                //get the positions collateral indices in Basket rates
                userRes[0].collateral_assets.forEach((asset, index, _) => {
                    //find the asset's index                
                    var rate_index = basketRes.collateral_types.findIndex((info) => {
                        if (("denom" in info.asset.info) && ("denom" in asset.asset.info)){
                            return info.asset.info.denom === asset.asset.info.denom
                        }
                    })

                    //use the index to get its interest rate
                    var asset_rate = rateRes.rates[rate_index];

                    //add pro-rata rate to sum 
                    total_rate += parseFloat(asset_rate) * parseFloat(userRes[0].cAsset_ratios[index]);
                })
                //setCost 
                setCost(total_rate);
            }
            
        } catch (error) {
            console.log(error)
        }
   };   

    

    //getuserPosition info && set State
    useEffect(() => {
        if (address) {
            console.log("address: ", address)
            //setAddress
            setAddress(address as string)

            //fetch & Update position data
            fetch_update_positionData()
        } else {        
            console.log("address: ", address)
        }
    }, [address])

  return (
    <div className="positions">
      <div>
        <div className="vault-page">
          <div className="vault-subframe">
            <div className="debt-visual">
              <div className="infobox-icon" />
              <div className="infobox-icon1" />
              <div className="max-ltv">
                <div className="cdp-div2">{maxLTV}%</div>
                <div className="max-ltv-child" />
              </div>
              <div className="max-borrow-ltv">
                <div className="cdp-div3">{brwLTV}%</div>
                <div className="max-borrow-ltv-child" />
              </div>
              <div className="debt-visual-child" />
              <div className="debt-visual-item" style={{top: 442 - (336 * (currentLTV / maxLTV)), height: (336 * (currentLTV / maxLTV))}}/>
            </div>
            <div className="position-stats">
              <div className="infobox-icon2" />
              <img className="cdt-logo-icon-cdp" alt="" src="images/cdt.svg" />
              <div className="cost-4">Cost: {cost}%</div>
              <div className="debt-225">Debt: ${debt}</div>
              <div className="liq-value-375">Liq. Value: ${debt / maxLTV}</div>
              <div className="tvl-500">TVL: ${osmoValue + atomValue + axlUSDCValue}</div>
            </div>
            <div className="asset-info">
              <div className="infobox-icon3"/>
              <div className="asset-info-child" />
              <div className="asset-info-item" />
              <div className="asset-info-inner" />
              <div className="line-div" />
              <div className="asset-info-child1" />
              <div className="asset-info-child2" />
              <div className="asset-info-child3" />
              <div className="asset">Asset</div>
              <div className="qty">Qty.</div>
              <div className="value">Value</div>
              <div className={osmoStyle}>
                <img className="osmo-logo-icon " alt="" src="images/osmo.svg" onClick={handleOSMOClick}/>
                <div className="osmo-qty" onClick={handleOSMOqtyClick}>{osmoQTY}</div>
                <div className="cdp-div5">${osmoValue}</div>
              </div>              
              <div className={atomStyle}>
                <img className="atom-logo-icon" alt="" src="images/atom.svg" onClick={handleATOMClick} />
                <div className="atom-qty" onClick={handleATOMqtyClick}>{atomQTY}</div>
                <div className="cdp-div7">${atomValue}</div>
              </div>
              <div className={axlusdcStyle}>
                <img className="axlusdc-logo-icon" alt="" src="images/usdc.svg" onClick={handleaxlUSDCClick} />
                <div className="axlUSDC-qty" onClick={handleaxlUSDCqtyClick}>{axlusdcQTY}</div>
                <div className="cdp-div9">${axlUSDCValue}</div>
              </div>
            </div>
          </div>
          <div className="controller-border"/>
          <div className="controller-frame"/>
          <div className="controller-label"/>
          <div className="repay-button" onClick={handlerepayScreen}/>
          <div className="mint-button" onClick={handlemintScreen}/>
          <div className="controller-screen-blank">
            <div className="starting-screen">
                {startingParagraph}
            </div>
          </div>
          <div className="rdemption-button" onClick={handleredeemScreen}/>
          <div className="close-button" onClick={handlecloseScreen}/>
          <div className="controller">Controller</div>
          <div className="mint" onClick={handlemintScreen}>MINT</div>
          <div className="close-position" onClick={handlecloseScreen}>CLOSE</div>
          <div className="set-redemptions" onClick={handleredeemScreen}>REDEMPTION</div>
          <div className="repay" onClick={handlerepayScreen}>REPAY</div>
        </div>

        <img className="pie-chart-icon1" alt="" src="images/pie_chart.svg" />          
        <div className="vaults1">VAULTS</div>
      </div>
      <div className={mintrepayScreen}>   
        <form>
            <label className="amount-label">{mintrepayLabel} amount:</label>     
            <input className="amount" name="amount" value={amount} type="number" onChange={handlesetAmount}/>
            <img className="cdt-logo-icon7" alt="" src="images/cdt.svg"  onClick={handleLogoClick}/>
        </form>
      </div>
      <div className={redeemScreen}>
        <form>            
            <input className="mint-button-icon2" name="premium" value={premium} type="number" onChange={handlesetPremium}/>
            <div className={posClick} onClick={handleposClick}/>
            <div className={negClick} onClick={handlenegClick}/>
            <div className="premium-label">Premium</div>
            <input className="mint-button-icon5" name="loan-usage" value={loanUsage} type="number" onChange={handlesetloanUsage}/>
            <div className="loan-usage">% Loan Usage</div>
            <img className="cdt-logo-icon7" alt="" src="images/cdt.svg" onClick={handleLogoClick}/>
        </form>
        <div className="edit-redeemability">Redeemability Status</div>
        <div className="click-assets-on">
          {restrictedAssets.sentence}
        </div>
        <div className={redeemButton} onClick={handleredeeminfoClick}>
            <div className="spacing-top">See Redemption Status</div>
        </div>
      </div>
      <div className={redeemInfoScreen}>
            <div className="user-redemptions">
                <div>Premium: {redemptionRes?.premium_infos[0].premium }</div>
                <div>Left to Redeem: {redemptionRes?.premium_infos[0].users_of_premium[0].position_infos[0].remaining_loan_repayment}</div>
                <div>Restricted Assets: {redemptionRes?.premium_infos[0].users_of_premium[0].position_infos[0].restricted_collateral_assets}</div>
            </div>
      </div>
      <div className={closeScreen}>
        <div className="close-screen">
            Close Position uses Apollo's Osmosis router to sell collateral to fulfill ALL REMAINING debt
        </div>
        <form>
            <label className="spread-label">Max spread (ex: 1% as 0.01)</label>     
            <input className="spread" name="spread" value={maxSpread} type="number" onChange={handlesetSpread}/>
        </form>
        <img className="cdt-logo-icon7" alt="" src="images/cdt.svg"  onClick={handleLogoClick}/>
      </div>
      <div className={depositwithdrawScreen}>
        <div className={depositStyle} onClick={handledepositClick}>Deposit</div>
        <div className="slash">/</div>
        <div className={withdrawStyle} onClick={handlewithdrawClick}>Withdraw</div>
        <form>
            <label className="amount-label">{currentAsset} amount:</label>     
            <input className="amount" name="amount" value={amount} type="number" onChange={handlesetAmount}/>
            <img className="cdt-logo-icon7" alt="" src="images/cdt.svg" onClick={handleLogoClick}/>
        </form>
        <div className="save-asset-intent-button" onClick={handleassetIntent}>
            <div className="spacing-top">Save {currentfunctionLabel} intent</div>
        </div>
        <div className="intents">
            {assetIntent.map((intent) => (
                <>{intent[0]}: {intent[1]},  </>
            ))}
        </div>
      </div>
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </div>
  );
};

export default Positions;
