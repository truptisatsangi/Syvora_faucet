import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying SyvoraTreasury with deployer:", deployer);

  const syvoraTreasury = await deploy("SyvoraTreasury", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      upgradeIndex: 0,
      execute: {
        init: {
          methodName: "initialize", 
          args: [],
        },
      },
    },
  });

  console.log("SyvoraTreasury deployed at:", syvoraTreasury.address);
};

module.exports.tags = ["SyvoraTreasury"];
export default func;
