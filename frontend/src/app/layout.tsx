"use client";

import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ConfigProvider } from "../context/ConfigContext";
import { WalletProvider } from "../context/WalletContext";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className='h-screen flex flex-col justify-center items-center'>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConfigProvider>
            <WalletProvider>
              <AuthProvider>
                <div className="relative flex h-screen w-screen items-center justify-center">
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <span className="emoji absolute text-8xl transform animate-float1">🤑</span>
                    <span className="emoji absolute text-8xl transform animate-float2">💰</span>
                    <span className="emoji absolute text-8xl transform animate-float3">💸</span>
                    <span className="emoji absolute text-8xl transform animate-float2">🤑</span>
                    <span className="emoji absolute text-8xl transform animate-float3">💰</span>
                    <span className="emoji absolute text-8xl transform animate-float1">💸</span>
                  </div>
                </div>
                {children}
                <Header/>
                <Toaster />
              </AuthProvider>
            </WalletProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
