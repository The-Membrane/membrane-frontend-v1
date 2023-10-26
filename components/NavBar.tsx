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
            {/* <Image className="logo" src="/images/Logo.png" width={30} height={30} alt="" /> */}
            </a>
            {/* end*/}
            {/* these are the buttons*/}
            <div
            className="nav flex-column nav-pills "
            id="dashboard"
            role="tablist"
            aria-orientation="vertical"
            >
            <div
                className="nav-link nav-home-logo hoverColor"
                style={{zIndex: 2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center"}}
                id="dashboard"
                data-toggle="pill"
                onClick={() => setActiveComponent('dashboard')}
                role="tab"
                aria-controls="dashboard"
                aria-selected="true"
            >
                <Image
                src="/images/dashboard.svg"
                width={45}
                height={45}
                alt="Dashboard"
                />
                <div className='nav-label'>Home</div>
            </div>
            <div
                className="nav-link hoverColor"
                style={{zIndex: 2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center"}}
                id="vaults"
                data-toggle="pill"
                onClick={() => setActiveComponent('vault')}
                role="tab"
                aria-controls="vaults"
                aria-selected="false"
            >
                <Image
                src="/images/pie_chart.svg"
                width={45}
                height={45}
                alt="Vaults"
                />
                <div className='nav-label'>Mint</div>
            </div>
            <div
                className="nav-link hoverColor"
                style={{zIndex: 2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center"}}
                id="liquidations"
                data-toggle="pill"
                onClick={() => setActiveComponent('liquidation')}
                role="tab"
                aria-controls="liquidations"
                aria-selected="false"
            >
                <Image
                src="/images/liquidation_pool.svg"
                width={45}
                height={45}
                alt="Liquidation"
                />
                <div className='nav-label' style={{top: "-1.2vh"}}>Bid</div>
            </div>
            <div
                className="nav-link hoverColor"
                style={{zIndex: 2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center"}}
                id="governance"
                data-toggle="pill"
                onClick={() => setActiveComponent('staking')}
                role="tab"
                aria-controls="governance"
                aria-selected="false"
            >
                <Image
                src="/images/staking.svg"
                width={45}
                height={45}
                alt="Staking"
                />
                <div className='nav-label'>Stake</div>
            </div>
            <div
                className="nav-link hoverColor"
                style={{zIndex: 2, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center"}}
                id="lockdrop"
                data-toggle="pill"
                onClick={() => setActiveComponent('launch')}
                role="tab"
                aria-controls="lockdrop"
                aria-selected="false"
            >
                <Image
                src="/images/lockdrop.svg"
                width={45}
                height={45}
                alt="Lockdrop"
                />
                <div className='nav-label'>Claim</div>
            </div>
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
        </div>
    );
}

export default NavBar;