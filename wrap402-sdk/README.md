# avax-warp-pay

> Cross-chain payment receipt SDK for Avalanche Subnets using Teleporter

## Overview

Warp-402 SDK provides a simple TypeScript/JavaScript interface for sending cross-chain payment receipts between Avalanche Subnets. Instead of moving tokens between chains, it moves **verified payment receipts** using Avalanche's Teleporter messaging protocol.

## Features

- ✅ **Simple API**: Just `pay()`, `verify()`, and `consume()`
- ✅ **Type-Safe**: Full TypeScript support with comprehensive type definitions
- ✅ **Flexible**: Works with any two Avalanche chains that support Teleporter
- ✅ **Secure**: Built-in validation, replay protection, and error handling
- ✅ **Production-Ready**: Comprehensive logging, error handling, and configuration validation

## Installation

```bash
npm install avax-warp-pay
```

## Quick Start

```typescript
import { Warp402 } from 'avax-warp-pay';

// Initialize SDK
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xYourWarpSenderAddress"
  },
  receiverChain: {
    rpc: "http://localhost:9650/ext/bc/subnetB/rpc",
    chainId: 12345,
    blockchainId: "0x...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xYourWarpReceiverAddress"
  }
});

// Send payment
const paymentId = await warp.pay(ethers.parseEther("1"));
console.log("Payment sent:", paymentId);

// Wait for cross-chain relay (automatic with Teleporter)
await new Promise(resolve => setTimeout(resolve, 10000));

// Verify payment on receiver chain
const verified = await warp.verify(paymentId);
if (verified) {
  console.log("Payment verified!");
  
  // Consume payment (one-time use)
  await warp.consume(paymentId);
}
```

## API Reference

### Main Class: `Warp402`

#### Constructor

```typescript
new Warp402(config: Warp402Config)
```

#### Methods

##### `pay(amount: bigint, customPaymentId?: string): Promise<string>`

Send a payment and generate a cross-chain receipt.

- **amount**: Amount to pay in wei
- **customPaymentId**: Optional custom payment ID (32-byte hex)
- **Returns**: Payment ID

##### `verify(paymentId: string): Promise<boolean>`

Check if a payment has been verified on the receiver chain.

- **paymentId**: Payment identifier
- **Returns**: true if payment is verified

##### `getReceipt(paymentId: string): Promise<PaymentReceipt | null>`

Get full payment receipt details.

- **paymentId**: Payment identifier
- **Returns**: Payment receipt or null

##### `consume(paymentId: string): Promise<TransactionResult>`

Consume a payment (mark as used, preventing replay).

- **paymentId**: Payment identifier
- **Returns**: Transaction result

##### `payAndWait(amount: bigint, timeout?: number, pollInterval?: number): Promise<string>`

Send payment and wait for cross-chain verification.

- **amount**: Amount to pay in wei
- **timeout**: Maximum wait time in ms (default: 60000)
- **pollInterval**: Polling interval in ms (default: 2000)
- **Returns**: Payment ID if verified

## Configuration

### ChainConfig

```typescript
interface ChainConfig {
  rpc: string;              // RPC endpoint
  chainId: number;          // EVM chain ID
  blockchainId: string;     // Avalanche blockchain ID (bytes32)
  messenger: string;        // Teleporter Messenger address
  sender?: string;          // WarpSender contract (for sender chain)
  receiver?: string;        // WarpReceiver contract (for receiver chain)
}
```

### Warp402Config

```typescript
interface Warp402Config {
  senderChain: ChainConfig;     // Chain where payments are sent
  receiverChain: ChainConfig;   // Chain where receipts are verified
  privateKey: string;           // Private key for transactions
}
```

## Examples

See the [examples](./examples) directory for complete examples:

- `local-demo.ts` - Two local subnets
- `fuji-demo.ts` - Fuji C-Chain + custom subnet
- `cross-subnet-demo.ts` - Subnet to subnet payment

## Use Cases

### HTTP 402 Payment Required

```typescript
import express from 'express';
import { Warp402 } from 'warp402-sdk';

const app = express();
const warp = new Warp402(config);

app.get('/api/resource', async (req, res) => {
  const paymentId = req.headers['x-payment-id'];
  
  if (!paymentId || !(await warp.verify(paymentId))) {
    return res.status(402).json({
      error: 'Payment Required',
      price: '1000000000000000000' // 1 token
    });
  }
  
  await warp.consume(paymentId);
  res.json({ data: 'Protected content' });
});
```

### Cross-Subnet Payments

```typescript
// Subnet A -> Subnet B payment receipt
const warp = new Warp402({
  senderChain: { /* Subnet A config */ },
  receiverChain: { /* Subnet B config */ },
  privateKey: process.env.PRIVATE_KEY!
});

const paymentId = await warp.payAndWait(amount, 60000);
console.log("Cross-subnet payment verified:", paymentId);
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Warp402 SDK                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Warp402 (Main Class)                      │  │
│  │  • pay(amount)                                       │  │
│  │  • verify(paymentId)                                 │  │
│  │  • consume(paymentId)                                │  │
│  └────────────┬──────────────────────────┬──────────────┘  │
│               │                          │                  │
│  ┌────────────▼──────────────┐  ┌────────▼──────────────┐  │
│  │    SenderClient           │  │   ReceiverClient      │  │
│  │  • sendPayment()          │  │  • hasPaid()          │  │
│  │  • getBalance()           │  │  • getReceipt()       │  │
│  │                           │  │  • consume()          │  │
│  └────────────┬──────────────┘  └────────┬──────────────┘  │
│               │                          │                  │
└───────────────┼──────────────────────────┼──────────────────┘
                │                          │
                ▼                          ▼
      ┌─────────────────┐        ┌─────────────────┐
      │  WarpSender     │        │  WarpReceiver   │
      │  (Subnet A)     │───────▶│  (Subnet B)     │
      │                 │Teleporter│                │
      └─────────────────┘        └─────────────────┘
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

## License

MIT

## Links

- [Documentation](../README.md)
- [Smart Contracts](../wrapx402/src/)
- [Demo](../demo/)
- [GitHub](https://github.com/jayasurya0007/wrap-x402)
