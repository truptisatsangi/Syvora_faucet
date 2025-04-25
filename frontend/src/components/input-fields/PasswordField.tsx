/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState } from "react";
import { Control, FieldError } from "react-hook-form";
import { HiEye, HiEyeOff } from "react-icons/hi";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface PasswordFieldProps {
  control: Control<any, any>;
  name: string;
  errors?: FieldError;
}

const PasswordField = ({ control, name, errors }: PasswordFieldProps) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handlePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center mt-2">
            <FormLabel>
              {name === "confirmPassword" ? "Confirm Password" : "Password"}
            </FormLabel>
            {name !== "confirmPassword" && (
              <Link
                href="/forgot-password"
                className="hover:underline text-blue-500 text-sm"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <FormControl>
            <div className="relative">
              <Input
                type={isPasswordVisible ? "text" : "password"}
                placeholder={
                  name === "confirmPassword"
                    ? "Re-enter your password"
                    : "Enter your password"
                }
                {...field}
                className="placeholder-gray-400 focus:placeholder-transparent caret-current"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={handlePasswordVisibility}
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
              >
                {isPasswordVisible ? (
                  <HiEyeOff size={20} />
                ) : (
                  <HiEye size={20} />
                )}
              </button>
            </div>
          </FormControl>
          {errors?.message && <FormMessage>{errors.message}</FormMessage>}
        </FormItem>
      )}
    />
  );
};

export default PasswordField;
