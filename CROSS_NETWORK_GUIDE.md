# 🌉 Cross-Network Payment Guide

## Complete Guide for Sending Payments Between Local Subnet ↔ Fuji Testnet

This guide shows you **exactly** how to send cross-chain payments between your local subnet and Fuji testnet (or vice versa).

---

## 📋 Prerequisites

### What You Need

1. **Two Networks Running:**
   - Local subnet (your custom subnet)
   - Fuji testnet access

2. **Funded Wallets:**
   - Private key with AVAX on local subnet (for sending from local)
   - Private key with AVAX on Fuji (for sending from Fuji)
   - Same private key works on both networks

3. **Deployed Contracts:**
   - WarpSender deployed on sender chain
   - WarpReceiver deployed on receiver chain
   - Contracts must be configured to talk to each other

4. **Network Information:**
   - RPC endpoints for both networks
   - Chain IDs
   - Blockchain IDs
   - Teleporter Messenger addresses

---

## 🎯 Scenario 1: Local Subnet → Fuji Testnet

**Use Case:** You have a local subnet and want to send payments that are verified on Fuji.

### Step 1: Deploy Contracts

#### 1.1 Deploy WarpReceiver on Fuji (Destination)

```bash
cd wrapx402

# Set environment variables
export PRIVATE_KEY="your-private-key-here"
export RECEIVER_RPC="https://api.avax-test.network/ext/bc/C/rpc"

# Deploy WarpReceiver on Fuji
forge script script/DeployWarpReceiver.s.sol:DeployWarpReceiver \
  --rpc-url $RECEIVER_RPC \
  --broadcast \
  --legacy

# Save the deployed address
# Example output: WarpReceiver deployed at: 0xYourReceiverAddress
```

**Copy the deployed WarpReceiver address!** You'll need it in the next steps.

#### 1.2 Deploy WarpSender on Local Subnet (Source)

```bash
# Set local subnet RPC
export SENDER_RPC="http://127.0.0.1:9650/ext/bc/YOUR_SUBNET_ID/rpc"

# Deploy WarpSender on local subnet
forge script script/DeployWarpSender.s.sol:DeployWarpSender \
  --rpc-url $SENDER_RPC \
  --broadcast \
  --legacy

# Save the deployed address
# Example output: WarpSender deployed at: 0xYourSenderAddress
```

**Copy the deployed WarpSender address!**

### Step 2: Configure WarpSender to Talk to WarpReceiver

Create a configuration script or use the existing one:

```bash
# Edit script/ConfigureSender.s.sol
# Update these values:
# - RECEIVER_BLOCKCHAIN_ID: Fuji's blockchain ID (see below)
# - RECEIVER_ADDRESS: Your deployed WarpReceiver address from Step 1.1
```

**Fuji Blockchain ID:**
```
0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5
```

**Get your local subnet blockchain ID:**
```bash
# Method 1: From avalanche-cli
avalanche subnet describe YOUR_SUBNET_NAME

# Method 2: From RPC
curl -X POST --data '{
    "jsonrpc":"2.0",
    "id"     :1,
    "method" :"eth_chainId"
}' -H 'content-type:application/json;' $SENDER_RPC
```

Run configuration:
```bash
forge script script/ConfigureSender.s.sol:ConfigureSender \
  --rpc-url $SENDER_RPC \
  --broadcast \
  --legacy
```

### Step 3: Create SDK Configuration

Create a config file `cross-network-config.js`:

```javascript
export const config = {
  senderChain: {
    rpc: 'http://127.0.0.1:9650/ext/bc/YOUR_SUBNET_ID/rpc',
    chainId: 12345, // Your local subnet chain ID
    blockchainId: '0xYOUR_LOCAL_BLOCKCHAIN_ID',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf', // Teleporter on your subnet
    sender: '0xYourSenderAddress' // From Step 1.2
  },
  receiverChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: '0xYourReceiverAddress' // From Step 1.1
  },
  privateKey: process.env.PRIVATE_KEY
};
```

### Step 4: Send Payment from Local → Fuji

