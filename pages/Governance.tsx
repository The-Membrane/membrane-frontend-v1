import { useEffect, useState } from "react";
import ProgressBar from "./progress_bar";
import { GovernanceClient, GovernanceQueryClient } from "../codegen/governance/Governance.client";
import { StakingClient, StakingQueryClient } from '../codegen/staking/Staking.client';
import { Proposal, ProposalResponse, Config, ProposalMessage } from "../codegen/governance/Governance.types";
import Popup from "./Popup";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

const SECONDS_PER_DAY = 86400;

const Governance = ({gov_client, gov_qclient, staking_client, staking_qclient, addr}) => {

  const govClient = gov_client as GovernanceClient;
  const govQueryClient = gov_qclient as GovernanceQueryClient;
  const stakingClient = staking_client as StakingClient;
  const stakingQueryClient = staking_qclient as StakingQueryClient;
  const address = addr as string | undefined;

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
            reader.readAsText((msgs as FileList)[0]);
            reader.onload = () => {
              //Set proposal
              handleproposalSubmission(title, description, link, JSON.parse(reader.result))
              console.log(JSON.parse(reader.result));
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
      await govQueryClient.activeProposals({})
      .then(async (res) => {
        //Set active, completed & executed
        for (let i = 0; i < res.proposal_list.length; i++) {
          if (res.proposal_list[i].status == "active") {
            if (proposals.active.length < 8){
              //Get days left
              var daysLeft = (res.proposal_list[i].end_block - currentTime) / SECONDS_PER_DAY;            
              //Get total voting power
              var totalVotingPower = 0;
              await govQueryClient.totalVotingPower({
                proposalId: parseInt(res.proposal_list[i].proposal_id)
              }).then((res) => {
                totalVotingPower = parseInt(res);
              })
              //Calc quorum
              var quorum = (parseInt(res.proposal_list[i].against_power) + parseInt(res.proposal_list[i].for_power) + parseInt(res.proposal_list[i].aligned_power) + parseInt(res.proposal_list[i].amendment_power) + parseInt(res.proposal_list[i].removal_power)) / totalVotingPower;
              //Query config
              var config = await govQueryClient.config()
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
      await govQueryClient.pendingProposals({
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

  useEffect(() => {
    //Query & set proposals
    getProposals()

  }, []);
      
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
      <div className="btn delegate-button">
        <div className="delegate">Delegate</div>
      </div>
      <div className="total-vp-label">Total VP: </div>
      <div className="total-vp-amount">200</div>
      <div className="delegated-to">Delegated To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fluid&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Comm.&nbsp;&nbsp;&nbsp;Undele.</div>
      <div className="claim-button-frame"/>
      <div className="btn gov-claim-button">
        <div className="claim">Claim</div>
      </div>
      <div className="btn commission">5% Commission</div>
      <div className="unstake-button-frame"/>
      <div className="btn unstake-button">
        <div className="unstake">Unstake</div>
      </div>
      <div className="stake-button-frame"/>
      <div className="btn stake-button1">
        <div className="stake">Stake</div>
      </div>
      <div className="status-dropdown">
        <img className="button-icon" alt="" src="images/button.svg" />
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
        <div className="delegate-1">osmo1988s5h45q...</div>
        <div className="delegate-2">Delegate 1</div>
        <div className="delegate-3">Delegate 1</div>
        <div className="delegate-4">Delegate 1</div>
        <div className="delegate-5">Delegate 1</div>
        <div className="delegate-6">Delegate 1</div>
        <div className="delegate-7">Delegate 1</div>
        <div className="delegate-8">Delegate 1</div>
        <div className="fluid-1">Yes</div>
        <div className="fluid-2">Yes</div>
        <div className="fluid-3">Yes</div>
        <div className="fluid-4">Yes</div>
        <div className="fluid-5">Yes</div>
        <div className="fluid-6">Yes</div>
        <div className="fluid-7">Yes</div>
        <div className="fluid-8">Yes</div>
        <div className="vp-1">100</div>
        <div className="vp-2">100</div>
        <div className="vp-3">100</div>
        <div className="vp-4">100</div>
        <div className="vp-5">100</div>
        <div className="vp-6">100</div>
        <div className="vp-7">100</div>
        <div className="vp-8">100</div>
        <div className="commission-1">10%</div>
        <div className="commission-2">10%</div>
        <div className="commission-3">10%</div>
        <div className="commission-4">10%</div>
        <div className="commission-5">10%</div>
        <div className="commission-6">10%</div>
        <div className="commission-7">10%</div>
        <div className="commission-8">10%</div>
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
      <div className="btn delegate-button-1" />
      <div className="btn delegate-button-2" />
      <div className="btn delegate-button-3" />
      <div className="btn delegate-button-4" />
      <div className="btn delegate-button-5" />
      <div className="btn delegate-button-6" />
      <div className="btn delegate-button-7" />
      <div className="btn delegate-button-8" />
      <div className="your-delegators">Your Delegators</div>
      <div className="delegators-box" />
        <div className="delegator-1">Delegator 1</div>
        <div className="delegator-2">Delegator 1</div>
        <div className="delegator-3">Delegator 1</div>
        <div className="delegator-4">Delegator 1</div>
        <div className="delegator-5">Delegator 1</div>
        <div className="delegator-6">Delegator 1</div>
        <div className="delegator-7">Delegator 1</div>
        <div className="delegator-8">Delegator 1</div>        
        <div className="delegator-fluid-1">Yes</div>
        <div className="delegator-fluid-2">Yes</div>
        <div className="delegator-fluid-3">Yes</div>
        <div className="delegator-fluid-4">Yes</div>
        <div className="delegator-fluid-5">Yes</div>
        <div className="delegator-fluid-6">Yes</div>
        <div className="delegator-fluid-7">Yes</div>
        <div className="delegator-fluid-8">Yes</div>
        <div className="delegator-vp-1">100</div>
        <div className="delegator-vp-2">100</div>
        <div className="delegator-vp-3">100</div>
        <div className="delegator-vp-4">100</div>
        <div className="delegator-vp-5">100</div>
        <div className="delegator-vp-6">100</div>
        <div className="delegator-vp-7">100</div>
        <div className="delegator-vp-8">100</div>
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
      <div className="staked-mbrn1">100</div>
      <div className="unstaking-mbrn">100</div>
      <div className="mbrn-claims">100</div>
      <div className="cdt-claims">100</div>
      <div className="mbrn-stake-logo">
        <img className="logo-icon1  logo-shiftDown" alt="" src="/images/logo.svg" />
      </div>
      <div className="mbrn-unstake-logo">
      <img className="logo-icon1  logo-shiftDown" alt="" src="/images/logo.svg" />
      </div>
      <div className="mbrn-claim-logo">
      <img className="logo-icon1" alt="" src="/images/logo.svg" />
      </div>
      <div className="unstaking-progress-bar" >
        <ProgressBar bgcolor="#50C9BD" progress='30'  height={20} />
      </div>
      <div className="emissions-schedule">33%/8 months</div>
      <img className="cdt-logo-icon" alt="" src="/images/CDT.svg" />      
      <Popup trigger={popupTrigger} setTrigger={setPopupTrigger} msgStatus={popupStatus} errorMsg={popupMsg}/>
    </div>    
  );
};

export default Governance;
