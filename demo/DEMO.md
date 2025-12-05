# End-to-End Demo Documentation

## Overview

This directory contains a complete end-to-end demonstration of the HTTP 402 cross-chain payment system on Avalanche subnets. The demo showcases the entire payment flow from initial resource request to final consumption with replay attack prevention.

## Demo Components

### 1. demo-client.js

**Purpose**: Interactive CLI client that demonstrates the complete payment flow

**Features**:
- Color-coded terminal output with progress indicators
- Step-by-step execution with explanations
- Countdown timer for ICM relayer wait
- Automatic retry logic for verification
- Comprehensive error handling
- Verbose mode for detailed logging
- Replay attack testing

**Flow Steps**:
1. **Request Resource** → Receives HTTP 402 with payment details
2. **Send Payment** → Executes cross-chain payment on Subnet A
3. **Wait for Relayer** → Allows time for Teleporter/ICM delivery
4. **Verify Payment** → Confirms receipt on Subnet B
5. **Consume Payment** → Accesses protected resource
6. **Verify Consumption** → Confirms payment marked as used
7. **Test Replay** → Validates prevention of double-spending

### 2. monitor-relayer.js

**Purpose**: Real-time monitoring of ICM relayer logs

**Features**:
- Automatic log file discovery
- Live tail of relayer activity
- Color-coded log messages
- Recent logs view
- Graceful shutdown handling

**Usage**:
```bash
npm run monitor        # Live monitoring
node monitor-relayer.js recent  # Show last 50 lines
```

## Prerequisites

### Required Services

1. **Avalanche Local Network**: Running with both subnets deployed
   ```bash
   avalanche network status
   ```

2. **x402 Server**: Running on port 3000
   ```bash
   cd ../x402-server && npm start
   ```

3. **Deployed Contracts**: WarpSender and WarpReceiver on respective subnets

### Environment Configuration

Copy `.env.example` to `.env` (already configured):

```env
X402_SERVER_URL=http://localhost:3000
SUBNET_A_RPC_URL=http://127.0.0.1:9652/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc
SUBNET_B_RPC_URL=http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc
PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027
RELAYER_WAIT_TIME=10000
```

## Installation

```bash
cd demo
npm install
```

**Dependencies**:
- `axios`: HTTP client for API requests
- `ethers`: Blockchain interaction
- `chalk`: Terminal colors and styling
- `dotenv`: Environment configuration

## Running the Demo

### Basic Demo

```bash
npm run demo
```

**Expected Output**:
```
======================================================================
🚀 HTTP 402 Cross-Chain Payment Demo
======================================================================
Demonstrating end-to-end payment flow on Avalanche subnets

[Step 1] Requesting Protected Resource
✓ Received HTTP 402 Payment Required
   Payment ID: 0xf9d7c1b80ee405dcc1fd2dd881b9d82125119efd...
   Required Amount: 1.0 tokens

[Step 2] Sending Cross-Chain Payment
✓ Transaction sent!
✓ Payment confirmed on Subnet A

[Step 3] Waiting for Teleporter/ICM Relayer
⏳ Waiting for relayer (10 seconds)...
   10... 9... 8... 7... 6... 5... 4... 3... 2... 1... Done!

[Step 4] Verifying Payment Receipt on Subnet B
✓ Payment receipt verified on Subnet B!

[Step 5] Consuming Payment to Access Resource
✓ Payment consumed successfully!

🎉 ACCESS GRANTED!
┌─────────────────────────────────────────────────────────────┐
│ This is the premium content that required payment.         │
└─────────────────────────────────────────────────────────────┘

[Step 6] Verifying Payment Consumption
✓ Payment marked as consumed on-chain

[Step 7] Testing Replay Attack Prevention
✓ Replay attack prevented! ✓

======================================================================
✅ Demo Completed Successfully!
======================================================================
```

### Verbose Mode

For detailed logging including full JSON responses:

```bash
npm run demo:verbose
```

This shows:
- Complete HTTP request/response bodies
- Transaction receipts with all fields
- Detailed error information

### Monitoring Relayer

Run in a separate terminal to watch ICM relayer activity:

```bash
npm run monitor
```

