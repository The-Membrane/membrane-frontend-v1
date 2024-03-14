import React from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import ChartComponent from "./Chart"; // Adjust the import path as necessary
import QueueStatsItem from "./QueueStatsItem";
import AssetSelectButton from "./AssetSelectButton";
import Info from "../InfoTooltipWrapper";

interface Bar {
  asset: string;
  tvl: string;
}
interface SingleAssetPaneProps {
  barGraph: Bar[][];
  handleSelect: (asset: string, index: number) => void;
  selectedAsset: string;
  stats: string[];
}

const SingleAssetPane: React.FC<SingleAssetPaneProps> = ({
  barGraph,
  handleSelect,
  selectedAsset,
  stats,
}) => {
  const barSize = useBreakpointValue({ xs: 10, base: 15, md: 20, lg: 20 });

  const dataset: number[] =
    barGraph
      .find((bars) => bars[0].asset === selectedAsset)
      ?.map((bar) => Number(bar.tvl)) || [];

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
        <Info text="Liquidations start at the lowest premium for each asset, and proportionally distribute the liquidated asset to each wallet at the given precentage.">
          <Heading size="md" whiteSpace="nowrap">
            Single Asset
          </Heading>
        </Info>
        <AssetSelectButton handleSelect={handleSelect} />
      </Flex>
      <Flex mr={8}>
        <ChartComponent dataset={dataset} barSize={barSize} borderRadius={10} />
      </Flex>
      <Flex justifyContent="space-around" alignItems="center" mt={8}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5}>
          <QueueStatsItem upperText={stats[0]} lowerText="TVL as Collateral" />
          <QueueStatsItem upperText={stats[1]} lowerText="Total Asset Bids" />
          <QueueStatsItem upperText={stats[2]} lowerText="Asset Price" />
          <QueueStatsItem upperText={stats[3]} lowerText="Your Bids" />
        </SimpleGrid>
      </Flex>
    </Box>
  );
};

export default SingleAssetPane;
