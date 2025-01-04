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

- **`isWhitelistedAccount`**: A mapping to indicate whether an account is whitelisted for borrowing.  
  *(Type: `mapping(address => bool)`)*


#### **Functionalities**
1. **`lendFaucet(amount)`**  
   Allows a user (`msg.sender`) to lend a specified `amount` of faucet to the `Syvora_Treasury`.

2. **`borrowFaucet(amount)`**  
   Enables a user (`msg.sender`) to borrow a specified `amount` faucet from the `Syvora_Treasury`.

3. **`updateWhitelistedAccount(account, bool)`**  
   Only whitelisted accounts are permitted to borrow tokens.  
   This function allows an admin/owner to approve or remove an account's whitelist status.

   https://sepolia.etherscan.io/address/0x37bDb8DD36F4750A8bfEC1925477d3c716a5781C : contract deployed

NEXT TASK: UI & proper source of faucet
---
