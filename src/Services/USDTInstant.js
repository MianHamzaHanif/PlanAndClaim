import Web3 from "web3";
import { getProvider, ensureChain } from "./contract";
import USDTabi from "../abi/USDTabi.json";

// ✅ BSC Testnet address (aapka diya hua)
export const USDT_CONTRACT_ADDRESS = "0x5334f96cb5d91dFE29FBAA9E6832efd8C01cDA91";

export function getUSDTContract() {
  const provider = getProvider();
  if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");
  const web3 = new Web3(provider);
  return new web3.eth.Contract(USDTabi, USDT_CONTRACT_ADDRESS);
}

export async function fetchUSDTMeta() {
  // optional: ensure testnet for reads
  await ensureChain("bscTestnet");
  const c = getUSDTContract();
  // ERC-20 standard
  const [symbol, decimals] = await Promise.all([
    c.methods.symbol().call().catch(() => "TOKEN"),
    c.methods.decimals().call().catch(() => 18),
  ]);
  return { symbol, decimals: Number(decimals) };
}

export async function fetchUSDTBalance(address) {
  if (!address) return "0";
  await ensureChain("bscTestnet");
  const c = getUSDTContract();
  const raw = await c.methods.balanceOf(address).call();
  return raw; // string (wei-style integer, based on token decimals)
}

// nice display helper: BigInt-safe units -> string
export function formatUnits(raw, decimals = 18, maxFrac = 6) {
  try {
    const v = BigInt(raw || "0");
    const base = 10n ** BigInt(decimals);
    const whole = v / base;
    const frac = v % base;
    let fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
    if (fracStr.length > maxFrac) fracStr = fracStr.slice(0, maxFrac);
    return fracStr ? `${whole}.${fracStr}` : whole.toString();
  } catch {
    return "0";
  }
}
