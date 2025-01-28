import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

interface WalletDropdownProps {
    walletBalance: number | null;
    loading: boolean;
    isDarkMode: boolean;
    disconnectWallet: () => void;
}

export const WalletDropdown: React.FC<WalletDropdownProps> = ({
    walletBalance,
    loading,
    isDarkMode,
    disconnectWallet,
}) => (
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
                    <Spinner className="ml-2" size="sm" />
                ) : (
                    `${Number(walletBalance).toPrecision(3)} ETH`
                )}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
                Balance: {loading ? <Spinner size="sm" /> : `${Number(walletBalance).toPrecision(3)} ETH`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
                Disconnect
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);
