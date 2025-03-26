import { useEffect, useState, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { useConfig } from "../context/ConfigContext";
import { useToast } from "../hooks/use-toast";

export const useWalletBalance = () => {
    const { account } = useWallet();
    const { backendUrl } = useConfig();
    const [balance, setBalance] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchWalletBalance = useCallback(async () => {
        if (!account) return;

        setLoading(true);
        try {
            const response = await fetch(`${backendUrl}/balance/walletAddress?account=${account}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch wallet balance");
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Unknown error");
            }

            setBalance(data.balance);
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
    }, [account, backendUrl, toast]);

    useEffect(() => {
        fetchWalletBalance();
    }, [fetchWalletBalance]);

    const refreshWalletBalance = async () => {
        await fetchWalletBalance();
    };

    return { balance, loading, refreshWalletBalance };
};
