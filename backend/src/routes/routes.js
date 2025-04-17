import express from "express";
import {
  borrowFaucet,
  lendFaucet,
  updateWhitelist,
  withdrawFunds,
  signUp,
  signIn,
  getWalletAddressBalance,
  getTreasuryBalance,
  checkOwner,
  checkWhitelistedStatus,
  getLastBorrowedTimestamp,
  checkUserExists,
  getUserEmailByWallet,
} from "../controllers/controllers.js";

const router = express.Router();

router.post("/borrow", borrowFaucet);
router.post("/lend", lendFaucet);
router.post("/whitelist", updateWhitelist);
router.post("/withdraw", withdrawFunds);

router.post("/auth/signup", signUp);
router.post("/auth/signin", signIn);
router.get("/auth/userExists", checkUserExists);

router.get("/balance/walletAddress", getWalletAddressBalance);
router.get("/balance/treasury", getTreasuryBalance);

router.get("/users/email/:walletAddress", getUserEmailByWallet);

router.get("/isOwner", checkOwner);
router.get("/isWhitelisted", checkWhitelistedStatus);
router.get("/lastBorrowed", getLastBorrowedTimestamp);

export default router;
