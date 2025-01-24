import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConfig } from "@/context/ConfigContext";

export const useTreasuryBalance = () => {
  const [treasuryBalance, setTreasuryBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { backendUrl } = useConfig();

  useEffect(() => {
    fetchTreasuryBalance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  const fetchTreasuryBalance = async () => {
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
      toast({ description: "Failed to fetch Treasury Balance.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return { treasuryBalance, loading };
};
