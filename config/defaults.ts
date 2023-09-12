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
    launch: "osmo1ew856e7squd4r05fge5ujpz5njej8gzrfjqjsf0cyrvqf9cj6ausjtmzc3", //osmo1n2p5809dmllt8nn4fydsz9qg2qwzutrd562y5xh8zvnfakngmhmsunslda the addr of the rest of the addresses
    discount_vault: "osmo13r7p6addxj0sxwkjvl6039uuhs09m5yxe800qwhrzxupkz4jye6swdtk5z",
    governance: "osmo1qlcfzv5r755akv3ncyc52a4h6n97r9shzeyx0rd85232ferzrs6s3wq2ps",
    liq_queue: "osmo100z2gn9td0u5aanszrj3chgluu7lscq2vfezq95u94v9satmdf0qw5s9uc",
    liquidity_check: "osmo15n75emczgzdj2mdn9qfp7k67e2nvxlvla79yrhwv7u4an4sg6wtqwu59gv",
    mbrn_auction: "osmo1ly2n6apchlrpwqk806m2dqq6w7juqrgja2zguze80r39veleruqqe9nn9u",
    oracle: "osmo1sdcapjth295auapkmhz727dedp9q07xqcgmyns8jey8jmntctpeq6j8cmd",
    osmosis_proxy: "osmo1j7fas6rpg2syj33ttac8jje60cltph0l37gvk5er3j3y6z4c9yfsl30q8v",
    positions: "osmo1sfw0tzrqxms8f2kq66epul6s3cgrc8677g9hfkt5pvlgcnsa3rkqua70q7",
    stability_pool: "osmo14uqgu52cah0f6cy9urmyql88x9vt445hrdtz7yfagnwsqf3vaqwsxkw2uz",
    staking: "osmo1vpx0yap7yce959tdppnlv5k3c6cpca23n9kxnyp32mmdvekgv9gsfczctf",
    system_discounts: "osmo1jjaf7w8xd5p8czxurekyk29xwehmh5tmpa9zc3x7sfw5a0rph8ysl2afyp",
    vesting: "osmo130jx0jzez6q88qmy3qrwznz6sqnv2ca8uzu8ec64k5kj9krhdlhseec4n5"
      
      
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
