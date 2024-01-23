import React from "react";
import { useEffect, useState } from "react";
import ProgressBar from "../components/progress_bar";
import { LaunchClient, LaunchQueryClient } from "../codegen/launch/Launch.client";
import { OracleQueryClient } from "../codegen/oracle/Oracle.client";
import { Lock, Uint128, UserRatio } from "../codegen/launch/Launch.types";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { coin } from "@cosmjs/stargate";
import { Prices } from ".";
import { denoms } from "../config";
import Popup from "../components/Popup";
import Image from "next/image";
import { chainName, testnetAddrs } from "../config";
import { useChain } from "@cosmos-kit/react";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

const usePopup = () => {
    const [trigger, setTrigger] = useState(false);
    const [msg, setMsg] = useState<ReactJSXElement>();
    const [status, setStatus] = useState("");
  
    const showPopup = (status: any, message: any) => {
      setStatus(status);
      setMsg(message);
      setTrigger(true);
    };
  
    return { trigger, setTrigger, msg, setMsg, status, setStatus, showPopup };
};

interface Props {
  launch_client: LaunchClient | null;
  queryClient: LaunchQueryClient | null;
  baseClient: SigningCosmWasmClient | null;
  address: string | undefined;
  prices: Prices;
}
interface LockDisplay {
  deposit: number | undefined;
  new_lock_up_duration: number;
  old_lock_up_duration: number | undefined;
  label: string;
}
interface LaunchRankings {
  user: number;
  total: number;
  color: string;
}

