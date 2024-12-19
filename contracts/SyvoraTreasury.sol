// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

contract SyvoraTreasury is Initializable, Ownable2StepUpgradeable {
    mapping(address => uint256) public lenders;
    mapping(address => uint256) public borrowers;
    mapping(address => bool) public isWhitelistedAccount;

    event WhitelistUpdated(address indexed account, bool isWhitelisted);
    event Borrowed(address indexed borrower, uint256 amount);

    /// @notice Initializer function (replaces constructor)
    function initialize() external initializer {
        __Ownable2Step_init();
    }

    /// @notice Allows whitelisted users to borrow Ether from the contract
    function borrowFaucet(uint256 amount) external {
        require(isWhitelistedAccount[msg.sender], "Not a whitelisted account");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool isSuccess, ) = msg.sender.call{value: amount}("");
        require(isSuccess, "Transfer failed");

        borrowers[msg.sender] += amount;
        emit Borrowed(msg.sender, amount);
    }

    /// @notice Updates the whitelist status of an account
    function updateWhitelistedAccount(
        address account,
        bool isWhitelisted
    ) external onlyOwner {
        isWhitelistedAccount[account] = isWhitelisted;
        emit WhitelistUpdated(account, isWhitelisted);
    }

    /// @notice Allows the contract to receive Ether
    receive() external payable {}

    /// @notice Allows lenders to deposit Ether into the treasury
    function lendFaucet(uint256 amount) external payable {
        require(msg.value == amount, "Incorrect Ether sent");
        lenders[msg.sender] += amount;
    }

    /// @notice Allows the owner to withdraw Ether from the treasury
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");

        (bool isSuccess, ) = msg.sender.call{value: amount}("");
        require(isSuccess, "Transfer failed");
    }
}
