import { useState } from "react";
import Popup from "../Popup";
import { coins } from "@cosmjs/stargate";
import { denoms } from "../../config";
import { connectWallet, usePopup } from "./HelperFunctions";
import {
  StabilityPoolClient,
  StabilityPoolQueryClient,
} from "../../codegen/stability_pool/StabilityPool.client";
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

interface OmniAssetBidProps {
  address: string | undefined;
  connect: () => void;
  sp_client: StabilityPoolClient | null;
  sp_queryClient: StabilityPoolQueryClient | null;
  setcapitalAhead: (value: number) => void;
  setuserclosestDeposit: (value: number) => void;
  userTVL: number;
  setuserTVL: (value: number) => void;
  SPclaimables: string;
}

export const OmniAssetBid: React.FC<OmniAssetBidProps> = ({
  address,
  connect,
  sp_client,
  sp_queryClient,
  setcapitalAhead,
  setuserclosestDeposit,
  userTVL,
  setuserTVL,
  SPclaimables,
}) => {
  const [omniAmount, setOmniAmount] = useState(5);
  const [oaFunctionLabel, setoaFunctionLabel] = useState("Place");
  const { trigger, setTrigger, msg, status, showPopup } = usePopup();

  function handleOmniExecution() {
    switch (oaFunctionLabel) {
      case "Join": {
        // handleStabilityDeposit();
        break;
      }
      case "Exit": {
        handleStabilityWithdraw();
        break;
      }
    }
  }

  const handleStabilityDeposit = async () => {
    if (!connectWallet(address, connect)) return;

    try {
      await sp_client
        ?.deposit(
          {},
          "auto",
          undefined,
          coins((omniAmount ?? 0) * 1_000_000, denoms.cdt)
        )
        .then(async (res) => {
          console.log(res);
          showPopup("Success", `Deposited ${omniAmount} CDT`);

          //Query capital ahead of user deposit
          await sp_queryClient
            ?.capitalAheadOfDeposit({
              user: address ?? "",
            })
            .then((res) => {
              console.log(res);
              //set capital ahead of user deposit
              setcapitalAhead(parseInt(res.capital_ahead ?? 0) / 1_000_000);
              //set user closest deposit in K
              if (res.deposit !== undefined) {
                setuserclosestDeposit(
                  parseInt(res.deposit.amount ?? 0) / 1_000_000
                );
              } else {
                //set to 0 if no deposit
                setuserclosestDeposit(0);
              }
            });
          //Query user's total deposit
          await sp_queryClient
            ?.assetPool({
              user: address ?? "",
            })
            .then((res) => {
              console.log(res);
              //Calc user tvl
              var tvl = 0;
              for (let i = 0; i < res.deposits.length; i++) {
                tvl += parseInt(res.deposits[i].amount) / 1_000_000;
              }
              //set user tvl
              setuserTVL(tvl);
            });
        });
    } catch (error) {
      console.log(error);
      const e = error as { message: string };
      //Format popup
      showPopup("Error", e.message);
    }
  };

  const handleStabilityWithdraw = async () => {
    if (!connectWallet(address, connect)) return;

    try {
      await sp_client
        ?.withdraw(
          {
            amount: ((omniAmount ?? 0) * 1_000_000).toString(),
          },
          "auto",
          undefined
        )
        .then(async (res) => {
          console.log(res);
          showPopup("Success", "");

          //Query capital ahead of user deposit
          await sp_queryClient
            ?.capitalAheadOfDeposit({
              user: address ?? "",
            })
            .then((res) => {
              console.log(res);
              //set capital ahead of user deposit
              setcapitalAhead(parseInt(res.capital_ahead ?? 0) / 1_000_000);
              //set user closest deposit in K
              if (res.deposit !== undefined) {
                setuserclosestDeposit(
                  parseInt(res.deposit.amount ?? 0) / 1_000_000
                );
              } else {
                //set to 0 if no deposit
                setuserclosestDeposit(0);
              }
            });
          //Query user's total deposit
          await sp_queryClient
            ?.assetPool({
              user: address ?? "",
            })
            .then((res) => {
              console.log(res);
              //Calc user tvl
              var tvl = 0;
              for (let i = 0; i < res.deposits.length; i++) {
                tvl += parseInt(res.deposits[i].amount) / 1_000_000;
              }
              //Format pop-up
              if (tvl < userTVL) {
                showPopup("Success", `Withdrew ${omniAmount} CDT`);
                //set user tvl
                setuserTVL(tvl);
              } else {
                showPopup("Success", `Unstaked ${omniAmount} CDT`);
              }
            });
        });
    } catch (error) {
      console.log(error);
      const e = error as { message: string };
      //Format popup
      showPopup("Error", e.message);
    }
  };

  const handleStabilityClaim = async () => {
    //Check if wallet is connected & connect if not
    if (address === undefined) {
      connect();
      return;
    }
    try {
      await sp_client?.claimRewards("auto", undefined).then((res) => {
        console.log(res);
        showPopup("Success", `Claimed ${SPclaimables} CDT`);
      });
    } catch (error) {
      console.log(error);
      const e = error as { message: string };
      showPopup("Error", e.message);
    }
  };

  const setOmniAmountHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setOmniAmount(Number(event.target.value));
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
            onClick={() => {
              setoaFunctionLabel("Place");
            }}
          >
            Join Queue
          </Tab>
          <Tab
            fontSize="xl"
            fontWeight="semibold"
            color="gray.400"
            _selected={{ color: "teal.300", borderBottom: "2px solid" }}
            onClick={() => {
              setoaFunctionLabel("Retract");
            }}
          >
            Exit Queue
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BidForm
              buttonText="Join Queue"
              handleOmniExecution={handleOmniExecution}
              handleStabilityClaim={handleStabilityClaim}
              SPclaimables={SPclaimables}
            />
          </TabPanel>
          <TabPanel>
            <BidForm
              buttonText="Exit Queue"
              handleOmniExecution={handleOmniExecution}
              handleStabilityClaim={handleStabilityClaim}
              SPclaimables={SPclaimables}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

interface BidFormProps {
  buttonText: string;
  handleOmniExecution: () => void;
  handleStabilityClaim: () => void;
  SPclaimables: string;
}
const BidForm = ({
  buttonText,
  handleOmniExecution,
  handleStabilityClaim,
  SPclaimables,
}: BidFormProps) => (
  <>
    <VStack spacing={4}>
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
        onClick={handleOmniExecution}
      >
        {buttonText}
      </Button>
      <Button
        colorScheme="teal"
        width="full"
        borderRadius="md"
        onClick={handleStabilityClaim}
        isDisabled={SPclaimables === "No Claims"}
        opacity={SPclaimables === "No Claims" ? 0.5 : 1}
        cursor={
          SPclaimables === "No Claims" ? "not-allowed" : "pointer"
        }
        _hover={{
          bg: SPclaimables === "No Claims" ? undefined : "teal.600",
        }}
      >
        {SPclaimables === "No Claims"
          ? "Claim"
          : `Claim ${SPclaimables}`}
      </Button>{" "}
    </VStack>
  </>
);

export default OmniAssetBid;
