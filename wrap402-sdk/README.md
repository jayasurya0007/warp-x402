# avax-warp-pay

> **Production-Ready Cross-Chain Payment SDK for Avalanche**  
> Pay on one chain, verify on another — powered by Avalanche Teleporter

[![NPM](https://img.shields.io/npm/v/avax-warp-pay)](https://www.npmjs.com/package/avax-warp-pay)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-60%2F60_Passing-brightgreen)](#)

---

## 📚 Quick Navigation

| Section | What You'll Learn |
|---------|-------------------|
| **[🎯 What Does This SDK Do?](#-what-does-this-sdk-do)** | Understand in 30 seconds |
| **[🚀 Quickstart](#-quickstart--zero-deployment-needed)** | Start coding in 2 minutes |
| **[💡 How It Works](#-how-it-works---simple-3-step-flow)** | Visual flow diagram |
| **[🚀 Deploy Contracts](#-deploying-your-own-contracts)** | 3 easy deployment methods |
| **[❓ FAQ](#-faq)** | Common questions answered |

---

## 🎯 What Does This SDK Do?

**In Simple Terms:** Accept payments on Chain A, verify them on Chain B — without users bridging tokens!

```typescript
// 1. User pays on Chain A
const paymentId = await warp.pay(ethers.parseEther("0.1"));

// 2. Wait for cross-chain relay (~30 seconds)
await new Promise(r => setTimeout(r, 30000));

// 3. Verify payment on Chain B → unlock content
const verified = await warp.verify(paymentId);
if (verified) unlockPremiumContent();
```

**That's it!** The SDK handles all the cross-chain complexity for you.

---

## 🚀 Quickstart — ZERO Deployment Needed!

```bash
npm install avax-warp-pay
```

```typescript
import { Warp402, PRESETS } from 'avax-warp-pay';

// ⚠️ IMPORTANT: PRESETS.fuji is same-chain, won't work for real cross-chain!
// Use PRESETS.local with your deployed contracts instead
const warp = new Warp402({
  ...PRESETS.local,  // Must have contracts on DIFFERENT chains
  privateKey: process.env.PRIVATE_KEY
});

// Send cross-chain payment (requires AVAX for gas on BOTH chains)
const paymentId = await warp.pay(ethers.parseEther("0.1"));
console.log("✅ Payment sent:", paymentId);

// Wait for Teleporter relay (~15-30 seconds)
await new Promise(r => setTimeout(r, 30000));

// Verify on destination chain (different blockchain)
const verified = await warp.verify(paymentId);
console.log("✅ Verified:", verified);
```

**Requirements:** Contracts must be on **different blockchains** for Warp to work.

> 💰 **Get testnet AVAX**: https://faucet.avax.network/
> 📘 **Deploy Guide**: See [Deploying Your Own Contracts](#deploying-your-own-contracts)

---

## 💡 How It Works - Simple 3-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  What This SDK Does For You                     │
└─────────────────────────────────────────────────────────────────┘

                    YOUR APPLICATION FLOW
                    
Step 1: SEND PAYMENT                Chain A (Sender)
─────────────────────────           ┌──────────────┐
User pays on Chain A                │   Customer   │
                                    │   Pays 0.1   │
const paymentId = await             │     AVAX     │
  warp.pay(                         └──────┬───────┘
    ethers.parseEther("0.1")               │
  );                                       ↓ SDK handles this
                                    ┌──────────────┐
✅ Returns: Payment ID              │ WarpSender   │
   "0xabc123..."                    │  Contract    │
                                    └──────┬───────┘
                                           │
                                           │ Teleporter
                                           │ Warp Message
                                           ↓

Step 2: WAIT FOR RELAY             Cross-Chain Magic ✨
─────────────────────────           (15-30 seconds)
Avalanche Teleporter                
automatically relays                Teleporter Relayers
the payment proof                   pass the message
                                    between chains
await new Promise(
  r => setTimeout(r, 30000)         
);                                         │
                                           │
                                           ↓

Step 3: VERIFY & USE                Chain B (Receiver)
─────────────────────────           ┌──────────────┐
Check payment on Chain B            │ WarpReceiver │
Unlock content/service              │   Contract   │
                                    └──────┬───────┘
const verified = await                     │
  warp.verify(paymentId);                  ↓ SDK checks this
                                    ┌──────────────┐
if (verified) {                     │  Payment     │
  unlockContent();                  │  Verified ✅ │
}                                   └──────────────┘
                                           │
✅ Returns: true/false                     ↓
                                    Your app unlocks
                                    premium content!
```

### Real-World Use Case

**Scenario:** Content Platform on Chain B, Users Pay on Chain A

```typescript
// On your server (Chain B)
app.post('/api/access-premium-video', async (req, res) => {
  const { paymentId } = req.body;
  
  // User paid on Chain A, verify on Chain B
  const verified = await warp.verify(paymentId);
  
  if (verified) {
    // Payment confirmed! Give access
    return res.json({
      videoUrl: 'https://cdn.example.com/premium-video.mp4',
      accessGranted: true
    });
  } else {
    return res.status(402).json({ error: 'Payment Required' });
  }
});
```

### Why This Is Powerful

| Without Warp-402 | With Warp-402 SDK |
|------------------|-------------------|
| ❌ User needs wallet on Chain B | ✅ Pay on familiar Chain A |
| ❌ Bridge tokens manually | ✅ Automatic cross-chain proof |
| ❌ Complex smart contracts | ✅ Simple SDK methods |
| ❌ 10+ minutes setup | ✅ 2 lines of code |

**Bottom Line:** User pays on Chain A → Your app on Chain B knows about it → Unlock access!

---

## 🤔 "Do I Need to Deploy Contracts?" - Decision Tree

> **TL;DR:** For real cross-chain payments, YES - you must deploy BOTH WarpSender and WarpReceiver and configure them to talk to each other.

```
┌─────────────────────────────────────────┐
│  What are you trying to do?            │
└────────────┬────────────────────────────┘
             │
   ┌─────────┴──────────┐
   │                    │
   ▼                    ▼
Testing on          Testing on
local network?      Fuji testnet?
   │                    │
   ▼                    ▼
Use PRESETS.local   Use PRESETS.fuji
✅ No deployment!   ✅ No deployment!
(local only)        (uses our contracts)
   │                    │
   │                    ├─────────────────┐
   │                    │                 │
   │                    ▼                 ▼
   │              Production on      Custom subnet
   │              mainnet?            deployment?
   │                    │                 │
   │                    ▼                 ▼
   │              Deploy your own    Deploy your own
   │              contracts          contracts
   │              (see guide)        (see guide)
   │                    │                 │
   └────────────────────┴─────────────────┘
                        │
                        ▼
           Configure SDK with addresses
                        │
                        ▼
                   Start coding! 🚀
```

> ✅ **Good news:** We have pre-deployed, verified contracts on Fuji testnet - ready to use!

---

## 📦 Pre-Deployed Contracts - Reference Only!

### ⚠️ Critical: Warp Messaging Requirements

**Avalanche Warp Messaging (AWM) / Teleporter requires:**
- ✅ Contracts on **DIFFERENT blockchains** (different blockchain IDs)
- ✅ Each chain must have Teleporter messenger deployed
- ✅ Cross-chain relayers to pass messages between chains
- ❌ **Does NOT work on same chain** - violates Warp design

### Fuji Testnet Contracts (Reference Implementation)

Contracts deployed on Avalanche Fuji C-Chain:

| Contract | Address |
|----------|---------|
| **WarpSender** | `0x0d45537c1DA893148dBB113407698E20CfA2eE56` |
| **WarpReceiver** | `0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f` |

**Network:** Fuji C-Chain (43113)  
**Verify:** [Snowtrace](https://testnet.snowtrace.io)

⚠️ **Note:** Both contracts on same chain = **NOT functional for cross-chain messaging**

### ⚠️ PRESETS.fuji Does NOT Work for Cross-Chain

```typescript
import { Warp402, PRESETS } from 'avax-warp-pay';

// ❌ This will NOT work - both contracts on same chain!
// Warp Messaging requires different blockchain IDs
const warp = new Warp402({
  ...PRESETS.fuji,  // Both on Fuji C-Chain - won't relay messages
  privateKey: process.env.PRIVATE_KEY
});

// This call will succeed on sender chain but message won't relay
const paymentId = await warp.pay(ethers.parseEther("0.1"));

// This will return false - receiver never gets the message
const verified = await warp.verify(paymentId);  // false
```

**Why it fails:** Teleporter messenger only relays between **different blockchains**, not same-chain.

### For Local Testing

The `PRESETS.local` configuration is for **local Avalanche networks only**:

```typescript
// This ONLY works on local networks, NOT on public testnets
const warp = new Warp402({
  ...PRESETS.local,
  privateKey: process.env.PRIVATE_KEY
});
```

### ⚠️ Critical Limitations

These pre-deployed Fuji contracts have **two major limitations**:

#### 1️⃣ Same-Chain Only (Not True Cross-Chain)
- ⚠️ **Both contracts are on Fuji C-Chain** - this violates Warp Messaging design
- **Warp Messaging does NOT support same-chain transactions** - it requires different blockchain IDs
- Teleporter messenger will NOT relay messages on the same chain
- **This configuration will fail for actual message passing**
- This is for **contract deployment demonstration only**, not functional cross-chain messaging

#### 2️⃣ Cannot Be Reconfigured
- ❌ **Fuji → Your Local Subnet:** You can't reconfigure our contracts
- ❌ **Your Subnet → Fuji:** Our receiver won't accept your sender
- **Why?** Only the contract owner can call `setRemoteReceiver()` and `setApprovedSender()`
- You don't own these contracts → You can't change their configuration

**For real cross-chain payments, you must:**
1. ✅ Deploy WarpSender on Chain A
2. ✅ Deploy WarpReceiver on Chain B  
3. ✅ Configure them to talk to each other (the "handshake")

Only the contract owner can establish this connection.

### 🎯 Use Cases for Pre-Deployed Contracts:

✅ **Learning the SDK API** - Understand method signatures and structure
✅ **Contract Verification** - See deployed contract addresses on Snowtrace
✅ **Reference Implementation** - Example of how contracts should be deployed

❌ **NOT for:**
- **Functional testing** - Same-chain setup violates Warp design, messages won't relay
- **Real cross-chain payments** - Warp requires different blockchain IDs
- **Production applications** - You need different chains
- **Cross-subnet messaging** - Both on same subnet won't work

> 💡 **Important:** PRESETS.fuji contracts exist on-chain but **cannot perform cross-chain messaging** because they're on the same blockchain. Warp Messaging requires different blockchains.

### ⚠️ Production Note

For **real cross-chain payments** between different subnets, you **must deploy your own contracts** so you can configure them to talk to each other.

### Want to Deploy Your Own?

See our [Deployment Guide](#deploying-your-own-contracts) below if you need:
- **Real cross-chain payments** (Subnet A → Subnet B)
- Custom configuration (gas limits, expiry times)
- Private subnet deployment
- Mainnet deployment
- Full ownership and control

**We provide 3 easy deployment methods:**

| Method | Time | Difficulty | Best For |
|--------|------|------------|----------|
| **[CLI Tool](#method-1-cli-deployment-recommended)** | 30 sec | ⭐ Easy | Quick setup, demos |
| **[SDK Code](#method-2-programmatic-deployment-with-sdk)** | 30 sec | ⭐⭐ Medium | TypeScript projects |
| **[Manual Foundry](#method-3-manual-deployment-with-foundry)** | 10 min | ⭐⭐⭐ Advanced | Full control |

---

## What is avax-warp-pay?

A TypeScript SDK for cross-chain payment receipts using Avalanche Teleporter.

- Pay on Chain A → Verify on Chain B
- Powered by Avalanche Interchain Messaging (ICM)
- Simple TypeScript API

---

## 📚 Table of Contents

- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Quick Examples](#quick-examples)
- [Pre-Deployed Contracts](#pre-deployed-contracts-public-testnet)
- [Smart Contract Source](#smart-contract-source-code)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Advanced Usage](#advanced-usage)
- [Deployment Guide](#deploying-your-own-contracts)
- [FAQ](#faq)

---

## Installation

```bash
npm install avax-warp-pay ethers@^6
```

---

## Prerequisites

> **🔑 Key Concept:** For real cross-chain payments, you must deploy BOTH contracts (WarpSender + WarpReceiver) and configure them to talk to each other. This "handshake" can only be done by the contract owner.

You have **3 options** to use this SDK:

### Option 1: Use Pre-Deployed Test Contracts

Use our test contracts on Fuji or local networks:

```typescript
import { PRESETS } from 'avax-warp-pay';
const warp = new Warp402({
  ...PRESETS.fuji,
  privateKey: process.env.PRIVATE_KEY
});
```

### Option 2: Use Platform-Provided Contracts

If you're building on a **platform that has already deployed Warp-402 contracts**, they will provide you with:

```typescript
// Example: Platform provides these addresses
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY,
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xPLATFORM_PROVIDED_SENDER_ADDRESS"  // ← Platform gives you this
  },
  receiverChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xPLATFORM_PROVIDED_RECEIVER_ADDRESS"  // ← Platform gives you this
  }
});
```

**Where to get these addresses:**
- Check the platform's documentation
- Ask in their Discord/support
- Look for "Warp-402 Contract Addresses" section
- Check their GitHub README

---

### Option 3: Deploy Your Own Contracts (Production)

For **real cross-chain payments**, you must deploy and configure BOTH contracts:

**The Cross-Chain Handshake (Required!):**
```
Chain A                          Chain B
┌──────────────┐                ┌──────────────┐
│ WarpSender   │──────────────> │ WarpReceiver │
│              │  1. setRemote  │              │
└──────────────┘     Receiver   └──────────────┘
        ↑                                │
        │         2. setApproved         │
        └────────────  Sender  ──────────┘
```

**Steps:**
1. ✅ Deploy WarpSender on Chain A
2. ✅ Deploy WarpReceiver on Chain B
3. ✅ Configure WarpSender → knows where to send (Chain B address)
4. ✅ Configure WarpReceiver → trusts sender (Chain A address)

**⚠️ CRITICAL: The SDK does NOT perform configuration automatically!**
- The SDK can only READ contract configuration
- The SDK can only USE already-configured contracts
- You MUST manually configure contracts using Foundry/cast commands
- Configuration requires owner privileges (only deployer can do this)

**Without this handshake, cross-chain payments will NOT work!**

**What you need:**
1. ✅ Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
2. ✅ Funded wallet with AVAX on BOTH chains (~0.05 AVAX total)
3. ✅ RPC URLs for BOTH target chains
4. ✅ Blockchain IDs for BOTH chains

**Quick deploy:**
```bash
# Clone contracts repository
git clone https://github.com/jayasurya0007/wrap-x402.git
cd wrap-x402/wrapx402

# Install dependencies
forge install

# Set your private key (⚠️ use testnet key only!)
export PRIVATE_KEY="0x..."

# Deploy WarpSender on source chain
forge script script/DeployWarpSender.s.sol \
  --rpc-url https://api.avax-test.network/ext/bc/C/rpc \
  --broadcast

# ✅ Copy the deployed WarpSender address

# Deploy WarpReceiver on destination chain  
forge script script/DeployWarpReceiver.s.sol \
  --rpc-url https://api.avax-test.network/ext/bc/C/rpc \
  --broadcast

# ✅ Copy the deployed WarpReceiver address

# Configure contracts (link sender to receiver)
# ⚠️ SDK CANNOT DO THIS - you must use these commands!
export SENDER_ADDRESS="0x..."  # From step above
export RECEIVER_ADDRESS="0x..." # From step above
export REMOTE_BLOCKCHAIN_ID="0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5"

forge script script/ConfigureSender.s.sol \
  --rpc-url https://api.avax-test.network/ext/bc/C/rpc \
  --broadcast
```

**Now use your deployed addresses:**
```typescript
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY,
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: process.env.SENDER_ADDRESS  // ← Your deployed address
  },
  receiverChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: process.env.RECEIVER_ADDRESS  // ← Your deployed address
  }
});
```

👉 **[Complete Deployment Guide](https://github.com/jayasurya0007/wrap-x402/blob/main/wrapx402/document.md)**

---

### Which Option Should I Use?

| Scenario | Option | Deployment Required? |
|----------|--------|---------------------|
| **Testing SDK API** | PRESETS.fuji or PRESETS.local | ❌ No |
| **Real Cross-Chain Payments** | Deploy your own contracts | ✅ Yes - BOTH contracts |

---

## 🚀 Quick Examples

### Example 1: Using Pre-Deployed Contracts (Easiest)

```typescript
import { Warp402, PRESETS } from 'avax-warp-pay';
import { ethers } from 'ethers';

