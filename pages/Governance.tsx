import { useEffect, useState } from "react";
import ProgressBar from "../components/progress_bar";
import { GovernanceClient } from "../codegen/governance/Governance.client";
import { StakingClient, StakingQueryClient } from '../codegen/staking/Staking.client';
import { ProposalResponse, ProposalMessage, VoteOption, ProposalVoteOption } from "../codegen/governance/Governance.types";
import Popup from "../components/Popup";
import WidgetPopup from "../components/widgetPopup";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { coins } from "@cosmjs/stargate";
import { BLOCK_TIME_IN_SECONDS, SECONDS_PER_DAY, unstakingPeriod } from ".";
import { denoms } from "../config";
import React from "react";
import Image from "next/image";
import { useChain } from "@cosmos-kit/react";
import { chainName, Delegate, delegateList, quadraticVoting } from "../config";
import { VestingClient } from "../codegen/vesting/Vesting.client";
import { IoTrophyOutline } from "react-icons/io5";

const VOTING_PERIOD_IN_SECONDS = 7 * 86400;//

export interface Delegation {
  delegator: string;
  fluid: boolean | undefined;
  amount: number | undefined;
  commission: number | undefined;
}
export interface Delegator {
  delegator: string;
  fluid: boolean | undefined;
  amount: number | undefined;
}
export interface ProposalList {
  active: [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][];
  pending: [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][];
  completed: [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][];
  executed: [ProposalResponse | undefined, number | undefined, string | undefined, number | undefined][];
}
export interface EmissionsSchedule {
  rate: number;
  monthsLeft: number;
}
export interface UserStake {
  staked: number;
  unstaking_total: number;
  unstaking: {
    amount: number;
    timeLeft: number;
  };
}
export interface UserClaims {
  mbrnClaims: number;
  cdtClaims: number;
}
export interface UserVP {
  userStake: number;
  userDelegations: number;
}
interface Props {
  govClient: GovernanceClient | null;
  stakingClient: StakingClient | null;
  stakingQueryClient: StakingQueryClient | null;
  vestingClient: VestingClient | null;
  address: string | undefined;
  Delegations: Delegation[];
  Delegators: Delegator[];
  quorum: number;
  setQuorum: (quorum: number) => void;
  maxCommission: number;
  setmaxCommission: (maxCommission: number) => void;
  Proposals: ProposalList;
  UserVP: UserVP;
  EmissionsSchedule: EmissionsSchedule;
  UserStake: UserStake;
  UserClaims: UserClaims;
  WalletMBRN: number;
}

