import { useState } from "react";
import Popup from "../Popup";
import { coins } from "@cosmjs/stargate";
import { denoms } from "../../config";
import { connectWallet, getWorkingDenom, usePopup } from "./HelperFunctions";


interface LQClaims {
  display: string;
  bidFor: string[];
}

interface SingleAssetBidProps {
    premium: any;
    plusPremium: () => void;
    minusPremium: () => void;
    lqClaimables: any;
    address: any;
    connect: () => void;
    menuAsset: string;
    assets: any;
    liq_queueClient: any;
    queryClient: any;
    setlqClaimables:  (value: React.SetStateAction<LQClaims>) => void;
  }
  
  export const SingleAssetBid: React.FC<SingleAssetBidProps> = ({ premium, plusPremium, minusPremium, lqClaimables, address, connect, menuAsset, assets, liq_queueClient, queryClient, setlqClaimables}) => {
    const [bidAmount, setbidAmount] = useState(5);
    const [saFunctionLabel, setsaFunctionLabel] = useState("Place");

    function setBidAmount(event: any) {
      event.preventDefault();
      setbidAmount(event.target.value)
    }

    const { trigger, setTrigger, msg, status, showPopup } = usePopup();

    function handlebidExecution () {    
      switch (saFunctionLabel) {
        case "Place": {
          handledepositClick();
          break;
        }
        case "Retract": {
          handlewithdrawClick();
          break;
        }
      }
    };

    const handledepositClick = async () => {      
      
      //Check if wallet is connected & connect if not
      if (!connectWallet(address, connect)) return;

      const workingDenom = getWorkingDenom(menuAsset, assets);
      var depositAmount = bidAmount;

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
        }, "auto", undefined, coins(((depositAmount ?? 0) * 1_000_000), denoms.cdt[0] as string)).then((res: any) => {
          console.log(res)

          showPopup("Success", `Bid of ${depositAmount} CDT at a ${premium}% premium successful`);
        })
      } catch (error) {
        console.log(error)
        const e = error as { message: string }
        //This is a success msg but a cosmjs error
        if (e.message === "Invalid string. Length must be a multiple of 4"){
          showPopup("Success", `Bid of ${depositAmount} CDT at a ${premium}% premium successful`);
        } else {
          showPopup("Error", e.message);
        }
      }
  }

  const handlewithdrawClick = async () => {
      //Check if wallet is connected & connect if not
      if (!connectWallet(address, connect)) return;

      const workingDenom = getWorkingDenom(menuAsset, assets);
      var withdrawAmount = bidAmount;

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
      }).then(async (res: any) => {
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
              
            }, "auto", undefined).then((res: any) => {
                console.log(res)
                showPopup("Success", `Retracted ${withdrawAmount} CDT from bid ${bidId}`);
                
              })
          } catch (error) {
            console.log(error)
            const e = error as { message: string }
            //This is a success msg but a cosmjs error
            if (e.message === "Invalid string. Length must be a multiple of 4"){
              showPopup("Success", `Retracted ${withdrawAmount} CDT from bid ${bidId}`);
            } else {
              showPopup("Error", e.message);
            }
          }
        }
      })
    } catch (error) {
      //We popup for the query error here bc its an execution function that is dependent on this
      console.log(error)
      const e = error as { message: string }
      showPopup("Error", e.message);
    }
  }

  const handleclaimClick = async () => {
      //Check if wallet is connected & connect if not
      if (!connectWallet(address, connect)) return;

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
        }).then((res: any) => {
          console.log(res)
          showPopup("Success", `Claimed ${lqClaimables.bidFor[i]}`);
        })
      }
    } catch (error) {
      console.log(error)
      const e = error as { message: string }
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        showPopup("Success", `Claimed ${lqClaimables.bidFor}`);
      } else {
        showPopup("Error", e.message);
      }

    }
    
    //Reset claimables
    setlqClaimables(prevState => {
      return { bidFor: [""], display: "No Claims"}
    });
  }
    return (
    <>
        <form className="bid-actionbox" style={{ top: "-9vh" }}>
            <div>
            <div className="bid-actionlabel" style={saFunctionLabel === "Place" ? {} : { opacity: 0.3 }} onClick={() => { setsaFunctionLabel("Place"); setbidAmount(5) }}>Place </div>
            <>/ </>
            <div className="bid-actionlabel" style={saFunctionLabel === "Retract" ? {} : { opacity: 0.3 }} onClick={() => { setsaFunctionLabel("Retract") }}>Retract </div>
            Bid
            </div>
            <div className="bid-actionbox-labels">Premium: </div>
            <input className="bid-actionbox-input" value={premium} defaultValue={0} style={{ width: "3.2vw" }} />
            <div style={{ display: "inline-block", backgroundColor: "#454444", height: "4vh" }}>%</div>
            <div className="premium-toggle">
            <a className="plus-premium" onClick={plusPremium}>+</a>
            <a className="minus-premium" onClick={minusPremium}>-</a>
            </div>
            <div className="bid-actionbox-labels">Amount: </div><input className="bid-actionbox-input" style={{ marginTop: "0.3vh" }} value={bidAmount} onChange={setBidAmount} /><div className="bid-actionbox-labels" style={{ textAlign: "center", width: "3vw" }}> CDT</div>
            <div className="btn bid-button" onClick={handlebidExecution}>{saFunctionLabel} Bid</div>
            <div className="btn sa-claim-button" data-descr={lqClaimables.display} style={lqClaimables.display === "No Claims" ? { opacity: 0.1, color: "black", padding: "0px", cursor: "default" } : { color: "black", padding: "0px" }} onClick={handleclaimClick}>Claim</div>
        </form>
        <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
    </>
    );
  };
