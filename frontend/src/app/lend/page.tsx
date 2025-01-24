'use client';

import { ethers } from 'ethers';
import { useTheme } from 'next-themes';
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { SYVORA_TREASURY_ABI } from '@/utils/constants';
import { useTreasuryBalance } from '@/hooks/useTreasuryBalance';

const LendPage = () => {
    const { isConnected, account, signer, loading: walletLoading } = useWallet();
    const { toast } = useToast();
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { treasuryBalance, loading: treasuryLoading } = useTreasuryBalance();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    useEffect(() => {
        if (!isConnected) {
            toast({
                variant: 'destructive',
                title: 'Wallet not connected',
                description: 'Please connect your wallet to proceed.',
            });
        }
    }, [isConnected, toast]);

    const handleLend = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid amount',
                description: 'Please enter a valid amount greater than 0.',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_SYVORA_TREASURY_CONTRACT_ADDRESS as string,
                SYVORA_TREASURY_ABI,
                signer
            );

            const tx = await contract.lendFaucet({
                value: ethers.parseEther(amount),
                gasLimit: 300000,
            });

            console.log('Transaction sent:', tx);
            const receipt = await tx.wait();

            if (receipt.status !== 1) {
                throw new Error('Blockchain transaction failed.');
            }

            toast({
                title: 'Success',
                description: `You lent ${amount} Ether successfully.`,
            });

            setAmount('');
        } catch (error) {
            console.error('Lend failed:', error);
            toast({
                variant: 'destructive',
                title: 'Transaction failed',
                description: 'Something went wrong. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (walletLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div
            className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center px-8 bg-opacity-80 ${isDarkMode ? 'bg-black' : 'bg-white'
                } backdrop-blur-md`}
        >

            <div className="absolute top-24 right-8 text-lg font-semibold">
                {treasuryLoading ? (
                    <Spinner size="sm" />
                ) : (
                    <>
                        <span className="mr-2">Treasury Balance:</span>
                        <span className="text-xl font-bold">{`${treasuryBalance} ETH`}</span>
                    </>
                )}
            </div>
            <Card className="w-full max-w-lg backdrop-blur-md shadow-lg border">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Lend Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg">
                        Lend your tokens to earn rewards. Ensure your wallet is connected to proceed.
                    </p>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-semibold mb-2">
                            Enter Amount in Ether
                        </label>
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
                            !isConnected || !account || isSubmitting || !amount || parseFloat(amount) <= 0
                        }
                        className="w-full"
                        onClick={handleLend}
                    >
                        {isSubmitting ? (
                            <Spinner size="sm" className="bg-black dark:bg-white" />
                        ) : (
                            'Lend Ether'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LendPage;