**Sample Output**:
```
📡 ICM Relayer Log Monitor
✓ Found ICM relayer logs
   Directory: /home/user/.avalanche-cli/runs/network_20231204/icm-relayer-storage/

Monitoring for new log entries...
[21:16:19] Processing warp message from chain bjoxQvUZv6FcN5Sy...
[21:16:20] Collecting signatures from validators...
[21:16:21] Submitting message to destination chain...
[21:16:22] Message delivered successfully
```

## Demo Execution Time

**Total Duration**: ~30-35 seconds

**Breakdown**:
- Step 1 (HTTP 402): ~1 second
- Step 2 (Send Payment): ~2-3 seconds
- Step 3 (Wait for Relayer): 10 seconds
- Step 4 (Verify): ~1-2 seconds
- Step 5 (Consume): ~2-3 seconds
- Step 6-7 (Verification): ~2 seconds

## Recording the Demo

### Terminal Recording

Use `asciinema` for terminal session recording:

```bash
# Install asciinema
sudo apt install asciinema

# Record demo
asciinema rec demo-recording.cast

# Run demo
npm run demo

# Stop recording (Ctrl+D)
exit

# Play recording
asciinema play demo-recording.cast

# Upload to asciinema.org
asciinema upload demo-recording.cast
```

### Screen Recording

Use `OBS Studio` or `SimpleScreenRecorder`:

1. **Setup**:
   - Terminal window with demo ready
   - Second terminal with relayer monitor
   - Browser with server health endpoint

2. **Recording**:
   ```bash
   # Terminal 1: Start server
   cd x402-server && npm start
   
   # Terminal 2: Monitor relayer
   cd demo && npm run monitor
   
   # Terminal 3: Run demo
   cd demo && npm run demo
   ```

3. **Narration Points**:
   - Explain HTTP 402 status code
   - Show cross-chain transaction on blockchain explorer
   - Highlight ICM relayer activity
   - Demonstrate replay attack prevention

### Video Editing

**Suggested Timeline**:
- 0:00 - Introduction and architecture diagram
- 0:30 - Show running services (network, server, contracts)
- 1:00 - Execute demo with commentary
- 2:00 - Highlight key events in relayer logs
- 2:30 - Show payment consumption on-chain
- 3:00 - Demonstrate replay attack prevention
- 3:30 - Summary and next steps

## Demo Script Architecture

### demo-client.js Structure

```javascript
// Main flow
runDemo()
  ├── Step 1: Request Resource (GET /resource)
  │   └── Extract paymentId from 402 response
  ├── Step 2: Send Payment (WarpSender.sendPayment)
  │   ├── Connect to Subnet A
  │   ├── Check balance
  │   ├── Send transaction
  │   └── Wait for confirmation
  ├── Step 3: Wait for ICM Relayer
  │   └── Sleep with countdown (10 seconds)
  ├── Step 4: Verify Payment (GET /verify/:paymentId)
  │   └── Retry up to 3 times if not found
  ├── Step 5: Consume Payment (POST /consume/:paymentId)
  │   └── Receive protected resource
  ├── Step 6: Verify Consumption
  │   └── Check consumed flag
  └── Step 7: Test Replay Attack
      └── Verify 403 response
```

### Error Handling

The demo includes comprehensive error handling:

1. **Network Errors**: Detects if server or RPC is unreachable
2. **Insufficient Balance**: Checks wallet balance before payment
3. **Verification Timeout**: Retries verification up to 3 times
4. **Consumption Errors**: Handles already-consumed payments
5. **Graceful Degradation**: Provides troubleshooting tips on failure

### Console Styling

Uses `chalk` library for color-coded output:

- 🟢 Green: Success messages
- 🔵 Blue: Informational messages
- 🟡 Yellow: Warnings and step numbers
- 🔴 Red: Errors
- ⚪ Gray: Data details and timestamps
- 🟣 Magenta: Wait/loading indicators
- 🔵 Cyan: Titles and separators

## Testing Scenarios

### Scenario 1: Happy Path (Default)

**Execute**: `npm run demo`

**Validates**:
- HTTP 402 response format
- Cross-chain payment delivery
- Payment verification
- Resource access after payment
- Replay attack prevention

### Scenario 2: Network Failure

**Setup**:
```bash
# Stop Avalanche network
avalanche network stop
```

**Execute**: `npm run demo`

**Expected**: Error message with troubleshooting steps

### Scenario 3: Insufficient Balance

**Setup**: Modify `.env` to use an account with low balance

**Expected**: "Insufficient balance for payment" error

