# x402 Server Documentation

## Overview

The x402 server implements the HTTP 402 "Payment Required" status code for cross-chain Avalanche payments using Teleporter/ICM. It provides a RESTful API that requires payment verification before granting access to protected resources.

## Architecture

```
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│    Client    │           │  x402 Server │           │ WarpReceiver │
│              │           │  (Node.js)   │           │  (Subnet B)  │
└──────┬───────┘           └──────┬───────┘           └──────┬───────┘
       │                          │                          │
       │  1. GET /resource        │                          │
       │─────────────────────────>│                          │
       │                          │                          │
       │  2. 402 + paymentId      │                          │
       │<─────────────────────────│                          │
       │                          │                          │
       │  3. sendPayment() ──────────────────────────────────>│
       │     (via WarpSender)     │                          │
       │                          │                          │
       │  4. Wait for ICM         │                          │
       │     relayer (~10s)       │                          │
       │                          │                          │
       │  5. GET /verify/:id      │                          │
       │─────────────────────────>│  hasPaid()               │
       │                          │─────────────────────────>│
       │                          │<─────────────────────────│
       │  6. Verified receipt     │  getReceipt()            │
       │<─────────────────────────│                          │
       │                          │                          │
       │  7. POST /consume/:id    │                          │
       │─────────────────────────>│  consumePayment()        │
       │                          │─────────────────────────>│
       │                          │<─────────────────────────│
       │  8. Resource granted     │                          │
       │<─────────────────────────│                          │
       │                          │                          │
```

## Components

### Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.18+
- **Blockchain Library**: ethers.js 6.9+
- **Environment**: dotenv
- **CORS**: cors middleware

### File Structure

```
x402-server/
├── server.js              # Main server application
├── package.json           # Dependencies and scripts
├── .env                   # Environment configuration
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── abi/
│   └── WarpReceiver.json  # Contract ABI
├── server.log             # Runtime logs (generated)
├── server.pid             # Process ID (generated)
└── X402_SERVER.md         # This documentation
```

## Installation & Setup

### Prerequisites

1. **Node.js**: Version 18+ required
2. **Avalanche Network**: Local network running with deployed contracts
3. **Environment Variables**: Configured RPC URLs and contract addresses

### Step 1: Install Dependencies

```bash
cd x402-server
npm install
```

This installs:
- `express`: Web server framework
- `ethers`: Ethereum library for blockchain interaction
- `dotenv`: Environment variable management
- `cors`: Cross-Origin Resource Sharing support

### Step 2: Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Network Selection:**

The server now supports environment-based network switching:
- `NETWORK=local` - Local Avalanche subnet deployment (default)
- `NETWORK=fuji` - Fuji C-Chain testnet

Each network has preset configurations that can be overridden with specific environment variables.

**Environment Variables:**

```env
# Network Selection (Required)
NETWORK=local  # Options: 'local' or 'fuji'

# Server Configuration
PORT=3000
CORS_ORIGIN=*

# Optional: Override network defaults
# Server Configuration
PORT=3000

# Subnet B (Receiver Chain) RPC URL
SUBNET_B_RPC_URL=http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc

# Deployed Contract Addresses
WARP_RECEIVER_ADDRESS=0x52C84043CD9c865236f11d9Fc9F56aa003c1f922
WARP_SENDER_ADDRESS=0x52C84043CD9c865236f11d9Fc9F56aa003c1f922

# Chain IDs
SUBNET_A_CHAIN_ID=1001
SUBNET_B_CHAIN_ID=1002

# Payment Configuration (in wei)
DEFAULT_PAYMENT_AMOUNT_WEI=1000000000000000000  # 1 token
REQUIRED_PAYMENT_AMOUNT_WEI=1000000000000000000 # 1 token

# Private Key (for consuming payments)
PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
```

### Step 3: Verify Contract Deployment

Ensure contracts are deployed and accessible:

```bash
# Check WarpReceiver is deployed on Subnet B
cast code 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922 \
  --rpc-url http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc
```

Should return bytecode (not `0x`).

### Step 4: Start Server

```bash
npm start
```

**Expected Output:**

```
╔═══════════════════════════════════════════════════════════╗
║         x402 Payment Server - HTTP 402 Implementation     ║
╚═══════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:3000

📡 Configuration:
   Subnet B RPC: http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc
   WarpReceiver: 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922
   WarpSender:   0x52C84043CD9c865236f11d9Fc9F56aa003c1f922
   Chain IDs:    1001 → 1002

📚 Available endpoints:
   GET  http://localhost:3000/resource
   GET  http://localhost:3000/verify/:paymentId
   POST http://localhost:3000/consume/:paymentId
   GET  http://localhost:3000/health

✨ Ready to accept payment requests!
```

