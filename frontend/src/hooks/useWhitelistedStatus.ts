import { useState, useEffect } from "react";
import { useConfig } from "../context/ConfigContext";
import { useToast } from "../hooks/use-toast";

const useWhitelistedStatus = (account: string) => {
    const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { backendUrl } = useConfig()
    const [error, setError] = useState<string>('');
    const { toast } = useToast();

    useEffect(() => {
        const fetchWhitelistedStatus = async () => {
            if (!account) {
                setLoading(false);
                setError("Account address is required");
                toast({ title: "Account address is required", variant: 'default' });
                return;
            }

            try {
                const response = await fetch(`${backendUrl}/isWhitelistedAccount?account=${account}`);
                const data = await response.json();

                if (response.ok) {
                    setIsWhitelisted(data.isWhitelisted);
                    if (data.isWhitelisted) {
                        toast({ title: "Account is whitelisted" });
                    }
                    else {
                        toast({ title: "Account is not whitelisted", variant: 'destructive' });
                    }
                } else {
                    setError(data.error || "Failed to fetch status");
                    toast({ title: "Failed to fetch status", variant: 'destructive' });
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching data");
                toast({ title: "An error occurred while fetching data", variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchWhitelistedStatus();
    }, [account, backendUrl, toast]);

    return { isWhitelisted, loading, error };
};

export default useWhitelistedStatus;
