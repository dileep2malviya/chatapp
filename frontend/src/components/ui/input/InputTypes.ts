import React from "react";
import type { UseFormRegisterReturn, UseFormSetValue } from "react-hook-form";

export interface CustomInputType {
    type?: "text" | "email" ;
    labelCss?: string;
    inputCss?: string;
    labelText?: string;
    placeholder?: string;
    error?: string;
    register: UseFormRegisterReturn;
    isDisable?: boolean
}

export interface CustomInputSubmitType {
    type: "submit";
    inputCss?: string;
    value: string;
    children?: React.HTMLElementType;
    isLoading?: boolean;
}

export interface CustomPasswordInputType {
    type: "password" ;
    labelCss?: string;
    inputCss?: string;
    register: UseFormRegisterReturn;
    placeholder?: string;
    error?: string;
    textLabel?: string;
    isViewEnable?: boolean;
}

export interface OtpInputProps {
  length?: number;
  value: string;
  setValue: UseFormSetValue<any>;
  error?: string;
}