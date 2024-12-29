import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers, network, upgrades } from "hardhat";
import { SignerWithAddress } from "hardhat-deploy-ethers/signers";
import { SyvoraTreasury } from "../typechain-types";

describe("SyvoraTreasury", function () {
  let syvoraTreasury: SyvoraTreasury;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    // Get contract factory and signers
    const SyvoraTreasuryFactory = await ethers.getContractFactory("SyvoraTreasury");
    console.log(1);
     owner = (await ethers.getSigners())[0];
     user1 = (await ethers.getSigners())[1];
     user2 = (await ethers.getSigners())[2];

    // Deploy the upgradeable contract
    syvoraTreasury = (await upgrades.deployProxy(SyvoraTreasuryFactory, [], {
      initializer: "initialize",
    })) as SyvoraTreasury;

    await syvoraTreasury.deployed();
  });

  describe("Initialization", function () {
    it("should initialize correctly", async function () {
      expect(await syvoraTreasury.owner()).to.equal(owner.address);
    });
  });

  describe("Whitelisting", function () {
    it("should allow the owner to whitelist an account", async function () {
      await syvoraTreasury.updateWhitelistedAccount(user1.address, true);
      expect(await syvoraTreasury.isWhitelistedAccount(user1.address)).to.be.true;
    });

    it("should emit a WhitelistUpdated event", async function () {
      await expect(syvoraTreasury.updateWhitelistedAccount(user1.address, true))
        .emit(syvoraTreasury, "WhitelistUpdated")
        .withArgs(user1.address, true);
    });

    it("should revert if a non-owner tries to whitelist an account", async function () {
      await expect(
        syvoraTreasury.connect(user1).updateWhitelistedAccount(user2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Borrowing", function () {
    beforeEach(async function () {
      await syvoraTreasury.updateWhitelistedAccount(user1.address, true);
      await owner.sendTransaction({
        to: syvoraTreasury.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    it("should allow a whitelisted user to borrow 0.2 ETH", async function () {
      const initialBalance = await ethers.provider.getBalance(user1.address);

      await syvoraTreasury.connect(user1).borrowFaucet();
      const finalBalance = await ethers.provider.getBalance(user1.address);

      expect(finalBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther("0.2"));
    });

    it("should revert if a non-whitelisted user tries to borrow", async function () {
      await expect(syvoraTreasury.connect(user2).borrowFaucet()).to.be.revertedWith(
        "Not a whitelisted account"
      );
    });

    it("should revert if the contract balance is insufficient", async function () {
      await syvoraTreasury.withdraw(); // Reduce balance below 0.2 ETH
      await expect(syvoraTreasury.connect(user1).borrowFaucet()).to.be.revertedWith(
        "Insufficient balance"
      );
    });

    it("should enforce an 8-hour cooldown", async function () {
      await syvoraTreasury.connect(user1).borrowFaucet();
      await expect(syvoraTreasury.connect(user1).borrowFaucet()).to.be.revertedWith(
        "Wait 8 hours before borrowing again"
      );
    });
  });

  describe("Lending", function () {
    it("should allow users to lend Ether", async function () {
      const amount = ethers.utils.parseEther("1");
      await syvoraTreasury.connect(user1).lendFaucet(amount, { value: amount });
      expect(await syvoraTreasury.lenders(user1.address)).to.equal(amount);
    });

    it("should emit a Lended event", async function () {
      const amount = ethers.utils.parseEther("1");
      await expect(
        syvoraTreasury.connect(user1).lendFaucet(amount, { value: amount })
      )
        .to.emit(syvoraTreasury, "Lended")
        .withArgs(user1.address, amount);
    });

    it("should revert if the sent Ether does not match the specified amount", async function () {
      const amount = ethers.utils.parseEther("1");
      await expect(
        syvoraTreasury.connect(user1).lendFaucet(amount, { value: ethers.utils.parseEther("0.5") })
      ).to.be.revertedWith("Incorrect Ether sent");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await owner.sendTransaction({
        to: syvoraTreasury.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    it("should allow the owner to withdraw exactly 0.2 ETH", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);

      const tx = await syvoraTreasury.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(tx.gasPrice || 0);

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance.sub(initialBalance).add(gasUsed)).to.equal(ethers.utils.parseEther("0.2"));
    });

    it("should revert if the contract balance is less than 0.2 ETH", async function () {
      for (let i = 0; i < 50; i++) {
        await syvoraTreasury.withdraw(); // Repeatedly withdraw to exhaust balance
      }
      await expect(syvoraTreasury.withdraw()).to.be.revertedWith("Insufficient balance");
    });

    it("should emit a Withdrawn event", async function () {
      await expect(syvoraTreasury.withdraw())
        .to.emit(syvoraTreasury, "Withdrawn")
        .withArgs(owner.address, ethers.utils.parseEther("0.2"));
    });

    it("should revert if a non-owner tries to withdraw", async function () {
      await expect(syvoraTreasury.connect(user1).withdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });
});
