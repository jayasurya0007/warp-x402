# 🤖 Automated Deployment Guide

This guide shows you how to use the automated deployment features in the Warp-402 SDK.

## Quick Start

Deploy contracts and start using the SDK in **30 seconds**:

```typescript
import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

// One command to deploy, configure, and initialize!
const warp = await Warp402Factory.quickSetup({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5"
  },
  receiverChain: {
    rpc: "http://127.0.0.1:9650/ext/bc/.../rpc",
    chainId: 1002,
    blockchainId: "0xc063de20578887dbbbf1ac65224ff343356e41827b7e82bbc8af8814310be481"
  }
});

// Ready to use immediately!
const paymentId = await warp.pay(ethers.parseEther("0.1"));
```

## What It Does

The automated deployment:

1. ✅ Deploys `WarpSender` on sender chain
2. ✅ Deploys `WarpReceiver` on receiver chain
3. ✅ Configures `WarpSender` to point to `WarpReceiver`
4. ✅ Configures `WarpReceiver` to trust `WarpSender`
5. ✅ Returns ready-to-use SDK instance

## Requirements

### You Need:

- **Private key** with AVAX on BOTH chains
- **~0.05 AVAX total** for deployment and configuration
  - WarpSender deployment: ~0.02 AVAX
  - WarpReceiver deployment: ~0.02 AVAX
  - Configuration: ~0.005 AVAX
- **RPC URLs** for both chains
- **Blockchain IDs** for both chains (32-byte hex format)

### Get Testnet AVAX:

- 🚰 Fuji Faucet: https://faucet.avax.network/

## API Reference

### `Warp402Factory.quickSetup(config)`

Deploy, configure, and initialize SDK in one call.

**Parameters:**
```typescript
{
  privateKey: string;
  senderChain: {
    rpc: string;           // RPC endpoint URL
    chainId: number;       // EVM chain ID
    blockchainId: string;  // Blockchain ID (0x...)
    messenger?: string;    // Teleporter address (optional)
  };
  receiverChain: {
    rpc: string;
    chainId: number;
    blockchainId: string;
    messenger?: string;
  };
}
```

**Returns:** `Promise<Warp402>` - Initialized SDK instance

**Example:**
```typescript
const warp = await Warp402Factory.quickSetup(config);
await warp.pay(ethers.parseEther("0.1"));
```

---

### `Warp402Factory.deployOnly(config)`

Deploy contracts without initializing SDK.

**Parameters:** Same as `quickSetup()`

**Returns:**
```typescript
Promise<{
  senderAddress: string;
  receiverAddress: string;
  senderTxHash: string;
  receiverTxHash: string;
  configTxHashes: {
    senderConfig: string;
    receiverConfig: string;
  };
}>
```

**Example:**
```typescript
const result = await Warp402Factory.deployOnly(config);
console.log('Sender:', result.senderAddress);
console.log('Receiver:', result.receiverAddress);

// Later, initialize SDK with deployed addresses
const warp = new Warp402({
  privateKey: config.privateKey,
  senderChain: { ...config.senderChain, sender: result.senderAddress },
  receiverChain: { ...config.receiverChain, receiver: result.receiverAddress }
});
```

---

### `Warp402Factory.configureOnly(params)`

Configure existing contracts (establish handshake).

**Parameters:**
```typescript
{
  privateKey: string;
  senderAddress: string;
  receiverAddress: string;
  senderChain: {
    rpc: string;
    blockchainId: string;
  };
  receiverChain: {
    rpc: string;
    blockchainId: string;
  };
}
```

**Returns:** `Promise<{ senderConfig: string; receiverConfig: string }>` - Transaction hashes

**Example:**
```typescript
await Warp402Factory.configureOnly({
  privateKey: process.env.PRIVATE_KEY!,
  senderAddress: "0x...",
  receiverAddress: "0x...",
  senderChain: { rpc: "...", blockchainId: "0x..." },
  receiverChain: { rpc: "...", blockchainId: "0x..." }
});
```

---

### `Warp402Factory.verify(params)`

Verify deployment and configuration.

**Parameters:**
```typescript
{
  senderAddress: string;
  receiverAddress: string;
  senderRpc: string;
  receiverRpc: string;
}
```

**Returns:** `Promise<boolean>` - `true` if valid

**Example:**
```typescript
const isValid = await Warp402Factory.verify({
  senderAddress: "0x...",
  receiverAddress: "0x...",
  senderRpc: "https://api.avax-test.network/ext/bc/C/rpc",
  receiverRpc: "http://127.0.0.1:9650/ext/bc/.../rpc"
});

if (isValid) {
  console.log('✅ Deployment verified');
}
```

---

## Complete Example

