"use client";

import React from "react";

import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface WhitelistEntry {
  email: string;
  walletAddress: string;
}

interface WhitelistTableProps {
  whitelist: WhitelistEntry[];
  isLoading: boolean;
}

const WhitelistTable: React.FC<WhitelistTableProps> = ({
  whitelist,
  isLoading,
}) => {
  return (
    <div className="flex justify-center items-center min-h-full">
      <div className="max-w-4xl w-full rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Whitelisted Accounts</h2>
        <Table>
          <TableCaption>A list of accounts that are whitelisted.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Email</TableHead>
              <TableHead className="w-[300px]">Wallet Address</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-6 w-[180px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[250px]" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : whitelist.length > 0 ? (
              whitelist.map(({ email, walletAddress }, index) => (
                <TableRow key={index} className="transition-colors">
                  <TableCell className="font-medium">{email}</TableCell>
                  <TableCell>{walletAddress}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="hover:bg-red-500"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-gray-500"
                >
                  No whitelisted accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {!isLoading && whitelist.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">
                  Total Accounts
                </TableCell>
                <TableCell className="text-center">
                  {whitelist.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
};

export default WhitelistTable;
