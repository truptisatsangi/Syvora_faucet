/* eslint-disable import/order */
import { ethers } from "ethers";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useToast } from "../hooks/use-toast";
import { useConfig } from "./ConfigContext";


const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { toast } = useToast();
  const { backendUrl } = useConfig();

  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletBalance, setWalletBalance] = useState("");
  const [isWalletBalanceLoading, setIsWalletBalanceLoading] = useState(false);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setIsConnected(true);
        setAccount(accounts[0]);

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const userSigner = await browserProvider.getSigner();

        setProvider(browserProvider);
        setSigner(userSigner);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setWalletBalance("");
  };

  const fetchWalletBalance = useCallback(async () => {
    if (!account) {
      console.warn("No wallet account found. Skipping balance fetch.");
      return;
    }

    setIsWalletBalanceLoading(true);
    console.log(`Fetching wallet balance for account: ${account}`);

    try {
      const response = await fetch(
        `${backendUrl}/balance/walletAddress?account=${account}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wallet balance");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Unknown error");
      }

      setWalletBalance(result.balance);
      console.log("Fetched wallet balance:", result.balance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

      toast({
        variant: "destructive",
        title: "Error fetching wallet balance",
        description: errorMessage,
      });

      console.error("Wallet balance fetch error:", error);
    } finally {
      setIsWalletBalanceLoading(false);
      console.log("Wallet balance fetch complete.");
    }
  }, [account, backendUrl, toast]);

  const refreshWalletBalance = async () => {
    fetchWalletBalance();
    console.log("Successfully refreshed wallet balance");
  };

  useEffect(() => {
    if (account) {
      fetchWalletBalance();
    }
  }, [account, fetchWalletBalance]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        account,
        connectMetaMask,
        disconnectWallet,
        provider,
        signer,
        walletBalance,
        isWalletBalanceLoading,
        refreshWalletBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
