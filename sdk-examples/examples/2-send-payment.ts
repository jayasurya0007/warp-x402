/**
 * Example 2: Send Payment
 * 
 * Shows how to send a cross-chain payment using deployed contracts
 */

import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

async function main() {
  console.log('💰 Sending Cross-Chain Payment\n');

  // Use existing deployed contracts
  const warp = Warp402Factory.fromExisting({
    privateKey: process.env.PRIVATE_KEY || '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
    
    senderChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
      chainId: 1001,
      blockchainId: '0x' + 'a'.repeat(64),
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922' // Your deployed sender address
    },
    
    receiverChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/2M9tKWM1UqnFWzDauYnT6xUSaTbvLAMcJpWo9ZGR7CkYdamHDD/rpc',
      chainId: 1002,
      blockchainId: '0x' + 'b'.repeat(64),
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922' // Your deployed receiver address
    }
  });

  try {
    // Check wallet balance
    const balance = await warp.getSenderBalance();
    console.log(`Wallet: ${warp.getSenderAddress()}`);
    console.log(`Balance: ${ethers.formatEther(balance)} tokens\n`);

    // Send payment
    const amount = ethers.parseEther('0.01');
    console.log(`Sending ${ethers.formatEther(amount)} tokens...`);
    
    const paymentId = await warp.pay(amount);
    
    console.log(`✅ Payment sent!`);
    console.log(`Payment ID: ${paymentId}\n`);
    console.log('💾 Save this Payment ID to verify it in example 3');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
