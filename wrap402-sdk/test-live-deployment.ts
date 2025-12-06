/**
 * LIVE DEPLOYMENT TEST
 * Tests automated deployment on local Avalanche network
 */

import { Warp402Factory } from './src/deploy/Warp402Factory';

async function deployToLocal() {
  console.log('🚀 LIVE DEPLOYMENT TEST');
  console.log('━'.repeat(70));
  console.log('');

  // Local network configuration from avalanche blockchain deploy output
  const config = {
    privateKey: '56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027', // ewoq key
    
    // SubnetA (Chain ID: 1001)
    senderChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
      chainId: 1001,
      blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
    },
    
    // SubnetB (Chain ID: 1002)
    receiverChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/2M9tKWM1UqnFWzDauYnT6xUSaTbvLAMcJpWo9ZGR7CkYdamHDD/rpc',
      chainId: 1002,
      blockchainId: '0xb174d4b19fad340f41228c738a651af244ae34072f46ae7a010c84d8ab9beec2',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
    }
  };

  console.log('📋 Network Configuration:');
  console.log('  Sender:   SubnetA (Chain ID: 1001)');
  console.log('  Receiver: SubnetB (Chain ID: 1002)');
  console.log('  Account:  0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC (ewoq)');
  console.log('');

  try {
    const startTime = Date.now();
    
    console.log('🎯 Starting automated deployment...\n');
    
    // This will:
    // 1. Deploy WarpSender to SubnetA
    // 2. Deploy WarpReceiver to SubnetB
    // 3. Configure cross-chain handshake
    // 4. Return ready-to-use SDK
    const warp = await Warp402Factory.quickSetup(config);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Extract contract addresses (using internal access for testing)
    const senderAddress = (warp as any).config.senderChain.sender;
    const receiverAddress = (warp as any).config.receiverChain.receiver;
    
    console.log('');
    console.log('━'.repeat(70));
    console.log('✅ DEPLOYMENT SUCCESSFUL!');
    console.log('━'.repeat(70));
    console.log('');
    console.log('⏱️  Time taken:', duration, 'seconds');
    console.log('');
    console.log('📍 Deployed Contract Addresses:');
    console.log('');
    console.log('  WarpSender (SubnetA):');
    console.log('   ', senderAddress);
    console.log('');
    console.log('  WarpReceiver (SubnetB):');
    console.log('   ', receiverAddress);
    console.log('');
    console.log('━'.repeat(70));
    console.log('');
    console.log('🎉 You can now use these contracts for cross-chain payments!');
    console.log('');
    console.log('To verify on block explorer:');
    console.log(`  SubnetA: http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc`);
    console.log(`  SubnetB: http://127.0.0.1:9650/ext/bc/2M9tKWM1UqnFWzDauYnT6xUSaTbvLAMcJpWo9ZGR7CkYdamHDD/rpc`);
    console.log('');

    // Save addresses to file
    const fs = require('fs');
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      network: 'local',
      sender: {
        chain: 'SubnetA',
        chainId: 1001,
        address: senderAddress,
        rpc: config.senderChain.rpc
      },
      receiver: {
        chain: 'SubnetB',
        chainId: 1002,
        address: receiverAddress,
        rpc: config.receiverChain.rpc
      }
    };

    fs.writeFileSync(
      'deployment-addresses.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log('💾 Deployment info saved to: deployment-addresses.json');
    console.log('');

    return {
      success: true,
      senderAddress,
      receiverAddress,
      duration
    };

  } catch (error: any) {
    console.error('');
    console.error('━'.repeat(70));
    console.error('❌ DEPLOYMENT FAILED!');
    console.error('━'.repeat(70));
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }

    return {
      success: false,
      error: error.message
    };
  }
}

// Run the deployment
deployToLocal()
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