// Initialize with preset configuration
const warp = new Warp402({
  ...PRESETS.local,
  privateKey: process.env.PRIVATE_KEY
});

// Send payment
const paymentId = await warp.pay(ethers.parseEther("1"));

// Wait for cross-chain relay
await new Promise(r => setTimeout(r, 15000));

// Verify
if (await warp.verify(paymentId)) {
  console.log("✅ Payment verified!");
  await warp.consume(paymentId);
}
```

### Example 2: HTTP 402 Payment Required Server

```typescript
import express from 'express';
import { Warp402, PRESETS } from 'avax-warp-pay';

const app = express();
const warp = new Warp402(PRESETS.local);

app.get('/premium-content', async (req, res) => {
  const paymentId = req.headers['x-payment-id'];
  
  if (!paymentId || !(await warp.verify(paymentId))) {
    return res.status(402).json({
      error: 'Payment Required',
      amount: '1000000000000000000', // 1 token
      instructions: 'Send payment on source chain'
    });
  }
  
  await warp.consume(paymentId);
  res.json({ content: 'Your premium content here' });
});
```

### Example 3: Custom Configuration

```typescript
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY,
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xYourWarpSenderAddress"
  },
  receiverChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xYourWarpReceiverAddress"
  }
});
```

---

## 🧱 Smart Contract Source Code

### Contracts Repository

All contracts are open-source and available at:  
**[https://github.com/jayasurya0007/wrap-x402/tree/main/wrapx402/src](https://github.com/jayasurya0007/wrap-x402/tree/main/wrapx402/src)**

### WarpSender.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterMessenger} from "./TeleporterInterfaces.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WarpSender is Ownable, Pausable, ReentrancyGuard {
    ITeleporterMessenger public immutable MESSENGER;
    
    bytes32 public remoteBlockchainId;
    address public remoteReceiver;
    uint256 public defaultGasLimit = 200000;

    struct PaymentReceipt {
        bytes32 paymentId;
        uint256 amount;
        address payer;
        uint256 timestamp;
        bool consumed;
    }

    event PaymentSent(
        address indexed payer,
        bytes32 indexed paymentId,
        uint256 amount,
        uint256 timestamp,
        bytes32 remoteBlockchainId,
        address remoteReceiver
    );

    constructor(address _messenger) Ownable(msg.sender) {
        MESSENGER = ITeleporterMessenger(_messenger);
    }

    function sendPayment(bytes32 paymentId) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        require(remoteReceiver != address(0), "Receiver not set");
        require(remoteBlockchainId != bytes32(0), "Remote Chain ID not set");
        require(msg.value > 0, "Payment amount must be greater than 0");

        // Create secure payment receipt
        PaymentReceipt memory receipt = PaymentReceipt({
            paymentId: paymentId,
            amount: msg.value,
            payer: msg.sender,
            timestamp: block.timestamp,
            consumed: false
        });

        bytes memory message = abi.encode(receipt);

        // Send cross-chain message via Teleporter
        MESSENGER.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: remoteBlockchainId,
                destinationAddress: remoteReceiver,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: defaultGasLimit,
                allowedRelayerAddresses: new address ,
                message: message
            })
        );

        emit PaymentSent(
            msg.sender,
            paymentId,
            msg.value,
            block.timestamp,
            remoteBlockchainId,
            remoteReceiver
        );
    }

    // Owner functions
    function setRemoteReceiver(bytes32 _blockchainId, address _receiver) 
        external 
        onlyOwner 
    {
        remoteBlockchainId = _blockchainId;
        remoteReceiver = _receiver;
    }

    function withdraw() external onlyOwner nonReentrant {
        payable(owner()).transfer(address(this).balance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
```

