import React, { use, useState, useEffect } from "react";
import { Delegation, UserStake, UserVP } from "../../pages/Governance";
import {
  chainName,
  Delegate,
  delegateList,
  quadraticVoting,
} from "../../config";
import {
  StakingClient,
  StakingQueryClient,
} from "../../codegen/staking/Staking.client";
import usePopup from "./HelperFunctions";
import { ProposalMessage } from "../../codegen/governance/Governance.types";
import Popup from "../Popup";
import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import Info from "../InfoTooltipWrapper";
type HandleDelegateForm = (
    fluid: boolean,
    vp: boolean,
    delegate: boolean,
    delegate_index?: number,
    var_governator?: Delegate
  ) => Promise<void>;


interface DelegatePopupProps {
  stakingQueryClient: StakingQueryClient | null;
  isOpen: boolean;
  onClose: () => void;
  delegate: Delegate;
  handledelegateForm: HandleDelegateForm;
}

export const DelegatePopup = ({
  stakingQueryClient,
  isOpen,
  onClose,
  delegate,
  handledelegateForm,
}: DelegatePopupProps) => {
  const [delInfo, setDelInfo] = useState<[number, number] | null>(null);

  useEffect(() => {
    getDelegateInfo(delegate).then((res) => setDelInfo(res));
  }, []);

  // Query delegate commission & total delegations
  async function getDelegateInfo(
    delegate: Delegate
  ): Promise<[number, number]> {
    try {
      const res = await stakingQueryClient?.delegations({
        user: delegate.address,
      });

      if (!res) return [0, 0];

      let total_delegations = 0;
      let commission = 0;

      res[0]?.delegation_info.delegated.forEach((element) => {
        total_delegations += parseInt(element.amount);
      });

      commission = parseInt(res[0]?.delegation_info.commission) * 100;
      return [total_delegations / 1_000000, commission];
    } catch (error) {
      console.error("Error fetching delegate information:", error);
      return [0, 0];
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.700" color="white" py="6" mx="2">
        <ModalHeader>
          <Heading fontSize="xl">{"Delegate: " + delegate.name}</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="md" fontWeight="semibold">
            {"Total Delegations: " + delInfo?.[0].toFixed(2) + " MBRN"}
          </Text>
          <Text mt={4} fontWeight="semibold">
            {"Commission: " + delInfo?.[1] + "%"}
          </Text>
          <Text>
            {" "}
            <strong>Socials:</strong>
            <br />
            {delegate.socials && delegate.socials.length > 0
              ? delegate.socials.map((link, index) => (
                  <Text mb={0}>
                    {index == 0 ? "Twitter: " : "Discord: "}
                    <Link
                      key={index}
                      color={useColorModeValue("teal.500", "teal.300")}
                      href={index == 0 ? `https://twitter.com/${link}` : "#"}
                    >
                      {link}
                    </Link>
                  </Text>
                ))
              : "No links available."}
          </Text>
        </ModalBody>
        <ModalFooter justifyContent="center" mt={2}>
          <Button
            onClick={() => {
                onClose();
                handledelegateForm(true, true, true, delegateList.indexOf(delegate), delegate);
            }}  
            color="white"
            bgColor="#745EFF"
          >
            Delegate
          </Button>
          <Box w="4" />
          <Button 
            onClick={() => {
                onClose();
                handledelegateForm(true, true, false, delegateList.indexOf(delegate), delegate);
            }} 
            color="white" bgColor="#745EFF">
            Undelegate
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export interface DelegateProps {
  name: string;
  votingPower: number;
  stakingQueryClient: StakingQueryClient | null;
  handledelegateForm: HandleDelegateForm;
}

export const DelegateRow: React.FC<DelegateProps> = ({
  name,
  votingPower,
  stakingQueryClient,
  handledelegateForm,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isPopupOpen, setPopupOpen] = useState(false);

  const openPopup = () => {
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  function findDelegate(delegate: string): Delegate {
    let found: Delegate = delegateList.find(
      (element) => element.name === delegate
    ) || {
      address: delegate,
      name: "",
      socials: ["", ""],
    };

    return found;
  }

  return (
    <Box borderWidth="0px" borderRadius="lg" pt="2" width="full">
      <HStack spacing="4" justify="space-between">
        <Box minW={28}>{name}</Box>
        <Box>{votingPower}</Box>
        <Button
          size="sm"
          fontSize="sm"
          fontWeight="normal"
          colorScheme="teal"
          onClick={openPopup}
        >
          {isMobile ? "View" : "View Delegate"}
        </Button>{" "}
      </HStack>
      <DelegatePopup
        stakingQueryClient={stakingQueryClient}
        isOpen={isPopupOpen}
        onClose={closePopup}
        delegate={findDelegate(name)}
        handledelegateForm={handledelegateForm}
      />
    </Box>
  );
};

interface DelegatePaneProps {
  delegations: Delegation[];
  stakingQueryClient: StakingQueryClient | null;
  stakingClient: StakingClient | null;
  maxCommission: number;
  userStake: UserStake;
  userVP: UserVP;
  getDelegations: () => Promise<void>;
  handledelegateSubmission: (
    delegate: boolean | undefined,
    fluid: boolean | undefined,
    governator: string,
    amount: string | undefined,
    vp: boolean | undefined
  ) => Promise<void>;
}

export const DelegatePane: React.FC<DelegatePaneProps> = (
  props: DelegatePaneProps
) => {
  const {
    delegations,
    stakingQueryClient,
    stakingClient,
    maxCommission,
    userStake,
    userVP,
    getDelegations,
    handledelegateSubmission,
  } = props;
  const { trigger, setTrigger, msg, status, setMsg, showPopup } = usePopup();
  const [commission, setCommission] = useState(0);

  const handledelegateForm: HandleDelegateForm = async (
    fluid: boolean,
    vp: boolean,
    delegate: boolean,
    delegate_index?: number,
    var_governator?: Delegate
  ) => {
    //Initialize variables
    if (var_governator === undefined) {
      throw new Error("Governance UI Error: Governator not found");
    }
    var stored_governator = var_governator as Delegate;

    if (
      delegate_index !== undefined &&
      delegations[delegate_index].amount === 0
    ) {
      //Requery delegations if the user is attempting to undelegate & the governator amount is 0
      getDelegations();
    }

    var amount: string;
    showPopup(
      delegate ? "Delegate" : "Undelegate",
      <p>
        <form
          onSubmit={(event) => {
            console.log("delegate attempt");
            event.preventDefault();
            handledelegateSubmission(
              delegate,
              fluid,
              stored_governator.address,
              amount,
              vp
            );
          }}
        >
          {/*Governator*/}
          <div>
            <label style={{ color: "aqua" }}>Delegate:</label>
            <input
              name="governator"
              defaultValue={var_governator.name}
              type="string"
              onChange={(event) => {
                event.preventDefault();
                stored_governator.address = event.target.value;
              }}
            />
          </div>
          {/*Amount*/}
          <div>
            {delegate === true ? (
              <label style={{ color: "aqua" }}>
                Delegation amount (
                {((userStake.staked ?? 0) / 1_000000).toFixed(0)} staked):
              </label>
            ) : delegate_index === undefined ? (
              <label style={{ color: "aqua" }}>Undelegation amount:</label>
            ) : (
              <label style={{ color: "aqua" }}>
                Undelegation amount ({delegations[delegate_index].amount}{" "}
                delegated):
              </label>
            )}

            <input
              name="amount"
              type="number"
              onChange={(event) => {
                event.preventDefault();
                amount = event.target.value.toString();
              }}
            />
          </div>
          <p>
            The delegate can redelegate your delegations but you always retain
            final control. You also cannot supersede your delegates vote during
            a proposal so choose wisely.
          </p>
          <button
            className="btn"
            style={{
              position: "static",
              top: 205,
              right: 100,
              backgroundColor: "gray",
            }}
            type="submit"
          >
            <div>Submit</div>
          </button>
          {/* Don't show fluid options if user has no delegations */}
          {userVP.userDelegations > 0 ? (
            <button
              className="btn"
              style={{
                position: "absolute",
                opacity: 0.7,
                top: 20,
                right: 100,
                backgroundColor: "gray",
              }}
              type="button"
              onClick={() => {
                setMsg(
                  <p>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handlefluiddelegationSubmission(
                          stored_governator.address,
                          amount
                        );
                      }}
                    >
                      {/*Governator*/}
                      <div>
                        <label style={{ color: "aqua" }}>Delegate:</label>
                        <input
                          name="governator"
                          defaultValue={var_governator.name}
                          type="string"
                          onChange={(event) => {
                            event.preventDefault();
                            stored_governator.address = event.target.value;
                          }}
                        />
                      </div>
                      {/*Amount*/}
                      <div>
                        <label style={{ color: "aqua" }}>
                          Delegation amount:
                        </label>
                        <input
                          name="amount"
                          type="number"
                          onChange={(event) => {
                            event.preventDefault();
                            amount = event.target.value.toString();
                          }}
                        />
                      </div>
                      <button
                        className="btn"
                        style={{
                          position: "absolute",
                          opacity: 0.7,
                          top: 20,
                          right: 100,
                          backgroundColor: "gray",
                        }}
                        type="button"
                        onClick={() => handledelegateForm(true, true, true)}
                      >
                        <div>Switch to your delegations</div>
                      </button>
                      <button
                        className="btn"
                        style={{
                          position: "absolute",
                          top: 150,
                          right: 100,
                          backgroundColor: "gray",
                        }}
                        type="submit"
                      >
                        <div>Submit</div>
                      </button>
                    </form>
                  </p>
                );
              }}
            >
              <div>Switch to your Fluid delegations</div>
            </button>
          ) : null}
        </form>
      </p>
    );
  };

  const handlefluiddelegationSubmission = async (
    governator: string,
    amount: string | undefined
  ) => {
    try {
      await stakingClient
        ?.delegateFluidDelegations({
          governatorAddr: governator,
          mbrnAmount: amount,
        })
        .then((res) => {
          console.log(res);
          showPopup("Success", <div>Delegation to {governator} updated</div>);
        });
    } catch (error) {
      console.log(error);
      let e = error as { message: string };
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4") {
        showPopup("Success", <div>Delegation to {governator} updated</div>);
      } else {
        showPopup("Error", <div>{e.message}</div>);
      }
    }
  };

  const handlecommissionChange = async () => {
    //Initialize variables
    var commission: string = "0";

    showPopup(
      "Change Commission",
      <p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            try {
              stakingClient
                ?.updateDelegations(
                  {
                    commission: commission,
                  },
                  "auto",
                  undefined
                )
                .then(async (res) => {
                  console.log(res);
                  showPopup("Success", <div>Commission changed</div>);
                  setCommission(parseInt(commission) * 100); //Commission is a % so multiply by 100
                });
            } catch (error) {
              console.log(error);
              let e = error as { message: string };
              //This is a success msg but a cosmjs error
              if (
                e.message === "Invalid string. Length must be a multiple of 4"
              ) {
                //format popup message
                showPopup("Success", <div>Commission changed</div>);
                setCommission(parseInt(commission) * 100); //Commission is a % so multiply by 100
              } else {
                showPopup("Error", <div>{e.message}</div>);
              }
            }
          }}
        >
          {/*Commission*/}
          <div>
            <label style={{ color: "aqua" }}>
              Commission as %: Max {maxCommission}, (5 as 5%)
            </label>
            <div>
              <input
                name="commission"
                type="number"
                onChange={(event) => {
                  event.preventDefault();
                  commission = event.target.value;
                }}
              />
            </div>
          </div>
          <button
            className="btn"
            style={{
              position: "absolute",
              top: 150,
              right: 100,
              backgroundColor: "gray",
            }}
            type="submit"
          >
            <div>Submit</div>
          </button>
        </form>
      </p>
    );
  };

  return (
    <Box
      bg="gray.700"
      borderRadius="2xl"
      p={6}
      color="white"
      boxShadow="xl"
      width="full"
      maxWidth="5xl"
    >
      <Info text="Allows one to defer their voting power to a listed Delegate.">
        <Heading size="md" whiteSpace="nowrap" mb={0}>
          Delegate
        </Heading>
      </Info>
      <HStack spacing="4" justify="space-between" mt={2}>
        <Text size="sm" mb={0}>
          {" "}
          Name{" "}
        </Text>
        <Text size="sm" mb={0}>
          {" "}
          Voting Power{" "}
        </Text>
        <Text size="sm" mb={0}>
          {" "}
          Delegate{" "}
        </Text>
      </HStack>
      <Divider mb={2} />
      <VStack spacing="4" maxH="200px" overflowY="auto">
        {delegations
          .filter((delegate) => delegate.delegator)
          .map((delegate, index) => (
            <DelegateRow
              key={index}
              name={delegate.delegator}
              votingPower={Math.sqrt(delegate.amount ?? 0)}
              stakingQueryClient={stakingQueryClient}
              handledelegateForm={handledelegateForm}
            />
          ))}
      </VStack>
      <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
    </Box>
  );
};
