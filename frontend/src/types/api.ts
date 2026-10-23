export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  success: false;
  data: null;
  errors: Record<string, string>;
}

export interface AxiosBaseQueryError {
  status?: number;
  data?: ApiErrorResponse;
}