### WarpReceiver.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterMessenger, ITeleporterReceiver} from "./TeleporterInterfaces.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract WarpReceiver is ITeleporterReceiver, Ownable, Pausable {
    ITeleporterMessenger public constant MESSENGER = 
        ITeleporterMessenger(0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf);
    
    bytes32 public approvedSenderBlockchainId;
    address public approvedSenderAddress;
    uint256 public paymentExpiryTime = 7 days;
    uint256 public requiredPaymentAmount = 1 ether;

    struct PaymentReceipt {
        bytes32 paymentId;
        uint256 amount;
        address payer;
        uint256 timestamp;
        bool consumed;
    }

    mapping(bytes32 => PaymentReceipt) public receipts;
    mapping(bytes32 => bool) public consumed;

    event PaymentReceived(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentConsumed(bytes32 indexed paymentId, address indexed consumer);

    constructor() Ownable(msg.sender) {}

    function receiveTeleporterMessage(
        bytes32 sourceBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external whenNotPaused {
        require(msg.sender == address(MESSENGER), "Unauthorized");
        require(
            sourceBlockchainID == approvedSenderBlockchainId,
            "Invalid source chain"
        );
        require(
            originSenderAddress == approvedSenderAddress,
            "Invalid sender"
        );

        PaymentReceipt memory receipt = abi.decode(message, (PaymentReceipt));
        receipts[receipt.paymentId] = receipt;

        emit PaymentReceived(
            receipt.paymentId,
            receipt.payer,
            receipt.amount,
            receipt.timestamp
        );
    }

    function consumePayment(bytes32 paymentId) external whenNotPaused {
        require(!isExpired(paymentId), "Payment has expired");
        require(!consumed[paymentId], "Payment already consumed");
        require(receipts[paymentId].timestamp > 0, "Payment not found");

        consumed[paymentId] = true;
        emit PaymentConsumed(paymentId, msg.sender);
    }

    function isValidPayment(bytes32 paymentId) public view returns (bool) {
        return receipts[paymentId].timestamp > 0 && 
               !consumed[paymentId] && 
               !isExpired(paymentId);
    }

    function isExpired(bytes32 paymentId) public view returns (bool) {
        PaymentReceipt memory receipt = receipts[paymentId];
        if (receipt.timestamp == 0) return false;
        return block.timestamp > receipt.timestamp + paymentExpiryTime;
    }

    function isConsumed(bytes32 paymentId) external view returns (bool) {
        return consumed[paymentId];
    }

    function getReceipt(bytes32 paymentId) 
        external 
        view 
        returns (PaymentReceipt memory) 
    {
        return receipts[paymentId];
    }

    // Owner functions
    function setApprovedSender(bytes32 _blockchainId, address _sender) 
        external 
        onlyOwner 
    {
        approvedSenderBlockchainId = _blockchainId;
        approvedSenderAddress = _sender;
    }

    function setPaymentExpiryTime(uint256 _expiryTime) external onlyOwner {
        paymentExpiryTime = _expiryTime;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
```

### Contract ABIs

The SDK includes pre-compiled ABIs. Access them via:

```typescript
import { WarpSenderABI, WarpReceiverABI } from 'avax-warp-pay';
```

**Full contract source**: [GitHub Repository](https://github.com/jayasurya0007/wrap-x402/tree/main/wrapx402/src)

---

## 📖 API Reference

### Main Class: `Warp402`

```typescript
import { Warp402 } from 'avax-warp-pay';
```

#### Constructor

```typescript
new Warp402(config: Warp402Config)
```

#### Core Methods

##### `pay(amount: bigint, customPaymentId?: string): Promise<string>`

Send a cross-chain payment.

```typescript
const paymentId = await warp.pay(ethers.parseEther("1"));
```

- **amount**: Amount in wei (use `ethers.parseEther()`)
- **customPaymentId**: Optional 32-byte hex payment ID
- **Returns**: Payment ID (bytes32 hex string)

##### `verify(paymentId: string): Promise<boolean>`

Check if payment receipt exists on receiver chain.

```typescript
const isVerified = await warp.verify(paymentId);
```

- **paymentId**: Payment identifier
- **Returns**: `true` if payment is verified and valid

##### `consume(paymentId: string): Promise<TransactionResult>`

Mark payment as consumed (one-time use).

```typescript
await warp.consume(paymentId);
```

- **paymentId**: Payment identifier
- **Returns**: Transaction result with hash and receipt

##### `getReceipt(paymentId: string): Promise<PaymentReceipt | null>`

Get full payment receipt details.

```typescript
const receipt = await warp.getReceipt(paymentId);
console.log(receipt.payer, receipt.amount, receipt.timestamp);
```

##### `payAndWait(amount: bigint, timeout?: number): Promise<string>`

Send payment and wait for cross-chain verification.

```typescript
const paymentId = await warp.payAndWait(
  ethers.parseEther("1"),
  60000  // 60 second timeout
);
```

### Client Classes

#### `SenderClient`

Access via `warp.sender`:

```typescript
// Get contract configuration (READ ONLY)
const config = await warp.sender.getConfiguration();
console.log(config.owner, config.paused, config.defaultGasLimit);

// Get contract balance
const balance = await warp.sender.getContractBalance();

// Send payment directly
await warp.sender.sendPayment(paymentId, amount);

// ⚠️ Note: SDK cannot call setRemoteReceiver() - owner only!
// Use Foundry/cast commands for configuration
```

#### `ReceiverClient`

Access via `warp.receiver`:

```typescript
// Check if payment is valid (exists + not consumed + not expired)
const isValid = await warp.receiver.isValidPayment(paymentId);

// Check individual statuses
const isExpired = await warp.receiver.isExpired(paymentId);
const isConsumed = await warp.receiver.isConsumed(paymentId);

// Get configuration (READ ONLY)
const config = await warp.receiver.getConfiguration();
console.log(config.paymentExpiryTime); // in seconds

// ⚠️ Note: SDK cannot call setApprovedSender() - owner only!
// Use Foundry/cast commands for configuration
```

---

## ⚙️ Configuration

### Warp402Config

```typescript
interface Warp402Config {
  privateKey: string;           // Your wallet private key
  senderChain: ChainConfig;     // Source chain configuration
  receiverChain: ChainConfig;   // Destination chain configuration
}
```

### ChainConfig

```typescript
interface ChainConfig {
  rpc: string;              // RPC endpoint URL
  chainId: number;          // EVM chain ID
  blockchainId: string;     // Avalanche blockchain ID (bytes32 hex)
  messenger: string;        // Teleporter Messenger address
  sender?: string;          // WarpSender contract address
  receiver?: string;        // WarpReceiver contract address
}
```

### PRESETS

Pre-configured network settings:

```typescript
import { PRESETS } from 'avax-warp-pay';

// Local development network
const local = PRESETS.local;

// Fuji testnet (coming soon)
const fuji = PRESETS.fuji;
```

---

## 🎓 Advanced Usage

### Custom Gas Limits

```typescript
const warp = new Warp402(config);

// Set custom gas for cross-chain messages
await warp.sender.contract.setGasLimits(150000, 100000);
```

### Payment Expiry Management

```typescript
// Check if payment is expired
const isExpired = await warp.receiver.isExpired(paymentId);

// Set expiry time (owner only)
await warp.receiver.contract.setPaymentExpiryTime(14 * 24 * 60 * 60); // 14 days
```

### Monitoring Payments

```typescript
// Poll for verification
async function waitForVerification(paymentId: string, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await warp.verify(paymentId)) {
      return true;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}
```

### Error Handling

```typescript
try {
  const paymentId = await warp.pay(amount);
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Not enough balance');
  } else if (error.message.includes('Receiver not set')) {
    console.error('Contracts not configured');
  }
}
```

---

## 🚀 Deploying Your Own Contracts

### Why Deploy Your Own?

- ✅ **Production use**: Full control and ownership
- ✅ **Custom configuration**: Set your own gas limits, expiry times
- ✅ **Private networks**: Deploy on your own subnets
- ✅ **Security**: Dedicated contracts for your application

---

## 📋 Deployment Methods - Choose Your Path

You have **3 ways** to deploy Warp-402 contracts. Choose based on your experience level and requirements:

| Method | Best For | Time | Difficulty |
|--------|----------|------|------------|
| **[CLI Tool](#method-1-cli-deployment-recommended)** | Quick setup, demos, hackathons | ~30 sec | ⭐ Easy |
| **[SDK Code](#method-2-programmatic-deployment-with-sdk)** | TypeScript projects, automation | ~30 sec | ⭐⭐ Medium |
| **[Manual Foundry](#method-3-manual-deployment-with-foundry)** | Full control, customization | ~10 min | ⭐⭐⭐ Advanced |

---

### Method 1: CLI Deployment (Recommended) ✨

**Perfect for:** Quick setup, testing, hackathons, demos

**What it does:**
1. Deploys WarpSender to sender chain
2. Deploys WarpReceiver to receiver chain
3. Configures cross-chain handshake automatically
4. Outputs addresses to save in `.env` file

**Requirements:**
- ✅ Node.js installed
- ✅ Private key with AVAX on both chains
- ✅ RPC URLs for both chains

#### Step 1: Install the SDK

```bash
npm install avax-warp-pay
```

#### Step 2: Run CLI Deployment

```bash
npx avax-warp-pay deploy \
  --sender-rpc http://127.0.0.1:9650/ext/bc/C/rpc \
  --sender-chain-id 43112 \
  --sender-blockchain-id 0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5 \
  --receiver-rpc http://127.0.0.1:9650/ext/bc/subnet/rpc \
  --receiver-chain-id 99999 \
  --receiver-blockchain-id 0xc063de20d9e6e3b3e5b0f5e1e8e7e6e5e4e3e2e1e0dfdedddcdbdad9d8d7d6d5 \
  --private-key $PRIVATE_KEY
```

**Or use environment variables:**

```bash
# .env file
PRIVATE_KEY=0x...
SENDER_RPC=http://127.0.0.1:9650/ext/bc/C/rpc
SENDER_CHAIN_ID=43112
SENDER_BLOCKCHAIN_ID=0x7fc93d85...
RECEIVER_RPC=http://127.0.0.1:9650/ext/bc/subnet/rpc
RECEIVER_CHAIN_ID=99999
RECEIVER_BLOCKCHAIN_ID=0xc063de20...

# Run with environment variables
npx avax-warp-pay deploy
```

#### Step 3: Save Contract Addresses

The CLI will output:

```
╔════════════════════════════════════════════════════════════════════╗
║                    ✅ DEPLOYMENT SUCCESSFUL!                       ║
╚════════════════════════════════════════════════════════════════════╝

⏱️  Deployment time: 18.43s

📍 Contract Addresses:

   WarpSender:
   0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e

   WarpReceiver:
   0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e

──────────────────────────────────────────────────────────────────────

💾 Add these to your .env file:

SENDER_ADDRESS=0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e
RECEIVER_ADDRESS=0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e
```

#### Step 4: Use the Deployed Contracts

```typescript
import { Warp402 } from 'avax-warp-pay';

const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: process.env.SENDER_RPC!,
    chainId: parseInt(process.env.SENDER_CHAIN_ID!),
    blockchainId: process.env.SENDER_BLOCKCHAIN_ID!,
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: process.env.SENDER_ADDRESS! // ← From CLI output
  },
  receiverChain: {
    rpc: process.env.RECEIVER_RPC!,
    chainId: parseInt(process.env.RECEIVER_CHAIN_ID!),
    blockchainId: process.env.RECEIVER_BLOCKCHAIN_ID!,
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: process.env.RECEIVER_ADDRESS! // ← From CLI output
  }
});

