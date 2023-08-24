import { useEffect, useState } from "react";
import ProgressBar from "./progress_bar";
import { LaunchClient, LaunchQueryClient } from "../codegen/launch/Launch.client";
import { OracleQueryClient } from "../codegen/oracle/Oracle.client";
import { Lock, Uint128 } from "../codegen/launch/Launch.types";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { coin } from "@cosmjs/stargate";
import { denoms } from ".";

const Lockdrop = ({client, qClient, addr, prices}) => {

  //Get Clients
  const launch_client = client as LaunchClient;  
  const queryClient = qClient as LaunchQueryClient;
  const address = addr as string | undefined;

  interface LockDisplay {
    deposit: number | undefined;
    new_lock_up_duration: number | undefined;
    old_lock_up_duration: number | undefined;
    label: string;
  }

  //Visuals
  const [progress, setProgress] = useState(0);
  const [lockedOSMO, setlockedOSMO] = useState(0);
  const [MBRNreward, setMBRNreward] = useState(0);
  const [deposit1, setdeposit1] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: undefined,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit2, setdeposit2] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: undefined,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit3, setdeposit3] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: undefined,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit4, setdeposit4] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: undefined,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit5, setdeposit5] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: undefined,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit6, setdeposit6] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: undefined,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit7, setdeposit7] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: undefined,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  const [deposit8, setdeposit8] = useState<LockDisplay>({
    deposit: undefined,
    new_lock_up_duration: undefined,
    old_lock_up_duration: undefined,
    label: "LOCK",
  });
  //Lock
  const [amount, setAmount] = useState(0);

  const handlelockClick = () => {
    var success = true;
    //Lock OSMO
    try {
      //execute lock
      // await launch_client?.lock()
    } catch (error) {
      success = false;
      console.log(error);
    } finally {
      if (success) {
        //Update OSMO total
        setlockedOSMO(+lockedOSMO + +amount)

        //Query to update lock list
        get_updateddepositList() 

        //Query to Update MBRN reward total
        set_MBRNreward()
      }
    }
  }

  //Query & update list objects
  const get_updateddepositList = async () => {
    //Query for deposit list
    try {
      await queryClient?.userInfo({
        user: address ?? "",
      }).then((res) => {
        
        var depositList = res.deposits

        var i = 0;
        try {    
          for (i; i < depositList.length; i++) {
            switch (i){
              case 0: {
                //Update lock object
                setdeposit1(prevState => {
                    return {
                      ...prevState,
                      deposit: parseInt(depositList[i].deposit),
                      old_lock_up_duration:  depositList[i].lock_up_duration,
                      label: "EDIT"
                    }
                  })
                break;
              }
              case 1: {
                //Update lock object
                setdeposit2(prevState => {
                  return {
                    ...prevState,
                    deposit: parseInt(depositList[i].deposit),
                    old_lock_up_duration:  depositList[i].lock_up_duration,
                    label: "EDIT"
                  }
                })
                break;
              }
              case 2: {
                //Update lock object
                setdeposit3(prevState => {
                  return {
                    ...prevState,
                    deposit: parseInt(depositList[i].deposit),
                    old_lock_up_duration:  depositList[i].lock_up_duration,
                    label: "EDIT"
                  }
                })
                break;
              }
              case 3: {
                //Update lock object
                setdeposit4(prevState => {
                  return {
                    ...prevState,
                    deposit: parseInt(depositList[i].deposit),
                    old_lock_up_duration:  depositList[i].lock_up_duration,
                    label: "EDIT"
                  }
                })
                break;
              }
              case 4: {
                //Update lock object
                setdeposit5(prevState => {
                  return {
                    ...prevState,
                    deposit: parseInt(depositList[i].deposit),
                    old_lock_up_duration:  depositList[i].lock_up_duration,
                    label: "EDIT"
                  }
                })
                break;
              }
              case 5: {
                //Update lock object
                setdeposit6(prevState => {
                  return {
                    ...prevState,
                    deposit: parseInt(depositList[i].deposit),
                    old_lock_up_duration:  depositList[i].lock_up_duration,
                    label: "EDIT"
                  }
                })
                break;
              }
              case 6: {
                //Update lock object
                setdeposit7(prevState => {
                  return {
                    ...prevState,
                    deposit: parseInt(depositList[i].deposit),
                    old_lock_up_duration:  depositList[i].lock_up_duration,
                    label: "EDIT"
                  }
                })
                break;
              }
              case 7: {
                //Update lock object
                setdeposit8(prevState => {
                  return {
                    ...prevState,
                    deposit: parseInt(depositList[i].deposit),
                    old_lock_up_duration:  depositList[i].lock_up_duration,
                    label: "EDIT"
                  }
                })
                break;
              }
            }
          }

        } catch (error) {
          //set remaining lock objects to 0/null/undefuned
          for (i; i < depositList.length; i++) {
            switch (i){
              case 0: {
                //Update lock object
                setdeposit1({
                  deposit: undefined,                  
                  new_lock_up_duration: undefined,
                  old_lock_up_duration: undefined,
                  label: "LOCK"
                  })
                break;
              }
              case 1: {
                //Update lock object
                setdeposit2({
                  deposit: undefined,     
                  new_lock_up_duration: undefined,
                  old_lock_up_duration: undefined,
                  label: "LOCK"
                })
                break;
              }
              case 2: {
                //Update lock object
                setdeposit3({
                  deposit: undefined,     
                  new_lock_up_duration: undefined,
                  old_lock_up_duration: undefined,
                  label: "LOCK"
                })
                break;
              }
              case 3: {
                //Update lock object
                setdeposit4({
                  deposit: undefined,     
                  new_lock_up_duration: undefined,
                  old_lock_up_duration: undefined,
                  label: "LOCK"
                })
                break;
              }
              case 4: {
                //Update lock object
                setdeposit5({
                  deposit: undefined,     
                  new_lock_up_duration: undefined,
                  old_lock_up_duration: undefined,
                  label: "LOCK"
                })
                break;
              }
              case 5: {
                //Update lock object
                setdeposit6({
                  deposit: undefined,     
                  new_lock_up_duration: undefined,
                  old_lock_up_duration: undefined,
                  label: "LOCK"
                })
                break;
              }
              case 6: {
                //Update lock object
                setdeposit7({
                  deposit: undefined,     
                  new_lock_up_duration: undefined,
                  old_lock_up_duration: undefined,
                  label: "LOCK"
                })
                break;
              }
              case 7: {
                //Update lock object
                setdeposit8({
                  deposit: undefined,     
                  new_lock_up_duration: undefined,
                  old_lock_up_duration: undefined,
                  label: "LOCK"
                })
                break;
              }
            }
          }
        }

      })
    } catch (error) {
      console.log(error);
    }
  }

  //Query lockdrop & set progress
  const get_lockdropProgress = async () => {
    //Query lockdrop progress
    try {
      await queryClient?.lockdrop().then((res) => {
        launch_client?.client.getBlock().then( (block) => {
          var current_time = Date.parse(block.header.time) / 1000;
          
          //Calc & set progress
          setProgress((current_time - res.start_time) / (res.withdrawal_end - res.start_time) );
        })} );  
    } catch (error) {
      console.log(error);
    }
  }

  const set_MBRNreward = async () => {
    //Query for MBRN reward total
    try { 
      await queryClient?.userIncentives({user: address ?? ""}).then((res: Uint128) => {
        setMBRNreward(parseInt(res))
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
      
      //Query to set MBRN reward total
      set_MBRNreward()
    // }
  }, [address]);

  const handledeposit1Click = async () => {
    if (deposit1.label ==="LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        console.log("trying")
        await launch_client?.lock({
          lockUpDuration: deposit1.new_lock_up_duration ?? 0
        }, "auto", undefined, [coin(deposit1.deposit ?? 0, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
        })

      } catch (error) {
        console.log(error);
      }
    } else if (deposit1.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit1.new_lock_up_duration ?? 0,
          oldLockUpDuration: deposit1.old_lock_up_duration ?? 0,
          uosmoAmount: (deposit1.deposit ?? 0).toString(),
        }).then((res) => {
          get_updateddepositList()
        })
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handledeposit2Click = async () => {
    if (deposit2.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit2.new_lock_up_duration ?? 0
        }, "auto", undefined, [coin(deposit2.deposit ?? 0, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
        })

      } catch (error) {
        console.log(error);
      }
    } else if (deposit2.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit2.new_lock_up_duration ?? 0,
          oldLockUpDuration: deposit2.old_lock_up_duration ?? 0,
          uosmoAmount: (deposit2.deposit ?? 0).toString(),
        }).then((res) => {
          get_updateddepositList()
        })
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handledeposit3Click = async () => {
    if (deposit3.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit3.new_lock_up_duration ?? 0
        }, "auto", undefined, [coin(deposit3.deposit ?? 0, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
        })

      } catch (error) {
        console.log(error);
      }
    } else if (deposit3.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit3.new_lock_up_duration ?? 0,
          oldLockUpDuration: deposit3.old_lock_up_duration ?? 0,
          uosmoAmount: (deposit3.deposit ?? 0).toString(),
        }).then((res) => {
          get_updateddepositList()
        })
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handledeposit4Click = async () => {
    if (deposit4.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit4.new_lock_up_duration ?? 0
        }, "auto", undefined, [coin(deposit4.deposit ?? 0, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
        })

      } catch (error) {
        console.log(error);
      }
    } else if (deposit4.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit4.new_lock_up_duration ?? 0,
          oldLockUpDuration: deposit4.old_lock_up_duration ?? 0,
          uosmoAmount: (deposit4.deposit ?? 0).toString(),
        }).then((res) => {
          get_updateddepositList()
        })
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handledeposit5Click = async () => {
    if (deposit5.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit5.new_lock_up_duration ?? 0
        }, "auto", undefined, [coin(deposit5.deposit ?? 0, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
        })

      } catch (error) {
        console.log(error);
      }
    } else if (deposit5.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit5.new_lock_up_duration ?? 0,
          oldLockUpDuration: deposit5.old_lock_up_duration ?? 0,
          uosmoAmount: (deposit5.deposit ?? 0).toString(),
        }).then((res) => {
          get_updateddepositList()
        })
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handledeposit6Click = async () => {
    if (deposit6.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit6.new_lock_up_duration ?? 0
        }, "auto", undefined, [coin(deposit6.deposit ?? 0, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
        })

      } catch (error) {
        console.log(error);
      }
    } else if (deposit6.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit6.new_lock_up_duration ?? 0,
          oldLockUpDuration: deposit6.old_lock_up_duration ?? 0,
          uosmoAmount: (deposit6.deposit ?? 0).toString(),
        }).then((res) => {
          get_updateddepositList()
        })
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handledeposit7Click = async () => {
    if (deposit7.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit7.new_lock_up_duration ?? 0
        }, "auto", undefined, [coin(deposit7.deposit ?? 0, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
        })

      } catch (error) {
        console.log(error);
      }
    } else if (deposit7.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit7.new_lock_up_duration ?? 0,
          oldLockUpDuration: deposit7.old_lock_up_duration ?? 0,
          uosmoAmount: (deposit7.deposit ?? 0).toString(),
        }).then((res) => {
          get_updateddepositList()
        })
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handledeposit8Click = async () => {
    if (deposit8.label == "LOCK"){
      //Lock deposit using new_lock_up_duration
      try {
        await launch_client?.lock({
          lockUpDuration: deposit8.new_lock_up_duration ?? 0
        }, "auto", undefined, [coin(deposit8.deposit ?? 0, denoms.osmo)])
        .then((res) => {
          get_updateddepositList()
        })

      } catch (error) {
        console.log(error);
      }
    } else if (deposit8.label ==="EDIT"){
      //Edit deposit
      try {
        await launch_client?.changeLockDuration({
          newLockUpDuration: deposit8.new_lock_up_duration ?? 0,
          oldLockUpDuration: deposit8.old_lock_up_duration ?? 0,
          uosmoAmount: (deposit8.deposit ?? 0).toString(),
        }).then((res) => {
          get_updateddepositList()
        })
      } catch (error) {
        console.log(error);
      }
    }
  };
  
  const handlesetdeposit1amount = (event) => {
    event.preventDefault();
    setdeposit1(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit1days = (event) => {
    event.preventDefault();
    setdeposit1(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit2amount = (event) => {
    event.preventDefault();
    setdeposit2(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit2days = (event) => {
    event.preventDefault();
    setdeposit2(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit3amount = (event) => {
    event.preventDefault();
    setdeposit3(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit3days = (event) => {
    event.preventDefault();
    setdeposit3(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit4amount = (event) => {
    event.preventDefault();
    setdeposit4(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit4days = (event) => {
    event.preventDefault();
    setdeposit4(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit5amount = (event) => {
    event.preventDefault();
    setdeposit5(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit5days = (event) => {
    event.preventDefault();
    setdeposit5(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit6amount = (event) => {
    event.preventDefault();
    setdeposit6(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit6days = (event) => {
    event.preventDefault();
    setdeposit6(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit7amount = (event) => {
    event.preventDefault();
    setdeposit7(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit7days = (event) => {
    event.preventDefault();
    setdeposit7(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };
  const handlesetdeposit8amount = (event) => {
    event.preventDefault();
    setdeposit8(prevState => {
      return { ...prevState, deposit: event.target.value }
    });
  };
  const handlesetdeposit8days = (event) => {
    event.preventDefault();
    setdeposit8(prevState => {
      return { ...prevState, new_lock_up_duration: event.target.value }
    });
  };

  return (    
    <div className="lockdrop">
    <h1 className="pagetitle-lockdrop">Lockdrop</h1>
    <img className="titleicon-lockdrop" alt="" src="/images/lockdrop.svg" />
        <div className="lockdrop-page">
            <div className="lockdrop-frame"/>
            <div className="infobox" />
            <div className="durationbar">
              <ProgressBar bgcolor="#50C9BD" progress={progress}  height={30} />
              <div className='y-axis'/>
              <div className="deposit">DEPOSIT</div>
              <div className="withdraw">WITHDRAW</div>
            </div>
            
            <div className="mbrn-reward-circle" />
            <div className="osmo-deposit-circle" />
            <div className="osmo-deposit-amount">{lockedOSMO} OSMO</div>
            <div className="mbrn-reward-total">{MBRNreward} MBRN</div>
            <div className="rates-box-title">Your&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rates </div>
            <img className="mbrn-rate-logo" alt="" src="/images/Logo.svg" />
            <div className="rates-box"/>
            <img className="osmo-rate-logo" alt="" src="/images/osmo.svg" />
            <img className="axlusdc-rate-logo" alt="" src="/images/usdc.svg" />
            <div className="price-in-osmo">: {MBRNreward / lockedOSMO}</div>
            <div className="price-in-axlusdc">: {(MBRNreward / lockedOSMO) * prices.osmo}</div>
            <div className="infomsg">
              <p className="there-is-10m-mbrn-up-for-grabs">
                There is 10M MBRN up for grabs in this 7 day event. If you want a larger share for your deposit you must lock for longer (MAX: 90 days).
              </p>
              <p/>
              <p>Locks boost your “shares” and the full 10M is split & STAKED (4 day lock) in accordance to said shares.</p>
            </div>
            <div className="allocationmsg">
              <span className="allocationmsg-txt">
              <p>Pre-launch contributors: 10%, vested for 2y cliff/1y linear</p>
              <p>Community: 90%</p>
              <p>Stakers have control over vested stake.</p>
              </span>
            </div>
            <a className="info" target="_blank" rel="noopener noreferrer" href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/lockdrop-launch">INFO</a>
            <a className="allocations" target="_blank" rel="noopener noreferrer" href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/mbrn-tokenomics">ALLOCATIONS</a>
          </div>
          <div className="deposits-list">
            <div className="yourdepositstext">
              YOUR DEPOSITS
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
              <input className="div2" name="deposit1amount" value={deposit1.deposit} type="number" disabled={deposit1.label === "EDIT"} onChange={handlesetdeposit1amount}/>
              <input className="days" name="deposit1days" value={deposit1.old_lock_up_duration} type="number" onChange={handlesetdeposit1days}/>
              <button className="btn button" type="button" onClick={handledeposit1Click}>
                <div className="button-label">
                {deposit1.label}
                </div>
              </button>
              {/*Deposit 2*/}
              <input className="div3" name="deposit2amount" value={deposit2.deposit} type="number" disabled={deposit2.label === "EDIT"} onChange={handlesetdeposit2amount}/>
              <input className="days1" name="deposit2days" value={deposit2.old_lock_up_duration} type="number" onChange={handlesetdeposit2days}/>
              <button className="btn button1" type="button" onClick={handledeposit2Click}>
                <div className="button-label">
                {deposit2.label}
                </div>
              </button>
              {/*Deposit 3*/}
              <input className="div4" name="deposit3amount" value={deposit3.deposit} type="number" disabled={deposit3.label === "EDIT"} onChange={handlesetdeposit3amount}/>
              <input className="days2" name="deposit3days" value={deposit3.old_lock_up_duration} type="number" onChange={handlesetdeposit3days}/>
              <button className="btn button2" type="button" onClick={handledeposit3Click}>
                <div className="button-label">
                {deposit3.label}
                </div>
              </button>
              {/*Deposit 4*/}
              <input className="div5" name="deposit4amount" value={deposit4.deposit} type="number" disabled={deposit4.label === "EDIT"} onChange={handlesetdeposit4amount}/>
              <input className="days3" name="deposit4days" value={deposit4.old_lock_up_duration} type="number" onChange={handlesetdeposit4days}/>
              <button className="btn button3" type="button" onClick={handledeposit4Click}>
                <div className="button-label">
                {deposit4.label}
                </div>
              </button>
              {/*Deposit 5*/}
              <input className="div6" name="deposit5amount" value={deposit5.deposit} type="number" disabled={deposit5.label === "EDIT"} onChange={handlesetdeposit5amount}/>
              <input className="days4" name="deposit5days" value={deposit5.old_lock_up_duration} type="number" onChange={handlesetdeposit5days}/>
              <button className="btn button4" type="button" onClick={handledeposit5Click}>
                <div className="button-label">
                {deposit5.label}
                </div>
              </button>
              {/*Deposit 6*/}
              <input className="div7" name="deposit6amount" value={deposit6.deposit} type="number" disabled={deposit6.label === "EDIT"} onChange={handlesetdeposit6amount}/>
              <input className="days5" name="deposit6days" value={deposit6.old_lock_up_duration} type="number" onChange={handlesetdeposit6days}/>
              <button className="btn button5" type="button" onClick={handledeposit6Click}>
                <div className="button-label">
                {deposit6.label}
                </div>
              </button>
              {/*Deposit 7*/}
              <input className="div8" name="deposit7amount" value={deposit7.deposit} type="number" disabled={deposit7.label === "EDIT"} onChange={handlesetdeposit7amount}/>
              <input className="days6" name="deposit7days" value={deposit7.old_lock_up_duration} type="number" onChange={handlesetdeposit7days}/>
              <button className="btn button6" type="button" onClick={handledeposit7Click}>
                <div className="button-label">
                {deposit7.label}
                </div>
              </button>
              {/*Deposit 8*/}
              <input className="div9" name="deposit8amount" value={deposit8.deposit} type="number" disabled={deposit8.label === "EDIT"} onChange={handlesetdeposit8amount}/>
              <input className="days7" name="deposit8days" value={deposit8.old_lock_up_duration} type="number" onChange={handlesetdeposit8days}/>
              <button className="btn button7" type="button" onClick={handledeposit8Click}>
                <div className="button-label">
                {deposit8.label}
                </div>
              </button>
            </form>
          </div>
          {/* <form>
            <input className="lock-amount" name="amount" value={amount} type="number" onChange={handlesetAmount}/>
            <button className="lock-button" type="button" onClick={handlelockClick}>
              <div className="lock-button-label">LOCK:</div>
            </button>
          </form> */}
        </div>
  );
};

export default Lockdrop;
