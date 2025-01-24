import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';
import User from '../models/user.js';
import Transaction from '../models/transaction.js';
import { syvoraTreasury, provider } from '../utils/contractInstance.js';
import { ensureUserExists, handleBlockchainTransaction } from '../utils/helpers.js';

export const signUp = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered and whitelisted successfully." });
    } catch (err) {
        res.status(500).json({ message: "An error occurred during sign-up." });
    }
};

export const updateWhitelist = async (req, res) => {
    try {
        const { account, isWhitelisted } = req.body;

        if (!account || typeof isWhitelisted === "undefined") {
            return res.status(400).json({
                success: false,
                message: "Account and whitelist status are required.",
            });
        }

        const tx = await syvoraTreasury.updateWhitelistedAccount(account, isWhitelisted);
        const receipt = await handleBlockchainTransaction(tx);

        const updatedUser = await User.findOneAndUpdate(
            { walletAddress: account.toLowerCase() },
            { isWhitelisted },
            { new: true, upsert: true }
        );

        await Transaction.create({
            transactionHash: receipt.hash,
            walletAddress: account.toLowerCase(),
            type: "WHITELIST",
            amount: 0,
        });

        res.status(200).json({
            success: true,
            message: `Whitelist updated for account ${account}.`,
            transactionHash: receipt.hash,
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating whitelist.",
        });
    }
};

export const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        return res.status(200).json({
            message: 'Sign in successful',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while signing in' });
    }
};

export const getWalletAddressBalance = async (req, res) => {
    try {
        const { account } = req.body;

        if (!account) {
            return res.status(400).json({ success: false, message: 'Wallet address is required.' });
        }

        if (!ethers.isAddress(account)) {
            return res.status(400).json({ success: false, message: 'Invalid wallet address.' });
        }

        const balance = await provider.getBalance(account);

        const balanceInEther = ethers.formatEther(balance);

        res.status(200).json({
            success: true,
            balance: balanceInEther,
            message: 'Wallet balance fetched successfully.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wallet balance.',
        });
    }
};

export const getTreasuryBalance = async (req, res) => {
    try {
        if (!process.env.SYVORA_TREASURY_CONTRACT_ADDRESS || !provider) {
            return res.status(500).json({ error: 'Server configuration is incomplete' });
        }

        const balance = await provider.getBalance(process.env.SYVORA_TREASURY_CONTRACT_ADDRESS);

        const balanceInEther = ethers.formatEther(balance);

        return res.status(200).json({ treasuryBalance: balanceInEther });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch treasury balance' });
    }
};

export const borrowFaucet = async (req, res) => {
    try {
        const { account } = req.body;

        if (!account) {
            return res.status(400).json({ success: false, message: "User address is required." });
        }

        const balanceInWei = await provider.getBalance(account);
        const balanceInEther = ethers.formatEther(balanceInWei);

        if (parseFloat(balanceInEther) >= 0.5) {
            return res.status(400).json({
                success: false,
                message: "Your wallet balance is above 0.5 Ether and cannot borrow from the faucet.",
                balance: balanceInEther,
            });
        }

        const userId = await ensureUserExists(account);

        const user = await User.findById(userId);
        const lastBorrowed = user.lastBorrowedTimestamp;

        const cooldownPeriod = 8 * 60 * 60 * 1000;

        if (lastBorrowed && (Date.now() - new Date(lastBorrowed).getTime()) < cooldownPeriod) {
            const timeElapsed = Date.now() - new Date(lastBorrowed).getTime();
            const timeRemaining = cooldownPeriod - timeElapsed;
            const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

            return res.status(429).json({
                success: false,
                message: `Please wait ${hours} hours and ${minutes} minutes before borrowing again.`,
                balance: balanceInEther,
            });
        }

        const tx = await syvoraTreasury.borrowFaucet(account, { gasLimit: 300000 });
        const receipt = await handleBlockchainTransaction(tx);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { borrowedAmount: 0.2 },
                lastBorrowedTimestamp: new Date(),
            },
            { new: true }
        );

        await Transaction.create({
            walletAddress: account,
            type: 'BORROW',
            amount: 0.2,
            transactionHash: receipt.hash,
        });

        res.status(200).json({
            success: true,
            message: "Successfully borrowed from the faucet.",
            transactionHash: receipt.hash,
            user: updatedUser,
            balance: ethers.formatEther(await provider.getBalance(account)),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error borrowing from the faucet." });
    }
};

export const lendFaucet = async (req, res) => {
    try {
        const { userAddress, amount } = req.body;

        if (!userAddress || !amount) {
            return res
                .status(400)
                .json({ success: false, message: "User address and amount are required." });
        }

        const etherAmount = ethers.parseEther(amount.toString());

        const userId = await ensureUserExists(userAddress);

        const tx = await syvoraTreasury.lendFaucet({ value: etherAmount, gasLimit: 300000 });

        const receipt = await handleBlockchainTransaction(tx);

        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { lentAmount: parseFloat(amount) } },
            { new: true }
        );

        await Transaction.create({
            walletAddress: userAddress,
            type: 'LEND',
            amount: parseFloat(amount),
            transactionHash: receipt.hash,
        });

        res.status(200).json({
            success: true,
            message: "Successfully lent to the faucet.",
            transactionHash: receipt.hash,
            user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error lending to the faucet." });
    }
};

export const withdrawFunds = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount is required." });
        }

        const tx = await syvoraTreasury.withdraw(ethers.parseEther(amount.toString()));
        const receipt = await handleBlockchainTransaction(tx);

        await Transaction.create({
            walletAddress: receipt.from,
            type: 'WITHDRAW',
            amount: parseFloat(amount),
            transactionHash: receipt.hash,
        });

        res.status(200).json({
            success: true,
            message: "Successfully withdrawn funds.",
            transactionHash: receipt.hash,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error withdrawing funds." });
    }
};

export const checkOwner = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userAddress } = req.body;

    if (!userAddress) {
        return res.status(400).json({ error: "User address is required" });
    }

    try {
        const owner = await syvoraTreasury.owner();
        const isOwner = owner.toLowerCase() === userAddress.toLowerCase();
        return res.status(200).json({ isOwner });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const checkWhitelistedStatus = async (req, res) => {
    if (req.method === "POST") {
        try {
            const { account } = req.body;
            if (!account) {
                return res.status(400).json({ error: "Account address is required" });
            }

            const isWhitelisted = await syvoraTreasury.isWhitelistedAccount(account);

            return res.status(200).json({ isWhitelisted });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    res.status(405).json({ error: "Method not allowed" });
}