## API Endpoints

### 1. GET / - API Information

Returns server information and available endpoints.

**Request:**
```bash
curl http://localhost:3000/
```

**Response:** `200 OK`
```json
{
  "name": "x402 Payment Server",
  "version": "1.0.0",
  "description": "HTTP 402 Payment Required server for cross-chain Avalanche payments",
  "endpoints": {
    "GET /resource": "Request a protected resource (returns 402 with payment details)",
    "GET /verify/:paymentId": "Verify a payment receipt",
    "POST /consume/:paymentId": "Consume a payment and access the resource",
    "GET /health": "Health check endpoint",
    "GET /": "This information page"
  },
  "documentation": "See X402_SERVER.md for full documentation"
}
```

### 2. GET /resource - Protected Resource

Requests a protected resource. Returns HTTP 402 with payment instructions.

**Request:**
```bash
curl -i http://localhost:3000/resource
```

**Response:** `402 Payment Required`
```json
{
  "error": "Payment Required",
  "message": "This resource requires payment to access",
  "paymentDetails": {
    "paymentId": "0xc160f21a365708d75e2ac18ce831422824ba9bc1e5336e760a4d35eb5b1bc455",
    "price": "1000000000000000000",
    "priceInEther": "1.0",
    "sender": "0x52C84043CD9c865236f11d9Fc9F56aa003c1f922",
    "chainId": "1001",
    "receiver": "0x52C84043CD9c865236f11d9Fc9F56aa003c1f922",
    "destinationChainId": "1002"
  },
  "instructions": {
    "step1": "Send payment using WarpSender.sendPayment() on Subnet A",
    "step2": "Wait 5-10 seconds for ICM relayer to deliver the payment receipt",
    "step3": "Verify payment using GET /verify/:paymentId",
    "step4": "Access resource after payment confirmation"
  }
}
```

**Payment ID Format:**
- Generated using `ethers.keccak256()` with timestamp and random value
- 32-byte hex string (66 characters including `0x` prefix)
- Example: `0xc160f21a365708d75e2ac18ce831422824ba9bc1e5336e760a4d35eb5b1bc455`

### 3. GET /verify/:paymentId - Verify Payment

Verifies if a payment has been received on-chain and returns receipt details.

**Request:**
```bash
curl http://localhost:3000/verify/0x73de8580e1d75e29b82ee23e7d4b20cbbbf80187a5e954dabdf1852879a72c7c
```

**Response (Payment Found):** `200 OK`
```json
{
  "verified": true,
  "valid": true,
  "paymentId": "0x73de8580e1d75e29b82ee23e7d4b20cbbbf80187a5e954dabdf1852879a72c7c",
  "receipt": {
    "paymentId": "0x73de8580e1d75e29b82ee23e7d4b20cbbbf80187a5e954dabdf1852879a72c7c",
    "amount": "1000000000000000000",
    "amountInEther": "1.0",
    "payer": "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC",
    "timestamp": 1764881351,
    "timestampDate": "2025-12-04T20:49:11.000Z",
    "consumed": false
  },
  "validation": {
    "amountValid": true,
    "requiredAmount": "1000000000000000000",
    "requiredAmountInEther": "1.0",
    "consumed": false,
    "canConsume": true
  }
}
```

**Response (Payment Not Found):** `404 Not Found`
```json
{
  "verified": false,
  "message": "Payment not found. It may still be in transit via ICM relayer.",
  "paymentId": "0x...",
  "suggestion": "Wait a few more seconds and try again"
}
```

**Response (Invalid Format):** `400 Bad Request`
```json
{
  "error": "Invalid payment ID format",
  "message": "Payment ID must be a 32-byte hex string (0x...)"
}
```

**Fields:**
- `verified`: Whether payment exists on-chain
- `valid`: Whether payment meets requirements (amount + not consumed)
- `receipt.amount`: Payment amount in wei
- `receipt.payer`: Address that sent payment
- `receipt.timestamp`: Unix timestamp
- `receipt.consumed`: Whether payment has been used
- `validation.canConsume`: Whether payment can be consumed

### 4. POST /consume/:paymentId - Consume Payment

Marks a payment as consumed and grants access to the protected resource.

