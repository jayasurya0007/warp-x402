/**
 * Test script for automated deployment
 * Tests Warp402Factory.quickSetup() with local network
 */

import { Warp402Factory } from './src/deploy/Warp402Factory';

async function testDeployment() {
  console.log('🧪 Testing Automated Deployment...\n');

  try {
    // Test configuration
    const config = {
      privateKey: process.env.PRIVATE_KEY || '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
      
      senderChain: {
        rpc: process.env.SENDER_RPC || 'http://127.0.0.1:9650/ext/bc/C/rpc',
        chainId: Number(process.env.SENDER_CHAIN_ID) || 43112,
        blockchainId: process.env.SENDER_BLOCKCHAIN_ID || '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
        messengerAddress: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
      },
      
      receiverChain: {
        rpc: process.env.RECEIVER_RPC || 'http://127.0.0.1:9650/ext/bc/mysubnet/rpc',
        chainId: Number(process.env.RECEIVER_CHAIN_ID) || 99999,
        blockchainId: process.env.RECEIVER_BLOCKCHAIN_ID || '0xc063de20d9e6e3b3e5b0f5e1e8e7e6e5e4e3e2e1e0dfdedddcdbdad9d8d7d6d5',
        messengerAddress: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
      }
    };

    console.log('📋 Configuration:');
    console.log('  Sender RPC:', config.senderChain.rpc);
    console.log('  Receiver RPC:', config.receiverChain.rpc);
    console.log('');

    // Test deployment
    console.log('🚀 Starting automated deployment...\n');
    const startTime = Date.now();

    const warp = await Warp402Factory.quickSetup(config);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('');
    console.log('✅ Deployment successful!');
    console.log(`⏱️  Time taken: ${duration}s`);
    console.log('');
    console.log('📍 Deployed Addresses:');
    console.log('  Sender:  ', (warp as any).sender.contractAddress);
    console.log('  Receiver:', (warp as any).receiver.contractAddress);
    console.log('');
    console.log('🎉 Automated deployment test PASSED!');

    return {
      success: true,
      senderAddress: (warp as any).sender.contractAddress,
      receiverAddress: (warp as any).receiver.contractAddress,
      duration
    };

  } catch (error: any) {
    console.error('');
    console.error('❌ Deployment failed!');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('could not detect network')) {
      console.error('💡 Tip: Make sure your local Avalanche network is running:');
      console.error('   avalanche network start');
    }
    
    if (error.message.includes('insufficient funds')) {
      console.error('💡 Tip: Fund your account with test AVAX');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

// Run test
testDeployment()
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
