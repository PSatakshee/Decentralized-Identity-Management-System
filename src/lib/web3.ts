"use client"; // Enables client-side rendering in Next.js

// Import necessary modules from Viem for blockchain interaction
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  getContract,
  WalletClient,
} from "viem";
import { sepolia } from "viem/chains"; // Import the Sepolia testnet configuration
import { toast } from "react-toastify"; // Import toast for user notifications
import contractAbi from "../../public/abi.json"; // Import the contract ABI for interaction
import identityNftAbi from "../../public/nftabi.json" 
import { uploadFileToIPFS } from "./ipfs";
import { sha256 } from "js-sha256";
// Declare global variable for window.ethereum to ensure compatibility with MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Define the transport mechanism for blockchain interaction, using MetaMask if available
const transport =
  typeof window !== "undefined" && window.ethereum
    ? custom(window.ethereum)
    : http();


// Retrieve the contract address from environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const IDENTITY_NFT_ADDRESS = process.env.NEXT_PUBLIC_NFT_ADDRESS!;


// Create a wallet client to interact with the user's MetaMask wallet
export const walletClient = createWalletClient({
  chain: sepolia, // Specify the blockchain network (Sepolia testnet)
  transport, // Use the defined transport mechanism
});

// Create a public client to interact with the blockchain without needing a wallet
const client = createPublicClient({
  chain: sepolia, // Specify the blockchain network (Sepolia testnet)
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_API_URL!), // Use the Alchemy API for reliable RPC calls
});

// Initialize the smart contract instance using its address and ABI
export const contract = getContract({
  address: CONTRACT_ADDRESS as Address, // Define the contract address
  abi: contractAbi, // Provide the contract's ABI
  client: walletClient, // Use the wallet client to send transactions
});
// Create a contract instance for IdentityNFT
export const identityNftContract = getContract({
  address: IDENTITY_NFT_ADDRESS as Address,
  abi: identityNftAbi,
  client: walletClient,
});

// ✅ Function to connect MetaMask wallet
export async function connectMetaMask() {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    if (!walletClient) throw new Error("Wallet client not initialized");

    // Request access to MetaMask accounts
    const [account] = await walletClient.requestAddresses();

    if (!account) {
      toast.error("No account found ❌");
      return null;
    }

    // Notify user of successful connection
    toast.success("Connected to MetaMask! ✅");

    return account; // Return the connected account address
  } catch (error) {
    // Notify user of failure
    toast.error("MetaMask Connection Failed ❌");
    console.error(error);
    return null; // Return null in case of an error
  }
}

// ✅ Function to register an identity on the blockchain
export async function registerIdentity(
  name: string,
  email: string,
  file: File
) {
  try {
    if (!walletClient) throw new Error("Wallet is not connected");

    // 1. Hash the file before upload
    const arrayBuffer = await file.arrayBuffer();
    const fileHash = sha256(new Uint8Array(arrayBuffer));

    // 2. Upload to IPFS
    const ipfsHash = await uploadFileToIPFS(file);

    // 3. Get the user's MetaMask account
    const accounts = await walletClient.requestAddresses();
    if (accounts.length === 0)
      throw new Error("No account found. Please connect your wallet.");
    const userAccount = accounts[0];

    // 4. Register identity on the contract (now with fileHash)
    if (!contract.write.registerIdentity)
      throw new Error("RegisterIdentity function not found in contract");

    const txHash = await contract.write.registerIdentity(
      [name, email, ipfsHash, fileHash],
      {
        account: userAccount,
      }
    );

    toast.success("Identity registered successfully!");
    return txHash;
  } catch (error) {
    console.error("Error registering identity:", error);
    throw error;
  }
}

// ✅ Function to update the identity proof on the blockchain
export async function getIdentity(address: string) {
  try {
    if (!contract.read.getIdentity)
      throw new Error("getIdentity function not found in contract");

    const identity = await contract.read.getIdentity([address]);
    console.log("✅ Identity found:", identity);

    // 👇 Add this check for "empty" identity
    if (
      !identity ||
      (Array.isArray(identity) &&
        identity.every((field) => field === "" || field === "0x" || field === "0x0"))
    ) {
      console.warn(`ℹ️ Empty identity data for address: ${address}`);
      return null;
    }

    return identity;
  } catch (error: any) {
    const errorMsg = error?.shortMessage || error?.message || "Unknown error";

    if (errorMsg.includes("Identity not found")) {
      console.warn(`ℹ️ No identity registered for address: ${address}`);
      return null;
    }

    console.error("🚨 Error fetching identity:", errorMsg, error);
    throw new Error("Failed to fetch identity");
  }
}


