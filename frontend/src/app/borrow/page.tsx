"use client";

import { useTheme } from "next-themes";
import React, { useState, useEffect, useCallback } from "react";
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
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
import { useWallet } from "../../context/WalletContext";
import { useToast } from "../../hooks/use-toast";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import useWhitelistedStatus from "../../hooks/useWhitelistedStatus";

const BorrowPage: React.FC = () => {
    const { isConnected, account, loading } = useWallet();
    const { backendUrl } = useConfig();
    const { user } = useAuth();
    const { toast } = useToast();
    const { balance, loading: balanceLoading, refreshWalletBalance } =
        useWalletBalance();
    const { theme } = useTheme();
    const isDarkMode = (theme ?? "light") === "dark";
    const { isWhitelisted, loading: whitelistStatusLoading, refreshWhitelistStatus } =
        useWhitelistedStatus();
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("isWhitelisted:", isWhitelisted, account);

    useEffect(() => {
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
                    variant: "default",
                });
                await refreshWhitelistStatus();
            } else {
                const result = await response.json();
                toast({
                    title: "Whitelist failed",
                    description: result?.message || "Failed to whitelist your wallet.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error whitelisting wallet:", error);
            toast({
                title: "Error",
                description: "An error occurred while whitelisting the wallet.",
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
                body: JSON.stringify({ account }),
            });

            const result = await response.json();

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
                    description: result?.message || "Failed to borrow tokens.",
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-xl font-bold">Loading...</h1>
            </div>
        );
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm ${isDarkMode ? "bg-black border-gray-800" : "bg-white border-gray-200"
                } border-b shadow-md`}
        >
            <Card className="w-full max-w-md backdrop-blur-lg shadow-lg border rounded-lg p-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-medium">
                        Borrow Tokens
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Borrow tokens seamlessly. Ensure your wallet is connected to proceed.
                        You can borrow if your wallet is whitelisted, has less than 0.5 ETH,
                        and it has been at least 8 hours since your last borrow.
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
                            <Button
                                disabled={
                                    !isConnected ||
                                    !account ||
                                    isSubmitting ||
                                    balanceLoading ||
                                    Number(balance) > 0.5 ||
                                    whitelistStatusLoading
                                }
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
