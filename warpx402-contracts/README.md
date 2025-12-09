# 🚀 Warp-402: Cross-Chain HTTP 402 Payment Protocol

> **Production-ready cross-chain payment receipts for Avalanche Subnets using Teleporter**

A complete implementation of HTTP 402 Payment Required using Avalanche's Warp Messaging, enabling trustless cross-chain payment verification for pay-per-use APIs and services.

[![NPM Package](https://img.shields.io/npm/v/avax-warp-pay)](https://www.npmjs.com/package/avax-warp-pay)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-60%20passing-brightgreen)](test/)

---

## ⚡ Quick Start (Zero Deployment Required!)

Our SDK comes with **pre-deployed contracts on Fuji testnet** - start testing immediately without deploying anything:

```bash
npm install avax-warp-pay
```

```typescript
import { Warp402, PRESETS } from 'avax-warp-pay';

// Use pre-deployed contracts on Fuji testnet
const warp = new Warp402({
  ...PRESETS.fuji,
  privateKey: process.env.PRIVATE_KEY
});

// Make a payment
const paymentId = await warp.pay(ethers.parseEther("0.1"));

// Verify the payment
const isValid = await warp.verify(paymentId);

// Consume the payment (one-time use)
await warp.consume(paymentId);
```

**🎉 That's it!** No contract deployment, no configuration, just install and go.

📚 **[View complete SDK documentation →](../wrap402-sdk/README.md)**

---

## 🌟 Features

### For Developers
- ✅ **Zero-Config Setup**: Pre-deployed contracts on Fuji testnet
- ✅ **Type-Safe SDK**: Full TypeScript support with complete type definitions
- ✅ **Cross-Chain Native**: Built on Avalanche Warp Messaging for true interoperability
- ✅ **Production Ready**: 60 comprehensive tests, security audited, OpenZeppelin libraries
- ✅ **HTTP 402 Support**: Drop-in middleware for Express.js and other frameworks
- ✅ **Real-Time Verification**: Instant payment confirmation across subnets

### For Businesses
- 💰 **Pay-Per-Use APIs**: Monetize any endpoint with cross-chain payments
- 🔒 **Trustless**: No intermediaries, cryptographic proof of payment
- 🌍 **Universal**: Works across any Avalanche subnet
- 📊 **Transparent**: All payments verifiable on-chain
- ⚡ **Fast**: Sub-second payment verification
- 💵 **Cost Effective**: ~$0.10 per transaction on testnet

---

## 📦 What's Included

### 1. Smart Contracts (`src/`)
Production-ready Solidity contracts with full security features:

- **`WarpSender.sol`**: Cross-chain payment sender
  - OpenZeppelin Ownable, Pausable, ReentrancyGuard
  - Configurable remote receivers
  - Balance management and withdrawal
  
- **`WarpReceiver.sol`**: Payment verification and receipt management
  - One-time payment consumption
  - Expiry management (7-day default)
  - Full payment history tracking

**Pre-deployed Contracts:**
- Fuji Testnet: `0x52C84043CD9c865236f11d9Fc9F56aa003c1f922` (both sender and receiver)
- View source code in [SDK documentation](../wrap402-sdk/README.md#-smart-contract-source-code)

### 2. TypeScript SDK (`../wrap402-sdk/`)
Published NPM package: [`avax-warp-pay`](https://www.npmjs.com/package/avax-warp-pay)

**Key Classes:**
- `Warp402`: Main SDK class with pay/verify/consume methods
- `SenderClient`: Direct interaction with WarpSender contract
- `ReceiverClient`: Direct interaction with WarpReceiver contract
- `PRESETS`: Pre-configured network settings

**Features:**
- Complete TypeScript types
- ethers.js v6 integration
- Comprehensive error handling
- Network abstraction layer
- Built-in logging

### 3. Backend Server (`../x402-server/`)
Ready-to-deploy Express.js server with HTTP 402 implementation:

```bash
cd ../x402-server
npm install
npm start
```

**Endpoints:**
- `GET /resource` - Protected endpoint requiring payment (HTTP 402)
- `POST /verify` - Verify payment receipt
- `POST /consume` - Consume one-time payment
- `GET /health` - Server health check
- `GET /contract-status` - Check contract balance

### 4. Test Suite (`test/`)
60 comprehensive tests covering:
- ✅ Payment flow (sender → receiver)
- ✅ Cross-chain messaging
- ✅ Payment verification
- ✅ One-time consumption
- ✅ Payment expiry
- ✅ Access control
- ✅ Security features (pause, reentrancy)
- ✅ Edge cases and error handling

**Run tests:**
```bash
forge test -vvv
```

---

## 🏗️ Architecture

```
┌─────────────┐                    ┌─────────────┐
│  Subnet A   │                    │  Subnet B   │
│             │                    │             │
│ WarpSender  │ ─── Teleporter ──→ │ WarpReceiver│
│             │     Messenger      │             │
│ (Payment)   │                    │ (Verify)    │
└─────────────┘                    └─────────────┘
       ↑                                  ↑
       │                                  │
   Client SDK                        Backend Server
       │                                  │
       └────────── HTTP 402 ──────────────┘
```

**Flow:**
1. Client requests protected resource from server
2. Server responds with HTTP 402 Payment Required + payment details
3. Client uses SDK to send cross-chain payment via WarpSender
4. Avalanche Teleporter delivers payment proof to WarpReceiver
5. Server verifies payment on receiver chain
6. Server grants access to resource
7. Payment is consumed (one-time use)

---

## 🚀 Deployment Guide

### Option 1: Use Pre-Deployed Contracts (Recommended for Testing)
No deployment needed! Use `PRESETS.fuji` in the SDK:

```typescript
import { Warp402, PRESETS } from 'avax-warp-pay';

const warp = new Warp402({
  ...PRESETS.fuji,
  privateKey: process.env.PRIVATE_KEY
});
```

### Option 2: Deploy Your Own Contracts

**Prerequisites:**
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Private key with AVAX on target networks
- RPC endpoints for both subnets

**Deployment Steps:**

```bash
# 1. Set environment variables
export PRIVATE_KEY="your-private-key"
export SENDER_RPC="https://api.avax-test.network/ext/bc/C/rpc"
export RECEIVER_RPC="https://api.avax-test.network/ext/bc/C/rpc"

# 2. Deploy receiver (on subnet B)
forge script script/DeployWarpReceiver.s.sol:DeployWarpReceiver \
  --rpc-url $RECEIVER_RPC \
  --broadcast \
  --verify

# 3. Deploy sender (on subnet A)  
forge script script/DeployWarpSender.s.sol:DeployWarpSender \
  --rpc-url $SENDER_RPC \
  --broadcast \
  --verify

# 4. Configure sender with receiver address
forge script script/ConfigureSender.s.sol:ConfigureSender \
  --rpc-url $SENDER_RPC \
  --broadcast
```

**Cost Estimates:**
- Deployment: ~$1.50 total (Fuji testnet)
- Per-transaction: ~$0.10 (Fuji testnet)
- Mainnet costs will vary based on subnet gas prices

📖 **[Full deployment guide →](../DEPLOYMENT_GUIDE.md)**

---

## 💻 Usage Examples

### Example 1: Simple Payment Flow

```typescript
import { Warp402, PRESETS } from 'avax-warp-pay';
import { ethers } from 'ethers';

async function payForResource() {
  // Initialize with pre-deployed contracts
  const warp = new Warp402({
    ...PRESETS.fuji,
    privateKey: process.env.PRIVATE_KEY!
  });

  // Make payment
  const amount = ethers.parseEther("0.1");
  const paymentId = await warp.pay(amount);
  console.log('Payment ID:', paymentId);

  // Wait for cross-chain confirmation (optional)
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Verify payment
  const receipt = await warp.verify(paymentId);
  console.log('Payment verified:', receipt.paid);
  console.log('Amount:', ethers.formatEther(receipt.amount));

  // Consume payment (one-time use)
  await warp.consume(paymentId);
  console.log('Payment consumed');
}
```

### Example 2: HTTP 402 Server

```typescript
import express from 'express';
import { Warp402, PRESETS } from 'avax-warp-pay';

const app = express();
const warp = new Warp402({
  ...PRESETS.fuji,
  privateKey: process.env.PRIVATE_KEY!
});

// Protected endpoint
app.get('/api/data', async (req, res) => {
  const paymentId = req.headers['x-payment-id'];
  
  if (!paymentId) {
    return res.status(402).json({
      error: 'Payment Required',
      acceptedPayments: ['AVAX-Warp'],
      amount: '0.1',
      receiverAddress: PRESETS.fuji.receiverChain.receiver
    });
  }

  // Verify and consume payment
  try {
    const receipt = await warp.verify(paymentId);
    if (!receipt.paid) {
      return res.status(402).json({ error: 'Payment not found' });
    }

    await warp.consume(paymentId);
    
    // Grant access
    res.json({ data: 'Your premium content here' });
  } catch (error) {
    res.status(402).json({ error: 'Invalid payment' });
  }
});
```

### Example 3: Direct Client Usage

```typescript
import { SenderClient, ReceiverClient } from 'avax-warp-pay';
import { ethers } from 'ethers';

// Initialize clients
const senderClient = new SenderClient(
  'https://api.avax-test.network/ext/bc/C/rpc',
  '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922',
  privateKey
);

const receiverClient = new ReceiverClient(
  'https://api.avax-test.network/ext/bc/C/rpc',
  '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
);

// Send payment
const paymentId = ethers.randomBytes(32);
const tx = await senderClient.sendPayment(
  paymentId,
  ethers.parseEther("0.1")
);
await tx.wait();

// Check receipt
const receipt = await receiverClient.getReceipt(paymentId);
console.log(receipt);
```

---

## 🧪 Testing

### Run Contract Tests
```bash
forge test -vvv
```

### Run SDK Tests
```bash
cd ../wrap402-sdk
npm test
```

### Run Backend Tests
```bash
cd ../x402-server
bash test-quick.sh
```

**Test Results:**
- ✅ 60/60 contract tests passing
- ✅ 10/10 SDK tests passing
- ✅ All integration tests passing

---

## 📊 Project Status

**Production Ready Features:**
- ✅ Smart contracts deployed and verified
- ✅ Security audit complete (8 critical fixes implemented)
- ✅ NPM package published: `avax-warp-pay@1.0.3`
- ✅ Comprehensive test coverage
- ✅ Backend server integration
- ✅ Complete documentation

**Roadmap:**
- [ ] Mainnet deployment
- [ ] Multi-chain support (beyond Avalanche)
- [ ] Payment batching
- [ ] Subscription models
- [ ] Web3 wallet integration UI
- [ ] GraphQL API

---

## 🔒 Security

This project implements multiple security best practices:

- **OpenZeppelin Libraries**: Ownable, Pausable, ReentrancyGuard
- **Access Control**: Owner-only administrative functions
- **Emergency Pause**: Circuit breaker for critical issues
- **Reentrancy Protection**: All external calls protected
- **Payment Expiry**: Automatic expiration after 7 days
- **One-Time Use**: Payments can only be consumed once
- **Input Validation**: Comprehensive checks on all parameters

**Security Audit:** 8 critical vulnerabilities identified and fixed. See [document.md](document.md) for details.

---

## 📚 Documentation

- **[SDK Documentation](../wrap402-sdk/README.md)** - Complete API reference with pre-deployed contracts
- **[Deployment Guide](../DEPLOYMENT_GUIDE.md)** - Step-by-step contract deployment
- **[Integration Guide](../SDK_INTEGRATION.md)** - Using the SDK in your project
- **[Architecture Document](document.md)** - Technical deep dive

---

## 🤝 Contributing

Contributions welcome! This project is open source under the MIT license.

### Development Setup
```bash
# Clone repository
git clone https://github.com/yourusername/wrap-x402.git
cd wrap-x402/wrapx402

# Install dependencies
forge install

# Run tests
forge test -vvv
```

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🎯 Use Cases

1. **Pay-Per-Use APIs**: Charge per API request with automatic verification
2. **Content Monetization**: Paywalls for articles, videos, or downloads
3. **Compute Resources**: Pay-per-execution for serverless functions
4. **Data Access**: Sell access to premium datasets
5. **Gaming**: In-game purchases across different game servers
6. **IoT**: Machine-to-machine payments for services

---

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: [SDK README](../wrap402-sdk/README.md)
- **NPM Package**: [avax-warp-pay](https://www.npmjs.com/package/avax-warp-pay)

---

## 🏆 Built With

- [Avalanche](https://www.avax.network/) - L1 blockchain platform
- [Teleporter](https://github.com/ava-labs/teleporter) - Cross-chain messaging
- [Foundry](https://book.getfoundry.sh/) - Smart contract development
- [ethers.js](https://docs.ethers.org/) - Ethereum library
- [OpenZeppelin](https://www.openzeppelin.com/) - Security libraries
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development

---

<div align="center">

**Made with ❤️ for the Avalanche ecosystem**

[NPM](https://www.npmjs.com/package/avax-warp-pay) • [Documentation](../wrap402-sdk/README.md) • [Deployment Guide](../DEPLOYMENT_GUIDE.md)

</div>
