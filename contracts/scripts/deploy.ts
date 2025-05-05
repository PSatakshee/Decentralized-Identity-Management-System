import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("👤 Deploying contracts with account:", deployer.address);

  // Deploy IdentityNFT with deployer as initial owner (required in OpenZeppelin v5+)
  const IdentityNFT = await ethers.getContractFactory("IdentityNFT");
  const nft = await IdentityNFT.deploy(deployer.address);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("🪙 IdentityNFT deployed at:", nftAddress);

  // Deploy DIMS
  const DIMS = await ethers.getContractFactory("DIMS");
  const dims = await DIMS.deploy();
  await dims.waitForDeployment();
  const dimsAddress = await dims.getAddress();
  console.log("📦 DIMS deployed at:", dimsAddress);

  // Set up references between the contracts
  console.log("🔗 Connecting contracts...");
  const dimsContract = await ethers.getContractAt("DIMS", dimsAddress);
  await dimsContract.setNFTContract(nftAddress);

  const nftContract = await ethers.getContractAt("IdentityNFT", nftAddress);
  await nftContract.setDIMSContract(dimsAddress);

  console.log("✅ Contracts connected successfully!");
  const name = await nft.name(); // Should return "IdentityBadge"
console.log("NFT name:", name);

}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