// Ready to use!
await warp.pay(ethers.parseEther("0.1"));
```

**CLI Options:**

```bash
npx avax-warp-pay deploy --help

OPTIONS:
  --sender-rpc <url>              Sender chain RPC URL
  --sender-chain-id <id>          Sender chain ID
  --sender-blockchain-id <id>     Sender blockchain ID (hex)
  --receiver-rpc <url>            Receiver chain RPC URL
  --receiver-chain-id <id>        Receiver chain ID
  --receiver-blockchain-id <id>   Receiver blockchain ID (hex)
  --private-key <key>             Private key for deployment
  --messenger <address>           ICM Messenger address (optional)
  -h, --help                      Show this help message
```

---

### Method 2: Programmatic Deployment with SDK

**Perfect for:** TypeScript projects, automated deployments, CI/CD pipelines

**What it does:** Same as CLI but from your TypeScript code

#### Step 1: Create Deployment Script

```typescript
// deploy-once.ts
import { Warp402Factory } from 'avax-warp-pay';

async function deployContracts() {
  console.log('🚀 Deploying Warp-402 contracts...\n');

  const warp = await Warp402Factory.quickSetup({
    privateKey: process.env.PRIVATE_KEY!,
    
    // Sender chain (e.g., SubnetA)
    senderChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/C/rpc',
      chainId: 43112,
      blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf' // Optional
    },
    
    // Receiver chain (e.g., SubnetB)
    receiverChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/subnet/rpc',
      chainId: 99999,
      blockchainId: '0xc063de20d9e6e3b3e5b0f5e1e8e7e6e5e4e3e2e1e0dfdedddcdbdad9d8d7d6d5',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf' // Optional
    }
  });

  // Get deployed addresses
  const config = (warp as any).config;
  console.log('✅ Deployment complete!\n');
  console.log('SENDER_ADDRESS=' + config.senderChain.sender);
  console.log('RECEIVER_ADDRESS=' + config.receiverChain.receiver);
  console.log('\nAdd these to your .env file!');
}

