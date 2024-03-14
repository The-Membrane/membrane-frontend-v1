import { Box, Flex, Heading, SimpleGrid } from "@chakra-ui/react";
import QueueStatsItem from "./QueueStatsItem";
import OmniChartComponent from "./OmniChart";
import Info from "../InfoTooltipWrapper";
import { DataItem } from "./OmniChart";

interface OmniAssetPaneProps {
  stats: string[];
  data: DataItem[];
}

const OmniAssetPane: React.FC<OmniAssetPaneProps> = ({ stats, data }) => {

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
      <Flex justifyContent="space-between" alignItems="center" mb={8}>
        <Info text="Liquidations are distributed using a queue system, so all liquidity ahead of your bid is used first.">
          <Heading size="md" whiteSpace="nowrap">
            Omni Asset
          </Heading>
        </Info>
      </Flex>
      <Flex mr={8}>
        <OmniChartComponent dataset={data}/>
      </Flex>
      <Flex justifyContent="space-around" alignItems="center" mt={8}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5}>
          <QueueStatsItem upperText={stats[0]} lowerText="Total Value Locked" />
          <QueueStatsItem
            upperText={stats[1]}
            lowerText="Wallet Value Locked"
          />
          <QueueStatsItem upperText={stats[2]} lowerText="Nearest Position" />
          <QueueStatsItem
            upperText={stats[3]}
            lowerText="Total Capital Ahead"
          />
        </SimpleGrid>
      </Flex>
    </Box>
  );
};

export default OmniAssetPane;
