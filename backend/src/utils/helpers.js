import User from "../models/user.js";

export const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

export const handleBlockchainTransaction = async (tx) => {
  const receipt = await tx.wait();
  if (receipt.status !== 1) {
    throw new Error("Blockchain transaction failed.");
  }
  return receipt;
};

export const ensureUserExists = async (email) => {
  if (!email) {
    throw new Error("Email address is required");
  }

  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({ email: normalizedEmail });
  }

  return user;
};
