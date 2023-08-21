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
  cw20ContractAddress,
  dependencies,
  products,
} from '../config';
import {
  Product,
  Dependency,
  WalletSection,
  handleChangeColorModeValue,
  HackCw20,
} from '../components';

const library = {
  title: 'OsmoJS',
  text: 'OsmoJS',
  href: 'https://github.com/osmosis-labs/osmojs',
};

import Dashboard from './Dashboard';
import { useRef } from 'react';
import NavBar from './NavBar';
import LiquidationPools from './Liquidations';
import Lockdrop from './Lockdrop';
import Governance from './Governance';
import Positions from './Positions';


export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { status } = useChain(chainName);

 

  //Set references
  const dashboardSection = useRef(null);
  const vaultSection = useRef(null);
  const liquidationSection = useRef(null);
  const launchSection = useRef(null);
  const stakingSection = useRef(null);


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
    <div className="row ">
        <NavBar/>
      <div ref={dashboardSection}>
        <Dashboard/>        
      </div>
      <div ref={vaultSection}>
        <Positions/>
      </div>
      <div ref={liquidationSection}>
        <LiquidationPools/>
      </div>
      <div ref={launchSection}>
        <Lockdrop/>
      </div>
      <div ref={stakingSection}>
        <Governance/>
      </div>
      
    </div>
    </div>
    
  </>
  );
}
