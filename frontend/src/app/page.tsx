"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OAuthButtons from "@/components/OAuthButtons";
import Divider from "@/components/Divider";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex w-full bg-black">
      <div className="flex-1 relative">
        <Image
          src="/syvora.png"
          alt="Syvora Image"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
        />
      </div>
      <div className="flex-1 bg-black flex items-center justify-center">
        <div className="space-y-6 flex flex-col items-center">
          <h1 className="text-white text-4xl font-bold mb-4">Syvora Faucet</h1>
          <p className="text-white text-lg text-center mb-6">
            Welcome to the Syvora Faucet. This platform allows you to access testnet tokens for Syvora, enabling developers and testers to interact with the Syvora blockchain. Get started by signing in and claiming your testnet funds.
          </p>
          <div className="mx-2">
            <OAuthButtons />
            <Divider />
            <Button variant="default" color="blue" size="lg" className="w-full" onClick={() => router.push('/signup')}>
              Create Account
            </Button>
            <p className="mt-4">Already have an account?</p>
            <Button variant="default" color="blue" size="lg" className="w-full mt-2" onClick={() => router.push('/signin')}>
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
