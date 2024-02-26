import { useState } from "react";
import { EmissionsSchedule, UserStake } from "../../pages/Governance";
import usePopup from "./HelperFunctions";
import { coins } from "@cosmjs/stargate";
import { denoms } from "../../config";
import { StakingClient } from '../../codegen/staking/Staking.client';
import Popup from "../Popup";
import { UserClaims } from '../../pages/Governance';
import { unstakingPeriod } from "../../pages";

import {
    Box,
    Heading,
    VStack,
    Button,
    InputGroup,
    InputLeftAddon,
    NumberInput,
    NumberInputField,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
  } from "@chakra-ui/react";
  
  interface StakePaneProps {
    userStake: UserStake;
    setUserStake: (value: React.SetStateAction<UserStake>) => void;
    emissionsSchedule: EmissionsSchedule;
    userClaims: UserClaims;
    walletMBRN: number;
    address: string | undefined;
    connect: () => void;
    stakingClient: StakingClient | null;
  }


const StakePane = ({
    userStake,
    setUserStake,
    emissionsSchedule,
    userClaims,
    walletMBRN,
    address,
    connect,
    stakingClient,
}: StakePaneProps) => {

//==================================== Stake Button =======================================
    const { trigger, setTrigger, msg, status, showPopup } = usePopup();
    const [stakeAmount, setstakeAmount] = useState();
  
    const handlesetstakeAmount = (event: any) => {
      event.preventDefault();
      setstakeAmount(event.target.value);
    }
  
    const handlestakeClick = async () => {
      //Check if wallet is connected & connect if not
      if (address === undefined) {
        connect();
        return;
      }
      try {
        await stakingClient
          ?.stake(
            {},
            "auto",
            undefined,
            coins((stakeAmount ?? 0) * 1_000_000, denoms.mbrn)
          )
          .then((res) => {
            console.log(res);
            showPopup("Success", <div>Staked</div>);
            //Update user stake
            //@ts-ignore
            setUserStake((prevState) => {
              return {
                ...prevState,
                staked: +prevState.staked + +((stakeAmount ?? 0) * 1_000_000),
              };
            });
          });
      } catch (error) {
        console.log(error);
        const e = error as { message: string };
        //This is a success msg but a cosmjs error
        if (e.message === "Invalid string. Length must be a multiple of 4") {
          showPopup("Success", <div>Staked</div>);
          //Update user stake
          //@ts-ignore
          setUserStake((prevState) => {
            return {
              ...prevState,
              staked: +prevState.staked + +((stakeAmount ?? 0) * 1_000_000),
            };
          });
        } else {
          showPopup("Error", <div>{e.message}</div>);
        }
      }
    };

//==================================== Unstake Button =======================================
const [unstakeAmount, setunstakeAmount] = useState();

const unstakingAmount = parseFloat((userStake.unstaking.amount / 1_000_000).toFixed(2));
const unstakingTotal = parseFloat((userStake.unstaking_total / 1_000_000).toFixed(2));
const progress =
  userStake.unstaking.amount !== 0
  ? parseFloat((((unstakingPeriod - userStake.unstaking.timeLeft) / unstakingPeriod) * 100).toFixed(2))
  : 0;


const handlesetunstakeAmount = (event: any) => {
  event.preventDefault();
  setunstakeAmount(event.target.value);
}

//Helper function to update user stake
const updateUserStake = (amountChange: number) => {
  if (userStake.unstaking.amount === 0) {
    setUserStake((prevState) => ({
      staked: +prevState.staked - amountChange,
      unstaking_total: +prevState.unstaking_total + amountChange,
      unstaking: {
        amount: +prevState.unstaking.amount + amountChange,
        timeLeft: unstakingPeriod,
      },
    }));
  } else {
    setUserStake((prevState) => ({
      ...prevState,
      unstaking_total: +prevState.unstaking_total + amountChange,
      staked: +prevState.staked - amountChange,
    }));
  }
};

const handleunstakeClick = async () => {
  // Check if wallet is connected & connect if not
  if (address === undefined) {
    connect();
    return;
  }

  try {
    const amountToUnstake = (unstakeAmount ?? 0) * 1_000_000;

    await stakingClient?.unstake({
      mbrnAmount: amountToUnstake.toString(),
    }, "auto", undefined).then((res) => {
      console.log(res);
      showPopup("Success", <div>Unstaked</div>);
      updateUserStake(amountToUnstake);
    });
  } catch (error) {
    console.log(error);
    const e = error as { message: string };

    // This is a success msg but a cosmjs error
    if (e.message === "Invalid string. Length must be a multiple of 4") {
      showPopup("Success", <div>Unstaked</div>);
      updateUserStake((unstakeAmount ?? 0) * 1_000_000);
    } else {
      showPopup("Error", <div>{e.message}</div>);
    }
  }
};

//==================================== Claim Button =======================================
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
        showPopup("Success", <div>Claimed</div>);
      })
    } catch (error) {
      console.log(error)
      const e = error as {message: string};
      //This is a success msg but a cosmjs error
      if (e.message === "Invalid string. Length must be a multiple of 4"){
        showPopup("Success", <div>Claimed</div>);
      } else {
        showPopup("Error", <div>{e.message}</div>);
      }
    }
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
            >
              Stake
            </Tab>
            <Tab
              fontSize="xl"
              fontWeight="semibold"
              color="gray.400"
              _selected={{ color: "teal.300", borderBottom: "2px solid" }}
            >
              Unstake
            </Tab>
            <Tab
              fontSize="xl"
              fontWeight="semibold"
              color="gray.400"
              _selected={{ color: "teal.300", borderBottom: "2px solid" }}
            >
              Claim
            </Tab>
          </TabList>
  
          <TabPanels>
            <TabPanel>
              <BidForm 
                buttonText="Stake MBRN" 
                isClaimTab={false} 
                userStake={userStake} 
                walletMBRN={walletMBRN}
                userClaims={userClaims}
                buttonClick={handlestakeClick} 
                />
            </TabPanel>
            <TabPanel>
              <BidForm 
                buttonText="Unstake MBRN" 
                isClaimTab={false} 
                userStake={userStake} 
                walletMBRN={walletMBRN}
                userClaims={userClaims}
                buttonClick={handleunstakeClick}
              />
            </TabPanel>
            <TabPanel>
              <BidForm 
                buttonText="Claim" 
                isClaimTab 
                userStake={userStake}
                walletMBRN={walletMBRN}
                userClaims={userClaims}
                buttonClick={handleclaimClick}
                />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    );
  };

