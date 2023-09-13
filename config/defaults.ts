import { assets } from 'chain-registry';
import { AssetList, Asset } from '@chain-registry/types';
import { GeneratedType } from "@cosmjs/proto-signing";
import { AminoTypes } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/stargate/node_modules/@cosmjs/proto-signing/build/registry";
import {
    cosmosAminoConverters,
    cosmosProtoRegistry,
    cosmwasmAminoConverters,
    cosmwasmProtoRegistry,
    ibcProtoRegistry,
    ibcAminoConverters,
    osmosisAminoConverters,
    osmosisProtoRegistry
} from 'osmojs';

// export const chainName = 'osmosis';
export const chainName = 'osmosistestnet';
export const stakingDenom = 'uosmo';
export const feeDenom = 'uosmo';

// export const chainName = 'cosmwasmtestnet';
// export const stakingDenom = 'umlg';
// export const feeDenom = 'uand';

// export const cw20ContractAddress = 'wasm1p7vmrhl3s0fyl0m9hk2hlm7uuxq84hztur63n8ryh85chh30vt6q89shcv'
export const cw20ContractAddress = 'osmo1y0ywcujptlmnx4fgstlqfp7nftc8w5qndsfds9wxwtm0ltjpzp4qdj09j8'

export const testnetAddrs = {
    launch: "osmo1ew856e7squd4r05fge5ujpz5njej8gzrfjqjsf0cyrvqf9cj6ausjtmzc3", //osmo1u7av2szvllejfctr6rudr3xn7yjml7lps3rvgh7vryfhpuxtzefqh5vlhr the addr of the rest of the addresses
    discount_vault: "osmo1wy95fjh40459yfvp5xnprakpq2fwvuewpnpadyrt2rkj7tfnflss7qw8kw",
    governance: "osmo1t6qq3snh26q62324t7ppjrhen8k4ad7lt3alj0fywcgwl9gl2weqpaxzpf",
    liq_queue: "osmo1rhhnshclqd0putytztqjzwhgp5fvyra84ynmk7gvg80x82qu8rvqs9y7gv",
    liquidity_check: "osmo1ej0qmswac2n23aylnke4rhu728na7ptuafqwhd4sdwskh6aln9aqgd7fnj",
    mbrn_auction: "osmo13zlzg6vfwq535p9777s9f94gwx0luurfrnr7ng0u6zsatu0nmxnq75pvtl",
    oracle: "osmo1krfwupaezx5ltks6edcu00d6avugsvxyhedx0fk7kuyt4g6gya9sfg7u2c",
    osmosis_proxy: "osmo1twhn62257w5eupxds0celpy7vggfsyrt0dx84y2aercazmqymxyq2h3fnu",
    positions: "osmo1ug00cl7pg2wn4g68cg6axvjwcdywyec0znxcjuug8ldgqyflndysm36eg8",
    stability_pool: "osmo10w047vtqun66er2pjy2hcnu4smnqr6tqen73y7qq6mzyk88m0e7s3mektt",
    staking: "osmo1atpqe8ed4cy8w9ql7p4qcdde8v4f6pxkekn0k2k29g5pq6gmyu3sxd9wcf",
    system_discounts: "osmo1nd5hcs2qsvcjxd3gff0htz6h72qwcqsl0pgnkt67tsltalzez8kqg7wslc",
    vesting: "osmo1cn7w27eje7fg0wgmay5vpsu0n9wlj7dqjqhtzyh75lhezkhl33js3v4jsz"      
  };

export const chainassets: AssetList = assets.find(
    (chain) => chain.chain_name === chainName
) as AssetList;

export const coin: Asset = chainassets.assets.find(
    (asset) => asset.base === stakingDenom
) as Asset;

const protoRegistry: ReadonlyArray<[string, GeneratedType]> = [
    ...cosmosProtoRegistry,
    ...cosmwasmProtoRegistry,
    ...ibcProtoRegistry,
    ...osmosisProtoRegistry
];

const aminoConverters = {
    ...cosmosAminoConverters,
    ...cosmwasmAminoConverters,
    ...ibcAminoConverters,
    ...osmosisAminoConverters
};

export const registry = new Registry(protoRegistry);
export const aminoTypes = new AminoTypes(aminoConverters);
