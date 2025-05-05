"use client";

import { useState } from "react";
import { uploadFileToIPFS } from "@/lib/ipfs";
import { toast } from "react-toastify";
import { sha256 } from "js-sha256";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
  
      // Compute SHA-256 hash of file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hash = sha256(new Uint8Array(arrayBuffer));
      setFileHash(hash); // You need a useState for fileHash
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setLoading(true);
    try {
      const url = await uploadFileToIPFS(file);
      setIpfsUrl(url);
      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("File upload failed.");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Identity Proof</h1>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload to IPFS"}
      </button>
      {ipfsUrl && (
        <div className="mt-4">
          <p>File uploaded to:</p>
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {ipfsUrl}
          </a>
        </div>
      )}
    </div>
  );
}
function setFileHash(hash: string) {
    throw new Error("Function not implemented.");
}