**Request:**
```bash
curl -X POST http://localhost:3000/consume/0x73de8580e1d75e29b82ee23e7d4b20cbbbf80187a5e954dabdf1852879a72c7c
```

**Response (Success):** `200 OK`
```json
{
  "success": true,
  "message": "Payment consumed successfully",
  "paymentId": "0x73de8580e1d75e29b82ee23e7d4b20cbbbf80187a5e954dabdf1852879a72c7c",
  "transaction": {
    "hash": "0x0c66244c11fcf6d3468a9c686499b7f76bca46d4c50a3488f3f4247e0c64b74e",
    "blockNumber": 6,
    "gasUsed": "48614"
  },
  "resource": {
    "message": "Access granted! Here is your protected resource.",
    "data": {
      "content": "This is the premium content that required payment.",
      "timestamp": "2025-12-04T20:49:46.985Z",
      "paymentAmount": "1.0"
    }
  }
}
```

**Response (Already Consumed):** `403 Forbidden`
```json
{
  "error": "Payment already consumed",
  "message": "This payment has already been used and cannot be consumed again"
}
```

**Response (Payment Not Found):** `404 Not Found`
```json
{
  "error": "Payment not found",
  "message": "No payment receipt found for this payment ID"
}
```

**Response (Insufficient Amount):** `403 Forbidden`
```json
{
  "error": "Insufficient payment amount",
  "message": "Payment amount 0.5 is less than required 1.0"
}
```

### 5. GET /health - Health Check

Returns server and blockchain connection status.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response (Healthy):** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-12-04T20:48:41.424Z",
  "blockchain": {
    "connected": true,
    "blockNumber": 4,
    "rpcUrl": "http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc"
  },
  "contracts": {
    "warpReceiver": "0x52C84043CD9c865236f11d9Fc9F56aa003c1f922",
    "warpSender": "0x52C84043CD9c865236f11d9Fc9F56aa003c1f922",
    "requiredPaymentAmount": "1.0"
  },
  "config": {
    "subnetAChainId": "1001",
    "subnetBChainId": "1002"
  }
}
```

**Response (Unhealthy):** `503 Service Unavailable`
```json
{
  "status": "unhealthy",
  "error": "Error message"
}
```

## Complete Usage Flow

### Step-by-Step Example

**1. Request Protected Resource**

```bash
curl -i http://localhost:3000/resource
```

Extract `paymentId` from the 402 response.

**2. Send Payment on Subnet A**

```bash
PAYMENT_ID=0xc160f21a365708d75e2ac18ce831422824ba9bc1e5336e760a4d35eb5b1bc455

cast send 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922 \
  "sendPayment(bytes32)" $PAYMENT_ID \
  --value 1000000000000000000 \
  --private-key 0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027 \
  --rpc-url http://127.0.0.1:9652/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc
```

**3. Wait for ICM Relayer**

The payment receipt is delivered cross-chain via Teleporter/ICM. This takes approximately 5-10 seconds.

```bash
sleep 10
```

**4. Verify Payment**

```bash
curl http://localhost:3000/verify/$PAYMENT_ID
```

Check that `verified: true` and `valid: true`.

**5. Consume Payment**

```bash
curl -X POST http://localhost:3000/consume/$PAYMENT_ID
```

Receive the protected resource in the response.

**6. Verify Consumption**

```bash
curl http://localhost:3000/verify/$PAYMENT_ID
```

Check that `consumed: true` and `valid: false` (can't be reused).

### Automated Test Script

Create `test-flow.sh`:

```bash
#!/bin/bash

echo "=== x402 Payment Flow Test ==="
echo ""