### Scenario 4: Server Down

**Setup**:
```bash
# Stop x402 server
kill $(cat ../x402-server/server.pid)
```

**Execute**: `npm run demo`

**Expected**: Connection refused error with troubleshooting

### Scenario 5: Delayed Relayer

**Setup**: Increase `RELAYER_WAIT_TIME` to 5000 (5 seconds)

**Expected**: Verification retries, eventual success after additional wait

## Customization

### Adjusting Wait Time

If ICM relayer is slower or faster in your environment:

```env
RELAYER_WAIT_TIME=15000  # 15 seconds
```

### Changing Payment Amount

Requires modifying both server and demo:

1. Update server `.env`:
   ```env
   DEFAULT_PAYMENT_AMOUNT_WEI=2000000000000000000  # 2 tokens
   ```

2. Restart server

3. Run demo (automatically uses server's required amount)

### Adding Custom Logging

Edit `demo-client.js` to add custom log points:

```javascript
// After Step 5
log.data('Custom Metric', customValue);
```

## Troubleshooting

### Demo Fails at Step 2

**Issue**: Cannot send payment

**Solutions**:
- Check wallet balance: `cast balance 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC --rpc-url $SUBNET_A_RPC`
- Verify RPC URL in `.env`
- Check network status: `avalanche network status`

### Demo Fails at Step 4

**Issue**: Payment verification times out

**Solutions**:
- Increase `RELAYER_WAIT_TIME` to 15000
- Check ICM relayer: `ps aux | grep icm-relayer`
- Monitor relayer logs: `npm run monitor`
- Verify blockchain IDs match in contracts

### Demo Fails at Step 5

**Issue**: Payment consumption fails

**Solutions**:
- Check server logs
- Verify server private key has balance on Subnet B
- Check WarpReceiver contract deployment
- Verify payment wasn't already consumed

### Monitor Shows No Logs

**Issue**: Relayer logs not found

**Solutions**:
- Check network is running: `avalanche network status`
- Verify log path: `ls ~/.avalanche-cli/runs/`
- Use recent logs: `node monitor-relayer.js recent`

## Integration with CI/CD

### Automated Testing

Create `test-demo.sh`:

```bash
#!/bin/bash
set -e

echo "Starting automated demo test..."

# Start services
avalanche network start
cd x402-server && npm start &
SERVER_PID=$!
sleep 5

# Run demo
cd ../demo
npm run demo > demo-output.log 2>&1

# Check for success
if grep -q "Demo Completed Successfully" demo-output.log; then
  echo "✓ Demo test passed"
  kill $SERVER_PID
  exit 0
else
  echo "✗ Demo test failed"
  cat demo-output.log
  kill $SERVER_PID
  exit 1
fi
```

### GitHub Actions

```yaml
name: Demo Test

on: [push, pull_request]

jobs:
  demo:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Avalanche CLI
        run: |
          curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s
      - name: Setup network
        run: |
          avalanche subnet deploy subnetA --local
          avalanche subnet deploy subnetB --local
      - name: Deploy contracts
        run: |
          cd wrapx402
          forge build
          # Deploy scripts...
      - name: Run demo
        run: |
          cd demo
          npm install
          npm run demo
```

## Performance Metrics

The demo tracks and displays:

- **HTTP Request Time**: ~50-200ms
- **Transaction Confirmation**: ~2-3 seconds
- **ICM Relay Time**: ~8-12 seconds
- **Contract Call Time**: ~100-300ms

### Adding Performance Tracking

Modify `demo-client.js`:

```javascript
const startTime = Date.now();

// ... after step completion
const elapsed = Date.now() - startTime;
log.data('Elapsed Time', `${(elapsed / 1000).toFixed(2)}s`);
```

## Next Steps

After running the demo:

1. **Review Logs**: Check server and relayer logs for detailed execution trace
2. **Experiment**: Modify payment amounts, wait times, error scenarios
3. **Production Deploy**: Proceed to Task 5 (Fuji deployment)
4. **Documentation**: Complete Task 6 (final documentation)

## Support

**Demo Issues**: Create GitHub issue with:
- Demo output log
- Server logs
- Network status output
- Environment configuration

**Expected Behavior**: Demo should complete successfully in ~30 seconds with all steps passing

---

**Version**: 1.0.0  
**Last Updated**: December 4, 2025  
**Status**: Fully functional and tested
