import { useState, useEffect } from 'react';
import { useChain } from '@cosmos-kit/react';

// import cosmwasm client generated with cosmwasm-ts-codegen
import { OracleQueryClient } from '../codegen/oracle/Oracle.client';
import { chainName } from '../config';

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/cosmwasmclient';
//import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';

// export function usePositionsClient(contractAddress: string): { cdp_client: PositionsClient | null; base_client: SigningCosmWasmClient | null; address: String | undefined; } {
//   const { getSigningCosmWasmClient, address, status, getOfflineSigner } = useChain(chainName);

//   const [cdpClient, setcdpClient] = useState<PositionsClient | null>(  null  );
//   const [cosmwasmClient, setCosmwasmClient] = useState<SigningCosmWasmClient | null>(  null  );

//   useEffect(() => { 
//     if (status === 'Connected') {
      
//       //Use this to access the RPC node directly instead of using public RPCs with getSigningCosmWasmClient()
//       const signer = getOfflineSigner();
//       const client = SigningCosmWasmClient.connectWithSigner(
//       'https://g.w.lavanet.xyz:443/gateway/cos4/rpc-http/448356632b522b956cedee5520b409fd', 
//         signer,
//         { gasPrice: GasPrice.fromString("0.025uosmo") }
//       );

//       client.then((cosmwasmClient) => {
//         if (!cosmwasmClient || !address) {
//           console.error('cosmwasmClient undefined or address undefined.');
//           return;
//         }

//         console.log({address, contractAddress, status});

//         setCosmwasmClient(cosmwasmClient);
//         setcdpClient(new PositionsClient(cosmwasmClient, address, contractAddress));
//       }).catch((e) => {
//         console.log(e);
//       });
//     }
//   }, [address, contractAddress, status]);

//   return { cdp_client: cdpClient ?? null, base_client: cosmwasmClient ?? null, address: address };
// }

export function usOracleQueryClient(contractAddress: string): {queryClient: OracleQueryClient | null} {
    const { getCosmWasmClient } = useChain(chainName);
    ///I can change the RPC node here
    const client = CosmWasmClient.connect("https://g.w.lavanet.xyz:443/gateway/cos4/rpc-http/448356632b522b956cedee5520b409fd");
  
    const [oracleQueryClient, setoracleQueryClient] = useState<OracleQueryClient | null>( null );
    useEffect(() => { 
          client.then((cosmwasmClient) => {
            if (!cosmwasmClient) {
            console.error('cosmwasmClient undefined or address undefined.');
            return;
            }
            console.log({contractAddress});
             
            setoracleQueryClient(new OracleQueryClient(cosmwasmClient, contractAddress));
        }).catch((e) => {
        console.log(e);
      });;
      
    }, [contractAddress, getCosmWasmClient]);
  
    return { queryClient: oracleQueryClient ?? null };
  }
