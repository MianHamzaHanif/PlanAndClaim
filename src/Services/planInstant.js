// Services/planInstant.js
import Web3 from "web3";
import { getProvider, ensureChain } from "./contract";
import { getUSDTContract, fetchUSDTMeta } from "./USDTInstant";
import planabi from "../abi/planabi.json";

// ✅ Sirf BSC Testnet ka address rakho
export const PLAN_CONTRACT_ADDRESS = "0x0119a4827f2Ceb1f16c86B34C2A8B736653e13a3";
export const FLEXIBLE_PLAN_ADDRESS = "0x73F6796aCFe4eE62F44D000dBed5e71025Bb3CD4";

// ---- Unstake helpers ----
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ALLOWED_UNSTAKE_DAYS = [5, 10, 15, 20];

export function isValidAddress(addr) {
    try {
        return !!addr && Web3.utils.isAddress(addr) && addr.toLowerCase() !== ZERO_ADDRESS.toLowerCase();
    } catch { return false; }
}

// export function assertAllowedUnstakeDay(day) {
//     const d = Number(day);
//     if (!ALLOWED_UNSTAKE_DAYS.includes(d)) {
//         throw new Error("Day must be one of 5, 10, 15, or 20.");
//     }
//     return d;
// }

export function getPlanContract() {
    const provider = getProvider();
    if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");
    const web3 = new Web3(provider);
    console.log("web3web3web3web3", new web3.eth.Contract(planabi, PLAN_CONTRACT_ADDRESS))
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

// export async function getTeamHistoryByLevel(user, level) {
//     await ensureChain(chainKey);
//     const contract = getPlanContract();
//     const n = await contract.methods.getReferralCount(user, level).call();
//     for (i = 0; i < n; n++) {
//       let teamAddress =  await contract.methods.getPeferralNodeAddress(user, level, i).call();
//       let levelInfo = await contract.methods.getUserDetailsP(teamAddress).call();
//       console.log("levelInfolevelInfo",levelInfo)
//     //   return

//     }
// }


// Services/planInstant.js
// export async function getTeamHistoryByLevel(user, level, { chainKey = "bscTestnet" } = {}) {
//     if (!user) throw new Error("Missing user");
//     const L = Number(level);
//     if (!Number.isInteger(L) || L < 1 || L > 10) throw new Error("Level must be 1..10");

//     await ensureChain(chainKey);
//     const c = getPlanContract();

//     const L0 = L - 1; // many contracts are 0-based for counts
//     const n = Number(await c.methods.getReferralCount(user, L0).call({ from: user })) || 0;

//     const getNode = c.methods.getPeferralNodeAddress || c.methods.getReferralNodeAddress;
//     if (!getNode) throw new Error("Referral node address method not found");

//     const ZERO = "0x0000000000000000000000000000000000000000";
//     const rows = [];

//     for (let i = 0; i < n; i++) {
//         let addr;
//         try {
//             // try 0-based level
//             addr = await getNode(user, L0, i).call({ from: user });
//         } catch {
//             // fallback: some contracts expect 1-based level here
//             try { addr = await getNode(user, L, i).call({ from: user }); } catch { addr = null; }
//         }
//         if (!addr || addr === ZERO) continue;

//         let info = null;
//         try {
//             info = await c.methods.getUserDetailsP(addr).call({ from: user });
//         } catch { }

//         const raw =
//             info?.totalSelfDepositedAmount ??
//             info?.selfDeposit ??
//             info?.totalDeposit ??
//             info?.[3] ?? // common slot for self deposit in tuple
//             0n;

//         const deposit = typeof raw === "bigint" ? raw.toString() : String(raw);

//         rows.push({
//             index: i + 1,                               // 1-based row index for the table
//             address: addr,                              // member address
//             totalSelfDepositedAmount: deposit,          // raw wei-like string
//         });
//     }

//     // return array of { index, address, totalSelfDepositedAmount }
//     return rows;
// }


export async function getTeamHistoryByLevel(user, level, { chainKey = "bscTestnet" } = {}) {
    if (!user) throw new Error("Missing user");
    const L = Number(level);
    if (!Number.isInteger(L) || L < 1 || L > 10) throw new Error("Level must be 1..10");

    await ensureChain(chainKey);
    const contract = getPlanContract();

    const L0 = L - 1;
    const n = Number(await contract.methods.getReferralCount(user, L0).call()) || 0;

    const members = [];
    for (let i = 0; i < n; i++) {
        const addr = await contract.methods.getPeferralNodeAddress(user, L0, i).call();
        if (!addr || addr === "0x0000000000000000000000000000000000000000") continue;

        const info = await contract.methods.getUserDetailsP(addr).call();

        // self deposit (prefer named prop then tuple slot [3])
        const selfRaw = (info?.totalSelfDepositedAmount ?? info?.[3] ?? 0n);
        const selfVal = BigInt(String(selfRaw));

        // that user's total team count (prefer named prop then tuple slot [4])
        const teamCntRaw = (info?.totalTeamMember ?? info?.[4] ?? 0n);
        const teamCnt = Number(BigInt(String(teamCntRaw))); // small enough to fit in Number

        members.push({
            index: i + 1,
            address: addr,
            totalSelfDepositedAmount: selfVal.toString(), // raw string
            totalTeamMember: teamCnt,                      // number
        });
    }

    return members; // [{ index, address, totalSelfDepositedAmount, totalTeamMember }]
}




// export async function getTeamHistoryByLevel(user, level, { chainKey = "bscTestnet" } = {}) {
//     console.log("user, level", user, level)
//     await ensureChain(chainKey);
//     console.log("await ensureChain(chainKey)", await ensureChain(chainKey))
//     const contract = getPlanContract();
//     console.log("contractcontract", contract)

//     let totalTeamMember = 0;
//     let totalSelfDepositedAmount = BigInt(0);

//     const L0 = level - 1;
//     console.log("check l0", L0)
//     const n = await contract.methods.getReferralCount(user, L0).call();
//     console.log("levelInfo at getrefferalcount", n, user, L0);

//     for (let i = 0; i < n; i++) {
//         const teamAddress = await contract.methods.getPeferralNodeAddress(user, L0, i).call();
//         console.log("levelInfo of team member team add", teamAddress);

//         const levelInfo = await contract.methods.getUserDetailsP(teamAddress).call();
//         console.log("levelInfo of team member", levelInfo);

//         totalTeamMember++;

//         if (levelInfo?.totalSelfDepositedAmount) {
//             totalSelfDepositedAmount += BigInt(levelInfo.totalSelfDepositedAmount);
//         }
//         // totalSelfDepositedAmount++;
//         // assuming levelInfo.stakedAmount (or similar) holds user’s deposited tokens
//         // if (levelInfo?.stakedAmount) {
//         //     totalSelfDepositedAmount += BigInt(levelInfo.stakedAmount);
//         // }
//     }

//     return {
//         totalTeamMember,
//         totalSelfDepositedAmount: totalSelfDepositedAmount.toString(),
//     };
// }


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


// export async function getSelfRewardFromUpLinerFlexiblePlan(user) {
//     if (!isValidAddress(user)) throw new Error("Invalid address");
//     await ensureChain("bscTestnet");
//     const c = getPlanContract();

//     const v = await c.methods.getSelfRewardFromUpLinerFlexiblePlan(user).call();
//     const y = await c.methods.gettotalWithdrawP(user).call();
//     console.log("v is the value", v, y)

//     const total = BigInt(String(v?.[0] ?? v ?? 0));
//     const withdrawn = BigInt(String(y?.[0] ?? y ?? 0));

//     let calucale = total - withdrawn;
//     console.log("calucalecalucale", calucale);

//     return calucale.toString();

// }

export async function getSelfRewardFromUpLinerFlexiblePlan(user) {
    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getPlanContract();

    const v = await c.methods.getSelfRewardFromUpLinerFlexiblePlan(user).call();
    const y = await c.methods.gettotalWithdrawP(user).call();

    const total = BigInt(String(v?.[0] ?? v ?? 0));
    const withdrawn = BigInt(String(y?.[0] ?? y ?? 0));
    const diff = total > withdrawn ? (total - withdrawn) : 0n;

    return diff.toString();
}


export async function getSelfRewardFromDownLinerFlexiblePlan(user, { chainKey = "bscTestnet" } = {}) {
    // await ensureChain(chainKey);
    // const c = getPlanContract();
    // let v;
    // try {
    //     v = await c.methods.getSelfRewardFromDownLinerFlexiblePlan(user).call();
    // } catch {
    //     // fallback if contract uses msg.sender (no arg)
    //     try { v = await c.methods.getSelfRewardFromDownLinerFlexiblePlan().call({ from: user }); }
    //     catch { v = "0"; }
    // }
    // const raw = (v && (v.reward ?? v.amount ?? v.value ?? v[0])) ?? v ?? "0";
    // return String(raw || "0");

    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getPlanContract();

    const v = await c.methods.getSelfRewardFromDownLinerFlexiblePlan(user).call();
    const y = await c.methods.gettotalWithdrawP(user).call();

    const total = BigInt(String(v?.[0] ?? v ?? 0));
    const withdrawn = BigInt(String(y?.[1] ?? y ?? 0));
    const diff = total > withdrawn ? (total - withdrawn) : 0n;

    return diff.toString();
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

export async function unstakeFlexiblePlanP({ from, index, chainKey = "bscTestnet" } = {}) {
    // await ensureChain(chainKey);
    // if (!isValidAddress(from)) throw new Error("Invalid address");
    // const i = Number(index);
    // if (!Number.isInteger(i) || i < 0) throw new Error("Invalid index");
    // // const d = assertAllowedUnstakeDay(); // 5,10,15,20 only

    // const c = getPlanContract();
    // return await c.methods.unstakeFlexiblePlanP(i).send({ from });

    await ensureChain(chainKey);
    if (!isValidAddress(from)) throw new Error("Invalid address");
    const i = Number(index);
    console.log("iiii", i)
    if (!Number.isInteger(i) || i < 0) throw new Error("Invalid index");

    const c = getPlanContract();
    console.log("iiii", i)
    // Contract now expects only (index)
    return await c.methods.unstakeFlexiblePlanP(i).send({ from });
}



export async function getUserTitleDetails(user) {
    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getPlanContract();

    let d;
    d = await c.methods.getCurrentTitleRewardP(user).call();
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




export async function claimTitlePlan({ chainKey = "bscTestnet" } = {}) {
    await ensureChain(chainKey);

    const provider = getProvider();
    const web3 = new Web3(provider);
    const [from] = await web3.eth.requestAccounts();

    const c = getPlanContract();
    // If contract expects uint8/uint256 it's fine; string/number both ok in web3
    return await c.methods.claimTitleRewardP().send({ from });
}