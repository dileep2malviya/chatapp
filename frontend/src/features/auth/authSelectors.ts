import { RootState } from "@/store/store"

const forgotPasswordEmailSelector = (state: RootState) =>
  state.auth.forgotPasswordEmail

const accountVerifySelector = (state: RootState) =>
  state.auth.verifiedUser

export { 
    forgotPasswordEmailSelector,
    accountVerifySelector
}