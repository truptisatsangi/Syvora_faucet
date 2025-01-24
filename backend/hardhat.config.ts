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
      url: process.env.INFURA_SEPOLIA_RPC_URL,
      chainId: 11155111,
      live: true,
      gasPrice: 20000000000,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  solidity: "0.8.25",
};

export default config;
