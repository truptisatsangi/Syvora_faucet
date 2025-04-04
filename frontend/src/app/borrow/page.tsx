"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";
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
import { useBorrowing } from "../../hooks/useBorrowing";
import { useToast } from "../../hooks/use-toast";
import { useWalletBalance } from "../../hooks/useWalletBalance";

const BorrowPage: React.FC = () => {
  const { isConnected, account } = useWallet();
  const { balance, loading: balanceLoading } = useWalletBalance();
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
  } = useBorrowing();

  const { toast } = useToast();

  useEffect(() => {
    fetchLastBorrowed();
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to proceed.",
      });
    }
  }, [isConnected]);

  useEffect(() => {
    if (account && !balanceLoading && Number(balance) > 0.5) {
      toast({
        variant: "destructive",
        title: "Wallet balance too high",
        description: "Your balance must be below 0.5 ETH to borrow.",
      });
    }
  }, [account, balanceLoading, balance]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm ${isDarkMode ? "bg-black border-gray-800" : "bg-white border-gray-200"} border-b shadow-md`}
    >
      <Card className="w-full max-w-md backdrop-blur-lg shadow-lg border rounded-lg p-4">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Borrow Tokens</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Borrow tokens seamlessly. Ensure your wallet is connected to
            proceed. You can borrow if your wallet is whitelisted, has less than
            0.5 ETH, and it has been at least 8 hours since your last borrow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {account && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="walletAddress"
                  className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200"
                >
                  Wallet Address
                </label>
                <Input
                  id="walletAddress"
                  type="text"
                  value={account}
                  readOnly
                  className="cursor-not-allowed bg-gray-200 dark:bg-gray-800"
                />
              </div>

              {!canBorrow && timeLeftToReborrow && (
                <div className="text-red-500 text-sm font-medium">
                  You can borrow again in {timeLeftToReborrow}.
                </div>
              )}

              <Button
                disabled={!canBorrow || balanceLoading || loadingLastBorrowed}
                className="w-full py-3 rounded-lg flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
                onClick={
                  isWhitelisted ? handleBorrowTokens : handleWhitelistAddress
                }
              >
                {isSubmitting ? (
                  <Spinner size="sm" className="text-white" />
                ) : isWhitelisted ? (
                  "Borrow Tokens"
                ) : (
                  "Whitelist Address"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowPage;
