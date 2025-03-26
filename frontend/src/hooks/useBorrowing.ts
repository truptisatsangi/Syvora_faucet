import { useState, useCallback } from "react";
import { useToast } from "../hooks/use-toast";
import { useWallet } from "../context/WalletContext";
import { useConfig } from "../context/ConfigContext";
import { useAuth } from "../context/AuthContext";
import useWhitelistedStatus from "../hooks/useWhitelistedStatus";
import { useWalletBalance } from "../hooks/useWalletBalance";

export const useBorrowing = () => {
  const { account } = useWallet();
  const { backendUrl } = useConfig();
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshWalletBalance } = useWalletBalance();
  const { isWhitelisted, refreshWhitelistStatus } = useWhitelistedStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastBorrowed, setLastBorrowed] = useState<number | null>(null);
  const [loadingLastBorrowed, setLoadingLastBorrowed] = useState(false);

  const fetchLastBorrowed = useCallback(async () => {
    if (!user?.email) return;
    setLoadingLastBorrowed(true);
    try {
      const response = await fetch(
        `${backendUrl}/lastBorrowed?email=${user.email}`,
      );
      const data = await response.json();
      if (response.ok) {
        setLastBorrowed(data.lastBorrowedTimestamp);
      }
    } catch (error) {
      console.error("Error fetching last borrowed timestamp:", error);
    } finally {
      setLoadingLastBorrowed(false);
    }
  }, [backendUrl, user]);

  const canBorrow = () => {
    if (!lastBorrowed) return true;
    const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000;
    return lastBorrowed < eightHoursAgo;
  };

  const handleWhitelistAddress = useCallback(async () => {
    if (!account || !user) {
      toast({
        title: "Error",
        description: "No wallet address or user data found.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/whitelist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account,
          email: user.email,
          isWhitelisted: true,
        }),
      });

      if (response.ok) {
        toast({
          title: "Wallet whitelisted",
          description: "Your wallet address has been successfully whitelisted.",
        });
        await refreshWhitelistStatus();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to whitelist wallet.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [account, user, backendUrl, toast, refreshWhitelistStatus]);

  const handleBorrowTokens = useCallback(async () => {
    if (!account) {
      toast({
        title: "Error",
        description: "No wallet address found.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/borrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, account }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tokens borrowed successfully.",
        });
        refreshWalletBalance();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to borrow tokens.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while borrowing tokens.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [account, backendUrl, toast, refreshWalletBalance]);

  return {
    handleWhitelistAddress,
    handleBorrowTokens,
    isWhitelisted,
    isSubmitting,
    fetchLastBorrowed,
    loadingLastBorrowed,
    canBorrow: canBorrow(),
  };
};
