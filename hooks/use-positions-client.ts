import { useState, useEffect } from 'react';
import { useChain } from '@cosmos-kit/react';

// import cosmwasm client generated with cosmwasm-ts-codegen
import { PositionsClient, PositionsQueryClient } from '../codegen/Positions.client';
import { chainName } from '../config';

export function usePositionsClient(contractAddress: string): {client: PositionsClient | null} {
  const { getSigningCosmWasmClient, address, status } = useChain(chainName);

  const [cdpClient, setcdpClient] = useState<PositionsClient | null>(
    null
  );
  useEffect(() => { 
    if (status === 'Connected') {
      getSigningCosmWasmClient().then((cosmwasmClient) => {
        if (!cosmwasmClient || !address) {
          console.error('cosmwasmClient undefined or address undefined.');
          return;
        }

        setcdpClient(new PositionsClient(cosmwasmClient, address, contractAddress));
      });
    }
  }, [address, contractAddress, getSigningCosmWasmClient, status]);

  return { client: cdpClient ?? null };
}

export function usePositionsQueryClient(contractAddress: string): {queryClient: PositionsQueryClient | null} {
    const { getCosmWasmClient } = useChain(chainName);
  
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
        });
      
    }, [contractAddress, getCosmWasmClient]);
  
    return { queryClient: positionsQueryClient ?? null };
  }