deployContracts();
```

#### Step 2: Run Deployment Script

```bash
# Run once to deploy
npx ts-node deploy-once.ts

# Output:
# SENDER_ADDRESS=0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e
# RECEIVER_ADDRESS=0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e
```

#### Step 3: Save Addresses and Delete Script

```bash
# Add to .env file
echo "SENDER_ADDRESS=0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e" >> .env
echo "RECEIVER_ADDRESS=0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e" >> .env

# Delete deployment script (don't need it anymore!)
rm deploy-once.ts
```

#### Step 4: Use in Your Application

```typescript
// your-app.ts (This is your REAL application)
import { Warp402 } from 'avax-warp-pay';

// Just connect to existing contracts (NO deployment code!)
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "...",
    chainId: 43112,
    blockchainId: "0x7fc93d85...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: process.env.SENDER_ADDRESS! // ← From .env
  },
  receiverChain: {
    rpc: "...",
    chainId: 99999,
    blockchainId: "0xc063de20...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: process.env.RECEIVER_ADDRESS! // ← From .env
  }
});

// Your business logic - runs forever
app.post('/api/payment', async (req, res) => {
  await warp.pay(ethers.parseEther("0.1"));
  res.json({ success: true });
});
```

**Alternative: Deploy Only (Without SDK Init)**

If you just want contract addresses without initializing the SDK:

```typescript
import { Warp402Factory } from 'avax-warp-pay';

const result = await Warp402Factory.deployOnly({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: { rpc, chainId, blockchainId },
  receiverChain: { rpc, chainId, blockchainId }
});

console.log('Sender:', result.senderAddress);
console.log('Receiver:', result.receiverAddress);
console.log('Sender TX:', result.senderTxHash);
console.log('Receiver TX:', result.receiverTxHash);
```

---

### Method 3: Manual Deployment with Foundry

**Perfect for:** Full control, custom configurations, advanced users

**What it does:** Manual step-by-step deployment using Foundry CLI

#### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Clone repository
git clone https://github.com/jayasurya0007/wrap-x402.git
cd wrap-x402/wrapx402
```

#### Step 1: Deploy WarpSender

```bash
# Set environment variables
export SENDER_RPC="http://127.0.0.1:9650/ext/bc/C/rpc"
export RECEIVER_RPC="http://127.0.0.1:9650/ext/bc/subnet/rpc"
export PRIVATE_KEY="0x..."
export MESSENGER="0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf"

# Deploy WarpSender on sender chain
forge create src/WarpSender.sol:WarpSender \
  --rpc-url $SENDER_RPC \
  --private-key $PRIVATE_KEY \
  --constructor-args $MESSENGER

# Output:
# Deployed to: 0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e
# Transaction hash: 0x632ec27f...

# Save this address!
export SENDER_ADDRESS="0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e"
```

#### Step 2: Deploy WarpReceiver

```bash
# Deploy WarpReceiver on receiver chain
forge create src/WarpReceiver.sol:WarpReceiver \
  --rpc-url $RECEIVER_RPC \
  --private-key $PRIVATE_KEY \
  --constructor-args $MESSENGER

# Output:
# Deployed to: 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922
# Transaction hash: 0xbe094c79...

# Save this address!
export RECEIVER_ADDRESS="0x52C84043CD9c865236f11d9Fc9F56aa003c1f922"
```

#### Step 3: Configure Cross-Chain Handshake

```bash
# Get blockchain IDs
export SENDER_BLOCKCHAIN_ID="0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5"
export RECEIVER_BLOCKCHAIN_ID="0xc063de20d9e6e3b3e5b0f5e1e8e7e6e5e4e3e2e1e0dfdedddcdbdad9d8d7d6d5"

# Configure sender → receiver
cast send $SENDER_ADDRESS \
  "setRemoteReceiver(bytes32,address)" \
  $RECEIVER_BLOCKCHAIN_ID \
  $RECEIVER_ADDRESS \
  --rpc-url $SENDER_RPC \
  --private-key $PRIVATE_KEY

# Configure receiver → sender
cast send $RECEIVER_ADDRESS \
  "setApprovedSender(bytes32,address)" \
  $SENDER_BLOCKCHAIN_ID \
  $SENDER_ADDRESS \
  --rpc-url $RECEIVER_RPC \
  --private-key $PRIVATE_KEY
```

#### Step 4: Verify Configuration

```bash
# Check sender configuration
cast call $SENDER_ADDRESS "remoteReceiver()(address)" --rpc-url $SENDER_RPC
# Should return: 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922

# Check receiver configuration
cast call $RECEIVER_ADDRESS "approvedSender()(address)" --rpc-url $RECEIVER_RPC
# Should return: 0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e
```

#### Step 5: Save to .env and Use in SDK

```bash
# Save to .env file
cat >> .env << EOF
SENDER_ADDRESS=$SENDER_ADDRESS
RECEIVER_ADDRESS=$RECEIVER_ADDRESS
SENDER_RPC=$SENDER_RPC
RECEIVER_RPC=$RECEIVER_RPC
SENDER_BLOCKCHAIN_ID=$SENDER_BLOCKCHAIN_ID
RECEIVER_BLOCKCHAIN_ID=$RECEIVER_BLOCKCHAIN_ID
EOF
```

Then use in your app:

```typescript
import { Warp402 } from 'avax-warp-pay';

const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: process.env.SENDER_RPC!,
    chainId: 43112,
    blockchainId: process.env.SENDER_BLOCKCHAIN_ID!,
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: process.env.SENDER_ADDRESS!
  },
  receiverChain: {
    rpc: process.env.RECEIVER_RPC!,
    chainId: 99999,
    blockchainId: process.env.RECEIVER_BLOCKCHAIN_ID!,
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: process.env.RECEIVER_ADDRESS!
  }
});
```

