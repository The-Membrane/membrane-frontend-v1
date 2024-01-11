//============================================================================
// This file contains Helper functions for the liquidations page
//============================================================================

import { useState } from "react";
import { LiquidationQueueQueryClient } from "../../codegen/liquidation_queue/LiquidationQueue.client";
import { SlotResponse } from "../../codegen/liquidation_queue/LiquidationQueue.types";

export const queryPremiumSlots = async (asset: string, queryClient: LiquidationQueueQueryClient | null) => {
    try {
      const res = await queryClient?.premiumSlots({
        bidFor: {
          native_token: {
            denom: asset,
          },
        },
      });
      return res as SlotResponse[];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  
  export const queryQueue = async (asset: string, queryClient: LiquidationQueueQueryClient | null) => {
    try {
      const res = await queryClient?.queue({
        bidFor: {
          native_token: {
            denom: asset,
          },
        },
      });
      return res;
    } catch (error) {
      // Handle errors related to queue
      console.log(error);
    }
  };
  export const usePopup = () => {
    const [trigger, setTrigger] = useState(false);
    const [msg, setMsg] = useState("");
    const [status, setStatus] = useState("");
  
    const showPopup = (status: any, message: any) => {
      setStatus(status);
      setMsg(message);
      setTrigger(true);
    };
  
    return { trigger, setTrigger, msg, status, showPopup };
  };
  
  export default usePopup;
  
  export const connectWallet = (address: any, connect: () => void) => {
    if (address === undefined) {
      connect();
      return false;
    }
    return true;
  };
  
  export const getWorkingDenom = (menuAsset: any, assets: any) => {
    let workingDenom = "";
    if (menuAsset in assets) {
      workingDenom = assets[menuAsset].denom;
    }
    return workingDenom;
  };