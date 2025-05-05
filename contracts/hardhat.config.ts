import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-viem"
import { createPublicClient, http, Block } from "viem";
import { sepolia } from "viem/chains";

dotenv.config(); // Load environment variables
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
// if (!PRIVATE_KEY || PRIVATE_KEY.length !== 32) {
//   throw new Error("❌ Invalid PRIVATE_KEY. It must be a 32-character string.");
// }


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
      // accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;


// const config: HardhatUserConfig = {
//   solidity: {
//     version: "0.8.28", // Explicit version
//     settings: {
//       optimizer: { enabled: true, runs: 200 },
//     },
//   },
//   defaultNetwork: "sepolia",
//   networks: {
//     hardhat: {},
//     sepolia: {
//       url: process.env.ALCHEMY_API_URL || "", // Fallback to empty string if undefined
//       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // Avoids errors if undefined
//     },
//   },
// };

// const client = createPublicClient({
//   chain: sepolia,
//   transport: http("https://eth-sepolia.g.alchemy.com/v2/hBL5WNCxvAx6kmnP11dFxY6j9c_aBa7C"),
// });

// const block: Block = await client.getBlock({
//   blockNumber: 123456n,
// });

// console.log(block);

// export default config;
