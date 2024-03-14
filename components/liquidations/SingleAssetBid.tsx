import { useState } from "react";
import Popup from "../Popup";
import { coins } from "@cosmjs/stargate";
import { denoms } from "../../config";
import { LQClaims } from "../../pages/Liquidations";
import { connectWallet, getWorkingDenom, usePopup } from "./HelperFunctions";
import {
  Box,
  Heading,
  VStack,
  Button,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

export interface SingleAssetBidProps {
  lqClaimables: LQClaims;
  address: any;
  connect: () => void;
  menuAsset: string;
  assets: any;
  liq_queueClient: any;
  queryClient: any;
  setlqClaimables: (value: React.SetStateAction<LQClaims>) => void;
}

export const SingleAssetBid: React.FC<SingleAssetBidProps> = ({
  lqClaimables,
  address,
  connect,
  menuAsset,
  assets,
  liq_queueClient,
  queryClient,
  setlqClaimables,
}) => {
  const [bidAmount, setbidAmount] = useState(5);
  const [saFunctionLabel, setsaFunctionLabel] = useState("Place");
  const [premium, setPremium] = useState<number>();

  function setBidAmount(event: any) {
    event.preventDefault();
    setbidAmount(event.target.value);
  }

  const { trigger, setTrigger, msg, status, showPopup } = usePopup();

  function handlebidExecution() {
    switch (saFunctionLabel) {
      case "Place": {
        handledepositClick();
        break;
      }
      case "Retract": {
        handlewithdrawClick();
        break;
      }
    }
  }

  const handledepositClick = async () => {
    //Check if wallet is connected & connect if not
    if (!connectWallet(address, connect)) return;

    const workingDenom = getWorkingDenom(menuAsset, assets);
    var depositAmount = bidAmount;

    ///Try execution
    try {
      await liq_queueClient
        ?.submitBid(
          {
            bidInput: {
              bid_for: {
                native_token: {
                  denom: workingDenom,
                },
              },
              liq_premium: premium ?? 0,
            },
          },
          "auto",
          undefined,
          coins((depositAmount ?? 0) * 1_000_000, denoms.cdt)
        )
        .then((res: any) => {
          console.log(res);

          showPopup(
            "Success",
            `Bid of ${depositAmount} CDT at a ${premium}% premium successful`
          );
        });
    } catch (error) {
      console.log(error);
      const e = error as { message: string };
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4") {
        showPopup(
          "Success",
          `Bid of ${depositAmount} CDT at a ${premium}% premium successful`
        );
      } else {
        showPopup("Error", e.message);
      }
    }
  };

  const handlewithdrawClick = async () => {
    //Check if wallet is connected & connect if not
    if (!connectWallet(address, connect)) return;

    const workingDenom = getWorkingDenom(menuAsset, assets);
    var withdrawAmount = bidAmount;

    ///Try execution
    try {
      //Query bidId in slot
      await queryClient
        ?.bidsByUser({
          bidFor: {
            native_token: {
              denom: workingDenom,
            },
          },
          user: address ?? "",
        })
        .then(async (res: any) => {
          //Find bidId in slot of premium
          let bidId: string = "";
          for (let i = 0; i < res.length; i++) {
            if (res[i].liq_premium === premium) {
              bidId = res[i].id;
              break;
            }
          }

          //If bidId is not empty, retract bid
          if (bidId !== "") {
            try {
              await liq_queueClient
                ?.retractBid(
                  {
                    bidFor: {
                      native_token: {
                        denom: workingDenom,
                      },
                    },
                    amount: ((withdrawAmount ?? 0) * 1_000_000).toString(),
                    bidId: bidId,
                  },
                  "auto",
                  undefined
                )
                .then((res: any) => {
                  console.log(res);
                  showPopup(
                    "Success",
                    `Retracted ${withdrawAmount} CDT from bid ${bidId}`
                  );
                });
            } catch (error) {
              console.log(error);
              const e = error as { message: string };
              //This is a success msg but a cosmjs error
              if (
                e.message === "Invalid string. Length must be a multiple of 4"
              ) {
                showPopup(
                  "Success",
                  `Retracted ${withdrawAmount} CDT from bid ${bidId}`
                );
              } else {
                showPopup("Error", e.message);
              }
            }
          }
        });
    } catch (error) {
      //We popup for the query error here bc its an execution function that is dependent on this
      console.log(error);
      const e = error as { message: string };
      showPopup("Error", e.message);
    }
  };

  const handleclaimClick = async () => {
    //Check if wallet is connected & connect if not
    if (!connectWallet(address, connect)) return;

    try {
      //Claim for each bidFor asset
      for (let i = 0; i < lqClaimables.bidFor.length; i++) {
        console.log(lqClaimables.bidFor[i]);
        await liq_queueClient
          ?.claimLiquidations({
            bidFor: {
              native_token: {
                denom: lqClaimables.bidFor[i],
              },
            },
          })
          .then((res: any) => {
            console.log(res);
            showPopup("Success", `Claimed ${lqClaimables.bidFor[i]}`);
          });
      }
    } catch (error) {
      console.log(error);
      const e = error as { message: string };
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4") {
        showPopup("Success", `Claimed ${lqClaimables.bidFor}`);
      } else {
        showPopup("Error", e.message);
      }
    }

    //Reset claimables
    setlqClaimables((prevState) => {
      return { bidFor: [""], display: "No Claims" };
    });
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
      <Tabs variant="unstyled">
        <TabList mb="1em">
          <Tab
            fontSize="xl"
            fontWeight="semibold"
            color="gray.400"
            _selected={{ color: "teal.300", borderBottom: "2px solid" }}
            onClick={() => {setsaFunctionLabel("Place")}}
          >
            Place Bid
          </Tab>
          <Tab
            fontSize="xl"
            fontWeight="semibold"
            color="gray.400"
            _selected={{ color: "teal.300", borderBottom: "2px solid" }}
            onClick={() => {setsaFunctionLabel("Retract")}}
          >
            Retract Bid
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
          <BidForm
              buttonText="Place Bid"
              handlebidExecution={handlebidExecution}
              handleclaimClick={handleclaimClick}
              lqClaimables={lqClaimables}
            />
          </TabPanel>
          <TabPanel>
            <BidForm
              buttonText="Retract Bid"
              handlebidExecution={handlebidExecution}
              handleclaimClick={handleclaimClick}
              lqClaimables={lqClaimables}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Popup
        trigger={trigger}
        setTrigger={setTrigger}
        msgStatus={status}
        errorMsg={msg}
      />
    </Box>
  );
};