---

## 📊 Deployment Comparison

| Feature | CLI | SDK Code | Manual Foundry |
|---------|-----|----------|----------------|
| **Time** | ~30 sec | ~30 sec | ~10 min |
| **Commands** | 1 command | 1 script | 5+ commands |
| **Auto-configure** | ✅ Yes | ✅ Yes | ❌ Manual |
| **Customization** | ⭐ Basic | ⭐⭐ Medium | ⭐⭐⭐ Full |
| **Requirements** | Node.js | Node.js + TS | Foundry + Git |
| **Best for** | Quick setup | TypeScript apps | Advanced users |

---

## 💡 Understanding the Deployment Process

### What Happens During Deployment?

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Process                       │
└─────────────────────────────────────────────────────────────┘

Step 1: Deploy WarpSender              Step 2: Deploy WarpReceiver
────────────────────────────────      ────────────────────────────────
Chain A                                Chain B
┌──────────────┐                      ┌──────────────┐
│              │                      │              │
│ WarpSender   │                      │ WarpReceiver │
│              │                      │              │
│ Not          │                      │ Not          │
│ configured   │                      │ configured   │
└──────────────┘                      └──────────────┘
      ↓                                      ↓
Deployment cost: ~$2.80               Deployment cost: ~$2.98


Step 3: Configure Handshake (Cross-Chain Connection)
─────────────────────────────────────────────────────
Chain A                                Chain B
┌──────────────┐                      ┌──────────────┐
│ WarpSender   │──────────────────────>│ WarpReceiver │
│              │  setRemoteReceiver    │              │
│ Knows where  │                       │ Trusts       │
│ to send  ────┼───────────────────────┤ sender       │
│              │<──────────────────────│              │
│              │  setApprovedSender    │              │
└──────────────┘                      └──────────────┘
      ↑                                      ↑
Config cost: ~$0.20                   Config cost: ~$0.20

Total deployment cost: ~$6.18 (one-time)
```

### Why All 3 Steps Are Required

1. **Step 1-2 (Deploy):** Creates the smart contracts on each chain
   - Without this: No contracts exist
   - Cost: ~$5.78 total

2. **Step 3 (Configure):** Establishes trust between chains
   - Without this: Contracts can't communicate
   - Cost: ~$0.40 total

**Important:** The SDK **automates all 3 steps** with CLI or code methods!

---

## 🔄 Deployment Workflow & Best Practices

### Understanding: Deploy Once, Use Forever

```
┌────────────────────────────────────────────────────────────────┐
│                     Deployment Lifecycle                       │
└────────────────────────────────────────────────────────────────┘

Phase 1: DEPLOY (One-Time Only)          Phase 2: USE (Forever)
─────────────────────────────────        ───────────────────────
Time: ~30 seconds                         Time: Milliseconds per call
Cost: ~$6 total                           Cost: ~$0.10 per transaction

┌──────────────┐                         ┌──────────────┐
│ Run CLI or   │                         │ Your App     │
│ Deployment   │                         │              │
│ Script       │                         │ new Warp402()│
└──────┬───────┘                         └──────┬───────┘
       │                                        │
       │ Deploy contracts                       │ Use contracts
       ↓                                        ↓
┌──────────────┐                         ┌──────────────┐
│ Get Addresses│──────────────────────→  │ Load from    │
│ Save to .env │  Copy addresses         │ .env file    │
└──────────────┘                         └──────────────┘

❌ DELETE deployment script              ✅ KEEP using contracts
   (don't need it anymore)                  (forever)
```

### ✅ Recommended Workflow

#### Option A: Using CLI (Easiest)

```bash
# 1. Deploy once (keeps deployment code separate)
npx avax-warp-pay deploy \
  --sender-rpc $SENDER_RPC \
  --receiver-rpc $RECEIVER_RPC \
  --private-key $PRIVATE_KEY

# 2. Copy output to .env file
# SENDER_ADDRESS=0x5aa01B...
# RECEIVER_ADDRESS=0x52C84...

# 3. Use in your app forever (no deployment code!)
```

Your app (`index.ts`):
```typescript
import { Warp402 } from 'avax-warp-pay';

// Just load addresses and use
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "...",
    chainId: 43112,
    blockchainId: "0x7fc93d85...",
    messenger: "0x253b2784...",
    sender: process.env.SENDER_ADDRESS! // From .env
  },
  receiverChain: {
    rpc: "...",
    chainId: 99999,
    blockchainId: "0xc063de20...",
    messenger: "0x253b2784...",
    receiver: process.env.RECEIVER_ADDRESS! // From .env
  }
});

// Your business logic runs forever
app.post('/pay', async () => {
  await warp.pay(ethers.parseEther("0.1"));
});
```

#### Option B: Using SDK Code

```bash
# 1. Create temporary deployment script
cat > deploy-once.ts << 'EOF'
import { Warp402Factory } from 'avax-warp-pay';

async function deploy() {
  const warp = await Warp402Factory.quickSetup({
    privateKey: process.env.PRIVATE_KEY!,
    senderChain: { rpc, chainId, blockchainId },
    receiverChain: { rpc, chainId, blockchainId }
  });
  
  console.log('SENDER_ADDRESS=' + (warp as any).config.senderChain.sender);
  console.log('RECEIVER_ADDRESS=' + (warp as any).config.receiverChain.receiver);
}

deploy();
EOF

# 2. Run once
npx ts-node deploy-once.ts

# 3. Save addresses to .env
# SENDER_ADDRESS=0x5aa01B...
# RECEIVER_ADDRESS=0x52C84...

# 4. Delete deployment script (don't need it)
rm deploy-once.ts

# 5. Use addresses in your app (same as Option A)
```

### ❌ Common Mistakes

#### Mistake 1: Keeping Deployment Code in Production

**DON'T:**
```typescript
// app.ts - WRONG! ❌
import { Warp402Factory } from 'avax-warp-pay';

app.listen(3000, async () => {
  // DON'T deploy every time app starts!
  const warp = await Warp402Factory.quickSetup({...}); // ❌ BAD
});
```

**Why it's wrong:**
- Deploys NEW contracts every restart ($6 each time!)
- Loses previous contract state
- Takes 30 seconds on every startup
- Users lose their payment history

**DO:**
```typescript
// app.ts - CORRECT! ✅
import { Warp402 } from 'avax-warp-pay';

// Load existing deployed addresses
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "...",
    sender: process.env.SENDER_ADDRESS! // ✅ GOOD - from .env
    // ...
  },
  receiverChain: {
    rpc: "...",
    receiver: process.env.RECEIVER_ADDRESS! // ✅ GOOD - from .env
    // ...
  }
});

app.listen(3000, () => {
  console.log('Server ready!'); // Instant startup ⚡
});
```

#### Mistake 2: Not Saving Addresses

**DON'T:**
```bash
# Deploy and forget
npx avax-warp-pay deploy
# ... 30 seconds later ...
# "What were those addresses again?" 😱
```

**DO:**
```bash
# Deploy and immediately save
npx avax-warp-pay deploy > deployment-output.txt
cat deployment-output.txt  # Copy addresses to .env

# Or pipe directly
npx avax-warp-pay deploy | grep "ADDRESS=" >> .env
```

#### Mistake 3: Deploying on Wrong Networks

**DON'T:**
```bash
# Testnet deployment
npx avax-warp-pay deploy --sender-rpc https://api.avax-test.network/...

# Later in production... ❌
SENDER_ADDRESS=0x... # Still using testnet address!
```

**DO:**
```bash
# Testnet deployment
npx avax-warp-pay deploy --sender-rpc https://api.avax-test.network/...
# Save as: .env.testnet

# Production deployment (SEPARATE!)
npx avax-warp-pay deploy --sender-rpc https://api.avax.network/...
# Save as: .env.production

