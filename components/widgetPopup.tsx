import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import React from 'react'

interface Props {
    trigger: boolean;
    setTrigger: any;
    msgStatus: string;
    errorMsg: string | ReactJSXElement | undefined;
}

const WidgetPopup = ({trigger, setTrigger, msgStatus, errorMsg}: Props) => {
    const [progressCursor, setProgressCursor] = React.useState("progress");

    return (trigger) ? (
        <div className="popup">
            <div className='popup' style={{cursor: progressCursor}} onClick={() => {setTrigger(false); setProgressCursor("progress")}}/>
            <div className='widget-popup' onLoad={() => setProgressCursor("default")}>{errorMsg}</div>
        </div>
    ) : null;
}

export default WidgetPopup;