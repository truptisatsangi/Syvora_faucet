export const verifyWalletMatchesEmail = (
  walletUser: { email?: string } | null,
  sessionEmail: string
): boolean => {
  return walletUser?.email === sessionEmail;
};
