import { useState, useEffect } from 'react';
import { useChain } from '@cosmos-kit/react';

// import cosmwasm client generated with cosmwasm-ts-codegen
import { PositionsClient, PositionsQueryClient } from '../codegen/Positions.client';
import { chainName } from '../config';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/cosmwasmclient';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export function usePositionsClient(contractAddress: string): {client: PositionsClient | null, address: String | undefined } {
  const { getSigningCosmWasmClient, address, status } = useChain(chainName);

  const [cdpClient, setcdpClient] = useState<PositionsClient | null>(
    null
  );
  useEffect(() => { 
    if (status === 'Connected') {

      // getSigningCosmWasmClient().then((cosmwasmClient) => {
      //   if (!cosmwasmClient || !address) {
      //     console.error('cosmwasmClient undefined or address undefined.');
      //     return;
      //   }

      //   setcdpClient(new PositionsClient(cosmwasmClient, address, contractAddress));
      // }).catch((e) => {
      //   console.log(e);
      // });
    }
  }, [address, contractAddress, getSigningCosmWasmClient, status]);

  return { client: cdpClient ?? null, address: address };
}

export function usePositionsQueryClient(contractAddress: string): {queryClient: PositionsQueryClient | null} {
    const { getCosmWasmClient } = useChain(chainName);
    ///I can change the RPC node here but it hasn't worked yet
    //First try spammed nodes that didn't look like the endpoint i passed
    // CosmWasmClient.connect();
  
    const [positionsQueryClient, setPositionsQueryClient] = useState<PositionsQueryClient | null>(
      null
    );
    useEffect(() => { 
        getCosmWasmClient().then((cosmwasmClient) => {
            if (!cosmwasmClient) {
            console.error('cosmwasmClient undefined or address undefined.');
            return;
            }
             
            setPositionsQueryClient(new PositionsQueryClient(cosmwasmClient, contractAddress));
        }).catch((e) => {
        console.log(e);
      });;
      
    }, [contractAddress, getCosmWasmClient]);
  
    return { queryClient: positionsQueryClient ?? null };
  }
