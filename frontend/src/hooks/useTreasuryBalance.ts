import { useCallback, useEffect, useState } from "react";

import { useConfig } from "../context/ConfigContext";
import { useToast } from "../hooks/use-toast";

export const useTreasuryBalance = () => {
  const [treasuryBalance, setTreasuryBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { backendUrl } = useConfig();

  const fetchTreasuryBalance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/balance/treasury`);
      if (!response.ok) {
        throw new Error("Failed to fetch Treasury Balance");
      }
      const data = await response.json();
      setTreasuryBalance(data.treasuryBalance);
    } catch (error) {
      console.error("Error fetching Treasury Balance:", error);
      toast({
        description: "Failed to fetch Treasury Balance.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [backendUrl, toast]);

  useEffect(() => {
    fetchTreasuryBalance();
  }, [fetchTreasuryBalance]);

  const refreshTreasuryBalance = useCallback(async () => {
    await fetchTreasuryBalance();
  }, [fetchTreasuryBalance]);

  return { treasuryBalance, loading, refreshTreasuryBalance };
};
