import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";

require("dotenv").config();

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url:
        process.env.ARCHIVE_NODE_sepolia ||
        "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
      chainId: 11155111,
      live: true,
      gasPrice: 20000000000, // 20 gwei
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [`0x${process.env.DEPLOYER_PRIVATE_KEY}`]
        : [],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // First account in the wallet will be used as the deployer
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  solidity: "0.8.25",
};

export default config;
