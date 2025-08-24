// flexiblePlan.js
import Web3 from "web3";
import { getProvider, ensureChain } from "./contract";
import { getUSDTContract, fetchUSDTMeta } from "./USDTInstant"; // or from your current file if exported
import FLEXIBLE_PLAN_ABI from "../abi/Flexibleabi.json";

// 🔗 FlexiblePlan contract (BSC Testnet)
export const FLEXIBLE_PLAN_ADDRESS = "0x56A3039508d704D8025384a66d49A65756f801E6";

export function getFlexiblePlanContract() {
  const provider = getProvider();
  if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");
  const web3 = new Web3(provider);
  return new web3.eth.Contract(FLEXIBLE_PLAN_ABI, FLEXIBLE_PLAN_ADDRESS);
}

// parse "123.45" -> wei-like string using token decimals
export function parseUnits(amountStr, decimals = 18) {
  const s = String(amountStr).trim();
  if (!s) throw new Error("Amount is required");
  const [w, f = ""] = s.split(".");
  if (!/^\d+$/.test(w || "0") || !/^\d*$/.test(f)) throw new Error("Invalid number");
  const frac = (f + "0".repeat(decimals)).slice(0, decimals);
  const base = 10n ** BigInt(decimals);
  return (BigInt(w || "0") * base + BigInt(frac || "0")).toString();
}

// Approve USDT and deposit into Flexible Plan
export async function approveAndDepositFlexible(amountHuman) {
  await ensureChain("bscTestnet");

  const provider = getProvider();
  const web3 = new Web3(provider);
  const [from] = await web3.eth.requestAccounts();

  const plan = getFlexiblePlanContract();
  const usdt = getUSDTContract();

  const { decimals } = await fetchUSDTMeta();
  const amount = parseUnits(amountHuman, decimals);

  // 1) Check allowance
  const allowance = await usdt.methods.allowance(from, FLEXIBLE_PLAN_ADDRESS).call();

  // 2) Approve exact amount if not enough
  if (BigInt(allowance) < BigInt(amount)) {
    await usdt.methods.approve(FLEXIBLE_PLAN_ADDRESS, amount).send({ from });
  }

  // 3) Deposit
  const receipt = await plan.methods.depositFlexiblePlan(amount).send({ from });
  return receipt;
}

export async function getUserStakeLength(user) {
  await ensureChain("bscTestnet");
  const c = getFlexiblePlanContract();
  const n = await c.methods.getUserStakeLength(user).call();
  return Number(n);
}

// Services/FlexibleInstant.js
export async function getUserStakeDetails(user, index) {
  await ensureChain("bscTestnet");
  const c = getFlexiblePlanContract();
  const d = await c.methods.userStakeDetails(user, index).call();

  // Defensive parsing: tuple OR object
  const asArr = Array.isArray(d) ? d : null;
  const lastTupleVal = asArr ? asArr[asArr.length - 1] : undefined;

  // Last index = "isUnstaked" per your rule.
  const isUnstaked = Boolean(
    d?.unStake ??
    d?.unstake ??
    d?.isUnstaked ??
    d?.withdrawn ??
    d?.isWithdrawn ??
    lastTupleVal ??
    false
  );

  return {
    stakedAmount: String(d?.stakedAmount ?? d?.amount ?? d?.[0] ?? "0"),
    stakeTimestamp: Number(d?.stakeTimestamp ?? d?.timestamp ?? d?.time ?? d?.[1] ?? 0),
    reward: String(d?.reward ?? d?.[2] ?? "0"),
    isUnstaked,            // ← yeh field ab status ka source hai
    raw: d
  };
}

export async function simulateProcessAutoUnlockedStake(user, index, nowTs) {
  await ensureChain("bscTestnet");
  const c = getFlexiblePlanContract();
  try {
    const res = await c.methods
      .processAutoUnlockedStakesIndex(user, index, String(nowTs))
      .call({ from: user }); // staticcall
    // Could be tuple or single value
    const reward = res?.reward ?? res?.[0] ?? res ?? "0";
    return String(reward);
  } catch {
    return "0";
  }
}