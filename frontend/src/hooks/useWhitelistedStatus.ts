import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import { useConfig } from "../context/ConfigContext";
import { useWallet } from "../context/WalletContext";

const useWhitelistedStatus = () => {
  const { account } = useWallet();
  const { backendUrl } = useConfig();
  const { data: session } = useSession();

  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [isWhitelistLoading, setIsWhitelistLoading] = useState<boolean>(true);

  const fetchWhitelistStatus = useCallback(async () => {
    if (!account || !session) {
      return;
    }

    setIsWhitelistLoading(true);

    try {
      const response = await fetch(
        `${backendUrl}/isWhitelisted?account=${account}&email=${session.user?.email}`
      );

      if (response.ok) {
        const data = await response.json();
        setIsWhitelisted(data.isWhitelisted);
      } else {
        setIsWhitelisted(false);
      }
    } catch {
      setIsWhitelisted(false);
    } finally {
      setIsWhitelistLoading(false);
    }
  }, [account, backendUrl, session]);

  useEffect(() => {
    fetchWhitelistStatus();
  }, [fetchWhitelistStatus]);

  return {
    isWhitelisted,
    isWhitelistLoading,
    refreshWhitelistStatus: fetchWhitelistStatus,
  };
};

export default useWhitelistedStatus;
