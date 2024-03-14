import {
  VStack,
  Text,
  Divider,
  Box,
  useBreakpointValue,
} from "@chakra-ui/react";


interface QueueStatsItemProps {
  upperText: string;
  lowerText: string;
  color?: string;
}

const QueueStatsItem = ({ upperText, lowerText, color = "cyan.500" }: QueueStatsItemProps) => {
  const fontSize = useBreakpointValue({ base: "sm", md: "md", lg: "lg" });
  return (
    <VStack spacing={1} align="center">
      <Text fontSize={fontSize} fontWeight="bold">
        {upperText}
      </Text>
      <Divider borderColor={color} m={1} />
      <Text fontSize={fontSize} textAlign="center">{lowerText}</Text>
    </VStack>
  );
};

export default QueueStatsItem;
