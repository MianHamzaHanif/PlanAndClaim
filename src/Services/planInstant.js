// Services/planInstant.js
import Web3 from "web3";
import { getProvider, ensureChain } from "./contract";
import { getUSDTContract, fetchUSDTMeta } from "./USDTInstant";
import planabi from "../abi/planabi.json";

// ✅ Sirf BSC Testnet ka address rakho
export const PLAN_CONTRACT_ADDRESS = "0x3678C69D9106C92DE582782ef5be19C34d0823aB";
export const FLEXIBLE_PLAN_ADDRESS = "0xc585D0CED29d8F85d22b92229B6315141c614E92";

// ---- Unstake helpers ----
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ALLOWED_UNSTAKE_DAYS = [5, 10, 15, 20];

export function isValidAddress(addr) {
    try {
        return !!addr && Web3.utils.isAddress(addr) && addr.toLowerCase() !== ZERO_ADDRESS.toLowerCase();
    } catch { return false; }
}

export function assertAllowedUnstakeDay(day) {
    const d = Number(day);
    if (!ALLOWED_UNSTAKE_DAYS.includes(d)) {
        throw new Error("Day must be one of 5, 10, 15, or 20.");
    }
    return d;
}

export function getPlanContract() {
    const provider = getProvider();
    if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");
    const web3 = new Web3(provider);
    return new web3.eth.Contract(planabi, PLAN_CONTRACT_ADDRESS);
}

export async function joinWithReferrer(referrer, fromAccount) {
    await ensureChain("bscTestnet");
    const contract = getPlanContract();
    const tx = await contract.methods.joinCommunity(referrer).send({ from: fromAccount });
    return tx;
}

