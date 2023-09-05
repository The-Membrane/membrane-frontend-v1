import React from 'react';
import { MutableRefObject, useRef } from 'react';

export const dashboardPosition = 20;
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
      "https://app.gitbook.com/o/kwPbvcB0Itw78v85zOj9/s/FiyuxZGH4mVNtbbTs1KJ/"
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
            <img className="logo" src="/images/Logo.png" width={30} height={30} alt="" />
            </a>
            {/* end*/}
            {/* these are the buttons*/}
            <div
            className="nav flex-column nav-pills "
            id="v-pills-tab"
            role="tablist"
            aria-orientation="vertical"
            >
            <a
                className="nav-link spacing"
                id="v-pills-home-tab"
                data-toggle="pill"
                href="#v-pills-home"
                role="tab"
                aria-controls="v-pills-home"
                aria-selected="true"
            >
                {" "}
                <img
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
                id="v-pills-profile-tab"
                data-toggle="pill"
                href="#v-pills-profile"
                role="tab"
                aria-controls="v-pills-profile"
                aria-selected="false"
            >
                <img
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
                id="v-pills-messages-tab"
                data-toggle="pill"
                href="#v-pills-messages"
                role="tab"
                aria-controls="v-pills-messages"
                aria-selected="false"
            >
                <img
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
                id="v-pills-settings-tab"
                data-toggle="pill"
                href="#v-pills-settings"
                role="tab"
                aria-controls="v-pills-settings"
                aria-selected="false"
            >
                <img
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
                id="v-pills-settings-tab"
                data-toggle="pill"
                href="#v-pills-settings"
                role="tab"
                aria-controls="v-pills-settings"
                aria-selected="false"
            >
                <img
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
                id="v-pills-home"
                role="tabpanel"
                aria-labelledby="v-pills-home-tab"
            >
                ...
            </div>
            <div
                className="tab-pane fade"
                id="v-pills-profile"
                role="tabpanel"
                aria-labelledby="v-pills-profile-tab"
            >
                ...
            </div>
            <div
                className="tab-pane fade"
                id="v-pills-messages"
                role="tabpanel"
                aria-labelledby="v-pills-messages-tab"
            >
                ...
            </div>
            <div
                className="tab-pane fade"
                id="v-pills-settings"
                role="tabpanel"
                aria-labelledby="v-pills-settings-tab"
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