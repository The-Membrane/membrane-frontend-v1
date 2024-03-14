import React, { useState } from "react";
import { Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react";

interface DropdownMenuProps {
  handleSelect: (asset: string, index: number) => void;
}

const AssetSelectButton: React.FC<DropdownMenuProps> = ({ handleSelect }) => {
  const [selectedOption, setSelectedOption] = useState("OSMO");

  const assets = ["OSMO", "ATOM", "axlUSDC", "USDC", "stATOM", "stOSMO", "TIA", "USDT"];

  const handleMenuItemClick = (asset: string, index: number) => {
    setSelectedOption(asset);
    handleSelect(asset, index);
  };

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        bg="gray.600"
        color="white"
        _hover={{ bg: "gray.500", color: "white" }}
        _expanded={{ bg: "gray.500", color: "white" }}
        _focus={{ boxShadow: "outline", color: "white" }}
      >
        {selectedOption} ▼
      </MenuButton>
      <MenuList bg="gray.600" color="white">
        {assets.map((asset, index) => (
          <MenuItem
            key={asset}
            bg="gray.600"
            _hover={{ bg: "gray.500" }}
            onClick={() => handleMenuItemClick(asset, index)}
          >
            {asset}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default AssetSelectButton;