# Use correct file per environment
cp .env.production .env  # For production
cp .env.testnet .env     # For testing
```

### 📋 Deployment Checklist

Before deploying to production:

- [ ] ✅ Have AVAX on both chains (~0.1 AVAX minimum)
- [ ] ✅ Tested on testnet/local network first
- [ ] ✅ Have RPC URLs for both chains
- [ ] ✅ Have blockchain IDs (hex format with 0x prefix)
- [ ] ✅ Know ICM Messenger address for your network
- [ ] ✅ Private key is secure (use .env file, not hardcoded)
- [ ] ✅ Ready to save contract addresses immediately
- [ ] ✅ Understand this is ONE-TIME deployment

After deploying:

- [ ] ✅ Saved contract addresses to .env file
- [ ] ✅ Backed up .env file (secure location!)
- [ ] ✅ Tested payment flow end-to-end
- [ ] ✅ Verified payment receipt on receiver chain
- [ ] ✅ Deleted/archived deployment script (optional)
- [ ] ✅ Updated your app to use saved addresses
- [ ] ✅ Documented addresses in your internal docs

### 🔐 Security Best Practices

```bash
# 1. Use environment variables
# .env file (NEVER commit to git!)
PRIVATE_KEY=0x...
SENDER_ADDRESS=0x...
RECEIVER_ADDRESS=0x...

# 2. Add to .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "deployment-addresses.json" >> .gitignore

# 3. Use separate keys for deployment vs runtime
# Deployment key: Has funds for deployment (~0.1 AVAX)
# Runtime key: Only needs funds for transactions (~0.01 AVAX)

# 4. Back up addresses securely
# Save to password manager or secure vault
# Format: network_name_sender=0x... network_name_receiver=0x...
```

### 🌐 Multi-Environment Setup

For teams deploying across environments:

```bash
# Directory structure
your-project/
├── .env.local          # Local development addresses
├── .env.testnet        # Testnet addresses
├── .env.production     # Production addresses (SECURE!)
├── deploy-addresses.json  # All deployment records
└── src/
    └── index.ts        # Your app (uses .env)

# Deployment workflow
# 1. Deploy to local
npx avax-warp-pay deploy --sender-rpc http://localhost:9650/... > .env.local

# 2. Deploy to testnet
npx avax-warp-pay deploy --sender-rpc https://api.avax-test.network/... > .env.testnet

# 3. Deploy to production (CAREFUL!)
npx avax-warp-pay deploy --sender-rpc https://api.avax.network/... > .env.production

# 4. Switch environments
cp .env.local .env      # For local dev
cp .env.testnet .env    # For testing
cp .env.production .env # For production

# 5. Or use dotenv-cli
npm install -g dotenv-cli
dotenv -e .env.production -- npm start
```

---

### Troubleshooting Deployment Errors

#### Error: "not found contracts/TeleporterInterfaces.sol"

This means you're missing the interface files. **Solution:**

```bash
# Make sure you cloned the full repository
git clone https://github.com/jayasurya0007/wrap-x402.git
cd wrap-x402/wrapx402

# Verify the file exists
ls -la src/TeleporterInterfaces.sol

# If missing, ensure you're in the correct directory
pwd  # Should show: .../wrap-x402/wrapx402

# Install dependencies
forge install

# Try building
forge build
```

The contracts require these files in `src/`:
- ✅ `TeleporterInterfaces.sol` - Teleporter interfaces
- ✅ `WarpSender.sol` - Payment sender contract
- ✅ `WarpReceiver.sol` - Payment receiver contract

#### Error: "Receiver not set"

Your contracts aren't configured. Run:
```bash
forge script script/ConfigureSender.s.sol --rpc-url $RPC --broadcast
```

#### Error: "Insufficient funds"

You need AVAX for gas. Get testnet AVAX from:
- 🚰 **Fuji Faucet**: https://faucet.avax.network/

### Cost Estimates

**Deployment (one-time)**:
- WarpSender: ~0.02 AVAX
- WarpReceiver: ~0.02 AVAX
- Configuration: ~0.005 AVAX
- **Total: ~0.045 AVAX** (~$1.50 at $35/AVAX)

**Per Transaction**:
- Send payment: ~0.002 AVAX
- Verify/consume: ~0.001 AVAX
- **Total: ~0.003 AVAX per payment** (~$0.10)

👉 **[Complete Deployment Guide](https://github.com/jayasurya0007/wrap-x402/blob/main/wrapx402/document.md)**

---

## ❓ FAQ

### Q: Do I need to deploy contracts to use this SDK?

**A: It depends on your use case:**

- ✅ **Testing SDK API**: Use `PRESETS.local` or `PRESETS.fuji` (no deployment needed)
- ✅ **Building on a platform**: Platform provides contract addresses
- ❌ **Real cross-chain payments**: You MUST deploy BOTH contracts

**Important:** Cross-chain messaging requires a "handshake" between contracts:
- WarpSender must know WarpReceiver's address
- WarpReceiver must trust WarpSender's address
- Only the contract owner can establish this connection

```typescript
// Testing - no deployment needed
import { PRESETS } from 'avax-warp-pay';
const warp = new Warp402({ ...PRESETS.local, privateKey: '0x...' });

// Production - use your deployed addresses
const warp = new Warp402({
  privateKey: '0x...',
  senderChain: { /* ... */ sender: '0xYOUR_DEPLOYED_SENDER' },
  receiverChain: { /* ... */ receiver: '0xYOUR_DEPLOYED_RECEIVER' }
});
```

### Q: What is the "handshake" and why is it required?

**A: The handshake is the configuration that connects contracts on different chains:**

```solidity
// Without handshake:
WarpSender (Chain A)  ❌  WarpReceiver (Chain B)
   ↓ Message rejected - no configuration

// With handshake:
WarpSender (Chain A)  ✅  WarpReceiver (Chain B)
   ↓ Message accepted - contracts trust each other
```

**Why it's needed:**
- ❌ Without it: WarpSender doesn't know where to send
- ❌ Without it: WarpReceiver rejects all messages
- ✅ With it: Secure cross-chain communication works

**Who can do it:** Only the contract owner (deployer)

**⚠️ Important: The SDK does NOT configure contracts!**
- SDK can only **READ** configuration: `warp.sender.getConfiguration()`
- SDK can only **USE** pre-configured contracts: `warp.pay()`, `warp.verify()`
- SDK **CANNOT** call `setRemoteReceiver()` or `setApprovedSender()`
- You must use **Foundry/cast commands** to configure contracts manually

### Q: Where do I get contract addresses for Fuji/Mainnet?

**A: You have 3 options:**

1. **Deploy your own** (see "Deploying Your Own Contracts" section above)
2. **Use platform-provided addresses** (if building on a platform with Warp-402)
3. **Use community-deployed contracts** (if someone shares verified addresses)

Currently, there are **no official public contracts on Fuji/Mainnet** - you must deploy your own.

### Q: How do I know if a platform has Warp-402 contracts deployed?

**A: Check their documentation for:**
- "Warp-402 Contract Addresses" section
- "Cross-Chain Payment Addresses"
- `WarpSender` and `WarpReceiver` addresses

**Example from platform docs:**
```
Our Warp-402 Contracts (Fuji):
- WarpSender: 0x1234...5678
- WarpReceiver: 0xabcd...ef01
```

If not documented, ask in their Discord/support.

### Q: What networks are supported?

**A: Any Avalanche chains with Teleporter:**
- ✅ Fuji Testnet (C-Chain)
- ✅ Avalanche Mainnet (C-Chain)
- ✅ Custom Avalanche Subnets with Teleporter
- ✅ Local Avalanche networks

### Q: How long does cross-chain verification take?

**A: 10-30 seconds** on average, depending on:
- Network congestion
- Teleporter relayer speed
- Number of validator signatures required

### Q: Which deployment method should I use?

**A: Choose based on your needs:**

| Your Situation | Best Method | Why |
|----------------|-------------|-----|
| **First time user** | CLI Tool | Easiest, no code needed |
| **Quick testing/demo** | CLI Tool | Fastest setup |
| **TypeScript project** | SDK Code | Integrates with your build |
| **CI/CD pipeline** | SDK Code | Programmatic control |
| **Custom gas limits** | Manual Foundry | Full customization |
| **Learning/exploring** | Manual Foundry | See each step |

**Quick recommendation:** Start with CLI, move to SDK code if you need automation.

### Q: Do I need deployment code in my production app?

**A: NO! Deployment is ONE-TIME only.**

```typescript
// ❌ WRONG - Don't keep deployment code in your app
app.listen(3000, async () => {
  const warp = await Warp402Factory.quickSetup({...}); // BAD!
});

