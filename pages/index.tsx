import React from "react";
import Head from 'next/head';
import {
  Box,
  Divider,
  Grid,
  Heading,
  Text,
  Stack,
  Container,
  Link,
  Button,
  Flex,
  Icon,
  useColorMode,
} from '@chakra-ui/react';
import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';

import { useChain } from '@cosmos-kit/react';
import { WalletStatus } from '@cosmos-kit/core';

import {
  chainName,
  dependencies,
  products,
} from '../config';

const library = {
  title: 'OsmoJS',
  text: 'OsmoJS',
  href: 'https://github.com/osmosis-labs/osmojs',
};

import Dashboard from './Dashboard';
import { useEffect, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import LiquidationPools from './Liquidations';
import Lockdrop from './Lockdrop';
import Governance from './Governance';
import Positions from './Positions';
import { useClients, useQueryClients } from '../hooks/use-clients';

export const denoms = {
  mbrn: "factory/osmo1mavfhp7sszhetuuwcd66rpz8v63ds056mgr76ng4928tk9kcvu6s9te226/umbrn",
  cdt: "factory/osmo1w7p2awjxs2rdv3jw054e5p0fnx6rgwh8yd2zqgsfgyua8ely4e3shrzjax/ucdt",
  osmo: "uosmo",
  //mainnet atom ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2
  atom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
  //mainnet axlUSDC ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858
  axlUSDC: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
  //mainnet "gamm/pool/1"
  atomosmo_pool: "gamm/pool/1",
  //mainnet "gamm/pool/678"
  osmousdc_pool: "gamm/pool/678",
};

export interface Prices {
  osmo: number,
  atom: number,
  axlUSDC: number,
  atomosmo_pool: number,
  osmousdc_pool: number,
}

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { status } = useChain(chainName);

  //Set references
  const dashboardSection = useRef(null);
  const vaultSection = useRef(null);
  const liquidationSection = useRef(null);
  const launchSection = useRef(null);
  const stakingSection = useRef(null);

  //Get Clients
  const { cdp_client, launch_client, liq_queue_client, stability_pool_client, governance_client, staking_client, base_client, address } = useClients();
  const { cdpqueryClient, launchqueryClient, liqqueuequeryClient, stabilitypoolqueryClient, governancequeryClient, stakingqueryClient, oraclequeryClient } = useQueryClients();
  const addr = address as string | undefined;

  //Set Prices
  const [prices, setPrices] = useState<Prices>({
    osmo: 0,
    atom: 0,
    axlUSDC: 0,
    atomosmo_pool: 0,
    osmousdc_pool: 0,
  });

  //Query prices
  const queryPrices = async () => {        
    try {
        await oraclequeryClient?.prices({
            assetInfos: [
                {
                    native_token: {
                        denom: denoms.osmo
                    }
                },
                {
                    native_token: {
                        denom: denoms.atom
                    }
                },
                {
                    native_token: {
                        denom: denoms.axlUSDC
                    }
                },
                {
                    native_token: {
                        denom: denoms.atomosmo_pool
                    }
                },
                {
                    native_token: {
                        denom: denoms.osmousdc_pool
                    }
                }
            ],
            oracleTimeLimit: 10,
            twapTimeframe: 0,
        }).then((res) => {
            setPrices({
                osmo: parseFloat(res[0].price),
                atom: parseFloat(res[1].price), 
                axlUSDC: parseFloat(res[2].price),
                atomosmo_pool: parseFloat(res[3].price),
                osmousdc_pool: parseFloat(res[4].price),

            })
        })
    } catch (error) {
        console.log(error)
    }
  }

  useEffect(() => {

    if (prices.osmo === 0) {
      //Get prices
      queryPrices()
    }

    console.log(prices)
  }, [oraclequeryClient, prices, address])

  return (
    <>    
    {/* Required meta tags */}
    <meta charSet="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    {/* Bootstrap CSS */}
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
      integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
      crossOrigin="anonymous"
    />
    <title>Membrane</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Abel&display=swap"
      rel="stylesheet"
    />
    <div className="fullHeight">
    <div className="row">
        <NavBar/>
      <div ref={dashboardSection}>
        <Dashboard/>        
      </div>
      <div ref={vaultSection}>
        <Positions cdp_client={cdp_client} queryClient={cdpqueryClient} address={addr} prices={prices}/>
      </div>
      <div ref={liquidationSection}>
        <LiquidationPools queryClient={liqqueuequeryClient} liq_queueClient={liq_queue_client} sp_queryClient={stabilitypoolqueryClient} sp_client={stability_pool_client} cdp_queryClient={cdpqueryClient} address={addr} prices={prices}/>
      </div>
      <div ref={stakingSection}>
        <Governance govClient={governance_client} govQueryClient={governancequeryClient} stakingClient={staking_client} stakingQueryClient={stakingqueryClient} address={addr}/>
      </div>
      <div ref={launchSection}>
        <Lockdrop launch_client={launch_client} queryClient={launchqueryClient} baseClient={base_client} address={addr} prices={prices}/>
      </div>      
    </div>
    </div>
    
  </>
  );
}
