import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { ToggleThemeButton } from "../../components/buttons/ToggleThemeButton";
import { WalletDropdown } from "../../components/WalletDropdown";
import { NavButton } from "../../components/buttons/NavButton";
import { useOwnerCheck } from "../../hooks/useOwnerCheck";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { Button } from "../ui/button";

export default function Header() {
  const { theme } = useTheme();
  const { isConnected, account, connectMetaMask, disconnectWallet } = useWallet();
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isDarkMode = theme === "dark";

  const { balance: walletBalance, loading } = useWalletBalance();
  const { isOwner, isCheckingOwner, checkOwner } = useOwnerCheck();

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
            {user && account && <NavButton path="/borrow" label="Borrow" />}
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
                walletBalance={(walletBalance as unknown as number) || 0}
                loading={loading}
                isDarkMode={isDarkMode}
                disconnectWallet={disconnectWallet}
              />
            ) : (
              <Button variant="outline" onClick={connectMetaMask}>
                CONNECT
              </Button>
            )}
            {user && <Button variant="destructive" onClick={signOut}>
              Logout
            </Button>
            }
            {!user && pathname === '/lend' ? <Button variant="default" onClick={() => router.push('/signin')}>
              Login
            </Button> : null}
          </div>
        </>
      )}

      {isAuthPage && (
        <div>
          <NavButton path="/lend" label="Lend Tokens" />
          <ToggleThemeButton />
        </div>)}

    </header>
  ) : null;
}
