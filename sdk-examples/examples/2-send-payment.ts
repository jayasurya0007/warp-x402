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
      blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      sender: '0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00' // Your deployed sender address
    },
    
    receiverChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/krncd99BqvSYebiEuZk8NvYNiaS3zWaUtRg2mD3F8hQvroBR8/rpc',
      chainId: 1002,
      blockchainId: '0x6395f92aaae85f30810132579df9b48133f6d28daf144ab633de2e3477a2f8da',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      receiver: '0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D' // Your deployed receiver address
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
