"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConfig } from "../context/ConfigContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { backendUrl } = useConfig();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };

    fetchUser();
  }, [backendUrl]);

  const signIn = async (credentials) => {
    try {
      const response = await fetch(`${backendUrl}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();

        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        router.push("/borrow");
      } else {
        const errorMessage = await response.text();
        console.error("Sign-in failed:", errorMessage);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("user");
      setUser(null);

      router.push("/signin");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
