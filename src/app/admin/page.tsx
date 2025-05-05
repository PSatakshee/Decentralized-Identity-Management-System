"use client";

import { useEffect, useState } from "react";
import { getVerifiedUsers, revokeIdentity, getIdentity, verifyIdentity } from "@/lib/web3";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { sha256 } from "js-sha256";

// Extend Identity to include hash check state
interface Identity {
  address: string;
  ipfsHash: string;
  fileHash?: string;
  name?: string;
  email?: string;
  isVerified?: boolean;
  hashChecked?: boolean;
  hashMatch?: boolean;
}

export default function AdminDashboard() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIdentities() {
      try {
        const addresses = await getVerifiedUsers();
        if (!Array.isArray(addresses) || addresses.length === 0) {
          setIdentities([]);
          setLoading(false);
          return;
        }
        const identityData = await Promise.all(
          addresses.map(async (address: string) => {
            try {
              const identity = await getIdentity(address);
              // [name, email, owner, isVerified, ipfsHash, fileHash]
              if (!Array.isArray(identity)) throw new Error("Invalid identity format");
              const [name, email, owner, isVerified, ipfsHash, fileHash] = identity;
              return {
                address,
                name,
                email,
                isVerified,
                ipfsHash,
                fileHash,
                hashChecked: false,
                hashMatch: false,
              };
            } catch (error) {
              return { address, name: "", email: "", isVerified: false, ipfsHash: "", fileHash: "", hashChecked: false, hashMatch: false };
            }
          })
        );
        setIdentities(identityData);
      } catch (error) {
        toast.error("Failed to load verified identities.");
      } finally {
        setLoading(false);
      }
    }
    fetchIdentities();
  }, []);

  // Download file from IPFS, hash, compare to on-chain hash
  const handleCheckHash = async (identity: Identity) => {
    if (!identity.ipfsHash || !identity.fileHash) {
      toast.error("Missing IPFS hash or on-chain file hash.");
      return;
    }
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${identity.ipfsHash}`);
      if (!response.ok) {
        toast.error("Failed to fetch file from IPFS.");
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const computedHash = sha256(new Uint8Array(arrayBuffer));
      setIdentities((prev) =>
        prev.map((id) =>
          id.address === identity.address
            ? { ...id, hashChecked: true, hashMatch: computedHash === identity.fileHash }
            : id
        )
      );
      if (computedHash === identity.fileHash) {
        toast.success("Hash matches! You can now verify.");
      } else {
        toast.error("Hash does not match. Do not verify.");
      }
    } catch (err) {
      toast.error("Error checking hash.");
      console.error(err);
    }
  };

  const handleVerify = async (address: string) => {
    try {
      await verifyIdentity(address);
      toast.success("Identity verified!");
      setIdentities((prev) =>
        prev.map((id) =>
          id.address === address ? { ...id, isVerified: true } : id
        )
      );
    } catch (err) {
      toast.error("Verification failed.");
      console.error(err);
    }
  };

  const handleRevoke = async (address: string) => {
    try {
      await revokeIdentity(address);
      toast.success("Identity revoked successfully.");
      setIdentities((prev) => prev.filter((id) => id.address !== address));
    } catch (error) {
      toast.error("Failed to revoke identity.");
      console.error(error);
    }
  };

  if (loading) return <div>Loading identities...</div>;

  return (
    // <div className="container mx-auto p-6">
    //   <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    //   {identities.length === 0 && <p>No identities found.</p>}
    //   {identities.map((identity) => (
    //     <div key={identity.address} className="border p-4 mb-4 rounded">
    //       <p><strong>Address:</strong> {identity.address}</p>
    //       <p><strong>Name:</strong> {identity.name || "N/A"}</p>
    //       <p><strong>Email:</strong> {identity.email || "N/A"}</p>
    //       <p><strong>Status:</strong> {identity.isVerified ? "Verified" : "Pending"}</p>
    //       <p>
    //         <strong>IPFS Proof:</strong>
    //         {identity.ipfsHash ? (
    //           <a
    //             href={`https://ipfs.io/ipfs/${identity.ipfsHash}`}
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             className="text-blue-600 underline ml-2"
    //           >
    //             Download/View
    //           </a>
    //         ) : (
    //           " N/A"
    //         )}
    //       </p>
    //       <p><strong>On-chain File Hash:</strong> {identity.fileHash || "N/A"}</p>
    //       <div className="mt-2 flex flex-wrap gap-2">
    //         <Button onClick={() => handleCheckHash(identity)}>
    //           Check Hash
    //         </Button>
    //         {identity.hashChecked && identity.hashMatch && !identity.isVerified && (
    //           <Button className="bg-green-600" onClick={() => handleVerify(identity.address)}>
    //             Verify
    //           </Button>
    //         )}
    //         {identity.hashChecked && !identity.hashMatch && (
    //           <span className="text-red-600 font-semibold ml-2">Hash mismatch!</span>
    //         )}
    //         <Button className="bg-red-500" onClick={() => handleRevoke(identity.address)}>
    //           Revoke
    //         </Button>
    //       </div>
    //     </div>
    //   ))}
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 pb-12">
    {/* Fixed Top Bar */}
    <div className=" top-0 left-0 w-full bg-white shadow z-50">
      <div className="container mx-auto px-6 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-700">
          🛡️ Admin Dashboard
        </h1>
      </div>
    </div>
  
    {/* Main Content */}
    <div className="flex flex-col items-center justify-start pt-28 px-4">
      <div className="container mx-auto">
        {identities.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No identities found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {identities.map((identity) => (
              <div
                key={identity.address}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  🧾 Address:{" "}
                  <span className="font-mono text-sm break-all text-blue-600">
                    {identity.address}
                  </span>
                </h2>
  
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Name:</strong> {identity.name || "N/A"}</p>
                  <p><strong>Email:</strong> {identity.email || "N/A"}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        identity.isVerified
                          ? "text-green-600"
                          : "text-yellow-500 animate-pulse"
                      }`}
                    >
                      {identity.isVerified ? "✅ Verified" : "⏳ Pending"}
                    </span>
                  </p>
                  {/* <p>
                    <strong>IPFS Proof:</strong>{" "}
                    {identity.ipfsHash ? (
                      <a
                        href={`https://ipfs.io/ipfs/${identity.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View Document
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p> */}
                  <p>
                    <strong>On-chain File Hash:</strong>{" "}
                    <span className="break-all font-mono">
                      {identity.fileHash || "N/A"}
                    </span>
                  </p>
                </div>
  
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleCheckHash(identity)}
                    className="bg-black hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
                  >
                    🔍 Check Hash
                  </button>
                  {identity.hashChecked && identity.hashMatch && !identity.isVerified && (
                    <button
                      onClick={() => handleVerify(identity.address)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                    >
                      ✅ Verify
                    </button>
                  )}
                  {identity.hashChecked && !identity.hashMatch && (
                    <span className="text-red-600 font-semibold mt-2">
                      ❌ Hash mismatch!
                    </span>
                  )}
                  <button
                    onClick={() => handleRevoke(identity.address)}
                    className="bg-black hover:bg-red-600 text-white px-4 py-2 rounded shadow"
                  >
                    ⛔ Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  
  );
}
