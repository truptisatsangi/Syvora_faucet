import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import { syvoraTreasury, provider } from "../utils/contractInstance.js";
import {
  ensureUserExists,
  handleBlockchainTransaction,
} from "../utils/helpers.js";

export const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    const statusCode = err.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "An error occurred during sign-up.",
    });
  }
};

export const updateWhitelist = async (req, res) => {
  try {
    const { email, account, isWhitelisted } = req.body;

    if (!email || !account || typeof isWhitelisted === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Email, account, and whitelist status are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const accountLower = account.toLowerCase();

    if (!user.walletAddresses.includes(accountLower)) {
      user.walletAddresses.push(accountLower);
    }

    if (isWhitelisted) {
      if (!user.isWhitelistedAddresses.includes(accountLower)) {
        user.isWhitelistedAddresses.push(accountLower);
      }
    } else {
      user.isWhitelistedAddresses = user.isWhitelistedAddresses.filter(
        (addr) => addr !== accountLower
      );
    }

    await user.save();

    const tx = await syvoraTreasury.updateWhitelistedAccount(
      accountLower,
      isWhitelisted
    );
    const receipt = await handleBlockchainTransaction(tx);

    await Transaction.create({
      transactionHash: receipt.hash,
      walletAddress: accountLower,
      type: "WHITELIST",
      amount: 0,
    });

    res.status(200).json({
      success: true,
      message: `Whitelist updated for account ${account}.`,
      transactionHash: receipt.hash,
      user,
    });
  } catch (error) {
    console.error("Error updating whitelist:", error);
    res.status(500).json({
      success: false,
      message: "Error updating whitelist.",
      error: error.message,
    });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Sign in successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const borrowFaucet = async (req, res) => {
  try {
    const { email, account } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email address is required." });
    }
    if (!account) {
      return res
        .status(400)
        .json({ success: false, message: "Wallet address is required." });
    }

    const balanceInWei = await provider.getBalance(account);
    const balanceInEther = ethers.formatEther(balanceInWei);

    if (parseFloat(balanceInEther) >= 0.5) {
      return res.status(400).json({
        success: false,
        message:
          "Your wallet balance is above 0.5 Ether and cannot borrow from the faucet.",
        balance: balanceInEther,
      });
    }

    let user = await ensureUserExists(email);

    if (!user.walletAddresses.includes(account)) {
      user.walletAddresses.push(account);
      await user.save();
    }

    const lastBorrowed = user.lastBorrowedTimestamp;
    const cooldownPeriod = 8 * 60 * 60 * 1000;

    if (
      lastBorrowed &&
      Date.now() - new Date(lastBorrowed).getTime() < cooldownPeriod
    ) {
      const timeElapsed = Date.now() - new Date(lastBorrowed).getTime();
      const timeRemaining = cooldownPeriod - timeElapsed;
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${hours} hours and ${minutes} minutes before borrowing again.`,
        balance: balanceInEther,
      });
    }

    const tx = await syvoraTreasury.borrowFaucet(account, { gasLimit: 300000 });
    const receipt = await handleBlockchainTransaction(tx);

    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      {
        $inc: { borrowedAmount: 0.2 },
        lastBorrowedTimestamp: new Date(),
      },
      { new: true }
    );

    await Transaction.create({
      walletAddress: account,
      type: "BORROW",
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
    console.error("Error borrowing from faucet:", error);
    res
      .status(500)
      .json({ success: false, message: "Error borrowing from the faucet." });
  }
};

export const lendFaucet = async (req, res) => {
  try {
    const { userAddress, amount } = req.body;

    if (!userAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: "User address and amount are required.",
      });
    }

    const etherAmount = ethers.parseEther(amount.toString());

    const userId = await ensureUserExists(userAddress);

    const tx = await syvoraTreasury.lendFaucet({
      value: etherAmount,
      gasLimit: 300000,
    });

    const receipt = await handleBlockchainTransaction(tx);

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { lentAmount: parseFloat(amount) } },
      { new: true }
    );

    await Transaction.create({
      walletAddress: userAddress,
      type: "LEND",
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
    res
      .status(500)
      .json({ success: false, message: "Error lending to the faucet." });
  }
};

export const withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res
        .status(400)
        .json({ success: false, message: "Amount is required." });
    }

    const tx = await syvoraTreasury.withdraw(
      ethers.parseEther(amount.toString())
    );
    const receipt = await handleBlockchainTransaction(tx);

    await Transaction.create({
      walletAddress: receipt.from,
      type: "WITHDRAW",
      amount: parseFloat(amount),
      transactionHash: receipt.hash,
    });

    res.status(200).json({
      success: true,
      message: "Successfully withdrawn funds.",
      transactionHash: receipt.hash,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error withdrawing funds." });
  }
};

export const checkOwner = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userAddress } = req.query;

  if (!userAddress) {
    return res.status(400).json({ error: "User address is required" });
  }

  try {
    const owner = await syvoraTreasury.owner();
    const isOwner = owner.toLowerCase() === userAddress.toLowerCase();
    return res.status(200).json({ isOwner });
  } catch (error) {
    console.error("Error checking owner:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getWalletAddressBalance = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { account } = req.query;

    if (!account) {
      return res
        .status(400)
        .json({ success: false, message: "Wallet address is required." });
    }

    if (!ethers.isAddress(account)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid wallet address." });
    }

    const balance = await provider.getBalance(account);
    const balanceInEther = ethers.formatEther(balance);

    res.status(200).json({
      success: true,
      balance: balanceInEther,
      message: "Wallet balance fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet balance.",
    });
  }
};

export const getTreasuryBalance = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const treasuryAddress = process.env.SYVORA_TREASURY_CONTRACT_ADDRESS;
    if (!treasuryAddress || !provider) {
      return res
        .status(500)
        .json({ error: "Server configuration is incomplete" });
    }

    const balance = await provider.getBalance(treasuryAddress);
    const balanceInEther = ethers.formatEther(balance);

    return res.status(200).json({ treasuryBalance: balanceInEther });
  } catch (error) {
    console.error("Error fetching treasury balance:", error);
    res.status(500).json({ error: "Failed to fetch treasury balance." });
  }
};

export const checkWhitelistedStatus = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { account, email } = req.query;

    if (!account || !email) {
      return res
        .status(400)
        .json({ error: "Account address and email are required" });
    }

    if (!ethers.isAddress(account)) {
      return res.status(400).json({ error: "Invalid account address" });
    }

    const isWhitelisted = await syvoraTreasury.isWhitelistedAccount(account);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const walletAddresses = user.walletAddresses || [];
    const whitelistedAddresses = user.isWhitelistedAddresses || [];

    if (
      isWhitelisted &&
      (!walletAddresses.includes(account) ||
        !whitelistedAddresses.includes(account))
    ) {
      await User.findOneAndUpdate(
        { email: user.email },
        {
          $addToSet: {
            walletAddresses: account,
            isWhitelistedAddresses: account,
          },
        },
        { new: true }
      );
    }

    return res.status(200).json({ isWhitelisted });
  } catch (error) {
    console.error("Error checking whitelisted status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLastBorrowedTimestamp = async (req, res) => {
  try {
    const { email, account } = req.query;

    if (!account || !email) {
      return res
        .status(400)
        .json({ error: "Account address and email are required" });
    }

    if (!ethers.isAddress(account)) {
      return res.status(400).json({ error: "Invalid account address" });
    }

    const accountLastBorrowed = await syvoraTreasury.lastBorrowedTimestamp(
      account
    );

    const lastBorrowedDate = new Date(
      Number(accountLastBorrowed) * 1000
    ).toISOString();

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!user.lastBorrowedTimestamp) {
      user.lastBorrowedTimestamp = lastBorrowedDate;
      await user.save();
    }

    res.status(200).json({
      success: true,
      email: user.email,
      lastBorrowedTimestamp: user.lastBorrowedTimestamp,
    });
  } catch (error) {
    console.error("Error retrieving last borrowed timestamp:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
