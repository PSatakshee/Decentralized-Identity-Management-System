const hre = require("hardhat");

async function main() {
  const ethers = hre.ethers;

  // 🧪 Get signers safely
  const signers = await ethers.getSigners();
  if (!signers || signers.length < 2) {
    throw new Error("❌ Not enough signers available");
  }

  const deployer = signers[0];
  const user1 = signers[1];

  console.log("🚀 Deployer address:", deployer?.address);
  console.log("👤 Test user address:", user1?.address);

  // ✅ Deploy NFT contract
  const IdentityNFT = await ethers.getContractFactory("IdentityNFT");
  const nft = await IdentityNFT.deploy(deployer.address);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("🪙 IdentityNFT deployed at:", nftAddress);

  // ✅ Deploy DIMS contract
  const DIMS = await ethers.getContractFactory("DIMS");
  const dims = await DIMS.deploy();
  await dims.waitForDeployment();
  const dimsAddress = await dims.getAddress();
  console.log("📦 DIMS deployed at:", dimsAddress);

  // 🔗 Connect both contracts
  await dims.setNFTContract(nftAddress);
  await nft.setDIMSContract(dimsAddress);
  console.log("🔗 Contracts connected!");

  // 📝 Register identity
  const dimsAsUser = dims.connect(user1);
  await dimsAsUser.registerIdentity("Alice", "alice@example.com", "ipfs://cid123");
  console.log("✅ Identity registered");

  // 🧾 Verify and mint NFT
  await dims.verifyIdentity(user1.address);
  console.log("✅ Identity verified & NFT minted");

  // ✅ Check NFT balance
  const balance = await nft.balanceOf(user1.address);
  console.log("🏅 NFT Balance for user1:", balance.toString());
}

main().catch((err) => {
  console.error("❌ Error in test flow:", err);
  process.exit(1);
});
