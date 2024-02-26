import React from "react";
import Link from "next/link";
import {
  Box,
  Flex,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { WalletSection } from "./wallet";

export const dashboardPosition = 0;
export const vaultPosition = 700;
export const liquidationPosition = 1580;
export const stakingPosition = 2350;
export const launchPosition = 3270;

//Instead of Routers, just make the app a single page that you can scroll through
export const scrollDown = (position: number) => {
  window.scrollTo({
    top: position,
  });
};

type NavBarProps = {
  setPage: (component: string) => void;
};

const NavBar: React.FC<NavBarProps> = ({ setPage }) => {
  return (
    <Box px={4} py={2} bg="rgba(0, 0, 0, 0.15)" w="100%">
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        {/* Site Name and Logo */}
        <HStack spacing={8} alignItems={"center"}>
          <Box>
            <Flex align="center" gap="0.375rem">
              <Image
                src="./images/MBRN-logo-template.svg"
                alt="Logo"
                boxSize="35px"
              />
              <Text fontSize="2xl" fontWeight="bold" my={0}>
                Membrane
              </Text>
            </Flex>
          </Box>
        </HStack>

        {/* Desktop Tabs */}
        <HStack
          as={"nav"}
          spacing={10}
          display={{ base: "none", lg: "flex" }}
          _hover={{ color: "red" }}
        >
          <Text
            fontWeight="semibold"
            my="0"
            _hover={{ color: "#798eff" }}
            onClick={() => setPage("vault")}
          >
            Vaults
          </Text>
          <Text
            fontWeight="semibold"
            my="0"
            _hover={{ color: "#798eff" }}
            onClick={() => setPage("liquidation")}
          >
            Liquidations
          </Text>
          <Text
            fontWeight="semibold"
            my="0"
            _hover={{ color: "#798eff" }}
            onClick={() => setPage("staking")}
          >
            Governance
          </Text>
          <Text
            fontWeight="semibold"
            my="0"
            _hover={{ color: "#798eff" }}
            mr={2}
            onClick={() => setPage("launch")}
          >
            Lockdrop
          </Text>
          <WalletSection nav={false} />
        </HStack>

        {/* Mobile Menu */}
        <HStack display={{ base: "flex", lg: "none" }} spacing="1rem">
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<HamburgerIcon />}
              aria-label={"Open Menu"}
              bg="gray.600"
              color="white"
              _hover={{ bg: "gray.500" }}
              _expanded={{ bg: "gray.500" }}
              _focus={{ boxShadow: "outline" }}
            />
            <MenuList bg="gray.600" color="white" zIndex={50}>
              <MenuItem bg="gray.600" _hover={{ bg: "gray.500" }}>
                <Text w="full" onClick={() => setPage("vault")}>Vaults</Text>
              </MenuItem>
              <MenuItem bg="gray.600" _hover={{ bg: "gray.500" }}>
                <Text w="full" onClick={() => setPage("liquidation")}>Liquidations</Text>
              </MenuItem>
              <MenuItem bg="gray.600" _hover={{ bg: "gray.500" }}>
                <Text w="full" onClick={() => setPage("staking")}>Governance</Text>
              </MenuItem>
              <MenuItem bg="gray.600" _hover={{ bg: "gray.500" }}>
                <Text w="full" onClick={() => setPage("launch")}>Lockdrop</Text>
              </MenuItem>
            </MenuList>
          </Menu>
          <WalletSection nav={true} />
        </HStack>
      </Flex>
    </Box>
  );
};

export default NavBar;
