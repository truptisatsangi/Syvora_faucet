"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OAuthButtons from "@/components/OAuthButtons";
import Divider from "@/components/Divider";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-opacity-80 ${
        isDarkMode ? "bg-black" : "bg-white"
      } backdrop-blur-md border-b ${
        isDarkMode ? "border-gray-800" : "border-gray-200"
      } shadow-md`}
    >
      <div className="flex-1 relative h-full">
        <Image
          src={isDarkMode ? "/syvora_white.png" : "/syvora_black.png"}
          alt="Syvora Image"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 flex items-center justify-center h-full">
        <div className="space-y-6 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-4">Syvora Faucet</h1>
          <p className="text-lg text-center mb-6">
            Welcome to the Syvora Faucet. This platform allows you to access testnet tokens for Syvora, enabling developers and testers to interact with the Syvora blockchain. Get started by signing in and claiming your testnet funds.
          </p>
          <div className="mx-2">
            <OAuthButtons />
            <Divider />
            <Button
              variant="default"
              color="blue"
              size="lg"
              className="w-full"
              onClick={() => router.push("/signup")}
            >
              Create Account
            </Button>
            <p className="mt-4">Already have an account?</p>
            <Button
              variant="default"
              color="blue"
              size="lg"
              className="w-full mt-2"
              onClick={() => router.push("/signin")}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
