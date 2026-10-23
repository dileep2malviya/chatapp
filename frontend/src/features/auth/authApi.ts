import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axios/axiosBaseQuery";
import { AccountVerifySchemaType, AgainAccountVerifySchemaType, ForgotPasswordSchemaType, LoginFormValuesType, OtpVerifySchemaType, RegisterFormValuesType, ResetPasswordSchemaType } from "@/lib/schema/authSchema";
import { AccountVerifyResponse, AgainAccountVerifyResponse, ForgotPasswordResponse, LoginResponse, RegisterResponse } from "./authTypes";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["User"],

  endpoints: (builder) => ({
    registerUser: builder.mutation<RegisterResponse, RegisterFormValuesType | FormData>({
      query: (body) => ({
        url: "/user/register",
        method: "POST",
        data: body,
      }),
    }),
    loginUser: builder.mutation<LoginResponse, LoginFormValuesType>({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        data: body,
      }),
    }),
    forgotPasswordUser: builder.mutation<ForgotPasswordResponse, ForgotPasswordSchemaType>({
      query: (body) => ({
        url: "/user/forgot-password",
        method: "POST",
        data: body,
      }),
    }),
    sendOtpAgainForVerificationUser: builder.mutation<ForgotPasswordResponse, ForgotPasswordSchemaType>({
      query: (body) => ({
        url: "/user/send-otp-again",
        method: "POST",
        data: body,
      }),
    }),
    otpVerifyUser: builder.mutation<ForgotPasswordResponse, OtpVerifySchemaType>({
      query: (body) => ({
        url: "/user/verify-forgot-password-email",
        method: "POST",
        data: body,
      }),
    }),
    resetPasswordUser: builder.mutation<ForgotPasswordResponse, ResetPasswordSchemaType>({
      query: (body) => ({
        url: "/user/reset-password",
        method: "POST",
        data: body,
      }),
    }),
    accountVerifyUser: builder.mutation<AccountVerifyResponse, AccountVerifySchemaType>({
      query: (body) => ({
        url: "/user/verify-account",
        method: "POST",
        data: body,
      }),
    }),
    againAccountVerifyUser: builder.mutation<AgainAccountVerifyResponse, AgainAccountVerifySchemaType>({
      query: (body) => ({
        url: "/user/send-verification-otp",
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useForgotPasswordUserMutation,
  useOtpVerifyUserMutation,
  useSendOtpAgainForVerificationUserMutation,
  useResetPasswordUserMutation,
  useAccountVerifyUserMutation,
  useAgainAccountVerifyUserMutation
} = authApi;

