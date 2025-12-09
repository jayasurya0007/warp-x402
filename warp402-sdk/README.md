# avax-warp-pay

Cross-chain payment SDK for Avalanche implementing HTTP 402 Payment Required.  
Send payments on **Chain A**, verify them on **Chain B** — powered by Avalanche Teleporter.

[![NPM](https://img.shields.io/npm/v/avax-warp-pay)](https://www.npmjs.com/package/avax-warp-pay)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#)

---

## Installation

```bash
npm install avax-warp-pay ethers@^6
```

---

## Quick Start

```typescript
import { Warp402 } from "avax-warp-pay";
import { ethers } from "ethers";

const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: process.env.SENDER_RPC!,
    chainId: +process.env.SENDER_CHAIN_ID!,
    blockchainId: process.env.SENDER_BLOCKCHAIN_ID!,
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: process.env.SENDER_ADDRESS!
  },
  receiverChain: {
    rpc: process.env.RECEIVER_RPC!,
    chainId: +process.env.RECEIVER_CHAIN_ID!,
    blockchainId: process.env.RECEIVER_BLOCKCHAIN_ID!,
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: process.env.RECEIVER_ADDRESS!
  }
});

// Send
const paymentId = await warp.pay(ethers.parseEther("0.1"));

// Wait for message relay (~30s)
await new Promise(r => setTimeout(r, 30000));

// Verify
const verified = await warp.verify(paymentId);
console.log("Verified:", verified);
```

---

## Basic API

### `warp.pay(amount)`

Send a payment from the sender chain.

```typescript
const id = await warp.pay(ethers.parseEther("1"));
```

### `warp.verify(paymentId)`

Check if the message has arrived on the receiver chain.

```typescript
const ok = await warp.verify(paymentId);
```

### `warp.consume(paymentId)`

Mark a verified payment as consumed.

```typescript
await warp.consume(paymentId);
```

---

## Configuration

These values must point to **your deployed WarpSender & WarpReceiver contracts**:

```env
PRIVATE_KEY=0x...
SENDER_RPC=...
SENDER_CHAIN_ID=...
SENDER_BLOCKCHAIN_ID=...
SENDER_ADDRESS=0x...

RECEIVER_RPC=...
RECEIVER_CHAIN_ID=...
RECEIVER_BLOCKCHAIN_ID=...
RECEIVER_ADDRESS=0x...
```

**Teleporter Messenger (Fuji):** `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`

---

## Contract Deployment

Warp-402 requires **two contracts**:

- `WarpSender` — deployed on the payment chain
- `WarpReceiver` — deployed on the verification chain

### Option 1: CLI Deployment (Easiest - 30 seconds)

Deploy contracts with a single command:

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

**CLI Options Explained:**

| Option | Required | Description | Example |
|--------|----------|-------------|---------|
| `--sender-rpc` | ✅ Yes | RPC URL for payment chain | `http://localhost:9650/ext/bc/C/rpc` |
| `--sender-chain-id` | ✅ Yes | Chain ID of payment chain | `43112` (Fuji) or `43114` (Mainnet) |
| `--sender-blockchain-id` | ✅ Yes | Blockchain ID (hex with 0x) | `0x7fc93d85c6d62c5b...` |
| `--receiver-rpc` | ✅ Yes | RPC URL for verification chain | `http://localhost:9650/ext/bc/subnet/rpc` |
| `--receiver-chain-id` | ✅ Yes | Chain ID of verification chain | `99999` |
| `--receiver-blockchain-id` | ✅ Yes | Blockchain ID (hex with 0x) | `0xc063de20d9e6e3b3...` |
| `--private-key` | ✅ Yes | Deployer private key | `0x...` or `$PRIVATE_KEY` |
| `--messenger` | ❌ No | Custom Teleporter Messenger | Defaults to Fuji messenger |

**Example Output:**

```
🚀 Deploying Warp-402 contracts...

📍 Deploying WarpSender on Chain 43112...
   ✅ Deployed at: 0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e

📍 Deploying WarpReceiver on Chain 99999...
   ✅ Deployed at: 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922

🔗 Configuring cross-chain handshake...
   ✅ Configured successfully!

╔════════════════════════════════════════════════════════════════╗
║                  ✅ DEPLOYMENT SUCCESSFUL!                     ║
╚════════════════════════════════════════════════════════════════╝

💾 Add these to your .env file:

SENDER_ADDRESS=0x5aa01B3b5877255cE50cc55e8986a7a5fe29C70e
RECEIVER_ADDRESS=0x52C84043CD9c865236f11d9Fc9F56aa003c1f922
```

**Using Environment Variables:**

```bash
# Set in your .env file
PRIVATE_KEY=0x...
SENDER_RPC=http://127.0.0.1:9650/ext/bc/C/rpc
SENDER_CHAIN_ID=43112
SENDER_BLOCKCHAIN_ID=0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5
RECEIVER_RPC=http://127.0.0.1:9650/ext/bc/subnet/rpc
RECEIVER_CHAIN_ID=99999
RECEIVER_BLOCKCHAIN_ID=0xc063de20d9e6e3b3e5b0f5e1e8e7e6e5e4e3e2e1e0dfdedddcdbdad9d8d7d6d5

# Then deploy (no flags needed!)
npx avax-warp-pay deploy
```

---

### Option 2: SDK Code Deployment (Programmatic)

Deploy contracts directly from your TypeScript code:

```typescript
import { Warp402Factory } from "avax-warp-pay";

// Automated deployment with configuration
const warp = await Warp402Factory.quickSetup({
  privateKey: process.env.PRIVATE_KEY!,
  
  // Payment chain (where users pay)
  senderChain: {
    rpc: "http://127.0.0.1:9650/ext/bc/C/rpc",
    chainId: 43112,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf" // Optional
  },
  
  // Verification chain (where you verify)
  receiverChain: {
    rpc: "http://127.0.0.1:9650/ext/bc/subnet/rpc",
    chainId: 99999,
    blockchainId: "0xc063de20d9e6e3b3e5b0f5e1e8e7e6e5e4e3e2e1e0dfdedddcdbdad9d8d7d6d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf" // Optional
  }
});

// ✅ Contracts deployed and configured!
// ✅ SDK ready to use immediately

// Access deployed addresses
const senderAddress = warp.sender.address;
const receiverAddress = warp.receiver.address;

console.log("✅ WarpSender deployed at:", senderAddress);
console.log("✅ WarpReceiver deployed at:", receiverAddress);

// Save these addresses to your .env file
console.log("\n💾 Add to .env:");
console.log(`SENDER_ADDRESS=${senderAddress}`);
console.log(`RECEIVER_ADDRESS=${receiverAddress}`);

// Start using immediately
const paymentId = await warp.pay(ethers.parseEther("0.1"));
```

**Alternative: Deploy Only (Get Addresses Without SDK Init):**

```typescript
import { Warp402Factory } from "avax-warp-pay";

// Just deploy contracts, don't initialize SDK
const result = await Warp402Factory.deployOnly({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "http://127.0.0.1:9650/ext/bc/C/rpc",
    chainId: 43112,
    blockchainId: "0x7fc93d85..."
  },
  receiverChain: {
    rpc: "http://127.0.0.1:9650/ext/bc/subnet/rpc",
    chainId: 99999,
    blockchainId: "0xc063de20..."
  }
});

// Get deployment info
console.log("Sender Address:", result.senderAddress);
console.log("Receiver Address:", result.receiverAddress);
console.log("Sender TX Hash:", result.senderTxHash);
console.log("Receiver TX Hash:", result.receiverTxHash);
```

### Option 3: Manual Foundry Deployment

**Full deployment guide:** [https://github.com/jayasurya0007/warp-x402/tree/main/warpx402](https://github.com/jayasurya0007/warp-x402/tree/main/warpx402)

---

## SDK Features

### ✅ Core Payment Methods

- **`warp.pay(amount)`** - Send cross-chain payment
- **`warp.verify(paymentId)`** - Verify payment receipt
- **`warp.consume(paymentId)`** - Mark payment as used
- **`warp.getPayment(paymentId)`** - Get payment details

### ✅ Automated Deployment

- **CLI Tool:** `npx avax-warp-pay deploy` - One-command deployment
- **SDK Factory:** `Warp402Factory.quickSetup()` - Programmatic deployment
- **Manual Option:** Full Foundry support for custom setups

### ✅ Contract Interaction

- **Sender Contract:** `warp.sender.contract` - Access WarpSender methods
- **Receiver Contract:** `warp.receiver.contract` - Access WarpReceiver methods
- **Configuration:** `warp.sender.getConfiguration()` - Read contract settings

### ✅ TypeScript Support

- Full TypeScript definitions included
- Typed interfaces for all methods
- Auto-completion in IDEs

---

## Examples

### Simple 402 Payment Flow

```typescript
const id = await warp.pay(ethers.parseEther("0.1"));
await warp.verify(id);
await warp.consume(id);
```

---

## License

MIT © 2025 Warp-402 Team

---

## Links

- **NPM:** [https://www.npmjs.com/package/avax-warp-pay](https://www.npmjs.com/package/avax-warp-pay)
- **GitHub:** [https://github.com/jayasurya0007/warp-x402](https://github.com/jayasurya0007/warp-x402)
- **Demo:** [https://warp-x402.vercel.app/](https://warp-x402.vercel.app/)
- **Contracts:** [/warpx402/src](https://github.com/jayasurya0007/warp-x402/tree/main/warpx402/src)