```typescript
import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

async function main() {
  console.log('🚀 Deploying Warp-402 contracts...\n');
  
  // Deploy and configure
  const warp = await Warp402Factory.quickSetup({
    privateKey: process.env.PRIVATE_KEY!,
    senderChain: {
      rpc: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5"
    },
    receiverChain: {
      rpc: "http://127.0.0.1:9650/ext/bc/2TjM8drQgU5cgi7rfBCJ3a6VKSMHq3oCQd8pDHwHo9Wf1KwGB9/rpc",
      chainId: 1002,
      blockchainId: "0xc063de20578887dbbbf1ac65224ff343356e41827b7e82bbc8af8814310be481"
    }
  });
  
  console.log('\n✅ Deployment complete!\n');
  
  // Test the deployment
  console.log('📊 Testing deployment...');
  
  const balance = await warp.getSenderBalance();
  console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX`);
  
  const senderConfig = await warp.getSenderConfig();
  console.log(`📤 Sender points to: ${senderConfig.remoteReceiver}`);
  
  const receiverConfig = await warp.getReceiverConfig();
  console.log(`📥 Receiver trusts: ${receiverConfig.approvedSender}`);
  
  // Send payment
  console.log('\n💸 Sending test payment...');
  const paymentId = await warp.pay(ethers.parseEther("0.01"));
  console.log(`✅ Payment sent: ${paymentId}`);
  
  // Wait for relay
  console.log('\n⏳ Waiting 30 seconds for Teleporter relay...');
  await new Promise(r => setTimeout(r, 30000));
  
  // Verify
  const verified = await warp.verify(paymentId);
  console.log(`\n${verified ? '✅' : '❌'} Payment verified: ${verified}`);
  
  if (verified) {
    await warp.consume(paymentId);
    console.log('✅ Payment consumed');
  }
}

main().catch(console.error);
```

## Comparison with Manual Deployment

### Automated (Warp402Factory)

```typescript
// ONE command
const warp = await Warp402Factory.quickSetup(config);
await warp.pay(ethers.parseEther("0.1"));
```

**Time:** ~30 seconds  
**Lines of code:** 10  
**Tools required:** None (just TypeScript)  
**Difficulty:** Easy

### Manual (Foundry)

```bash
# Multiple commands
git clone https://github.com/jayasurya0007/wrap-x402.git
cd wrap-x402/wrapx402
forge install
forge script script/DeployWarpSender.s.sol --rpc-url ... --broadcast
forge script script/DeployWarpReceiver.s.sol --rpc-url ... --broadcast
export SENDER_ADDRESS="0x..."
export RECEIVER_ADDRESS="0x..."
forge script script/ConfigureSender.s.sol --rpc-url ... --broadcast
```

**Time:** ~10 minutes  
**Lines of code:** 50+  
**Tools required:** Foundry, Git  
**Difficulty:** Advanced

## When to Use Which?

### Use Automated (`Warp402Factory`) When:

- ✅ Rapid prototyping / hackathons
- ✅ CI/CD pipelines
- ✅ Serverless deployments
- ✅ You want everything in TypeScript
- ✅ Quick testing on different networks

### Use Manual (Foundry) When:

- ✅ Need custom contract modifications
- ✅ Want contract verification on explorers
- ✅ Require specific compiler settings
- ✅ Multi-sig deployment
- ✅ Audit requirements

## Troubleshooting

### Error: "Insufficient funds"

**Solution:** Add more AVAX to your wallet. You need ~0.05 AVAX total on both chains.

```bash
# Get testnet AVAX
https://faucet.avax.network/
```

### Error: "Deployment transaction not found"

**Solution:** Check RPC URL is correct and chain is reachable.

```typescript
// Test RPC connection
const provider = new ethers.JsonRpcProvider(rpcUrl);
const chainId = await provider.getNetwork();
console.log('Connected to chain:', chainId.chainId);
```

### Error: "Receiver not set" or "Invalid sender"

**Solution:** Configuration failed. Run `Warp402Factory.configureOnly()` manually.

```typescript
await Warp402Factory.configureOnly({
  privateKey: process.env.PRIVATE_KEY!,
  senderAddress: "0x...",
  receiverAddress: "0x...",
  senderChain: { rpc: "...", blockchainId: "0x..." },
  receiverChain: { rpc: "...", blockchainId: "0x..." }
});
```

### Verify Deployment

Always verify after deployment:

```typescript
const isValid = await Warp402Factory.verify({
  senderAddress: result.senderAddress,
  receiverAddress: result.receiverAddress,
  senderRpc: config.senderChain.rpc,
  receiverRpc: config.receiverChain.rpc
});

if (!isValid) {
  console.error('❌ Deployment verification failed');
  // Re-run configuration
}
```

## Security Considerations

### Private Key Handling

```typescript
// ✅ Good - Use environment variables
const privateKey = process.env.PRIVATE_KEY!;

// ❌ Bad - Hardcode in source
const privateKey = "0x1234..."; // Never do this!
```

### Testnet vs Mainnet

```typescript
// ✅ Always test on testnet first
const TESTNET_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

// Only use mainnet when ready for production
const MAINNET_RPC = "https://api.avax.network/ext/bc/C/rpc";
```

### Save Deployed Addresses

```typescript
// Save addresses for later use
const result = await Warp402Factory.deployOnly(config);

fs.writeFileSync('deployed-contracts.json', JSON.stringify({
  senderAddress: result.senderAddress,
  receiverAddress: result.receiverAddress,
  senderTxHash: result.senderTxHash,
  receiverTxHash: result.receiverTxHash,
  timestamp: new Date().toISOString()
}, null, 2));
```

## Next Steps

- 📖 Read the [API Reference](../README.md#api-reference)
- 🎓 Try the [Examples](../examples/)
- 🚀 Build your HTTP 402 application
- 💬 Join our [Discord](#) for support
