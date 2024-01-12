import {
    ProposalResponse,
    ProposalVoteOption,
  } from "../../codegen/governance/Governance.types";
  import { UserVP } from "../../pages/Governance";
  import { SECONDS_PER_DAY } from "../../pages";
  import { quadraticVoting } from "../../config";
  import React, { useEffect, useState } from "react";
  
  const VOTING_PERIOD_IN_SECONDS = 7 * 86400;
  const EXPEDITED_VOTING_PERIOD_IN_SECONDS = 3 * 86400;
  
  interface ProposalDetailsData {
    [key: string]: any;
    description: string;
    link?: string;
    messages?: string[];
    for_ratio: string;
    against_ratio: string;
    amend_ratio: string;
    removal_ratio: string;
    label: string;
    daysLeft: number;
    userVote: string;
    totalVotes: number;
  }
  
  export const calculateProposalDetails = async (
    proposal: ProposalResponse | undefined,
    quorum: number | undefined,
    address: any,
    userVP: UserVP,
    govQueryClient: any,
    handleVote: (proposalId: number, vote: ProposalVoteOption) => Promise<void>
  ): Promise<ProposalDetailsData | undefined> => {
    if (!proposal) {
      // Handle the case where the proposal is undefined
      return Promise.resolve(undefined);
    }
  
    // Calculate total votes and ratios
    const totalVotes = Math.max(
      parseInt(proposal.for_power) +
        parseInt(proposal.against_power) +
        parseInt(proposal.amendment_power) +
        parseInt(proposal.removal_power),
      1
    );
  
    const getRatio = (power: any, totalVotes: any) =>
      ((parseInt(power) / totalVotes) * 100).toFixed(2) + "%";
  
    const for_ratio = getRatio(proposal.for_power, totalVotes);
    const against_ratio = getRatio(proposal.against_power, totalVotes);
    const amend_ratio = getRatio(proposal.amendment_power, totalVotes);
    const removal_ratio = getRatio(proposal.removal_power, totalVotes);
  
    const label = proposal.link?.includes("commonwealth")
      ? "CommonWealth"
      : proposal.link?.includes("discord")
      ? "Discord"
      : "";
    const daysPast = Date.now() / 1000 - proposal.start_time;
    const daysLeft = Math.max(
      (proposal.end_block - proposal.start_block === 43200
        ? EXPEDITED_VOTING_PERIOD_IN_SECONDS - daysPast
        : VOTING_PERIOD_IN_SECONDS - daysPast) / SECONDS_PER_DAY,
      0
    );
  
    // Get user vote
    let userVote = "N/A";
    const voters = await govQueryClient?.proposal({
      proposalId: parseInt(proposal.proposal_id),
    });
  
    if (voters) {
      const voterArrays = [
        voters.for_voters,
        voters.aligned_voters,
        voters.amendment_voters,
        voters.against_voters,
        voters.removal_voters,
      ];
  
      for (const [index, voteArray] of voterArrays.entries()) {
        if (voteArray.includes(address!)) {
          userVote =
            index === 0
              ? "For"
              : index === 1
              ? "Align"
              : index === 2
              ? "Amend"
              : index === 3
              ? "Against"
              : index === 4
              ? "Remove"
              : "N/A";
          break;
        }
      }
    }
  
    return Promise.resolve({
      description: proposal.description,
      link: proposal.link,
      messages: proposal.messages,
      for_ratio,
      against_ratio,
      amend_ratio,
      removal_ratio,
      label,
      daysLeft,
      userVote,
      totalVotes,
    } as ProposalDetailsData);
  };
  
  interface ProposalDetailsProps {
    proposal: ProposalResponse;
    quorum: number | undefined;
    address: any;
    userVP: UserVP;
    govQueryClient: any;
    handleVote: (proposalId: number, vote: ProposalVoteOption) => Promise<void>;
  }
  
  const ProposalDetails: React.FC<ProposalDetailsProps> = ({
    proposal,
    quorum,
    address,
    userVP,
    govQueryClient,
    handleVote,
  }) => {
    // Calculate proposal details using the pure function
    const [props, setProposalDetails] = useState<ProposalDetailsData | undefined>(
      undefined
    );
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const details = await calculateProposalDetails(
            proposal,
            quorum,
            address,
            userVP,
            govQueryClient,
            handleVote
          );
          setProposalDetails(details);
        } catch (error) {
          console.error("Error fetching proposal details:", error);
        }
      };
  
      fetchData();
    }, [proposal, quorum, address, userVP, govQueryClient, handleVote]); // Adjust dependencies as needed
  
    return (
      <p>
        {props ? (
          <>
            <div>Description: {props.description}</div>
            <div
              onClick={() => props.link && window.open(props.link)}
              style={{ cursor: "pointer" }}
            >
              Links: {props.label}
            </div>
            <div>Msgs: {props.messages?.toString() ?? "None"}</div>
            <div className="vote-options">
              {["for", "against", "amend", "align", "remove"].map((type) => (
                <button
                  key={type}
                  className="vote-buttons"
                  style={{ outline: "none" }}
                  onClick={() =>
                    handleVote(
                      parseInt(proposal.proposal_id),
                      type as ProposalVoteOption
                    )
                  }
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}:{" "}
                  {props && props[`${type}_ratio`]}
                </button>
              ))}
            </div>
            <div className="vote-total">
              Your Vote: {props.userVote} -{" "}
              {quadraticVoting
                ? Math.sqrt(userVP.userStake).toFixed(0)
                : (userVP.userDelegations + userVP.userStake).toFixed(0)}{" "}
              VP &nbsp;&nbsp; Quorum:{" "}
              {(parseFloat((quorum ?? 0).toFixed(2)) * 100).toFixed(0)}
              %&nbsp;&nbsp;&nbsp; Days Left: {props.daysLeft?.toFixed(2) ?? ""}
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </p>
    );
  };
  
  export default ProposalDetails;
  