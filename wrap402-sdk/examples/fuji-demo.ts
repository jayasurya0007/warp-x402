/**
 * Fuji Testnet Demo
 * 
 * Demonstrates payment on Fuji C-Chain with receipt verification
 * Note: For full cross-chain demo, receiver should be on a different subnet
 */

import { Warp402 } from '../src';
import { ethers } from 'ethers';

// Fuji testnet configuration
const config = {
  privateKey: process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE',
  
  senderChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: process.env.FUJI_SENDER || '0x0d45537c1DA893148dBB113407698E20CfA2eE56'
  },
  
  receiverChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc', // Same chain for demo
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: process.env.FUJI_RECEIVER || '0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f'
  }
};

async function main() {
  console.log('='.repeat(60));
  console.log('🌐 Warp-402 SDK - Fuji Testnet Demo');
  console.log('='.repeat(60));
  console.log();

  try {
    // Initialize SDK
    console.log('📦 Initializing Warp402 SDK on Fuji...');
    const warp = new Warp402(config);
    console.log('✅ SDK initialized successfully');
    console.log();

    // Get sender info
    const balance = await warp.getSenderBalance();
    const address = warp.getSenderAddress();
    
    console.log(`💰 Sender balance: ${ethers.formatEther(balance)} AVAX`);
    console.log(`📍 Sender address: ${address}`);
    console.log(`🔗 Snowtrace: https://testnet.snowtrace.io/address/${address}`);
    console.log();

    // Check if sufficient balance
    if (balance < ethers.parseEther('0.01')) {
      console.warn('⚠️  Low balance! Get testnet AVAX from:');
      console.warn('   https://faucet.avax.network/');
      console.log();
    }

    // Get contract configurations
    console.log('🔧 Smart Contract Configuration:');
    const senderConfig = await warp.getSenderConfig();
    console.log(`   WarpSender: ${config.senderChain.sender}`);
    console.log(`   → Receiver Chain: ${senderConfig.receiverChainId}`);
    console.log(`   → Receiver Address: ${senderConfig.receiverAddress}`);
    console.log();

    const receiverConfig = await warp.getReceiverConfig();
    console.log(`   WarpReceiver: ${config.receiverChain.receiver}`);
    console.log(`   ← Sender Chain: ${receiverConfig.senderChainId}`);
    console.log(`   ← Sender Address: ${receiverConfig.senderAddress}`);
    console.log();

    // Send payment
    const amount = ethers.parseEther('0.001'); // 0.001 AVAX
    console.log(`💸 Sending payment of ${ethers.formatEther(amount)} AVAX...`);
    
    const paymentId = await warp.pay(amount);
    console.log(`✅ Payment sent!`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log();

    // Note about same-chain limitation
    console.log('📝 Note: Both contracts are on Fuji C-Chain (same blockchain ID)');
    console.log('   Teleporter requires different blockchain IDs for cross-chain messaging');
    console.log('   For full demo, use local network with 2 subnets or deploy to different chains');
    console.log();

    // Try verification (will work if same chain, otherwise needs relay)
    console.log('🔍 Checking payment status...');
    
    // For same-chain deployment, check immediately
    // For cross-chain, would need to wait for relay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const verified = await warp.verify(paymentId);
    console.log(`   Verified: ${verified}`);
    
    if (verified) {
      const receipt = await warp.getReceipt(paymentId);
      if (receipt) {
        console.log(`   Amount: ${ethers.formatEther(receipt.amount)} AVAX`);
        console.log(`   Payer: ${receipt.payer}`);
        console.log(`   Timestamp: ${new Date(receipt.timestamp * 1000).toISOString()}`);
      }
    }
    console.log();

    console.log('='.repeat(60));
    console.log('✅ Fuji demo completed!');
    console.log('='.repeat(60));
    console.log();
    console.log('🔗 View on Snowtrace:');
    console.log(`   Sender: https://testnet.snowtrace.io/address/${config.senderChain.sender}`);
    console.log(`   Receiver: https://testnet.snowtrace.io/address/${config.receiverChain.receiver}`);

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