Create `send-local-to-fuji.js`:

```javascript
import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';
import { config } from './cross-network-config.js';

async function sendPayment() {
  console.log('🚀 Sending payment from Local Subnet → Fuji\n');
  
  // Initialize SDK
  const warp = new Warp402(config);
  
  // Generate unique payment ID
  const paymentId = ethers.hexlify(ethers.randomBytes(32));
  console.log('Payment ID:', paymentId);
  
  // Send payment (this happens on local subnet)
  console.log('\n📤 Sending payment on local subnet...');
  const amount = ethers.parseEther("0.1"); // 0.1 AVAX
  const txHash = await warp.pay(amount, paymentId);
  console.log('✅ Payment sent! TX:', txHash);
  
  // Wait for cross-chain message delivery
  console.log('\n⏳ Waiting for Teleporter to deliver message to Fuji...');
  console.log('   (This usually takes 5-10 seconds)');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Verify payment on Fuji
  console.log('\n🔍 Verifying payment on Fuji...');
  const receipt = await warp.verify(paymentId);
  
  if (receipt.paid) {
    console.log('✅ Payment verified on Fuji!');
    console.log('   Sender:', receipt.sender);
    console.log('   Amount:', ethers.formatEther(receipt.amount), 'AVAX');
    console.log('   Consumed:', receipt.consumed);
  } else {
    console.log('❌ Payment not found on Fuji yet. Wait longer or check logs.');
  }
  
  return paymentId;
}

sendPayment().catch(console.error);
```

**Run it:**
```bash
PRIVATE_KEY="your-key" node send-local-to-fuji.js
```

### Step 5: Consume Payment on Fuji (Backend)

Create `consume-on-fuji.js`:

```javascript
import { Warp402 } from 'avax-warp-pay';
import { config } from './cross-network-config.js';

async function consumePayment(paymentId) {
  console.log('🍽️  Consuming payment on Fuji\n');
  
  const warp = new Warp402(config);
  
  // Check if valid and not consumed
  const receipt = await warp.verify(paymentId);
  
  if (!receipt.paid) {
    console.log('❌ Payment not found');
    return;
  }
  
  if (receipt.consumed) {
    console.log('⚠️  Payment already consumed');
    return;
  }
  
  // Consume it
  console.log('📝 Consuming payment...');
  const txHash = await warp.consume(paymentId);
  console.log('✅ Payment consumed! TX:', txHash);
  
  // Verify consumed
  const updated = await warp.verify(paymentId);
  console.log('\n✅ Final status:');
  console.log('   Consumed:', updated.consumed);
}

// Usage
const paymentId = process.argv[2] || "0x..."; // Pass payment ID as argument
consumePayment(paymentId).catch(console.error);
```

**Run it:**
```bash
PRIVATE_KEY="your-key" node consume-on-fuji.js 0xYourPaymentId
```

---

## 🔄 Scenario 2: Fuji Testnet → Local Subnet

**Use Case:** Payments sent from Fuji, verified on your local subnet.

### Step 1: Deploy Contracts (Reversed)

#### 1.1 Deploy WarpReceiver on Local Subnet (Destination)

```bash
cd wrapx402

export PRIVATE_KEY="your-private-key-here"
export RECEIVER_RPC="http://127.0.0.1:9650/ext/bc/YOUR_SUBNET_ID/rpc"

forge script script/DeployWarpReceiver.s.sol:DeployWarpReceiver \
  --rpc-url $RECEIVER_RPC \
  --broadcast \
  --legacy
```

**Copy the WarpReceiver address!**

#### 1.2 Deploy WarpSender on Fuji (Source)

```bash
export SENDER_RPC="https://api.avax-test.network/ext/bc/C/rpc"

forge script script/DeployWarpSender.s.sol:DeployWarpSender \
  --rpc-url $SENDER_RPC \
  --broadcast \
  --legacy
```

**Copy the WarpSender address!**

### Step 2: Configure WarpSender on Fuji

Update `script/ConfigureSender.s.sol` with:
- **RECEIVER_BLOCKCHAIN_ID:** Your local subnet's blockchain ID
- **RECEIVER_ADDRESS:** WarpReceiver address from Step 1.1

