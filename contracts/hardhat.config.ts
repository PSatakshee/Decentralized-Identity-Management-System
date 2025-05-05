import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-viem"


dotenv.config(); // Load environment variables
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28", // Matches the pragma in lock.sol
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  defaultNetwork: "sepolia",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    hardhat: {},
    sepolia: {
      url: ALCHEMY_API_URL || "",
      accounts: [PRIVATE_KEY], 
    },
  },
};

export default config;

