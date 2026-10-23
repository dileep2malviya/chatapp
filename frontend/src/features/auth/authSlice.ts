import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthLoginUserType, LoginUserType } from "./authTypes";

const initialState: AuthLoginUserType = {
    user: null,
    accessToken: null,
    forgotPasswordEmail: null,
    verifiedUser: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{
            user: LoginUserType,
            accessToken: string
        }>) => {
            state.user = action.payload.user,
                state.accessToken = action.payload.accessToken
        },
        setForgotPasswordEmail: (state, action: PayloadAction<{
            email: string,
        }>) => {
            state.forgotPasswordEmail = action.payload.email
        },
        clearForgotPasswordState: (state) => {
            state.forgotPasswordEmail = null
        },
        setAccountVerify: (state, action: PayloadAction<{ error?: boolean, data?: string | null } >) => {
            state.verifiedUser = action.payload
        }
    }
})

export const { 
    setCredentials, 
    setForgotPasswordEmail,
    clearForgotPasswordState,
    setAccountVerify
} = authSlice.actions;

export default authSlice.reducer;

