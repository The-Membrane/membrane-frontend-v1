import React from 'react';
import Image from 'next/image'

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

  type NavBarProps = {
    setActiveComponent: (component: string) => void;
  };

const NavBar: React.FC<NavBarProps> = ({setActiveComponent}) => {   

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
            id="v-pills-tab"
            role="tablist"
            aria-orientation="vertical"
            >
            <div
                className="nav-link spacing"
                id="v-pills-home-tab"
                data-toggle="pill"
                onClick={() => setActiveComponent('dashboard')}
                role="tab"
                aria-controls="v-pills-home"
                aria-selected="true"
            >
                {" "}
                <Image
                className="hoverColor"
                src="/images/dashboard.svg"
                width={55}
                height={55}
                alt="Dashboard"
                />
            </div>
            <div
                className="nav-link spacing"
                id="v-pills-profile-tab"
                data-toggle="pill"
                onClick={() => setActiveComponent('vault')}
                role="tab"
                aria-controls="v-pills-profile"
                aria-selected="false"
            >
                <Image
                className="hoverColor"
                src="/images/pie_chart.svg"
                width={45}
                height={45}
                alt="Vaults"
                />
            </div>
            <div
                className="nav-link  spacing"
                id="v-pills-messages-tab"
                data-toggle="pill"
                onClick={() => setActiveComponent('liquidation')}
                role="tab"
                aria-controls="v-pills-messages"
                aria-selected="false"
            >
                <Image
                className="hoverColor"
                src="/images/liquidation_pool.svg"
                width={45}
                height={45}
                alt="Liquidation"
                />
            </div>
            <div
                className="nav-link  spacing"
                id="v-pills-settings-tab"
                data-toggle="pill"
                onClick={() => setActiveComponent('staking')}
                role="tab"
                aria-controls="v-pills-settings"
                aria-selected="false"
            >
                <Image
                className="hoverColor"
                src="/images/staking.svg"
                width={45}
                height={45}
                alt="Staking"
                />
            </div>
            <div
                className="nav-link  spacing"
                id="v-pills-settings-tab"
                data-toggle="pill"
                onClick={() => setActiveComponent('launch')}
                role="tab"
                aria-controls="v-pills-settings"
                aria-selected="false"
            >
                <Image
                className="hoverColor"
                src="/images/lockdrop.svg"
                width={45}
                height={45}
                alt="Lockdrop"
                />
            </div>
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
        </div>
    );
}

export default NavBar;