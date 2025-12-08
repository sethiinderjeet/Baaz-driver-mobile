import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    clientOrDriverID: number | null;
    token: string | null;
    name: string | null;
}

const initialState: AuthState = {
    clientOrDriverID: null,
    token: null,
    name: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ clientOrDriverID: number; token?: string; name?: string }>
        ) => {
            state.clientOrDriverID = action.payload.clientOrDriverID;
            if (action.payload.token) state.token = action.payload.token;
            if (action.payload.name) state.name = action.payload.name;
        },
        logout: (state) => {
            state.clientOrDriverID = null;
            state.token = null;
            state.name = null;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
