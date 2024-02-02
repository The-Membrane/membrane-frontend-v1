import { use, useEffect, useState } from "react";
import { GovernanceClient, GovernanceQueryClient } from "../codegen/governance/Governance.client";
import { StakingClient, StakingQueryClient } from '../codegen/staking/Staking.client';
import { ProposalResponse, ProposalMessage, VoteOption, ProposalVoteOption } from "../codegen/governance/Governance.types";
import Popup from "../components/Popup";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import React from "react";
import Image from "next/image";
import { useChain } from "@cosmos-kit/react";
import { chainName, Delegate, delegateList, quadraticVoting } from "../config";
import { VestingClient } from "../codegen/vesting/Vesting.client";
import { ProposalPane, ProposalList } from "../components/governance/ProposalPane";
import StakeButton from "../components/governance/StakeButton";
import UnstakeButton from "../components/governance/UnstakeButton";
import ClaimButton from "../components/governance/ClaimButton";
import DelegatePane from "../components/governance/DelegatePane";

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
  govQueryClient: GovernanceQueryClient | null;
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

const Governance = ({govClient, govQueryClient, stakingClient, stakingQueryClient, vestingClient, address,
  Delegations, Delegators, quorum, setQuorum, maxCommission, setmaxCommission, Proposals, UserVP, EmissionsSchedule, UserStake, UserClaims, WalletMBRN
}: Props) => {
  const { connect } = useChain(chainName);
  //Popup
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [popupMsg, setPopupMsg] = useState<ReactJSXElement>();
  const [popupStatus, setPopupStatus] = useState("");
  //Proposal List//
  console.log("quorums", quorum);
  
  const createEmptyDelegation = () => ({
    delegator: "",
    fluid: undefined,
    amount: undefined,
    commission: undefined,
  });
  
  const createEmptyDelegator = () => ({
    delegator: "",
    fluid: undefined,
    amount: undefined,
  });
  
  const generateArray = (length: number, creator: any) => Array.from({ length }, creator);
  
  const [delegations, setDelegations] = useState<Delegation[]>(generateArray(8, createEmptyDelegation) as Delegation[]);
  const [delegators, setDelegators] = useState<Delegator[]>(generateArray(8, createEmptyDelegator) as Delegator[]);

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
  const getDelegations = async () => {
    try {
      await stakingQueryClient?.delegations({
        user: address as string ?? undefined,
      }).then( async (res) => {
        var delegationVP = 0;
        var delegatedStake = 0;

        if (res.length > 0) {
          //Set delegation state for the listed delegates
          delegateList.forEach((delegate, index) => {
            let delegate_index = res[0].delegation_info.delegated_to.findIndex((delegate) => { delegate.delegate === delegateList[index].address});
            if (delegate_index !== -1) {
              delegations[index].amount = parseInt(res[0].delegation_info.delegated_to[delegate_index].amount)
              delegations[index].fluid = res[0].delegation_info.delegated_to[delegate_index].fluidity
              //Remove delegate from list
              delegateList.splice(index, 1);
            }
            delegations[index].delegator = delegate.name;
          })
          console.log(delegations)

          //Set delegations
          //We add the delegateList length bc we are going to remove them from the list
          for (let i = 0; i < res[0].delegation_info.delegated_to.length; i++) {
            //Set delegations if within the list length of 8
            let index = i + delegateList.length;
            if (index < 8) {
              delegations[index].amount = parseInt(res[index].delegation_info.delegated_to[index].amount)
              delegations[index].delegator = res[index].delegation_info.delegated_to[index].delegate.slice(13) + '...';
              delegations[index].fluid = res[index].delegation_info.delegated_to[index].fluidity
              
              //Query and set commission
              await stakingQueryClient?.delegations({
                user: res[index].delegation_info.delegated_to[index].delegate,
              }).then((res) => {
                delegations[index].commission = parseInt(res[0].delegation_info.commission) * 100 //Commission is a % so multiply by 100
              })
              //////Move this to query when clicking on a delegate//////
            }
            //Subtract from user VP
            if (res[index].delegation_info.delegated_to[index].voting_power_delegation === true) {
              delegatedStake += parseInt(res[index].delegation_info.delegated_to[index].amount)
            }
          }
          
          //Set Delegators
          for (let i = 0; i < res[0].delegation_info.delegated.length; i++) {          
            //Add to user total VP
            if (res[i].delegation_info.delegated[i].voting_power_delegation === true) {
              if (quadraticVoting === true){
                delegationVP += Math.sqrt(parseInt(res[i].delegation_info.delegated[i].amount))            
              } else {              
                delegationVP += parseInt(res[i].delegation_info.delegated_to[i].amount)
              }
            }          
            //Add to user VP
            setuserVP(prevState => {
              return {
                userStake: prevState.userStake - delegatedStake,
                userDelegations: delegationVP,
              }
            })
          }
        } else {          
          //Set delegation state for the listed delegates
          delegateList.forEach((delegate, index) => {
            delegations[index].amount = 0;
            delegations[index].fluid = true;            
            delegations[index].delegator = delegate.name;
          })
        }
        //Set delegations
        setDelegations(delegations)
      })

    } catch (error) {
      console.log(error)
      //Set delegateList even though the VP amounts are not set
      delegateList.forEach((delegate, index) => {
        delegations[index].amount = 0;
        delegations[index].fluid = true;
        delegations[index].delegator = delegate.name;
      })
      //Set delegations
      setDelegations(delegations)
    }
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
        <StakeButton 
        userStake={userStake}
        emissionsSchedule={emissionsSchedule} 
        walletMBRN={walletMBRN} 
        address={address} 
        connect={connect} 
        stakingClient={stakingClient} 
        /> 
        <UnstakeButton 
        userStake={userStake} 
        setUserStake={setUserStake} 
        address={address} 
        connect={connect} 
        stakingClient={stakingClient} 
        />
        <ClaimButton 
        userClaims={userClaims} 
        address={address} 
        connect={connect} 
        stakingClient={stakingClient} />
      </div>
      <div className="proposals-delegations">
        <ProposalPane
        proposals={proposals}
        handleSubmitProposalForm={handlesubmitproposalForm}
        connect={connect}
        govClient={govClient}
        govQueryClient={govQueryClient}
        address={address}
        userVP={userVP}
        quorumThreshold={quorum}
      />
      <DelegatePane 
      delegations={delegations} 
      stakingQueryClient={stakingQueryClient} 
      stakingClient={stakingClient} 
      maxCommission={maxCommission} 
      userStake={userStake} 
      userVP={userVP} 
      getDelegations={getDelegations}
      handledelegateSubmission={handledelegateSubmission} 
      />

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
