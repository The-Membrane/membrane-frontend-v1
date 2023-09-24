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
    launch: "osmo1ew856e7squd4r05fge5ujpz5njej8gzrfjqjsf0cyrvqf9cj6ausjtmzc3", //osmo13u22ujzwegjmjnj0jcy8t70tlj9r5jrn2fj5eqwcdt4j073arz7sv6srfz the addr of the rest of the addresses
        discount_vault: "osmo16hhpsm67f352g069y762x945sma4t4yu0lqltx259ny7qz27pfeq5j2qhh",
        governance: "osmo15z78zy7gfa3thm0u4j2u2ung92xneuet80fj9zzgfx4r38p3jmzqa959ya",
        liq_queue: "osmo1dpkzllwj0rnsqw2345nt9eljkrdjyx35lry8ce8gtlc0v2f566hsu0g9uj", //"osmo1yxerk9spx9lfmdm2rk609579ar0e3zrxlvureumlqglg5ejfm5tqx75uky", matches the other contracts
        liquidity_check: "osmo185a8ggdwhd4um4ddwmjna5a9k39tyfqptv2wav4j0lg9dmxa0c0s5a0m9l",
        mbrn_auction: "osmo1hdfu6elcexza42d0cxlcv7az7037nrhht2qzel20ch0hrtt0prqs0hygnh",
        oracle: "osmo1pshz0e5h4agsn2lqy2fjxmdhqglv5mg6jawyu78yg55sh4qxrr2q97my3w",
        osmosis_proxy: "osmo173cvuzxqkt85vh4u4panr5yvgfyrzr8n0unvy2tkwqjdrd44p3vqksalzz",
        positions: "osmo1gptegj8x06d80vhs8pzjd32ullrypf3qchruz3h794008fsfr2nqpux9up",
        stability_pool: "osmo1sxucujwwm2t9pjn9dj3y2px873e9jm4m3r6qtqppymukkfreznms6fm4x2",
        staking: "osmo15v0me0g4r0vjfndr35qxlxpmkexu4hjrnn0stjt9wqd2xjc4hhssukukxc",
        system_discounts: "osmo1ugyv2x5fltfhtcrlzmnm2yzpse2mf5jd7gmkaawrp445n8h7g0nq7lw9hf",
        vesting: "osmo1md5g2kxr7ez7pdjs772jml47tdrf49f5z4ahcr9s24d3qjahjccqr93gp2"
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
