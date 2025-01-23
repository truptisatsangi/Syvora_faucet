// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

contract SyvoraTreasury is Initializable, Ownable2StepUpgradeable {
    mapping(address => uint256) public lenders;
    mapping(address => uint256) public borrowers;
    mapping(address => bool) public isWhitelistedAccount;
    mapping(address => uint256) public lastBorrowedTimestamp;

    event WhitelistUpdated(address indexed account, bool isWhitelisted);
    event Borrowed(address indexed borrower, uint256 amount);
    event Lended(address indexed lender, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    /// @notice Initializer function (replaces constructor)
    function initialize() external initializer {
        __Ownable2Step_init();
    }

    /// @notice Allows whitelisted users to borrow Ether from the contract
    function borrowFaucet(address account) external {
        uint256 amount = 0.2 ether;
        require(account.balance < 0.5 ether, "Already having sufficient funds");
        require(isWhitelistedAccount[account], "Not a whitelisted account");
        require(address(this).balance >= amount, "Insufficient balance");
        require(
            block.timestamp >= lastBorrowedTimestamp[account] + 8 hours,
            "Wait 8 hours before borrowing again"
        );

        (bool isSuccess, ) = account.call{value: amount}("");
        require(isSuccess, "Transfer failed");

        borrowers[account] += amount;
        lastBorrowedTimestamp[account] = block.timestamp; // Update borrow timestamp
        emit Borrowed(account, amount);
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
    function lendFaucet() external payable {
        require(msg.value > 0, "Incorrect Ether sent");
        lenders[msg.sender] += msg.value;
        emit Lended(msg.sender, msg.value);
    }

    /// @notice Allows the owner to withdraw Ether from the treasury
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");

        (bool isSuccess, ) = msg.sender.call{value: amount}("");
        require(isSuccess, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }
}
