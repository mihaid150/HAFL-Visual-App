import React from 'react';
import { useAppDispatch, useAppSelector } from "../../../store/storeHook.ts";
import { goBack, goForward, clearStatusMessages, removeCurrentStatusMessage } from "../../../store/statusSlice.ts";
import '../style/UpSideBar.sass';

const UpSideBar: React.FC = () => {
    const dispatch = useAppDispatch();
    const { messages, currentIndex } = useAppSelector((state) => state.status);
    const currentMessage = messages[currentIndex];


    const handleBack = () => {
        dispatch(goBack());
    };

    const handleForward = () => {
        dispatch(goForward());
    };

    const handleClearAll = () => {
        dispatch(clearStatusMessages());
    };

    const handleClearCurrent = () => {
        dispatch(removeCurrentStatusMessage());
    };

    // Determine the status class based on currentMessage.status
    const statusClass = currentMessage
        ? currentMessage.status === 'error'
            ? 'status-error'
            : currentMessage.status === 'warning'
                ? 'status-warning'
                : 'status-success'
        : '';

    return (
        <div className={`upside-bar ${statusClass}`}>
            <button className="back-button" onClick={handleBack} disabled={currentIndex === 0}>
                Back
            </button>
            <div className="status-message">
                {currentMessage ? currentMessage.message : 'No status messages'}
            </div>
            <button
                className="forward-button"
                onClick={handleForward}
                disabled={currentIndex === messages.length - 1 || messages.length === 0}
            >
                Forward
            </button>
            <button className="clear-button" onClick={handleClearCurrent}>
                Clear Current
            </button>
            <button className="clear-all-button" onClick={handleClearAll}>
                Clear All
            </button>
        </div>
    );
};

export default UpSideBar;
