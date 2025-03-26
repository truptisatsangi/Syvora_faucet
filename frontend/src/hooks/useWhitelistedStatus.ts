import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { useConfig } from "../context/ConfigContext";

const useWhitelistedStatus = () => {
  const { account } = useWallet();
  const { backendUrl } = useConfig();

  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWhitelistStatus = useCallback(async () => {
    if (!account) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/isWhitelisted?account=${account}`,
      );
      if (response.ok) {
        const data = await response.json();
        setIsWhitelisted(data.isWhitelisted);
      } else {
        setIsWhitelisted(false);
      }
    } catch (error) {
      console.error("Error fetching whitelist status:", error);
      setIsWhitelisted(false);
    } finally {
      setLoading(false);
    }
  }, [account, backendUrl]);

  useEffect(() => {
    fetchWhitelistStatus();
  }, [fetchWhitelistStatus]);

  return {
    isWhitelisted,
    loading,
    refreshWhitelistStatus: fetchWhitelistStatus,
  };
};

export default useWhitelistedStatus;