const Lockdrop = ({launch_client, queryClient, baseClient, address, prices}: Props) => {
  const { connect } = useChain(chainName);
  const { trigger, setTrigger, msg, status, setMsg, showPopup } = usePopup();
  const depositIndices = Array.from({ length: 8 }, (_, index) => index + 1);

  //Visuals
  const [progress, setProgress] = useState(0);
  const [totalOSMO, settotalOSMO] = useState(0);
  const [walletosmoAmount, setwalletosmoAmount] = useState(0);
  const [lockedOSMO, setlockedOSMO] = useState(0);
  const [MBRNreward, setMBRNreward] = useState(0);
  const [rankings, setRankings] = useState<LaunchRankings>({
    user: 0,
    total: 0,
    color: "rgba(79, 202, 187, 0.8)"
  });

  type StateFunction = [number, LockDisplay, React.Dispatch<React.SetStateAction<LockDisplay>>];

  const depositArray: StateFunction[] = [] as StateFunction[];
  const [deposit, setDeposit] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  depositArray.push([0, deposit, setDeposit]);
  const [deposit2, setDeposit2] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  depositArray.push([1, deposit2, setDeposit2]);
  const [deposit3, setDeposit3] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  depositArray.push([2, deposit3, setDeposit3]);
  const [deposit4, setDeposit4] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  depositArray.push([3, deposit4, setDeposit4]);
  const [deposit5, setDeposit5] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  depositArray.push([4, deposit5, setDeposit5]);
  const [deposit6, setDeposit6] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  depositArray.push([5, deposit6, setDeposit6]);
  const [deposit7, setDeposit7] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  depositArray.push([6, deposit7, setDeposit7]);
  const [deposit8, setDeposit8] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  depositArray.push([7, deposit8, setDeposit8]);
  
  

  //Query & update list objects
  const get_updateddepositList = async () => {
    //Query for deposit list
    try {
      await queryClient?.userInfo({
        user: address ?? "",
      }).then(async (res) => {
        
        var total = 0;
        var count = 0;
        for (var i = 0; i < res.deposits.length; i++) {
          total += parseInt(res.deposits[i].deposit) / 1_000_000;
          
          for (let [index, deposit, setDeposit] of depositArray) {
            let depositValue = parseInt(res.deposits[index]?.deposit) / 1_000_000;
            let duration = res.deposits[index]?.lock_up_duration;
        
            setDeposit((prevState) => ({
              ...prevState,
              deposit: depositValue,
              old_lock_up_duration: duration,
              label: "EDIT",
            }));
          }
          count += 1;
        }
        //Update locked OSMO
        setlockedOSMO(total)

        //set remaining lock objects to 0/null/undefuned
        for (let i = res.deposits.length; i < 8; i++) {
          depositArray[i][2]((prevState) => ({
            deposit: undefined,
            new_lock_up_duration: 0,
            old_lock_up_duration: undefined,
            label: "LOCK",
          }));
        }
      })

      //Query for rankings
      try {
        await queryClient?.incentiveDistribution().then((res) => {
          
          var user_ratio = 0;
          //Find user ratio
          res.forEach((element?) => {
            if (element!.user == address) {
              user_ratio = parseFloat(element!.ratio);     
              console.log("me: "+element!.user)
            }
          })

          //Find users ahead of user 
          var users_ahead = 0;
          res.forEach((element?) => {
            if (parseFloat(element!.ratio) > user_ratio) {              
              users_ahead += 1;
            }
          })
          //Find color
          var color = "";
          var user_percent_class = users_ahead / res.length;
          if (user_percent_class <= 0.10){
              color = "gold";
          } else if (user_percent_class <= 0.33){
              color = "#c0c0c0";
          } else {
            color = "rgba(79, 202, 187, 0.8)";
          } 
          console.log("users_ahead: "+users_ahead)
          //Set rankings
          setRankings({
            user: users_ahead+1,
            total: res.length,
            color: color,
          })
        })
      } catch (error) {
        console.log(error);
      }
           
      //Query to set MBRN reward total
      set_MBRNreward()

    } catch (error) {
      console.log(error);
    }
  }

  //Query lockdrop & set progress
  const get_lockdropProgress = async () => {
    //Query lockdrop progress
    try {
      await queryClient?.lockdrop().then((res) => {
        baseClient?.getBlock().then( (block: any) => {
          var current_time = Date.parse(block?.header.time) / 1000;
          console.log("current_time: "+current_time, "start_time: "+res?.start_time, "end_time: "+res?.withdrawal_end)
          //Calc & set progress
          setProgress(Math.min(100, parseFloat(((current_time - res?.start_time) / (res.withdrawal_end - res?.start_time)).toPrecision(3)) * 100));
        })} );  
    } catch (error) {
      console.log(error);
    }
  }

  const set_MBRNreward = async () => {
    //Query for MBRN reward total
    try { 
      await queryClient?.userIncentives({user: address ?? ""}).then((res: Uint128) => {
        setMBRNreward(parseInt(res)/1_000_000)
      })
    } catch (error) {
      console.log(error);
    }
  }  

  const set_totalOSMO = async () => {
    try {
      await queryClient?.client.getBalance((testnetAddrs.launch) as string, denoms.osmo).then((res) => {
        settotalOSMO(parseFloat((parseInt(res.amount) / 1_000_000).toFixed(2)));
      });
    } catch (error) {
      console.log(error);
    }

    try {
      await queryClient?.client.getBalance((address) as string, denoms.osmo).then((res) => {
        setwalletosmoAmount(parseFloat((parseInt(res.amount) / 1_000_000).toFixed(2)));
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (progress === 0) {
      //Query lockdrop progress
      get_lockdropProgress()
    }
    if (depositArray[0][1].deposit === undefined) {
      //Query for deposit list
      get_updateddepositList()
    }
    if (totalOSMO === 0) {
      //Query OSMO contract & wallet balance
      set_totalOSMO()
    }
  }, [address, launch_client, queryClient, baseClient]);

  const handleDepositClick = async (index: number) => {
    const deposit = depositArray[index][1];
  
    if (deposit.label === "LOCK") {
      // Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit.new_lock_up_duration * 1,
        }, "auto", undefined, [coin((deposit.deposit ?? 0) * 1_000_000, denoms.osmo)])
        .then((res) => {
          get_updateddepositList();
          // Update lock amount
          setlockedOSMO((prevLockedOSMO) => prevLockedOSMO + +(deposit.deposit ?? 0));
          showPopup("Success", <div>Deposit of {deposit.deposit} OSMO, whose MBRN rewards will be locked for {deposit.new_lock_up_duration} days is successful</div>);
        });
  
      } catch (error) {
        console.log(error);
        let e = error as { message: string };
        showPopup("Error", <div>{e.message}</div>);
      }
    } else if (deposit.label === "EDIT") {
      // Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit.deposit ?? 0) * 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList();
          showPopup("Success", <div>Lockup changed from {deposit.old_lock_up_duration} to {deposit.new_lock_up_duration} days</div>);
        });
      } catch (error) {
        console.log(error);
        let e = error as { message: string };
        showPopup("Error", <div>{e.message}</div>);
      }
  
    } else if (deposit.label === "WTHDRW") {
      // Withdraw deposit
      try {
        console.log("withdrawing");
        await launch_client?.withdraw({
          lockUpDuration: (deposit.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit.deposit ?? 0) * 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList();
          // Update lock amount
          setlockedOSMO((prevLockedOSMO) => prevLockedOSMO - +(deposit.deposit ?? 0));
          showPopup("Success", <div>Withdrew {deposit.deposit} OSMO</div>);
        });
      } catch (error) {
        console.log(error);
        let e = error as { message: string };
        showPopup("Error", <div>{e.message}</div>);
      }
    }
  };
  const handleSetDepositAmount = (index: number, event: any) => {
    event.preventDefault();
    depositArray[index][2]((prevState) => ({
      ...prevState,
      deposit: event.target.value,
    }));
  };
  const handleSetDepositDays = (index: number, event: any) => {
    event.preventDefault();
    depositArray[index][2]((prevState) => ({
      ...prevState,
      new_lock_up_duration: event.target.value,
    }));
  };

  const handleAmountClick = (index: number) => {
    const deposit = depositArray[index][1];
  
    if (deposit.label === "EDIT") {
      depositArray[index][2]((prevState) => ({
        ...prevState,
        label: "WTHDRW",
      }));
    }
  };
  
  const handleDaysClick = (index: number) => {
    const deposit = depositArray[index][1];
  
    if (deposit.label === "WTHDRW") {
      depositArray[index][2]((prevState) => ({
        ...prevState,
        label: "EDIT",
      }));
    }
  };
 
  const handleclaimClick = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      return;
    }
    try {
      await launch_client?.claim().then((res) => {        
        showPopup("Success", <div>Claim of a portion of your total {MBRNreward} MBRN share was successful</div>);
      })
    } catch (error) {
      console.log(error);
      const e = error as { message: string }
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        showPopup("Success", <div>Claim of a portion of your total {MBRNreward} MBRN share was successful</div>);
      } else {
        showPopup("Error", <div>{e.message}</div>);
      }
    }
  }

  return (  
    <div className="lockdrop">
    <h1 className="pagetitle-lockdrop">Lockdrop</h1>
    <Image className="titleicon-lockdrop" width={55} height={55} alt="" src="/images/lockdrop.svg" />
        <div className="lockdrop-page">
            <div className="lockdrop-frame"/>
            <div className="infobox" />
            <div className="durationbar">
              <ProgressBar bgcolor="#50C9BD" progress={progress} noMargin={false} height={30} />
              <div className='y-axis'/>
              <div className="deposit">DEPOSIT</div>
              <div className="withdraw">WITHDRAW</div>
            </div>
            
            <div className="mbrn-reward-circle">              
              <div className="mbrn-reward-total" onClick={() => {set_MBRNreward()}}>{MBRNreward} MBRN</div>
            </div>
            <div className="osmo-deposit-circle" />
            <div className="total-osmo-deposit-amount">Total OSMO: {totalOSMO}</div>
            <div className="osmo-deposit-amount" style={(lockedOSMO < 1) ? {opacity:0.3} : undefined}>{lockedOSMO} OSMO</div>
            {rankings !== undefined ?(
              <div className="mbrn-rank" style={{color: rankings.color}}>Ranked #{rankings.user} out of {rankings.total}</div>
              ) : null}
            <button className="mbrn-claim-button" disabled={(progress < 100)} style={(progress < 100) ? {opacity:0.3} : undefined} type="button" onClick={handleclaimClick}>
              <div className="mbrn-claim-button-label">CLAIM</div>
            </button>
            <div className="rates-box-title">
              Your&nbsp;&nbsp;&nbsp;&nbsp;
                <Image className="mbrn-rate-logo" width={22} height={22} alt="membrane-mbrn-logo" src="/images/Logo.svg" />
              &nbsp;&nbsp;&nbsp;&nbsp;Rates
            </div>
            <div className="rates-box"/>
            <Image className="osmo-rate-logo" width={27} height={27} alt="osmosis-osmo-logo" src="/images/osmo.svg" />
            <Image className="axlusdc-rate-logo" width={27} height={27} alt="axelar-usdc-logo" src="/images/usdc.svg" />
            <div className="price-in-osmo">: {parseFloat((MBRNreward / lockedOSMO).toPrecision(3))}</div>
            <div className="price-in-axlusdc">: {parseFloat(((MBRNreward / lockedOSMO) / prices?.osmo).toPrecision(3))}</div>
            <div className="infomsg">
              <p className="there-is-10m-mbrn-up-for-grabs">
                There is 10M MBRN up for grabs in this 7 day event. Deposit * Lock Time = Shares  (Lock MAX: 365 DAYS).
              </p>
              <p>Locks boost your “shares” and the full 10M is split & STAKED (4 day unstaking) in accordance to the ratio of said shares.</p>
              <p>MBRN claims unlock daily.</p>
            </div>
            <div className="allocationmsg">
              <span className="allocationmsg-txt">
              <p>Pre-launch contributors: 9%, vested for 2y cliff/1y linear --- Community: 91%</p>
              <p>Stakers have control over vested stake.</p>
              </span>
            </div>
            <a className="info" target="_blank" rel="noopener noreferrer" href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/lockdrop-launch">INFO</a>
            <a className="allocations" target="_blank" rel="noopener noreferrer" href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/mbrn-tokenomics">ALLOCATIONS</a>
          </div>
          <div className="deposits-list">
            {lockedOSMO == 0 ? <div className="lock-tutorial">Below fields are input boxes for amount and duration</div> : null}
            <div className="yourdepositstext">
              OSMO Deposits &nbsp;/&nbsp; MBRN Reward Locks
            </div>
            <div className="launch-lock-amount"> AMOUNT </div>
            <div className="lock-duration"> DURATION </div>
            <div className="deposit-list-x-axis" />
            <div className="deposit-list-x-axis1" />
            <div className="btn button2" />
            <div className="deposit-list-x-axis2" />
            <div className="btn button3" />
            <div className="deposit-list-x-axis3" />
            <div className="btn button4" />
            <div className="deposit-list-x-axis4" />
            <div className="btn button5" />
            <div className="deposit-list-x-axis5" />
            <div className="btn button6" />
            <div className="deposit-list-x-axis6" />
            <div className="btn button7" />
            <form>
    {depositIndices.map((index) => (
      <div key={index}>
        {index <= depositArray.length && (
          <>
            <input
              className={`div${index + 1}`}
              name={`deposit${index + 1}amount`}
              defaultValue={depositArray[index]?.[1]?.deposit || ""}
              type="number"
              onChange={(event) => handleSetDepositAmount(index, event)}
              onClick={() => handleAmountClick(index)}
            />
            <input
              className={`days${index-1 !== 0 ? index-1 : ''}`}
              name={`deposit${index}days`}
              defaultValue={depositArray[index]?.[1]?.old_lock_up_duration || ""}
              type="number"
              onChange={(event) => handleSetDepositDays(index, event)}
              onClick={() => handleDaysClick(index)}
            />
            <button
              className={`btn button${index-1 !== 0 ? index-1 : ''}`}
              type="button"
              onClick={() => handleDepositClick(index)}
            >
              <div className="button-label">
                {depositArray[index-1]?.[1]?.label || ""}
              </div>
            </button>
          </>
        )}
      </div>
    ))}
          </form>
          <div className="osmo-wallet-amount">OSMO in wallet: {walletosmoAmount}</div>
          </div>
          <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
        </div>
  );
};

export default Lockdrop;
