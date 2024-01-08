import { assets } from 'chain-registry';
import { AssetList, Asset } from '@chain-registry/types';
import { GeneratedType } from "@cosmjs/proto-signing";
import { AminoTypes } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing/build/registry";
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

export const chainName = 'osmosis';
// export const chainName = 'osmosistestnet';
export const stakingDenom = 'uosmo';
export const feeDenom = 'uosmo';

// export const chainName = 'cosmwasmtestnet';
// export const stakingDenom = 'umlg';
// export const feeDenom = 'uand';

// export const cw20ContractAddress = 'wasm1p7vmrhl3s0fyl0m9hk2hlm7uuxq84hztur63n8ryh85chh30vt6q89shcv'
// export const cw20ContractAddress = 'osmo1y0ywcujptlmnx4fgstlqfp7nftc8w5qndsfds9wxwtm0ltjpzp4qdj09j8'

/// Mainnet addrs but for code sake we are leaving the name
export const testnetAddrs = {
    launch: "osmo1g6hgj3eu9ju4vuaprjxdzj97ecnuczytve3junulgnwlamnndl5q6k73w6",
    
    discount_vault: "osmo1v8wckds5lvsdd0xrragvleu8srxprjpwdl7mga5uygnwmz5e7qzsl5zexw",
    governance: "osmo1wk0zlag50ufu5wrsfyelrylykfe3cw68fgv9s8xqj20qznhfm44qgdnq86", //old gov: osmo19h8huy2hz4q7detxzv2r2erlsvlq8hzlsquu6n5x83775va4qgkskf20kq
    liq_queue: "osmo1ycmtfa7h0efexjxuaw7yh3h3qayy5lspt9q4n4e3stn06cdcgm8s50zmjl",
    liquidity_check: "osmo1xxx0yuqhmwekt44q00jrf3rwvfa70rpeu622q0x56yaf423vq93q3qpzux",
    mbrn_auction: "osmo1qwdlg9le9kdrvgyp35jxz53m8zhdssyvxvyevmdxcn852h6dq9gqknf2aa",
    oracle: "osmo160t4k7x8axfd335s0rj5jdffzag684tjrzchlwmqk23xte32alvq6nfz6k",
    osmosis_proxy: "osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd",
    positions: "osmo1gy5gpqqlth0jpm9ydxlmff6g5mpnfvrfxd3mfc8dhyt03waumtzqt8exxr",
    stability_pool: "osmo1326cxlzftxklgf92vdep2nvmqffrme0knh8dvugcn9w308ya9wpqv03vk8",
    staking: "osmo1fty83rfxqs86jm5fmlql5e340e8pe0v9j8ez0lcc6zwt2amegwvsfp3gxj",
    system_discounts: "osmo1p0hvtat69dash8f0w340n2kjdkdfq0ggyp77mr426wpnfwp3tjyqq6a8vr",
    vesting: "osmo1flwr85scpcsdqa8uyh0acgxeqlg2ln8tlklzwzdn4u68n3p5wegsgspjf6"
};

export const denoms = {
  mbrn: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
  cdt: "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
  osmo: "uosmo",
  //mainnet atom ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2
  atom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
  //mainnet axlUSDC ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858
  axlUSDC: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
  //mainnet "gamm/pool/1"
  atomosmo_pool: "gamm/pool/1",
  //mainnet "gamm/pool/678"
  osmousdc_pool: "gamm/pool/678",
  //Noble USDC
  usdc: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
  //Stride Atom
  stAtom: "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
  //Stride Osmo
  stOsmo: "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
};
export const quadraticVoting = true;
export interface Delegate {
    name: string;
    address: string;
    socials: [string, string]; // [twitter, discord]
};
/// List of proposals to skip
export const skipProposals = ["2", "10"];
/// Delegates List (non-exhaustive but makes it better UX for stakers to choose from a list)
export const delegateList = [
    {
        name: "RoboMcGobo",
        address: "osmo1nktatq53eah8efefsry33yg3zkhrrzwq3k6wg7",
        socials: ["@RoboMcGobo", "robomcgobo"]
    },
    {
        name: "Johnny Wyles",
        address: "osmo1dplx2zw3mjk5lam6fnv5q2yxldcshs3wl3s8ph",
        socials: ["@JohnnyWyles87", "johnnywyles"]
    },
    {
        name: "Macks Wolfard",
        address: "osmo1ckgwfferpjy6usm3nvyjknat5d6frrhypl6kku",
        socials: ["@MacksWolf", "mackswolf"]
    },
    {
        name: "Nostradamus",
        address: "osmo1xp0qs6pkay2jssu58p8eap0epdhwx5mqlhs4v7",
        socials: ["@nostradamus411", "nostradamus.nosnode"]
    },
    {
        name: "Banana DAO",
        address: "osmo1uvnk984yhpw48jfu5srvsrqdt03kkvlcjqx8x5",
        socials: ["@thebananadao", "arcmosis"]
    },
    {
        name: "Trix",
        address: "osmo13gu58hzw3e9aqpj25h67m7snwcjuccd7v4p55w",
        socials: ["@brane_trix", "tri.xxx"]
    },
] as Delegate[];
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
