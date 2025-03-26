"use client";

import { useTheme } from "next-themes";
import React, { useState } from "react";
import UnauthorizedAlert from "../../components/alerts/UnauthorizedAlert";
import WhitelistForm from "../../components/forms/WhiteListForm";
import WhitelistTable from "../../components/tables/WhiteListTable";
import { Spinner } from "../../components/ui/spinner";
import { useOwnerCheck } from "../../hooks/useOwnerCheck";

const WhitelistPage = () => {
  const { isOwner, isCheckingOwner } = useOwnerCheck();
  const [whitelist] = useState([
    { email: "john@qodeleaf.com", walletAddress: "0x123...abc" },
  ]);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const hasWhitelistItems = whitelist.length > 0;

  if (isCheckingOwner) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-full px-8 flex items-center justify-between bg-opacity-80 ${
        isDarkMode ? "bg-black" : "bg-white"
      } backdrop-blur-sm border-b ${
        isDarkMode ? "border-gray-800" : "border-gray-200"
      } shadow-md`}
    >
      <div className="w-full h-full flex flex-row">
        <div className={`${hasWhitelistItems ? `w-1/2` : `w-full`} h-full`}>
          {isOwner ? <WhitelistForm /> : <UnauthorizedAlert />}
        </div>
        {hasWhitelistItems && (
          <div className="w-1/2 h-full mx-12">
            <WhitelistTable whitelist={whitelist} isLoading={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WhitelistPage;
