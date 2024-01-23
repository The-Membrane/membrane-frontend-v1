import React, { useState } from "react";
import { EmissionsSchedule, UserStake } from "../../pages/Governance";
import usePopup from "./HelperFunctions";
import { coins } from "@cosmjs/stargate";
import { denoms } from "../../config";
import { StakingClient } from '../../codegen/staking/Staking.client';
import Popup from "../Popup";

interface StakeButtonProps {
  userStake: UserStake;
  emissionsSchedule: EmissionsSchedule;
  walletMBRN: number;
  address: string | undefined;
  connect: () => void;
  stakingClient: StakingClient | null;
}

const StakeButton: React.FC<StakeButtonProps> = ({
  userStake,
  emissionsSchedule,
  walletMBRN,
  address,
  connect,
  stakingClient,
}) => {
  const { trigger, setTrigger, msg, status, showPopup } = usePopup();
  const [stakeAmount, setstakeAmount] = useState();

  const handlesetstakeAmount = (event: any) => {
    event.preventDefault();
    setstakeAmount(event.target.value);
  }

  const handlestakeClick = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      return;
    }
    try {
      await stakingClient
        ?.stake(
          {},
          "auto",
          undefined,
          coins((stakeAmount ?? 0) * 1_000_000, denoms.mbrn)
        )
        .then((res) => {
          console.log(res);
          showPopup("Success", <div>Staked</div>);
          //Update user stake
          //@ts-ignore
          setUserStake((prevState) => {
            return {
              ...prevState,
              staked: +prevState.staked + +((stakeAmount ?? 0) * 1_000_000),
            };
          });
        });
    } catch (error) {
      console.log(error);
      const e = error as { message: string };
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4") {
        showPopup("Success", <div>Staked</div>);
        //Update user stake
        //@ts-ignore
        setUserStake((prevState) => {
          return {
            ...prevState,
            staked: +prevState.staked + +((stakeAmount ?? 0) * 1_000_000),
          };
        });
      } else {
        showPopup("Error", <div>{e.message}</div>);
      }
    }
  };


  return (
    <div className="stake-button-frame">
      <div className="staked-mbrn-frame">
        <div className="staked-mbrn1">
          Staked: {parseFloat((userStake.staked / 1_000_000).toFixed(2))}
        </div>
        <div className="emissions-schedule">
          {emissionsSchedule.rate}%/{emissionsSchedule.monthsLeft.toFixed(2)}{" "}
          months
        </div>
        <div className="staked-mbrn2">in Wallet: {walletMBRN.toFixed(2)}</div>
      </div>
      <form style={{ position: "relative", bottom: "10%" }}>
        <button
          className="btn stake-button1"
          type="button"
          onClick={handlestakeClick}
        >
          <div className="stake" data-tvl="Unstaking is currently broken">
            Stake
          </div>
        </button>
        <input
          className="stake-input"
          name="amount"
          value={stakeAmount}
          type="number"
          onChange={handlesetstakeAmount}
        />
      </form> 
      <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
    </div>
  );
};

export default StakeButton;
