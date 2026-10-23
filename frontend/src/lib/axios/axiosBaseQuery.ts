import { BaseQueryFn } from '@reduxjs/toolkit/query'
import { AxiosInterface } from './axiosTypes'
import axiosInstance from './axios';
import { ApiErrorResponse } from '@/types/api';
import { AxiosError } from 'axios';

export const axiosBaseQuery = (): BaseQueryFn<AxiosInterface> => async ({
    url,
    method = "GET",
    data,
    params
}) => {
    try {
        const result = await axiosInstance({
            url,
            method,
            data,
            params,
        })
        return { data: result.data }
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        },
      };
    }
}