const Governance = ({govClient, stakingClient, stakingQueryClient, vestingClient, address,
  Delegations, Delegators, quorum, setQuorum, maxCommission, setmaxCommission, Proposals, UserVP, EmissionsSchedule, UserStake, UserClaims, WalletMBRN
}: Props) => {
  const { connect } = useChain(chainName);
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [popupMsg, setPopupMsg] = useState<ReactJSXElement>();
  const [popupStatus, setPopupStatus] = useState("");
  //Proposal List//
  const [open, setOpen] = useState(false);
  const [proposalType, setproposalType] = useState("Active");
  const [proposalColor, setproposalColor] = useState("#567c39");
  const [stakeAmount, setstakeAmount] = useState();
  const [unstakeAmount, setunstakeAmount] = useState();

  const [commission, setCommission] = useState(0);
  
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
  //Proposal, Days left, Current Status, Quorum 
  const [proposals, setProposals] = useState<ProposalList>({
    active: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
    pending: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
    completed: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
    executed: [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]],
});
  //Staking//
  //Emissions Schedule
  const [emissionsSchedule, setEmissionsSchedule] = useState<EmissionsSchedule>({
    rate: 0,
    monthsLeft: 0,
  })
  const [userStake, setUserStake] = useState<UserStake>({
    staked: 0,
    unstaking_total: 0,
    unstaking: {
      amount: 0,
      timeLeft: 0,
    },
  });
  const [userClaims, setuserClaims] = useState<UserClaims>({
    mbrnClaims: 0,
    cdtClaims: 0,
  });
  const [userVP, setuserVP] = useState({
    userStake: 0,
    userDelegations: 0,
  });
  const [walletMBRN, setwalletMBRN] = useState(0);


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
  const handleproposalClick = async (proposal: ProposalResponse | undefined, quorum: number | undefined) => {
    if (proposal !== undefined) {
      //Calc total votes
      var total_votes = parseInt(proposal.for_power) + parseInt(proposal.against_power) + parseInt(proposal.amendment_power) + parseInt(proposal.removal_power);
      if (total_votes === 0) {
        total_votes = 1;
      }
      //Calc ratios
      var for_ratio = ((parseInt(proposal.for_power) / total_votes) * 100).toFixed(2) + "%";
      var against_ratio = ((parseInt(proposal.against_power) / total_votes) * 100).toFixed(2) + "%";
      // var aligned_ratio = ((parseInt(proposal.aligned_power) / total_votes+1) * 100).toString() + "%";
      var amend_ratio = ((parseInt(proposal.amendment_power) / total_votes) * 100).toFixed(2) + "%";
      var removal_ratio = ((parseInt(proposal.removal_power) / total_votes) * 100).toFixed(2) + "%";
      //Format links
      var label = "";
      if (proposal.link?.includes("commonwealth")) {
        label = "CommonWealth"
      } else if (proposal.link?.includes("discord")){
        label = "Discord"
      }
      //Get daysLeft
      var daysPast = (Date.now() / 1000) - proposal.start_time;
      var daysLeft = (VOTING_PERIOD_IN_SECONDS - daysPast) / SECONDS_PER_DAY;
      if (daysLeft < 0) {
        daysLeft = 0;
      }
      //Get user vote
      var userVote = "N/A";
      
      await govClient?.proposal({proposalId: parseInt(proposal.proposal_id)}).then( (voters) => {
        voters.for_voters.forEach((vote) => {
          if (vote === address) {
            userVote = "For";
            console.log(vote)
          }
        })
        if (userVote === "N/A") {
          voters.aligned_voters.forEach((vote) => {
            if (vote === address) {
              userVote = "Align";
            }
          })
        }
        if (userVote === "N/A") {
          voters.amendment_voters.forEach((vote) => {
            if (vote === address) {
              userVote = "Amend";
            }
          })
        }
        if (userVote === "N/A") {
          voters.against_voters.forEach((vote) => {
            if (vote === address) {
              userVote = "Against";
            }
          })
        }
        if (userVote === "N/A") {
          voters.removal_voters.forEach((vote) => {
            if (vote === address) {
              userVote = "Remove";
            }
          })
        }
      })          
      
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<p>
        <div>
          Description: {proposal.description}
        </div>
        <div onClick={()=>
          {if (proposal.link !== undefined) {
            window.open(proposal.link as string)
          }}} style={{cursor:"pointer"}}>
          Links: {label}
        </div>
        <div>
          Msgs: {proposal.messages?.toString() ?? "None"}
        </div>
        <div className="vote-options">
          <button className="vote-buttons" style={{outline: "none"}} onClick={()=> handleVote(parseInt(proposal.proposal_id), "for")}>For: {for_ratio}</button> 
          <button className="vote-buttons" style={{outline: "none"}} onClick={()=> handleVote(parseInt(proposal.proposal_id), "against")}>Against: {against_ratio} </button>
          <button className="vote-buttons" style={{outline: "none"}} onClick={()=> handleVote(parseInt(proposal.proposal_id), "amend")}>Amend: {amend_ratio} </button>
          <button className="vote-buttons" style={{outline: "none"}} onClick={()=> handleVote(parseInt(proposal.proposal_id), "align")}>Align</button>
          <button className="vote-buttons" style={{outline: "none"}} onClick={()=> handleVote(parseInt(proposal.proposal_id), "remove")}>Remove: {removal_ratio} </button>
        </div>
        <div className="vote-total">Your Vote: {userVote} - {quadraticVoting === true ? (Math.sqrt(userVP.userStake) + userVP.userDelegations).toFixed(0) : (userVP.userDelegations + userVP.userStake).toFixed(0)} VP &nbsp;&nbsp; Quorum: {(parseFloat((quorum??0).toFixed(2)) * 100).toFixed(0)}% &nbsp;&nbsp;&nbsp; Days Left: {daysLeft?.toFixed(2) ?? ""}</div>      
      </p>
      )
      setPopupStatus(proposal.title)
    }
  }
  const handleVote = async (proposalId: number, vote: ProposalVoteOption) => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      setPopupTrigger(false);
      return;
    }
    try {
      await govClient?.castVote({
        proposalId,
        vote,
      },"auto", undefined
      ).then((res) => {
        console.log(res)
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Voted</div>)
        setPopupStatus("Success")
      })
    
    } catch (error) {
      console.log(error)
      let e = error as {message: string};
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Voted</div>)
        setPopupStatus("Success")
      } else {
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>{e.message}</div>)
        setPopupStatus("Error")
      }
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
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Submitted</div>)
        setPopupStatus("Success")
      } else {
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>{e.message}</div>)
        setPopupStatus("Error")
      }
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
            <input style={{position: "absolute",height: 55}} name="msg" defaultValue={""} type="file" accept="application/json" onChange={(event)=>{
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
  



  const handlestakeClick = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      return;
    }
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
            //@ts-ignore
        setUserStake(prevState => {
          return {
            ...prevState,
            staked: +prevState.staked + +((stakeAmount ?? 0)* 1_000_000),
          }
        })
      })
    } catch (error) {
      console.log(error)
      const e = error as {message: string};
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Staked</div>)
        setPopupStatus("Success")
        //Update user stake
            //@ts-ignore
        setUserStake(prevState => {
          return {
            ...prevState,
            staked: +prevState.staked + +((stakeAmount ?? 0)* 1_000_000),
          }
        })
      } else {
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>{e.message}</div>)
        setPopupStatus("Error")
      }
    }
  }

  const handleunstakeClick = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      return;
    }
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
        if (userStake.unstaking.amount === 0) {
          //@ts-ignore
          setUserStake(prevState => {
            return {              
              staked: +prevState.staked - +((unstakeAmount ?? 0)* 1_000_000),
              unstaking_total: +prevState.unstaking_total + +((unstakeAmount ?? 0)* 1_000_000),
              unstaking: {
                amount: +prevState.unstaking.amount + +((unstakeAmount ?? 0)* 1_000_000),
                timeLeft: unstakingPeriod,
              }
            }
          })
        } else {
          //If there is already an unstaking deposit, don't change it
            //@ts-ignore
          setUserStake(prevState => {
            return {
              ...prevState,
              unstaking_total: +prevState.unstaking_total + +((unstakeAmount ?? 0)* 1_000_000),
              staked: +prevState.staked - +((unstakeAmount ?? 0)* 1_000_000),
            }
          })
        }

      })
    } catch (error) {
      console.log(error)
      const e = error as {message: string};
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Unstaked</div>)
        setPopupStatus("Success")
        //Update user stake
        if (userStake.unstaking.amount === 0) {
          //@ts-ignore
          setUserStake(prevState => {
            return {              
              staked: +prevState.staked - +((unstakeAmount ?? 0)* 1_000_000),
              unstaking_total: +prevState.unstaking_total + +((unstakeAmount ?? 0)* 1_000_000),
              unstaking: {
                amount: +prevState.unstaking.amount + +((unstakeAmount ?? 0)* 1_000_000),
                timeLeft: unstakingPeriod,
              }
            }
          })
        } else {
          //If there is already an unstaking deposit, don't change it
            //@ts-ignore
          setUserStake(prevState => {
            return {
              ...prevState,
              unstaking_total: +prevState.unstaking_total + +((unstakeAmount ?? 0)* 1_000_000),
              staked: +prevState.staked - +((unstakeAmount ?? 0)* 1_000_000),
            }
          })
        }
      } else {
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>{e.message}</div>)
        setPopupStatus("Error")
      }
    }
  }
  const handleclaimClick = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      return;
    }
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
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Claimed</div>)
        setPopupStatus("Success")
      } else {
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>{e.message}</div>)
        setPopupStatus("Error")
      }
    }
  }
  const handledelegateForm = (fluid: boolean, vp: boolean, delegate: boolean, delegate_index?: number, var_governator?: string) => {
    //Initialize variables
    var stored_governator: Delegate;
    if (var_governator === undefined) {
      var_governator = "";
      stored_governator = {
        address: "",
        name: "",
        socials: ["", ""],
      };
    } else {
      stored_governator = findDelegate(var_governator);
    }
    var amount: string;
    //format popup message
    setPopupTrigger(true)
    //Customize based on delegate or not
    if (delegate === true) {      
      setPopupStatus("Delegate")
    } else {  
      setPopupStatus("Undelegate")
    }
    setPopupMsg(<p>        
      <form onSubmit={(event) => {
        console.log("delegate attempt")
          event.preventDefault();
          handledelegateSubmission(delegate, fluid, stored_governator.address, amount, vp)
        }}>  
        {/*Governator*/}
        <div>
          <label style={{color: "aqua"}}>Delegate:</label>     
          <input name="governator" defaultValue={var_governator} type="string" onChange={(event)=>{
            event.preventDefault();
            stored_governator.address = event.target.value;
          }}/>
        </div>
        {/*Amount*/}
        <div>
          { delegate === true ? 
            <label style={{color: "aqua"}}>Delegation amount ({((userStake.staked ?? 0)/1_000000).toFixed(0)} staked):</label> : 
            delegate_index === undefined ?
            <label style={{color: "aqua"}}>Undelegation amount:</label>
            : <label style={{color: "aqua"}}>Undelegation amount ({((delegations[delegate_index].amount ))} delegated):</label>
            }
        
          <input name="amount" type="number" onChange={(event)=>{
            event.preventDefault();
            amount = (event.target.value).toString();
          }}/>
        </div>
        <p>The delegate can redelegate your delegations but you always retain final control. You also cannot supersede your delegates vote during a proposal so choose wisely.</p>
        {/*Delegate*/}
        {/* <label style={{color: "aqua"}}>Delegate?</label>     
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
          }}/> */}
          {/*Fluidity*/}
          {/* <label style={{color: "aqua"}}>Do you grant your governator the ability to delegate your delegation?(Y/n)</label>     
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
          }}/>  */}
          {/*VP delegation*/}
          {/* <div>
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
        </div> */}
          <button className="btn" style={{position: "absolute", top: 150, right: 100, backgroundColor:"gray"}} type="submit">
            <div >
              Submit
            </div>
          </button>
          {/* Don't show fluid options if user has no delegations */}
          {userVP.userDelegations > 0 ? <button className="btn" style={{position: "absolute", opacity:0.7, top: 20, right: 100, backgroundColor:"gray"}} type="button" onClick={()=>{
            setPopupMsg(<p>        
              <form onSubmit={(event) => {
                  event.preventDefault();
                  handlefluiddelegationSubmission(stored_governator.address, amount)
                }}>  
                {/*Governator*/}
                <div>
                  <label style={{color: "aqua"}}>Delegate:</label>     
                  <input name="governator" defaultValue={var_governator} type="string" onChange={(event)=>{
                    event.preventDefault();
                    stored_governator.address = event.target.value;
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
                  <button className="btn" style={{position: "absolute", opacity:0.7, top: 20, right: 100, backgroundColor:"gray"}} type="button" onClick={() => handledelegateForm(true, true, true)}>
                    <div >
                      Switch to your delegations
                    </div>
                  </button>
                  <button className="btn" style={{position: "absolute", top: 150, right: 100, backgroundColor:"gray"}} type="submit">
                    <div >
                      Submit
                    </div>
                  </button>
              </form>
            </p>
            )
          }}>
            <div >
              Switch to your Fluid delegations
            </div>
          </button> : null}
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
      
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      setPopupTrigger(false);
      connect();
      return    
    }

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
        
        //Update delegation info
        delegations.forEach((element, index) => {
          if (element.delegator === governator) {
            if (delegations[index].amount !== undefined){
              //@ts-ignore
              delegations[index].amount += parseInt(amount ?? "0") * 1_000_000;
            } else {
              delegations[index].amount = parseInt(amount ?? "0") * 1_000_000;
            }             
            delegations[index].fluid = fluid;
          }
        })
      })
    } catch (error) {
      console.log(error)
      let e = error as {message: string};
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Delegation to {governator} updated</div>)
        setPopupStatus("Success")
        
        //Update delegation info
        delegations.forEach((element, index) => {
          if (element.delegator === governator) {
            if (delegations[index].amount !== undefined){
              //@ts-ignore
              delegations[index].amount += parseInt(amount ?? "0") * 1_000_000;
            } else {
              delegations[index].amount = parseInt(amount ?? "0") * 1_000_000;
            }             
            delegations[index].fluid = fluid;
          }
        })
      } else {
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>{e.message}</div>)
        setPopupStatus("Error")
      }
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
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>Delegation to {governator} updated</div>)
        setPopupStatus("Success")
      } else {
        //format popup message
        setPopupTrigger(true)
        setPopupMsg(<div>{e.message}</div>)
        setPopupStatus("Error")
      }
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
              setCommission(parseInt(commission) * 100) //Commission is a % so multiply by 100
            })
          } catch (error) {
            console.log(error)
            let e = error as {message: string};
            //This is a success msg but a cosmjs error
            if (e.message === "Invalid string. Length must be a multiple of 4"){
              //format popup message
              setPopupTrigger(true)
              setPopupMsg(<div>Commission changed</div>)
              setPopupStatus("Success")
              setCommission(parseInt(commission) * 100) //Commission is a % so multiply by 100
            } else {
              //format popup message
              setPopupTrigger(true)
              setPopupMsg(<div>{e.message}</div>)
              setPopupStatus("Error")
            }
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
        var delegationVP = 0;
        //Set max parse
        var max_parse = Math.min(res[0].delegation_info.delegated_to.length, 8)

        //Set delegations
        for (let i = 0; i < max_parse; i++) {
          delegations[i].amount = parseInt(res[i].delegation_info.delegated_to[i].amount)
          delegations[i].delegator = res[i].delegation_info.delegated_to[i].delegate
          delegations[i].fluid = res[i].delegation_info.delegated_to[i].fluidity
          //Subtract from user VP
          if (res[i].delegation_info.delegated_to[i].voting_power_delegation === true) {
            delegationVP -= parseInt(res[i].delegation_info.delegated_to[i].amount)
          }
          //Query and set commission
          await stakingQueryClient?.delegations({
            user: res[i].delegation_info.delegated_to[i].delegate,
          }).then((res) => {
            delegations[i].commission = parseInt(res[0].delegation_info.commission) * 100 //Commission is a % so multiply by 100
          })
        }
        
        //Set max parse
        var max_parse = Math.min(res[0].delegation_info.delegated.length, 8)
        //Set Delegators
        for (let i = 0; i < max_parse; i++) {
          delegators[i].amount = parseInt(res[i].delegation_info.delegated[i].amount)
          delegators[i].delegator = res[i].delegation_info.delegated[i].delegate
          delegators[i].fluid = res[i].delegation_info.delegated[i].fluidity
          
          //Add to user total VP
          if (res[i].delegation_info.delegated[i].voting_power_delegation === true) {
            delegationVP += parseInt(res[i].delegation_info.delegated_to[i].amount)
          }          
          //Add to user total VP
            //@ts-ignore
          setuserVP(prevState => {
            return {
              ...prevState,
              userDelegations: prevState.userDelegations + delegationVP
            }
          })
        }
        //Set delegations
        setDelegations(delegations)
        //Set delegators
        setDelegators(delegators)
      })

    } catch (error) {
      console.log(error)
    }
  }

  function findDelegate(delegate: string) {
    var found: Delegate = {
      address: "",
      name: "",
      socials: ["", ""],
    };

    delegateList.forEach((element, index) => {
      if (element.name === delegate) {
        found = element;
      }
    })
    if (found.address === "") {
      found.address = delegate;
    }

    //This returns the delegate's address if not found in the delegateList
    return found;
  }

  function showDelegateInfo(delegate: string) {
    let stored_delegate = findDelegate(delegate);
    //Set cursor to progress
    document.body.style.cursor = "progress";
    //Set twitter link    
    var link = "https://twitter.com/" + stored_delegate.socials[0];
    //Query delegate commission & total delegations
    stakingQueryClient?.delegations({
      user: stored_delegate.address,
    }).then((res) => {
      //Calc total delegations
      var total_delegations = 0;
      res[0].delegation_info.delegated.forEach((element) => {
        total_delegations += parseInt(element.amount);
      })

      //Set cursor to default
      document.body.style.cursor = "default";
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<>
      <div onClick={()=>window.open(link)} style={{textDecoration:"underline", cursor:"pointer"}}>Twitter: {stored_delegate.socials[0]}</div>
      <div>Discord: {stored_delegate.socials[1]}</div>
      <div>Total Delegated: {total_delegations/1_000000} MBRN</div>
      <div>Commission: {parseInt(res[0].delegation_info.commission) * 100}%</div>
      
      </>)
      setPopupStatus("Delegate Info")
    }).catch((error) => {
      console.log(error)
      //Set cursor to default
      document.body.style.cursor = "default";
      //format popup message
      setPopupTrigger(true)
      setPopupMsg(<>
      <div onClick={()=>window.open(link)} style={{textDecoration:"underline", cursor:"pointer"}}>Twitter: {stored_delegate.socials[0]}</div>
      <div>Discord: {stored_delegate.socials[1]}</div>
      <div>Total Delegated: N/A</div>
      <div>Commission: 0%</div>
      </>)
      setPopupStatus("Delegate Info")
    })

  }

  useEffect(() => {
    //Set incoming state form index.tsx
    setProposals(Proposals)
    setEmissionsSchedule(EmissionsSchedule)
    setUserStake(UserStake)
    setuserClaims(UserClaims)
    setDelegations(Delegations)
    setwalletMBRN(WalletMBRN)
    setuserVP(UserVP)
  }, [Proposals, EmissionsSchedule, UserStake, UserClaims, Delegations, Delegators, WalletMBRN, UserVP]);
      
  return (
    <div className="page-frame governance">
      <div className="pagetitle-gov">
        Governance
        <Image className="gov-icon" width={43} height={48} alt="" src="/images/staking.svg" />  
        {/* <div className="total-vp-frame">
          <div className="total-vp-label">Total VP: </div>
          <div className="total-vp-amount">{quadraticVoting === true ? Math.sqrt(userVP.userStake) + userVP.userDelegations : userVP.userDelegations + userVP.userStake}</div>
        </div> */}
      </div>  
      <div className="button-frames">
        <div className="stake-button-frame">
          <div className="staked-mbrn-frame">
            <div className="staked-mbrn1">Staked: {parseFloat((userStake.staked/1_000_000).toFixed(2))}</div>
            <div className="emissions-schedule">{emissionsSchedule.rate}%/{emissionsSchedule.monthsLeft.toFixed(2)} months</div>            
            <div className="staked-mbrn2">in Wallet: {walletMBRN.toFixed(2)}</div>
          </div>
          <form style={{position: "relative", bottom: "10%"}}>
            <input className="stake-input" name="amount" value={stakeAmount} type="number" onChange={handlesetstakeAmount}/>
            <button className="btn stake-button1" type="button" onClick={handlestakeClick}>
              <div className="stake" data-tvl="Unstaking is currently broken">Stake:</div>
            </button>
          </form>
        </div>  
        <div className="unstake-button-frame">
          <form style={{top: "5%", position: "relative"}}>
            <input className="unstake-input" name="amount" value={unstakeAmount} type="number" onChange={handlesetunstakeAmount}/>
            <button className="btn unstake-button" type="button" onClick={handleunstakeClick}>
              <div className="unstake">Unstake:</div>
            </button>
          </form>
          <div className="unstaked-mbrn-frame">
            <div className="unstaking-mbrn">{parseFloat((userStake.unstaking.amount/1_000_000).toFixed(2))}</div>
            <div className="unstaking-mbrn-total">{"/" + parseFloat((userStake.unstaking_total/1_000_000).toFixed(2))}</div> 
            <div className="unstaking-progress-bar" >
              <ProgressBar bgcolor="#50C9BD" noMargin={true} progress={userStake.unstaking.amount !== 0 ? parseFloat((((unstakingPeriod - userStake.unstaking.timeLeft) / unstakingPeriod) * 100).toFixed(2)) : 0}  height={20} />
            </div>
          </div>                   
          <Image className="mbrn-unstake-logo" width={43} height={43} alt="" src="/images/Logo.svg" />
        </div>
        <div className="claim-button-frame">        
          <div className="btn gov-claim-button" onClick={handleclaimClick}>
            <div className="claim">Claim</div>
          </div>
          <div className="claims-frame">
            <div style={{display: "flex", flexDirection: "row", position: "relative", justifyContent: "center"}}>
              <div className="cdt-claims">{userClaims.cdtClaims}</div>
              <Image width={43} height={48} alt="" src="/images/CDT.svg" />
            </div>
            <div style={{display: "flex", flexDirection: "row", position: "relative", justifyContent: "center"}}>
              <div className="mbrn-claims">{userClaims.mbrnClaims}</div>
              <Image width={43} height={48} alt="" src="/images/Logo.svg" />
            </div>
          </div>
        </div>
      </div>
      <div className="proposals-delegations">
        <div className="proposals-frame">
        <div className="status-dropdown">
          <div className="dropdown proposal-dropdown">
              <button onClick={handleOpen} style={{outline: "none"}}>Proposal Status</button>
              {open ? (
                  <ul className="proposal-menu">
                  <li className="proposal-menu-item-active">
                      <button onClick={handleActive} style={{outline: "none"}}>Active</button>
                  </li>
                  <li className="proposal-menu-item-pending">
                      <button onClick={handlePending} style={{outline: "none"}}>Pending</button>
                  </li>
                  <li className="proposal-menu-item-completed">
                      <button onClick={handleCompleted} style={{outline: "none"}}>Completed</button>
                  </li>
                  <li className="proposal-menu-item-executed">
                      <button onClick={handleExecuted} style={{outline: "none"}}>Executed</button>
                  </li>
                  </ul>
              ) : null}
            </div>
        </div>
        <div className="proposal-axis-labels">Current Result</div>
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
          <><div className="proposal-1" onClick={() => handleproposalClick(proposals.active[0][0], proposals.active[0][3])}>{proposals.active[0][0]?.title ?? ""}</div>
          <div className="proposal-2" onClick={() => handleproposalClick(proposals.active[1][0], proposals.active[1][3])}>{proposals.active[1][0]?.title  ?? ""}</div>
          <div className="proposal-3" onClick={() => handleproposalClick(proposals.active[2][0], proposals.active[2][3])}>{proposals.active[2][0]?.title  ?? ""}</div>
          <div className="proposal-4" onClick={() => handleproposalClick(proposals.active[3][0], proposals.active[3][3])}>{proposals.active[3][0]?.title  ?? ""}</div>
          <div className="proposal-5" onClick={() => handleproposalClick(proposals.active[4][0], proposals.active[4][3])}>{proposals.active[4][0]?.title  ?? ""}</div>
          <div className="proposal-6" onClick={() => handleproposalClick(proposals.active[5][0], proposals.active[5][3])}>{proposals.active[5][0]?.title  ?? ""}</div>
          <div className="proposal-7" onClick={() => handleproposalClick(proposals.active[6][0], proposals.active[6][3])}>{proposals.active[6][0]?.title  ?? ""}</div>
          <div className="proposal-8" onClick={() => handleproposalClick(proposals.active[7][0],  proposals.active[7][3])}>{proposals.active[7][0]?.title  ?? ""}</div>
          {/* <div className="proposal-days" style={(proposals.active[0][3] === undefined ) ? {opacity:0} : undefined}>{(proposals.active[0][1] ?? 0) <= 0 ? "" : (proposals.active[0][1]??0).toFixed(2)}</div>
          <div className="proposal-days1" style={(proposals.active[1][3] === undefined ) ? {opacity:0} : undefined}>{(proposals.active[1][1] ?? 0) <= 0 ? "" : (proposals.active[1][1]??0).toFixed(2)}</div>
          <div className="proposal-days2" style={(proposals.active[2][3] === undefined ) ? {opacity:0} : undefined}>{(proposals.active[2][1] ?? 0) <= 0 ? "" : (proposals.active[2][1]??0).toFixed(2)}</div>
          <div className="proposal-days3" style={(proposals.active[3][3] === undefined ) ? {opacity:0} : undefined}>{(proposals.active[3][1] ?? 0) <= 0 ? "" : (proposals.active[3][1]??0).toFixed(2)}</div>
          <div className="proposal-days4" style={(proposals.active[4][3] === undefined ) ? {opacity:0} : undefined}>{(proposals.active[4][1] ?? 0) <= 0 ? "" : (proposals.active[4][1]??0).toFixed(2)}</div>
          <div className="proposal-days5" style={(proposals.active[5][3] === undefined ) ? {opacity:0} : undefined}>{(proposals.active[5][1] ?? 0) <= 0 ? "" : (proposals.active[5][1]??0).toFixed(2)}</div>
          <div className="proposal-days6" style={(proposals.active[6][3] === undefined ) ? {opacity:0} : undefined}>{(proposals.active[6][1] ?? 0) <= 0 ? "" : (proposals.active[6][1]??0).toFixed(2)}</div>
          <div className="proposal-days7" style={(proposals.active[7][3] === undefined ) ? {opacity:0} : undefined}>{(proposals.active[7][1] ?? 0) <= 0 ? "" : (proposals.active[7][1]??0).toFixed(2)}</div> */}
          <div className="proposal-result" style={((proposals.active[0][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[0][2] ?? ""}</div>
          <div className="proposal-result1" style={((proposals.active[1][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[1][2] ?? ""}</div>
          <div className="proposal-result2" style={((proposals.active[2][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[2][2] ?? ""}</div>
          <div className="proposal-result3" style={((proposals.active[3][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[3][2] ?? ""}</div>
          <div className="proposal-result4" style={((proposals.active[4][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[4][2] ?? ""}</div>
          <div className="proposal-result5" style={((proposals.active[5][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[5][2] ?? ""}</div>
          <div className="proposal-result6" style={((proposals.active[6][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[6][2] ?? ""}</div>
          <div className="proposal-result7" style={((proposals.active[7][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.active[7][2] ?? ""}</div></>) 
          : proposalType === "Pending" ? (
            <><div className="proposal-1" onClick={() => handleproposalClick(proposals.pending[0][0], proposals.pending[0][3])}>{proposals.pending[0][0]?.title  ?? ""}</div>
            <div className="proposal-2" onClick={() => handleproposalClick(proposals.pending[1][0], proposals.pending[1][3])}>{proposals.pending[1][0]?.title  ?? ""}</div>
            <div className="proposal-3" onClick={() => handleproposalClick(proposals.pending[2][0], proposals.pending[2][3])}>{proposals.pending[2][0]?.title  ?? ""}</div>
            <div className="proposal-4" onClick={() => handleproposalClick(proposals.pending[3][0], proposals.pending[3][3])}>{proposals.pending[3][0]?.title  ?? ""}</div>
            <div className="proposal-5" onClick={() => handleproposalClick(proposals.pending[4][0], proposals.pending[4][3])}>{proposals.pending[4][0]?.title  ?? ""}</div>
            <div className="proposal-6" onClick={() => handleproposalClick(proposals.pending[5][0], proposals.pending[5][3])}>{proposals.pending[5][0]?.title  ?? ""}</div>
            <div className="proposal-7" onClick={() => handleproposalClick(proposals.pending[6][0], proposals.pending[6][3])}>{proposals.pending[6][0]?.title  ?? ""}</div>
            <div className="proposal-8" onClick={() => handleproposalClick(proposals.pending[7][0], proposals.pending[7][3])}>{proposals.pending[7][0]?.title  ?? ""}</div>
            {/* <div className="proposal-days" style={(proposals.pending[0][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[0][1] ?? 0} days</div>
            <div className="proposal-days1" style={(proposals.pending[1][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[1][1] ?? 0} days</div>
            <div className="proposal-days2" style={(proposals.pending[2][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[2][1] ?? 0} days</div>
            <div className="proposal-days3" style={(proposals.pending[3][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[3][1] ?? 0} days</div>
            <div className="proposal-days4" style={(proposals.pending[4][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[4][1] ?? 0} days</div>
            <div className="proposal-days5" style={(proposals.pending[5][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[5][1] ?? 0} days</div>
            <div className="proposal-days6" style={(proposals.pending[6][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[6][1] ?? 0} days</div>
            <div className="proposal-days7" style={(proposals.pending[7][3] === undefined ) ? {opacity:0} : undefined}>{proposals.pending[7][1] ?? 0} days</div> */}
            <div className="proposal-result" style={((proposals.pending[0][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[0][2] ?? ""}</div>
            <div className="proposal-result1" style={((proposals.pending[1][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[1][2] ?? ""}</div>
            <div className="proposal-result2" style={((proposals.pending[2][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[2][2] ?? ""}</div>
            <div className="proposal-result3" style={((proposals.pending[3][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[3][2] ?? ""}</div>
            <div className="proposal-result4" style={((proposals.pending[4][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[4][2] ?? ""}</div>
            <div className="proposal-result5" style={((proposals.pending[5][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[5][2] ?? ""}</div>
            <div className="proposal-result6" style={((proposals.pending[6][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[6][2] ?? ""}</div>
            <div className="proposal-result7" style={((proposals.pending[7][3] ?? 0) < quorum) ? {opacity:0.3} : undefined}>{proposals.pending[7][2] ?? ""}</div></>) 
          : proposalType === "Completed" ? (
            <><div className="proposal-1" onClick={() => handleproposalClick(proposals.completed[0][0], proposals.completed[0][3])}>{proposals.completed[0][0]?.title  ?? ""}</div>
            <div className="proposal-2" onClick={() => handleproposalClick(proposals.completed[1][0], proposals.completed[1][3])}>{proposals.completed[1][0]?.title  ?? ""}</div>
            <div className="proposal-3" onClick={() => handleproposalClick(proposals.completed[2][0], proposals.completed[2][3])}>{proposals.completed[2][0]?.title  ?? ""}</div>
            <div className="proposal-4" onClick={() => handleproposalClick(proposals.completed[3][0], proposals.completed[3][3])}>{proposals.completed[3][0]?.title  ?? ""}</div>
            <div className="proposal-5" onClick={() => handleproposalClick(proposals.completed[4][0], proposals.completed[4][3])}>{proposals.completed[4][0]?.title  ?? ""}</div>
            <div className="proposal-6" onClick={() => handleproposalClick(proposals.completed[5][0], proposals.completed[5][3])}>{proposals.completed[5][0]?.title  ?? ""}</div>
            <div className="proposal-7" onClick={() => handleproposalClick(proposals.completed[6][0], proposals.completed[6][3])}>{proposals.completed[6][0]?.title  ?? ""}</div>
            <div className="proposal-8" onClick={() => handleproposalClick(proposals.completed[7][0], proposals.completed[7][3])}>{proposals.completed[7][0]?.title  ?? ""}</div>
            {/* <div className="proposal-days" style={(proposals.completed[0][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[0][1] ?? 0} days</div>
            <div className="proposal-days1" style={(proposals.completed[1][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[1][1] ?? 0} days</div>
            <div className="proposal-days2" style={(proposals.completed[2][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[2][1] ?? 0} days</div>
            <div className="proposal-days3" style={(proposals.completed[3][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[3][1] ?? 0} days</div>
            <div className="proposal-days4" style={(proposals.completed[4][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[4][1] ?? 0} days</div>
            <div className="proposal-days5" style={(proposals.completed[5][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[5][1] ?? 0} days</div>
            <div className="proposal-days6" style={(proposals.completed[6][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[6][1] ?? 0} days</div>
            <div className="proposal-days7" style={(proposals.completed[7][3] === undefined ) ? {opacity:0} : undefined}>{proposals.completed[7][1] ?? 0} days</div> */}
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
            <><div className="proposal-1" onClick={() => handleproposalClick(proposals.executed[0][0], proposals.executed[0][3])}>{proposals.executed[0][0]?.title  ?? ""}</div>
            <div className="proposal-2" onClick={() => handleproposalClick(proposals.executed[1][0], proposals.executed[1][3])}>{proposals.executed[1][0]?.title  ?? ""}</div>
            <div className="proposal-3" onClick={() => handleproposalClick(proposals.executed[2][0], proposals.executed[2][3])}>{proposals.executed[2][0]?.title  ?? ""}</div>
            <div className="proposal-4" onClick={() => handleproposalClick(proposals.executed[3][0], proposals.executed[3][3])}>{proposals.executed[3][0]?.title  ?? ""}</div>
            <div className="proposal-5" onClick={() => handleproposalClick(proposals.executed[4][0], proposals.executed[4][3])}>{proposals.executed[4][0]?.title  ?? ""}</div>
            <div className="proposal-6" onClick={() => handleproposalClick(proposals.executed[5][0], proposals.executed[5][3])}>{proposals.executed[5][0]?.title  ?? ""}</div>
            <div className="proposal-7" onClick={() => handleproposalClick(proposals.executed[6][0], proposals.executed[6][3])}>{proposals.executed[6][0]?.title  ?? ""}</div>
            <div className="proposal-8" onClick={() => handleproposalClick(proposals.executed[7][0], proposals.executed[7][3])}>{proposals.executed[7][0]?.title  ?? ""}</div>
            {/* <div className="proposal-days" style={(proposals.executed[0][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[0][1] ?? 0} days</div>
            <div className="proposal-days1" style={(proposals.executed[1][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[1][1] ?? 0} days</div>
            <div className="proposal-days2" style={(proposals.executed[2][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[2][1] ?? 0} days</div>
            <div className="proposal-days3" style={(proposals.executed[3][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[3][1] ?? 0} days</div>
            <div className="proposal-days4" style={(proposals.executed[4][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[4][1] ?? 0} days</div>
            <div className="proposal-days5" style={(proposals.executed[5][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[5][1] ?? 0} days</div>
            <div className="proposal-days6" style={(proposals.executed[6][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[6][1] ?? 0} days</div>
            <div className="proposal-days7" style={(proposals.executed[7][3] === undefined ) ? {opacity:0} : undefined}>{proposals.executed[7][1] ?? 0} days</div> */}
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
        <div className="delegation-frame">
          <div className="delegate-box" >
            <div className="delegate-box-labels">
              Delegates&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {/* <div>Fluid&nbsp;&nbsp;</div> */}
              <div>VP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
              <div>&nbsp;Delegate&nbsp;&nbsp;&nbsp;</div>
              <div>&nbsp;Undele.</div>
            </div>
            <div className="delegate-xaxis-frame">
              <div className="delegate-x" />
              <div className="delegate-x" />
              <div className="delegate-x" />
              <div className="delegate-x" />
              <div className="delegate-x" />
              <div className="delegate-x" />
              <div className="delegate-x" />
            </div>
            <div className="delegate-frame">
              <div className="delegate-1" onClick={() => showDelegateInfo(delegations[0].delegator)}>{delegations[0].delegator === "" ? ("") : <>{delegations[0].delegator}</>}</div>
              <div className="delegate-1" onClick={() => showDelegateInfo(delegations[1].delegator)}>{delegations[1].delegator === "" ? ("") : <>{delegations[1].delegator}</>}</div>
              <div className="delegate-1" onClick={() => showDelegateInfo(delegations[2].delegator)}>{delegations[2].delegator === "" ? ("") : <>{delegations[2].delegator}</>}</div>
              <div className="delegate-1" onClick={() => showDelegateInfo(delegations[3].delegator)}>{delegations[3].delegator === "" ? ("") : <>{delegations[3].delegator}</>}</div>
              <div className="delegate-1" onClick={() => showDelegateInfo(delegations[4].delegator)}>{delegations[4].delegator === "" ? ("") : <>{delegations[4].delegator}</>}</div>
              <div className="delegate-1" onClick={() => showDelegateInfo(delegations[5].delegator)}>{delegations[5].delegator === "" ? ("") : <>{delegations[5].delegator}</>}</div>
              <div className="delegate-1" onClick={() => showDelegateInfo(delegations[6].delegator)}>{delegations[6].delegator === "" ? ("") : <>{delegations[6].delegator}</>}</div>
              <div className="delegate-1" onClick={() => showDelegateInfo(delegations[7].delegator)}>{delegations[7].delegator === "" ? ("") : <>{delegations[7].delegator}</>}</div>
            </div>
            <div className="voting-power-frame">
              <div className="vp-1">{delegations[0].amount !== undefined ? <>{Math.sqrt(delegations[0].amount)}</> : ""}</div>
              <div className="vp-1">{delegations[1].amount !== undefined ? <>{Math.sqrt(delegations[1].amount)}</> : ""}</div>
              <div className="vp-1">{delegations[2].amount !== undefined ? <>{Math.sqrt(delegations[2].amount)}</> : ""}</div>
              <div className="vp-1">{delegations[3].amount !== undefined ? <>{Math.sqrt(delegations[3].amount)}</> : ""}</div>
              <div className="vp-1">{delegations[4].amount !== undefined ? <>{Math.sqrt(delegations[4].amount)}</> : ""}</div>
              <div className="vp-1">{delegations[5].amount !== undefined ? <>{Math.sqrt(delegations[5].amount)}</> : ""}</div>
              <div className="vp-1">{delegations[6].amount !== undefined ? <>{Math.sqrt(delegations[6].amount)}</> : ""}</div>
              <div className="vp-1">{delegations[7].amount !== undefined ? <>{Math.sqrt(delegations[7].amount)}</> : ""}</div>
            </div>
            <div className="delegate-yaxis-frame">
              <div className="delegation-y" />
              <div className="delegation-y-2" />
              <div className="delegation-y" />
            </div>
            <div className="delegate-button-frame">
              <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 0, delegations[0].delegator)}>
                <div className="delegate">Delegate</div>
              </div>
              <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 1, delegations[1].delegator)}>
                <div className="delegate">Delegate</div>
              </div>
              <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 2, delegations[2].delegator)}>
                <div className="delegate">Delegate</div>
              </div>
              <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 3, delegations[3].delegator)}>
                <div className="delegate">Delegate</div>
              </div>
              <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 4, delegations[4].delegator)}>
                <div className="delegate">Delegate</div>
              </div>
              <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 5, delegations[5].delegator)}>
                <div className="delegate">Delegate</div>
              </div>
              <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 6, delegations[6].delegator)}>
                <div className="delegate">Delegate</div>
              </div>
              <div className="btn set-delegate-button" onClick={() => handledelegateForm(true, true, true, 7, delegations[7].delegator)}>
                <div className="delegate">Delegate</div>
              </div>
            </div>
            <div className="undelegate-button-frame">
              <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 0, delegations[0].delegator)}/>
              <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 1, delegations[1].delegator)}/>
              <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 2, delegations[2].delegator)}/>
              <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 3, delegations[3].delegator)}/>
              <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 4, delegations[4].delegator)}/>
              <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 5, delegations[5].delegator)}/>
              <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 6, delegations[6].delegator)}/>
              <div className="btn undelegate-button" onClick={() => handledelegateForm(true, true, false, 7, delegations[7].delegator)}/>
            </div>
          </div>
          <div className="btn commission" onClick={handlecommissionChange}>{commission}% Commission</div>
          {/* <div className="delegators-box">
            <div className="your-delegators">Your Delegators</div>
            <div className="delegate-frame">
              <div className="delegate-1">{delegators[0].delegator === "" ? ("") : <>{delegators[0].delegator.slice(13)}...</>}ttttttttttttt...</div>
              <div className="delegate-1">{delegators[1].delegator === "" ? ("") : <>{delegators[1].delegator.slice(13)}...</>}ttttttttttttt...</div>
              <div className="delegate-1">{delegators[2].delegator === "" ? ("") : <>{delegators[2].delegator.slice(13)}...</>}ttttttttttttt...</div>
              <div className="delegate-1">{delegators[3].delegator === "" ? ("") : <>{delegators[3].delegator.slice(13)}...</>}ttttttttttttt...</div>
              <div className="delegate-1">{delegators[4].delegator === "" ? ("") : <>{delegators[4].delegator.slice(13)}...</>}ttttttttttttt...</div>
              <div className="delegate-1">{delegators[5].delegator === "" ? ("") : <>{delegators[5].delegator.slice(13)}...</>}ttttttttttttt...</div>
              <div className="delegate-1">{delegators[6].delegator === "" ? ("") : <>{delegators[6].delegator.slice(13)}...</>}ttttttttttttt...</div>
              <div className="delegate-1">{delegators[7].delegator === "" ? ("") : <>{delegators[7].delegator.slice(13)}...</>}ttttttttttttt...</div>
            </div>
            <div className="fluidity-frame">
              <div className="delegator-fluid">{delegators[0].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
              <div className="delegator-fluid">{delegators[1].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
              <div className="delegator-fluid">{delegators[2].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
              <div className="delegator-fluid">{delegators[3].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
              <div className="delegator-fluid">{delegators[4].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
              <div className="delegator-fluid">{delegators[5].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
              <div className="delegator-fluid">{delegators[6].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
              <div className="delegator-fluid">{delegators[7].fluid === true ? ("Yes") : delegators[7].fluid === false ? "No" : ""}</div>
            </div>
            <div>
              <div className="delegator-vp">{delegators[0].amount !== undefined ? <>{delegators[0].amount}</> : ""}</div>
              <div className="delegator-vp">{delegators[1].amount !== undefined ? <>{delegators[1].amount}</> : ""}</div>
              <div className="delegator-vp">{delegators[2].amount !== undefined ? <>{delegators[2].amount}</> : ""}</div>
              <div className="delegator-vp">{delegators[3].amount !== undefined ? <>{delegators[3].amount}</> : ""}</div>
              <div className="delegator-vp">{delegators[4].amount !== undefined ? <>{delegators[4].amount}</> : ""}</div>
              <div className="delegator-vp">{delegators[5].amount !== undefined ? <>{delegators[5].amount}</> : ""}</div>
              <div className="delegator-vp">{delegators[6].amount !== undefined ? <>{delegators[6].amount}</> : ""}</div>
              <div className="delegator-vp">{delegators[7].amount !== undefined ? <>{delegators[7].amount}</> : ""}</div>
            </div>
            <div>
              <div className="delegator-x" />
              <div className="delegator-x1" />
              <div className="delegator-x2" />
              <div className="delegator-x3" />
              <div className="delegator-x4" />
              <div className="delegator-x5" />
              <div className="delegator-x6" />
            </div>
            <div>
              <div className="delegates-y" />
              <div className="delegators-y1" />
              <div className="delegators-y2" />
            </div>
          </div> */}
        </div>
        {/* <div className="mbrn-stake-logo">
          <Image className="logo-icon1  logo-shiftDown" width={43} height={48} alt="" src="/images/Logo.svg" />
        </div> */}
        {/* <Image className="cdt-logo-icon" width={45} height={45} alt="" src="/images/CDT.svg" />       */}
      </div>
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </div>    
  );
};

export default Governance;
