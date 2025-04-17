"use client";

import { signIn, signOut } from "next-auth/react";

export const githubLogIn = async () => {
  await signIn("github", { redirectTo: "/borrow" });
};

export const googleLogIn = async () => {
  await signIn("google", { redirectTo: "/borrow" });
};

export const credentialsSignIn = async (
  email: string,
  password: string,
  mode: string,
  firstName?: string,
  lastName?: string,
) => {
  try {
    const response = await signIn("credentials", {
      email,
      password,
      mode,
      firstName,
      lastName,
      redirect: false,
    });

    if (!response || !response.ok) {
      console.error("Login failed:", response?.error);
      return {
        success: false,
        error: response?.error || "Authentication failed. Please try again.",
      };
    }

    return {
      success: true,
      redirectUrl: "/borrow",
    };
  } catch (error) {
    console.error("Error during login:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

export const logOut = async () => {
  await signOut({ redirectTo: "/signin" });
};
