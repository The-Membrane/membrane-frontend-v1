import { useEffect, useState } from "react";
import ProgressBar from "../components/progress_bar";
import { GovernanceClient, GovernanceQueryClient } from "../codegen/governance/Governance.client";
import { StakingClient, StakingQueryClient } from '../codegen/staking/Staking.client';
import { Proposal, ProposalResponse, Config, ProposalMessage } from "../codegen/governance/Governance.types";
import Popup from "../components/Popup";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { coins } from "@cosmjs/stargate";
import { denoms } from ".";
import { NativeToken } from "../codegen/Positions.types";
import React from "react";
import Image from "next/image";
import { GenericAuthorization } from "osmojs/dist/codegen/cosmos/authz/v1beta1/authz";

const SECONDS_PER_DAY = 86400;
const unstakingPeriod = 4; //days

interface Props {
  govClient: GovernanceClient | null;
  govQueryClient: GovernanceQueryClient | null;
  stakingClient: StakingClient | null;
  stakingQueryClient: StakingQueryClient | null;
  address: string | undefined;
}

const Governance = ({govClient, govQueryClient, stakingClient, stakingQueryClient, address}: Props) => {
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [popupMsg, setPopupMsg] = useState<ReactJSXElement>();
  const [popupStatus, setPopupStatus] = useState("");
  //Proposal List//
  const [open, setOpen] = useState(false);
  const [proposalType, setproposalType] = useState("Active");
  const [proposalColor, setproposalColor] = useState("#567c39");
  const [quorum, setQuorum] = useState(0);
  //Proposal, Days left, Current Status, Quorum 
  interface ProposalList {
      active: [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][];
      pending: [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][];
      completed: [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][];
      executed: [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][];
  }
  const [proposals, setProposals] = useState<ProposalList>({
      active: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
      pending: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
      completed: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
      executed: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
  });
  const [userVP, setuserVP] = useState(0);
  //Staking//
  //Emissions Schedule
  const [emissionsSchedule, setEmissionsSchedule] = useState({
    rate: 0,
    monthsLeft: 0,
  })
  const [userStake, setUserStake] = useState({
    staked: 0,
    unstaking: {
      amount: 0,
      timeLeft: 0,
    },
  });
  const [stakeAmount, setstakeAmount] = useState();
  const [unstakeAmount, setunstakeAmount] = useState();
  const [userClaims, setuserClaims] = useState({
    mbrnClaims: 0,
    cdtClaims: 0,
  });
  //Delegations
  const [commission, setCommission] = useState(0);
  const [maxCommission, setmaxCommission] = useState(0);
  interface Delegation {
    delegator: string;
    fluid: boolean | undefined;
    amount: number | undefined;
    commission: number | undefined;
  }
  interface Delegator {
    delegator: string;
    fluid: boolean | undefined;
    amount: number | undefined;
  }
  const [delegations, setDelegations] = useState<Delegation[]>([
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
      commission: undefined,
    }
  ]);
  const [delegators, setDelegators] = useState<Delegator[]>([
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }, 
    {
      delegator: "",
      fluid: undefined,
      amount: undefined,
    }
  ]);

  const handlesetstakeAmount = (event: any) => {
    event.preventDefault();
    setstakeAmount(event.target.value);
  }
  const handlesetunstakeAmount = (event: any) => {
    event.preventDefault();
    setunstakeAmount(event.target.value);
  }
  const handleOpen = () => {
    //Query Proposals and save them in sorted bins
    setOpen(!open);
  };
  const handleActive = () => {
    setproposalType("Active");
    setproposalColor("#567c39");
    setOpen(false);
  };  
  const handlePending = () => {
    setproposalType("Pending");
    setproposalColor("rgb(189, 131, 22)")
    setOpen(false);
  };
  const handleCompleted = () => {
    setproposalType("Completed");
    setproposalColor("rgb(73, 73, 169)")
    setOpen(false);
  };  
  const handleExecuted = () => {
    setproposalType("Executed");
    setproposalColor("rgb(160, 102, 102)")
    setOpen(false);
  };
  const handleproposalClick = (proposal: ProposalResponse | undefined) => {
    if (proposal !== undefined) {
      //Calc total votes
      var total_votes = parseInt(proposal.for_power) + parseInt(proposal.against_power) + parseInt(proposal.aligned_power) + parseInt(proposal.amendment_power) + parseInt(proposal.removal_power);
      //Calc ratios
      var for_ratio = (parseInt(proposal.for_power) / total_votes * 100).toString() + "%";
      var against_ratio = (parseInt(proposal.against_power) / total_votes * 100).toString() + "%";
      var aligned_ratio = (parseInt(proposal.aligned_power) / total_votes * 100).toString() + "%";
      var amend_ratio = (parseInt(proposal.amendment_power) / total_votes * 100).toString() + "%";
      var removal_ratio = (parseInt(proposal.removal_power) / total_votes * 100).toString() + "%";
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<p>
        <div>
          Description: {proposal.description}
        </div>
        <div>
          Links: {proposal.link}
        </div>
        <div>
          Msgs: {proposal.messages?.toString() ?? "None"}
        </div>
        <div>
          For: {for_ratio} Against: {against_ratio} Amend: {amend_ratio} Abstain: {aligned_ratio} Remove: {removal_ratio} Total: {total_votes}
        </div>
      </p>
      )
      setPopupStatus(proposal.title)
    }
  }
  const handleproposalSubmission = async (title: string, description: string, link: string, msgs: ProposalMessage[]) => {
    try {
      await govClient?.submitProposal({
        title: title,
        description: description,
        link: link,
        messages: msgs,
        expedited: false,
      },
      "auto", undefined,).then((res) => {
        //Format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Submitted</div>)
        setPopupStatus("Success")
      });
    } catch (error) {
      console.log(error)
      let e = error as {message: string};
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<div>{e.message}</div>)
      setPopupStatus("Error")        
    }
  }
  
  const handlesubmitproposalForm = () => {
    //Initialize variables
    var title = "";
    var description = "";
    var link = "";
    var msgs: FileList | null = null;
    //format popup message
    setPopupTrigger(true)
    setPopupMsg(<p>        
      <form onSubmit={(event) => {
          event.preventDefault();
          let reader = new FileReader();
          if (msgs === null) {
            //Set proposal
            handleproposalSubmission(title, description, link, [])
          } else {
            reader.readAsArrayBuffer((msgs as FileList)[0]);
            reader.onload = async () => {
              if (reader.result !== null){     
                // //Set proposal
                handleproposalSubmission(title, description, link, JSON.parse(reader.result as string))
                console.log(JSON.parse(reader.result as string));
              }
            }
          }
          
        }}>
          <label style={{color: "aqua"}}>Title:</label>     
          <input className="title-input" name="title" defaultValue={title} type="string" onChange={(event)=>{
              event.preventDefault();
              title = event.target.value;
            }}/>        
          <label style={{color: "aqua"}}>Description:</label>     
          <input className="description-input" name="description" defaultValue={description} type="string" onChange={(event)=>{
              event.preventDefault();
              description = event.target.value;
            }}/>
          <div>
            <label style={{color: "aqua"}}>Link:</label>     
            <input className="link-input" name="link" defaultValue={link} type="string" onChange={(event)=>{
              event.preventDefault();
              link = event.target.value;
            }}/>
          </div>
          <div>
            <label style={{color: "aqua"}}>Msgs:</label>     
            <input style={{position: "absolute",height: 55}} name="msg" defaultValue={""} type="file" accept="wasm" onChange={(event)=>{
              event.preventDefault();
              msgs = event.target.files;
            }}/>
          </div>
          <button className="btn" style={{position: "absolute", right: 100, backgroundColor:"gray"}} type="submit">
                <div >
                Submit
                </div>
              </button>
      </form>
    </p>
    )
    setPopupStatus("Submit Proposal")
  }
  
  
  const getProposalResult = (totalVotes: number, forVotes: number, amend: number, remove: number, config: Config) => {
    if (forVotes / totalVotes > parseInt(config.proposal_required_threshold)) {
      return "For";
    } else if (amend / totalVotes > parseInt(config.proposal_required_threshold)) {
      return "Amend";
    } else if (remove / totalVotes > parseInt(config.proposal_required_quorum)) {
      return "Remove";
    } else {
      return "Against";
    }
  }

  const getProposals = async () => {
    try {
      //Get current time in seconds
      var currentTime = 0;
      govClient?.client.getBlock().then( (block) => {
        currentTime = Date.parse(block.header.time) / 1000;;
      })
      //Get active
      await govQueryClient?.activeProposals({})
      .then(async (res) => {
        //Set active, completed & executed
        for (let i = 0; i < res.proposal_list.length; i++) {
          if (res.proposal_list[i].status == "active") {
            if (proposals.active.length < 8){
              //Get days left
              var daysLeft = (res.proposal_list[i].end_block - currentTime) / SECONDS_PER_DAY;            
              //Get total voting power
              var totalVotingPower = 0;
              await govQueryClient?.totalVotingPower({
                proposalId: parseInt(res.proposal_list[i].proposal_id)
              }).then((res) => {
                totalVotingPower = parseInt(res);
              })
              //Calc quorum
              var quorum = (parseInt(res.proposal_list[i].against_power) + parseInt(res.proposal_list[i].for_power) + parseInt(res.proposal_list[i].aligned_power) + parseInt(res.proposal_list[i].amendment_power) + parseInt(res.proposal_list[i].removal_power)) / totalVotingPower;
              //Query config
              var config = await govQueryClient?.config()
              //Set quorum from config
              setQuorum(parseInt(config.proposal_required_quorum))
              //Get current result
              let current_result = getProposalResult(totalVotingPower, parseInt(res.proposal_list[i].for_power), parseInt(res.proposal_list[i].amendment_power), parseInt(res.proposal_list[i].removal_power), config)
              //Push to active
              proposals.active.push([res.proposal_list[i], daysLeft, current_result, quorum])
            }
          } else if (res.proposal_list[i].status == "executed") {
            if (proposals.executed.length < 8){
              //Get days left
              var daysLeft = (res.proposal_list[i].end_block - currentTime) / SECONDS_PER_DAY;
              //Push to executed
              proposals.executed.push([res.proposal_list[i], daysLeft, "Executed", 100])
            }
          } else { //Completed
            if (proposals.completed.length < 8){
              //Get days left
              var daysLeft = (res.proposal_list[i].end_block - currentTime) / SECONDS_PER_DAY;
              //Push to completed
              proposals.active.push([res.proposal_list[i], daysLeft, "Completed", 100])
            }
          }
        }
      })

      //Get pending
      await govQueryClient?.pendingProposals({
        limit: 8,
      })
      .then((res) => {
        //Set pending
        for (let i = 0; i < res.proposal_list.length; i++) {
          proposals.pending.push([res.proposal_list[i], 1, "Pending", 0])
        }
      })

      //Set proposals
      setProposals(proposals)
    } catch (error) {
      console.log(error)
    }
  }

  //Get emissions schedule
  const getEmissionsSchedule = async () => {
    try {
      //Get emissions schedule
      await stakingQueryClient?.incentiveSchedule()
      .then(async (res) => {
        console.log(res)
        //Get block time
        stakingClient?.client.getBlock().then((block) => {
          let start_in_seconds = res.start_time;
          let durations_in_seconds = res.ownership_distribution.duration * SECONDS_PER_DAY;
          //Calc months left
          let seconds_left = (start_in_seconds + durations_in_seconds) - (Date.parse(block.header.time) / 1000);
          //Seconds to months
          let monthsLeft = seconds_left / (SECONDS_PER_DAY * 30);
          //Set emissions schedule
          setEmissionsSchedule({
            rate: parseInt(res.ownership_distribution.rate),
            monthsLeft: monthsLeft,
          })
        })

      })
    } catch (error) {
      console.log(error)
    }
  }

  //Get user staked & unstaking MBRN
  const getUserStake = async () => {
    try {
      await stakingQueryClient?.userStake({
        staker: address ?? "",
      }).then((res) => {
        //Get staking total & closest unstaking deposit
        var stakingTotal = 0;
        var closestUnstakingDeposit = 0;
        var closestUnstakingDepositTime = 0;
        console.log(res.deposit_list)
        for (let i = 0; i < res.deposit_list.length; i++) {
          if (res.deposit_list[i].unstake_start_time === null || res.deposit_list[i].unstake_start_time === undefined) {
            stakingTotal += parseInt(res.deposit_list[i].amount)
          } else {
            if (closestUnstakingDepositTime === 0){
              closestUnstakingDepositTime = res.deposit_list[i].unstake_start_time ?? 0
              closestUnstakingDeposit = parseInt(res.deposit_list[i].amount)
            } else if ((res.deposit_list[i].unstake_start_time ?? 0) < closestUnstakingDepositTime) {
              closestUnstakingDepositTime = res.deposit_list[i].unstake_start_time ?? 0
              closestUnstakingDeposit = parseInt(res.deposit_list[i].amount)
            }            
          }
        }
        //Calc time left to unstake
        var currentTime = 0;
        stakingClient?.client.getBlock().then( (block) => {
          currentTime = Date.parse(block.header.time) / 1000;
          var secondsLeft = Math.max(closestUnstakingDepositTime - currentTime, 0);
          var daysLeft = secondsLeft / SECONDS_PER_DAY;
          //Set user stake
          setUserStake({
            staked: stakingTotal,
            unstaking: {
              amount: closestUnstakingDeposit,
              timeLeft: daysLeft,
            },
          })
        })

        //Set user VP
        setuserVP(parseInt(res.total_staked))
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handlestakeClick = async () => {
    try {
      await stakingClient?.stake({}
        ,"auto", undefined, coins((stakeAmount ?? 0) * 1_000_000, denoms.mbrn)
      ).then((res) => {
        console.log(res)
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Staked</div>)
        setPopupStatus("Success")
        //Update user stake
        setUserStake(prevState => {
          return {
            ...prevState,
            staked: prevState.staked + (stakeAmount ?? 0),
          }
        })
      })
    } catch (error) {
      console.log(error)
      const e = error as {message: string};
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<div>{e.message}</div>)
      setPopupStatus("Error")
    }
  }

  const handleunstakeClick = async () => {
    try {      
      await stakingClient?.unstake({
        mbrnAmount: ((unstakeAmount ?? 0) * 1_000_000).toString(),
      },"auto", undefined
      ).then((res) => {
        console.log(res)
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Unstaked</div>)
        setPopupStatus("Success")
        //Update user stake
        setUserStake(prevState => {
          return {
            ...prevState,
            unstaking: {
              amount: +prevState.unstaking.amount + +(unstakeAmount ?? 0),
              timeLeft: unstakingPeriod,
            }
          }
        })
      })
    } catch (error) {
      console.log(error)
      const e = error as {message: string};
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<div>{e.message}</div>)
      setPopupStatus("Error")
    }
  }
  const handleclaimClick = async () => {
    try {
      await stakingClient?.claimRewards({
        restake: false,
      },"auto", undefined
      ).then((res) => {
        console.log(res)
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Claimed</div>)
        setPopupStatus("Success")
      })
    } catch (error) {
      console.log(error)
      const e = error as {message: string};
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<div>{e.message}</div>)
      setPopupStatus("Error")
    }
  }
  const getuserClaims = async () => {
    try {
      await stakingQueryClient?.userRewards({
        user: address ?? "",
      }).then((res) => {
        console.log(res)
        //Set user claims
        for (let i = 0; i < res.claimables.length; i++) {
          if("denom" in res.claimables[i].info) {
            if ((res.claimables[i].info as unknown as NativeToken).denom === denoms.cdt) {
              setuserClaims(prevState => {
                return {
                  ...prevState,
                  cdtClaims: parseInt(res.claimables[i].amount) / 1_000_000,
                }
              })
            }
          }
        }
        //Set MBRN claims
        setuserClaims(prevState => {
          return {
            ...prevState,
            mbrnClaims: parseInt(res.accrued_interest) / 1_000_000,
          }
        })
      })
    } catch (error) {
      console.log(error)
    }
  }
  const handledelegateForm = (var_governator?: string) => {
    //Initialize variables
    var delegate: boolean | undefined = undefined;
    var fluid: boolean | undefined = undefined;
    var governator: string;
    if (var_governator === undefined) {
      governator = "";
    } else {
      governator = var_governator;
    }
    var amount: string;
    var vp: boolean | undefined = undefined;
    //format popup message
    setPopupTrigger(true)
    setPopupStatus("Update Delegations")
    setPopupMsg(<p>        
      <form onSubmit={(event) => {
          event.preventDefault();
          handledelegateSubmission(delegate, fluid, governator, amount, vp)
        }}>  
        {/*Governator*/}
        <div>
          <label style={{color: "aqua"}}>Governator:</label>     
          <input name="governator" defaultValue={governator} type="string" onChange={(event)=>{
            event.preventDefault();
            governator = event.target.value;
          }}/>
        </div>
        {/*Amount*/}
        <div>
          <label style={{color: "aqua"}}>Delegation amount:</label>     
          <input name="amount" type="number" onChange={(event)=>{
            event.preventDefault();
            amount = (event.target.value).toString();
          }}/>
        </div>
        {/*Delegate*/}
        <label style={{color: "aqua"}}>Delegate?</label>     
        <input name="delegate" type="checkbox" onChange={(event)=>{
            if (event.target.checked === true) {
              delegate = true;
            } else {
              delegate = undefined;
            }
            console.log({delegate})
          }}/>        
        <label style={{color: "aqua"}}>Undelegate?</label>     
        <input name="delegate" type="checkbox" onChange={(event)=>{
            if (event.target.checked === true) {
              delegate = false;
            } else {
              delegate = undefined;
            }
            console.log({delegate})
          }}/>
          {/*Fluidity*/}
          <label style={{color: "aqua"}}>Do you grant your governator the ability to delegate your delegation?(Y/n)</label>     
          <input name="fluid" value={"true"} type="radio" onChange={(event)=>{
              if (event.target.value === "true") {
                fluid = true;
              } else {
                fluid = undefined;
              }
            }}/>
          <input name="fluid" value={"false"} type="radio" onChange={(event)=>{
            if (event.target.value === "true") {
              fluid = false;
            } else {
              fluid = undefined;
            }
          }}/> 
          {/*VP delegation*/}
          <div>
            <label style={{color: "aqua"}}>Delegate the voting power as well?(Y/n)</label>     
            <input name="vp" type="radio" value={"true"} onChange={(event)=>{
              if (event.target.value === "true") {
                vp = true;
              } else {
                vp = undefined;
              }
            }}/>
            <input name="vp" type="radio" value={"false"} onChange={(event)=>{
              if (event.target.value === "true") {
                vp = false;
              } else {
                vp = undefined;
              }
            }}/>
        </div>
          <button className="btn" style={{position: "absolute", top: 150, right: 100, backgroundColor:"gray"}} type="submit">
            <div >
              Submit
            </div>
          </button>
          <button className="btn" style={{position: "absolute", opacity:0.7, top: 20, right: 100, backgroundColor:"gray"}} type="button" onClick={()=>{
            setPopupMsg(<p>        
              <form onSubmit={(event) => {
                  event.preventDefault();
                  handlefluiddelegationSubmission(governator, amount)
                }}>  
                {/*Governator*/}
                <div>
                  <label style={{color: "aqua"}}>Governator:</label>     
                  <input name="governator" defaultValue={governator} type="string" onChange={(event)=>{
                    event.preventDefault();
                    governator = event.target.value;
                  }}/>
                </div>
                {/*Amount*/}
                <div>
                  <label style={{color: "aqua"}}>Delegation amount:</label>     
                  <input name="amount" type="number" onChange={(event)=>{
                    event.preventDefault();
                    amount = (event.target.value).toString();
                  }}/>
                </div>
                  <button className="btn" style={{position: "absolute", top: 150, right: 100, backgroundColor:"gray"}} type="submit">
                    <div >
                      Submit
                    </div>
                  </button>
                  <button className="btn" style={{position: "absolute", opacity:0.7, top: 20, right: 100, backgroundColor:"gray"}} type="button" onClick={() => handledelegateForm()}>
                    <div >
                      Switch to your delegations
                    </div>
                  </button>
              </form>
            </p>
            )
          }}>
            <div >
              Switch to your Fluid delegations
            </div>
          </button>
      </form>
    </p>
    )
  }
  const handledelegateSubmission = async (
    delegate: boolean | undefined, 
    fluid: boolean | undefined, 
    governator: string,
    amount: string | undefined,
    vp: boolean | undefined, 
    ) => {
    try {
      await stakingClient?.updateDelegations({
        delegate: delegate,
        fluid: fluid,
        governatorAddr: governator,
        mbrnAmount: (parseInt(amount ??"0") * 1_000_000).toString(),
        votingPowerDelegation: vp,
      }).then(async (res) => {
        console.log(res)
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Delegation to {governator} updated</div>)
        setPopupStatus("Success")
        
        //Get delegation info
        getDelegations()
      })
    } catch (error) {
      console.log(error)
      let e = error as {message: string};
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<div>{e.message}</div>)
      setPopupStatus("Error")        
    }
  }
  const handlefluiddelegationSubmission = async (
    governator: string,
    amount: string | undefined,
    ) => {
    try {
      await stakingClient?.delegateFluidDelegations({
        governatorAddr: governator,
        mbrnAmount: amount,
      }).then((res) => {
        console.log(res)
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Delegation to {governator} updated</div>)
        setPopupStatus("Success")
      })
    } catch (error) {
      console.log(error)
      let e = error as {message: string};
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<div>{e.message}</div>)
      setPopupStatus("Error")        
    }
  }
  const handlecommissionChange = async () => {
    //Initialize variables
    var commission: string = "0";

    setPopupTrigger(true)
    setPopupStatus("Change Commission")
    setPopupMsg(<p>        
      <form onSubmit={(event) => {
          event.preventDefault();
          try {
            stakingClient?.updateDelegations({
              commission: commission,
            },"auto", undefined
            ).then(async (res) => {
              console.log(res)
              //format popup message
              setPopupTrigger(true)
              setPopupMsg(<div>Commission changed</div>)
              setPopupStatus("Success")

              //Set new commission
              await stakingQueryClient?.delegations({
                user: address ?? "",
              }).then((res) => {
                setCommission(parseInt(res[0].delegation_info.commission) * 100) //Commission is a % so multiply by 100
              })
            })
          } catch (error) {
            console.log(error)
            let e = error as {message: string};
            //format popup message
            setPopupTrigger(true)
            setPopupMsg(<div>{e.message}</div>)
            setPopupStatus("Error")        
          }
        }}>  
        {/*Commission*/}
        <div>
          <label style={{color: "aqua"}}>Commission as %: Max {maxCommission}, (5 as 5%)</label>     
          <div>
            <input name="commission" type="number" onChange={(event)=>{
              event.preventDefault();
              commission = event.target.value;
            }}/>
          </div>
        </div>
          <button className="btn" style={{position: "absolute", top: 150, right: 100, backgroundColor:"gray"}} type="submit">
            <div >
              Submit
            </div>
          </button>
      </form>
    </p>
    )
  }
  const getDelegations = async () => {
    try {
      await stakingQueryClient?.delegations({
        user: address ?? "",
      }).then( async (res) => {
        console.log(res)

        //Set delegations
        for (let i = 0; i < res[i].delegation_info.delegated_to.length; i++) {
          delegations[i].amount = parseInt(res[i].delegation_info.delegated_to[i].amount)
          delegations[i].delegator = res[i].delegation_info.delegated_to[i].delegate
          delegations[i].fluid = res[i].delegation_info.delegated_to[i].fluidity
          //Query and set commission
          await stakingQueryClient?.delegations({
            user: res[i].delegation_info.delegated_to[i].delegate,
          }).then((res) => {
            delegations[i].commission = parseInt(res[0].delegation_info.commission) * 100 //Commission is a % so multiply by 100
          })
        }
        
        //Set Delegators
        var delegationVP = 0;
        for (let i = 0; i < res[i].delegation_info.delegated.length; i++) {
          delegators[i].amount = parseInt(res[i].delegation_info.delegated[i].amount)
          delegators[i].delegator = res[i].delegation_info.delegated[i].delegate
          delegators[i].fluid = res[i].delegation_info.delegated[i].fluidity
          
          //Add to user total VP
          if (res[i].delegation_info.delegated[i].voting_power_delegation === true) {
            delegationVP = parseInt(res[i].delegation_info.delegated_to[i].amount)
          }          
          //Add to user total VP
          setuserVP(prevState => {
            return prevState + delegationVP
          })
        }
      })

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    //Query & set proposals
    getProposals()
    //Query & set emissions schedule
    getEmissionsSchedule()
    //Get user staked & unstaking MBRN
    getUserStake()
    //Get user claims
    getuserClaims()
    //Get delegation info
    getDelegations()
  }, [address, govClient, govQueryClient, stakingClient, stakingQueryClient]);
      
  return (
    <div className="governance">
    <h1 className="pagetitle-gov">Governance</h1>
      <div className="proposals-frame">
        <div className="proposal-axis" />
        <div className="proposal-axis1" />
        <div className="proposal-axis2" />
        <div className="proposal-axis3" />
        <div className="proposal-axis4" />
        <div className="proposal-axis5" />
        <div className="proposal-axis6" />
        <div className="proposal-axis7" />
        <div className="proposal1-button" style={{backgroundColor:proposalColor}}/>
        <div className="proposal2-button" style={{backgroundColor:proposalColor}}/>
        <div className="proposal3-button" style={{backgroundColor:proposalColor}}/>
        <div className="proposal4-button" style={{backgroundColor:proposalColor}}/>
        <div className="proposal5-button" style={{backgroundColor:proposalColor}}/>
        <div className="proposal6-button" style={{backgroundColor:proposalColor}}/>
        <div className="proposal7-button" style={{backgroundColor:proposalColor}}/>
        <div className="proposal8-button" style={{backgroundColor:proposalColor}}/>
        {proposalType === "Active" ? (
        <><div className="proposal-1" onClick={() => handleproposalClick(proposals.active[0][0])}>{proposals.active[0][0]?.title ?? ""}</div>
        <div className="proposal-2" onClick={() => handleproposalClick(proposals.active[1][0])}>{proposals.active[1][0]?.title  ?? ""}</div>
        <div className="proposal-3" onClick={() => handleproposalClick(proposals.active[2][0])}>{proposals.active[2][0]?.title  ?? ""}</div>
        <div className="proposal-4" onClick={() => handleproposalClick(proposals.active[3][0])}>{proposals.active[3][0]?.title  ?? ""}</div>
        <div className="proposal-5" onClick={() => handleproposalClick(proposals.active[4][0])}>{proposals.active[4][0]?.title  ?? ""}</div>
        <div className="proposal-6" onClick={() => handleproposalClick(proposals.active[5][0])}>{proposals.active[5][0]?.title  ?? ""}</div>
        <div className="proposal-7" onClick={() => handleproposalClick(proposals.active[6][0])}>{proposals.active[6][0]?.title  ?? ""}</div>
        <div className="proposal-8" onClick={() => handleproposalClick(proposals.active[7][0])}>{proposals.active[7][0]?.title  ?? ""}</div>
        <div className="proposal-days" style={(proposals.active[0][3] === undefined ) ? {opacity:0} : undefined}>{proposals.active[0][1] ?? 0} days</div>
        <div className="proposal-days1" style={(proposals.active[1][3] === undefined ) ? {opacity:0} : undefined}>{proposals.active[1][1] ?? 0} days</div>
        <div className="proposal-days2" style={(proposals.active[2][3] === undefined ) ? {opacity:0} : undefined}>{proposals.active[2][1] ?? 0} days</div>
        <div className="proposal-days3" style={(proposals.active[3][3] === undefined ) ? {opacity:0} : undefined}>{proposals.active[3][1] ?? 0} days</div>
        <div className="proposal-days4" style={(proposals.active[4][3] === undefined ) ? {opacity:0} : undefined}>{proposals.active[4][1] ?? 0} days</div>
        <div className="proposal-days5" style={(proposals.active[5][3] === undefined ) ? {opacity:0} : undefined}>{proposals.active[5][1] ?? 0} days</div>
        <div className="proposal-days6" style={(proposals.active[6][3] === undefined ) ? {opacity:0} : undefined}>{proposals.active[6][1] ?? 0} days</div>
        <div className="proposal-days7" style={(proposals.active[7][3] === undefined ) ? {opacity:0} : undefined}>{proposals.active[7][1] ?? 0} days</div>
        <div className="proposal-result" style={((proposals.active[0][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[0][2] ?? ""}</div>
        <div className="proposal-result1" style={((proposals.active[1][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[1][2] ?? ""}</div>
        <div className="proposal-result2" style={((proposals.active[2][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[2][2] ?? ""}</div>
        <div className="proposal-result3" style={((proposals.active[3][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[3][2] ?? ""}</div>
        <div className="proposal-result4" style={((proposals.active[4][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[4][2] ?? ""}</div>
        <div className="proposal-result5" style={((proposals.active[5][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[5][2] ?? ""}</div>
        <div className="proposal-result6" style={((proposals.active[6][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[6][2] ?? ""}</div>
        <div className="proposal-result7" style={((proposals.active[7][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[7][2] ?? ""}</div></>) 
        : proposalType === "Pending" ? (
          <><div className="proposal-1" onClick={() => handleproposalClick(proposals.pending[0][0])}>{proposals.pending[0][0]?.title  ?? ""}</div>
          <div className="proposal-2" onClick={() => handleproposalClick(proposals.pending[1][0])}>{proposals.pending[1][0]?.title  ?? ""}</div>
          <div className="proposal-3" onClick={() => handleproposalClick(proposals.pending[2][0])}>{proposals.pending[2][0]?.title  ?? ""}</div>
          <div className="proposal-4" onClick={() => handleproposalClick(proposals.pending[3][0])}>{proposals.pending[3][0]?.title  ?? ""}</div>
          <div className="proposal-5" onClick={() => handleproposalClick(proposals.pending[4][0])}>{proposals.pending[4][0]?.title  ?? ""}</div>
          <div className="proposal-6" onClick={() => handleproposalClick(proposals.pending[5][0])}>{proposals.pending[5][0]?.title  ?? ""}</div>
          <div className="proposal-7" onClick={() => handleproposalClick(proposals.pending[6][0])}>{proposals.pending[6][0]?.title  ?? ""}</div>
          <div className="proposal-8" onClick={() => handleproposalClick(proposals.pending[7][0])}>{proposals.pending[7][0]?.title  ?? ""}</div>
          <div className="proposal-days" style={(proposals.pending[0][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[0][1] ?? 0} days</div>
          <div className="proposal-days1" style={(proposals.pending[1][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[1][1] ?? 0} days</div>
          <div className="proposal-days2" style={(proposals.pending[2][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[2][1] ?? 0} days</div>
          <div className="proposal-days3" style={(proposals.pending[3][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[3][1] ?? 0} days</div>
          <div className="proposal-days4" style={(proposals.pending[4][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[4][1] ?? 0} days</div>
          <div className="proposal-days5" style={(proposals.pending[5][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[5][1] ?? 0} days</div>
          <div className="proposal-days6" style={(proposals.pending[6][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[6][1] ?? 0} days</div>
          <div className="proposal-days7" style={(proposals.pending[7][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[7][1] ?? 0} days</div>
          <div className="proposal-result" style={((proposals.pending[0][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[0][2] ?? ""}</div>
          <div className="proposal-result1" style={((proposals.pending[1][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[1][2] ?? ""}</div>
          <div className="proposal-result2" style={((proposals.pending[2][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[2][2] ?? ""}</div>
          <div className="proposal-result3" style={((proposals.pending[3][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[3][2] ?? ""}</div>
          <div className="proposal-result4" style={((proposals.pending[4][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[4][2] ?? ""}</div>
          <div className="proposal-result5" style={((proposals.pending[5][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[5][2] ?? ""}</div>
          <div className="proposal-result6" style={((proposals.pending[6][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[6][2] ?? ""}</div>
          <div className="proposal-result7" style={((proposals.pending[7][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[7][2] ?? ""}</div></>) 
        : proposalType === "Completed" ? (
          <><div className="proposal-1" onClick={() => handleproposalClick(proposals.completed[0][0])}>{proposals.completed[0][0]?.title  ?? ""}</div>
          <div className="proposal-2" onClick={() => handleproposalClick(proposals.completed[1][0])}>{proposals.completed[1][0]?.title  ?? ""}</div>
          <div className="proposal-3" onClick={() => handleproposalClick(proposals.completed[2][0])}>{proposals.completed[2][0]?.title  ?? ""}</div>
          <div className="proposal-4" onClick={() => handleproposalClick(proposals.completed[3][0])}>{proposals.completed[3][0]?.title  ?? ""}</div>
          <div className="proposal-5" onClick={() => handleproposalClick(proposals.completed[4][0])}>{proposals.completed[4][0]?.title  ?? ""}</div>
          <div className="proposal-6" onClick={() => handleproposalClick(proposals.completed[5][0])}>{proposals.completed[5][0]?.title  ?? ""}</div>
          <div className="proposal-7" onClick={() => handleproposalClick(proposals.completed[6][0])}>{proposals.completed[6][0]?.title  ?? ""}</div>
          <div className="proposal-8" onClick={() => handleproposalClick(proposals.completed[7][0])}>{proposals.completed[7][0]?.title  ?? ""}</div>
          <div className="proposal-days" style={(proposals.completed[0][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[0][1] ?? 0} days</div>
          <div className="proposal-days1" style={(proposals.completed[1][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[1][1] ?? 0} days</div>
          <div className="proposal-days2" style={(proposals.completed[2][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[2][1] ?? 0} days</div>
          <div className="proposal-days3" style={(proposals.completed[3][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[3][1] ?? 0} days</div>
          <div className="proposal-days4" style={(proposals.completed[4][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[4][1] ?? 0} days</div>
          <div className="proposal-days5" style={(proposals.completed[5][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[5][1] ?? 0} days</div>
          <div className="proposal-days6" style={(proposals.completed[6][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[6][1] ?? 0} days</div>
          <div className="proposal-days7" style={(proposals.completed[7][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[7][1] ?? 0} days</div>
          <div className="proposal-result" style={((proposals.completed[0][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.completed[0][2] ?? ""}</div>
          <div className="proposal-result1" style={((proposals.completed[1][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.completed[1][2] ?? ""}</div>
          <div className="proposal-result2" style={((proposals.completed[2][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.completed[2][2] ?? ""}</div>
          <div className="proposal-result3" style={((proposals.completed[3][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.completed[3][2] ?? ""}</div>
          <div className="proposal-result4" style={((proposals.completed[4][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.completed[4][2] ?? ""}</div>
          <div className="proposal-result5" style={((proposals.completed[5][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.completed[5][2] ?? ""}</div>
          <div className="proposal-result6" style={((proposals.completed[6][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.completed[6][2] ?? ""}</div>
          <div className="proposal-result7" style={((proposals.completed[7][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.completed[7][2] ?? ""}</div></>
        ) 
        : proposalType === "Executed" ? (
          <><div className="proposal-1" onClick={() => handleproposalClick(proposals.executed[0][0])}>{proposals.executed[0][0]?.title  ?? ""}</div>
          <div className="proposal-2" onClick={() => handleproposalClick(proposals.executed[1][0])}>{proposals.executed[1][0]?.title  ?? ""}</div>
          <div className="proposal-3" onClick={() => handleproposalClick(proposals.executed[2][0])}>{proposals.executed[2][0]?.title  ?? ""}</div>
          <div className="proposal-4" onClick={() => handleproposalClick(proposals.executed[3][0])}>{proposals.executed[3][0]?.title  ?? ""}</div>
          <div className="proposal-5" onClick={() => handleproposalClick(proposals.executed[4][0])}>{proposals.executed[4][0]?.title  ?? ""}</div>
          <div className="proposal-6" onClick={() => handleproposalClick(proposals.executed[5][0])}>{proposals.executed[5][0]?.title  ?? ""}</div>
          <div className="proposal-7" onClick={() => handleproposalClick(proposals.executed[6][0])}>{proposals.executed[6][0]?.title  ?? ""}</div>
          <div className="proposal-8" onClick={() => handleproposalClick(proposals.executed[7][0])}>{proposals.executed[7][0]?.title  ?? ""}</div>
          <div className="proposal-days" style={(proposals.executed[0][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[0][1] ?? 0} days</div>
          <div className="proposal-days1" style={(proposals.executed[1][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[1][1] ?? 0} days</div>
          <div className="proposal-days2" style={(proposals.executed[2][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[2][1] ?? 0} days</div>
          <div className="proposal-days3" style={(proposals.executed[3][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[3][1] ?? 0} days</div>
          <div className="proposal-days4" style={(proposals.executed[4][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[4][1] ?? 0} days</div>
          <div className="proposal-days5" style={(proposals.executed[5][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[5][1] ?? 0} days</div>
          <div className="proposal-days6" style={(proposals.executed[6][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[6][1] ?? 0} days</div>
          <div className="proposal-days7" style={(proposals.executed[7][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[7][1] ?? 0} days</div>
          <div className="proposal-result" style={((proposals.executed[0][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.executed[0][2] ?? ""}</div>
          <div className="proposal-result1" style={((proposals.executed[1][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.executed[1][2] ?? ""}</div>
          <div className="proposal-result2" style={((proposals.executed[2][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.executed[2][2] ?? ""}</div>
          <div className="proposal-result3" style={((proposals.executed[3][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.executed[3][2] ?? ""}</div>
          <div className="proposal-result4" style={((proposals.executed[4][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.executed[4][2] ?? ""}</div>
          <div className="proposal-result5" style={((proposals.executed[5][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.executed[5][2] ?? ""}</div>
          <div className="proposal-result6" style={((proposals.executed[6][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.executed[6][2] ?? ""}</div>
          <div className="proposal-result7" style={((proposals.executed[7][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.executed[7][2] ?? ""}</div></>
        ) : null}
        <div className="submit-proposal-button" onClick={handlesubmitproposalForm}>
          <div className="submit-proposal" onClick={handlesubmitproposalForm}>Submit Proposal</div>
        </div>
      </div>
      <div className="btn delegate-button" onClick={() => handledelegateForm()}>
        <div className="delegate">Delegate</div>
      </div>
      <div className="total-vp-label">Total VP: </div>
      <div className="total-vp-amount">{Math.sqrt(parseInt((userVP/1_000_000).toFixed(0))).toFixed(2)}</div>
      <div className="delegated-to">Delegated To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fluid&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Comm.&nbsp;&nbsp;&nbsp;&nbsp;Undele.</div>
      <div className="claim-button-frame">        
        <div className="cdt-claims">{userClaims.cdtClaims}</div>
        <div className="mbrn-claims">{userClaims.mbrnClaims}</div>
      </div>
      <div className="btn gov-claim-button" onClick={handleclaimClick}>
        <div className="claim">Claim</div>
      </div>
      <div className="btn commission" onClick={handlecommissionChange}>{commission}% Commission</div>
      <div className="unstake-button-frame"/>
      <form>
        <input className="unstake-input" name="amount" value={unstakeAmount} type="number" onChange={handlesetunstakeAmount}/>
        <button className="btn unstake-button" type="button" onClick={handleunstakeClick}>
          <div className="unstake">Unstake:</div>
        </button>
      </form>
      <div className="stake-button-frame"/>
      <form>
        <input className="stake-input" name="amount" value={stakeAmount} type="number" onChange={handlesetstakeAmount}/>
        <button className="btn stake-button1" type="button" onClick={handlestakeClick}>
          <div className="stake">Stake:</div>
        </button>
      </form>
      <div className="status-dropdown">
        <Image className="button-icon" width={11.26} height={13.5} alt="" src="images/button.svg" />
        <div className="dropdown proposal-dropdown">
            <button onClick={handleOpen}>Proposal Status</button>
            {open ? (
                <ul className="proposal-menu">
                <li className="proposal-menu-item-active">
                    <button onClick={handleActive}>Active</button>
                </li>
                <li className="proposal-menu-item-pending">
                    <button onClick={handlePending}>Pending</button>
                </li>
                <li className="proposal-menu-item-completed">
                    <button onClick={handleCompleted}>Completed</button>
                </li>
                <li className="proposal-menu-item-executed">
                    <button onClick={handleExecuted}>Executed</button>
                </li>
                </ul>
            ) : null}
          </div>
      </div>
      <div className="proposal-axis-labels">Days Left&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Current Result</div>
      <div className="delegate-box" />
        <div className="delegate-1">{delegations[0].delegator === "" ? ("") : <>{delegations[0].delegator.slice(13)}...</>}</div>
        <div className="delegate-2">{delegations[1].delegator === "" ? ("") : <>{delegations[1].delegator.slice(13)}...</>}</div>
        <div className="delegate-3">{delegations[2].delegator === "" ? ("") : <>{delegations[2].delegator.slice(13)}...</>}</div>
        <div className="delegate-4">{delegations[3].delegator === "" ? ("") : <>{delegations[3].delegator.slice(13)}...</>}</div>
        <div className="delegate-5">{delegations[4].delegator === "" ? ("") : <>{delegations[4].delegator.slice(13)}...</>}</div>
        <div className="delegate-6">{delegations[5].delegator === "" ? ("") : <>{delegations[5].delegator.slice(13)}...</>}</div>
        <div className="delegate-7">{delegations[6].delegator === "" ? ("") : <>{delegations[6].delegator.slice(13)}...</>}</div>
        <div className="delegate-8">{delegations[7].delegator === "" ? ("") : <>{delegations[7].delegator.slice(13)}...</>}</div>
        <div className="fluid-1">{delegations[0].fluid === true ? ("Yes") : delegations[0].fluid === false ? "No" : ""}</div>
        <div className="fluid-2">{delegations[1].fluid === true ? ("Yes") : delegations[1].fluid === false ? "No" : ""}</div>
        <div className="fluid-3">{delegations[2].fluid === true ? ("Yes") : delegations[2].fluid === false ? "No" : ""}</div>
        <div className="fluid-4">{delegations[3].fluid === true ? ("Yes") : delegations[3].fluid === false ? "No" : ""}</div>
        <div className="fluid-5">{delegations[4].fluid === true ? ("Yes") : delegations[4].fluid === false ? "No" : ""}</div>
        <div className="fluid-6">{delegations[5].fluid === true ? ("Yes") : delegations[5].fluid === false ? "No" : ""}</div>
        <div className="fluid-7">{delegations[6].fluid === true ? ("Yes") : delegations[6].fluid === false ? "No" : ""}</div>
        <div className="fluid-8">{delegations[7].fluid === true ? ("Yes") : delegations[7].fluid === false ? "No" : ""}</div>
        <div className="vp-1">{delegations[0].amount !== undefined ? <>{delegations[0].amount}</> : ""}</div>
        <div className="vp-2">{delegations[1].amount !== undefined ? <>{delegations[1].amount}</> : ""}</div>
        <div className="vp-3">{delegations[2].amount !== undefined ? <>{delegations[2].amount}</> : ""}</div>
        <div className="vp-4">{delegations[3].amount !== undefined ? <>{delegations[3].amount}</> : ""}</div>
        <div className="vp-5">{delegations[4].amount !== undefined ? <>{delegations[4].amount}</> : ""}</div>
        <div className="vp-6">{delegations[5].amount !== undefined ? <>{delegations[5].amount}</> : ""}</div>
        <div className="vp-7">{delegations[6].amount !== undefined ? <>{delegations[6].amount}</> : ""}</div>
        <div className="vp-8">{delegations[7].amount !== undefined ? <>{delegations[7].amount}</> : ""}</div>
        <div className="commission-1">{delegations[0].commission !== undefined ? <>{delegations[0].commission}%</> : ""}</div>
        <div className="commission-2">{delegations[1].commission !== undefined ? <>{delegations[1].commission}%</> : ""}</div>
        <div className="commission-3">{delegations[2].commission !== undefined ? <>{delegations[2].commission}%</> : ""}</div>
        <div className="commission-4">{delegations[3].commission !== undefined ? <>{delegations[3].commission}%</> : ""}</div>
        <div className="commission-5">{delegations[4].commission !== undefined ? <>{delegations[4].commission}%</> : ""}</div>
        <div className="commission-6">{delegations[5].commission !== undefined ? <>{delegations[5].commission}%</> : ""}</div>
        <div className="commission-7">{delegations[6].commission !== undefined ? <>{delegations[6].commission}%</> : ""}</div>
        <div className="commission-8">{delegations[7].commission !== undefined ? <>{delegations[7].commission}%</> : ""}</div>
      <div className="delegate-x" />
      <div className="delegate-x1" />
      <div className="delegate-x2" />
      <div className="delegate-x3" />
      <div className="delegate-x4" />
      <div className="delegate-x5" />
      <div className="delegate-x6" />
      <div className="delegates-y1" />
      <div className="delegates-y2" />
      <div className="delegates-y3" />
      <div className="btn delegate-button-1" onClick={() => handledelegateForm(delegations[0].delegator)}/>
      <div className="btn delegate-button-2" onClick={() => handledelegateForm(delegations[1].delegator)}/>
      <div className="btn delegate-button-3" onClick={() => handledelegateForm(delegations[2].delegator)}/>
      <div className="btn delegate-button-4" onClick={() => handledelegateForm(delegations[3].delegator)}/>
      <div className="btn delegate-button-5" onClick={() => handledelegateForm(delegations[4].delegator)}/>
      <div className="btn delegate-button-6" onClick={() => handledelegateForm(delegations[5].delegator)}/>
      <div className="btn delegate-button-7" onClick={() => handledelegateForm(delegations[6].delegator)}/>
      <div className="btn delegate-button-8" onClick={() => handledelegateForm(delegations[7].delegator)}/>
      <div className="your-delegators">Your Delegators</div>
      <div className="delegators-box" />
        <div className="delegator-1">{delegators[0].delegator === "" ? ("") : <>{delegators[0].delegator.slice(13)}...</>}</div>
        <div className="delegator-2">{delegators[1].delegator === "" ? ("") : <>{delegators[1].delegator.slice(13)}...</>}</div>
        <div className="delegator-3">{delegators[2].delegator === "" ? ("") : <>{delegators[2].delegator.slice(13)}...</>}</div>
        <div className="delegator-4">{delegators[3].delegator === "" ? ("") : <>{delegators[3].delegator.slice(13)}...</>}</div>
        <div className="delegator-5">{delegators[4].delegator === "" ? ("") : <>{delegators[4].delegator.slice(13)}...</>}</div>
        <div className="delegator-6">{delegators[5].delegator === "" ? ("") : <>{delegators[5].delegator.slice(13)}...</>}</div>
        <div className="delegator-7">{delegators[6].delegator === "" ? ("") : <>{delegators[6].delegator.slice(13)}...</>}</div>
        <div className="delegator-8">{delegators[7].delegator === "" ? ("") : <>{delegators[7].delegator.slice(13)}...</>}</div>
        <div className="delegator-fluid-1">{delegators[0].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
        <div className="delegator-fluid-2">{delegators[1].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
        <div className="delegator-fluid-3">{delegators[2].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
        <div className="delegator-fluid-4">{delegators[3].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
        <div className="delegator-fluid-5">{delegators[4].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
        <div className="delegator-fluid-6">{delegators[5].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
        <div className="delegator-fluid-7">{delegators[6].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
        <div className="delegator-fluid-8">{delegators[7].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
        <div className="delegator-vp-1">{delegators[0].amount !== undefined ? <>{delegators[0].amount}</> : ""}</div>
        <div className="delegator-vp-2">{delegators[1].amount !== undefined ? <>{delegators[1].amount}</> : ""}</div>
        <div className="delegator-vp-3">{delegators[2].amount !== undefined ? <>{delegators[2].amount}</> : ""}</div>
        <div className="delegator-vp-4">{delegators[3].amount !== undefined ? <>{delegators[3].amount}</> : ""}</div>
        <div className="delegator-vp-5">{delegators[4].amount !== undefined ? <>{delegators[4].amount}</> : ""}</div>
        <div className="delegator-vp-6">{delegators[5].amount !== undefined ? <>{delegators[5].amount}</> : ""}</div>
        <div className="delegator-vp-7">{delegators[6].amount !== undefined ? <>{delegators[6].amount}</> : ""}</div>
        <div className="delegator-vp-8">{delegators[7].amount !== undefined ? <>{delegators[7].amount}</> : ""}</div>
      <div className="delegator-x" />
      <div className="delegator-x1" />
      <div className="delegator-x2" />
      <div className="delegator-x3" />
      <div className="delegator-x4" />
      <div className="delegator-x5" />
      <div className="delegator-x6" />
      <div className="delegates-y" />
      <div className="delegators-y1" />
      <div className="delegators-y2" />
      <div className="staked-mbrn1">{parseFloat((userStake.staked/1_000_000).toFixed(2))}</div>
      <div className="unstaking-mbrn">{parseFloat((userStake.unstaking.amount/1_000_000).toFixed(2))}</div>
      <div className="mbrn-stake-logo">
        <Image className="logo-icon1  logo-shiftDown" width={43} height={48} alt="" src="/images/Logo.svg" />
      </div>
      <div className="mbrn-unstake-logo">
      <Image className="logo-icon1  logo-shiftDown" width={43} height={48} alt="" src="/images/Logo.svg" />
      </div>
      <div className="mbrn-claim-logo">
      <Image className="logo-icon1" width={43} height={48} alt="" src="/images/Logo.svg" />
      </div>
      {userStake.unstaking.amount !== 0 ? (<div className="unstaking-progress-bar" >
        <ProgressBar bgcolor="#50C9BD" progress={parseFloat((((unstakingPeriod - userStake.unstaking.timeLeft) / unstakingPeriod) * 100).toFixed(2))}  height={20} />
      </div>) : null}
      {(emissionsSchedule.rate !== 0 && emissionsSchedule.monthsLeft !== 0) ? 
      (<div className="emissions-schedule">{emissionsSchedule.rate}%/{emissionsSchedule.monthsLeft} months</div>)
      : null}
      <Image className="cdt-logo-icon" width={45} height={45} alt="" src="/images/CDT.svg" />      
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </div>    
  );
};

export default Governance;
