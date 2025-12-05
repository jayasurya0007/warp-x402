/**
 * Real Developer Test: Can a new user understand this in 30 seconds?
 */

import { Warp402 } from 'warp402-sdk';
import { ethers } from 'ethers';

// Setup (user just copies their addresses)
const warp = new Warp402({
  privateKey: process.env.PRIVATE_KEY!,
  senderChain: {
    rpc: "http://localhost:9650/ext/bc/subnetA/rpc",
    chainId: 1001,
    blockchainId: "0x...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    sender: "0xYourSenderAddress"
  },
  receiverChain: {
    rpc: "http://localhost:9650/ext/bc/subnetB/rpc",
    chainId: 1002,
    blockchainId: "0x...",
    messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
    receiver: "0xYourReceiverAddress"
  }
});

// Usage (self-explanatory)
async function payForService() {
  // Step 1: Pay
  const paymentId = await warp.pay(ethers.parseEther("1"));
  
  // Step 2: Wait for cross-chain relay
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Step 3: Verify & use
  if (await warp.verify(paymentId)) {
    await warp.consume(paymentId);
    return "Access granted!";
  }
  
  return "Payment not verified";
}

// ✅ Result: YES - A new developer can understand this in 30 seconds!
//    - Method names are clear
//    - Flow is logical
//    - No complex blockchain concepts exposed