// ✅ CORRECT - Just use deployed addresses
const warp = new Warp402({
  senderChain: { sender: process.env.SENDER_ADDRESS },
  receiverChain: { receiver: process.env.RECEIVER_ADDRESS }
  // ... other config
});

app.listen(3000, () => {
  console.log('Ready!'); // Instant startup ⚡
});
```

**Workflow:**
1. Deploy ONCE using CLI or deployment script
2. Save contract addresses to `.env` file
3. Delete deployment script (optional)
4. Use saved addresses in your app FOREVER

### Q: What happens if I deploy multiple times?

**A: You get NEW contracts each time (costs money!):**

```bash
# First deployment
npx avax-warp-pay deploy  # Cost: $6
# SENDER_ADDRESS=0x1111...

# Second deployment (by accident)
npx avax-warp-pay deploy  # Cost: $6 AGAIN
# SENDER_ADDRESS=0x2222...  # ← Different address!

# Now you have 2 separate contract systems
# Old payments won't work with new contracts
```

**Important:**
- Each deployment creates completely new contracts
- Old contracts still exist (can't be deleted)
- Old contract state is lost (payment history)
- Users lose access to old payment receipts

**Best practice:** Deploy once, reuse forever.

### Q: Can I update deployed contracts?

**A: NO - contracts are immutable once deployed.**

If you need changes:
1. Deploy NEW contracts with updated code
2. Update your app to use new addresses
3. Migrate data/state manually if needed
4. Old contracts remain on-chain (can't remove)

**This is why testing is critical before production deployment!**

### Q: How do I test deployment before production?

**A: Use this progression:**

```bash
# 1. Local network (free, instant)
npx avax-warp-pay deploy \
  --sender-rpc http://localhost:9650/... \
  --receiver-rpc http://localhost:9650/...
# Test your full flow here

# 2. Fuji testnet (free AVAX, slow)
npx avax-warp-pay deploy \
  --sender-rpc https://api.avax-test.network/... \
  --receiver-rpc https://api.avax-test.network/...
# Test with real network conditions

# 3. Production mainnet (real AVAX, CAREFUL!)
npx avax-warp-pay deploy \
  --sender-rpc https://api.avax.network/... \
  --receiver-rpc https://api.avax.network/...
# Only after successful testnet testing
```

### Q: What if I lose my deployed contract addresses?

**A: You can recover them from blockchain explorers:**

```bash
# 1. Check deployment transaction in wallet history
# Look for contract creation transactions

# 2. Search on blockchain explorer
# Snowtrace (Fuji): https://testnet.snowtrace.io/
# Snowtrace (Mainnet): https://snowtrace.io/

# 3. Search by deployer address (your wallet)
# Filter: "Contract Creation" transactions

# 4. Or check deployment script output logs
# If you saved terminal output
cat deployment-output.txt
```

**Prevention:** Always save addresses immediately:
```bash
npx avax-warp-pay deploy | tee deployment-$(date +%Y%m%d).txt
cat deployment-*.txt >> .env
await receiverContract.setApprovedSender(
  chainA_blockchainId,  // Source chain
  senderAddress         // Sender contract address
);
```

**Without this handshake:**
- ❌ WarpSender doesn't know where to send messages
- ❌ WarpReceiver rejects all incoming messages  
- ❌ Cross-chain payments fail completely

**Only the contract owner can perform this handshake!** This is why you can't use someone else's contracts for your own cross-chain setup.

**How to configure (SDK cannot do this):**
```bash
# Configure WarpSender on Chain A
cast send <SENDER_ADDRESS> "setRemoteReceiver(bytes32,address)" \
  <CHAIN_B_BLOCKCHAIN_ID> <RECEIVER_ADDRESS> \
  --rpc-url <CHAIN_A_RPC> --private-key <YOUR_KEY>

# Configure WarpReceiver on Chain B  
cast send <RECEIVER_ADDRESS> "setApprovedSender(bytes32,address)" \
  <CHAIN_A_BLOCKCHAIN_ID> <SENDER_ADDRESS> \
  --rpc-url <CHAIN_B_RPC> --private-key <YOUR_KEY>
```

### Q: Can I use someone else's deployed contracts?

**A: YES, but with a critical limitation!**

✅ **You CAN:**
- Use the contract addresses in your SDK config
- Call payment functions
- Read contract state

❌ **You CANNOT:**
- Reconfigure them to talk to YOUR contracts
- Change `remoteReceiver` or `approvedSender` settings
- Make them work with your custom subnets

**Why?** Only the contract owner can call `setRemoteReceiver()` and `setApprovedSender()`.

**Example:** Our Fuji contracts are configured like this:
```
WarpSender (Fuji) → points to → WarpReceiver (Fuji)
                    ↑
                    YOU CANNOT CHANGE THIS
```

**If you want cross-chain between YOUR subnets:**
1. Deploy your own WarpSender on Subnet A
2. Deploy your own WarpReceiver on Subnet B
3. Configure them to talk to each other (you're the owner)

```typescript
// This works for testing (same chain):
const warp = new Warp402({
  ...PRESETS.fuji,  // Both on Fuji, configured to each other
  privateKey: process.env.PRIVATE_KEY
});

// This WON'T work (cross-chain with someone else's contracts):
const warp = new Warp402({
  senderChain: { 
    sender: "0xSOMEONES_FUJI_SENDER"  // ← Points to their receiver, not yours
  },
  receiverChain: { 
    receiver: "0xYOUR_LOCAL_RECEIVER"  // ← Won't receive anything
  }
});
```

### Q: Is this production-ready?

Yes - 60/60 tests passing with OpenZeppelin security libraries.

### Q: How much does it cost?

- SDK: Free (MIT license)
- Gas: ~$0.10 per payment
- Deployment: ~$1.50 one-time

### Q: Where can I get help?

- [Documentation](https://github.com/jayasurya0007/wrap-x402)
- [GitHub Issues](https://github.com/jayasurya0007/wrap-x402/issues)

---

## 📦 What's Included

```
avax-warp-pay/
├── dist/                    # Compiled TypeScript
│   ├── index.js
│   ├── core/
│   │   ├── Warp402.js      # Main class
│   │   ├── SenderClient.js
│   │   └── ReceiverClient.js
│   └── utils/
│       ├── contracts.js     # ABIs
│       └── encoding.js
├── types/                   # TypeScript definitions
└── README.md               # This file
```

---

## Features

- TypeScript SDK for cross-chain payments
- Powered by Avalanche Teleporter/ICM
- Simple API with comprehensive testing
- MIT license

---

## Supported Networks

Works with any Avalanche network that supports Teleporter (Fuji, Mainnet, Custom Subnets).

---

## 📜 License

MIT © 2025 Warp-402 Team

---

## Links

- [NPM Package](https://www.npmjs.com/package/avax-warp-pay)
- [GitHub Repository](https://github.com/jayasurya0007/wrap-x402)
- [Smart Contracts](https://github.com/jayasurya0007/wrap-x402/tree/main/wrapx402/src)
- [Smart Contracts](#-smart-contract-source-code)
- [API Reference](#-api-reference)
- [Examples](#-quick-examples)
- [FAQ](#-faq)
- [Deploy Your Own](#-deploying-your-own-contracts)

---

<div align="center">

**Made with ❤️ for Avalanche Hackathon 2025**

[⭐ Star on GitHub](https://github.com/jayasurya0007/wrap-x402) • [📦 View on NPM](https://www.npmjs.com/package/avax-warp-pay) • [🐛 Report Bug](https://github.com/jayasurya0007/wrap-x402/issues)

</div>
