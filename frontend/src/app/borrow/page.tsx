"use client";

import { ClipboardCheck, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Spinner } from "../../components/ui/spinner";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../hooks/use-toast";
import { useBorrowing } from "../../hooks/useBorrowing";

const BorrowPage: React.FC = () => {
  const { isConnected, account, walletBalance, isWalletBalanceLoading } = useWallet();
  const { theme } = useTheme();
  const isDarkMode = (theme ?? "light") === "dark";

  const {
    handleWhitelistAddress,
    handleBorrowTokens,
    isWhitelisted,
    isSubmitting,
    fetchLastBorrowed,
    loadingLastBorrowed,
    canBorrow,
    timeLeftToReborrow,
    isCorrectUser,
  } = useBorrowing();

  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLastBorrowed();
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to proceed.",
      });
    }
  }, [fetchLastBorrowed, isConnected, toast]);

  useEffect(() => {
    if (account && !isWalletBalanceLoading && Number(walletBalance) > 0.5) {
      toast({
        variant: "destructive",
        title: "Wallet balance too high",
        description: "Your wallet balance must be below 0.5 ETH to borrow.",
      });
    }
    if (isConnected && isCorrectUser === false) {
      toast({
        variant: "destructive",
        title: "Incorrect user",
        description: "This wallet is already associated with another user.",
      });
    }
  }, [account, isWalletBalanceLoading, walletBalance, isConnected, isCorrectUser, toast]);

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm ${isDarkMode ? "bg-black border-gray-800" : "bg-white border-gray-200"
        } border-b shadow-md`}
    >
      <Card className="w-full max-w-md p-4 shadow-lg border rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Borrow Tokens</CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            Borrow tokens seamlessly. You can borrow if your wallet is whitelisted, has less than
            0.5 ETH, and it has been at least 8 hours since your last borrow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              value={account || ""}
              readOnly
              className="text-sm font-mono"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <ClipboardCheck className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {loadingLastBorrowed ? (
            <Spinner />
          ) : (
            <>
              <p className="text-sm">
                {canBorrow
                  ? "You are eligible to borrow now."
                  : `Please wait ${timeLeftToReborrow} to borrow again.`}
              </p>

              <Button
                disabled={
                  isSubmitting ||
                  !isWhitelisted ||
                  Number(walletBalance) > 0.5 ||
                  !canBorrow
                }
                onClick={isWhitelisted ? handleBorrowTokens : handleWhitelistAddress}
                className="px-4 w-full"
              >
                {isSubmitting
                  ? isWhitelisted
                    ? "Submitting..."
                    : "Whitelisting..."
                  : isWhitelisted
                    ? "Borrow Tokens"
                    : "Whitelist Wallet"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowPage;
