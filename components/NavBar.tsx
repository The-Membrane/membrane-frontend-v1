import React from 'react';
import { MutableRefObject, useRef } from 'react';
import Image from "next/image";

export const dashboardPosition = 0;
export const vaultPosition = 700;
export const liquidationPosition = 1580;
export const stakingPosition = 2350;
export const launchPosition = 3270;

//Instead of Routers, just make the app a single page that you can scroll through
 export const scrollDown = (position: number) => {
    window.scrollTo({
      top: position,
    });
  };

const NavBar = () => {   

  const onDocsTextClick = () => {
    window.open(
      "https://membrane-finance.gitbook.io/membrane-docs-1/"
    );
  };

  const onGithubTextClick = () => {
    window.open("https://github.com/MembraneFinance");
  };

  const onTwitterTextClick = () => {
    window.open("https://twitter.com/insaneinthembrn");
  };

  const onDiscordTextClick = () => {
    window.open("https://discord.gg/ksT6cdHpbV");
  };

    return (
        <div>
        <div className="col-0 gradient sticky ">
            {/* We are gonna start with the Nav*/}
            {/* this is your logo*/}
            <a className="navbar-brand" href="#">
            <Image className="logo" src="/images/Logo.png" width={30} height={30} alt="" />
            </a>
            {/* end*/}
            {/* these are the buttons*/}
            <div
            className="nav flex-column nav-pills "
            id="dashboard"
            role="tablist"
            aria-orientation="vertical"
            >
            <a
                className="nav-link spacing"
                id="dashboard"
                data-toggle="pill"
                href="#dashboard"
                role="tab"
                aria-controls="dashboard"
                aria-selected="true"
            >
                {" "}
                <Image
                className="hoverColor"
                src="/images/dashboard.svg"
                width={55}
                height={55}
                alt="Dashboard"
                onClick={() => scrollDown(dashboardPosition)}
                />
            </a>
            <a
                className="nav-link spacing"
                id="vaults"
                data-toggle="pill"
                href="#vaults"
                role="tab"
                aria-controls="vaults"
                aria-selected="false"
            >
                <Image
                className="hoverColor"
                src="/images/pie_chart.svg"
                width={45}
                height={45}
                alt="Vaults"
                onClick={() => scrollDown(vaultPosition)}
                />
            </a>
            <a
                className="nav-link  spacing"
                id="liquidations"
                data-toggle="pill"
                href="#liquidations"
                role="tab"
                aria-controls="liquidations"
                aria-selected="false"
            >
                <Image
                className="hoverColor"
                src="/images/liquidation_pool.svg"
                width={45}
                height={45}
                alt="Liquidation"
                onClick={() => scrollDown(liquidationPosition)}
                />
            </a>
            <a
                className="nav-link  spacing"
                id="governance"
                data-toggle="pill"
                href="#governance"
                role="tab"
                aria-controls="governance"
                aria-selected="false"
            >
                <Image
                className="hoverColor"
                src="/images/staking.svg"
                width={45}
                height={45}
                alt="Staking"
                onClick={() => scrollDown(stakingPosition)}
                />
            </a>
            <a
                className="nav-link  spacing"
                id="lockdrop"
                data-toggle="pill"
                href="#lockdrop"
                role="tab"
                aria-controls="lockdrop"
                aria-selected="false"
            >
                <Image
                className="hoverColor"
                src="/images/lockdrop.svg"
                width={45}
                height={45}
                alt="Lockdrop"
                onClick={() => scrollDown(launchPosition)}
                />
            </a>
            </div>
            <div className="tab-content" id="v-pills-tabContent">
            <div
                className="tab-pane fade show active"
                id="vaults"
                role="tabpanel"
                aria-labelledby="vaults"
            >
                ...
            </div>
            <div
                className="tab-pane fade"
                id="liquidations"
                role="tabpanel"
                aria-labelledby="liquidations"
            >
                ...
            </div>
            <div
                className="tab-pane fade"
                id="staking"
                role="tabpanel"
                aria-labelledby="staking"
            >
                ...
            </div>
            <div
                className="tab-pane fade"
                id="launch"
                role="tabpanel"
                aria-labelledby="launch"
            >
                ...
            </div>
            </div>
        </div>
        <div className="footer">
          <div className="docs1" onClick={onDocsTextClick}>{`Docs `}</div>
          <div className="github1" onClick={onGithubTextClick}>
            Github
          </div>
          <div className="twitter1" onClick={onTwitterTextClick}>
            Twitter
          </div>
          <div className="discord1" onClick={onDiscordTextClick}>
            Discord
          </div>
        </div>
        </div>
    );
}

export default NavBar;