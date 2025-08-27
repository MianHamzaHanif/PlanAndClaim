import Web3 from "web3";
import { getProvider, ensureChain } from "./contract";
import { getUSDTContract, fetchUSDTMeta } from "./USDTInstant";
import trubineabi from "../abi/Turbine.json";

// ✅ Sirf BSC Testnet ka address rakho
export const TURBINE_CONTRACT_ADDRESS = "0x872F1926a75D977C5B0A4e70F790b9880A63c765";

const isValidAddress = (a) => /^0x[a-fA-F0-9]{40}$/.test(String(a || ""));

export function getPlanContract() {
    const provider = getProvider();
    if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");
    const web3 = new Web3(provider);
    console.log("web3web3web3web3", new web3.eth.Contract(trubineabi, TURBINE_CONTRACT_ADDRESS))
    return new web3.eth.Contract(trubineabi, TURBINE_CONTRACT_ADDRESS);
}

export async function getUserClaimsLength(user) {
    if (!isValidAddress(user)) return 0;
    await ensureChain("bscTestnet");
    const c = getPlanContract();
    const n = await c.methods.getUserClaimsLength(user).call();
    return Number(n || 0);
}

export async function getUserClaimDetails(user, index) {
    if (!isValidAddress(user)) throw new Error("Invalid address");
    await ensureChain("bscTestnet");
    const c = getPlanContract();
    const d = await c.methods.userClaimDetails(user, index).call();
    // Screenshot shows: claimReward, unStakeTimestamp, perDayClaimReward, ...
    return {
        claimReward: String(d?.claimReward ?? d?.[0] ?? "0"),
        unlockTs: Number(d?.unStakeTimestamp ?? d?.[1] ?? 0),
        perDayClaimReward: String(d?.perDayClaimReward ?? d?.[2] ?? "0"),
        raw: d,
    };
}