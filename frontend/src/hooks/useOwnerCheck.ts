'use client';

import { useState } from 'react';
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
        setIsCheckingOwner(true);
        try {
            const response = await fetch(`${backendUrl}/isOwner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userAddress: account }),
            });

            if (!response.ok) {
                throw new Error('Failed to check ownership');
            }

            const data = await response.json();
            setIsOwner(data.isOwner);

            if (!data.isOwner) {
                router.push('/borrow');
            }
        } catch {
            toast({ description: "Failed to verify ownership.", variant: "destructive" });
        } finally {
            setIsCheckingOwner(false);
        }
    };

    return { isOwner, isCheckingOwner, checkOwner };
};
