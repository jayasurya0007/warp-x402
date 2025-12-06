/**
 * Example: Automated Contract Deployment
 * Shows how to use Warp402Factory for quick setup
 */

import { Warp402Factory } from '../src/deploy';
import { ethers } from 'ethers';

async function main() {
  console.log('🚀 Warp-402 Automated Deployment Example\n');
  
  // Check environment variables
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY environment variable required');
    process.exit(1);
  }
  
  try {
    // Quick setup: Deploy, configure, and initialize in one call!
    const warp = await Warp402Factory.quickSetup({
      privateKey,
      senderChain: {
        rpc: "https://api.avax-test.network/ext/bc/C/rpc",
        chainId: 43113,
        blockchainId: "0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5",
        messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf"
      },
      receiverChain: {
        rpc: "http://127.0.0.1:9650/ext/bc/2TjM8drQgU5cgi7rfBCJ3a6VKSMHq3oCQd8pDHwHo9Wf1KwGB9/rpc",
        chainId: 1002,
        blockchainId: "0xc063de20578887dbbbf1ac65224ff343356e41827b7e82bbc8af8814310be481",
        messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf"
      }
    });
    
    console.log('\n📊 Testing Deployment\n');
    
    // Check wallet balance
    const balance = await warp.getSenderBalance();
    console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} AVAX`);
    
    // Get contract configurations
    const senderConfig = await warp.getSenderConfig();
    console.log(`\n📤 Sender Contract:`);
    console.log(`   Owner: ${senderConfig.owner}`);
    console.log(`   Paused: ${senderConfig.paused}`);
    console.log(`   Remote Receiver: ${senderConfig.remoteReceiver}`);
    console.log(`   Remote Blockchain: ${senderConfig.remoteBlockchainId}`);
    
    const receiverConfig = await warp.getReceiverConfig();
    console.log(`\n📥 Receiver Contract:`);
    console.log(`   Owner: ${receiverConfig.owner}`);
    console.log(`   Paused: ${receiverConfig.paused}`);
    console.log(`   Approved Sender: ${receiverConfig.approvedSender}`);
    console.log(`   Approved Blockchain: ${receiverConfig.approvedSourceBlockchainId}`);
    
    // Send a test payment
    console.log(`\n💸 Sending test payment...`);
    const paymentId = await warp.pay(ethers.parseEther("0.01"));
    console.log(`✅ Payment sent: ${paymentId}`);
    
    // Wait for cross-chain relay
    console.log(`\n⏳ Waiting for Teleporter relay (30 seconds)...`);
    await new Promise(r => setTimeout(r, 30000));
    
    // Verify payment
    console.log(`\n🔍 Verifying payment...`);
    const verified = await warp.verify(paymentId);
    
    if (verified) {
      console.log(`✅ Payment verified on receiver chain!`);
      
      // Get receipt details
      const receipt = await warp.getReceipt(paymentId);
      if (receipt) {
        console.log(`\n📄 Receipt Details:`);
        console.log(`   Payment ID: ${receipt.paymentId}`);
        console.log(`   Payer: ${receipt.payer}`);
        console.log(`   Amount: ${ethers.formatEther(receipt.amount)} AVAX`);
        console.log(`   Timestamp: ${new Date(Number(receipt.timestamp) * 1000).toISOString()}`);
        console.log(`   Consumed: ${receipt.consumed}`);
      }
      
      // Consume payment
      console.log(`\n🔒 Consuming payment...`);
      await warp.consume(paymentId);
      console.log(`✅ Payment consumed (marked as used)`);
      
    } else {
      console.log(`❌ Payment not yet verified`);
      console.log(`   This may be due to:`);
      console.log(`   - Teleporter relay still processing`);
      console.log(`   - Network connectivity issues`);
      console.log(`   - Incorrect configuration`);
    }
    
    console.log(`\n✨ Demo complete!`);
    
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('   → Not enough AVAX for gas fees');
      console.error('   → Get testnet AVAX: https://faucet.avax.network/');
    }
    process.exit(1);
  }
}

// Run the example
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
