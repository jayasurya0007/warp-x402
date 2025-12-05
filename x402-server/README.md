# x402 Payment Server

HTTP 402 "Payment Required" server for cross-chain Avalanche payments using Teleporter/ICM.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start
```

Server runs on `http://localhost:3000`

## Endpoints

- **GET /resource** - Request protected resource (returns 402 with payment details)
- **GET /verify/:paymentId** - Verify payment receipt on-chain
- **POST /consume/:paymentId** - Consume payment and access resource
- **GET /health** - Health check

## Usage Flow

1. **Request Resource** → Get 402 with `paymentId`
2. **Send Payment** → Use `WarpSender.sendPayment()` on Subnet A
3. **Wait** → ~10 seconds for ICM relayer
4. **Verify** → Check payment via `/verify/:paymentId`
5. **Consume** → Access resource via `/consume/:paymentId`

## Example

```bash
# Get payment ID
curl http://localhost:3000/resource

# Send payment (use payment ID from above)
cast send 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922 \
  "sendPayment(bytes32)" 0x... \
  --value 1000000000000000000 \
  --private-key 0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027 \
  --rpc-url http://127.0.0.1:9652/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc

# Wait for delivery
sleep 10

# Verify payment
curl http://localhost:3000/verify/0x...

# Consume payment
curl -X POST http://localhost:3000/consume/0x...
```

## Configuration

Environment variables in `.env`:

- `PORT` - Server port (default: 3000)
- `SUBNET_B_RPC_URL` - RPC URL for receiver chain
- `WARP_RECEIVER_ADDRESS` - WarpReceiver contract address
- `WARP_SENDER_ADDRESS` - WarpSender contract address
- `SUBNET_A_CHAIN_ID` - Source chain ID
- `SUBNET_B_CHAIN_ID` - Destination chain ID
- `DEFAULT_PAYMENT_AMOUNT_WEI` - Default payment amount in wei
- `PRIVATE_KEY` - Private key for consuming payments

## Documentation

See [X402_SERVER.md](./X402_SERVER.md) for complete documentation including:
- Detailed API reference
- Security considerations
- Production deployment (Docker, Kubernetes, PM2)
- Monitoring & observability
- Troubleshooting guide

## Testing

Tested features:
- ✅ HTTP 402 response with payment details
- ✅ On-chain payment verification
- ✅ Payment consumption and access control
- ✅ Double-consumption prevention
- ✅ Cross-chain payment delivery via ICM
- ✅ Health check endpoint

## Architecture

```
Client → GET /resource → 402 Payment Required
  ↓
Send Payment (WarpSender on Subnet A)
  ↓
ICM Relayer (~10s)
  ↓
GET /verify/:paymentId → Verified
  ↓
POST /consume/:paymentId → Access Granted
```

## Requirements

- Node.js 18+
- Avalanche local network running
- WarpSender and WarpReceiver contracts deployed
- ICM relayer active

## License

MIT
