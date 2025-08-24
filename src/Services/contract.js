// import Web3 from "web3";
// let isItConnected = false;
// const networks = {
//   bsc: {
//     chainId: `0x${Number(56).toString(16)}`,
//     chainName: "Binance smart chain",
//     nativeCurrency: {
//       name: "BSC",
//       symbol: "BNB",
//       decimals: 18,
//     },
//     rpcUrls: [
//       "https://bsc-dataseed1.binance.org",
//       "https://bsc-dataseed2.binance.org",
//       "https://bsc-dataseed3.binance.org",
//       "https://bsc-dataseed4.binance.org",
//       "https://bsc-dataseed1.defibit.io",
//       "https://bsc-dataseed2.defibit.io",
//       "https://bsc-dataseed3.defibit.io",
//       "https://bsc-dataseed4.defibit.io",
//       "https://bsc-dataseed1.ninicoin.io",
//       "https://bsc-dataseed2.ninicoin.io",
//       "https://bsc-dataseed3.ninicoin.io",
//       "https://bsc-dataseed4.ninicoin.io",
//       "wss://bsc-ws-node.nariox.org",
//     ],
//     blockExplorerUrls: ["https://bscscan.com"],
//   },
// };
// const changeNetwork = async ({ networkName }) => {
//   try {
//     if (!window.ethereum) throw new Error("No crypto wallet found");

//     let data = await window.ethereum.request({
//       method: "wallet_addEthereumChain",
//       params: [
//         {
//           ...networks[networkName],
//         },
//       ],
//     });

//     // alert('test',data)
//   } catch (err) {
//     console.log("not found");
//   }
// };
// const handleNetworkSwitch = async (networkName) => {
//   // console.log("DAta");

//   await changeNetwork({ networkName });
// };
// let accounts;
// const getAccounts = async () => {
//   const web3 = window.web3;
//   try {
//     accounts = await web3.eth.getAccounts();
//     return accounts;
//   } catch (error) {
//     console.log("Error while fetching acounts: ", error);
//     return null;
//   }
// };
// export const disconnectWallet = async () => {
//   await window.ethereum.request({
//     method: "eth_requestAccounts",
//     params: [{ eth_accounts: {} }],
//   });
//   console.log("disconnect");
// };
// export const loadWeb3 = async () => {
//   try {
//     if (window.ethereum) {
//       window.web3 = new Web3(window.ethereum);

//       await window.ethereum.enable();
//       let ids = await window.web3.eth.getChainId();

//       if (ids != "") {
//         switch (ids.toString()) {
//           case "56":
//             isItConnected = true;
//             break;
//           default:
//             handleNetworkSwitch("bsc");
//             isItConnected = false;
//         }
//       } else {
//         handleNetworkSwitch("bsc");
//         isItConnected = false;
//       }

//       if (isItConnected == true) {
//         let accounts = await getAccounts();
//         return accounts[0];
//       } else {
//         let res = "Wrong Network";
//         return res;
//       }
//     } else {
//       let res = "No Wallet";
//       return res;
//     }
//   } catch (error) {
//     let res = "No Wallet";
//     return res;
//   }
// };

// utils/wallet.js

// src/Services/contract.js
import Web3 from "web3";

/** ---------- Networks ---------- */
export const NETWORKS = {
  bscTestnet: {
    chainId: `0x${Number(97).toString(16)}`, // 0x61
    chainName: "BSC Testnet",
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
    rpcUrls: [
      "https://data-seed-prebsc-1-s1.binance.org:8545",
      "https://bsc-testnet.publicnode.com",
      "https://bsc-testnet.blockpi.network/v1/rpc/public",
      "wss://bsc-testnet-rpc.publicnode.com",
      "https://bnb-testnet.api.onfinality.io/public"
    ],
    blockExplorerUrls: ["https://testnet.bscscan.com"]
  },
  bscMainnet: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: "BNB Smart Chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org"
    ],
    blockExplorerUrls: ["https://bscscan.com"]
  }
};

/** ---------- Provider helpers ---------- */
export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) return window.ethereum;
  return null;
}

export async function ensureChain(chainKey = "bscTestnet") {
  const provider = getProvider();
  if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");

  const wanted = NETWORKS[chainKey];
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: wanted.chainId }]
    });
  } catch (switchErr) {
    // If chain not added, add then switch
    if (switchErr?.code === 4902 || (switchErr?.data && switchErr.data.originalError?.code === 4902)) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [wanted]
      });
    } else {
      throw switchErr;
    }
  }
}

/** ---------- Connect / Silent restore ---------- */
export async function connectWallet({ chainKey = "bscTestnet" } = {}) {
  const provider = getProvider();
  if (!provider) throw new Error("No crypto wallet found. Please install MetaMask.");

  await ensureChain(chainKey);
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const account = accounts?.[0] || null;

  // Create web3 instance (optional for your app logic)
  window.web3 = new Web3(provider);

  const chainIdHex = await provider.request({ method: "eth_chainId" });

  // Remember that user connected once (optional UX)
  try { localStorage.setItem("WALLET_CONNECTED_ONCE", "1"); } catch { }

  return { account, chainId: parseInt(chainIdHex, 16) };
}

export async function getExistingConnection() {
  const provider = getProvider();
  if (!provider) return { account: null, chainId: null };

  try {
    const accounts = await provider.request({ method: "eth_accounts" }); // no popup
    const chainIdHex = await provider.request({ method: "eth_chainId" });
    return {
      account: accounts?.[0] || null,
      chainId: parseInt(chainIdHex, 16)
    };
  } catch {
    return { account: null, chainId: null };
  }
}

export async function tryRevokePermissions() {
  const provider = getProvider();
  if (!provider) return false;
  try {
    await provider.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }]
    });
    try { localStorage.removeItem("WALLET_CONNECTED_ONCE"); } catch { }
    return true;
  } catch {
    return false;
  }
}

/** ---------- Event listeners with clean removal ---------- */
let _listeners = {};

export function attachProviderEvents({ onAccountsChanged, onChainChanged, onDisconnect } = {}) {
  const provider = getProvider();
  if (!provider) return;

  // Remove previous (defensive)
  removeProviderEvents();

  _listeners.accountsChanged = (accs) => onAccountsChanged?.(accs);
  _listeners.chainChanged = (hex) => onChainChanged?.(parseInt(hex, 16));
  _listeners.disconnect = (err) => onDisconnect?.(err);

  if (_listeners.accountsChanged) provider.on("accountsChanged", _listeners.accountsChanged);
  if (_listeners.chainChanged) provider.on("chainChanged", _listeners.chainChanged);
  if (_listeners.disconnect) provider.on("disconnect", _listeners.disconnect);
}

export function removeProviderEvents() {
  const provider = getProvider();
  if (!provider?.removeListener) { _listeners = {}; return; }

  if (_listeners.accountsChanged) provider.removeListener("accountsChanged", _listeners.accountsChanged);
  if (_listeners.chainChanged) provider.removeListener("chainChanged", _listeners.chainChanged);
  if (_listeners.disconnect) provider.removeListener("disconnect", _listeners.disconnect);
  _listeners = {};
}
