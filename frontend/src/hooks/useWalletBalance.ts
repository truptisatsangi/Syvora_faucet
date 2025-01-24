import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../hooks/use-toast";

export const useWalletBalance = () => {
    const { account, provider } = useWallet();
    const [balance, setBalance] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (account && provider) {
            fetchWalletBalance();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, provider]);

    const fetchWalletBalance = async () => {
        setLoading(true);
        try {
            const balanceInWei = await provider.getBalance(account);
            const balanceInEth = ethers.formatEther(balanceInWei);
            setBalance(balanceInEth);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast({
                    variant: "destructive",
                    title: "Error fetching wallet balance",
                    description: error.message || "An error occurred",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error fetching wallet balance",
                    description: "An unknown error occurred",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return { balance, loading };
};
