'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/context/ConfigContext';
import { useWallet } from '@/context/WalletContext';
import { useToast } from './use-toast';

export const useOwnerCheck = () => {
    const [isOwner, setIsOwner] = useState(false);
    const [isCheckingOwner, setIsCheckingOwner] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const { backendUrl } = useConfig();
    const { account } = useWallet();

    const checkOwner = async () => {
        if (!account) return;

        setIsCheckingOwner(true);
        try {
            const response = await fetch(`${backendUrl}/isOwner?userAddress=${account}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to check ownership');
            }

            const data = await response.json();
            setIsOwner(data.isOwner);
        } catch {
            toast({ description: "Failed to verify ownership.", variant: "destructive" });
        } finally {
            setIsCheckingOwner(false);
        }
    };

    useEffect(() => {
        if (!isCheckingOwner && !isOwner) {
            router.push('/borrow');
        }
    }, [isCheckingOwner, isOwner, router]);

    useEffect(() => {
        checkOwner();
    }, [account]);

    return { isOwner, isCheckingOwner, checkOwner };
};