```bash
forge script script/ConfigureSender.s.sol:ConfigureSender \
  --rpc-url $SENDER_RPC \
  --broadcast \
  --legacy
```

### Step 3: SDK Configuration (Reversed)

Create `cross-network-config-reversed.js`:

```javascript
export const config = {
  senderChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: '0xYourSenderOnFuji' // From Step 1.2
  },
  receiverChain: {
    rpc: 'http://127.0.0.1:9650/ext/bc/YOUR_SUBNET_ID/rpc',
    chainId: 12345, // Your local subnet chain ID
    blockchainId: '0xYOUR_LOCAL_BLOCKCHAIN_ID',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: '0xYourReceiverOnLocal' // From Step 1.1
  },
  privateKey: process.env.PRIVATE_KEY
};
```

### Step 4: Send Payment from Fuji → Local

Create `send-fuji-to-local.js`:

```javascript
import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';
import { config } from './cross-network-config-reversed.js';

async function sendPayment() {
  console.log('🚀 Sending payment from Fuji → Local Subnet\n');
  
  const warp = new Warp402(config);
  const paymentId = ethers.hexlify(ethers.randomBytes(32));
  
  console.log('Payment ID:', paymentId);
  console.log('\n📤 Sending payment on Fuji...');
  
  const amount = ethers.parseEther("0.1");
  const txHash = await warp.pay(amount, paymentId);
  console.log('✅ Payment sent! TX:', txHash);
  
  // Wait for cross-chain delivery
  console.log('\n⏳ Waiting for Teleporter to deliver to local subnet...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Verify on local subnet
  console.log('\n🔍 Verifying payment on local subnet...');
  const receipt = await warp.verify(paymentId);
  
  if (receipt.paid) {
    console.log('✅ Payment verified on local subnet!');
    console.log('   Amount:', ethers.formatEther(receipt.amount), 'AVAX');
  }
  
  return paymentId;
}

sendPayment().catch(console.error);
```

**Run it:**
```bash
PRIVATE_KEY="your-key" node send-fuji-to-local.js
```

---

## 🔧 Finding Your Network Information

### Get Local Subnet Blockchain ID

**Method 1: Using avalanche-cli**
```bash
avalanche subnet describe YOUR_SUBNET_NAME

# Look for "BlockchainID" in the output
```

**Method 2: Using RPC call**
```bash
curl -X POST --data '{
    "jsonrpc":"2.0",
    "id"     :1,
    "method" :"eth_chainId"
}' -H 'content-type:application/json;' http://127.0.0.1:9650/ext/bc/YOUR_SUBNET_ID/rpc
```

**Method 3: From subnet info**
```bash
avalanche subnet list --deployed

# The blockchain ID is shown in the output
```

### Get Local Subnet RPC URL

Your local subnet RPC URL format:
```
http://127.0.0.1:9650/ext/bc/[BLOCKCHAIN_ID]/rpc
```

You can find it in:
```bash
avalanche subnet describe YOUR_SUBNET_NAME | grep "RPC URL"
```

### Get Teleporter Messenger Address

**On Local Subnet:**
```bash
# Teleporter is usually pre-deployed at the same address
# Standard address: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf

# Verify it's deployed:
cast code 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf --rpc-url YOUR_LOCAL_RPC
```

**On Fuji:**
```
Teleporter Messenger: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf
```

---

## 🧪 Complete Working Example

### Full Integration: Local ↔ Fuji

Create `complete-example.js`:

