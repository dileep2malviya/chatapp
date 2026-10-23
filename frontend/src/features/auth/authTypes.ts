export interface LoginUserType {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthLoginUserType {
  user: LoginUserType | null
  accessToken: string | null
  forgotPasswordEmail?: string | null
  otpResendAllowedAt?: string | null
  verifiedUser?: {
    error?: boolean
    data?: string | null
  } | null
  // forgotResetToken?: string | null
}

export interface LoginResponse {
  data: {
    user: LoginUserType;
    accessToken: string;
  };
  message?: string;
}

export interface RegisterResponse {
  data: null;
  message?: string;
}

export interface ForgotPasswordResponse {
  data: {
    email: string;
    retryAfter: number;
    resendAllowedAt: string;
  } | null
  message?: string;
  statusCode?: number
  success?: boolean
}

export interface AccountVerifyResponse {
  data: {
    email: string;
    isVerified: boolean;
    _id: string;
  } | null
  message?: string;
  statusCode?: number
  success?: boolean
}

export interface AgainAccountVerifyResponse {
  data: null
  message?: string;
  statusCode?: number
  success?: boolean
}

export interface VerificationResult {
  error?: boolean;
  data?: string | null;
}

export type VerificationState =
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };


