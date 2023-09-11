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
    launch: "osmo1ew856e7squd4r05fge5ujpz5njej8gzrfjqjsf0cyrvqf9cj6ausjtmzc3",
    discount_vault: "osmo19u339dlg9p29dr26y7wrfq9x0zxcrcxvelangr834md3rh9m20yqffm469",
    governance: "osmo1mueryu7hfmg3jwwnswykug0ly4xryfg9d06cpvmqqhz7zvzypx6qhl4ex2",
    liq_queue: "osmo1cu9uucjt9n532906glsh8c3g6wsumthze5phsv2jj07zjsq72j2sl8ewtq",
    liquidity_check: "osmo1t75thvhsm8832lwyzleghu6cd7ufahsketsmj6xst3jrc0vwpv7s4h9wqv",
    mbrn_auction: "osmo1uwe9cmp7ky3p4gzxq6s0wgharq4khqrdk6amx6dxx8fud76xd9nsgnc7gz",
    oracle: "osmo1d0zg2fmewavcqcfum9sxmzc9jxmt9fyw7esvwvm7lqj9724nqqrq3jmqsx",
    osmosis_proxy: "osmo1mavfhp7sszhetuuwcd66rpz8v63ds056mgr76ng4928tk9kcvu6s9te226",
    positions: "osmo1auth0rdfvak93n6wmva0jnhy0gnzq2dpl7ye5dqzzyqzn8lavl9q6jxuqa",
    stability_pool: "osmo17d52ajv8scxunwf4k60n22ve3vcu40w4x9fv6eaqymkldk50ejmqvpm7kk",
    staking: "osmo1z2gyg9n2lw6urrugtklgvfela76g59m4xg4fzydmrs0nmxck0csszth58k",
    system_discounts: "osmo15ghndfcqxf20hep4z62qpvkr37cgnyuwdkfcat5n6fqrkuserpzsmjcyzp",
    vesting: "osmo1m9guy7fpnyr7fyeu43qj4jy8hwncfxgmf2mqm7kadrnzdxqg74zqdtryk8"
      
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