interface BidFormProps {
  buttonText: string;
  handlebidExecution: () => void;
  handleclaimClick: () => void;
  lqClaimables: LQClaims;
}
const BidForm = ({ buttonText, handlebidExecution, handleclaimClick, lqClaimables }: BidFormProps) => (
  <VStack spacing={4}>
    {/* Premium (discount) Input */}
    <Box width="100%">
      <InputGroup border="1px solid" borderRadius="md">
        <InputLeftAddon
          children="Premium (discount)"
          bg="transparent"
          border="none"
          color="gray.400"
          fontWeight="semibold"
        />
        <NumberInput
          defaultValue={6}
          min={0}
          max={10}
          clampValueOnBlur={false}
          width="100%"
        >
          <NumberInputField
            textAlign="right"
            paddingLeft="0"
            border="none"
            _focus={{
              bg: "transparent",
              border: "none",
              boxShadow: "none",
            }}
          />
          <NumberInputStepper>
            <NumberIncrementStepper color="white" />
            <NumberDecrementStepper color="white" />
          </NumberInputStepper>
        </NumberInput>
      </InputGroup>
    </Box>
    {/* Bid Amount Input */}
    <Box width="100%">
      <InputGroup border="1px solid" borderRadius="md">
        <InputLeftAddon
          children="Bid Amount"
          bg="transparent"
          border="none"
          color="gray.400"
          fontWeight="semibold"
        />
        <NumberInput defaultValue={0} precision={2} step={0.1} width="full">
          <NumberInputField
            borderRadius="md"
            border="none"
            paddingRight="2"
            textAlign="right"
            _focus={{
              bg: "transparent",
              border: "none",
              boxShadow: "none",
            }}
            value={/*bidAmount*/ 0}
            // onChange={setBidAmount}
          />
        </NumberInput>
        <InputRightAddon
          children="CDT"
          bg="transparent"
          border="none"
          color="gray.400"
          paddingLeft="0"
          paddingRight="2"
          fontWeight="semibold"
        />
      </InputGroup>
    </Box>
    <Button
      colorScheme="teal"
      width="full"
      borderRadius="md"
      onClick={handlebidExecution}
    >
      {buttonText}
    </Button>
    <Button
      colorScheme="teal"
      width="full"
      borderRadius="md"
      onClick={handleclaimClick}
      isDisabled={lqClaimables.display === "No Claims"}
      opacity={lqClaimables.display === "No Claims" ? 0.5 : 1}
      cursor={lqClaimables.display === "No Claims" ? "not-allowed" : "pointer"}
      _hover={{
        bg: lqClaimables.display === "No Claims" ? undefined : "teal.600",
      }}
    >
      {lqClaimables.display === "No Claims"
        ? "Claim"
        : `Claim ${lqClaimables.display}`}
    </Button>{" "}
  </VStack>
);
