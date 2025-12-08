# Warp-402: Cross-Chain HTTP 402 Payment System

**Production-Ready Cross-Chain Payment Receipts on Avalanche**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.18-blue)](https://soliditylang.org/)
[![Tests](https://img.shields.io/badge/Tests-60%2F60_Passing-brightgreen)](#testing)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Warp-402 is a revolutionary HTTP 402 payment system that enables **true cross-chain payments** using Avalanche's Teleporter protocol. Pay on one subnet, verify on another - instantly and securely.

---

## 🎯 What is Warp-402?

Traditional payment systems are locked to single chains. Warp-402 breaks this barrier:

- **Pay on Chain A** → **Verify on Chain B**
- HTTP 402 "Payment Required" responses with cross-chain receipts
- Powered by Avalanche Teleporter for instant cross-subnet messaging
- Production-ready security: Access control, reentrancy guards, payment expiry
- Developer-friendly SDK with TypeScript support

### Real-World Use Cases

1. **DeFi Payments**: Pay on mainnet, access services on L2
2. **Gaming**: Buy items on one subnet, use in games on another
3. **Enterprise**: Private subnet payments, public subnet access
4. **Content Paywalls**: Pay on any subnet, consume content anywhere

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                  │
│                                                                 │
│  1. GET /resource  →  Receives 402 + Payment ID                 │
│  2. Sends payment on Sender Chain (e.g., Fuji C-Chain)          │
│  3. Teleporter relays receipt to Receiver Chain                 │
│  4. GET /verify/:id  →  Check if payment received               │
│  5. POST /consume/:id  →  Mark payment used, get resource       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CHAIN A (Sender Chain)                        │
│                                                                 │
│   WarpSender.sol                                                │
│   ├─ sendPayment(paymentId, amount)                             │
│   ├─ Teleporter.sendCrossChainMessage()                         │
│   └─ Owner: withdraw(), pause(), setGasLimits()                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Teleporter Relay
┌─────────────────────────────────────────────────────────────────┐
│                   CHAIN B (Receiver Chain)                      │
│                                                                 │
│   WarpReceiver.sol                                              │
│   ├─ receiveTeleporterMessage()                                 │
│   ├─ hasPaid(paymentId) → bool                                  │
│   ├─ getReceipt(paymentId) → PaymentReceipt                     │
│   ├─ consumePayment(paymentId)                                  │
│   ├─ isExpired(paymentId) → bool                                │
│   └─ Owner: pause(), setExpiryTime(), setRequiredAmount()       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Option 1: Use the Published SDK (Recommended)

**If you just want to use the payment system:**

```bash
npm install avax-warp-pay
```

**⚠️ IMPORTANT**: You need deployed contract addresses! See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for instructions.

Quick example:
```javascript
import { Warp402 } from 'avax-warp-pay';

const warp = new Warp402({
  privateKey: "YOUR_KEY",
  senderChain: { 
    rpc: "...", 
    sender: "0xYourDeployedWarpSender..." // ← Must deploy first!
  },
  receiverChain: { 
    rpc: "...", 
    receiver: "0xYourDeployedWarpReceiver..." // ← Must deploy first!
  }
});

await warp.pay(ethers.parseEther("1"));
```

📚 **Full SDK Documentation**: [wrap402-sdk/README.md](wrap402-sdk/README.md)

---

### Option 2: Full Project Setup (For Development)

**If you want to deploy contracts and develop:**

### Prerequisites

- Node.js 18+
- Foundry (for contract deployment)
- Avalanche CLI (for local testing)
- Private key with test AVAX

### 1. Clone & Install

```bash
git clone https://github.com/jayasurya0007/wrap-x402.git
cd wrap-x402

# Install contract dependencies
cd wrapx402
forge install

# Install SDK dependencies
cd ../warp402-sdk
npm install
npm run build

# Install server dependencies
cd ../x402-server
npm install
```

### 2. Deploy Contracts

```bash
cd wrapx402

# Set environment variables
export PRIVATE_KEY="your-private-key"
export SENDER_RPC="http://127.0.0.1:9650/ext/bc/YOUR_SUBNET_A/rpc"
export RECEIVER_RPC="http://127.0.0.1:9650/ext/bc/YOUR_SUBNET_B/rpc"

# Deploy sender contract on Chain A
forge script script/DeployWarpSender.s.sol --rpc-url $SENDER_RPC --broadcast

# Deploy receiver contract on Chain B
forge script script/DeployWarpReceiver.s.sol --rpc-url $RECEIVER_RPC --broadcast

# Configure sender to know about receiver
export SENDER_ADDRESS="0x..."  # From deployment
export RECEIVER_ADDRESS="0x..."  # From deployment
export REMOTE_BLOCKCHAIN_ID="0x..."  # Chain B's blockchain ID

forge script script/ConfigureSender.s.sol --rpc-url $SENDER_RPC --broadcast
```

### 3. Start the Server

```bash
cd x402-server

# Configure environment
cat > .env <<EOF
PRIVATE_KEY=your-private-key
NETWORK=local
PORT=3000
EOF

# Start SDK-powered server
node server-sdk.js
```

### 4. Test Payment Flow

```bash
# Request resource (get 402 response with payment ID)
curl http://localhost:3000/resource

# Send payment using SDK or cast
forge script script/SendPayment.s.sol --rpc-url $SENDER_RPC --broadcast

# Wait ~10 seconds for Teleporter relay

# Verify payment
curl http://localhost:3000/verify/0x<payment-id>

# Consume payment
curl -X POST http://localhost:3000/consume/0x<payment-id>
```

---

## 📦 Components

### 1. Smart Contracts (`wrapx402/src/`)

#### **WarpSender.sol**
Deployed on the payment source chain.

**Features:**
- ✅ Send cross-chain payment receipts
- ✅ Owner-controlled configuration (receiver address, blockchain ID)
- ✅ Configurable gas limits for flexibility
- ✅ Withdraw collected payments
- ✅ Emergency pause functionality
- ✅ Reentrancy protection
- ✅ Secure payment ID binding (includes payer address + timestamp)

**Key Functions:**
```solidity
function sendPayment(bytes32 paymentId) external payable
function withdraw() external onlyOwner
function setRemoteReceiver(bytes32 chainId, address receiver) external onlyOwner
function setGasLimits(uint256 messageGas, uint256 paymentGas) external onlyOwner
function pause() external onlyOwner
```

#### **WarpReceiver.sol**
Deployed on the payment verification chain.

**Features:**
- ✅ Receive and store payment receipts via Teleporter
- ✅ Query payment status (paid, consumed, expired)
- ✅ Payment expiry mechanism (default: 7 days)
- ✅ Configurable minimum payment amount
- ✅ Authorized sender validation
- ✅ Emergency pause functionality
- ✅ Prevent double-spending

**Key Functions:**
```solidity
function hasPaid(bytes32 paymentId) public view returns (bool)
function getReceipt(bytes32 paymentId) public view returns (PaymentReceipt memory)
function isExpired(bytes32 paymentId) public view returns (bool)
function consumePayment(bytes32 paymentId) external
function setPaymentExpiryTime(uint256 seconds) external onlyOwner
```

### 2. Warp-402 SDK (`warp402-sdk/`)

TypeScript SDK for easy integration.

**Installation:**
```bash
npm install ../warp402-sdk
```

**Usage:**
```typescript
import { Warp402 } from 'warp402-sdk';

const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY,
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xYourSenderContract"
  },
  receiverChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xYourReceiverContract"
  }
});

// Send payment
const paymentId = await warp.pay(ethers.parseEther("1.0"));

// Verify payment
const isPaid = await warp.verify(paymentId);

// Consume payment
await warp.consume(paymentId);
```

**SDK Features:**
- 5 simple methods: `pay()`, `verify()`, `getReceipt()`, `consume()`, `payAndWait()`
- Full TypeScript support with type definitions
- Built-in error handling (23 error test cases)
- Network presets (local, Fuji)
- Comprehensive logging

### 3. x402 Server (`x402-server/`)

Production HTTP 402 server powered by the SDK.

**Endpoints:**
- `GET /resource` - Returns 402 with payment details
- `GET /verify/:paymentId` - Check payment status
- `POST /consume/:paymentId` - Consume payment and access resource
- `GET /health` - Health check and SDK status
- `GET /` - API documentation

**Features:**
- Network switching (local/Fuji)
- SDK-powered (80% less code than manual implementation)
- CORS support
- Health monitoring
- Payment tracking

---

## 🧪 Testing

### Contract Tests (Foundry)

```bash
cd wrapx402
forge test -vv
```

**Test Coverage:**
- 60 comprehensive tests
- 100% pass rate
- Tests for all major functions:
  - Access control (Ownable)
  - Payment flow (send, receive, verify, consume)
  - Security (reentrancy, pause, expiry)
  - Configuration (gas limits, receivers, amounts)
  - Edge cases (zero values, unauthorized calls, expired payments)

**Test Results:**
```
╭------------------+--------+--------+---------╮
| Test Suite       | Passed | Failed | Skipped |
+==============================================+
| WarpReceiverTest | 33     | 0      | 0       |
| WarpSenderTest   | 27     | 0      | 0       |
╰------------------+--------+--------+---------╯

All tests passed ✅
```

### SDK Tests

```bash
cd warp402-sdk
npm test
```

**Test Coverage:**
- 10 unit tests (100% pass)
- 23 error handling tests (100% pass)
- Integration tests (local and Fuji)
- Type safety tests

---

## 🔐 Security Features

### Implemented Protections

1. **Access Control** (OpenZeppelin Ownable)
   - Only owner can configure contracts
   - Only owner can withdraw funds
   - Only owner can pause/unpause

2. **Reentrancy Protection** (OpenZeppelin ReentrancyGuard)
   - Prevents reentrancy attacks on payment functions
   - Safe withdrawal patterns

3. **Payment Security**
   - Secure payment IDs (bound to payer + timestamp)
   - Duplicate payment prevention
   - Authorized sender validation
   - Source chain validation

4. **Emergency Controls**
   - Pausable pattern for both contracts
   - Can halt operations during incidents
   - Owner-controlled unpause

5. **Payment Expiry**
   - Configurable expiry time (default: 7 days)
   - Prevents old receipt replay
   - Optional (can be set to 0 for no expiry)

6. **Input Validation**
   - Non-zero address checks
   - Non-zero amount checks
   - Gas limit bounds checking
   - Payment ID validation

### Audit Recommendations

While the contracts implement industry-standard security practices, we recommend:
- Third-party security audit before mainnet deployment
- Bug bounty program
- Gradual rollout with transaction limits
- Monitoring and alerting system

---

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| sendPayment | ~160,000 | Includes cross-chain message |
| consumePayment | ~48,000 | State update only |
| hasPaid | ~3,000 | View function |
| withdraw | ~30,000 | Native transfer |

---

## 🌐 Network Support

### Tested Networks

- ✅ Local Avalanche subnets (via Avalanche CLI)
- ✅ Fuji C-Chain testnet
- ✅ Custom Avalanche L1s

### Compatible With

- Any EVM-compatible Avalanche subnet
- Fuji C-Chain ↔ Custom subnets
- Mainnet C-Chain ↔ Gaming/DeFi subnets
- Subnet ↔ Subnet (no C-Chain required)
- Private enterprise subnets

**Requirements:**
- Teleporter Messenger deployed on both chains
- Teleporter relayer running (for cross-chain delivery)

---

## 📚 Documentation

- **[Quick Start Guide](warp402-sdk/QUICK_START.md)** - 5-minute setup
- **[Getting Started](warp402-sdk/GETTING_STARTED.md)** - Complete beginner guide
- **[SDK Reference](warp402-sdk/README.md)** - Full API documentation
- **[Demo Guide](DEMO_READY.md)** - Hackathon demo script
- **[Contract Reference](wrapx402/src/)** - Solidity contracts with comments

---

## 🎯 Use Cases

### 1. Content Paywalls
```typescript
// User requests premium article
const response = await fetch('/article/premium-content');
if (response.status === 402) {
  const { paymentId, amount } = await response.json();
  
  // Pay on any Avalanche subnet
  await warp.pay(amount, paymentId);
  
  // Access content after verification
  const article = await fetch('/article/premium-content', {
    headers: { 'X-Payment-Id': paymentId }
  });
}
```

### 2. Cross-Subnet Gaming
```typescript
// Buy item on mainnet, use in game on gaming subnet
const paymentId = await warp.pay(ethers.parseEther("0.5"));
// Teleporter delivers receipt to gaming subnet
// Game server verifies and unlocks item
```

### 3. DeFi Protocol Access
```typescript
// Pay on L1, access DeFi protocol on L2
const access = await warp.payAndWait(ethers.parseEther("10.0"));
// Instant access to L2 protocol with L1 payment proof
```

---

## 🚧 Roadmap

- [ ] Mainnet deployment
- [ ] npm package publication (`warp402-sdk`)
- [ ] Multi-token support (not just native AVAX)
- [ ] Subscription payments (recurring)
- [ ] Refund mechanism
- [ ] Payment splitting
- [ ] GraphQL API for payment history
- [ ] Web3 wallet integration (MetaMask, WalletConnect)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass: `forge test && npm test`
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- **Avalanche Team** - For Teleporter protocol and developer tools
- **OpenZeppelin** - For battle-tested smart contract libraries
- **Foundry** - For excellent development and testing framework

---

## 📞 Contact

- **GitHub**: [@jayasurya0007](https://github.com/jayasurya0007)
- **Project**: [wrap-x402](https://github.com/jayasurya0007/wrap-x402)

---

## ⚡ Quick Links

- [Deploy Contracts →](wrapx402/README.md)
- [SDK Docs →](warp402-sdk/README.md)
- [Run Server →](x402-server/README.md)
- [View Tests →](wrapx402/test/)
- [Demo Script →](DEMO_READY.md)

---

<div align="center">

**Built with ❤️ for Avalanche Hackathon**

*Making cross-chain payments simple, secure, and instant*

</div>
