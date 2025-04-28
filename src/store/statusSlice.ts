import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StatusMessage {
    status: 'error' | 'warning' | 'success';
    message: string;
    timestamp: number;
    code: number;
}

interface StatusState {
    messages: StatusMessage[];
    currentIndex: number;
}

const initialState: StatusState = {
    messages: [],
    currentIndex: 0,
};

const statusSlice = createSlice({
    name: 'status',
    initialState,
    reducers: {
        addStatusMessage: (state, action: PayloadAction<StatusMessage>) => {
            state.messages.push(action.payload);
            state.currentIndex = state.messages.length - 1;
        },
        goBack: (state) => {
            if (state.currentIndex > 0) {
                state.currentIndex -= 1;
            }
        },
        goForward: (state) => {
            if (state.currentIndex < state.messages.length - 1) {
                state.currentIndex += 1;
            }
        },
        clearStatusMessages: (state) => {
            state.messages = [];
            state.currentIndex = 0;
        },
        removeCurrentStatusMessage: (state) => {
            if (state.messages.length > 0) {
                state.messages.splice(state.currentIndex, 1);
                // Adjust the current index after removal
                if (state.currentIndex >= state.messages.length) {
                    state.currentIndex = state.messages.length - 1;
                }
                if (state.currentIndex < 0) {
                    state.currentIndex = 0;
                }
            }
        },
    },
});

export const { addStatusMessage, goBack, goForward, clearStatusMessages, removeCurrentStatusMessage } = statusSlice.actions;
export default statusSlice.reducer;
