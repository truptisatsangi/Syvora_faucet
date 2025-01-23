"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { ToggleTheme } from "@/components/ToggleTheme";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useOwnerCheck } from "@/hooks/useOwnerCheck";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export default function Header() {
  const { theme } = useTheme();
  const { isConnected, account, connectMetaMask, disconnectWallet } = useWallet();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isDarkMode = theme === "dark";

  const { balance: walletBalance, loading } = useWalletBalance();
  const { isOwner, isCheckingOwner, checkOwner } = useOwnerCheck();

  const isActive = (path: string) => pathname === path;

  const navigateTo = (path: string) => {
    if (pathname !== path) {
      router.push(path);
    }
  };

  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  if (account && !isCheckingOwner && isOwner === undefined) {
    checkOwner();
  }

  return pathname !== '/' ? (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[80px] px-8 flex items-center justify-between bg-opacity-80 ${isDarkMode ? "bg-black" : "bg-white"
        } backdrop-blur-md border-b ${isDarkMode ? "border-gray-800" : "border-gray-200"
        } shadow-md`}
    >
      <div className="flex items-center gap-4">
        <Link href="/">
          <Image
            src={isDarkMode ? "/logo_white.png" : "/logo_black.png"}
            alt="Company Logo"
            width={120}
            height={40}
            priority
            className="cursor-pointer"
          />
        </Link>
      </div>

      {!isAuthPage && (
        <>
          <nav className="flex items-center gap-6">
            {["/borrow", "/lend"].map((path) => (
              <Button
                key={path}
                variant="ghost"
                onClick={() => navigateTo(path)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ease-in-out transform ${isActive(path)
                  ? isDarkMode ? `bg-primary text-black` : `bg-primary text-white`
                  : isDarkMode
                    ? "text-gray-400 hover:text-white hover:scale-105"
                    : "text-gray-600 hover:text-black hover:scale-105"
                  }`}
              >
                {path.replace("/", "").toUpperCase()}
              </Button>
            ))}

            {isOwner && (
              <>
                <Button
                  key="/whitelist"
                  variant="ghost"
                  onClick={() => navigateTo("/whitelist")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ease-in-out transform ${isActive("/whitelist")
                    ? isDarkMode ? `bg-primary text-black` : `bg-primary text-white`
                    : isDarkMode
                      ? "text-gray-400 hover:text-white hover:scale-105"
                      : "text-gray-600 hover:text-black hover:scale-105"
                    }`}
                >
                  WHITELIST
                </Button>
                <Button
                  key="/dashboard"
                  variant="ghost"
                  onClick={() => navigateTo("/dashboard")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ease-in-out transform ${isActive("/dashboard")
                    ? isDarkMode ? `bg-primary text-black` : `bg-primary text-white`
                    : isDarkMode
                      ? "text-gray-400 hover:text-white hover:scale-105"
                      : "text-gray-600 hover:text-black hover:scale-105"
                    }`}
                >
                  DASHBOARD
                </Button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ToggleTheme />
            {isConnected && account ? (
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
                  <DropdownMenuItem
                    onClick={disconnectWallet}
                    className="text-red-600"
                  >
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={connectMetaMask}
              >
                CONNECT
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={signOut}
            >
              Logout
            </Button>
          </div>
        </>
      )}

      {isAuthPage && <ToggleTheme />}
    </header>
  ) : null;
}