# Step 1: Request resource
echo "1. Requesting protected resource..."
RESPONSE=$(curl -s http://localhost:3000/resource)
PAYMENT_ID=$(echo $RESPONSE | grep -o '"paymentId":"0x[^"]*"' | cut -d'"' -f4)
echo "   Payment ID: $PAYMENT_ID"
echo ""

# Step 2: Send payment
echo "2. Sending payment on Subnet A..."
cast send 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922 \
  "sendPayment(bytes32)" $PAYMENT_ID \
  --value 1000000000000000000 \
  --private-key 0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027 \
  --rpc-url http://127.0.0.1:9652/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc \
  > /dev/null 2>&1
echo "   Payment sent!"
echo ""

# Step 3: Wait for relayer
echo "3. Waiting for ICM relayer (10 seconds)..."
sleep 10
echo ""

# Step 4: Verify payment
echo "4. Verifying payment..."
VERIFY=$(curl -s http://localhost:3000/verify/$PAYMENT_ID)
echo "   $VERIFY"
echo ""

# Step 5: Consume payment
echo "5. Consuming payment..."
CONSUME=$(curl -s -X POST http://localhost:3000/consume/$PAYMENT_ID)
echo "   $CONSUME"
echo ""

# Step 6: Verify consumed
echo "6. Verifying payment is consumed..."
VERIFY2=$(curl -s http://localhost:3000/verify/$PAYMENT_ID)
echo "   $VERIFY2"
echo ""

echo "=== Test Complete ==="
```

Make it executable and run:

```bash
chmod +x test-flow.sh
./test-flow.sh
```

## Error Handling

### Common Errors

**1. RPC Connection Error**

```
Error: could not detect network
```

**Solution:** Verify Avalanche network is running:
```bash
avalanche network status
```

**2. Contract Not Found**

```
Error: contract not deployed
```

**Solution:** Check contract deployment:
```bash
cast code $WARP_RECEIVER_ADDRESS --rpc-url $SUBNET_B_RPC_URL
```

**3. Payment Not Found After Waiting**

```json
{
  "verified": false,
  "message": "Payment not found..."
}
```

**Solution:** 
- Wait longer (try 15-20 seconds)
- Check ICM relayer logs: `ps aux | grep icm-relayer`
- Verify payment was sent: check transaction hash on Subnet A

**4. Port Already in Use**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

## Development

### Running in Development Mode

Use Node.js watch mode for auto-restart on file changes:

```bash
npm run dev
```

### Testing Individual Endpoints

**Test Health:**
```bash
curl http://localhost:3000/health
```

**Test 402 Response:**
```bash
curl -i http://localhost:3000/resource
```

**Test Verification with Known Payment:**
```bash
curl http://localhost:3000/verify/0x1234567890abcdef...
```

### Logging

Server logs are printed to console. For production, redirect to file:

```bash
npm start > server.log 2>&1 &
echo $! > server.pid
```

Stop server:
```bash
kill $(cat server.pid)
```

### Environment Variables for Testing

Create `.env.test` for different configurations:

```env
PORT=3001
SUBNET_B_RPC_URL=http://localhost:9650/...
WARP_RECEIVER_ADDRESS=0x...
```

Run with test config:
```bash
cp .env.test .env
npm start
```

## Security Considerations

### 1. Private Key Management

**Current (Development):**
- Private key in `.env` file
- Used for consuming payments on behalf of users

**Production:**
- Use environment-specific secrets management (AWS Secrets Manager, HashiCorp Vault)
- Consider using a separate "service wallet" with limited permissions
- Implement key rotation

### 2. Payment Verification

The server verifies:
- ✅ Payment exists on-chain (`hasPaid()`)
- ✅ Payment amount meets requirements
- ✅ Payment hasn't been consumed
- ✅ Payment is from authorized sender chain

### 3. Rate Limiting

**Recommended (not implemented):**

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/resource', limiter);
app.use('/verify', limiter);
app.use('/consume', limiter);
```

### 4. Input Validation

Current validation:
- Payment ID format (32-byte hex)
- On-chain payment existence
- Payment amount sufficiency

### 5. CORS Configuration

**Current (Development):**
```javascript
app.use(cors()); // Allow all origins
```

**Production:**
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  methods: ['GET', 'POST'],
  credentials: true
}));
```

## Production Deployment

### Deployment Checklist

- [ ] Update `.env` with production RPC URLs
- [ ] Deploy contracts to Fuji or Mainnet
- [ ] Configure CORS for production domains
- [ ] Add rate limiting
- [ ] Implement proper logging (Winston, Pino)
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure HTTPS/TLS
- [ ] Use process manager (PM2, systemd)
- [ ] Set up database for payment tracking (Redis, PostgreSQL)
- [ ] Implement backup/recovery procedures

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start server with PM2
pm2 start server.js --name x402-server

# View logs
pm2 logs x402-server

# Monitor
pm2 monit

# Restart
pm2 restart x402-server

# Stop
pm2 stop x402-server

# Auto-start on boot
pm2 startup
pm2 save
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t x402-server .
docker run -p 3000:3000 --env-file .env x402-server
```

### Kubernetes Deployment

Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: x402-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: x402-server
  template:
    metadata:
      labels:
        app: x402-server
    spec:
      containers:
      - name: x402-server
        image: x402-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: SUBNET_B_RPC_URL
          valueFrom:
            secretKeyRef:
              name: x402-secrets
              key: rpc-url
---
apiVersion: v1
kind: Service
metadata:
  name: x402-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: x402-server
```

## Monitoring & Observability

### Metrics to Track

1. **Request Metrics**
   - Total requests per endpoint
   - Response times
   - Error rates

2. **Payment Metrics**
   - Payments requested (402 responses)
   - Payments verified
   - Payments consumed
   - Failed consumption attempts

3. **Blockchain Metrics**
   - RPC connection status
   - Block lag
   - Transaction confirmation times

### Adding Prometheus Metrics

```javascript
import client from 'prom-client';

const register = new client.Registry();

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

register.registerMetric(httpRequestDuration);

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## Troubleshooting

### Server Won't Start

**Check port availability:**
```bash
lsof -i :3000
```

**Check environment variables:**
```bash
node -e "require('dotenv').config(); console.log(process.env)"
```

**Check Node.js version:**
```bash
node --version  # Should be 18+
```

### Payment Verification Fails

**Check blockchain connection:**
```bash
curl http://localhost:3000/health
```

**Check payment on-chain directly:**
```bash
cast call 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922 \
  "hasPaid(bytes32)(bool)" $PAYMENT_ID \
  --rpc-url $SUBNET_B_RPC_URL
```

**Check ICM relayer:**
```bash
ps aux | grep icm-relayer
tail -f ~/.avalanche-cli/runs/network_*/icm-relayer-storage/*.log
```

### Payment Consumption Fails

**Check wallet balance:**
```bash
cast balance $WALLET_ADDRESS --rpc-url $SUBNET_B_RPC_URL
```

**Check if already consumed:**
```bash
cast call 0x52C84043CD9c865236f11d9Fc9F56aa003c1f922 \
  "isConsumed(bytes32)(bool)" $PAYMENT_ID \
  --rpc-url $SUBNET_B_RPC_URL
```

**Check gas limit:**
Increase gas limit in code if transactions fail:
```javascript
const tx = await warpReceiverContractWithSigner.consumePayment(paymentId, {
  gasLimit: 100000
});
```

## Appendix

### Contract ABI Explanation

The `abi/WarpReceiver.json` file contains the Application Binary Interface for interacting with the WarpReceiver contract:

- `hasPaid(bytes32)`: Returns whether payment exists
- `getReceipt(bytes32)`: Returns full payment receipt struct
- `isConsumed(bytes32)`: Returns consumption status
- `consumePayment(bytes32)`: Marks payment as consumed
- `requiredPaymentAmount()`: Returns minimum payment required

### HTTP Status Codes

- `200 OK`: Successful verification or consumption
- `402 Payment Required`: Resource requires payment
- `403 Forbidden`: Payment invalid or already consumed
- `404 Not Found`: Payment not found on-chain
- `500 Internal Server Error`: Server or blockchain error
- `503 Service Unavailable`: Blockchain connection issues

### Payment ID Generation

Payment IDs are generated using:
```javascript
ethers.keccak256(ethers.toUtf8Bytes(`payment-${Date.now()}-${Math.random()}`))
```

This produces a unique 32-byte hash for each payment request.

### Cross-Chain Message Flow

1. **Payment Sent** (Subnet A):
   - User calls `WarpSender.sendPayment(paymentId)`
   - Teleporter encodes message and calls Warp precompile
   - Warp message emitted with validator signatures

2. **Relayer Processing**:
   - ICM relayer detects Warp message
   - Aggregates signatures from validators
   - Submits to destination chain

3. **Payment Received** (Subnet B):
   - Warp precompile verifies signatures
   - Teleporter decodes message
   - Calls `WarpReceiver.receiveTeleporterMessage()`
   - Receipt stored in contract

4. **Verification & Consumption**:
   - Server queries `hasPaid()` to verify
   - Server calls `consumePayment()` to mark as used

---

## Support & Resources

**Documentation:**
- Avalanche Docs: https://docs.avax.network/
- Teleporter Docs: https://github.com/ava-labs/teleporter
- Express.js Docs: https://expressjs.com/
- ethers.js Docs: https://docs.ethers.org/

**Testing:**
- Use `testing.txt` for deployment addresses
- Use `document.md` for contract setup
- Use `tasks.md` for project progress

**Next Steps:**
- See Task 4 for end-to-end demo implementation
- See Task 5 for Fuji testnet deployment
- See Task 6 for additional documentation

---

**Version:** 1.0.0  
**Last Updated:** December 4, 2025  
**Author:** wrap-x402 Project
