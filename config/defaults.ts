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
    launch: "osmo145eqzncan6eu4m36mjfj779nqcm8twg5j0cn9l5nch36mvyu8tfqlhc00p",
    discount_vault: "osmo13nvkpqwmra35zjyg3ztx735jslq0ngsk649esgv76ujj3pmcshgs48wta3",
    governance: "osmo132pp2qzwkckgydmvg7hrxwtjkj44zamuk87l54d8yd7t6h67l80qaphfnv",
    liq_queue: "osmo1xa6mcwvhyqv9krtscwxvl7d0w6ef0nz9tv28fug5tjx7wgukarqsv95jtv",
    liquidity_check: "osmo1nq37he853ma46dr7xrnzwz5y62jnte02l7sgq8gxqngmseqxz0qsxeu6fp",
    mbrn_auction: "osmo16zj94q3m6szy9rz24zznq9ygmt60je3czcdt9svaw7lqn4wmawks634g7a",
    oracle: "osmo1wuat5jpawsrpvfsk820x9ysd2z80jwcn36tlt92h3wnawggra7dsuvmm0y",
    osmosis_proxy: "osmo1nw336rzf03vrlgu90vj6v53j6t2nquvk0vda0qv78c8ldukk6f8snkphpc",
    positions: "osmo1f369k6q7gm5rcwjhjfrwe7xyfxnuf5t4e9ld0zp5a3waeffdt5wq4jam43",
    stability_pool: "osmo1490c8kx4fsqcwpe2zru68pzehhdfzl35lnvlc04v2e30ajcfeh8qstlgpv",
    staking: "osmo1069gsa7urse4x6h88h0vqx49whpfp6ct3d58c396p6kc3v64v0uquasrzk",
    system_discounts: "osmo1y202l6njelwyy9ja5452myzduq6flxywtalqthqpzv6qatuuqm3qjpun97",
    vesting: "osmo100tzdlzpalxt8nalzd5vyw40aqjn5uxynjewszc7tughvdm3ahqsz6a7ya"
      
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
