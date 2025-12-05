# 🔑 Private Key Usage Guide

## Understanding Private Keys in Warp-402

**TL;DR:** You need **different private keys** for different roles, and verification needs **NO private key at all**.

---

## 👤 Three Roles

### 1. **Payment Sender (Client)**
- **Needs:** Private key to sign payment transaction
- **Does:** Send payment from their wallet

### 2. **Payment Verifier (Server - Read Only)**
- **Needs:** NO private key! Just reads blockchain
- **Does:** Check if payment exists and is valid

### 3. **Payment Consumer (Server - Write)**
- **Needs:** Private key to sign consumption transaction
- **Does:** Mark payment as "used" to prevent replay

---

## 📝 Usage Examples

### Example 1: Client Sends Payment

```typescript
import { Warp402, PRESETS } from 'avax-warp-pay';
import { ethers } from 'ethers';

// CLIENT SIDE
const clientWarp = new Warp402({
  ...PRESETS.fuji,
  privateKey: process.env.CLIENT_PRIVATE_KEY  // Client's wallet
});

// Send payment
const paymentId = await clientWarp.pay(ethers.parseEther("0.1"));

// Send paymentId to server
fetch('/api/access', {
  headers: {
    'X-Payment-ID': paymentId
  }
});
```

**Private Key Needed:** ✅ Yes (client's own key)

---

### Example 2: Server Verifies Payment (Read-Only)

```typescript
import { ReceiverClient } from 'avax-warp-pay';

// SERVER SIDE - NO PRIVATE KEY NEEDED!
const receiver = new ReceiverClient(
  'https://api.avax-test.network/ext/bc/C/rpc',
  '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'  // Receiver contract address
  // 👈 No private key parameter!
);

// Verify payment
app.get('/api/access', async (req, res) => {
  const paymentId = req.headers['x-payment-id'];
  
  // Just reading - no private key needed!
  const isValid = await receiver.hasPaid(paymentId);
  
  if (isValid) {
    res.json({ access: 'granted' });
  } else {
    res.status(402).json({ error: 'Payment required' });
  }
});
```

**Private Key Needed:** ❌ No! (read-only operation)

---

### Example 3: Server Consumes Payment (Prevents Replay)

```typescript
import { Warp402, PRESETS } from 'avax-warp-pay';

// SERVER SIDE - Needs server's private key
const serverWarp = new Warp402({
  ...PRESETS.fuji,
  privateKey: process.env.SERVER_PRIVATE_KEY  // Server's wallet
});

app.post('/api/consume', async (req, res) => {
  const paymentId = req.body.paymentId;
  
  // First verify
  const isValid = await serverWarp.verify(paymentId);
  
  if (isValid) {
    // Consume to prevent reuse - needs private key!
    await serverWarp.consume(paymentId);
    res.json({ consumed: true });
  }
});
```

**Private Key Needed:** ✅ Yes (server's own key)

---

## 🎯 Complete Flow with Different Keys

```typescript
// ============================================
// CLIENT SIDE (User's Browser/App)
// ============================================
import { Warp402, PRESETS } from 'avax-warp-pay';

const clientWarp = new Warp402({
  ...PRESETS.fuji,
  privateKey: userPrivateKey  // 🔑 User's wallet key
});

// 1. User pays
const paymentId = await clientWarp.pay(ethers.parseEther("0.1"));
console.log('Payment sent:', paymentId);

// 2. User sends payment ID to server
const response = await fetch('https://api.example.com/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ paymentId })
});


// ============================================
// SERVER SIDE (Your Backend)
// ============================================
import express from 'express';
import { ReceiverClient, Warp402, PRESETS } from 'avax-warp-pay';

const app = express();

// For read-only operations (NO private key)
const receiver = new ReceiverClient(
  PRESETS.fuji.receiverChain.rpc,
  PRESETS.fuji.receiverChain.receiver
);

// For write operations (consume)
const serverWarp = new Warp402({
  ...PRESETS.fuji,
  privateKey: process.env.SERVER_PRIVATE_KEY  // 🔑 Server's key
});

// 3. Server verifies payment (NO PRIVATE KEY NEEDED)
app.post('/verify', async (req, res) => {
  const { paymentId } = req.body;
  
  const receipt = await receiver.getReceipt(paymentId);
  
  if (receipt && receipt.paid && !receipt.consumed) {
    res.json({ 
      valid: true,
      amount: receipt.amount.toString()
    });
  } else {
    res.status(402).json({ valid: false });
  }
});

// 4. Server consumes payment (PRIVATE KEY NEEDED)
app.post('/access', async (req, res) => {
  const { paymentId } = req.body;
  
  // Verify first
  const isValid = await receiver.hasPaid(paymentId);
  
  if (!isValid) {
    return res.status(402).json({ error: 'Invalid payment' });
  }
  
  // Consume with server's private key
  await serverWarp.consume(paymentId);
  
  // Grant access
  res.json({ 
    data: 'Your premium content',
    consumed: true
  });
});

app.listen(3000);
```

---

## 🔒 Security Best Practices

### ✅ DO:

1. **Keep private keys separate:**
   ```bash
   # Client .env
   CLIENT_PRIVATE_KEY=0xabc123...
   
   # Server .env
   SERVER_PRIVATE_KEY=0xdef456...  # Different key!
   ```

2. **Use read-only for verification:**
   ```typescript
   // Use ReceiverClient (no private key) for just checking
   const receiver = new ReceiverClient(rpc, address);
   const isValid = await receiver.hasPaid(paymentId);
   ```

3. **Only consume when granting access:**
   ```typescript
   // Verify first (free, read-only)
   if (await receiver.hasPaid(paymentId)) {
     // Then consume (costs gas, needs private key)
     await serverWarp.consume(paymentId);
   }
   ```

### ❌ DON'T:

1. **Never expose server's private key to client**
2. **Never consume payment before verifying it**
3. **Don't use same private key for client and server**

---

## 💡 Simplified Pattern for Most Use Cases

### For Simple Applications:

```typescript
// ============================================
// CLIENT (needs private key)
// ============================================
const payment = await clientWarp.pay("0.1");
// Send payment.id to server


// ============================================
// SERVER (NO private key for verification)
// ============================================
const receiver = new ReceiverClient(rpc, contractAddress);

// Just verify (no key needed)
const isValid = await receiver.hasPaid(paymentId);

if (isValid) {
  // Grant access without consuming
  return premiumContent;
}

// Optional: Consume later with server's key to prevent replay
```

---

## 🎯 Quick Reference

| Operation | Private Key Needed? | Whose Key? |
|-----------|---------------------|------------|
| **Send Payment** | ✅ Yes | Client's key |
| **Verify Payment** | ❌ No | None (read-only) |
| **Consume Payment** | ✅ Yes | Server's key |
| **Check Receipt** | ❌ No | None (read-only) |
| **Get Balance** | ❌ No | None (read-only) |

---

## 🚀 Real-World Example: API Paywall

```typescript
// CLIENT CODE
import { Warp402, PRESETS } from 'avax-warp-pay';

const warp = new Warp402({
  ...PRESETS.fuji,
  privateKey: userWallet.privateKey  // User's MetaMask key
});

async function accessPremiumAPI() {
  // 1. Pay for access
  const paymentId = await warp.pay(ethers.parseEther("0.01"));
  
  // 2. Call API with payment ID
  const response = await fetch('https://api.example.com/premium', {
    headers: {
      'Authorization': `Payment ${paymentId}`
    }
  });
  
  return response.json();
}


// SERVER CODE
import { ReceiverClient } from 'avax-warp-pay';

// Initialize without private key (read-only)
const receiver = new ReceiverClient(
  process.env.RECEIVER_RPC,
  process.env.RECEIVER_CONTRACT
);

app.get('/premium', async (req, res) => {
  const paymentId = req.headers.authorization?.replace('Payment ', '');
  
  if (!paymentId) {
    return res.status(402).json({ error: 'Payment required' });
  }
  
  // Verify payment - NO PRIVATE KEY NEEDED!
  const receipt = await receiver.getReceipt(paymentId);
  
  if (!receipt || !receipt.paid) {
    return res.status(402).json({ error: 'Invalid payment' });
  }
  
  if (receipt.consumed) {
    return res.status(402).json({ error: 'Payment already used' });
  }
  
  // Optional: Consume to prevent reuse
  // (This would need server's private key)
  
  // Grant access
  res.json({ data: 'Premium data here' });
});
```

---

## Summary

**You were absolutely right!** 

- **Sender needs private key** ✅ (to send payment)
- **Verifier needs NO private key** ✅ (just reads blockchain)
- **Consumer needs private key** ✅ (but server's key, not client's!)

Your SDK already supports this - just use `ReceiverClient` directly for read-only operations!
