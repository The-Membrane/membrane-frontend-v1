import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { useState } from "react";

export const usePopup = () => {
    const [trigger, setTrigger] = useState(false);
    const [msg, setMsg] = useState<ReactJSXElement>();
    const [status, setStatus] = useState("");
  
    const showPopup = (status: any, message: any) => {
      setStatus(status);
      setMsg(message);
      setTrigger(true);
    };
  
    return { trigger, setTrigger, msg, setMsg, status, setStatus, showPopup };
  };
  
  export default usePopup;