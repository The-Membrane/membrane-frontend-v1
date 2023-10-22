import React from "react";
import { WalletSection } from "../components";
import NavBar, { launchPosition, liquidationPosition, scrollDown, stakingPosition, vaultPosition } from '../components/NavBar';
import Image from "next/image";

const Dashboard = () => {
    return (
        <div className="fullHeight walletconnect">
        <div className="row ">
        <div className="">
        <h1 className="pageTitle"/>
        <Image className="dash-logo" src="/images/Logo.png" width={55} height={55} alt="" />
        <div className="">
            <div className="card-1">
                <div className="card shadow" style={{borderRadius: "1rem"}}>
                <div className="card-body card-design">
                    <h5 className="card-title ">Vaults</h5>
                    <p className="card-text dim">
                    Borrow CDT against any combination of available
                    collateral by opening a Cell. Learn more:{" "}
                    <a href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/overview">
                        What is a Vault?
                    </a>
                    </p>
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white"}} onClick={() => scrollDown(vaultPosition)}>
                    Mint
                    </a>
                </div>
                </div>
            </div>
            <div className="card-2">
                <div className="card shadow" style={{borderRadius: "1rem"}}>
                <div className="card-body card-design">
                    <h5 className="card-title ">Liquidations</h5>
                    <p className="card-text">
                    Earn discounted liquidated collateral by depositing
                    CDT into the single or omni-asset liquidation pools. Learn
                    more:{" "}
                    <a href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/liquidation-mechanism">
                        How do liquidations work?
                    </a>
                    </p>
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white"}} onClick={() => scrollDown(liquidationPosition)}>
                    Liquidate
                    </a>
                </div>
                </div>
            </div>
            <div className="card-3">
                <div className="card shadow" style={{borderRadius: "1rem"}}>
                <div className="card-body card-design">
                    <h5 className="card-title">Staking</h5>
                    <p className="card-text">
                    Stake MBRN to enable &amp; increase ownership of the protocol.
                    Learn more:{" "}
                    <a href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/mbrn-tokenomics#value-flows">
                        How value flows to MBRN?
                    </a>
                    </p>
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white"}} onClick={() => scrollDown(stakingPosition)}>
                    Stake
                    </a>
                </div>
                </div>
            </div>
            <div className="card-4">
                <div className="card shadow" style={{borderRadius: "1rem"}}>
                <div className="card-body card-design">
                    <h5 className="card-title">Lockdrop</h5>
                    <p className="card-text">
                    Deposit OSMO to earn a share of staked MBRN that can be
                    boosted by voluntary vesting. Learn more:{" "}
                    <a href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/lockdrop-launch">
                        How much is up for grabs at launch?{" "}
                    </a>
                    </p>
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white"}} onClick={() => scrollDown(launchPosition)}>
                    Bootstrap
                    </a>
                </div>
                </div>                 
            </div>
            </div>
        </div>            
        </div>
        <WalletSection />
        </div>
    );
}

export default Dashboard;

