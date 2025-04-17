"use client";

import { Copy } from "lucide-react";
import Image from "next/image";

import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Spinner } from "../components/ui/spinner";
import { useToast } from "../hooks/use-toast";

interface WalletDropdownProps {
  walletBalance: number | null;
  loading: boolean;
  isDarkMode: boolean;
  disconnectWallet: () => void;
  account: string;
}

const formatBalance = (balance: number | null) => {
  const numericBalance = Number(balance);
  return !isNaN(numericBalance)
    ? `${numericBalance.toFixed(4)} ETH`
    : "0 ETH";
};

export const WalletDropdown: React.FC<WalletDropdownProps> = ({
  walletBalance,
  loading,
  isDarkMode,
  disconnectWallet,
  account,
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(account);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard.",
      duration: 2000,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-4 shadow-lg px-6 py-2 rounded-full transition-all transform hover:scale-105"
        >
          <Image
            src={`/wallet_balance_${isDarkMode ? "colored" : "outline"}.png`}
            alt="Wallet Balance"
            width={20}
            height={20}
          />
          {loading ? (
            <Spinner className="ml-2 bg-black dark:bg-white" size="lg" />
          ) : (
            formatBalance(walletBalance)
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem disabled>
          Balance:{" "}
          {loading ? (
            <Spinner size="sm" className="ml-2" />
          ) : (
            formatBalance(walletBalance)
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            window.open(`https://etherscan.io/address/${account}`, "_blank")
          }
        >
          View on Etherscan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            if (confirm("Are you sure you want to disconnect your wallet?")) {
              disconnectWallet();
            }
          }}
          className="text-red-600"
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
