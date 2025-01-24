import { useState, useEffect, useCallback } from "react";
import { useConfig } from "../context/ConfigContext";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../hooks/use-toast";

const useWhitelistedStatus = () => {
    const { account } = useWallet();
    const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { backendUrl } = useConfig();
    const [error, setError] = useState<string>('');
    const { toast } = useToast();

    const fetchWhitelistedStatus = useCallback(async () => {
        if (!account) {
            setLoading(false);
            setError("Account address is required");
            toast({ title: "Account address is required", variant: 'default' });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/isWhitelisted`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsWhitelisted(data.isWhitelisted);

                if (data.isWhitelisted) {
                    toast({ title: "Account is whitelisted" });
                } else {
                    toast({ title: "Account is not whitelisted", variant: 'destructive' });
                }
            } else {
                setError(data.error || "Failed to fetch status");
                console.error("Error fetching whitelist status:", data.error || "Unknown error");
                toast({ title: "Failed to fetch status", variant: 'destructive' });
            }
        } catch (err) {
            console.error("Error during fetch:", err);
            setError("An error occurred while fetching data");
            toast({ title: "An error occurred while fetching data", variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [account, backendUrl, toast]);

    useEffect(() => {
        console.log("useEffect triggered: Fetching whitelist status");
        fetchWhitelistedStatus();
    }, [fetchWhitelistedStatus]);

    return {
        isWhitelisted,
        loading,
        error,
        refreshWhitelistStatus: fetchWhitelistedStatus,
    };
};

export default useWhitelistedStatus;
