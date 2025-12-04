# x402 Server - Creation Documentation

This document explains how the x402 HTTP 402 Payment Server was created for the wrap-x402 project.

## Overview

The x402 server implements the HTTP 402 "Payment Required" status code for cross-chain Avalanche payments. It demonstrates a practical use case for cross-chain messaging where payment verification on one chain grants access to resources on another system.

## Creation Process

### Step 1: Project Initialization

**Created directory structure:**
```bash
mkdir x402-server
cd x402-server
```

**Created `package.json` with dependencies:**
- `express` (v4.18.2) - Web framework
- `ethers` (v6.9.0) - Blockchain interaction
- `dotenv` (v16.3.1) - Environment variables
- `cors` (v2.8.5) - Cross-origin support

**Scripts defined:**
- `npm start` - Run server with `node server.js`
- `npm run dev` - Run with watch mode (auto-reload)

### Step 2: Environment Configuration

**Created `.env` file with configuration:**
```env
PORT=3000
SUBNET_B_RPC_URL=http://127.0.0.1:9650/ext/bc/.../rpc
WARP_RECEIVER_ADDRESS=0x52C84043CD9c865236f11d9Fc9F56aa003c1f922
WARP_SENDER_ADDRESS=0x52C84043CD9c865236f11d9Fc9F56aa003c1f922
SUBNET_A_CHAIN_ID=1001
SUBNET_B_CHAIN_ID=1002
DEFAULT_PAYMENT_AMOUNT_WEI=1000000000000000000
PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
```

**Created `.env.example` as template for others**

**Created `.gitignore`:**
```
node_modules/
.env
*.log
.DS_Store
```

### Step 3: Contract ABI

**Created `abi/WarpReceiver.json`** with essential functions:
- `hasPaid(bytes32) returns (bool)`
- `getReceipt(bytes32) returns (PaymentReceipt)`
- `isConsumed(bytes32) returns (bool)`
- `consumePayment(bytes32)`
- `requiredPaymentAmount() returns (uint256)`

This ABI was extracted from the deployed WarpReceiver contract to enable ethers.js interaction.

### Step 4: Server Implementation

**Created `server.js` with ES Modules:**

```javascript
import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import cors from 'cors';
```

**Key components implemented:**

#### 1. Provider & Contract Setup
```javascript
const provider = new ethers.JsonRpcProvider(SUBNET_B_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const warpReceiverContract = new ethers.Contract(
  WARP_RECEIVER_ADDRESS,
  warpReceiverABI,
  provider
);

const warpReceiverContractWithSigner = new ethers.Contract(
  WARP_RECEIVER_ADDRESS,
  warpReceiverABI,
  wallet
);
```

Two contract instances:
- **Read-only** (with provider) for querying
- **Write-enabled** (with wallet) for transactions

#### 2. GET /resource Endpoint

**Purpose:** Return HTTP 402 with payment details

**Implementation highlights:**
- Generate unique payment ID using `ethers.keccak256()`
- Include payment amount, contract addresses, chain IDs
- Provide step-by-step instructions
- Store payment ID in memory for tracking

**Payment ID generation:**
```javascript
const paymentId = ethers.keccak256(
  ethers.toUtf8Bytes(`payment-${Date.now()}-${Math.random()}`)
);
```

Produces a unique 32-byte hash for each request.

**Response format:**
```json
{
  "error": "Payment Required",
  "paymentDetails": {
    "paymentId": "0x...",
    "price": "1000000000000000000",
    "priceInEther": "1.0",
    "sender": "0x...",
    "chainId": "1001",
    "receiver": "0x...",
    "destinationChainId": "1002"
  },
  "instructions": { ... }
}
```

#### 3. GET /verify/:paymentId Endpoint

**Purpose:** Verify payment on-chain

**Implementation flow:**
1. Validate payment ID format (32-byte hex)
2. Call `hasPaid()` to check existence
3. If exists, call `getReceipt()` for details
4. Call `isConsumed()` for consumption status
5. Call `requiredPaymentAmount()` for validation
6. Return comprehensive verification result

**Key validation:**
```javascript
const hasPaid = await warpReceiverContract.hasPaid(paymentId);
const receipt = await warpReceiverContract.getReceipt(paymentId);
const isConsumed = await warpReceiverContract.isConsumed(paymentId);
const requiredAmount = await warpReceiverContract.requiredPaymentAmount();
const amountValid = receipt.amount >= requiredAmount;
```

**Response includes:**
- Payment existence (`verified`)
- Payment validity (`valid` = amountValid && !consumed)
- Full receipt details (amount, payer, timestamp)
- Validation status

#### 4. POST /consume/:paymentId Endpoint

**Purpose:** Consume payment and grant access

**Implementation flow:**
1. Validate payment ID format
2. Check payment exists
3. Check not already consumed
4. Validate payment amount
5. Call `consumePayment()` transaction
6. Wait for confirmation
7. Return resource with transaction details

**Transaction handling:**
```javascript
const tx = await warpReceiverContractWithSigner.consumePayment(paymentId);
const txReceipt = await tx.wait();
```

