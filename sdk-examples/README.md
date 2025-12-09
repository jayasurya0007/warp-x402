# Warp-402 SDK Examples

Simple examples showing how to use the `avax-warp-pay` SDK for cross-chain payments.

## Installation

```bash
npm install
```

## Quick Start

Run the complete flow in one command:

```bash
npm run quickstart
```

This will:
1. Deploy contracts to two chains
2. Send a payment
3. Verify the payment

## Examples

### Quick Start
```bash
npm run quickstart        # Complete flow (deploy + send + verify)
```

### Step-by-Step
```bash
npm run deploy           # Deploy contracts
npm run send             # Send payment
npm run verify           # Verify payment
```

### Complete API Reference
```bash
npm run api              # Demonstrates ALL SDK methods
```

### Advanced Examples
```bash
npm run workflows        # Real-world payment patterns
npm run errors           # Error handling examples
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
PRIVATE_KEY=0x...
SENDER_ADDRESS=0x...
RECEIVER_ADDRESS=0x...
PAYMENT_ID=...
```

### Network Configuration

Edit the RPC URLs and chain IDs in each example file:

- **Sender Chain**: Where payment is sent from
- **Receiver Chain**: Where payment is verified
- **Teleporter Messenger**: `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf` (Fuji testnet)

## Requirements

- Node.js 16+
- Running Avalanche network (local or testnet)
- **ICM Relayer** (for cross-chain verification)

Start ICM Relayer:

```bash
avalanche interchain relayer start
```

## API Overview

```typescript
import { Warp402Factory } from 'avax-warp-pay';

// Deploy contracts
const warp = await Warp402Factory.quickSetup(config);

// Send payment
const paymentId = await warp.pay(amount);

// Verify payment
const isVerified = await warp.verify(paymentId);

// Consume payment
await warp.consume(paymentId);
```

## Learn More

- [NPM Package](https://www.npmjs.com/package/avax-warp-pay)
- [GitHub Repository](https://github.com/jayasurya0007/warp-x402)
- [Demo](https://warp-x402.vercel.app/)
- [Documentation](https://github.com/jayasurya0007/warp-x402/tree/main/warp402-sdk)
