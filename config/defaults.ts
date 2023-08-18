import { assets } from 'chain-registry';
import { AssetList, Asset } from '@chain-registry/types';
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { AminoTypes } from "@cosmjs/stargate";
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
    discount_vault: "osmo1p0w9h8km3un4dsgpgc0cumch73swwgfc0mrw626elkajuzurn87sfmqgz3",
    governance: "osmo1hxw4qjtnnzaxexhncdsp8hw9yxyvdrr7kx0jgl592dc6qcn4zmpqddqgrg",
    liq_queue: "osmo18d7fx6cc3vfuvlam6pf7yppwcj0u34892j90pwfnhspj8gxxd6hs94gkxz",
    liquidity_check: "osmo1dwtgg7eld3vunj6gnd6ce2cf6l6vl74twjlfhrmne8xgvqczpdmqd3dnmj",
    mbrn_auction: "osmo1tqnnjd64l0ta43uvpdkfemeszhlqz9prwejpcavg0722ycee3y6q5yxayr",
    oracle: "osmo1pxrj4rqxxd2m6my3l3uk64rdh2u3f7m0zkzlmklnzj496f7fcczqky6gym",
    osmosis_proxy: "osmo1v0us2salr8t28mmcjm87k2zrv3txecc8e2gz9kgvw77xguedus4qlnkl0t",
    positions: "osmo1rdt9et28qhawtccxmxe3rk04rgkaumnzlac4s8km22j0tp0uaqcq5qxqsv",
    stability_pool: "osmo1ssk2zca9r49c3t402m8pt2qxfxz7t7kkk04v3pxdlfmfwc4k9hxqdp0dw4",
    staking: "osmo1uvd7rgrxt8rqahm53qavnldf2p8xyrw79zf59sf87t666m75cj9s9jceza",
    system_discounts: "osmo13hpnmuach9vzejax2tfheydd3pv3dchqqgjuwthfm2kfvdlqx8nsthlk2h",
    vesting: "osmo1d4yq4nzn7hjandxua7jw3xgjled93unat4qftv8xvl2hwr3typmqul22qp"
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