**Error handling:**
- 404 if payment not found
- 403 if already consumed
- 403 if insufficient amount
- 500 for blockchain errors

**Success response includes:**
- Transaction hash and block number
- Gas used
- Protected resource data

#### 5. GET /health Endpoint

**Purpose:** Monitor server and blockchain status

**Checks:**
- RPC connection (get block number)
- Contract connection (query required amount)
- Returns configuration details

**Response:**
```json
{
  "status": "healthy",
  "blockchain": {
    "connected": true,
    "blockNumber": 4
  },
  "contracts": {
    "warpReceiver": "0x...",
    "requiredPaymentAmount": "1.0"
  }
}
```

#### 6. GET / Endpoint

**Purpose:** API information and documentation links

Lists all available endpoints with descriptions.

### Step 5: Security Features

**Input Validation:**
- Payment ID format validation (66 chars, starts with 0x)
- On-chain existence verification
- Amount validation against requirements

**Replay Protection:**
- Consumption tracking via smart contract
- Cannot consume same payment twice
- Returns 403 for consumed payments

**Access Control:**
- Only Teleporter can deliver payments (contract-level)
- Only authorized sender chain accepted (contract-level)
- Server uses private key for consumption (server-level)

**Error Handling:**
- Try-catch blocks around all blockchain calls
- Specific error messages for each failure case
- HTTP status codes match error types

### Step 6: Testing

**Tested scenarios:**

1. **Basic Flow:**
   - Request resource → 402
   - Send payment → TX confirmed
   - Verify payment → Verified
   - Consume payment → Success

2. **Edge Cases:**
   - Invalid payment ID format → 400
   - Non-existent payment → 404
   - Already consumed → 403
   - Insufficient amount → 403

3. **Security:**
   - Double-consumption attempt → 403
   - Cross-chain delivery verification
   - Payment replay prevention

**Test results:**
- ✅ All endpoints functional
- ✅ HTTP status codes correct
- ✅ Error handling working
- ✅ Cross-chain verification successful
- ✅ Consumption tracking working

### Step 7: Documentation

**Created comprehensive documentation:**

1. **X402_SERVER.md** (830+ lines):
   - Overview and architecture
   - Installation and setup
   - API endpoint reference
   - Complete usage flow
   - Security considerations
   - Production deployment guide
   - Troubleshooting guide
   - Monitoring and observability

2. **README.md** (project root):
   - Quick start guide
   - Usage examples
   - Configuration reference
   - Testing results

3. **Updated document.md**:
   - Added x402 Server section
   - Server commands
   - Integration with existing docs

4. **Updated tasks.md**:
   - Marked Task 3 complete
   - Listed all completed subtasks

5. **Updated testing.txt**:
   - Server test commands
   - Endpoint reference
   - Quick test flow

## Technical Decisions

### Why Express.js?

- **Lightweight:** Minimal overhead for simple API
- **Popular:** Well-documented and widely used
- **Flexible:** Easy to extend with middleware
- **Standard:** Industry-standard for Node.js APIs

### Why ethers.js v6?

- **Modern:** Latest version with improved TypeScript support
- **Efficient:** Better performance than web3.js
- **Feature-rich:** Comprehensive blockchain interaction
- **Well-maintained:** Active development and community

### Why ES Modules?

- **Modern JavaScript:** Standard module system
- **Better imports:** Cleaner syntax than CommonJS
- **Future-proof:** Node.js moving towards ES modules
- **Type support:** Better IDE integration

### Payment ID Generation

Using `keccak256(timestamp + random)`:
- **Unique:** Very low collision probability
- **Standard:** Same hash function as Ethereum
- **Predictable format:** Always 32 bytes (bytes32)
- **Traceable:** Can be logged and searched

### In-Memory Payment Tracking

Used `Map()` for tracking requested payments:
- **Simple:** No database needed for MVP
- **Fast:** Instant lookups
- **Sufficient:** For development and testing

**Production considerations:**
- Use Redis for persistence
- Use PostgreSQL for analytics
- Add payment status tracking
- Implement cleanup of old payments

### Two Contract Instances

Separate read/write instances:
- **Security:** Read operations don't need private key
- **Efficiency:** Provider-only calls faster
- **Safety:** Reduces risk of accidental transactions
- **Clarity:** Clear separation of concerns

## Design Patterns

### RESTful API Design

- **Resource-oriented:** `/resource`, `/verify/:id`, `/consume/:id`
- **HTTP methods:** GET for queries, POST for actions
- **Status codes:** Proper use of 200, 402, 403, 404, 500
- **JSON responses:** Consistent format across endpoints

### Error Handling

```javascript
try {
  // Blockchain operation
} catch (error) {
  if (error.message.includes('specific error')) {
    return res.status(403).json({ ... });
  }
  res.status(500).json({ error: error.message });
}
```

Pattern used throughout for consistent error responses.

### Middleware Stack

```javascript
app.use(cors());
app.use(express.json());
```

Simple middleware setup:
- CORS for cross-origin requests
- JSON parser for request bodies

