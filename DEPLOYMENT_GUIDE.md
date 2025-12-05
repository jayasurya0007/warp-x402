# Contract Deployment Guide

**Before using `avax-warp-pay` SDK, you MUST deploy the smart contracts.**

## Quick Answer

**YES, you need to deploy contracts first!** The SDK is a client library that talks to your deployed smart contracts. It cannot work without them.

## What You Need

### 1. Smart Contracts (Included in Repository)
- `WarpSender.sol` - Handles payments on source chain
- `WarpReceiver.sol` - Receives and validates on destination chain
- `TeleporterInterfaces.sol` - Required interfaces

**Location**: [`/wrapx402/src/`](../wrapx402/src/)

### 2. Deployment Tools
- [Foundry](https://book.getfoundry.sh/) (for contract deployment)
- RPC endpoints for both chains
- Private key with funds for deployment

### 3. Networks
Both chains must support [Avalanche Teleporter](https://docs.avax.network/cross-chain/teleporter/overview):
- ✅ Fuji Testnet (C-Chain)
- ✅ Avalanche Mainnet (C-Chain)
- ✅ Custom Avalanche Subnets with Teleporter
- ✅ Local Avalanche networks

## Deployment Steps

### Step 1: Clone Repository

```bash
git clone https://github.com/jayasurya0007/wrap-x402.git
cd wrap-x402/wrapx402
```

### Step 2: Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Step 3: Set Environment Variables

Create `.env` file:

```bash
# Chain A (Source Chain - where payments are sent FROM)
SUBNET_A_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SUBNET_A_CHAIN_ID=43113

# Chain B (Destination Chain - where receipts are verified)
SUBNET_B_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SUBNET_B_CHAIN_ID=43113

# Teleporter Messenger (same on both chains for Fuji/Mainnet)
TELEPORTER_MESSENGER_ADDRESS=0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf

# Your deployer private key (needs funds on both chains)
PRIVATE_KEY=0x...
```

### Step 4: Deploy Contracts

#### Deploy WarpReceiver on Chain B (Destination)

```bash
forge script script/DeployWarpReceiver.s.sol \
  --rpc-url $SUBNET_B_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

**Save the deployed address!** Example output:
```
WarpReceiver deployed at: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

#### Deploy WarpSender on Chain A (Source)

```bash
forge script script/DeployWarpSender.s.sol \
  --rpc-url $SUBNET_A_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

**Save the deployed address!** Example output:
```
WarpSender deployed at: 0x8dB97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
```

### Step 5: Configure Contracts

Get blockchain IDs:
```bash
# For Fuji C-Chain
SUBNET_A_BLOCKCHAIN_ID=0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5
SUBNET_B_BLOCKCHAIN_ID=0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5
```

Configure WarpSender to know about WarpReceiver:
```bash
# Set in your environment or script
export WARP_SENDER_ADDRESS=0x8dB97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
export WARP_RECEIVER_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
export REMOTE_BLOCKCHAIN_ID=$SUBNET_B_BLOCKCHAIN_ID

forge script script/ConfigureSender.s.sol \
  --rpc-url $SUBNET_A_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Step 6: Verify Deployment

Check contracts are configured:
```bash
# Check WarpSender
cast call $WARP_SENDER_ADDRESS "remoteReceiver()(address)" --rpc-url $SUBNET_A_RPC_URL

# Check WarpReceiver  
cast call $WARP_RECEIVER_ADDRESS "owner()(address)" --rpc-url $SUBNET_B_RPC_URL
```

## Now Use the SDK!

Once deployed, use these addresses in your SDK configuration:

```javascript
import { Warp402 } from 'avax-warp-pay';

const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY,
  senderChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0x8dB97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC" // ← Your deployed WarpSender
  },
  receiverChain: {
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    chainId: 43113,
    blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" // ← Your deployed WarpReceiver
  }
});

// Now you can use the SDK!
const paymentId = await warp.pay(ethers.parseEther("1"));
```

## Alternative: Use Pre-Deployed Contracts

If someone else has already deployed contracts and shared the addresses, you can skip deployment and just use their addresses in the SDK configuration. Just make sure:

1. You have the contract addresses
2. You have access to both RPC endpoints
3. The contracts are properly configured
4. You have a private key with funds to send transactions

## Troubleshooting

### "Contract not found" error
- Verify contract addresses are correct
- Check you're using the right RPC URL
- Ensure contracts were deployed successfully

### "Transaction reverted" error
- Check you have sufficient balance
- Verify contracts are configured (run ConfigureSender.s.sol)
- Ensure Teleporter messenger address is correct

### Teleporter not relaying messages
- Wait 10-30 seconds for ICM relayer
- Check both chains support Teleporter
- Verify blockchain IDs are correct
- Make sure AWM relayer is running (if using custom subnets)

## Cost Estimates

**Deployment (One-time)**:
- WarpSender: ~0.02 AVAX gas
- WarpReceiver: ~0.02 AVAX gas  
- Configuration: ~0.005 AVAX gas
- **Total: ~0.045 AVAX per deployment** (~$1.50 at $35/AVAX)

**Per Transaction (Ongoing)**:
- Send payment: ~0.002 AVAX
- Verify/consume: ~0.001 AVAX
- **Total per payment: ~0.003 AVAX** (~$0.10 at $35/AVAX)

## Need Help?

- **Contracts**: [`/wrapx402/src/`](../wrapx402/src/)
- **Scripts**: [`/wrapx402/script/`](../wrapx402/script/)
- **Examples**: [`/demo/`](../demo/)
- **Issues**: [GitHub Issues](https://github.com/jayasurya0007/wrap-x402/issues)

---

**Once deployed, you're ready to use `avax-warp-pay` SDK!** 🚀
