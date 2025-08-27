// Services/turbine.js
import Web3 from "web3";
import { getProvider, ensureChain } from "./contract";
import turbineAbi from "../abi/Turbine.json";

// BSC Testnet address (replace if needed)
export const TURBINE_CONTRACT_ADDRESS = "0x683a06777546ABd48619325334609023397d8ADF";

const isValidAddress = (a) => /^0x[a-fA-F0-9]{40}$/.test(String(a || ""));

function getContract() {
    const provider = getProvider();
    if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");
    const web3 = new Web3(provider);
    return new web3.eth.Contract(turbineAbi, TURBINE_CONTRACT_ADDRESS);
}

export async function getUserClaimsLength(user) {
    if (!isValidAddress(user)) return 0;
    await ensureChain("bscTestnet");
    const c = getContract();
    const n = await c.methods.getUserClaimsLength(user).call();
    return Number(n || 0);
}

/**
 * Returns a normalized shape:
 * { amount: string, time: number, status: boolean, raw: any }
 * Supports both `userClaimDetails(address,uint256)` and `userClaims(address,uint256)`.
 */
export async function getUserClaimDetails(user, index) {
    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getContract();

    let d;
    // Try the "details" ABI first
    //   try {
    //     d = await c.methods.userClaimDetails(user, index).call();
    //   } catch {
    // Fallback to "userClaims" ABI
    d = await c.methods.userClaims(user, index).call();
    //   }

    // If ABI is (amount,time,status)
    if (d && (d.amount !== undefined || d.status !== undefined || d.time !== undefined)) {
        return {
            amount: String(d.amount ?? d[0] ?? "0"),
            time: Number(d.time ?? d[1] ?? 0),
            status: Boolean(d.status ?? d[2] ?? false),
            raw: d,
        };
    }

    // If ABI is (claimReward, unStakeTimestamp, perDayClaimReward, ...)
    const amount = String(d?.claimReward ?? d?.[0] ?? "0");
    const time = Number(d?.unStakeTimestamp ?? d?.unlockTimestamp ?? d?.[1] ?? 0);

    // Derive status if not provided: unlocked = now >= time
    const status =
        d?.status !== undefined
            ? Boolean(d.status)
            : (Math.floor(Date.now() / 1000) >= (time || 0));

    return { amount, time, status, raw: d };
}



export async function getUserWithdrawLength(user) {
    if (!isValidAddress(user)) return 0;
    await ensureChain("bscTestnet");
    const c = getContract();
    const n = await c.methods.getUserWithdrawDetailsLength(user).call();
    return Number(n || 0);
}

/**
 * Returns a normalized shape:
 * { amount: string, time: number, status: boolean, raw: any }
 * Supports both `userClaimDetails(address,uint256)` and `userClaims(address,uint256)`.
 */
export async function getUserWithdrawDetails(user, index) {
    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getContract();

    let d;
    // Try the "details" ABI first
    //   try {
    //     d = await c.methods.userClaimDetails(user, index).call();
    //   } catch {
    // Fallback to "userClaims" ABI
    d = await c.methods.userWithdrawDetails(user, index).call();
    //   }

    // If ABI is (amount,time,status)
    if (d && (d.amount !== undefined || d.status !== undefined || d.time !== undefined)) {
        return {
            amount: String(d.amount ?? d[0] ?? "0"),
            time: Number(d.time ?? d[1] ?? 0),
            status: Boolean(d.status ?? d[2] ?? false),
            raw: d,
        };
    }

    // If ABI is (claimReward, unStakeTimestamp, perDayClaimReward, ...)
    const amount = String(d?.claimReward ?? d?.[0] ?? "0");
    const time = Number(d?.unStakeTimestamp ?? d?.unlockTimestamp ?? d?.[1] ?? 0);

    // Derive status if not provided: unlocked = now >= time
    const status =
        d?.status !== undefined
            ? Boolean(d.status)
            : (Math.floor(Date.now() / 1000) >= (time || 0));

    return { amount, time, status, raw: d };
}



// ...existing imports & helpers above

export async function withdrawByDays(day, from) {
    if (!Number.isInteger(day) || day <= 0) throw new Error("Select a valid day (5/10/15/20).");
    if (!/^0x[a-fA-F0-9]{40}$/.test(String(from || ""))) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getContract();
    console.log("days",day)

    // return await c.methods.withdraw(day).call();

    // Optional estimate to surface reverts early
      try {
        const gas = await c.methods.withdraw(String(day)).estimateGas({ from });
        return await c.methods.withdraw(String(day)).send({ from, gas });
      } catch (err) {
        // Fallback without estimate if provider blocks estimates
        return await c.methods.withdraw(String(day)).send({ from });
      }
}


// Services/turbine.js
export async function getUserPendingClaimedAmount(user) {
  const isAddr = /^0x[a-fA-F0-9]{40}$/.test(String(user || ""));
  if (!isAddr) return "0";

  await ensureChain("bscTestnet");
  const c = getContract();

  const v = await c.methods.userPendingClaimedAmount(user).call();
  // some providers return a plain string, some return [value]
  const raw = Array.isArray(v) ? v[0] : v;
  return String(raw || "0");
}

export async function getUserTotalWithdtawAmount(user) {
  const isAddr = /^0x[a-fA-F0-9]{40}$/.test(String(user || ""));
  if (!isAddr) return "0";

  await ensureChain("bscTestnet");
  const c = getContract();

  const v = await c.methods.userTotalWithdrawAmount(user).call();
  console.log("check withdraw",v)
  // some providers return a plain string, some return [value]
  const raw = Array.isArray(v) ? v[0] : v;
  return String(raw || "0");
}


