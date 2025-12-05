# Getting Started with Warp-402 SDK

A simple guide to using the Warp-402 SDK for cross-chain payment receipts on Avalanche.

## What is Warp-402?

Warp-402 lets you send **payment receipts** from one Avalanche chain to another. Instead of moving tokens, you prove "I paid on Chain A" and verify it on Chain B.

**Think of it like this:**
1. 🏪 Pay at store on Chain A
2. 📧 Get receipt sent to Chain B
3. ✅ Show receipt to access service on Chain B
4. 🔒 Receipt gets marked "used" (can't reuse)

## Installation

```bash
npm install warp402-sdk ethers
```

## Basic Usage (3 Steps)

### Step 1: Setup the SDK

```typescript
import { Warp402 } from 'warp402-sdk';
import { ethers } from 'ethers';

const warp = new Warp402({
  privateKey: "0xYourPrivateKey",
  
  // Chain where you PAY
  senderChain: {
    rpc: "http://localhost:9650/ext/bc/subnetA/rpc",
    chainId: 1001,
    blockchainId: "0xYourSubnetABlockchainId",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xYourWarpSenderAddress"
  },
  
  // Chain where you VERIFY payment
  receiverChain: {
    rpc: "http://localhost:9650/ext/bc/subnetB/rpc",
    chainId: 1002,
    blockchainId: "0xYourSubnetBBlockchainId",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xYourWarpReceiverAddress"
  }
});
```

### Step 2: Send Payment

```typescript
// Pay 1 AVAX on sender chain
const amount = ethers.parseEther("1");
const paymentId = await warp.pay(amount);

console.log("✅ Payment sent!");
console.log("📝 Payment ID:", paymentId);
console.log("⏳ Waiting for Teleporter to relay...");
```

### Step 3: Verify & Use Payment

```typescript
// Wait ~10 seconds for Teleporter relay
await new Promise(resolve => setTimeout(resolve, 10000));

// Check if payment arrived
const isVerified = await warp.verify(paymentId);

if (isVerified) {
  console.log("✅ Payment verified on receiver chain!");
  
  // Get full receipt details
  const receipt = await warp.getReceipt(paymentId);
  console.log("Amount paid:", ethers.formatEther(receipt.amount), "AVAX");
  console.log("From:", receipt.payer);
  
  // Consume payment (one-time use only)
  const result = await warp.consume(paymentId);
  console.log("🔒 Payment consumed! TX:", result.hash);
}
```

## Complete Example

```typescript
import { Warp402 } from 'warp402-sdk';
import { ethers } from 'ethers';

async function main() {
  // 1. Initialize SDK
  const warp = new Warp402({
    privateKey: process.env.PRIVATE_KEY!,
    senderChain: {
      rpc: "http://localhost:9650/ext/bc/subnetA/rpc",
      chainId: 1001,
      blockchainId: "0x...",
      messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
      sender: "0xSenderAddress"
    },
    receiverChain: {
      rpc: "http://localhost:9650/ext/bc/subnetB/rpc",
      chainId: 1002,
      blockchainId: "0x...",
      messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
      receiver: "0xReceiverAddress"
    }
  });

  try {
    // 2. Send payment
    console.log("Sending payment...");
    const paymentId = await warp.pay(ethers.parseEther("1"));
    console.log("Payment ID:", paymentId);

    // 3. Wait for cross-chain relay
    console.log("Waiting for Teleporter relay...");
    await new Promise(resolve => setTimeout(resolve, 15000));

    // 4. Verify payment
    const verified = await warp.verify(paymentId);
    console.log("Verified:", verified);

    if (verified) {
      // 5. Get receipt details
      const receipt = await warp.getReceipt(paymentId);
      console.log("Receipt:", {
        payer: receipt.payer,
        amount: ethers.formatEther(receipt.amount),
        timestamp: new Date(Number(receipt.timestamp) * 1000)
      });

      // 6. Consume payment
      await warp.consume(paymentId);
      console.log("Payment consumed successfully!");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
```

## Quick Reference

### Main Methods

| Method | What it does | Returns |
|--------|-------------|---------|
| `pay(amount)` | Send payment on Chain A | Payment ID |
| `verify(paymentId)` | Check if payment arrived on Chain B | true/false |
| `getReceipt(paymentId)` | Get full payment details | Receipt object |
| `consume(paymentId)` | Mark payment as used (one-time) | Transaction result |
| `payAndWait(amount)` | Pay + auto-wait for verification | Payment ID |

### Configuration

```typescript
interface Warp402Config {
  privateKey: string;           // Your wallet private key
  senderChain: {
    rpc: string;                // Chain A RPC URL
    chainId: number;            // Chain A EVM ID (e.g., 1001)
    blockchainId: string;       // Chain A blockchain ID (hex)
    messenger: string;          // Teleporter address
    sender: string;             // WarpSender contract
  };
  receiverChain: {
    rpc: string;                // Chain B RPC URL
    chainId: number;            // Chain B EVM ID (e.g., 1002)
    blockchainId: string;       // Chain B blockchain ID (hex)
    messenger: string;          // Teleporter address
    receiver: string;           // WarpReceiver contract
  };
}
```

## Real-World Examples

### Example 1: HTTP 402 Paywall

```typescript
import express from 'express';
import { Warp402 } from 'warp402-sdk';

const app = express();
const warp = new Warp402(config);

// Protected endpoint
app.get('/premium-content', async (req, res) => {
  const paymentId = req.headers['x-payment-id'];
  
  // No payment? Return 402
  if (!paymentId) {
    return res.status(402).json({
      error: 'Payment Required',
      price: ethers.parseEther("1").toString(),
      instructions: "Send payment and include payment ID in header"
    });
  }
  
  // Verify payment
  if (!(await warp.verify(paymentId))) {
    return res.status(402).json({ error: 'Invalid or unverified payment' });
  }
  
  // Consume payment (one-time use)
  await warp.consume(paymentId);
  
  // Return protected content
  res.json({ content: 'Your premium data here!' });
});

app.listen(3000);
```

### Example 2: Cross-Subnet Access

```typescript
// User pays on Subnet A
const paymentId = await warp.pay(ethers.parseEther("5"));

// Give payment ID to user
console.log("Give this to the user:", paymentId);

// Later, on Subnet B...
// User presents payment ID
if (await warp.verify(paymentId)) {
  // Grant access to Subnet B service
  await grantAccess(user);
  await warp.consume(paymentId);
}
```

### Example 3: Automatic Verification

```typescript
// Use payAndWait() to automatically wait for verification
try {
  const paymentId = await warp.payAndWait(
    ethers.parseEther("1"),
    60000,  // Wait up to 60 seconds
    2000    // Check every 2 seconds
  );
  
  console.log("Payment verified:", paymentId);
  // Ready to consume immediately!
  await warp.consume(paymentId);
  
} catch (error) {
  console.error("Payment failed or timeout:", error);
}
```

## Common Patterns

### Pattern 1: Pay → Wait → Verify → Consume

```typescript
const paymentId = await warp.pay(amount);
await sleep(15000);  // Wait for relay
if (await warp.verify(paymentId)) {
  await warp.consume(paymentId);
}
```

### Pattern 2: Auto-Wait

```typescript
const paymentId = await warp.payAndWait(amount);
await warp.consume(paymentId);  // Already verified!
```

### Pattern 3: Polling

```typescript
const paymentId = await warp.pay(amount);

// Poll until verified
while (!(await warp.verify(paymentId))) {
  console.log("Waiting for payment...");
  await sleep(2000);
}

await warp.consume(paymentId);
```

## Configuration Examples

### Local Network (Two Subnets)

```typescript
const config = {
  privateKey: "0xYourKey",
  senderChain: {
    rpc: "http://127.0.0.1:9650/ext/bc/subnetA/rpc",
    chainId: 1001,
    blockchainId: "0xYourSubnetAId",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xWarpSenderAddress"
  },
  receiverChain: {
    rpc: "http://127.0.0.1:9650/ext/bc/subnetB/rpc",
    chainId: 1002,
    blockchainId: "0xYourSubnetBId",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xWarpReceiverAddress"
  }
};
```

### Fuji Testnet

```typescript
const config = {
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0x0d45537c1DA893148dBB113407698E20CfA2eE56"
  },
  receiverChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f"
  }
};
```

## Error Handling

```typescript
try {
  const paymentId = await warp.pay(amount);
  
  // Wait for relay
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // Check verification
  if (!(await warp.verify(paymentId))) {
    throw new Error("Payment not verified");
  }
  
  // Try to consume
  await warp.consume(paymentId);
  
} catch (error) {
  if (error.message.includes("already consumed")) {
    console.log("Payment was already used");
  } else if (error.message.includes("insufficient funds")) {
    console.log("Not enough balance to pay");
  } else {
    console.error("Payment failed:", error.message);
  }
}
```

## Troubleshooting

### Payment not verifying?

1. **Wait longer** - Teleporter relay takes ~10-15 seconds
2. **Check blockchain IDs** - Must be exact hex values from `eth_chainId`
3. **Check Teleporter relay** - Is it running? Check relay logs
4. **Check balances** - Sender needs AVAX for gas

### Transaction failing?

1. **Insufficient gas** - Fund your wallet with AVAX
2. **Wrong contract addresses** - Double-check deployment addresses
3. **Network issues** - Check RPC connectivity
4. **Already consumed** - Payment can only be used once

### Can't find blockchain ID?

```bash
# Get blockchain ID from RPC
curl -X POST --data '{
  "jsonrpc":"2.0",
  "id":1,
  "method":"eth_chainId",
  "params":[]
}' -H 'content-type:application/json;' http://localhost:9650/ext/bc/YOURCHAIN/rpc
```

## Next Steps

- 📚 [Full API Documentation](./README.md)
- 💻 [Example Code](./examples/)
- 🧪 [Test Suite](./test/)
- 🔗 [Smart Contracts](../wrapx402/src/)

## Support

- GitHub Issues: [github.com/jayasurya0007/wrap-x402/issues](https://github.com/jayasurya0007/wrap-x402/issues)
- Documentation: [README.md](./README.md)

---

**Quick Summary:**
1. Install: `npm install warp402-sdk`
2. Setup: `new Warp402(config)`
3. Pay: `await warp.pay(amount)`
4. Wait: `await sleep(15000)`
5. Verify: `await warp.verify(paymentId)`
6. Consume: `await warp.consume(paymentId)`

Done! 🎉
