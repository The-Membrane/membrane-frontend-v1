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
import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

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
  quorumThreshold: number;
}

const ProposalItem: React.FC<PIProps> = (props: PIProps) => {
  const {
    onClick,
    title,
    days,
    result,
    quorum,
    proposalColor,
    quorumThreshold,
  } = props;
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
            quorumThreshold > quorum! ? "low-opacity" : ""
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
  quorumThreshold: number;
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
          quorumThreshold={props.quorumThreshold}
        />
      )
    )}
  </div>
);

type ProposalProps = {
  id?: string;
  data: {
    status: string;
    title: string;
    description?: string;
    links?: string[];
    messages?: string[];
  };
  popup: () => void;
};

const Proposal: React.FC<ProposalProps> = ({ data, popup }: ProposalProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Function to determine the color of the status circle based on the proposal status
  const getStatusColor = () => {
    switch (data.status) {
      case "active":
        return "rgba(46, 204, 113, 0.3)";
      case "pending":
        return "rgba(241, 196, 15, 0.3)";
      case "completed":
        return "rgba(52, 152, 219, 0.3)";
      case "executed":
        return "rgba(231, 76, 60, 0.3)";
      default:
        return "rgba(149, 165, 166, 0.3)";
    }
  };
  const [isPopupOpen, setPopupOpen] = useState(false);

  const openPopup = () => {
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  return (
    <Box
      bg="gray.700"
      borderRadius="xl"
      py={4}
      px={6}
      color="white"
      boxShadow="xl"
      width="100vw"
      maxWidth="5xl"
    >
      <HStack spacing={4} align="center">
        <Button
          size="sm"
          fontSize="xs"
          fontWeight="normal"
          colorScheme="teal"
          borderRadius="full"
          bg={getStatusColor()}
          px={3}
        >
          {data.status
            ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
            : ""}
        </Button>

        <Text flex="1" fontWeight="medium" my={0} noOfLines={2} isTruncated>
          {data.title}
        </Text>

        <Button
          size="sm"
          fontSize="sm"
          fontWeight="normal"
          colorScheme="teal"
          onClick={() => popup()}
        >
          {isMobile ? "View" : "View Proposal"}
        </Button>
      </HStack>
    </Box>
  );
};

interface PropPaneProps {
  proposals: ProposalList;
  handleSubmitProposalForm: () => void;
  connect: () => void;
  govClient: any;
  govQueryClient: any;
  address: string | undefined;
  userVP: UserVP;
  quorumThreshold: number;
}

export const ProposalPane: React.FC<PropPaneProps> = (props: PropPaneProps) => {
  const [proposalType, setProposalType] = useState("Active");
  const [proposalColor, setProposalColor] = useState("#567c39");
  const [proposalDetails, setProposalDetails] = useState<{
    proposal: ProposalResponse | undefined;
    quorum: number;
  }>({ proposal: undefined, quorum: 0 });
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
    const popup = () => {
      setProposalDetails({ proposal, quorum });
      setProposalDetailsVisible(true);
    };

    return popup;
  };

  //Converts ProposalResponse to ProposalProps for display
  const convertPropData = (proposal: ProposalResponse): ProposalProps => {
    return {
      id: proposal?.proposal_id,
      data: {
        status: proposal?.status,
        title: proposal?.title,
        description: proposal?.description,
        links: proposal?.link ? [proposal.link] : undefined,
        messages:
          proposal?.messages?.map((message) => message.msg.toString()) ??
          undefined,
      },
      popup: handleRowClick(proposal, props.quorumThreshold),
    };
  };

  //Combines proposals from all categories into one list
  const convertPropList = (proposalList: ProposalList): ProposalProps[] => {
    const allConvertedProposals: ProposalProps[] = [];

    for (const category in proposalList) {
      if (proposalList.hasOwnProperty(category)) {
        const proposalsInCategory = proposalList[category];

        const convertedCategoryProposals = proposalsInCategory
          .filter((proposalData) => proposalData[0] !== undefined)
          .map((proposalData) => convertPropData(proposalData![0]!));

        allConvertedProposals.push(...convertedCategoryProposals);
      }
    }

    return allConvertedProposals;
  };

  const propList = convertPropList(props.proposals);


  //Show more/less button
  const [showAll, setShowAll] = React.useState(false);
  const initialLength = 5;
  const displayedProposals = showAll ? propList : propList.slice(0, initialLength);

  return (
    <VStack spacing={4} align="stretch" mb={16}>
      {propList.length === 0 ? (
        <Box>No proposals available</Box>
      ) : (
        displayedProposals.map((proposal) => (
          <Proposal
            key={proposal?.id}
            data={proposal?.data}
            popup={proposal.popup}
          />
        ))
      )}

      {propList.length > initialLength && (
        <Flex
          justify="center"
          fontWeight="bold"
          cursor="pointer"
        >
          <Text display="flex" gap={4} alignItems="center" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less " : "Show More "}
            {showAll ? <FaChevronUp /> : <FaChevronDown />}
          </Text>
        </Flex>
      )}
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
      <Button
        onClick={props.handleSubmitProposalForm}
        size="lg"
        maxW="md"
        bgColor="#745EFF"
        alignSelf="center"
        color={"white"}
      >
        Submit Proposal
        <Popup
          trigger={trigger}
          setTrigger={setTrigger}
          msgStatus={status}
          errorMsg={msg}
        />
      </Button>
    </VStack>
  );
};
