// src/store/store.ts

import { configureStore } from "@reduxjs/toolkit";
import nodeReducer from './nodeSlice.ts'
import statusReducer from './statusSlice.ts'

export const store = configureStore({
    reducer: {
        nodes: nodeReducer,
        status: statusReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;