interface BidFormProps {
    buttonText: string;
    isClaimTab: boolean;
    userStake: UserStake;
    walletMBRN: number;
    userClaims: UserClaims;
    buttonClick: () => Promise<void>;
  
}
  
const BidForm = ({ buttonText, isClaimTab, userStake, walletMBRN, userClaims, buttonClick }: BidFormProps) => (
    <>
      <VStack spacing={4}>
        <Box width="100%">
          <Heading size="sm" fontWeight="medium">
            {isClaimTab ? `Claimable MBRN: ${userClaims.mbrnClaims}` : `Staked: ${parseFloat((userStake?.staked / 1_000_000).toFixed(2))}`}
          </Heading>
        </Box>
  
        <Box width="100%">
          <Heading size="sm" fontWeight="medium">
            {isClaimTab ? `Claimable CDT: ${userClaims.cdtClaims}` : `In Wallet: ${walletMBRN?.toFixed(2)} MBRN`}
          </Heading>
        </Box>
  
        <Box width="100%" mt={4}>
          {!isClaimTab && (
            <InputGroup border="1px solid" borderRadius="md">
              <InputLeftAddon
                bg="transparent"
                border="none"
                color="gray.400"
                fontWeight="semibold"
              >
                {buttonText === "Stake MBRN" ? "Stake" : "Unstake"}
              </InputLeftAddon>
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
              <InputLeftAddon
                children="MBRN"
                bg="transparent"
                border="none"
                color="gray.400"
                paddingLeft="0"
                paddingRight="2"
                fontWeight="semibold"
              />
            </InputGroup>
          )}
        </Box>
        <Button colorScheme="teal" width="full" borderRadius="md" onClick={buttonClick}>
          {buttonText}
        </Button>
      </VStack>
    </>
  );
  
  export default StakePane;
  