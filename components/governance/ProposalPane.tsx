import React, { useState, ReactNode } from "react";
import {
  ProposalResponse,
  ProposalMessage,
  VoteOption,
  ProposalVoteOption,
} from "../../codegen/governance/Governance.types";
import { usePopup } from "./HelperFunctions";
import { UserVP } from "../../pages/Governance";
import ProposalDetails from "./ProposalPopup";
import Popup from "../Popup";

//Interfaces and Global Variables

export interface ProposalList {
  [key: string]: [
    ProposalResponse | undefined,
    number | undefined,
    string | undefined,
    number | undefined
  ][];
  active: [
    ProposalResponse | undefined,
    number | undefined,
    string | undefined,
    number | undefined
  ][];
  pending: [
    ProposalResponse | undefined,
    number | undefined,
    string | undefined,
    number | undefined
  ][];
  completed: [
    ProposalResponse | undefined,
    number | undefined,
    string | undefined,
    number | undefined
  ][];
  executed: [
    ProposalResponse | undefined,
    number | undefined,
    string | undefined,
    number | undefined
  ][];
}

interface DropdownProps {
  handleItemClick: (type: string, color: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ handleItemClick }) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleItemClickWrapper = (type: string, color: string) => {
    handleItemClick(type, color);
    setOpen(false);
  };

  return (
    <div className="dropdown proposal-dropdown">
      <button onClick={handleOpen} style={{ outline: "none" }}>
        Proposal Status
      </button>
      {open && (
        <ul className="proposal-menu">
          {[
            { type: "Active", color: "#567c39" },
            { type: "Pending", color: "rgb(189, 131, 22)" },
            { type: "Completed", color: "rgb(73, 73, 169)" },
            { type: "Executed", color: "rgb(160, 102, 102)" },
          ].map((item, index) => (
            <li
              key={index}
              className={`proposal-menu-item-${item.type.toLowerCase()}`}
            >
              <button
                onClick={() => handleItemClickWrapper(item.type, item.color)}
                style={{ outline: "none" }}
              >
                {item.type}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface PIProps {
  onClick: () => void;
  title?: string;
  days?: number;
  result?: string;
  quorum?: number;
  proposalColor: string;
}

const ProposalItem: React.FC<PIProps> = (props: PIProps) => {
  const { onClick, title, days, result, quorum, proposalColor } = props;
  return (
    <div>
      <div className="proposal-item" onClick={onClick}>
        <div
          className="proposal-button"
          style={{ backgroundColor: proposalColor }}
        />
        <div className="proposal-title">{title ?? ""}</div>
        <div
          className={`proposal-result ${
            result && days && days < quorum! ? "low-quorum" : ""
          }`}
        >
          {result ?? ""}
        </div>
      </div>
      <div className="proposal-axis" />
    </div>
  );
};

interface ProposalRowsProps {
  proposals: ProposalList;
  proposalType: string;
  proposalColor: string;
  onRowClick: (proposal: ProposalResponse, quorum: number) => void;
}

const ProposalRows: React.FC<ProposalRowsProps> = (
  props: ProposalRowsProps
) => (
  <div className="proposal-rows">
    {props.proposals[props.proposalType.toLowerCase()]?.map(
      (proposal, index) => (
        <ProposalItem
          key={index}
          onClick={() => props.onRowClick(proposal[0]!, proposal[3]!)}
          title={proposal[0]?.title}
          days={proposal[1]}
          result={proposal[2]}
          quorum={proposal[3]!}
          proposalColor={props.proposalColor}
        />
      )
    )}
  </div>
);

interface PropPaneProps {
  proposals: ProposalList;
  handleSubmitProposalForm: () => void;
  connect: () => void;
  govClient: any;
  govQueryClient: any;
  address: string | undefined;
  userVP: UserVP;
}

export const ProposalPane: React.FC<PropPaneProps> = (props: PropPaneProps) => {
  const [proposalType, setProposalType] = useState("Active");
  const [proposalColor, setProposalColor] = useState("#567c39");
  const [proposalDetails, setProposalDetails] = useState<{ proposal: ProposalResponse | undefined, quorum: number }>({ proposal: undefined, quorum: 0 });
  const [isProposalDetailsVisible, setProposalDetailsVisible] = useState(false);
  const [popupStatus, setPopupStatus] = useState("Success");
  const { trigger, setTrigger, msg, status, showPopup } = usePopup();
  const handleTypeChange = (type: string, color: string) => {
    setProposalType(type);
    setProposalColor(color);
  };

  const handleVote = async (proposalId: number, vote: ProposalVoteOption) => {
    // Check if wallet is connected & connect if not
    if (props.address === undefined) {
      props.connect();
      setTrigger(false);
      return;
    }

    try {
      await props.govClient?.castVote(
        {
          proposalId,
          vote,
        },
        "auto",
        undefined
      );

      // Format popup message for success
      showPopup("Success", "Voted");
    } catch (error) {
      console.log(error);
      let e = error as { message: string };

      // Check for a specific cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4") {
        // Format popup message for success (cosmjs error)
        showPopup("Success", "Voted");
      } else {
        // Format popup message for other errors
        showPopup("Error", e.message);
      }
    }
  };

  const handleRowClick = (proposal: ProposalResponse, quorum: number) => {
    setProposalDetails({ proposal, quorum });
    setProposalDetailsVisible(true);
  };

  return (
    <div className="proposal-pane">
      <div className="proposal-top">
        <Dropdown handleItemClick={handleTypeChange} />
        <div className="proposal-axis-labels">Current Result</div>
      </div>
      <div className="proposals-frame">
        <div style={{ marginBottom: "15px" }} />
        <ProposalRows
          proposals={props.proposals}
          proposalType={proposalType}
          proposalColor={proposalColor}
          onRowClick={handleRowClick}
        />
        <Popup
          trigger={isProposalDetailsVisible}
          setTrigger={setProposalDetailsVisible}
          msgStatus={popupStatus}
          errorMsg={
            <ProposalDetails
              proposal={proposalDetails.proposal!}
              quorum={proposalDetails.quorum}
              govQueryClient={props.govQueryClient}
              address={props.address}
              userVP={props.userVP}
              handleVote={handleVote}
            />
          }
        />
        <div
          className="submit-proposal-button"
          onClick={props.handleSubmitProposalForm}
        >
          <div
            className="submit-proposal"
            onClick={props.handleSubmitProposalForm}
          >
            Submit Proposal
          </div>
        </div>
      </div>
      <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
    </div>
  );
};
