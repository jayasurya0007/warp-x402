/**
 * Example 1: Deploy Contracts
 * 
 * Shows how to deploy WarpSender and WarpReceiver contracts
 * using the SDK's automated deployment
 */

import { Warp402Factory } from 'avax-warp-pay';

async function main() {
  console.log('📦 Deploying Warp-402 Contracts\n');

  const config = {
    privateKey: process.env.PRIVATE_KEY || '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
    
    senderChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
      chainId: 1001,
      blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
    },
    
    receiverChain: {
      rpc: 'http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc',
      chainId: 1002,
      blockchainId: '0xd9123a2d0e43bab99c87ee6a9bca849f161a97cfc66adeeb4b440fd7c906f092',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
    }
  };

  try {
    // Deploy contracts and get addresses
    console.log('Deploying contracts...\n');
    const deployment = await Warp402Factory.deployOnly(config);
    
    console.log('✅ Deployment complete!');
    console.log(`\nSender Contract:`);
    console.log(`  Address: ${deployment.senderAddress}`);
    console.log(`  TX Hash: ${deployment.senderTxHash}`);
    console.log(`\nReceiver Contract:`);
    console.log(`  Address: ${deployment.receiverAddress}`);
    console.log(`  TX Hash: ${deployment.receiverTxHash}`);
    
    console.log('\n💾 Save these addresses for examples 2 & 3');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
