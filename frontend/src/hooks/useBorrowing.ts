import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useConfig } from "../context/ConfigContext";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../hooks/use-toast";
import useWhitelistedStatus from "../hooks/useWhitelistedStatus";
import {
  getLastBorrowed,
  getUserByWallet,
  postBorrow,
  postWhitelist,
} from "../lib/api/borrowingApi";
import { canBorrowNow, getTimeLeftString } from "../lib/utils/time";
import { verifyWalletMatchesEmail } from "../lib/utils/verifyUser";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
    try {
      if (session?.user?.email && account) {
        const timestamp = await getLastBorrowed(session.user.email, account, backendUrl);
        if (timestamp) {
          const millis = new Date(timestamp).getTime();
          setLastBorrowed(millis);
        } else {
          setLastBorrowed(null);
        }
      }
    } catch (error) {
      console.error("Error fetching last borrowed timestamp:", error);
    } finally {
      setLoadingLastBorrowed(false);
    }
  }, [session?.user?.email, account, backendUrl]);

  const calculateTimeLeft = useCallback(() => {
    const timeLeft = getTimeLeftString(lastBorrowed);
    setTimeLeftToReborrow(timeLeft);
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
        const walletUser = await getUserByWallet(account.trim(), backendUrl);
        const isValid = verifyWalletMatchesEmail(walletUser, session.user.email);
        setIsCorrectUser(isValid);

        toast({
          title: isValid ? "Wallet Verified" : "Mismatch Detected",
          description: isValid
            ? "Your wallet address matches your registered email."
            : "The connected wallet does not match your registered email.",
          variant: isValid ? "default" : "destructive",
          duration: isValid ? 2500 : 4000,
        });
      } catch (err) {
        console.error("❌ Verification error:", err);
        toast({
          title: "Verification Error",
          description: "Could not verify wallet against email.",
          variant: "destructive",
          duration: 4000,
        });
      } finally {
        isRequestInProgress.current = false;
        setCheckingUser(false);
      }
    };

    verifyUserWithWallet();
  }, [account, session?.user?.email, backendUrl, toast]);

  const refreshAll = useCallback(async () => {
    await delay(300);
    await refreshWalletBalance();
    await refreshWhitelistStatus();
    await fetchLastBorrowed();
  }, [refreshWalletBalance, refreshWhitelistStatus, fetchLastBorrowed]);

  const handleWhitelistAddress = useCallback(async () => {
    if (!account || !session?.user?.email || isRequestInProgress.current) return;

    isRequestInProgress.current = true;
    setIsSubmitting(true);

    try {
      await postWhitelist(session.user.email, account, backendUrl);
      toast({
        title: "Whitelisted",
        description: "Your wallet has been whitelisted.",
        duration: 2500,
      });
      await refreshAll();
    } catch (err) {
      console.error("❌ Whitelist failed:", err);
      toast({
        title: "Whitelist Failed",
        description: "Could not whitelist your wallet.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      isRequestInProgress.current = false;
      setIsSubmitting(false);
    }
  }, [account, session?.user?.email, backendUrl, toast, refreshAll]);

  const handleBorrowTokens = useCallback(async () => {
    if (!account || !session?.user?.email || isRequestInProgress.current) return;

    if (!canBorrowNow(lastBorrowed)) {
      toast({
        title: "Please Wait",
        description: `Wait ${timeLeftToReborrow} before borrowing again.`,
        variant: "destructive",
        duration: 3500,
      });
      return;
    }

    isRequestInProgress.current = true;
    setIsSubmitting(true);

    try {
      await postBorrow(session.user.email, account, backendUrl);
      toast({
        title: "Borrowed",
        description: "Tokens successfully borrowed.",
        duration: 2500,
      });
      await refreshAll();
    } catch (err) {
      console.error("❌ Borrow error:", err);
      toast({
        title: "Error",
        description: "An error occurred while borrowing tokens.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      isRequestInProgress.current = false;
      setIsSubmitting(false);
    }
  }, [
    account,
    session?.user?.email,
    backendUrl,
    toast,
    lastBorrowed,
    timeLeftToReborrow,
    refreshAll,
  ]);

  return {
    handleWhitelistAddress,
    handleBorrowTokens,
    isWhitelisted,
    isSubmitting,
    fetchLastBorrowed,
    loadingLastBorrowed,
    canBorrow: canBorrowNow(lastBorrowed),
    timeLeftToReborrow,
    checkingUser,
    isCorrectUser,
    refreshAll,
  };
};
