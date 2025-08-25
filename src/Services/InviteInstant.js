import Web3 from "web3";
import { getProvider, ensureChain } from "./contract";
import referralAbi from "../abi/Communityabi.json";

// ✅ sirf BSC Testnet ka address rakho
export const REFERRAL_CONTRACT_ADDRESS = "0x82dda9B71Fb07af73579C46C0b0468611D7575FD";

export function getReferralContract() {
  const provider = getProvider();
  if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");
  const web3 = new Web3(provider);
  return new web3.eth.Contract(referralAbi, REFERRAL_CONTRACT_ADDRESS);
}

export async function joinWithReferrer(referrer, fromAccount) {
  // ✅ force switch to testnet only
  await ensureChain("bscTestnet");

  const contract = getReferralContract();

  const tx = await contract.methods.join(referrer).send({
    from: fromAccount
  });

  return tx;
}

export async function getUserDetails(user, { chainKey = "bscTestnet" } = {}) {
  await ensureChain(chainKey); // optional for read; keeps everything on 97
  const contract = getReferralContract();
  return await contract.methods.userDetails(user).call();
}

export async function getReferralCount(user, level = 0, { chainKey = "bscTestnet" } = {}) {
  await ensureChain(chainKey);
  const contract = getReferralContract();
  const n = await contract.methods.referralCount(user, level).call();
  return Number(n);
}

export async function getReferralNodeAddress(user, level = 0, index, { chainKey = "bscTestnet" } = {}) {
  await ensureChain(chainKey);
  const contract = getReferralContract();
  return await contract.methods.referralNodeAddress(user, level, index).call();
}