export async function updateIdentityProof(address: string, ipfsHash: string) {
  try {
    // Ensure the wallet client is connected
    if (!walletClient) throw new Error("Wallet is not connected");

    // Get the user's MetaMask account
    const accounts = await walletClient.requestAddresses();
    if (accounts.length === 0)
      throw new Error("No account found. Please connect your wallet.");

    // Ensure the contract function exists before calling it
    if (!contract.write.updateIdentityProof) {
      throw new Error("updateIdentityProof function not found in contract");
    }

    // Call the smart contract function to update the identity proof
    const txHash = await contract.write.updateIdentityProof(
      [address, ipfsHash], // Pass the user address and new IPFS hash
      { account: accounts[0] } // Use the connected account to sign the transaction
    );

    // Notify user of successful update
    toast.success("Identity proof updated successfully ✅");

    return txHash; // Return the transaction hash
  } catch (error) {
    console.error("Error updating identity proof:", error);
    toast.error("Failed to update identity proof ❌"); // Notify user of failure
    return null;
  }
}

// ✅ Function to fetch all verified users from the contract
export async function getVerifiedUsers() {
  try {
    // Ensure the contract function exists before calling it
    if (!contract.read.getVerifiedUsers) {
      console.error("getVerifiedUsers function not found in contract");
      return []; // Return an empty array if the function is unavailable
    }

    // Retrieve the list of verified users
    const users = await contract.read.getVerifiedUsers();
    console.log("Verified Users:", users);

    return users; // Return the array of verified users
  } catch (error) {
    console.error("Error fetching verified users:", error);
    return []; // Return an empty array in case of an error
  }
}

// ✅ Function to revoke an identity on the blockchain
export async function revokeIdentity(address: string) {
  try {
    // Ensure the wallet is connected
    if (!walletClient) throw new Error("Wallet is not connected");

    // Get the user's MetaMask account
    const accounts = await walletClient.requestAddresses();
    if (accounts.length === 0)
      throw new Error("No account found. Please connect your wallet.");

    // Ensure the contract function exists before calling it
    if (!contract.write.revokeIdentity) {
      throw new Error("revokeIdentity function not found in contract");
    }

    // Call the contract function to revoke the identity
    const txHash = await contract.write.revokeIdentity(
      [address], // Pass the address to be revoked
      { account: accounts[0] } // Use the connected account
    );

    // Notify user of successful revocation
    toast.success("Identity revoked successfully ✅");

    return txHash; // Return the transaction hash
  } catch (error) {
    console.error("Error revoking identity:", error);
    toast.error("Failed to revoke identity ❌"); // Notify user of failure
    return null;
  }
}

// ✅ Function to verify an identity on the blockchain
export async function verifyIdentity(address: string) {
  try {
    // Ensure the wallet is connected
    if (!walletClient) throw new Error("Wallet is not connected");

    // Get the user's MetaMask account
    const accounts = await walletClient.requestAddresses();
    if (accounts.length === 0)
      throw new Error("No account found. Please connect your wallet.");

    // Ensure the contract function exists before calling it
    if (!contract.write.verifyIdentity) {
      throw new Error("verifyIdentity function not found in contract");
    }

    // Call the contract function to verify the identity
    const txHash = await contract.write.verifyIdentity(
      [address], // Pass the address to be verified
      { account: accounts[0] } // Use the connected account
    );

    // Notify user of successful verification
    toast.success("Identity verified successfully ✅");

    return txHash; // Return the transaction hash
  } catch (error) {
    console.error("Error verifying identity:", error);
    toast.error("Failed to verify identity ❌"); // Notify user of failure
    return null;
  }
}


// Helper to get NFT tokenId for a user
export async function getUserNftTokenId(userAddress: string): Promise<number | null> {
  const tokenCounter = await identityNftContract.read.tokenCounter();
  for (let tokenId = 0; tokenId < Number(tokenCounter); tokenId++) {
    const owner = await identityNftContract.read.ownerOf([tokenId]);
    if ((owner as string).toLowerCase() === userAddress.toLowerCase()) return tokenId;
  }
  return null;
}

// Helper to get tokenURI (IPFS hash) for a tokenId
export async function getNftTokenUri(tokenId: number) {
  return await identityNftContract.read.tokenURI([tokenId]);
}


