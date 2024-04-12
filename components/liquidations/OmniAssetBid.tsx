import { useState } from "react";
import Popup from "../Popup";
import { coins } from "@cosmjs/stargate";
import { denoms } from "../../config";
import { connectWallet, usePopup } from "./HelperFunctions";
import { StabilityPoolClient, StabilityPoolQueryClient } from "../../codegen/stability_pool/StabilityPool.client";

interface OmniAssetBidProps {
    address: string | undefined;
    connect: () => void;
    sp_client: StabilityPoolClient | null;
    sp_queryClient: StabilityPoolQueryClient | null;
    setcapitalAhead: (value: number) => void;
    setuserclosestDeposit: (value: number) => void;
    userTVL: number;
    setuserTVL: (value: number) => void;
    SPclaimables: string;
}
  
export const OmniAssetBid: React.FC<OmniAssetBidProps> = ({address, connect, sp_client, sp_queryClient, setcapitalAhead, setuserclosestDeposit, userTVL, setuserTVL, SPclaimables }) => {
    const [omniAmount, setOmniAmount] = useState(5);
    const [oaFunctionLabel, setoaFunctionLabel] = useState("Place");
    const { trigger, setTrigger, msg, status, showPopup } = usePopup();

    function handleOmniExecution() {    
        switch (oaFunctionLabel) {
          case "Join": {
            // handleStabilityDeposit();
            break;
          }
          case "Exit": {
            handleStabilityWithdraw();
            break;
          }
        }
      }

    const handleStabilityDeposit = async () => {
        if (!connectWallet(address, connect)) return;

        try {
            await sp_client?.deposit({}
            , "auto", undefined, coins(((omniAmount ?? 0) * 1_000_000), denoms.cdt[0] as string)
            ).then(async (res) => {
                console.log(res)
                showPopup("Success", `Deposited ${omniAmount} CDT`);

                //Query capital ahead of user deposit
                await sp_queryClient?.capitalAheadOfDeposit({
                user: address ?? "",
                }).then((res) => {
                console.log(res)
                //set capital ahead of user deposit
                setcapitalAhead(parseInt(res.capital_ahead ?? 0) / 1_000_000)
                //set user closest deposit in K
                if (res.deposit !== undefined) {
                    setuserclosestDeposit(parseInt(res.deposit.amount ?? 0) / 1_000_000)
                } else {  
                    //set to 0 if no deposit        
                    setuserclosestDeposit(0)
                }
                })
                //Query user's total deposit
                await sp_queryClient?.assetPool({
                user: address ?? "",
                }).then((res) => {
                console.log(res)
                //Calc user tvl
                var tvl = 0;
                for (let i = 0; i < res.deposits.length; i++) {
                    tvl += parseInt(res.deposits[i].amount) / 1_000_000;
                }
                //set user tvl
                setuserTVL(tvl)
                })
            })

        } catch (error) {
        console.log(error)
        const e = error as { message: string }
        //Format popup
        showPopup("Error", e.message);
        }
    }

    const handleStabilityWithdraw = async () => {
        if (!connectWallet(address, connect)) return;

        try {
        await sp_client?.withdraw({
            amount: ((omniAmount ?? 0) * 1_000_000).toString(),
        }, "auto", undefined)
            .then(async (res) => {
            console.log(res)
            showPopup("Success","");

            //Query capital ahead of user deposit
            await sp_queryClient?.capitalAheadOfDeposit({
                user: address ?? "",
            }).then((res) => {
                console.log(res)
                //set capital ahead of user deposit
                setcapitalAhead(parseInt(res.capital_ahead ?? 0) / 1_000_000)
                //set user closest deposit in K
                if (res.deposit !== undefined) {
                setuserclosestDeposit(parseInt(res.deposit.amount ?? 0) / 1_000_000)
                } else {  
                //set to 0 if no deposit        
                setuserclosestDeposit(0)
                }
            })
            //Query user's total deposit
            await sp_queryClient?.assetPool({
                user: address ?? "",
            }).then((res) => {
                console.log(res)
                //Calc user tvl
                var tvl = 0;
                for (let i = 0; i < res.deposits.length; i++) {
                tvl += parseInt(res.deposits[i].amount) / 1_000_000;
                }
                //Format pop-up
                if (tvl < userTVL){
                showPopup("Success", `Withdrew ${omniAmount} CDT`);
                //set user tvl
                setuserTVL(tvl)
                } else {              
                showPopup("Success", `Unstaked ${omniAmount} CDT`);
                }

            })
            })

        } catch (error) {
        console.log(error)
        const e = error as { message: string }
        //Format popup
        showPopup("Error", e.message);
        }
    }

    const handleStabilityClaim = async () => {
        //Check if wallet is connected & connect if not
        if (address === undefined) {
        connect();
        return;
        }
        try { 
        await sp_client?.claimRewards("auto", undefined).then((res) => {
            console.log(res)
            showPopup("Success", `Claimed ${SPclaimables} CDT`);
        })
        } catch (error) { 
        console.log(error)
        const e = error as { message: string }
        showPopup("Error", e.message);
        }
    }

    const setOmniAmountHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setOmniAmount(Number(event.target.value));
    };

    return (
    <>
        <form className="bid-actionbox">
        <div>
            <div className="bid-actionlabel" style={oaFunctionLabel === "Join" ? {} : {opacity: 0.3}} onClick={()=>{setoaFunctionLabel("Join"); setOmniAmount(5)}}>Join </div>
            <>/ </>
            <div className="bid-actionlabel" style={oaFunctionLabel === "Exit" ? {} : {opacity: 0.3}} onClick={()=>{setoaFunctionLabel("Exit")}}>Exit </div>
            the Queue
        </div>
        <div className="bid-actionbox-labels">Amount: </div><input className="bid-actionbox-input" style={{marginTop: "0.3vh"}} value={omniAmount} onChange={setOmniAmountHandler}/><div className="bid-actionbox-labels"  style={{textAlign: "center", width: "3vw"}}> CDT</div>
        <div className="btn bid-button" onClick={handleOmniExecution} style={oaFunctionLabel === "Join" ? {opacity: 0.3} : {}}>{oaFunctionLabel} Queue</div>
        <div className="btn sa-claim-button" data-descr={SPclaimables} style={SPclaimables === "No Claims" ? {opacity: 0.1, color: "black", padding: "0px", cursor: "default"} : {color: "black", padding: "0px"}} onClick={handleStabilityClaim}>Claim</div>
        </form>
        <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
    </>
    );
  };

  export default OmniAssetBid;
