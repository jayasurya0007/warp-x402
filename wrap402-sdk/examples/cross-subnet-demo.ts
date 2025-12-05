/**
 * Cross-Subnet Demo
 * 
 * Demonstrates payment between any two Avalanche subnets
 * This is the production pattern for real cross-chain payments
 */

import { Warp402 } from '../src';
import { ethers } from 'ethers';

// Configure your two subnets here
const config = {
  privateKey: process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE',
  
  // Source subnet (where payment is made)
  senderChain: {
    rpc: process.env.SENDER_RPC || 'http://localhost:9650/ext/bc/subnetA/rpc',
    chainId: parseInt(process.env.SENDER_CHAIN_ID || '12345'),
    blockchainId: process.env.SENDER_BLOCKCHAIN_ID || '0x' + '1'.repeat(64),
    messenger: process.env.SENDER_MESSENGER || '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: process.env.SENDER_CONTRACT || '0xYourWarpSenderAddress'
  },
  
  // Destination subnet (where receipt is verified)
  receiverChain: {
    rpc: process.env.RECEIVER_RPC || 'http://localhost:9650/ext/bc/subnetB/rpc',
    chainId: parseInt(process.env.RECEIVER_CHAIN_ID || '54321'),
    blockchainId: process.env.RECEIVER_BLOCKCHAIN_ID || '0x' + '2'.repeat(64),
    messenger: process.env.RECEIVER_MESSENGER || '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: process.env.RECEIVER_CONTRACT || '0xYourWarpReceiverAddress'
  }
};

async function main() {
  console.log('='.repeat(60));
  console.log('🔗 Warp-402 SDK - Cross-Subnet Payment Demo');
  console.log('='.repeat(60));
  console.log();

  try {
    // Initialize SDK
    console.log('📦 Initializing Warp402 SDK...');
    console.log(`   Sender Chain ID: ${config.senderChain.chainId}`);
    console.log(`   Receiver Chain ID: ${config.receiverChain.chainId}`);
    console.log();

    const warp = new Warp402(config);
    console.log('✅ SDK initialized successfully');
    console.log();

    // Display configuration
    console.log('🔧 Configuration:');
    console.log(`   Sender RPC: ${config.senderChain.rpc}`);
    console.log(`   Sender Contract: ${config.senderChain.sender}`);
    console.log(`   Receiver RPC: ${config.receiverChain.rpc}`);
    console.log(`   Receiver Contract: ${config.receiverChain.receiver}`);
    console.log();

    // Get wallet info
    const balance = await warp.getSenderBalance();
    const address = warp.getSenderAddress();
    
    console.log('👛 Wallet Information:');
    console.log(`   Address: ${address}`);
    console.log(`   Balance: ${ethers.formatEther(balance)} tokens`);
    console.log();

    // Verify configuration
    console.log('🔍 Verifying contract configuration...');
    const senderConfig = await warp.getSenderConfig();
    const receiverConfig = await warp.getReceiverConfig();
    
    console.log('   Sender -> Receiver:');
    console.log(`     Chain ID: ${senderConfig.receiverChainId}`);
    console.log(`     Address: ${senderConfig.receiverAddress}`);
    console.log(`     Teleporter: ${senderConfig.teleporterMessenger}`);
    console.log();
    
    console.log('   Receiver <- Sender:');
    console.log(`     Chain ID: ${receiverConfig.senderChainId}`);
    console.log(`     Address: ${receiverConfig.senderAddress}`);
    console.log(`     Teleporter: ${receiverConfig.teleporterMessenger}`);
    console.log();

    // Send payment
    const amount = ethers.parseEther('0.1');
    console.log(`💸 Sending cross-subnet payment...`);
    console.log(`   Amount: ${ethers.formatEther(amount)} tokens`);
    
    const startTime = Date.now();
    const paymentId = await warp.pay(amount);
    const txTime = Date.now() - startTime;
    
    console.log(`✅ Payment sent! (${txTime}ms)`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log();

    // Wait for Teleporter relay
    console.log('⏳ Waiting for Teleporter relay...');
    console.log('   ICM relayer will automatically deliver the message');
    console.log('   This typically takes 5-10 seconds');
    
    const relayStart = Date.now();
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = 2000;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      process.stdout.write(`\r   Attempt ${attempts}/${maxAttempts}... `);
      
      const verified = await warp.verify(paymentId);
      
      if (verified) {
        const relayTime = Date.now() - relayStart;
        console.log(`\n✅ Payment verified! (${relayTime}ms)`);
        console.log();
        
        // Get receipt details
        console.log('📄 Receipt Details:');
        const receipt = await warp.getReceipt(paymentId);
        
        if (receipt) {
          console.log(`   Payment ID: ${receipt.paymentId}`);
          console.log(`   Payer: ${receipt.payer}`);
          console.log(`   Amount: ${ethers.formatEther(receipt.amount)} tokens`);
          console.log(`   Timestamp: ${new Date(receipt.timestamp * 1000).toISOString()}`);
          console.log(`   Consumed: ${receipt.consumed}`);
          console.log();
        }
        
        // Consume payment
        console.log('🔒 Consuming payment...');
        const consumeResult = await warp.consume(paymentId);
        console.log(`✅ Payment consumed!`);
        console.log(`   Transaction: ${consumeResult.hash}`);
        console.log(`   Gas used: ${consumeResult.gasUsed.toString()}`);
        console.log();
        
        // Verify consumption
        const verification = await warp.getVerification(paymentId);
        console.log('✅ Final verification:');
        console.log(`   Valid for new use: ${verification.isValid}`);
        console.log(`   Consumed flag: ${verification.receipt?.consumed}`);
        console.log();
        
        break;
      }
      
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    if (attempts >= maxAttempts) {
      console.log('\n⚠️  Payment not verified within timeout');
      console.log('   Possible issues:');
      console.log('   - ICM relayer not running');
      console.log('   - Contract configuration mismatch');
      console.log('   - Network connectivity issues');
      console.log('   - Blockchain IDs are the same (must be different)');
    }

    console.log('='.repeat(60));
    console.log('✅ Cross-subnet demo completed!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
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
