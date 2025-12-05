# x402 Demo

End-to-end demonstration of HTTP 402 cross-chain payment system on Avalanche subnets.

## Quick Start

```bash
# Install dependencies
npm install

# Run demo
npm run demo

# Monitor ICM relayer (separate terminal)
npm run monitor
```

## What This Demo Does

1. ✅ Requests a protected resource → receives **HTTP 402 Payment Required**
2. ✅ Sends cross-chain payment from Subnet A
3. ✅ Waits for Teleporter/ICM to relay payment receipt to Subnet B
4. ✅ Verifies payment delivery on Subnet B
5. ✅ Consumes payment and accesses protected resource
6. ✅ Validates replay attack prevention

## Prerequisites

- Avalanche local network running with both subnets deployed
- x402 server running on port 3000
- Contracts deployed (WarpSender on Subnet A, WarpReceiver on Subnet B)

## Files

- `demo-client.js` - Interactive CLI demo with color-coded output
- `monitor-relayer.js` - ICM relayer log monitoring tool
- `DEMO.md` - Complete documentation

## Expected Output

```
======================================================================
🚀 HTTP 402 Cross-Chain Payment Demo
======================================================================

[Step 1] Requesting Protected Resource
✓ Received HTTP 402 Payment Required

[Step 2] Sending Cross-Chain Payment
✓ Payment confirmed on Subnet A

[Step 3] Waiting for Teleporter/ICM Relayer
⏳ Waiting for relayer (10 seconds)...

[Step 4] Verifying Payment Receipt on Subnet B
✓ Payment receipt verified on Subnet B!

[Step 5] Consuming Payment to Access Resource
✓ Payment consumed successfully!
🎉 ACCESS GRANTED!

[Step 6] Verifying Payment Consumption
✓ Payment marked as consumed on-chain

[Step 7] Testing Replay Attack Prevention
✓ Replay attack prevented! ✓

======================================================================
✅ Demo Completed Successfully!
======================================================================
```

## Verbose Mode

For detailed logging:

```bash
npm run demo:verbose
```

## Troubleshooting

**Demo fails?** Check:
- Is the server running? `curl http://localhost:3000/health`
- Is the network up? `avalanche network status`
- Are contracts deployed? See `../test/testing.txt`

See `DEMO.md` for complete troubleshooting guide.

---

For complete documentation, see [DEMO.md](./DEMO.md)
