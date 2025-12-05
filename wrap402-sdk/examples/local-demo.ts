/**
 * Local Network Demo
 * 
 * Demonstrates cross-chain payment between two local subnets
 * Prerequisites: Local Avalanche network running with 2 subnets
 */

import { Warp402 } from '../src';
import { ethers } from 'ethers';

// Local network configuration
const config = {
  privateKey: process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE',
  
  senderChain: {
    rpc: 'http://localhost:9650/ext/bc/subnetA/rpc',
    chainId: 12345,
    blockchainId: '0x' + '1'.repeat(64), // Replace with actual blockchain ID
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: process.env.SENDER_ADDRESS || '0xYourWarpSenderAddress'
  },
  
  receiverChain: {
    rpc: 'http://localhost:9650/ext/bc/subnetB/rpc',
    chainId: 54321,
    blockchainId: '0x' + '2'.repeat(64), // Replace with actual blockchain ID
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: process.env.RECEIVER_ADDRESS || '0xYourWarpReceiverAddress'
  }
};

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Warp-402 SDK - Local Network Demo');
  console.log('='.repeat(60));
  console.log();

  try {
    // Initialize SDK
    console.log('📦 Initializing Warp402 SDK...');
    const warp = new Warp402(config);
    console.log('✅ SDK initialized successfully');
    console.log();

    // Get sender balance
    const balance = await warp.getSenderBalance();
    console.log(`💰 Sender balance: ${ethers.formatEther(balance)} tokens`);
    console.log(`📍 Sender address: ${warp.getSenderAddress()}`);
    console.log();

    // Get contract configurations
    console.log('🔧 Contract Configurations:');
    const senderConfig = await warp.getSenderConfig();
    console.log(`   Sender -> Receiver Chain: ${senderConfig.receiverChainId}`);
    console.log(`   Sender -> Receiver Address: ${senderConfig.receiverAddress}`);
    console.log();

    const receiverConfig = await warp.getReceiverConfig();
    console.log(`   Receiver <- Sender Chain: ${receiverConfig.senderChainId}`);
    console.log(`   Receiver <- Sender Address: ${receiverConfig.senderAddress}`);
    console.log();

    // Step 1: Send payment
    const amount = ethers.parseEther('0.1'); // 0.1 tokens
    console.log(`💸 Step 1: Sending payment of ${ethers.formatEther(amount)} tokens...`);
    
    const paymentId = await warp.pay(amount);
    console.log(`✅ Payment sent!`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log();

    // Step 2: Wait for cross-chain relay
    console.log('⏳ Step 2: Waiting for Teleporter relay (10 seconds)...');
    console.log('   (In production, ICM relayer automatically delivers messages)');
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log();

    // Step 3: Verify payment on receiver chain
    console.log('🔍 Step 3: Verifying payment on receiver chain...');
    const verified = await warp.verify(paymentId);
    
    if (verified) {
      console.log('✅ Payment VERIFIED on receiver chain!');
      console.log();

      // Step 4: Get receipt details
      console.log('📄 Step 4: Fetching receipt details...');
      const receipt = await warp.getReceipt(paymentId);
      
      if (receipt) {
        console.log('✅ Receipt found:');
        console.log(`   Payer: ${receipt.payer}`);
        console.log(`   Amount: ${ethers.formatEther(receipt.amount)} tokens`);
        console.log(`   Timestamp: ${new Date(receipt.timestamp * 1000).toISOString()}`);
        console.log(`   Consumed: ${receipt.consumed}`);
        console.log();
      }

      // Step 5: Consume payment
      console.log('🔒 Step 5: Consuming payment (one-time use)...');
      const consumeResult = await warp.consume(paymentId);
      console.log('✅ Payment consumed!');
      console.log(`   Transaction: ${consumeResult.hash}`);
      console.log(`   Block: ${consumeResult.blockNumber}`);
      console.log(`   Gas used: ${consumeResult.gasUsed.toString()}`);
      console.log();

      // Step 6: Try to verify again (should still exist but marked as consumed)
      console.log('🔍 Step 6: Checking payment status after consumption...');
      const verification = await warp.getVerification(paymentId);
      console.log(`   Valid: ${verification.isValid} (should be false - consumed)`);
      if (verification.receipt) {
        console.log(`   Consumed flag: ${verification.receipt.consumed}`);
      }
      console.log();

      console.log('='.repeat(60));
      console.log('✅ Demo completed successfully!');
      console.log('='.repeat(60));
    } else {
      console.log('❌ Payment NOT verified on receiver chain');
      console.log('   Possible reasons:');
      console.log('   - Teleporter relay not yet completed');
      console.log('   - Contract configuration mismatch');
      console.log('   - Network connectivity issues');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run demo
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
