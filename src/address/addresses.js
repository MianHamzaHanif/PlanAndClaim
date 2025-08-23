// src/address/addresses.js
export const REFERRAL_CONTRACT_ADDRESS = "0xF55CF37d74b2F7Fdf511f90083792f9bd3c1AA7A";

// Optional: multi-network support (use if needed)
export const REFERRAL_ADDRESSES = {
  97: "0xF55CF37d74b2F7Fdf511f90083792f9bd3c1AA7A" // BSC Testnet
//   56: "0xYourMainnetAddress", // BSC Mainnet
};

// Helper: pick by chainId, fallback to single constant
export function getReferralAddressByChainId(chainId) {
  if (REFERRAL_ADDRESSES[chainId]) return REFERRAL_ADDRESSES[chainId];
  return REFERRAL_CONTRACT_ADDRESS;
}
