"use client";
import { useRouter } from "next/navigation";
import React, { createContext, useContext } from "react";

import { logOut } from "../lib/server-actions/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const signOut = async () => {
    try {
      logOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
