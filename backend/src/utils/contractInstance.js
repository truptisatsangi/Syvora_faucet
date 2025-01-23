import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { SYVORA_TREASURY_ABI } from '../utils/constants.js';

dotenv.config();

const {
  INFURA_SEPOLIA_API_KEY,
  PRIVATE_KEY,
  SYVORA_TREASURY_CONTRACT_ADDRESS,
} = process.env;

if (
  !INFURA_SEPOLIA_API_KEY ||
  !PRIVATE_KEY ||
  !SYVORA_TREASURY_CONTRACT_ADDRESS
) {
  throw new Error(
    'Missing one or more required environment variables: INFURA_SEPOLIA_API_KEY, PRIVATE_KEY, SYVORA_TREASURY_CONTRACT_ADDRESS'
  );
}

const provider = new ethers.InfuraProvider('sepolia', INFURA_SEPOLIA_API_KEY);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const syvoraTreasury = new ethers.Contract(
  SYVORA_TREASURY_CONTRACT_ADDRESS,
  SYVORA_TREASURY_ABI,
  wallet
);

export { syvoraTreasury, wallet, provider };
