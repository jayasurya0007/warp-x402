/**
 * Quickstart Example - Complete payment flow in one file
 * 
 * This example shows:
 * 1. Deploy contracts to two chains
 * 2. Send a payment
 * 3. Verify the payment
 */

import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

async function main() {
  console.log('🚀 Warp-402 SDK Quickstart\n');

  // Configuration
  const config = {
    privateKey: process.env.PRIVATE_KEY || '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
    
    // Chain where payment is sent
    senderChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
      chainId: 1001,
      blockchainId: '0x' + 'a'.repeat(64),
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf' // Teleporter address
    },
    
    // Chain where payment is verified
    receiverChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/2M9tKWM1UqnFWzDauYnT6xUSaTbvLAMcJpWo9ZGR7CkYdamHDD/rpc',
      chainId: 1002,
      blockchainId: '0x' + 'b'.repeat(64),
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
    }
  };

  try {
    // Deploy contracts and initialize SDK
    console.log('📦 Deploying contracts...');
    const warp = await Warp402Factory.quickSetup(config);
    console.log('✅ Contracts deployed successfully\n');

    // Send payment
    console.log('💰 Sending payment...');
    const amount = ethers.parseEther('0.01');
    const paymentId = await warp.pay(amount);
    console.log(`✅ Payment sent: ${paymentId}\n`);

    // Wait for cross-chain relay (requires ICM Relayer)
    console.log('⏳ Waiting 5 seconds for cross-chain relay...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify payment
    console.log('🔍 Verifying payment...');
    const isVerified = await warp.verify(paymentId);
    console.log(`${isVerified ? '✅' : '⚠️'} Payment verified: ${isVerified}\n`);

    if (!isVerified) {
      console.log('💡 Note: Start ICM Relayer with: avalanche interchain relayer start');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
