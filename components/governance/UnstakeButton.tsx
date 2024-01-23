import React, { useState } from 'react';
import { UserStake } from '../../pages/Governance';
import ProgressBar from '../progress_bar';
import Image from 'next/image';
import { unstakingPeriod } from "../../pages";
import usePopup from './HelperFunctions';
import { StakingClient } from '../../codegen/staking/Staking.client';
import Popup from '../Popup';

interface UnstakeButtonProps {
  userStake: UserStake;
  setUserStake: (value: React.SetStateAction<UserStake>) => void;
  address: string | undefined;
  connect: () => void;
  stakingClient: StakingClient | null;

}

const UnstakeButton: React.FC<UnstakeButtonProps> = (props: UnstakeButtonProps) => {
  const { userStake, setUserStake, address, connect, stakingClient } = props;
  const { trigger, setTrigger, msg, status, showPopup } = usePopup();
  const [unstakeAmount, setunstakeAmount] = useState();

  const unstakingAmount = parseFloat((userStake.unstaking.amount / 1_000_000).toFixed(2));
  const unstakingTotal = parseFloat((userStake.unstaking_total / 1_000_000).toFixed(2));
  const progress =
    userStake.unstaking.amount !== 0
    ? parseFloat((((unstakingPeriod - userStake.unstaking.timeLeft) / unstakingPeriod) * 100).toFixed(2))
    : 0;


  const handlesetunstakeAmount = (event: any) => {
    event.preventDefault();
    setunstakeAmount(event.target.value);
  }

  //Helper function to update user stake
  const updateUserStake = (amountChange: number) => {
    if (userStake.unstaking.amount === 0) {
      setUserStake((prevState) => ({
        staked: +prevState.staked - amountChange,
        unstaking_total: +prevState.unstaking_total + amountChange,
        unstaking: {
          amount: +prevState.unstaking.amount + amountChange,
          timeLeft: unstakingPeriod,
        },
      }));
    } else {
      setUserStake((prevState) => ({
        ...prevState,
        unstaking_total: +prevState.unstaking_total + amountChange,
        staked: +prevState.staked - amountChange,
      }));
    }
  };

  const handleunstakeClick = async () => {
    // Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      return;
    }
  
    try {
      const amountToUnstake = (unstakeAmount ?? 0) * 1_000_000;
  
      await stakingClient?.unstake({
        mbrnAmount: amountToUnstake.toString(),
      }, "auto", undefined).then((res) => {
        console.log(res);
        showPopup("Success", <div>Unstaked</div>);
        updateUserStake(amountToUnstake);
      });
    } catch (error) {
      console.log(error);
      const e = error as { message: string };
  
      // This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4") {
        showPopup("Success", <div>Unstaked</div>);
        updateUserStake((unstakeAmount ?? 0) * 1_000_000);
      } else {
        showPopup("Error", <div>{e.message}</div>);
      }
    }
  };


  return (
    <div className="unstake-button-frame">
    <form style={{top: "5%", position: "relative"}}>
      <input className="unstake-input" name="amount" value={unstakeAmount} type="number" onChange={handlesetunstakeAmount}/>
      <button className="btn unstake-button" type="button" onClick={handleunstakeClick}>
        <div className="unstake">Unstake:</div>
      </button>
    </form>
    <div className="unstaked-mbrn-frame">
      <div className="unstaking-mbrn">{unstakingAmount}</div>
      <div className="unstaking-mbrn-total">{'/' + unstakingTotal}</div>
      <div className="unstaking-progress-bar" >
        <ProgressBar bgcolor="#50C9BD" noMargin={true} progress={progress} height={20} />     
      </div>
    </div>                   
    <Image className="mbrn-unstake-logo" width={43} height={43} alt="" src="/images/Logo.svg" />
    <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
  </div>
  );
};

export default UnstakeButton;
