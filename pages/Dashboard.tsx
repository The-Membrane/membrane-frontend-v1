import React, { use, useEffect } from "react";
import { WalletSection } from "../components";
import Image from "next/image";
import { Basket } from "../codegen/positions/Positions.types";

type DashboardProps = {
    setActiveComponent: (component: string) => void;
    basketRes: Basket | undefined;
    walletCDT: number | undefined;
    walletMBRN: number | undefined;
    inLaunch: boolean | undefined;
  };

//LP links
export const onStableswapTextClick = () => {
    window.open(
    "https://app.osmosis.zone/pool/1268"
    );
}; 

const Dashboard: React.FC<DashboardProps> = ({setActiveComponent, basketRes, walletCDT, walletMBRN, inLaunch}) => {

    const [sign, setSign] = React.useState("");
    const [sign2, setSign2] = React.useState("");
    const [sign3, setSign3] = React.useState("");
    const [sign4, setSign4] = React.useState("");

    const [totalSupply, setTotalSupply] = React.useState<number>();
    const [TVL, setTVL] = React.useState<number>();

    //Footer links
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

    useEffect(() => {
        if(basketRes){
            setTotalSupply(parseInt(basketRes.credit_asset.amount)/1_000000);
        }
    }, [basketRes]);

    return (
        <div className="page-frame">
        <WalletSection nav={false}/>
        <Image className="pageTitle" priority={true} src="/images/Background_Header 1.svg" height={0} width={0} alt="Membrane background header"/>
        <Image className="dash-logo" src="/images/MBRN-logo-template.svg" width={0} height={0} alt="" />
        <div className="cards">
            <p className="dash-stats mobile-font">
                Provide Liquidity to the CDT&nbsp;<a style={{cursor:"pointer", textDecoration:"underline"}} onClick={onStableswapTextClick}>stableswap</a>&nbsp;on Osmosis for ~30%+ APR
            </p>
            <div className="dash-stats">
                CDT Minted: {totalSupply?.toFixed(0)}
            </div>
            <div className="card-1">
                <div className="card" style={{borderRadius: "1rem"}}>
                <div className={`card-body card-design${sign} shadow`} onMouseEnter={()=>{setSign("on")}} onMouseLeave={()=>{setSign("")}}>
                    <h5 className={`neonSign${sign}`}>
                    <b><a>V</a><span>A</span><a>U</a><span>L</span><a>T</a><span>S</span></b>
                    </h5>
                    {sign === "on" ? <p className="card-text dim">
                    Borrow CDT against any combination of available
                    collateral by opening a Cell. Learn more:{" "}
                    <a href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/overview" target="popup">
                        What is a Vault?
                    </a>
                    </p>: null}
                    <Image className="mint-symbol" src="/images/Mint_Symbol 1.svg" width={155} height={155} alt="" />
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white"}} onClick={() => setActiveComponent('vault')}>
                    Mint
                    </a>
                </div>
                </div>
            </div>
            {walletCDT != undefined && walletCDT > 0 ? <div className="card-2">
                <div className="card" style={{borderRadius: "1rem"}}>
                <div className={`card-body card-design${sign2} shadow`} onMouseEnter={()=>{setSign2("on")}} onMouseLeave={()=>{setSign2("")}}>
                    <h5 className={`neonSign2${sign2}`}>
                        <b><a>L</a><span>i</span><a>q</a><span>u</span><a>i</a><span>d</span><a>a</a><span>t</span><a>i</a><span>o</span><a>n</a><span>s</span></b>
                    </h5>
                   {sign2 === "on" ? <p className="card-text">
                    Earn discounted liquidated collateral by depositing
                    CDT into the single or omni-asset liquidation pools. Learn
                    more:{" "}
                    <a href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/liquidation-mechanism" target="popup">
                        How do liquidations work?
                    </a>
                    </p> : null}
                    <Image className="liq-symbol" src="/images/Lever_Symbol 1.svg" width={155} height={155} alt="" />
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white"}} onClick={() => setActiveComponent('liquidation')}>
                    Bid
                    </a>
                </div>
                </div>
            </div> : null}
            {walletMBRN != undefined && walletMBRN > 0 ? <div className="card-3">
                <div className="card" style={{borderRadius: "1rem"}}>
                <div className={`card-body card-design${sign3} shadow`}  onMouseEnter={()=>{setSign3("on")}} onMouseLeave={()=>{setSign3("")}}>
                    <h5 className={`neonSign3${sign3}`}>
                        <b><a>S</a><span>t</span><a>a</a><span>k</span><a>i</a><span>n</span><a>g</a></b>
                    </h5>
                    {sign3 === "on" ? <p className="card-text">
                    Stake MBRN to enable &amp; increase ownership of the protocol.
                    Learn more:{" "}
                    <a href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/mbrn-tokenomics#value-flows" target="popup">
                        How value flows to MBRN?
                    </a>
                    </p> : null}
                    <Image className="vote-symbol" src="/images/Vote Symbol.svg" width={55} height={55} alt="" />
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white", marginTop:"30%"}} onClick={() => setActiveComponent('staking')}>
                    Stake
                    </a>
                </div>
                </div>
            </div> : null}
            {inLaunch != undefined && inLaunch ?<div className="card-4">
                <div className="card" style={{borderRadius: "1rem"}}>
                <div className={`card-body card-design${sign4} shadow`}  onMouseEnter={()=>{setSign4("on")}} onMouseLeave={()=>{setSign4("")}}>
                    <h5 className={`neonSign4${sign4}`}>
                        <b><a>L</a><span>o</span><a>c</a><span>k</span><a>d</a><span>r</span><a>o</a><span>p</span></b>
                    </h5>
                    {sign4 === "on" ? <p className="card-text">
                    Deposit OSMO to earn a share of staked MBRN that can be
                    boosted by voluntary vesting. Learn more:{" "}
                    <a href="https://membrane-finance.gitbook.io/membrane-docs-1/protocol/lockdrop-launch" target="popup">
                        How much is up for grabs at launch?{" "}
                    </a>
                    </p> : null}
                    <Image className="launch-symbol" src="/images/Farm_Symbol 1.svg" width={155} height={155} alt="" />
                    <a className="btn buttons" style={{borderRadius: "1rem", color: "white"}} onClick={() => setActiveComponent('launch')}>
                    Claim
                    </a>
                </div>
                </div>                 
            </div> : null}
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
            {/* <div className="dash-footer" onClick={()=>setActiveComponent("info")}>
                Dashboard
            </div> */}
        </div>
        </div>
    );
};

export default Dashboard;