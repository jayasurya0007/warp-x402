# Warp-402 SDK - Quick Start

## 🚀 Installation
```bash
npm install warp402-sdk ethers
```

## ⚡ 5-Minute Setup

### 1. Import & Configure
```typescript
import { Warp402 } from 'warp402-sdk';
import { ethers } from 'ethers';

const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "http://localhost:9650/ext/bc/subnetA/rpc",
    chainId: 1001,
    blockchainId: "0x...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xYourWarpSenderAddress"
  },
  receiverChain: {
    rpc: "http://localhost:9650/ext/bc/subnetB/rpc",
    chainId: 1002,
    blockchainId: "0x...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xYourWarpReceiverAddress"
  }
});
```

### 2. Send Payment
```typescript
const paymentId = await warp.pay(ethers.parseEther("1"));
console.log("Payment sent:", paymentId);
```

### 3. Wait for Relay
```typescript
// Wait 10-15 seconds for Teleporter
await new Promise(resolve => setTimeout(resolve, 10000));
```

### 4. Verify & Consume
```typescript
if (await warp.verify(paymentId)) {
  await warp.consume(paymentId);
  console.log("Payment consumed!");
}
```

## 📖 Full Documentation

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete beginner guide with examples
- **[README.md](./README.md)** - Full API reference
- **[examples/](./examples/)** - Working code examples

## 🎯 Common Use Cases

### HTTP 402 Paywall
```typescript
app.get('/api/data', async (req, res) => {
  const paymentId = req.headers['x-payment-id'];
  if (!paymentId || !(await warp.verify(paymentId))) {
    return res.status(402).json({ error: 'Payment Required' });
  }
  await warp.consume(paymentId);
  res.json({ data: 'Protected content' });
});
```

### Auto-Wait Pattern
```typescript
// Pay and automatically wait for verification
const paymentId = await warp.payAndWait(ethers.parseEther("1"));
await warp.consume(paymentId);
```

## 📚 Learn More

| Topic | File | Description |
|-------|------|-------------|
| Getting Started | [GETTING_STARTED.md](./GETTING_STARTED.md) | Simple guide for beginners |
| API Reference | [README.md](./README.md) | Complete API documentation |
| Local Demo | [examples/local-demo.ts](./examples/local-demo.ts) | Full payment flow |
| HTTP 402 Server | [examples/http402-server.ts](./examples/http402-server.ts) | Paywall implementation |
| Tests | [test/](./test/) | Test suites and examples |

## 🆘 Need Help?

**Quick troubleshooting:**
- Payment not verifying? → Wait longer (15-20 seconds)
- Transaction failing? → Check wallet has AVAX for gas
- Configuration error? → Verify blockchain IDs are correct hex values

**Full troubleshooting guide:** See GETTING_STARTED.md section "Troubleshooting"
