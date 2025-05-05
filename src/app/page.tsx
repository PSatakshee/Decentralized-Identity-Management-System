"use client";

import { useState, useEffect } from "react";
import {
  connectMetaMask,
  registerIdentity,
  getIdentity,
  verifyIdentity,
  walletClient,
  getVerifiedUsers,
  getUserNftTokenId,
  getNftTokenUri,
} from "../lib/web3";
import MetaMaskConnection from "./MetaMaskConnection";
import { isAddress } from "viem/utils";
import { toast } from "react-toastify";

const WALLET_ADDRESS = process.env.NEXT_PUBLIC_WALLET_ADDRESS || "";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [txHash, setTxHash] = useState("");
  const [userAddress, setUserAddress] = useState<`0x${string}` | null>(null);
  const [lookupAddress, setLookupAddress] = useState<string>("");
  const [owner, setOwner] = useState<`0x${string}` | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [searchAddress, setSearchAddress] = useState<string>("");
  const [nftTokenId, setNftTokenId] = useState<number | null>(null);
  const [nftTokenUri, setNftTokenUri] = useState<string | null>(null);
  const [searchedNftTokenId, setSearchedNftTokenId] = useState<number | null>(
    null
  );
  const [searchedNftTokenUri, setSearchedNftTokenUri] = useState<string | null>(
    null
  );
  const [identity, setIdentity] = useState<{
    name: string;
    email: string;
    owner: string;
    isVerified: boolean;
    ipfsHash: string;
    fileHash: string;
  } | null>(null);
  const [searchedIdentity, setSearchedIdentity] = useState<{
    name: string;
    email: string;
    owner: string;
    isVerified: boolean;
    ipfsHash: string;
    fileHash: string;
  } | null>(null);

  const handleSearchIdentity = async () => {
    if (!searchAddress || !isAddress(searchAddress)) {
      toast.warn("Enter a valid Ethereum address");
      return;
    }

    try {
      const data = await getIdentity(searchAddress);
      if (data && Array.isArray(data) && data.length === 6) {
        // const [name, email, owner, isVerified, ipfsHash] = data;
        // setSearchedIdentity({ name, email, owner, isVerified, ipfsHash });
        const [name, email, owner, isVerified, ipfsHash, fileHash] = data;
        setSearchedIdentity({
          name,
          email,
          owner,
          isVerified,
          ipfsHash,
          fileHash,
        });

        toast.success("Identity found! ✅");
      } else {
        setSearchedIdentity(null);
        toast.warn("No identity found for this address");
      }
    } catch (error) {
      console.error("Error fetching searched identity:", error);
      toast.error("Failed to fetch identity ❌");
    }
  };

  async function fetchIdentity() {
    if (!lookupAddress || !isAddress(lookupAddress)) {
      toast.warn("Please enter a valid wallet address");
      return;
    }
    setLoading(true);
    try {
      const data = await getIdentity(lookupAddress);
      console.log("✅ Identity Data Received:", data);

      if (data && Array.isArray(data) && data.length === 6) {
        // const [name, email, owner, isVerified, ipfsHash] = data;
        // setIdentity({ name, email, owner, isVerified, ipfsHash });
        const [name, email, owner, isVerified, ipfsHash, fileHash] = data;
        setIdentity({ name, email, owner, isVerified, ipfsHash, fileHash });

        toast.success("Identity fetched successfully! 🎉");
      } else {
        setIdentity(null);
        toast.warn("No identity found for this address");
      }
    } catch (error) {
      console.error("Error fetching identity:", error);
      toast.error("Failed to fetch identity ❌");
    } finally {
      setLoading(false);
    }
  }

  async function getOwner() {
    if (typeof window === "undefined") return;
    try {
      if (!walletClient) {
        toast.error("Wallet not connected ❌");
        return;
      }
      const accounts = await walletClient.requestAddresses();
      if (accounts.length === 0) {
        toast.warn("No wallet accounts found ⚠️");
        return;
      }

      const firstAccount = accounts[0] as `0x${string}`;
      setOwner(firstAccount);
      setIsOwner(firstAccount.toLowerCase() === WALLET_ADDRESS.toLowerCase());
    } catch (error) {
      console.error("Error getting owner:", error);
      toast.error("Failed to fetch owner ❌");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name || !email || !file) {
      toast.warn("Please fill in all fields and upload a file ⚠️");
      return;
    }

    try {
      const transactionHash = await registerIdentity(name, email, file);
      if (transactionHash) {
        setTxHash(transactionHash);
        toast.success("Identity registered successfully! 🎉");
      } else {
        toast.error("Transaction failed ❌");
      }
    } catch (error) {
      console.error("Error registering identity:", error);
      toast.error("Registration failed ❌");
    }
  }

  async function handleVerifyIdentity() {
    if (!lookupAddress || !isAddress(lookupAddress)) {
      toast.warn("Enter a valid wallet address ⚠️");
      return;
    }
    try {
      await verifyIdentity(lookupAddress);
      toast.success("Identity verified successfully! ✅");
      fetchIdentity();
    } catch (error) {
      console.error("Error verifying identity:", error);
      toast.error("Failed to verify identity ❌");
    }
  }

  async function handleConnectWallet() {
    const account = await connectMetaMask();
    if (account) {
      setUserAddress(account as `0x${string}`);
      // toast.success("Wallet connected! ✅");

      const identityData = await getIdentity(account);
      if (
        identityData &&
        Array.isArray(identityData) &&
        identityData.length === 6
      ) {
        // const [name, email, owner, isVerified, ipfsHash] = identityData;
        // setIdentity({ name, email, owner, isVerified, ipfsHash });
        const [name, email, owner, isVerified, ipfsHash, fileHash] =
          identityData;
        setIdentity({ name, email, owner, isVerified, ipfsHash, fileHash });
      } else {
        setIdentity(null); // no identity found
      }
    }
  }

  useEffect(() => {
    getOwner();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const users = await getVerifiedUsers();
        if (Array.isArray(users)) {
          setVerifiedUsers(users);
        } else {
          console.error("Invalid response from getVerifiedUsers:", users);
          setVerifiedUsers([]);
        }
      } catch (error) {
        console.error("Error fetching verified users:", error);
        toast.error("Failed to load verified users ❌");
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchNftInfo() {
      if (identity && identity.isVerified && userAddress) {
        const tokenId = await getUserNftTokenId(userAddress);
        setNftTokenId(tokenId);
        if (tokenId !== null) {
          const tokenUri = await getNftTokenUri(tokenId);
          if (typeof tokenUri === "string") {
            setNftTokenUri(tokenUri);
          }
        }
      } else {
        setNftTokenId(null);
        setNftTokenUri(null);
      }
    }
    fetchNftInfo();
  }, [identity, userAddress]);

  useEffect(() => {
    async function fetchSearchedNftInfo() {
      if (searchedIdentity && searchedIdentity.owner) {
        const tokenId = await getUserNftTokenId(searchedIdentity.owner);
        setSearchedNftTokenId(tokenId);
        if (tokenId !== null) {
          const tokenUri = await getNftTokenUri(tokenId);
          if (typeof tokenUri === "string") setSearchedNftTokenUri(tokenUri);
        } else {
          setSearchedNftTokenUri(null);
        }
      }
    }
    fetchSearchedNftInfo();
  }, [searchedIdentity]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-blue-100">
      <h1 className="text-5xl font-extrabold text-amber-500 mb-6 drop-shadow-lg">
        Welcome to <span className="text-blue-600">DIMS</span>
      </h1>

      <button
        onClick={handleConnectWallet}
        className="mb-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition duration-300"
      >
        👤 User Status
      </button>

      {owner && (
        <p className="text-sm text-gray-600 mb-4">
          <strong>Contract Owner:</strong> {owner}
        </p>
      )}

      {userAddress && (
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 mt-4 border border-gray-200">
          <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
            👤 Your Identity Status
          </h2>
          <p>
            <strong>Address:</strong> {userAddress}
          </p>

          {identity ? (
            <>
              <p>
                <strong>Name:</strong> {identity.name}
              </p>
              <p>
                <strong>Email:</strong> {identity.email}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {identity.isVerified ? (
                  <span className="text-green-600 font-semibold">
                    ✅ Verified
                  </span>
                ) : (
                  <span className="text-yellow-600 font-semibold">
                    ⏳ Pending
                  </span>
                )}
              </p>
              <a
                href={`https://ipfs.io/ipfs/${identity.ipfsHash}`}
                target="_blank"
                className="text-blue-500 hover:underline mt-2 block"
              >
                📄 View Uploaded Proof
              </a>
            </>
          ) : (
            <p className="text-red-600 font-semibold mt-2">
              ❌ No identity registered yet
            </p>
          )}

          {identity?.isVerified && nftTokenUri && (
            <div className="mt-4">
              <h3 className="font-semibold text-blue-700">
                🎖️ NFT Identity Badge
              </h3>
              <a
                href={`https://ipfs.io/ipfs/${nftTokenUri.replace(
                  "ipfs://",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View NFT Badge Metadata
              </a>
            </div>
          )}
        </div>
      )}

      {/* Identity Registration Form */}
      <div className="mt-10 w-full max-w-lg bg-white rounded-xl shadow-md p-6 border">
        <h2 className="text-2xl font-semibold mb-4">📝 Register Identity</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
              setPreviewURL(
                selectedFile ? URL.createObjectURL(selectedFile) : null
              );
            }}
            className="w-full px-2 py-2 file:bg-blue-500 file:text-white file:rounded file:px-4 file:py-2 file:cursor-pointer"
          />

          {previewURL && (
            <div className="border p-3 rounded shadow-sm">
              <p className="font-medium mb-2">📁 Preview:</p>
              {file?.type.startsWith("image/") ? (
                <img
                  src={previewURL}
                  alt="Preview"
                  className="rounded max-h-64 mx-auto"
                />
              ) : file?.type === "application/pdf" ? (
                <iframe
                  src={previewURL}
                  title="PDF Preview"
                  className="w-full h-64 rounded"
                />
              ) : (
                <p className="text-sm text-gray-500">Preview not supported</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow transition"
          >
            ✅ Register
          </button>
        </form>
      </div>

      {/* Verified Users List */}
      <div className="mt-10 w-full max-w-lg bg-white rounded-xl p-6 shadow border">
        <h2 className="text-xl font-semibold mb-2">✔️ Verified Users</h2>
        {verifiedUsers.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {verifiedUsers.map((user, i) => (
              <li key={i}>{user}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No verified users yet.</p>
        )}
      </div>

      {/* Fetch / Verify Identity */}
      <div className="mt-10 w-full max-w-lg space-y-4 bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold text-purple-700">
          ✅ Verify Identity
        </h2>
        <input
          type="text"
          value={lookupAddress}
          onChange={(e) => setLookupAddress(e.target.value)}
          placeholder="Enter Wallet Address"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="flex gap-2">
          {/* <button
            onClick={fetchIdentity}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
          >
            🔎 Fetch
          </button> */}
          {isOwner && (
            <button
              onClick={handleVerifyIdentity}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              ✅ Verify
            </button>
          )}
        </div>
      </div>

      {/* Search Identity by Address */}
      <div className="mt-10 w-full max-w-lg space-y-4 bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold text-purple-700">
          🔍 Search Identity by Address
        </h2>
        <input
          type="text"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          placeholder="Enter Ethereum Address"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={handleSearchIdentity}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
        >
          Search Identity
        </button>
      </div>

      {/* Identity Results */}
      {/* {isClient && identity && (
        <div className="mt-10 max-w-lg w-full bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-bold mb-2 text-green-700">
            🧾 Identity Details
          </h2>
          <p>
            <strong>Name:</strong> {identity.name}
          </p>
          <p>
            <strong>Email:</strong> {identity.email}
          </p>
          <p>
            <strong>Owner:</strong> {identity.owner}
          </p>
          <p>
            <strong>Verified:</strong>{" "}
            {identity.isVerified ? "✅ Yes" : "❌ No"}
          </p>
          <p>
            <strong>File Hash:</strong> {identity.fileHash}
          </p>
          {(identity.ipfsHash.endsWith(".jpg") ||
            identity.ipfsHash.endsWith(".png") ||
            identity.ipfsHash.endsWith(".jpeg")) && (
            <img
              src={`https://ipfs.io/ipfs/${identity.ipfsHash}`}
              alt="Identity Proof"
              className="mt-4 rounded shadow w-48"
            />
          )}
        </div>
      )} */}

      {isClient && searchedIdentity && (
        <div className="mt-10 max-w-lg w-full bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-bold mb-2 text-purple-700">
            🔍 Searched Identity
          </h2>
          {searchedNftTokenUri && (
            <div className="mt-4">
              <h3 className="font-semibold text-blue-700">
                🎖️ NFT Identity Badge
              </h3>
              {/* <a
                href={`https://ipfs.io/ipfs/${searchedNftTokenUri.replace(
                  "ipfs://",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View NFT Badge Metadata
              </a> */}
              {(searchedNftTokenUri.endsWith(".png") ||
                searchedNftTokenUri.endsWith(".jpg") ||
                searchedNftTokenUri.endsWith(".jpeg")) && (
                <img
                  src={`https://ipfs.io/ipfs/${searchedNftTokenUri.replace(
                    "ipfs://",
                    ""
                  )}`}
                  alt="NFT Badge"
                  className="mt-2 rounded shadow w-32"
                />
              )}
            </div>
          )}
          <p>
            <strong>Name:</strong> {searchedIdentity.name}
          </p>
          <p>
            <strong>Email:</strong> {searchedIdentity.email}
          </p>
          <p>
            <strong>Owner:</strong> {searchedIdentity.owner}
          </p>
          <p>
            <strong>Verified:</strong>{" "}
            {searchedIdentity.isVerified ? "✅ Yes" : "❌ No"}
          </p>
          <p>
            <strong>File Hash:</strong> {searchedIdentity.fileHash}
          </p>
          {(searchedIdentity.ipfsHash.endsWith(".jpg") ||
            searchedIdentity.ipfsHash.endsWith(".png") ||
            searchedIdentity.ipfsHash.endsWith(".jpeg")) && (
            <img
              src={`https://ipfs.io/ipfs/${searchedIdentity.ipfsHash}`}
              alt="Uploaded Identity Proof"
              className="mt-4 rounded shadow w-48"
            />
          )}
        </div>
      )}
    </div>
  );
}
