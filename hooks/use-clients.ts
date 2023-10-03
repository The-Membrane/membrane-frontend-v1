import { useState, useEffect } from 'react';
import { useChain } from '@cosmos-kit/react';

// import cosmwasm client generated with cosmwasm-ts-codegen
import { LaunchClient, LaunchQueryClient } from '../codegen/launch/Launch.client';
import { chainName, testnetAddrs } from '../config';

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/cosmwasmclient';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';
import { OracleClient, OracleQueryClient } from '../codegen/oracle/Oracle.client';
import { PositionsClient, PositionsQueryClient } from '../codegen/Positions.client';
import { LiquidationQueueClient, LiquidationQueueQueryClient } from '../codegen/liquidation_queue/LiquidationQueue.client';
import { StabilityPoolClient, StabilityPoolQueryClient } from '../codegen/stability_pool/StabilityPool.client';
import { GovernanceClient, GovernanceQueryClient } from '../codegen/governance/Governance.client';
import { StakingClient, StakingQueryClient } from '../codegen/staking/Staking.client';

export function useClients(): {
  cdp_client: PositionsClient | null;
  launch_client: LaunchClient | null; 
  liq_queue_client: LiquidationQueueClient | null;
  stability_pool_client: StabilityPoolClient | null;
  governance_client: GovernanceClient | null;
  staking_client: StakingClient | null;
  base_client: SigningCosmWasmClient | null;
  address: String | undefined; 
} {
  const { getSigningCosmWasmClient, address, status, getOfflineSigner } = useChain(chainName);

  const [launchClient, setlaunchClient] = useState<LaunchClient | null>(  null  );
  const [cdpClient, setcdpClient] = useState<PositionsClient | null>(  null  );
  const [liqqueueClient, setliqqueueClient] = useState<LiquidationQueueClient | null>(  null  );
  const [stabilitypoolClient, setstabilitypoolClient] = useState<StabilityPoolClient | null>(  null  );
  const [governanceClient, setgovernanceClient] = useState<GovernanceClient | null>(  null  );
  const [stakingClient, setstakingClient] = useState<StakingClient | null>(  null  );
  const [cosmwasmClient, setCosmwasmClient] = useState<SigningCosmWasmClient | null>(  null  );

  var signed_errored = false;

  useEffect(() => { 
    if (status === 'Connected') {

      signed_errored = false;
      
      //Use this to access the RPC node directly instead of using public RPCs with getSigningCosmWasmClient()
      //https://rpc.osmotest5.osmosis.zone/
      //https://rpc.osmosis.zone
      //https://g.w.lavanet.xyz:443/gateway/cos4/rpc-http/fc41b9ab0767527272a12a8f2f87009c
      const signer = getOfflineSigner();
      var client = SigningCosmWasmClient.connectWithSigner(
        'https://rpc.osmotest5.osmosis.zone/', 
        signer,
        { gasPrice: GasPrice.fromString("0.025uosmo") }
      ).catch((e) => {
        console.log(e);
        signed_errored = true;
      });

      if (signed_errored) {
       client = getSigningCosmWasmClient();
      }

      client.then((cosmwasmClient) => {
        if (!cosmwasmClient || !address) {
          console.error('cosmwasmClient undefined or address undefined.');
          return;
        }

        console.log({address, status});

        //Set Clients
        setCosmwasmClient(cosmwasmClient);
        setlaunchClient(new LaunchClient(cosmwasmClient, address, testnetAddrs.launch));
        setcdpClient(new PositionsClient(cosmwasmClient, address, testnetAddrs.positions));
        setliqqueueClient(new LiquidationQueueClient(cosmwasmClient, address, testnetAddrs.liq_queue));
        setstabilitypoolClient(new StabilityPoolClient(cosmwasmClient, address, testnetAddrs.stability_pool));  
        setgovernanceClient(new GovernanceClient(cosmwasmClient, address, testnetAddrs.governance));
        setstakingClient(new StakingClient(cosmwasmClient, address, testnetAddrs.staking));

      }).catch((e) => {
        console.log(e);
      });
    }
  }, [address, status, testnetAddrs]);

  return { 
    cdp_client: cdpClient ?? null,
    launch_client: launchClient ?? null,
    liq_queue_client: liqqueueClient ?? null,
    stability_pool_client: stabilitypoolClient ?? null,
    governance_client: governanceClient ?? null,
    staking_client: stakingClient ?? null,
    base_client: cosmwasmClient ?? null,
    address: address 
  };
}

