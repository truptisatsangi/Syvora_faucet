"use client";

import * as React from "react";
import { useState } from "react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Spinner } from "../../components/ui/spinner";
import { useConfig } from "../../context/ConfigContext";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../hooks/use-toast";

export function CardWithForm() {
  const { loading: walletLoading } = useWallet();
  const { backendUrl } = useConfig();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const response = await fetch(`${backendUrl}/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: withdrawAmount }),
      });

      if (!response.ok) {
        throw new Error("Failed to withdraw funds");
      }

      const data = await response.json();
      const txHash = data.transactionHash;
      console.log("Transaction Hash:", txHash);

      setWithdrawAmount("");
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast({
        description: "Error withdrawing funds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Withdraw</CardTitle>
        <CardDescription>Withdraw funds from the treasury.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label
                htmlFor="amount"
                className="block text-sm font-semibold mb-2"
              >
                Amount to Withdraw
              </Label>
              <Input
                id="amount"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                type="number"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          className="w-full"
          onClick={handleWithdraw}
          disabled={!withdrawAmount || walletLoading || isWithdrawing}
        >
          {isWithdrawing ? <Spinner size="sm" /> : "Withdraw"}
        </Button>
      </CardFooter>
    </Card>
  );
}
