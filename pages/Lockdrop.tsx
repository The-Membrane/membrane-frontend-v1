import React from "react";
import { useEffect, useState } from "react";
import ProgressBar from "../components/progress_bar";
import { LaunchClient, LaunchQueryClient } from "../codegen/launch/Launch.client";
import { OracleQueryClient } from "../codegen/oracle/Oracle.client";
import { Lock, Uint128, UserRatio } from "../codegen/launch/Launch.types";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { coin } from "@cosmjs/stargate";
import { denoms, Prices } from ".";
import Popup from "../components/Popup";
import Image from "next/image";

interface Props {
  launch_client: LaunchClient | null;
  queryClient: LaunchQueryClient | null;
  baseClient: SigningCosmWasmClient | null;
  address: string | undefined;
  prices: Prices;
}

const Lockdrop = ({launch_client, queryClient, baseClient, address, prices}: Props) => {

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

  //Popup
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [popupStatus, setPopupStatus] = useState("");
  //Visuals
  const [progress, setProgress] = useState(0);
  const [lockedOSMO, setlockedOSMO] = useState(0);
  const [MBRNreward, setMBRNreward] = useState(0);
  const [rankings, setRankings] = useState<LaunchRankings>({
    user: 0,
    total: 0,
    color: "rgba(79, 202, 187, 0.8)"
  });
  const [deposit1, setdeposit1] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit2, setdeposit2] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit3, setdeposit3] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit4, setdeposit4] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit5, setdeposit5] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit6, setdeposit6] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit7, setdeposit7] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit8, setdeposit8] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: 0,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });

  //Query & update list objects
  const get_updateddepositList = async () => {
    //Query for deposit list
    try {
      await queryClient?.userInfo({
        user: address ?? "",
      }).then(async (res) => {
        
        console.log(res.deposits)
        var total = 0;
        var i = 0;
        for (i; i < res.deposits.length; i++) {
          switch (i){
            case 0: {
              var deposit = parseInt(res.deposits[i]?.deposit) / 1_000_000;
              var duration = res.deposits[i]?.lock_up_duration;
              //Update lock object
              setdeposit1(prevState => {
                  return {
                    ...prevState,
                    deposit: deposit,
                    old_lock_up_duration: duration,
                    label: "EDIT"
                  }
                })
              break;
            }
            case 1: {
              var deposit = parseInt(res.deposits[i]?.deposit) / 1_000_000;
              var duration = res.deposits[i]?.lock_up_duration;
              //Update lock object
              setdeposit2(prevState => {
                return {
                  ...prevState,
                  deposit: deposit,
                  old_lock_up_duration: duration,
                  label: "EDIT"
                }
              })
              break;
            }
            case 2: {
              //Update lock object
              var deposit = parseInt(res.deposits[i]?.deposit) / 1_000_000;
              var duration = res.deposits[i]?.lock_up_duration;
              setdeposit3(prevState => {
                return {
                  ...prevState,
                  deposit: deposit,
                  old_lock_up_duration: duration,
                  label: "EDIT"
                }
              })
              break;
            }
            case 3: {
              //Update lock object
              var deposit = parseInt(res.deposits[i]?.deposit) / 1_000_000;
              var duration = res.deposits[i]?.lock_up_duration;
              setdeposit4(prevState => {
                return {
                  ...prevState,
                  deposit: deposit,
                  old_lock_up_duration: duration,
                  label: "EDIT"
                }
              })
              break;
            }
            case 4: {
              //Update lock object
              var deposit = parseInt(res.deposits[i]?.deposit) / 1_000_000;
              var duration = res.deposits[i]?.lock_up_duration;
              setdeposit5(prevState => {
                return {
                  ...prevState,
                  deposit: deposit,
                  old_lock_up_duration: duration,
                  label: "EDIT"
                }
              })
              break;
            }
            case 5: {
              //Update lock object
              var deposit = parseInt(res.deposits[i]?.deposit) / 1_000_000;
              var duration = res.deposits[i]?.lock_up_duration;
              setdeposit6(prevState => {
                return {
                  ...prevState,
                  deposit: deposit,
                  old_lock_up_duration: duration,
                  label: "EDIT"
                }
              })
              break;
            }
            case 6: {
              //Update lock object
              var deposit = parseInt(res.deposits[i]?.deposit) / 1_000_000;
              var duration = res.deposits[i]?.lock_up_duration;
              setdeposit7(prevState => {
                return {
                  ...prevState,
                  deposit: deposit,
                  old_lock_up_duration: duration,
                  label: "EDIT"
                }
              })
              break;
            }
            case 7: {
              //Update lock object
              var deposit = parseInt(res.deposits[i]?.deposit) / 1_000_000;
              var duration = res.deposits[i]?.lock_up_duration;
              setdeposit8(prevState => {
                return {
                  ...prevState,
                  deposit: deposit,
                  old_lock_up_duration: duration,
                  label: "EDIT"
                }
              })
              break;
            }
          }
          total += parseInt(res.deposits[i].deposit) / 1_000_000;
        }
        //Update locked OSMO
        setlockedOSMO(total)

        //set remaining lock objects to 0/null/undefuned
        for (i; i < 8; i++) {
          switch (i){
            case 0: {
              //Update lock object
              setdeposit1({
                deposit: undefined,                  
                new_lock_up_duration: 0,
                old_lock_up_duration: undefined,
                label: "LOCK"
                })
              break;
            }
            case 1: {
              //Update lock object
              setdeposit2({
                deposit: undefined,     
                new_lock_up_duration: 0,
                old_lock_up_duration: undefined,
                label: "LOCK"
              })
              break;
            }
            case 2: {
              //Update lock object
              setdeposit3({
                deposit: undefined,     
                new_lock_up_duration: 0,
                old_lock_up_duration: undefined,
                label: "LOCK"
              })
              break;
            }
            case 3: {
              //Update lock object
              setdeposit4({
                deposit: undefined,     
                new_lock_up_duration: 0,
                old_lock_up_duration: undefined,
                label: "LOCK"
              })
              break;
            }
            case 4: {
              //Update lock object
              setdeposit5({
                deposit: undefined,     
                new_lock_up_duration: 0,
                old_lock_up_duration: undefined,
                label: "LOCK"
              })
              break;
            }
            case 5: {
              //Update lock object
              setdeposit6({
                deposit: undefined,     
                new_lock_up_duration: 0,
                old_lock_up_duration: undefined,
                label: "LOCK"
              })
              break;
            }
            case 6: {
              //Update lock object
              setdeposit7({
                deposit: undefined,     
                new_lock_up_duration: 0,
                old_lock_up_duration: undefined,
                label: "LOCK"
              })
              break;
            }
            case 7: {
              //Update lock object
              setdeposit8({
                deposit: undefined,     
                new_lock_up_duration: 0,
                old_lock_up_duration: undefined,
                label: "LOCK"
              })
              break;
            }
          }
        }
      })

      //Query for rankings
      try {
        await queryClient?.incentiveDistribution().then((res) => {
          
          var user_ratio = 0;
          //Find user ratio
          res.forEach((element?) => {
            if (element.user == address) {
              user_ratio = parseFloat(element.ratio);     
              console.log("me: "+element.user)
            }
          })

          //Find users ahead of user 
          var users_ahead = 0;
          res.forEach((element?) => {
            if (parseFloat(element.ratio) > user_ratio) {              
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

  useEffect(() => {
    // if (launch_client && address && queryClient) {
      //Query lockdrop progress
      get_lockdropProgress()

      //Query for deposit list
      get_updateddepositList()
    // }
  }, [address, launch_client, queryClient, baseClient]);

  const handledeposit1Click = async () => {
    if (deposit1.label ==="LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit1.new_lock_up_duration * 1,
        }, "auto", undefined, [coin((deposit1.deposit ?? 0) * 1_000_000, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO + +(deposit1.deposit ?? 0))
          //Format popup message
          setPopupMsg("Deposit of "+ deposit1.deposit+" OSMO, whose MBRN rewards will be locked for "+deposit1.new_lock_up_duration+ " days is successful")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })

      } catch (error) {
        console.log(error);
        let e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit1.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit1.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit1.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit1.deposit ?? 0) * 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Format popup message
          setPopupMsg("Lockup changed from "+ deposit1.old_lock_up_duration+" to "+deposit1.new_lock_up_duration+ " days")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        let e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit1.label ==="WTHDRW"){
      //Withdraw deposit
      try {
        console.log("withdrawing")
        await launch_client?.withdraw({
          lockUpDuration: (deposit1.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit1.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO - +(deposit1.deposit ?? 0))
          //Format popup message
          setPopupMsg("Withdrew "+ deposit1.deposit+" OSMO")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        let e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    }
  };

  const handledeposit2Click = async () => {
    if (deposit2.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit2.new_lock_up_duration * 1
        }, "auto", undefined, [coin((deposit2.deposit ?? 0)* 1_000_000, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO + +(deposit2.deposit ?? 0))
          //Format popup message
          setPopupMsg("Deposit of "+ deposit2.deposit+" OSMO, whose MBRN rewards will be locked for "+deposit2.new_lock_up_duration+ " days is successful")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })

      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit2.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit2.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit2.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit2.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Format popup message
          setPopupMsg("Lockup changed from "+ deposit2.old_lock_up_duration+" to "+deposit2.new_lock_up_duration+ " days")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit2.label ==="WTHDRW"){
      //Withdraw deposit
      try {
        await launch_client?.withdraw({
          lockUpDuration: (deposit2.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit2.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO - +(deposit2.deposit ?? 0))
          //Format popup message
          setPopupMsg("Withdrew "+ deposit2.deposit+" OSMO")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    }
  };

  const handledeposit3Click = async () => {
    if (deposit3.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit3.new_lock_up_duration * 1
        }, "auto", undefined, [coin((deposit3.deposit ?? 0)* 1_000_000, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
          //Update lock amount
        setlockedOSMO(+lockedOSMO + +(deposit3.deposit ?? 0))
          //Format popup message
          setPopupMsg("Deposit of "+ deposit3.deposit+" OSMO, whose MBRN rewards will be locked for "+deposit3.new_lock_up_duration+ " days is successful")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })

      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit3.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit3.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit3.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit3.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Format popup message
          setPopupMsg("Lockup changed from "+ deposit3.old_lock_up_duration+" to "+deposit3.new_lock_up_duration+ " days")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit3.label ==="WTHDRW"){
      //Withdraw deposit
      try {
        await launch_client?.withdraw({
          lockUpDuration: (deposit3.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit3.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO - +(deposit3.deposit ?? 0))
          //Format popup message
          setPopupMsg("Withdrew "+ deposit3.deposit+" OSMO")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    }
  };

  const handledeposit4Click = async () => {
    if (deposit4.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit4.new_lock_up_duration * 1
        }, "auto", undefined, [coin((deposit4.deposit ?? 0)* 1_000_000, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
          //Update lock amount
        setlockedOSMO(+lockedOSMO + +(deposit4.deposit ?? 0))
          //Format popup message
          setPopupMsg("Deposit of "+ deposit4.deposit+" OSMO, whose MBRN rewards will be locked for "+deposit4.new_lock_up_duration+ " days is successful")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })

      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit4.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit4.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit4.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit4.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Format popup message
          setPopupMsg("Lockup changed from "+ deposit4.old_lock_up_duration+" to "+deposit4.new_lock_up_duration+ " days")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit4.label ==="WTHDRW"){
      //Withdraw deposit
      try {
        await launch_client?.withdraw({
          lockUpDuration: (deposit4.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit4.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO - +(deposit4.deposit ?? 0))
          //Format popup message
          setPopupMsg("Withdrew "+ deposit4.deposit+" OSMO")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    }
  };

  const handledeposit5Click = async () => {
    if (deposit5.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit5.new_lock_up_duration * 1
        }, "auto", undefined, [coin((deposit5.deposit ?? 0)* 1_000_000, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
          //Update lock amount
        setlockedOSMO(+lockedOSMO + +(deposit5.deposit ?? 0))
          //Format popup message
          setPopupMsg("Deposit of "+ deposit5.deposit+" OSMO, whose MBRN rewards will be locked for "+deposit5.new_lock_up_duration+ " days is successful")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })

      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit5.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit5.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit5.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit5.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Format popup message
          setPopupMsg("Lockup changed from "+ deposit5.old_lock_up_duration+" to "+deposit5.new_lock_up_duration+ " days")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit5.label ==="WTHDRW"){
      //Withdraw deposit
      try {
        await launch_client?.withdraw({
          lockUpDuration: (deposit5.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit5.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO - +(deposit5.deposit ?? 0))
          //Format popup message
          setPopupMsg("Withdrew "+ deposit5.deposit+" OSMO")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    }
  };

  const handledeposit6Click = async () => {
    if (deposit6.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit6.new_lock_up_duration * 1
        }, "auto", undefined, [coin((deposit6.deposit ?? 0)* 1_000_000, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
          //Update lock amount
        setlockedOSMO(+lockedOSMO + +(deposit6.deposit ?? 0))
          //Format popup message
          setPopupMsg("Deposit of "+ deposit6.deposit+" OSMO, whose MBRN rewards will be locked for "+deposit6.new_lock_up_duration+ " days is successful")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })

      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit6.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit6.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit6.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit6.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Format popup message
          setPopupMsg("Lockup changed from "+ deposit6.old_lock_up_duration+" to "+deposit6.new_lock_up_duration+ " days")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit6.label ==="WTHDRW"){
      //Withdraw deposit
      try {
        await launch_client?.withdraw({
          lockUpDuration: (deposit6.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit6.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO - +(deposit6.deposit ?? 0))
          //Format popup message
          setPopupMsg("Withdrew "+ deposit6.deposit+" OSMO")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    }
  };

  const handledeposit7Click = async () => {
    if (deposit7.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit7.new_lock_up_duration * 1
        }, "auto", undefined, [coin((deposit7.deposit ?? 0)* 1_000_000, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
          //Update lock amount
        setlockedOSMO(+lockedOSMO + +(deposit7.deposit ?? 0))
          //Format popup message
          setPopupMsg("Deposit of "+ deposit7.deposit+" OSMO, whose MBRN rewards will be locked for "+deposit7.new_lock_up_duration+ " days is successful")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })

      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit7.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit7.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit7.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit7.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Format popup message
          setPopupMsg("Lockup changed from "+ deposit7.old_lock_up_duration+" to "+deposit7.new_lock_up_duration+ " days")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit7.label ==="WTHDRW"){
      //Withdraw deposit
      try {
        await launch_client?.withdraw({
          lockUpDuration: (deposit7.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit7.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO - +(deposit7.deposit ?? 0))
          //Format popup message
          setPopupMsg("Withdrew "+ deposit7.deposit+" OSMO")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    }
  };

  const handledeposit8Click = async () => {
    if (deposit8.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit8.new_lock_up_duration * 1
        }, "auto", undefined, [coin((deposit8.deposit ?? 0)* 1_000_000, denoms.osmo)])
        .then((res) => {
          //Update deposits
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO + +(deposit8.deposit ?? 0))
          //Format popup message
          setPopupMsg("Deposit of "+ deposit8.deposit+" OSMO, whose MBRN rewards will be locked for "+deposit8.new_lock_up_duration+ " days is successful")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })

      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit8.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit8.new_lock_up_duration * 1,
          oldLockUpDuration: (deposit8.old_lock_up_duration ?? 0) * 1,
          uosmoAmount: ((deposit8.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Format popup message
          setPopupMsg("Lockup changed from "+ deposit8.old_lock_up_duration+" to "+deposit8.new_lock_up_duration+ " days")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    } else if (deposit8.label ==="WTHDRW"){
      //Withdraw deposit
      try {
        await launch_client?.withdraw({
          lockUpDuration: (deposit8.old_lock_up_duration ?? 0) * 1,
          withdrawalAmount: ((deposit8.deposit ?? 0)* 1_000_000).toString(),
        }).then((res) => {
          get_updateddepositList()
          //Update lock amount
          setlockedOSMO(+lockedOSMO - +(deposit8.deposit ?? 0))
          //Format popup message
          setPopupMsg("Withdrew "+ deposit8.deposit+" OSMO")
          setPopupStatus("Success")
          setPopupTrigger(true)
        })
      } catch (error) {
        console.log(error);
        const e = error as { message: string }
        //Format popup message
        setPopupMsg(e.message)
        setPopupStatus("Error")
        setPopupTrigger(true)
      }
    }
  };
  
  const handlesetdeposit1amount = (event: any) => {
    event.preventDefault();
    setdeposit1(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit1days = (event: any) => {
    event.preventDefault();
    setdeposit1(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit2amount = (event: any) => {
    event.preventDefault();
    setdeposit2(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit2days = (event: any) => {
    event.preventDefault();
    setdeposit2(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit3amount = (event: any) => {
    event.preventDefault();
    setdeposit3(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit3days = (event: any) => {
    event.preventDefault();
    setdeposit3(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit4amount = (event: any) => {
    event.preventDefault();
    setdeposit4(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit4days = (event: any) => {
    event.preventDefault();
    setdeposit4(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit5amount = (event: any) => {
    event.preventDefault();
    setdeposit5(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit5days = (event: any) => {
    event.preventDefault();
    setdeposit5(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit6amount = (event: any) => {
    event.preventDefault();
    setdeposit6(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit6days = (event: any) => {
    event.preventDefault();
    setdeposit6(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit7amount = (event: any) => {
    event.preventDefault();
    setdeposit7(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit7days = (event: any) => {
    event.preventDefault();
    setdeposit7(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit8amount = (event: any) => {
    event.preventDefault();
    setdeposit8(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit8days = (event: any) => {
    event.preventDefault();
    setdeposit8(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };

  const handleamountClick1 = () => {
    if (deposit1.label === "EDIT"){
      setdeposit1(prevState => {
        return { ...prevState, label: "WTHDRW" }
      })
    }
  }
  const handledaysClick1 = () => {
    if (deposit1.label === "WTHDRW"){
      setdeposit1(prevState => {
        return { ...prevState, label: "EDIT" }
      })
    }
  }
  const handleamountClick2 = () => {
    if (deposit2.label === "EDIT"){
      setdeposit2(prevState => {
        return { ...prevState, label: "WTHDRW" }
      })
    }
  }
  const handledaysClick2 = () => {
    if (deposit2.label === "WTHDRW"){
      setdeposit2(prevState => {
        return { ...prevState, label: "EDIT" }
      })
    }
  }
  const handleamountClick3 = () => {
    if (deposit3.label === "EDIT"){
      setdeposit3(prevState => {
        return { ...prevState, label: "WTHDRW" }
      })
    }
  }
  const handledaysClick3 = () => {
    if (deposit3.label === "WTHDRW"){
      setdeposit3(prevState => {
        return { ...prevState, label: "EDIT" }
      })
    }
  }
  const handleamountClick4 = () => {
    if (deposit4.label === "EDIT"){
      setdeposit4(prevState => {
        return { ...prevState, label: "WTHDRW" }
      })
    }
  }
  const handledaysClick4 = () => {
    if (deposit4.label === "WTHDRW"){
      setdeposit4(prevState => {
        return { ...prevState, label: "EDIT" }
      })
    }
  }
  const handleamountClick5 = () => {
    if (deposit5.label === "EDIT"){
      setdeposit5(prevState => {
        return { ...prevState, label: "WTHDRW" }
      })
    }
  }
  const handledaysClick5 = () => {
    if (deposit5.label === "WTHDRW"){
      setdeposit5(prevState => {
        return { ...prevState, label: "EDIT" }
      })
    }
  }
  const handleamountClick6 = () => {
    if (deposit6.label === "EDIT"){
      setdeposit6(prevState => {
        return { ...prevState, label: "WTHDRW" }
      })
    }
  }
  const handledaysClick6 = () => {
    if (deposit6.label === "WTHDRW"){
      setdeposit6(prevState => {
        return { ...prevState, label: "EDIT" }
      })
    }
  }
  const handleamountClick7 = () => {
    if (deposit7.label === "EDIT"){
      setdeposit7(prevState => {
        return { ...prevState, label: "WTHDRW" }
      })
    }
  }
  const handledaysClick7 = () => {
    if (deposit7.label === "WTHDRW"){
      setdeposit7(prevState => {
        return { ...prevState, label: "EDIT" }
      })
    }
  }
  const handleamountClick8 = () => {
    if (deposit8.label === "EDIT"){
      setdeposit8(prevState => {
        return { ...prevState, label: "WTHDRW" }
      })
    }
  }
  const handledaysClick8 = () => {
    if (deposit8.label === "WTHDRW"){
      setdeposit8(prevState => {
        return { ...prevState, label: "EDIT" }
      })
    }
  }
  const handleclaimClick = async () => {
    try {
      await launch_client?.claim().then((res) => {        
        //Format popup message
        setPopupMsg("Claim of a portion of your total "+MBRNreward+" MBRN share was successful")
        setPopupStatus("Success")
        setPopupTrigger(true)
      })
    } catch (error) {
      console.log(error);
      const e = error as { message: string }
      //Format popup message
      setPopupMsg(e.message)
      setPopupStatus("Error")
      setPopupTrigger(true)
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
              <ProgressBar bgcolor="#50C9BD" progress={progress}  height={30} />
              <div className='y-axis'/>
              <div className="deposit">DEPOSIT</div>
              <div className="withdraw">WITHDRAW</div>
            </div>
            
            <div className="mbrn-reward-circle">              
              <div className="mbrn-reward-total" onClick={() => {set_MBRNreward()}}>{MBRNreward} MBRN</div>
            </div>
            <div className="osmo-deposit-circle" />
            <div className="osmo-deposit-amount">{lockedOSMO} OSMO</div>
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
            <div className="price-in-axlusdc">: {parseFloat(((MBRNreward / lockedOSMO) * prices?.osmo).toPrecision(3))}</div>
            <div className="infomsg">
              <p className="there-is-10m-mbrn-up-for-grabs">
                There is 10M MBRN up for grabs in this 7 day event. Deposit * Lock Time = Shares  (Lock MAX: 365 days).
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
              {/*Deposit 1*/}
              <input className="div2" name="deposit1amount" defaultValue={deposit1.deposit} type="number" onChange={handlesetdeposit1amount} onClick={handleamountClick1}/>
              <input className="days" name="deposit1days" defaultValue={deposit1.old_lock_up_duration} type="number" onChange={handlesetdeposit1days} onClick={handledaysClick1}/>
              <button className="btn button" type="button" onClick={handledeposit1Click}>
                <div className="button-label">
                {deposit1.label}
                </div>
              </button>
              {/*Deposit 2*/}
              <input className="div3" name="deposit2amount" defaultValue={deposit2.deposit} type="number" onChange={handlesetdeposit2amount} onClick={handleamountClick2}/>
              <input className="days1" name="deposit2days" defaultValue={deposit2.old_lock_up_duration} type="number" onChange={handlesetdeposit2days} onClick={handledaysClick2}/>
              <button className="btn button1" type="button" onClick={handledeposit2Click}>
                <div className="button-label">
                {deposit2.label}
                </div>
              </button>
              {/*Deposit 3*/}
              <input className="div4" name="deposit3amount" defaultValue={deposit3.deposit} type="number"onChange={handlesetdeposit3amount} onClick={handleamountClick3}/>
              <input className="days2" name="deposit3days" defaultValue={deposit3.old_lock_up_duration} type="number" onChange={handlesetdeposit3days} onClick={handledaysClick3}/>
              <button className="btn button2" type="button" onClick={handledeposit3Click}>
                <div className="button-label">
                {deposit3.label}
                </div>
              </button>
              {/*Deposit 4*/}
              <input className="div5" name="deposit4amount" defaultValue={deposit4.deposit} type="number" onChange={handlesetdeposit4amount} onClick={handleamountClick4}/>
              <input className="days3" name="deposit4days" defaultValue={deposit4.old_lock_up_duration} type="number" onChange={handlesetdeposit4days} onClick={handledaysClick4}/>
              <button className="btn button3" type="button" onClick={handledeposit4Click}>
                <div className="button-label">
                {deposit4.label}
                </div>
              </button>
              {/*Deposit 5*/}
              <input className="div6" name="deposit5amount" defaultValue={deposit5.deposit} type="number" onChange={handlesetdeposit5amount} onClick={handleamountClick5}/>
              <input className="days4" name="deposit5days" defaultValue={deposit5.old_lock_up_duration} type="number" onChange={handlesetdeposit5days} onClick={handledaysClick5}/>
              <button className="btn button4" type="button" onClick={handledeposit5Click}>
                <div className="button-label">
                {deposit5.label}
                </div>
              </button>
              {/*Deposit 6*/}
              <input className="div7" name="deposit6amount" defaultValue={deposit6.deposit} type="number" onChange={handlesetdeposit6amount} onClick={handleamountClick6}/>
              <input className="days5" name="deposit6days" defaultValue={deposit6.old_lock_up_duration} type="number" onChange={handlesetdeposit6days} onClick={handledaysClick6}/>
              <button className="btn button5" type="button" onClick={handledeposit6Click}>
                <div className="button-label">
                {deposit6.label}
                </div>
              </button>
              {/*Deposit 7*/}
              <input className="div8" name="deposit7amount" defaultValue={deposit7.deposit} type="number" onChange={handlesetdeposit7amount} onClick={handleamountClick7}/>
              <input className="days6" name="deposit7days" defaultValue={deposit7.old_lock_up_duration} type="number" onChange={handlesetdeposit7days} onClick={handledaysClick7}/>
              <button className="btn button6" type="button" onClick={handledeposit7Click}>
                <div className="button-label">
                {deposit7.label}
                </div>
              </button>
              {/*Deposit 8*/}
              <input className="div9" name="deposit8amount" defaultValue={deposit8.deposit} type="number" onChange={handlesetdeposit8amount} onClick={handleamountClick8}/>
              <input className="days7" name="deposit8days" defaultValue={deposit8.old_lock_up_duration} type="number" onChange={handlesetdeposit8days} onClick={handledaysClick8}/>
              <button className="btn button7" type="button" onClick={handledeposit8Click}>
                <div className="button-label">
                {deposit8.label}
                </div>
              </button>
            </form>
          </div>
          <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
        </div>
  );
};

export default Lockdrop;
