type ApiResponseType<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export const apiResponse = <T>(
  statusCode: number,
  data: T,
  message: string = "Success"
): ApiResponseType<T> => {
  return {
    statusCode,
    data,
    message,
    success: statusCode < 400,
  };
};