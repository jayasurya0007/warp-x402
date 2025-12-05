# Warp-402 SDK Examples

This directory contains example scripts demonstrating various use cases of the Warp-402 SDK.

## Examples

### 1. local-demo.ts
Demonstrates cross-chain payment between two local Avalanche subnets.

**Prerequisites:**
- Local Avalanche network with 2 subnets running
- WarpSender deployed on subnet A
- WarpReceiver deployed on subnet B
- ICM relayer running

**Run:**
```bash
PRIVATE_KEY=your_key \
SENDER_ADDRESS=0x... \
RECEIVER_ADDRESS=0x... \
npm run test
```

### 2. fuji-demo.ts
Demonstrates payment on Fuji C-Chain testnet.

**Prerequisites:**
- Funded wallet on Fuji C-Chain
- Get testnet AVAX from https://faucet.avax.network/

**Run:**
```bash
PRIVATE_KEY=your_key \
FUJI_SENDER=0x0d45537c1DA893148dBB113407698E20CfA2eE56 \
FUJI_RECEIVER=0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f \
ts-node examples/fuji-demo.ts
```

**Note:** Current Fuji deployment has both contracts on C-Chain (same blockchain ID), so Teleporter cross-chain messaging won't activate. This is for demonstration of contract interaction only.

### 3. cross-subnet-demo.ts
Production-ready pattern for cross-subnet payments.

**Prerequisites:**
- Two different Avalanche chains/subnets
- WarpSender on source chain
- WarpReceiver on destination chain
- ICM relayer monitoring both chains

**Environment Variables:**
```bash
PRIVATE_KEY=your_private_key
SENDER_RPC=http://subnet-a-rpc
SENDER_CHAIN_ID=12345
SENDER_BLOCKCHAIN_ID=0x...
SENDER_CONTRACT=0x...
RECEIVER_RPC=http://subnet-b-rpc
RECEIVER_CHAIN_ID=54321
RECEIVER_BLOCKCHAIN_ID=0x...
RECEIVER_CONTRACT=0x...
```

**Run:**
```bash
source .env
ts-node examples/cross-subnet-demo.ts
```

### 4. http402-server.ts
HTTP 402 Payment Required server with tiered API pricing.

**Features:**
- Multiple pricing tiers (0.01, 0.1, 1.0 tokens)
- Automatic payment verification
- One-time payment consumption
- Health check endpoint
- Pricing information endpoint

**Run:**
```bash
PORT=3402 ts-node examples/http402-server.ts
```

**API Endpoints:**
- `GET /api/public` - Free endpoint
- `GET /api/data` - 0.01 tokens (requires X-Payment-Id header)
- `GET /api/premium` - 0.1 tokens (requires X-Payment-Id header)
- `GET /api/exclusive` - 1.0 tokens (requires X-Payment-Id header)
- `GET /api/pricing` - Show all prices
- `GET /health` - Server health check

**Usage:**
```bash
# 1. Send payment using SDK
const paymentId = await warp.pay(ethers.parseEther("0.01"));

# 2. Wait for cross-chain verification

# 3. Call API with payment ID
curl -H "X-Payment-Id: <payment-id>" http://localhost:3402/api/data
```

## Common Issues

### Payment Not Verified
- **Cause:** ICM relayer not running or cross-chain delivery not complete
- **Solution:** Wait 10-30 seconds, ensure relayer is monitoring both chains

### Same Blockchain ID
- **Cause:** Both contracts on same chain (e.g., both on Fuji C-Chain)
- **Solution:** Deploy to different chains/subnets for real cross-chain messaging

### Insufficient Balance
- **Cause:** Wallet has insufficient funds
- **Solution:** Fund wallet with native tokens for gas + payment amount

### Contract Configuration Mismatch
- **Cause:** Sender/receiver not properly configured in contracts
- **Solution:** Verify contract configuration with `getSenderConfig()` and `getReceiverConfig()`

## Testing

All examples include inline comments and error handling. Run them in sequence to understand the full payment flow:

1. Start with `local-demo.ts` on local network (full functionality)
2. Try `fuji-demo.ts` for testnet interaction (contract calls only)
3. Use `cross-subnet-demo.ts` pattern for production deployment
4. Integrate `http402-server.ts` pattern into your API

## Next Steps

- Modify examples for your specific use case
- Deploy contracts to your subnets
- Configure ICM relayer
- Build your HTTP 402 API
- Integrate SDK into your application
