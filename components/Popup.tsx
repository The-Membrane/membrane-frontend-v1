import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import React from 'react'

interface Props {
    trigger: boolean;
    setTrigger: any;
    msgStatus: string;
    errorMsg: string | ReactJSXElement | undefined;
}

const Popup = ({trigger, setTrigger, msgStatus, errorMsg}: Props) => {
    return (trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <button className="popup-button" onClick={() => setTrigger(false)}>Close</button>
                <h3>{msgStatus}</h3>
                <div className='popup-msg'>{errorMsg}</div>
            </div>
        </div>
    ) : null;
}

export default Popup;