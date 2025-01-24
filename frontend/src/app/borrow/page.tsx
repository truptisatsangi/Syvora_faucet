'use client';

import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useConfig } from '@/context/ConfigContext';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import useWhitelistedStatus from '@/hooks/useWhitelistedStatus';

const BorrowPage = () => {
    const { isConnected, account, loading } = useWallet();
    const { backendUrl } = useConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { balance, loading: balanceLoading } = useWalletBalance();
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";
    const { isWhitelisted, loading: whitelistStatusLoading } = useWhitelistedStatus(account);

    useEffect(() => {
        if (!isConnected) {
            toast({
                variant: 'destructive',
                title: 'Wallet not connected',
                description: 'Please connect your wallet to proceed.',
            });
        }

        const whitelistAddress = async () => {
            if (isConnected && account && !isWhitelisted) {
                try {
                    const whitelistResponse = await fetch(`${backendUrl}/whitelist`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ account: account, isWhitelisted: true }),
                    });
                    if (whitelistResponse.ok) {
                        toast({
                            title: 'Wallet whitelisted',
                            description: 'Your wallet address has been successfully whitelisted.',
                            variant: 'default',
                            duration: 4000,
                        });
                    } else {
                        toast({
                            title: 'Whitelist failed',
                            description: 'Failed to whitelist your wallet address.',
                            variant: 'destructive',
                            duration: 4000,
                        });
                    }
                } catch (error) {
                    console.error('Error whitelisting wallet:', error);
                    toast({
                        title: 'Error',
                        description: 'An error occurred while whitelisting the wallet address.',
                        variant: 'destructive',
                        duration: 4000,
                    });
                }
            }
        };

        whitelistAddress();

        if (!account && !balanceLoading && Number(balance) > 0.5) {
            toast({
                variant: 'destructive',
                title: 'Wallet balance greater than 0.5 ETH',
                description: 'Wallet balance must be lower than 0.5 ETH to borrow.',
            });
        }
    }, [isConnected, account, isWhitelisted, backendUrl, balanceLoading, balance, toast]);

    const handleBorrowTokens = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${backendUrl}/borrow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ account: account }),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Tokens borrowed successfully.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.message || 'Failed to borrow tokens.',
                });
            }
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'An error occurred while borrowing tokens.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-xl font-bold">Loading...</h1>
            </div>
        );
    }

    return (
        <div
            className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-opacity-80 ${
                isDarkMode ? "bg-black" : "bg-white"
            } backdrop-blur-sm border-b ${
                isDarkMode ? "border-gray-800" : "border-gray-200"
            } shadow-md`}
        >
            <Card className="w-full max-w-md backdrop-blur-lg shadow-lg border rounded-lg p-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-medium leading-tight">
                        Borrow Tokens
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Borrow tokens seamlessly. Ensure your wallet is connected to proceed. You can borrow if your wallet is whitelisted, has less than 0.5 Ether, and it has been at least 8 hours since your last borrow.
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
                                    value={account || ''}
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
                                    !isWhitelisted ||
                                    whitelistStatusLoading
                                }
                                className="w-full py-3 rounded-lg mt-4 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
                                onClick={handleBorrowTokens}
                            >
                                {isSubmitting ? (
                                    <Spinner size="sm" className="text-white" />
                                ) : (
                                    'Borrow Tokens'
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
