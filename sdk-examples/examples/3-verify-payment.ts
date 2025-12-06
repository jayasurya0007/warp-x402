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
      blockchainId: '0x' + 'a'.repeat(64),
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
    },
    
    receiverChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/2M9tKWM1UqnFWzDauYnT6xUSaTbvLAMcJpWo9ZGR7CkYdamHDD/rpc',
      chainId: 1002,
      blockchainId: '0x' + 'b'.repeat(64),
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
    }
  });

  try {
    // Payment ID from example 2
    const paymentId = process.env.PAYMENT_ID || 'ed66038991af2bff4f081808c991021071a5b1a9790a1c4b757b7e7f907e887b';
    
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