export function useQueryClients(): {
  cdpqueryClient: PositionsQueryClient | null,
  oraclequeryClient: OracleQueryClient | null,
  launchqueryClient: LaunchQueryClient | null,
  liqqueuequeryClient: LiquidationQueueQueryClient | null
  stabilitypoolqueryClient: StabilityPoolQueryClient | null;
  governancequeryClient: GovernanceQueryClient | null;
  stakingqueryClient: StakingQueryClient | null;
} {
    var query_errored = false;
    const { getCosmWasmClient } = useChain(chainName);
    ///I can change the RPC node here
    //https://rpc.osmotest5.osmosis.zone/
    //https://g.w.lavanet.xyz:443/gateway/cos4/rpc-http/fc41b9ab0767527272a12a8f2f87009c
    var client = CosmWasmClient.connect("https://g.w.lavanet.xyz:443/gateway/cos4/rpc-http/fc41b9ab0767527272a12a8f2f87009c")
    .catch((e) => {
      console.log(e);
      query_errored = true;
    });

    if (query_errored) {
      client = getCosmWasmClient();
    }
  
    const [positionsQueryClient, setPositionsQueryClient] = useState<PositionsQueryClient | null>( null );
    const [oracleQueryClient, setoracleQueryClient] = useState<OracleQueryClient | null>( null );
    const [launchQueryClient, setLaunchQueryClient] = useState<LaunchQueryClient | null>( null );
    const [liqqueueQueryClient, setliqqueueQueryClient] = useState<LiquidationQueueQueryClient | null>( null );
    const [stabilitypoolqueryClient, setstabilitypoolqueryClient] = useState<StabilityPoolQueryClient | null>( null );
    const [governancequeryClient, setgovernancequeryClient] = useState<GovernanceQueryClient | null>( null );
    const [stakingqueryClient, setstakingqueryClient] = useState<StakingQueryClient | null>( null );

    useEffect(() => { 
      client.then((cosmwasmClient) => {
        if (!cosmwasmClient) {
        console.error('cosmwasmClient undefined or address undefined.');
        return;
        }
        query_errored = false;
        
        //Set clients
        setoracleQueryClient(new OracleQueryClient(cosmwasmClient, testnetAddrs.oracle));
        setLaunchQueryClient(new LaunchQueryClient(cosmwasmClient, testnetAddrs.launch));
        setPositionsQueryClient(new PositionsQueryClient(cosmwasmClient, testnetAddrs.positions));
        setliqqueueQueryClient(new LiquidationQueueQueryClient(cosmwasmClient, testnetAddrs.liq_queue));
        setstabilitypoolqueryClient(new StabilityPoolQueryClient(cosmwasmClient, testnetAddrs.stability_pool));
        setgovernancequeryClient(new GovernanceQueryClient(cosmwasmClient, testnetAddrs.governance));
        setstakingqueryClient(new StakingQueryClient(cosmwasmClient, testnetAddrs.staking));

        }).catch((e) => {
        console.log(e);
      });;
      
    }, [getCosmWasmClient, testnetAddrs]);
  
    return { 
      oraclequeryClient: oracleQueryClient ?? null,
      cdpqueryClient: positionsQueryClient ?? null,
      launchqueryClient: launchQueryClient ?? null,
      liqqueuequeryClient: liqqueueQueryClient ?? null,
      stabilitypoolqueryClient: stabilitypoolqueryClient ?? null,
      governancequeryClient: governancequeryClient ?? null,
      stakingqueryClient: stakingqueryClient ?? null
    };
  }

  