```javascript
import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';

// Configuration for Local → Fuji
const localToFujiConfig = {
  senderChain: {
    rpc: 'http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc',
    chainId: 1001,
    blockchainId: '0x' + '1'.repeat(64), // Replace with your actual blockchain ID
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: '0xYourLocalSenderAddress'
  },
  receiverChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: '0xYourFujiReceiverAddress'
  },
  privateKey: process.env.PRIVATE_KEY
};

async function fullDemo() {
  console.log('🌉 Complete Cross-Network Payment Demo\n');
  console.log('=' .repeat(60));
  
  const warp = new Warp402(localToFujiConfig);
  
  // Step 1: Send payment
  console.log('\n📤 STEP 1: Sending payment from Local Subnet');
  console.log('-' .repeat(60));
  
  const paymentId = ethers.hexlify(ethers.randomBytes(32));
  const amount = ethers.parseEther("0.1");
  
  console.log('Payment ID:', paymentId);
  console.log('Amount:', ethers.formatEther(amount), 'AVAX');
  
  try {
    const sendTx = await warp.pay(amount, paymentId);
    console.log('✅ Payment sent!');
    console.log('   TX Hash:', sendTx);
  } catch (error) {
    console.error('❌ Failed to send payment:', error.message);
    return;
  }
  
  // Step 2: Wait for cross-chain delivery
  console.log('\n⏳ STEP 2: Waiting for Teleporter delivery');
  console.log('-' .repeat(60));
  console.log('Waiting 10 seconds for cross-chain message...');
  
  for (let i = 10; i > 0; i--) {
    process.stdout.write(`\r⏰ ${i} seconds remaining...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\r✅ Wait complete!                    \n');
  
  // Step 3: Verify on Fuji
  console.log('\n🔍 STEP 3: Verifying payment on Fuji');
  console.log('-' .repeat(60));
  
  try {
    const receipt = await warp.verify(paymentId);
    
    if (receipt.paid) {
      console.log('✅ PAYMENT VERIFIED ON FUJI!');
      console.log('\nReceipt Details:');
      console.log('  Payment ID:', paymentId);
      console.log('  Sender:', receipt.sender);
      console.log('  Amount:', ethers.formatEther(receipt.amount), 'AVAX');
      console.log('  Timestamp:', new Date(Number(receipt.timestamp) * 1000).toLocaleString());
      console.log('  Consumed:', receipt.consumed ? 'Yes' : 'No');
      console.log('  Expired:', receipt.expired ? 'Yes' : 'No');
    } else {
      console.log('⚠️  Payment not found yet. May need more time.');
      return;
    }
  } catch (error) {
    console.error('❌ Failed to verify:', error.message);
    return;
  }
  
  // Step 4: Consume payment
  console.log('\n🍽️  STEP 4: Consuming payment on Fuji');
  console.log('-' .repeat(60));
  
  try {
    const consumeTx = await warp.consume(paymentId);
    console.log('✅ Payment consumed!');
    console.log('   TX Hash:', consumeTx);
  } catch (error) {
    console.error('❌ Failed to consume:', error.message);
    return;
  }
  
  // Step 5: Verify consumed
  console.log('\n✅ STEP 5: Final verification');
  console.log('-' .repeat(60));
  
  const finalReceipt = await warp.verify(paymentId);
  console.log('Payment Status:');
  console.log('  Paid:', finalReceipt.paid ? '✅' : '❌');
  console.log('  Consumed:', finalReceipt.consumed ? '✅' : '❌');
  console.log('  Expired:', finalReceipt.expired ? '✅' : '❌');
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 Cross-network payment flow complete!');
  console.log('=' .repeat(60));
}

fullDemo().catch(console.error);
```

**Run it:**
```bash
PRIVATE_KEY="your-private-key" node complete-example.js
```

---

## 🐛 Troubleshooting

### Issue 1: "Payment not found after waiting"

**Cause:** Cross-chain message not delivered yet.

**Solution:**
```javascript
// Increase wait time
await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

// Or poll for receipt
async function waitForPayment(warp, paymentId, maxWait = 60000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const receipt = await warp.verify(paymentId);
    if (receipt.paid) {
      return receipt;
    }
    console.log('Waiting for payment... (' + Math.floor((Date.now() - startTime) / 1000) + 's)');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  throw new Error('Payment not received within timeout');
}
```

### Issue 2: "Transaction reverted: Remote receiver not configured"

**Cause:** WarpSender doesn't know about WarpReceiver.

**Solution:**
```bash
# Configure the sender with receiver info
forge script script/ConfigureSender.s.sol:ConfigureSender \
  --rpc-url $SENDER_RPC \
  --broadcast \
  --legacy
