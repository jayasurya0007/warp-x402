/**
 * Example 3: Verify Payment
 * 
 * Shows how to verify a payment was received on the destination chain
 * Note: Requires ICM Relayer to be running for cross-chain messaging
 */

import { Warp402Factory } from 'avax-warp-pay';

async function main() {
  console.log('🔍 Verifying Cross-Chain Payment\n');

  const warp = Warp402Factory.fromExisting({
    privateKey: process.env.PRIVATE_KEY || '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
    
    senderChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
      chainId: 1001,
      blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      sender: '0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00'
    },
    
    receiverChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/krncd99BqvSYebiEuZk8NvYNiaS3zWaUtRg2mD3F8hQvroBR8/rpc',
      chainId: 1002,
      blockchainId: '0x6395f92aaae85f30810132579df9b48133f6d28daf144ab633de2e3477a2f8da',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      receiver: '0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D'
    }
  });

  try {
    // Payment ID from example 2
    const paymentId = process.env.PAYMENT_ID || '0x8f17c5a74e3b1c556247d37226ce150fefa666b1a205de63ab8b055b8b108801';
    
    console.log(`Checking payment: ${paymentId}\n`);

    // Verify payment
    const isVerified = await warp.verify(paymentId);
    
    if (isVerified) {
      console.log('✅ Payment verified on receiver chain!');
      
      // Mark as consumed (prevents double-spending)
      await warp.consume(paymentId);
      console.log('✅ Payment marked as consumed');
      
    } else {
      console.log('⚠️  Payment not yet verified');
      console.log('\nPossible reasons:');
      console.log('  • ICM Relayer not running (start with: avalanche interchain relayer start)');
      console.log('  • Message still being relayed (wait a few seconds)');
      console.log('  • Wrong payment ID');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
