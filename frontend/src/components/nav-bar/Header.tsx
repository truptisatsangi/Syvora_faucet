"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { NavButton } from "../../components/buttons/NavButton";
import { ToggleThemeButton } from "../../components/buttons/ToggleThemeButton";
import { WalletDropdown } from "../../components/WalletDropdown";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { useOwnerCheck } from "../../hooks/useOwnerCheck";
import { Button } from "../ui/button";

export default function Header() {
  const { theme } = useTheme();
  const { isConnected, account, connectMetaMask, disconnectWallet, walletBalance, isWalletBalanceLoading } = useWallet();
  const { signOut } = useAuth();
  const { data: session } = useSession();
  const { isOwner, isCheckingOwner, checkOwner } = useOwnerCheck();

  const pathname = usePathname();
  const router = useRouter();

  const isDarkMode = theme === "dark";
  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  useEffect(() => {
    if (pathname === "/borrow" && !session?.user) {
      router.push("/signin");
    }
  }, [pathname, session, router]);

  useEffect(() => {
    if (account && !isCheckingOwner && isOwner === undefined) {
      checkOwner();
    }
  }, [account, isCheckingOwner, isOwner, checkOwner]);

  if (pathname === "/") return null;

  return (
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

      {!isAuthPage ? (
        <>
          <nav className="flex items-center gap-6">
            {session && account && <NavButton path="/borrow" label="Borrow" />}
            <NavButton path="/lend" label="Lend" />
            {isOwner && (
              <>
                <NavButton path="/whitelist" label="Whitelist" />
                <NavButton path="/dashboard" label="Dashboard" />
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ToggleThemeButton />
            {isConnected && account ? (
              <WalletDropdown
                account={account}
                walletBalance={(walletBalance) || 0}
                loading={isWalletBalanceLoading}
                isDarkMode={isDarkMode}
                disconnectWallet={disconnectWallet}
              />
            ) : (
              <Button variant="outline" onClick={connectMetaMask}>
                CONNECT
              </Button>
            )}
            {session?.user ? (
              <Button variant="destructive" onClick={signOut}>
                Logout
              </Button>
            ) : (
              pathname === "/lend" && (
                <Button variant="default" onClick={() => router.push("/signin")}>
                  Login
                </Button>
              )
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <NavButton path="/lend" label="Lend Tokens" />
          <ToggleThemeButton />
        </div>
      )}
    </header>
  );
}
