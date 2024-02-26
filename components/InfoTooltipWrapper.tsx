import React from "react";
import { Tooltip, Icon, Flex } from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";

const InfoTooltipWrapper = ({ children, text }: { children: React.ReactNode, text: string }) => {
  return (
    <Tooltip
      label={text}
      placement="bottom"
      p={4}
      mx={6}
      borderRadius={5}
      bg="gray.600"
    >
      <Flex align="center">
        {children}
        <Icon as={InfoOutlineIcon} ml={2} color="white" />
      </Flex>
    </Tooltip>
  );
};

export default InfoTooltipWrapper;
