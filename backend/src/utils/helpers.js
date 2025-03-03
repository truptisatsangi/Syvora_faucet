import User from '../models/user.js';

export const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

export const handleBlockchainTransaction = async (tx) => {
  const receipt = await tx.wait();
  if (receipt.status !== 1) {
    throw new Error('Blockchain transaction failed.');
  }
  return receipt;
};

export const ensureUserExists = async (walletAddress) => {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  const normalizedAddress = walletAddress.toLowerCase();

  let user = await User.findOne({ walletAddress: normalizedAddress });

  if (!user) {
    user = await User.create({ walletAddress: normalizedAddress });
  }

  return user._id;
};