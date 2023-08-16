import { background } from "@chakra-ui/react";
import { color } from "framer-motion";
import { useState } from "react";

import { contracts } from "../codegen";


const OSMO_denom = "uosmo";
const ATOM_denom = "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const axlUSDC_denom = "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858";

const Positions = () => {
    
const client = new contracts.Positions.PositionsClient();

    //Start screen
    const [startingParagraph, setStarting] = useState("Click an Asset's Quantity to initiate deposits");
    //Redemptions
    const [posClick, setposClick] = useState("mint-button-icon3");
    const [negClick, setnegClick] = useState("mint-button-icon4");
    const [redeemScreen, setredeemScreen] = useState("redemption-screen");
    const [redeemInfoScreen, setredeemInfoScreen] = useState("redemption-screen");
    const [premium, setPremium] = useState('');
    const [loanUsage, setloanUsage] = useState('');
    const [restrictedAssets, setRestricted] = useState({
        sentence: "Click Assets on the left to restrict redemption from, currently restricted: ",
        readable_assets: [] as string[],
        assets: [] as string[],
    });
    //Mint repay
    const [mintrepayScreen, setmintrepayScreen] = useState("mintrepay-screen");
    const [mintrepayLabel, setmintrepayLabel] = useState("");
    const [amount, setAmount] = useState(0);
    //Close position screen
    const [closeScreen, setcloseScreen] = useState("mintrepay-screen");
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
    const [osmoPrice, setosmoPrice] = useState(1);
    const [atomPrice, setatomPrice] = useState(1);
    const [axlusdcPrice, setaxlusdcPrice] = useState(1);
    const [osmoValue, setosmoValue] = useState(0);
    const [atomValue, setatomValue] = useState(0);
    const [axlUSDCValue, setaxlusdcValue] = useState(0);
    const [osmoStyle, setosmoStyle] = useState("low-opacity");
    const [atomStyle, setatomStyle] = useState("low-opacity");
    const [axlusdcStyle, setaxlusdcStyle] = useState("low-opacity");
    //Positions Visual
    const [debt, setDebt] = useState(0);
    const [liquidationValue, setliquidationValue] = useState(0);
    


    const handleOSMOqtyClick = () => {
        setdepositwithdrawScreen("deposit-withdraw-screen front-screen");
        setworkingAsset(OSMO_denom);
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
        setworkingAsset(ATOM_denom);
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
        setworkingAsset(axlUSDC_denom);
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
    const handleredeeminfoClick = () => {
        setredeemScreen("redemption-screen");
        setredeemInfoScreen("redemption-screen front-screen");
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
        } else {
            setposClick("mint-button-icon3");           
        }
      };

    const handlenegClick = () => {
        if (negClick == "mint-button-icon4") {
            setnegClick("mint-button-icon4-solid");
            setposClick("mint-button-icon3");
        } else {
            setnegClick("mint-button-icon4");
        }
      };
    const handleOSMOClick = () => {
        //Search for OSMO_denom in the asset list
        let asset_check = restrictedAssets.assets.filter(asset => asset === OSMO_denom)
        
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
                        OSMO_denom
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
            let asset_check = restrictedAssets.assets.filter(asset => asset != OSMO_denom)
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
        let asset_check = restrictedAssets.assets.filter(asset => asset === ATOM_denom)
        
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
                        ATOM_denom
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
            let asset_check = restrictedAssets.assets.filter(asset => asset != ATOM_denom)
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
        let asset_check = restrictedAssets.assets.filter(asset => asset === axlUSDC_denom)
        
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
                        axlUSDC_denom
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
            let asset_check = restrictedAssets.assets.filter(asset => asset != axlUSDC_denom)
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
    const handleQTYaddition = (current_asset: string, amount: number) => {

        switch(current_asset) {
            case 'OSMO': {
                var new_qty = +osmoQTY + +amount;
                setosmoQTY(new_qty);
                setAmount(0);
                setosmoValue(new_qty * +osmoPrice);

                //Remove opacity if above 0
                if (new_qty > 0){
                    setosmoStyle("");
                }
                break;
              }
            case 'ATOM':{
                var new_qty = +atomQTY + +amount;
                setatomQTY(new_qty);
                setAmount(0);
                setatomValue(new_qty * +atomPrice);
                
                //Remove opacity if above 0
                if (new_qty > 0){
                    setatomStyle("");
                }
                break;
              }
            case 'axlUSDC':{
                var new_qty = +axlusdcQTY + +amount;
                setaxlusdcQTY(new_qty);
                setAmount(0);
                setaxlusdcValue(new_qty * +axlusdcPrice);

                //Remove opacity if above 0
                if (new_qty > 0){
                    setaxlusdcStyle("");
                }
                break;
              }
          }
    };
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
                setosmoValue(new_qty * +osmoPrice);
                break;
              }
            case 'ATOM':{
                var new_qty = +atomQTY - +amount;
                setatomQTY(new_qty);
                setAmount(0);
                setatomValue(new_qty * +atomPrice);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setatomStyle("low-opacity");
                    setatomQTY(0);
                    new_qty = 0;
                }
                setatomValue(new_qty * +atomPrice);
                break;
              }
            case 'axlUSDC':{
                var new_qty = +axlusdcQTY - +amount;
                setaxlusdcQTY(new_qty);
                setAmount(0);
                setaxlusdcValue(new_qty * +axlusdcPrice);

                //Set opacity if 0 & set to if below
                if (new_qty <= 0){
                    setaxlusdcStyle("low-opacity");
                    setaxlusdcQTY(0);
                    new_qty = 0;
                }
                setaxlusdcValue(new_qty * +axlusdcPrice);
                break;
              }
          }
    };
    const handleLogoClick = () => {
        //create a variable for asset_intents so we can mutate it within the function
        //duplicate intents dont work
        var asset_intent = assetIntent;
        //switch on functionality
        switch (currentfunctionLabel){
            case "deposit":{
                if (asset_intent.length === 0){
                    asset_intent = [[currentAsset, amount]];
                }
                asset_intent.map((intent) => (
                    
                    //Execute contract//
                    //fetch working asset from current asset
        
                    //Update quantity && value labels
                    handleQTYaddition(intent[0], intent[1])
                    
                    //Update Position specific data
                ));

                //Clear intents
                setassetIntent([])
               break;
            }
            case "withdraw":{
                if (asset_intent.length === 0){
                    asset_intent = [[currentAsset, amount]];
                }
                asset_intent.map((intent) => (
                    
                    //Execute contract//
                    //fetch working asset from current asset
        
                    //Update quantity && value labels
                    handleQTYsubtraction(intent[0], intent[1])
                    
                    //Update Position specific data
                ));

                //Clear intents
                setassetIntent([])
                break;
            }
            case "mint": {
                ///Execute the contract

                ///on success, add to debt quantity
                updateDebt(amount, true)
                
                break;
            } 
            case "repay": {
                ///Execute the contract

                ///on success, subtract debt quantity
                updateDebt(amount, false)
                
                //Set to 0 if at or below
                if (+debt - +amount <= 0){
                    setDebt(0);
                }

                break;
            }
            case "closePosition":{
                ///Execute the contract

                //set all position data to 0 on success
                zeroData()

                break;
            }
            case "redemptions": {
                ///Execute the contract

                //update redemption values
            }
        }

        //Query for the position & update Liq. value using LTV

        //Query for Collateral interest and calculate the interst rate using the Position's cAsset ratios

    };
    const handleassetIntent = () => {
        setassetIntent(prevState => [
            ...prevState,
            [currentAsset, amount]
        ]);
    };
    /// zero asset QTY, TVL, debt, liq. value
    const zeroData = () => {
        handleQTYsubtraction("OSMO", osmoQTY);
        handleQTYsubtraction("ATOM", atomQTY);
        handleQTYsubtraction("axlUSDC", axlusdcQTY);
        setDebt(0); setliquidationValue(0);
    };
    ///update debt object
    const updateDebt = (amount: number, add: boolean) => {
        if (add){
            setDebt(+debt + +amount)

        } else {
            setDebt(+debt - +amount)
        }
    };
  return (
    <div className="positions">
      <div>
        <div className="vault-page">
          <div className="vault-subframe">
            <div className="debt-visual">
              <div className="infobox-icon" />
              <div className="infobox-icon1" />
              <div className="max-ltv">
                <div className="cdp-div2">60%</div>
                <div className="max-ltv-child" />
              </div>
              <div className="max-borrow-ltv">
                <div className="cdp-div3">45%</div>
                <div className="max-borrow-ltv-child" />
              </div>
              <div className="debt-visual-child" />
              <div className="debt-visual-item" />
            </div>
            <div className="position-stats">
              <div className="infobox-icon2" />
              <img className="cdt-logo-icon-cdp" alt="" src="images/cdt.svg" />
              <div className="cost-4">Cost: 4%</div>
              <div className="debt-225">Debt: ${debt}</div>
              <div className="liq-value-375">Liq. Value: $375</div>
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
        <div className="user-redemption-button" onClick={handleredeeminfoClick}>
            <div className="spacing-top">See Redemption Status</div>
        </div>
      </div>
      <div className={redeemInfoScreen}>
            <div className="user-redemptions">User redemptions</div>
      </div>
      <div className={closeScreen}>   
        <div className="close-screen">
            Close Position uses Apollo's Osmosis router to sell collateral to fulfill ALL REMAINING debt
        </div>
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
    </div>
  );
};

export default Positions;
