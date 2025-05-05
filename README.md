DIMS: Decentralized Identity Management System
DIMS is a full-stack decentralized application (dApp) that empowers users to create, manage, and verify digital identities on the Ethereum blockchain. By leveraging smart contracts, NFTs, and decentralized storage (IPFS), DIMS offers a transparent, secure, and user-controlled identity solution for Web3 applications.

🚀 Features
Self-Sovereign Identity Registration:
Users can register their identity by providing their name, email, and uploading a proof document (image or PDF). The proof is stored on IPFS, ensuring privacy and decentralization.

On-Chain Identity Management:
All identities are managed by a smart contract (DIMS.sol), which securely stores user details and the IPFS hash of their identity proof.

NFT-Based Identity Badges:
Upon successful verification, users receive a unique NFT badge (IdentityNFT.sol) as proof of their verified identity.

Admin Dashboard:
Admins can view all verified users, upload updated proofs, and revoke identities as needed.

MetaMask Integration:
Seamless wallet connection for registration, verification, and all blockchain interactions.

Decentralized Storage with IPFS:
All identity proofs are uploaded to IPFS via Pinata, ensuring documents are tamper-proof and censorship-resistant.

🏗️ Project Structure
text
dims/
├── contracts/
│   ├── DIMS.sol              # Main identity management smart contract
│   ├── IdentityNFT.sol       # NFT contract for identity badges
│   ├── scripts/
│   │   ├── deploy.ts         # Deployment script for contracts
│   │   └── testFlow.js       # Test script for contract flows
│   └── test/
│       └── Lock.test         # Example contract test
├── public/
│   └── abi.json              # ABI for frontend contract interaction
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Global layout and styles
│   │   ├── MetaMaskConnection.tsx
│   │   ├── page.tsx          # Main UI page
│   │   └── upload.tsx        # File upload page
│   ├── components/
│   │   └── adminPage.tsx     # Admin dashboard component
│   └── lib/
│       ├── ipfs.ts           # IPFS upload utilities
│       └── web3.ts           # Blockchain interaction logic
⚙️ How It Works
1. Identity Registration
Users connect their MetaMask wallet.

Fill in name, email, and upload a proof document.

Proof is uploaded to IPFS; the hash is stored on-chain.

Registration is recorded by the DIMS smart contract.

2. Verification and NFT Minting
Admin reviews and verifies the identity.

On verification, an NFT badge is minted to the user as proof.

3. Identity Management
Users and admins can:

Fetch identity details by address.

Update identity proof (uploads new document to IPFS).

Revoke identity (admin only).

View all verified users.

🖥️ Getting Started
Prerequisites
Node.js

Yarn or npm

MetaMask

Pinata account for IPFS uploads

Hardhat for smart contract deployment

Setup
Clone the repository

bash
git clone https://github.com/yourusername/dims.git
cd dims
Install dependencies

bash
yarn install
# or
npm install
Configure Environment Variables

Copy .env.example to .env.local and fill in:

NEXTPUBLICPINATAAPIKEY

NEXTPUBLICPINATASECRETAPIKEY

NEXTPUBLICPINATAJWT

NEXTPUBLICCONTRACTADDRESS

NEXTPUBLICALCHEMYAPIURL

NEXTPUBLICWALLETADDRESS (admin wallet)

Deploy Smart Contracts

Update hardhat.config.ts with your network and keys.

Run:

bash
npx hardhat run scripts/deploy.ts --network sepolia
Copy deployed contract addresses to your .env.local.

Run the Frontend

bash
yarn dev
# or
npm run dev
Open http://localhost:3000 in your browser.

🧩 Main Smart Contracts
Contract	Purpose
DIMS.sol	Manages identity registration, verification, and revocation. Stores identity metadata and IPFS hash.
IdentityNFT.sol	Mints ERC-721 NFTs as identity badges for verified users. Only callable by DIMS contract.
🛡️ Security & Privacy
All sensitive documents are stored off-chain on IPFS.

Only the IPFS hash and minimal identity metadata are stored on-chain.

Verification and revocation actions are restricted to the contract owner (admin).

👨‍💻 Usage
Users: Register, view, and update their identities. Download/view their proof document from IPFS.

Admins: Verify identities, mint NFT badges, update proofs, and revoke identities.

Anyone: Lookup verified users and fetch identity details by address.

🌐 Live Demo
(Add link here if deployed on Vercel, Netlify, or another platform)

🤝 Contributing
Contributions are welcome! Please open issues and pull requests for improvements or bug fixes.

📄 License
This project is licensed under the MIT License.

🙏 Acknowledgements
OpenZeppelin for secure smart contract libraries

Pinata for IPFS integration

Viem for blockchain interaction

React Toastify for notifications

DIMS: Take control of your digital identity in the decentralized world.