### Configuration Management

All configuration in `.env`:
- **Centralized:** Single source of truth
- **Flexible:** Easy to change networks
- **Secure:** Can exclude from version control
- **Standard:** Industry practice with dotenv

## Integration with wrap-x402

### Contract Integration

Server depends on:
- **WarpSender:** Generates payments on Subnet A
- **WarpReceiver:** Validates/consumes on Subnet B
- **Teleporter:** Delivers payment receipts cross-chain

Server calls WarpReceiver functions:
- `hasPaid()` - Payment verification
- `getReceipt()` - Receipt details
- `isConsumed()` - Consumption status
- `consumePayment()` - Mark as used

### Network Integration

Server connects to:
- **Subnet B RPC:** For querying/transactions
- **Local network:** Development environment
- **ICM Relayer:** Automatic message delivery

### Documentation Integration

Server docs integrated with:
- `document.md` - Main technical guide
- `tasks.md` - Project task tracking
- `testing.txt` - Testing reference
- `X402_SERVER.md` - Dedicated server docs

## Key Features Implemented

### 1. HTTP 402 Compliance

Proper implementation of 402 status code:
- Clear payment requirement message
- Payment details in response body
- Instructions for payment process

### 2. On-Chain Verification

All verification happens on-chain:
- No trust required in server
- Immutable payment records
- Cryptographic security

### 3. Cross-Chain Support

Leverages Avalanche Teleporter:
- Payment on Subnet A
- Verification on Subnet B
- Automatic message relay
- ~10 second delivery time

### 4. Replay Protection

Multiple layers of protection:
- Smart contract tracks consumption
- Server validates before consuming
- 403 error for consumed payments
- Transaction-based consumption

### 5. Comprehensive Logging

Console logging for debugging:
- Server startup information
- Configuration display
- Transaction hashes
- Block confirmations

## Lessons Learned

### 1. Async/Await Everywhere

All blockchain calls are asynchronous:
```javascript
const hasPaid = await contract.hasPaid(paymentId);
```
Must use async functions throughout.

### 2. Error Handling Critical

Blockchain operations can fail:
- Network issues
- Gas estimation failures
- Reverted transactions
- Invalid parameters

Comprehensive try-catch essential.

### 3. Type Conversion

Solidity types → JavaScript:
- `bytes32` → hex string
- `uint256` → BigInt → string
- `address` → lowercase hex

Use `ethers.formatEther()` for display.

### 4. Transaction Waiting

Two-step transaction process:
```javascript
const tx = await contract.function();  // Send
const receipt = await tx.wait();       // Wait for mining
```

### 5. ABI Requirements

Only include functions you use:
- Keeps ABI file small
- Reduces complexity
- Easier maintenance

## Future Enhancements

### Immediate (Not Implemented)

1. **Database Integration:**
   - Replace in-memory Map with Redis/PostgreSQL
   - Store payment history
   - Track analytics

2. **Rate Limiting:**
   - Prevent API abuse
   - Per-IP limits
   - Configurable thresholds

3. **Authentication:**
   - API keys for clients
   - JWT tokens
   - Role-based access

4. **Metrics:**
   - Prometheus integration
   - Grafana dashboards
   - Performance monitoring

### Production Requirements

1. **HTTPS/TLS:**
   - SSL certificates
   - Secure communication
   - Production domains

2. **Load Balancing:**
   - Multiple server instances
   - Nginx reverse proxy
   - Health checks

3. **Process Management:**
   - PM2 for auto-restart
   - Systemd services
   - Log rotation

4. **Monitoring:**
   - Uptime monitoring
   - Error tracking (Sentry)
   - Log aggregation

5. **Testing:**
   - Unit tests (Jest/Mocha)
   - Integration tests
   - Load testing

## Conclusion

The x402 server successfully demonstrates HTTP 402 implementation for cross-chain payments on Avalanche. It provides a working example of:

- ✅ RESTful API design
- ✅ Blockchain integration with ethers.js
- ✅ Cross-chain messaging via Teleporter
- ✅ Payment verification and consumption
- ✅ Security best practices
- ✅ Comprehensive documentation

The server is production-ready for local development and testing, with a clear path to production deployment outlined in the documentation.

**Total implementation time:** Approximately 2-3 hours including:
- Server code (~500 lines)
- Documentation (~1500+ lines)
- Testing and verification
- Integration with existing project

**Files created:**
- `server.js` (main application)
- `package.json` (dependencies)
- `.env` (configuration)
- `.env.example` (template)
- `.gitignore` (version control)
- `abi/WarpReceiver.json` (contract interface)
- `X402_SERVER.md` (comprehensive docs)
- `README.md` (quick reference)
- `X402_CREATION.md` (this document)

**Project impact:**
- Completes Task 3 of 6 in wrap-x402 project
- Provides practical HTTP 402 implementation
- Demonstrates cross-chain payment use case
- Serves as foundation for future enhancements

---

**Version:** 1.0.0  
**Created:** December 4, 2025  
**Author:** wrap-x402 Project
