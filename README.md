# 🌐 DIMS: Decentralized Identity Management System

DIMS is a full-stack **decentralized application (dApp)** that empowers users to create, manage, and verify digital identities on the **Ethereum blockchain**. By leveraging **smart contracts**, **NFTs**, and **IPFS** for storage, DIMS offers a **transparent**, **secure**, and **user-controlled** identity solution tailored for Web3.

---

## 🚀 Features

- **🆔 Self-Sovereign Identity Registration**  
  Users can register by providing their name, email, and uploading a proof document (image or PDF). Documents are securely stored on **IPFS**, ensuring privacy and decentralization.

- **🔗 On-Chain Identity Management**  
  The `DIMS.sol` smart contract manages all identity data, storing key details and the corresponding IPFS hash.

- **🏅 NFT-Based Identity Badges**  
  Upon verification, users receive a unique **ERC-721 NFT** from `IdentityNFT.sol`, representing their verified identity.

- **🛠️ Admin Dashboard**  
  Admins can verify users, update identity proofs, and revoke identities when needed.

- **🦊 MetaMask Integration**  
  Seamless MetaMask connectivity for registration, transactions, and interactions.

- **📦 Decentralized Storage with IPFS**  
  Documents are uploaded via **Pinata**, ensuring they are **tamper-proof** and **censorship-resistant**.

---

## 🏗️ Project Structure
<details>
<summary>Click to expand</summary>
  dims/<br>
  ├── contracts/<br>
  │ ├──contracts/<br>
  │   ├── DIMS.sol # Smart contract for identity management
  │   └── IdentityNFT.sol # NFT badge smart contract
  │ ├── scripts/
  │   ├── deploy.ts # Smart contract deployment script
  │   └── testFlow.js # Identity flow test script
  │ └── test/
  │   └── Lock.test # Example unit test
  ├── public/
  │ ├── abi.json # ABI for frontend integration
  │ └── nftabi.json # ABI for NFT
  ├── src/
  │ ├── app/
  │   ├── admin/
  │     └── page.tsx
  │   ├── layout.tsx
  │   ├── MetaMaskConnection.tsx
  │   ├── page.tsx
  │   └── upload.tsx
  │ ├── components/
  │   └── button.tsx
  │ └── lib/
  │   ├── ipfs.ts
  │   └── web3.ts

</details>
---

## ⚙️ How It Works

### 1. Identity Registration
- Connect wallet using MetaMask.
- Enter name and email, then upload your proof document.
- Document is uploaded to IPFS; hash is stored on-chain.
- Identity details are recorded via the `DIMS.sol` smart contract.

### 2. Verification & NFT Minting
- Admin reviews submitted identity.
- Upon approval, an NFT badge is minted and issued to the user's wallet.

### 3. Identity Management
- **Users/Admins** can:
  - View identity details by address.
  - Update proof documents.
  - Revoke or verify identities (admin only).
  - Browse all verified identities.

---

## 🖥️ Getting Started

### ✅ Prerequisites

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) or npm
- [MetaMask](https://metamask.io/)
- [Pinata](https://www.pinata.cloud/) account
- [Hardhat](https://hardhat.org/) for contract deployment

---

### 📦 Setup

```bash
git clone https://github.com/PSatakshee/dims.git
cd dims
```
- Install dependencies:
```bash
yarn install
# or
npm install
```
---

### 🔐 Configure Environment

- Copy .env.example to .env.local and fill in:

ALCHEMY_API_URL=

PRIVATE_KEY=

NEXT_PUBLIC_CONTRACT_ADDRESS=

NEXT_PUBLIC_NFT_ADDRESS=

NEXT_PUBLIC_WALLET_ADDRESS=

NEXT_PUBLIC_PINATA_API_KEY=

NEXT_PUBLIC_PINATA_SECRET_API_KEY=

NEXT_PUBLIC_PINATA_JWT=

---

###📤 Deploy Smart Contracts

- Update hardhat.config.ts with your network and private key.

Deploy: 
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

- Copy deployed contract addresses to .env.local

---

### 🚀 Run the Frontend
```bash
yarn dev
# or
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧩 Smart Contracts Overview

| Contract          | Purpose                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| `DIMS.sol`        | Handles identity registration, updates, verifications, and revocations |
| `IdentityNFT.sol` | Mints ERC-721 identity badge NFTs for verified users                   |

---

## 🛡️ Security & Privacy

- Documents are stored off-chain on IPFS.
- Only the IPFS hash and essential metadata are stored on-chain.
- Only the admin wallet can verify or revoke identities.

---

## 👨‍💻 Usage

- **Users:** Register, update identity, view/download proof document.
- **Admins:** Verify identities, mint NFTs, revoke users, manage identity lifecycle.
- **Public:** Search and view verified users by address.

---

> Take control of your digital identity in the decentralized world with **DIMS**.