export async function getUserDetails(user, { chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    const contract = getPlanContract();
    return await contract.methods.getUserDetailsP(user).call();
}

export async function getReferralCount(user, level = 0, { chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    const contract = getPlanContract();
    const n = await contract.methods.getReferralCount(user, level).call();
    return Number(n || 0);
}

export async function getReferralNodeAddress(user, level = 0, index, { chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    const contract = getPlanContract();
    return await contract.methods.getPeferralNodeAddress(user, level, index).call();
}

export function parseUnits(amountStr, decimals = 18) {
    const s = String(amountStr).trim();
    if (!s) throw new Error("Amount is required");
    const [w, f = ""] = s.split(".");
    if (!/^\d+$/.test(w || "0") || !/^\d*$/.test(f)) throw new Error("Invalid number");
    const frac = (f + "0".repeat(decimals)).slice(0, decimals);
    const base = 10n ** BigInt(decimals);
    return (BigInt(w || "0") * base + BigInt(frac || "0")).toString();
}

export async function approveAndDepositFlexible(amountHuman) {
    await ensureChain("bscTestnet");

    const provider = getProvider();
    const web3 = new Web3(provider);
    const [from] = await web3.eth.requestAccounts();

    const plan = getPlanContract();
    const usdt = getUSDTContract();

    const { decimals } = await fetchUSDTMeta();
    const amount = parseUnits(amountHuman, decimals);

    // 1) Allowance check
    const allowance = await usdt.methods.allowance(from, FLEXIBLE_PLAN_ADDRESS).call();

    // 2) Approve if needed
    if (BigInt(allowance) < BigInt(amount)) {
        await usdt.methods.approve(FLEXIBLE_PLAN_ADDRESS, amount).send({ from });
    }

    // 3) Deposit to plan
    const receipt = await plan.methods.depositFlexiblePlanP(amount).send({ from });
    return receipt;
}

export async function getUserStakeLength(user) {
    await ensureChain("bscTestnet");
    const c = getPlanContract();
    const n = await c.methods.getUserStakeLengthP(user).call();
    return Number(n || 0);
}

export async function getUserStakeDetails(user, index) {
    await ensureChain("bscTestnet");
    const c = getPlanContract();
    const d = await c.methods.userStakeDetailsFlexiblePlan(user, index).call();

    const asArr = Array.isArray(d) ? d : null;
    const lastTupleVal = asArr ? asArr[asArr.length - 1] : undefined;

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
        isUnstaked,
        raw: d,
    };
}

export async function simulateProcessAutoUnlockedStake(user, index, nowTs) {
    await ensureChain("bscTestnet");
    const c = getPlanContract();
    try {
        const res = await c.methods
            .processAutoUnlockedStakesIndexP(user, index, String(nowTs))
            .call({ from: user });
        const reward = res?.reward ?? res?.[0] ?? res ?? "0";
        return String(reward);
    } catch {
        return "0";
    }
}

function toUintString(v) {
  if (v == null) return "0";
  if (Array.isArray(v)) v = v[0];     // just in case
  const s = String(v);
  try { return (s.startsWith("0x") ? BigInt(s) : BigInt(s)).toString(); }
  catch { return "0"; }
}

export async function getUplineLevelOpen(user, { chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    const c = getPlanContract();
    const n = await c.methods.getUplineLevelOpen(user).call();
    return Number(n || 0);
}

export async function getReferralLevelUnLock(user, index, { chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    const c = getPlanContract();
    return await c.methods.getReferralLevelUnLock(user, index).call();
}

export async function getWithdrawRewardFlexiblePlanP(user) {
  if (!isValidAddress(user)) throw new Error("Invalid address");
  await ensureChain("bscTestnet");
  const c = getPlanContract();
  const v = await c.methods.getWithdrawRewardFlexiblePlanP(user).call();
  return toUintString(v);
}

export async function getSelfRewardFromUpLinerFlexiblePlan(user, { chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    const c = getPlanContract();
    let v;
    try {
        v = await c.methods.getSelfRewardFromUpLinerFlexiblePlan(user).call();
    } catch {
        // fallback if contract uses msg.sender (no arg)
        try { v = await c.methods.getSelfRewardFromUpLinerFlexiblePlan().call({ from: user }); }
        catch { v = "0"; }
    }
    const raw = (v && (v.reward ?? v.amount ?? v.value ?? v[0])) ?? v ?? "0";
    return String(raw || "0");
}

export async function getSelfRewardFromDownLinerFlexiblePlan(user, { chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    const c = getPlanContract();
    let v;
    try {
        v = await c.methods.getSelfRewardFromDownLinerFlexiblePlan(user).call();
    } catch {
        // fallback if contract uses msg.sender (no arg)
        try { v = await c.methods.getSelfRewardFromDownLinerFlexiblePlan().call({ from: user }); }
        catch { v = "0"; }
    }
    const raw = (v && (v.reward ?? v.amount ?? v.value ?? v[0])) ?? v ?? "0";
    return String(raw || "0");
}

export const CLAIM_TYPES = {
    SELF: 1,
    UPLINER: 2,
    DOWNLINER: 3,
};

export async function claimFlexiblePlan(typeNum, { chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    const t = Number(typeNum);
    if (![1, 2, 3].includes(t))
        throw new Error("Invalid claim type. Use 1 (Self), 2 (Upline), 3 (Downline).");

    const provider = getProvider();
    const web3 = new Web3(provider);
    const [from] = await web3.eth.requestAccounts();

    const c = getPlanContract();
    // If contract expects uint8/uint256 it's fine; string/number both ok in web3
    return await c.methods.claimFlexiblePlan(t).send({ from });
}
export const claim = {
    self: (opts) => claimFlexiblePlan(CLAIM_TYPES.SELF, opts),
    downline: (opts) => claimFlexiblePlan(CLAIM_TYPES.DOWNLINER, opts),
    upline: (opts) => claimFlexiblePlan(CLAIM_TYPES.UPLINER, opts),
};

export async function unstakeFlexiblePlanP({ from, index, days, chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);
    if (!isValidAddress(from)) throw new Error("Invalid address");
    const i = Number(index);
    if (!Number.isInteger(i) || i < 0) throw new Error("Invalid index");
    const d = assertAllowedUnstakeDay(days); // 5,10,15,20 only

    const c = getPlanContract();
    return await c.methods.unstakeFlexiblePlanP(i, d).send({ from });
}
