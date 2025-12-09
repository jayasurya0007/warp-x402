#!/usr/bin/env node

/**
 * Example: Using avax-warp-pay SDK
 * 
 * This demonstrates the complete payment flow using the published NPM package
 */

import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🚀 avax-warp-pay SDK Example\n');

  // Initialize SDK with your configuration
  const warp = new Warp402({
    privateKey: process.env.PRIVATE_KEY,
    senderChain: {
      rpc: process.env.SUBNET_A_RPC_URL,
      chainId: parseInt(process.env.SUBNET_A_CHAIN_ID),
      blockchainId: process.env.SUBNET_A_BLOCKCHAIN_ID,
      messenger: process.env.TELEPORTER_MESSENGER_ADDRESS,
      sender: process.env.WARP_SENDER_ADDRESS
    },
    receiverChain: {
      rpc: process.env.SUBNET_B_RPC_URL,
      chainId: parseInt(process.env.SUBNET_B_CHAIN_ID),
      blockchainId: process.env.SUBNET_B_BLOCKCHAIN_ID,
      messenger: process.env.TELEPORTER_MESSENGER_ADDRESS,
      receiver: process.env.WARP_RECEIVER_ADDRESS
    }
  });

  console.log('✅ SDK initialized\n');

  try {
    // STEP 1: Send a payment
    console.log('📤 Sending payment...');
    const amount = ethers.parseEther('1.0'); // 1 token
    const paymentId = await warp.pay(amount);
    
    console.log(`✅ Payment sent!`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Amount: ${ethers.formatEther(amount)} tokens\n`);

    // STEP 2: Wait for cross-chain relay (in production, this happens automatically)
    console.log('⏳ Waiting for ICM relayer to process message...');
    console.log('   (This usually takes 10-30 seconds)\n');
    
    await new Promise(resolve => setTimeout(resolve, 15000));

    // STEP 3: Verify the payment on receiving chain
    console.log('🔍 Verifying payment receipt...');
    const isVerified = await warp.verify(paymentId);
    
    if (isVerified) {
      console.log('✅ Payment verified on receiving chain!\n');
      
      // STEP 4: Get payment details
      const receipt = await warp.getReceipt(paymentId);
      console.log('📋 Payment Receipt:');
      console.log(`   Payer: ${receipt.payer}`);
      console.log(`   Amount: ${ethers.formatEther(receipt.amount)} tokens`);
      console.log(`   Timestamp: ${new Date(Number(receipt.timestamp) * 1000).toISOString()}`);
      console.log(`   Consumed: ${receipt.consumed}\n`);

      // STEP 5: Check if payment is still valid (not expired/consumed)
      const isValid = await warp.receiver.isValidPayment(paymentId);
      console.log(`📊 Payment Valid: ${isValid}`);
      
      if (isValid) {
        // STEP 6: Consume the payment (mark as used)
        console.log('\n💰 Consuming payment...');
        await warp.consume(paymentId);
        console.log('✅ Payment consumed successfully!');
        
        // Verify it's now consumed
        const isConsumed = await warp.receiver.isConsumed(paymentId);
        console.log(`   Consumed status: ${isConsumed}\n`);
      }
      
    } else {
      console.log('❌ Payment not verified yet');
      console.log('   Possible reasons:');
      console.log('   - ICM relayer still processing');
      console.log('   - Network connectivity issues');
      console.log('   - Transaction failed\n');
    }

    // BONUS: Get contract configuration
    console.log('⚙️  Contract Configuration:');
    const senderConfig = await warp.sender.getConfiguration();
    console.log('   Sender:');
    console.log(`     Owner: ${senderConfig.owner}`);
    console.log(`     Paused: ${senderConfig.paused}`);
    console.log(`     Gas Limit: ${senderConfig.defaultGasLimit}`);
    
    const receiverConfig = await warp.receiver.getConfiguration();
    console.log('   Receiver:');
    console.log(`     Owner: ${receiverConfig.owner}`);
    console.log(`     Paused: ${receiverConfig.paused}`);
    console.log(`     Expiry Time: ${receiverConfig.paymentExpiryTime} seconds`);
    console.log(`     Required Amount: ${ethers.formatEther(receiverConfig.requiredPaymentAmount)} tokens`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  }
}

main().catch(console.error);
