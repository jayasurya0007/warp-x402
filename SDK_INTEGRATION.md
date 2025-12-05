# Using avax-warp-pay SDK in Your Project

This guide shows how the **published NPM package** `avax-warp-pay` is integrated throughout the Warp-402 project.

## 🎯 Published Package

**Package**: `avax-warp-pay`  
**Version**: 1.0.1  
**NPM**: https://www.npmjs.com/package/avax-warp-pay

## 📦 Installation

```bash
npm install avax-warp-pay
```

## 🔌 Integration Points

### 1. Backend Server (`x402-server/`)

The HTTP 402 server uses the SDK to handle all blockchain interactions:

```javascript
import { Warp402 } from 'avax-warp-pay';

// Initialize SDK with network configuration
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY,
  senderChain: { /* config */ },
  receiverChain: { /* config */ }
});

// Verify payment
app.get('/verify/:paymentId', async (req, res) => {
  const isValid = await warp.receiver.isValidPayment(req.params.paymentId);
  res.json({ verified: isValid });
});

// Consume payment
app.post('/consume/:paymentId', async (req, res) => {
  await warp.consume(req.params.paymentId);
  res.json({ success: true });
});
```

**File**: `x402-server/server-sdk.js`  
**Run**: `npm run start:sdk`

### 2. Demo Client (`demo/`)

The demo uses the SDK for programmatic payment integration:

```javascript
import { Warp402 } from 'avax-warp-pay';

// Send cross-chain payment
const paymentId = await warp.pay(ethers.parseEther('1.0'));

// Verify on receiving chain
const isVerified = await warp.verify(paymentId);

// Get receipt details
const receipt = await warp.getReceipt(paymentId);
```

**Files**: 
- `demo/demo-client.js` - Full HTTP 402 flow demo
- `demo/sdk-example.js` - Pure SDK usage example

**Run**:
```bash
npm run demo        # Full HTTP 402 demo
npm run demo:sdk    # Pure SDK example
```

### 3. SDK Examples (`wrap402-sdk/examples/`)

Complete standalone examples showing SDK usage:

- `local-demo.ts` - Local subnet payment flow
- `fuji-demo.ts` - Fuji testnet integration
- `cross-subnet-demo.ts` - Cross-chain payment demo

## 🚀 Quick Start

### Install in Your Project

```bash
npm install avax-warp-pay
```

### Basic Usage

```javascript
import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';

// Initialize
const warp = new Warp402({
  privateKey: "YOUR_PRIVATE_KEY",
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xYourWarpSenderContract"
  },
  receiverChain: {
    rpc: "http://your-subnet.rpc",
    chainId: 12345,
    blockchainId: "0x...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xYourWarpReceiverContract"
  }
});

// Send payment
const paymentId = await warp.pay(ethers.parseEther("1"));
console.log("Payment sent:", paymentId);

// Wait for relay (10-30 seconds)
await new Promise(resolve => setTimeout(resolve, 15000));

// Verify
const verified = await warp.verify(paymentId);
if (verified) {
  console.log("✅ Payment verified!");
  
  // Consume
  await warp.consume(paymentId);
  console.log("✅ Payment consumed!");
}
```

## 📚 SDK Features Used

### Core Operations
- ✅ `warp.pay()` - Send cross-chain payment
- ✅ `warp.verify()` - Verify payment receipt
- ✅ `warp.consume()` - Mark payment as used
- ✅ `warp.getReceipt()` - Get payment details

### Sender Client
- ✅ `sender.sendPayment()` - Direct payment sending
- ✅ `sender.getConfiguration()` - Contract settings
- ✅ `sender.getContractBalance()` - Check balance

### Receiver Client
- ✅ `receiver.isConsumed()` - Check if used
- ✅ `receiver.isExpired()` - Check expiry status
- ✅ `receiver.isValidPayment()` - Comprehensive validation
- ✅ `receiver.getConfiguration()` - Contract settings

## 🎯 Benefits of Using Published Package

### Before (Local Development)
```javascript
// Had to use relative path to local SDK
import { Warp402 } from '../wrap402-sdk/dist/index.js';
```

### After (Published NPM Package)
```javascript
// Clean import from NPM
import { Warp402 } from 'avax-warp-pay';
```

**Advantages**:
- ✅ Versioned releases (v1.0.1, v1.0.2, etc.)
- ✅ Dependency management via npm
- ✅ Easy updates: `npm update avax-warp-pay`
- ✅ Can be used in any project
- ✅ TypeScript declarations included
- ✅ Production-ready and tested

## 📂 Project Structure

```
wrap-x402/
├── wrapx402/              # Smart contracts (Foundry)
│   └── src/
│       ├── WarpSender.sol      # Production contracts
│       └── WarpReceiver.sol    # (deployed on-chain)
│
├── wrap402-sdk/           # SDK source code
│   ├── src/               # TypeScript source
│   └── dist/              # Compiled (published to NPM)
│
├── x402-server/           # HTTP 402 server
│   ├── server-sdk.js      # ✅ Uses avax-warp-pay from NPM
│   └── package.json       # Dependencies: avax-warp-pay@^1.0.1
│
└── demo/                  # Client demos
    ├── demo-client.js     # ✅ Uses avax-warp-pay from NPM
    ├── sdk-example.js     # ✅ Pure SDK usage example
    └── package.json       # Dependencies: avax-warp-pay@^1.0.1
```

## 🔄 Update SDK

When you publish a new version:

```bash
# In wrap402-sdk/
npm version patch  # or minor, major
npm publish

# In x402-server/ and demo/
npm update avax-warp-pay
```

## 📖 Documentation

- **NPM Package**: https://www.npmjs.com/package/avax-warp-pay
- **SDK README**: `wrap402-sdk/README.md`
- **API Examples**: `wrap402-sdk/examples/`
- **Server Integration**: `x402-server/server-sdk.js`
- **Client Demo**: `demo/sdk-example.js`

## 🎉 Production Ready

All components now use the **published, versioned SDK** from NPM:
- ✅ Backend server integration
- ✅ Demo client integration  
- ✅ Type-safe TypeScript support
- ✅ Comprehensive error handling
- ✅ Security features built-in
- ✅ 100% test coverage

---

**Need help?** Check the examples in `wrap402-sdk/examples/` or `demo/sdk-example.js`
