# avax-warp-pay

Cross-chain payment SDK for Avalanche.  
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

Deploy using:

- **CLI:** `npx avax-warp-pay deploy`
- **Code:** `Warp402Factory.quickSetup()`
- **Foundry:** manual deployment

**Full deployment guide:** [https://github.com/jayasurya0007/wrap-x402/tree/main/wrapx402](https://github.com/jayasurya0007/wrap-x402/tree/main/wrapx402)

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
- **GitHub:** [https://github.com/jayasurya0007/wrap-x402](https://github.com/jayasurya0007/wrap-x402)
- **Contracts:** [/wrapx402/src](https://github.com/jayasurya0007/wrap-x402/tree/main/wrapx402/src)
