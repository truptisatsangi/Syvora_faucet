'use client';

import React, { useState } from 'react';
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../hooks/use-toast';

const WhitelistForm = () => {
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { backendUrl } = useConfig();

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@qodeleaf\.com$/;
    if (!emailRegex.test(email)) {
      setError('Email must end with "qodeleaf.com".');
      return false;
    }
    if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
      setError('Invalid wallet address.');
      return false;
    }
    setError('');
    return true;
  };

  const handleAddToWhitelist = async () => {
    if (!validateInputs()) return;

    try {
      const response = await fetch(`${backendUrl}/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, account: walletAddress, isWhitelisted: true }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${email} has been successfully whitelisted with wallet ${walletAddress}.`,
          variant: 'default',
        });
        setEmail("");
        setWalletAddress("");
      } else {
        const result = await response.json();
        toast({
          title: 'Error',
          description: result.message || 'Failed to whitelist the email and wallet address.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Error adding to whitelist:", error);
      toast({
        title: 'Error',
        description: 'An error occurred while whitelisting the wallet address.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md backdrop-blur-md shadow-lg border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Add to Whitelist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="block text-sm font-semibold mb-2">Email Address</Label>
            <Input
              id="email"
              placeholder="Enter email (e.g., john@qodeleaf.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="walletAddress" className="block text-sm font-semibold mb-2">Wallet Address</Label>
            <Input
              id="walletAddress"
              placeholder="Enter wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={handleAddToWhitelist} variant="default" className="w-full">
            Add to Whitelist
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WhitelistForm;
