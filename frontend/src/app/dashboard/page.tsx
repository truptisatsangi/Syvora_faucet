"use client";

import { useTheme } from "next-themes";
import React from "react";
import UnauthorizedAlert from "../../components/alerts/UnauthorizedAlert";
import { CardWithForm } from "../../components/forms/CardWithForm";
import { Spinner } from "../../components/ui/spinner";
import { useOwnerCheck } from "../../hooks/useOwnerCheck";
import { useTreasuryBalance } from "../../hooks/useTreasuryBalance";

const DashboardPage = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const { treasuryBalance, loading: treasuryLoading } = useTreasuryBalance();
  const { isOwner, isCheckingOwner } = useOwnerCheck();

  if (isCheckingOwner) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex flex-col items-center justify-center bg-opacity-80 ${
        isDarkMode ? "bg-black" : "bg-white"
      } backdrop-blur-sm border-b ${
        isDarkMode ? "border-gray-800" : "border-gray-200"
      } shadow-md`}
    >
      {!isOwner && <UnauthorizedAlert />}

      <div className="absolute top-24 right-8 text-lg font-semibold">
        {treasuryLoading ? (
          <Spinner size="sm" />
        ) : (
          <>
            <span className="mr-2">Treasury Balance:</span>
            <span className="text-xl font-bold">{`${treasuryBalance} ETH`}</span>
          </>
        )}
      </div>

      <div className="w-full max-w-md mt-16">
        <CardWithForm />
      </div>
    </div>
  );
};

export default DashboardPage;
