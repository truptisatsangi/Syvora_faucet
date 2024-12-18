# Syvora Faucet

The Syvora Faucet is designed exclusively for the Syvora family. The primary objective of this project is to create a **"give and take"** ecosystem for testnet tokens.

## Contracts Overview

### **Syvora Treasury**
The `Syvora_Treasury` contract serves as the central treasury with functionalities to lend and borrow testnet tokens. Below are the key features and their functionalities:

#### **Data Structures**
- **`lenders`**: A mapping of user addresses to the amount of tokens they have lent to the treasury.  
  *(Type: `mapping(address => uint256)`)*

- **`borrowers`**: A mapping of user addresses to the amount of tokens they have borrowed from the treasury.  
  *(Type: `mapping(address => uint256)`)*

- **`isWhitelistedAccounts`**: A mapping to indicate whether an account is whitelisted for borrowing.  
  *(Type: `mapping(address => bool)`)*


#### **Functionalities**
1. **`lendTokens(tokenAddress, amount)`**  
   Allows a user (`msg.sender`) to lend a specified `amount` of tokens (`tokenAddress`) to the `Syvora_Treasury`.

2. **`borrowTokens(tokenAddress, amount)`**  
   Enables a user (`msg.sender`) to borrow a specified `amount` of tokens (`tokenAddress`) from the `Syvora_Treasury`.

3. **`setWhitelistAccounts(account, bool)`**  
   Only whitelisted accounts are permitted to borrow tokens.  
   This function allows an admin to approve or remove an account's whitelist status.

---
