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
    checkWhitelistedStatus
} from "../controllers/controllers.js";

const router = express.Router();

router.post("/borrow", borrowFaucet);
router.post("/lend", lendFaucet);
router.post("/whitelist", updateWhitelist);
router.post("/withdraw", withdrawFunds);

router.post('/balance/walletAddress', getWalletAddressBalance);
router.get('/balance/treasury', getTreasuryBalance);

router.post("/auth/signup", signUp);
router.post("/auth/signin", signIn);

router.post("/isOwner", checkOwner);
router.post("/isWhitelisted", checkWhitelistedStatus);

export default router;