```

### Issue 3: "Insufficient funds"

**Cause:** Not enough AVAX on sender chain.

**Solution:**
```bash
# Check balance
cast balance YOUR_ADDRESS --rpc-url $SENDER_RPC

# Fund your address on local subnet
avalanche key fund YOUR_ADDRESS --subnet YOUR_SUBNET_NAME

# Fund on Fuji (use faucet)
# https://faucet.avax.network/
```

### Issue 4: "Teleporter message failed"

**Cause:** Teleporter relayer might not be running.

**Solution:**
```bash
# Check if AWM relayer is running
ps aux | grep awm-relayer

# Restart relayer if needed
# Follow: https://github.com/ava-labs/awm-relayer
```

### Issue 5: "Wrong blockchain ID"

**Cause:** Incorrect blockchain ID in config.

**Solution:**
```bash
# Get correct blockchain ID
avalanche subnet describe YOUR_SUBNET_NAME | grep BlockchainID

# Update your config with the correct value
```

---

## 📊 Network Configuration Cheat Sheet

### Fuji Testnet

```javascript
{
  rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
  chainId: 43113,
  blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
  messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
  faucet: 'https://faucet.avax.network/'
}
```

### Local Subnet (Template)

```javascript
{
  rpc: 'http://127.0.0.1:9650/ext/bc/[YOUR_BLOCKCHAIN_ID]/rpc',
  chainId: YOUR_CHAIN_ID, // e.g., 1001
  blockchainId: '0x[YOUR_BLOCKCHAIN_ID]',
  messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
}
```

---

## 🎯 Quick Reference Commands

### Deploy and Configure

```bash
# 1. Deploy receiver on destination chain
forge script script/DeployWarpReceiver.s.sol:DeployWarpReceiver \
  --rpc-url $RECEIVER_RPC --broadcast --legacy

# 2. Deploy sender on source chain
forge script script/DeployWarpSender.s.sol:DeployWarpSender \
  --rpc-url $SENDER_RPC --broadcast --legacy

# 3. Configure sender → receiver link
forge script script/ConfigureSender.s.sol:ConfigureSender \
  --rpc-url $SENDER_RPC --broadcast --legacy
```

### Check Deployment

```bash
# Check contract code exists
cast code 0xYourContractAddress --rpc-url $RPC_URL

# Check balance
cast balance 0xYourContractAddress --rpc-url $RPC_URL

# Check owner
cast call 0xYourContractAddress "owner()(address)" --rpc-url $RPC_URL
```

### Test Payment Flow

```bash
# Send payment
node send-payment.js

# Verify payment
node verify-payment.js 0xPaymentId

# Consume payment
node consume-payment.js 0xPaymentId
```

---

## ✅ Success Checklist

Before running cross-network payments, verify:

- [ ] Both networks are accessible (RPC endpoints work)
- [ ] WarpReceiver deployed on destination chain
- [ ] WarpSender deployed on source chain
- [ ] WarpSender configured with receiver address and blockchain ID
- [ ] Teleporter Messenger deployed on both chains
- [ ] Your wallet has AVAX on sender chain
- [ ] AWM Relayer is running (for cross-chain message delivery)
- [ ] SDK configuration has correct addresses and blockchain IDs
- [ ] You can call contracts on both chains

---

## 🚀 Next Steps

1. **Test locally first:** Local subnet A → Local subnet B
2. **Then test hybrid:** Local → Fuji or Fuji → Local
3. **Monitor logs:** Check Teleporter relayer logs for message delivery
4. **Implement retry logic:** Handle failed cross-chain messages
5. **Add monitoring:** Track payment success rates

---

## 📚 Additional Resources

- **Teleporter Docs:** https://github.com/ava-labs/teleporter
- **AWM Relayer:** https://github.com/ava-labs/awm-relayer
- **Avalanche CLI:** https://github.com/ava-labs/avalanche-cli
- **Fuji Faucet:** https://faucet.avax.network/

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.