export async function getUserWithdrawableAmount(user) {
  const isAddr = /^0x[a-fA-F0-9]{40}$/.test(String(user || ""));
  if (!isAddr) return "0";

  await ensureChain("bscTestnet");
  const c = getContract();

  console.log("user addeess:", user)

  const v = await c.methods.getUpdateWithdrawReward(user).call();
  console.log("check withraw rmianing",v)
  // some providers return a plain string, some return [value]
  const raw = Array.isArray(v) ? v[0] : v;
  return String(raw || "0");
}





export async function getUserDirectLength(user) {
    if (!isValidAddress(user)) return 0;
    await ensureChain("bscTestnet");
    const c = getContract();
    const n = await c.methods.getUserDirectDetailsLength(user).call();
    return Number(n || 0);
}

/**
 * Returns a normalized shape:
 * { amount: string, time: number, status: boolean, raw: any }
 * Supports both `userClaimDetails(address,uint256)` and `userClaims(address,uint256)`.
 */
export async function getUserDirectDetails(user, index) {
    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getContract();

    let d;
    // Try the "details" ABI first
    //   try {
    //     d = await c.methods.userClaimDetails(user, index).call();
    //   } catch {
    // Fallback to "userClaims" ABI
    d = await c.methods.userDirectDetails(user, index).call();
    //   }

    // If ABI is (amount,time,status)
    if (d && (d.amount !== undefined || d.status !== undefined || d.time !== undefined)) {
        return {
            amount: String(d.amount ?? d[0] ?? "0"),
            time: Number(d.time ?? d[1] ?? 0),
            status: Boolean(d.status ?? d[2] ?? false),
            raw: d,
        };
    }

    // If ABI is (claimReward, unStakeTimestamp, perDayClaimReward, ...)
    const amount = String(d?.claimReward ?? d?.[0] ?? "0");
    const time = Number(d?.unStakeTimestamp ?? d?.unlockTimestamp ?? d?.[1] ?? 0);

    // Derive status if not provided: unlocked = now >= time
    const status =
        d?.status !== undefined
            ? Boolean(d.status)
            : (Math.floor(Date.now() / 1000) >= (time || 0));

    return { amount, time, status, raw: d };
}





export async function getUserServiceLength(user) {
    if (!isValidAddress(user)) return 0;
    await ensureChain("bscTestnet");
    const c = getContract();
    const n = await c.methods.getUserServiceDetailsLength(user).call();
    return Number(n || 0);
}

/**
 * Returns a normalized shape:
 * { amount: string, time: number, status: boolean, raw: any }
 * Supports both `userClaimDetails(address,uint256)` and `userClaims(address,uint256)`.
 */
export async function getUserServiceDetails(user, index) {
    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getContract();

    let d;
    // Try the "details" ABI first
    //   try {
    //     d = await c.methods.userClaimDetails(user, index).call();
    //   } catch {
    // Fallback to "userClaims" ABI
    d = await c.methods.userServiceDetails(user, index).call();
    //   }

    // If ABI is (amount,time,status)
    if (d && (d.amount !== undefined || d.status !== undefined || d.time !== undefined)) {
        return {
            amount: String(d.amount ?? d[0] ?? "0"),
            time: Number(d.time ?? d[1] ?? 0),
            status: Boolean(d.status ?? d[2] ?? false),
            raw: d,
        };
    }

    // If ABI is (claimReward, unStakeTimestamp, perDayClaimReward, ...)
    const amount = String(d?.claimReward ?? d?.[0] ?? "0");
    const time = Number(d?.unStakeTimestamp ?? d?.unlockTimestamp ?? d?.[1] ?? 0);

    // Derive status if not provided: unlocked = now >= time
    const status =
        d?.status !== undefined
            ? Boolean(d.status)
            : (Math.floor(Date.now() / 1000) >= (time || 0));

    return { amount, time, status, raw: d };
}




export async function getUserRebateLength(user) {
    if (!isValidAddress(user)) return 0;
    await ensureChain("bscTestnet");
    const c = getContract();
    const n = await c.methods.getUserDistributionsLength(user).call();
    return Number(n || 0);
}

/**
 * Returns a normalized shape:
 * { amount: string, time: number, status: boolean, raw: any }
 * Supports both `userClaimDetails(address,uint256)` and `userClaims(address,uint256)`.
 */
export async function getUserRebateDetails(user, index) {
    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getContract();

    let d;
    // Try the "details" ABI first
    //   try {
    //     d = await c.methods.userClaimDetails(user, index).call();
    //   } catch {
    // Fallback to "userClaims" ABI
    d = await c.methods.userRebateDistributions(user, index).call();
    //   }

    // If ABI is (amount,time,status)
    if (d && (d.amount !== undefined || d.status !== undefined || d.time !== undefined)) {
        return {
            amount: String(d.amount ?? d[0] ?? "0"),
            time: Number(d.time ?? d[1] ?? 0),
            status: Boolean(d.status ?? d[2] ?? false),
            raw: d,
        };
    }

    // If ABI is (claimReward, unStakeTimestamp, perDayClaimReward, ...)
    const amount = String(d?.claimReward ?? d?.[0] ?? "0");
    const time = Number(d?.unStakeTimestamp ?? d?.unlockTimestamp ?? d?.[1] ?? 0);

    // Derive status if not provided: unlocked = now >= time
    const status =
        d?.status !== undefined
            ? Boolean(d.status)
            : (Math.floor(Date.now() / 1000) >= (time || 0));

    return { amount, time, status, raw: d };
}




