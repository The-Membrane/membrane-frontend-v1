import React from 'react';
import Image from 'next/image';
import { UserClaims } from '../../pages/Governance';
import usePopup from './HelperFunctions';
import { StakingClient } from '../../codegen/staking/Staking.client';
import Popup from '../Popup';
interface ClaimButtonProps {
  userClaims: UserClaims;
  address: string | undefined;
  connect: () => void;
  stakingClient: StakingClient | null;
}

const ClaimButton: React.FC<ClaimButtonProps> = ({ userClaims, address, connect, stakingClient }) => {
    const { trigger, setTrigger, msg, status, showPopup } = usePopup();

    const handleclaimClick = async () => {
        //Check if wallet is connected & connect if not
        if (address === undefined) {
          connect();
          return;
        }
        try {
          await stakingClient?.claimRewards({
            restake: false,
          },"auto", undefined
          ).then((res) => {
            console.log(res)
            showPopup("Success", <div>Claimed</div>);
          })
        } catch (error) {
          console.log(error)
          const e = error as {message: string};
          //This is a success msg but a cosmjs error
          if (e.message === "Invalid string. Length must be a multiple of 4"){
            showPopup("Success", <div>Claimed</div>);
          } else {
            showPopup("Error", <div>{e.message}</div>);
          }
        }
      }
  
  
    return (
    <div className="claim-button-frame">        
        <div className="btn gov-claim-button" onClick={handleclaimClick}>
            <div className="claim">Claim</div>
        </div>
        <div className="claims-frame">
            <div style={{display: "flex", flexDirection: "row", position: "relative", justifyContent: "center"}}>
              <div className="cdt-claims">{userClaims.cdtClaims}</div>
              <Image width={43} height={48} alt="" src="/images/CDT.svg" />
            </div>
            <div style={{display: "flex", flexDirection: "row", position: "relative", justifyContent: "center"}}>
                <div className="mbrn-claims">{userClaims.mbrnClaims}</div>
                <Image width={43} height={48} alt="" src="/images/Logo.svg" />
            </div>
        </div>
        <Popup trigger={trigger} setTrigger={setTrigger} msgStatus={status} errorMsg={msg} />
    </div>
  );
};

export default ClaimButton;
