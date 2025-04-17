import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useConfig } from "../context/ConfigContext";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../hooks/use-toast";
import useWhitelistedStatus from "../hooks/useWhitelistedStatus";

export const useBorrowing = () => {
  const { account, refreshWalletBalance } = useWallet();
  const { backendUrl } = useConfig();
  const { toast } = useToast();
  const { isWhitelisted, refreshWhitelistStatus } = useWhitelistedStatus();
  const { data: session } = useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastBorrowed, setLastBorrowed] = useState<number | null>(null);
  const [loadingLastBorrowed, setLoadingLastBorrowed] = useState(false);
  const [timeLeftToReborrow, setTimeLeftToReborrow] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [isCorrectUser, setIsCorrectUser] = useState<boolean | null>(null);

  const isRequestInProgress = useRef(false);

  const fetchLastBorrowed = useCallback(async () => {
    if (!session?.user?.email || !account || isRequestInProgress.current) return;

    isRequestInProgress.current = true;
    setLoadingLastBorrowed(true);

    try {
      const res = await fetch(`${backendUrl}/lastBorrowed?email=${session.user.email}&account=${account}`);
      const data = await res.json();

      if (res.ok && data.lastBorrowedTimestamp) {
        const timestamp = new Date(data.lastBorrowedTimestamp).getTime();
        setLastBorrowed(timestamp);
      } else {
        console.warn("No last borrowed timestamp returned.");
      }
    } catch (error) {
      console.error("Error fetching last borrowed timestamp:", error);
    } finally {
      isRequestInProgress.current = false;
      setLoadingLastBorrowed(false);
    }
  }, [backendUrl, session?.user?.email, account]);

  const canBorrow = useCallback(() => {
    if (!lastBorrowed) return true;
    const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000;
    return lastBorrowed < eightHoursAgo;
  }, [lastBorrowed]);

  const calculateTimeLeft = useCallback(() => {
    if (!lastBorrowed) {
      setTimeLeftToReborrow(null);
      return;
    }

    const nextBorrow = lastBorrowed + 8 * 60 * 60 * 1000;
    const timeLeft = nextBorrow - Date.now();

    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      setTimeLeftToReborrow(`${hours}h ${minutes}m`);
    } else {
      setTimeLeftToReborrow(null);
    }
  }, [lastBorrowed]);

  useEffect(() => {
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  useEffect(() => {
    const verifyUserWithWallet = async () => {
      if (!account || !session?.user?.email || isRequestInProgress.current) return;

      isRequestInProgress.current = true;
      setCheckingUser(true);

      try {
        const res = await fetch(`${backendUrl}/users/email/${account.trim()}`);
        const data = await res.json();

        const match = res.ok && data.email === session.user.email;
        setIsCorrectUser(match);

        toast({
          title: match ? "Wallet Verified" : "Mismatch Detected",
          description: match
            ? "Your wallet address matches your registered email."
            : "The connected wallet does not match your registered email.",
          variant: match ? "default" : "destructive",
        });
      } catch (err) {
        console.error("Error verifying wallet and email:", err);
        toast({
          title: "Verification Error",
          description: "Could not verify wallet against email.",
          variant: "destructive",
        });
      } finally {
        isRequestInProgress.current = false;
        setCheckingUser(false);
      }
    };

    verifyUserWithWallet();
  }, [account, session?.user?.email, backendUrl, toast]);

  const handleWhitelistAddress = useCallback(async () => {
    if (!account || !session?.user?.email || isRequestInProgress.current) {
      toast({
        title: "Error",
        description: "No wallet or user email found.",
        variant: "destructive",
      });
      return;
    }

    isRequestInProgress.current = true;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${backendUrl}/whitelist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, email: session.user.email, isWhitelisted: true }),
      });

      if (res.ok) {
        toast({
          title: "Whitelisted",
          description: "Your wallet has been whitelisted.",
        });
        refreshWhitelistStatus();
      } else {
        toast({
          title: "Whitelist Failed",
          description: "Could not whitelist your wallet.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error during whitelisting:", err);
      toast({
        title: "Error",
        description: "An error occurred while whitelisting.",
        variant: "destructive",
      });
    } finally {
      isRequestInProgress.current = false;
      setIsSubmitting(false);
    }
  }, [account, session?.user?.email, backendUrl, toast, refreshWhitelistStatus]);

  const handleBorrowTokens = useCallback(() => {
    if (!account || !session?.user?.email || isRequestInProgress.current) {
      toast({
        title: "Error",
        description: "Wallet or email not found.",
        variant: "destructive",
      });
      return;
    }

    if (!canBorrow()) {
      toast({
        title: "Please Wait",
        description: `Wait ${timeLeftToReborrow} before borrowing again.`,
        variant: "destructive",
      });
      return;
    }

    isRequestInProgress.current = true;
    setIsSubmitting(true);

    fetch(`${backendUrl}/borrow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, account }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Borrow request failed");

        toast({
          title: "Borrowed",
          description: "Tokens successfully borrowed.",
        });

        return refreshWalletBalance().then(() => fetchLastBorrowed());
      })
      .catch((err) => {
        console.error("Error borrowing tokens:", err);
        toast({
          title: "Error",
          description: "An error occurred while borrowing tokens.",
          variant: "destructive",
        });
      })
      .finally(() => {
        isRequestInProgress.current = false;
        setIsSubmitting(false);
      });
  }, [
    account,
    session?.user?.email,
    backendUrl,
    toast,
    canBorrow,
    timeLeftToReborrow,
    refreshWalletBalance,
    fetchLastBorrowed,
  ]);

  return {
    handleWhitelistAddress,
    handleBorrowTokens,
    isWhitelisted,
    isSubmitting,
    fetchLastBorrowed,
    loadingLastBorrowed,
    canBorrow: canBorrow(),
    timeLeftToReborrow,
    checkingUser,
    isCorrectUser,
  };
};
