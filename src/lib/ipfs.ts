import axios from "axios";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!;

// ✅ Function to upload JSON data to IPFS
export async function uploadJSONToIPFS(jsonData: object) {
    try {
        const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${PINATA_JWT}`,
            },
        });

        console.log("IPFS Hash:", response.data.IpfsHash);
        return response.data.IpfsHash; // CID (Content Identifier) for IPFS
    } catch (error) {
        console.error("Error uploading JSON to IPFS:", error);
        throw error;
    }
}

// ✅ Function to upload a file (identity proof) to IPFS
export async function uploadFileToIPFS(file: File) {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                "Authorization": `Bearer ${PINATA_JWT}`,
            },
        });

        console.log("File IPFS Hash:", response.data.IpfsHash);
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        throw error;
    }
}
