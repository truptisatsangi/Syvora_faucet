"use client";

import { ethers } from "ethers";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Spinner } from "../../components/ui/spinner";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../hooks/use-toast";
import { useTreasuryBalance } from "../../hooks/useTreasuryBalance";
import { SYVORA_TREASURY_ABI } from "../../utils/constants";

const LendPage = () => {
  const { isConnected, account, signer, refreshWalletBalance } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    treasuryBalance,
    loading: treasuryLoading,
    refreshTreasuryBalance,
  } = useTreasuryBalance();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to proceed.",
      });
    }
  }, [isConnected, toast]);

  const handleLend = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_SYVORA_TREASURY_CONTRACT_ADDRESS as string,
        SYVORA_TREASURY_ABI,
        signer,
      );

      const tx = await contract.lendFaucet({
        value: ethers.parseEther(amount),
        gasLimit: 300000,
      });

      const receipt = await tx.wait();

      if (receipt.status !== 1) {
        throw new Error("Blockchain transaction failed.");
      }

      toast({
        title: "Success",
        description: `You lent ${amount} Ether successfully.`,
      });

      setAmount("");

      await Promise.all([refreshTreasuryBalance(), refreshWalletBalance()]);
    } catch (error) {
      console.error("Lend failed:", error);
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center px-8 bg-opacity-80 ${isDarkMode ? "bg-black" : "bg-white"
        } backdrop-blur-sm`}
    >
      <div className="absolute top-24 right-8 text-lg font-semibold">
        <span className="mr-2">Treasury Balance:</span>
        <span className="text-xl font-bold">
          {treasuryLoading ? (
            <Spinner size="lg" className="mr-2 bg-black dark:bg-white" />
          ) : (
            `${treasuryBalance} ETH`
          )}
        </span>
      </div>
      <Card className="w-full max-w-lg backdrop-blur-md shadow-lg border">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Lend Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Lend your tokens to earn rewards. Ensure your wallet is connected to
            proceed.
          </p>
          <div>
            <Label htmlFor="amount" className="text-sm font-semibold mb-2">
              Enter Amount in Ether
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <Button
            disabled={
              !isConnected ||
              !account ||
              isSubmitting ||
              !amount ||
              parseFloat(amount) <= 0
            }
            className="w-full"
            onClick={handleLend}
          >
            {isSubmitting ? (
              <Spinner size="lg" className="mr-2 bg-black dark:bg-white" />
            ) : (
              "Lend Ether"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LendPage;
