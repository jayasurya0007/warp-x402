/**
 * Error Handling Examples - Proper error management
 */

import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

async function main() {
  console.log('Error Handling Examples\n');

  // ============================================================
  // 1. Invalid Configuration
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Handling Invalid Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const warp = Warp402Factory.fromExisting({
      privateKey: '', // Invalid: empty
      senderChain: {
        rpc: 'http://localhost:9650',
        chainId: 1001,
        blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
      },
      receiverChain: {
        rpc: 'http://localhost:9652',
        chainId: 1002,
        blockchainId: '0xd9123a2d0e43bab99c87ee6a9bca849f161a97cfc66adeeb4b440fd7c906f092',
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
      }
    });
  } catch (error: any) {
    console.log(`✓ Caught error: ${error.message}\n`);
  }

  // ============================================================
  // 2. Insufficient Balance
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2. Handling Insufficient Balance');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const warp = Warp402Factory.fromExisting({
    privateKey: '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
    senderChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
      chainId: 1001,
      blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
    },
    receiverChain: {
      rpc: 'http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc',
      chainId: 1002,
      blockchainId: '0xd9123a2d0e43bab99c87ee6a9bca849f161a97cfc66adeeb4b440fd7c906f092',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
    }
  });

  try {
    const balance = await warp.getSenderBalance();
    const amount = ethers.parseEther('1000000'); // Too much
    
    if (balance < amount) {
      console.log(`✓ Balance check prevented error`);
      console.log(`  Balance: ${ethers.formatEther(balance)}`);
      console.log(`  Required: ${ethers.formatEther(amount)}\n`);
    }
  } catch (error: any) {
    console.log(`✓ Caught error: ${error.message}\n`);
  }

  // ============================================================
  // 3. Network Errors
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3. Handling Network Errors');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const invalidWarp = Warp402Factory.fromExisting({
      privateKey: '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
      senderChain: {
        rpc: 'http://invalid-rpc:9999', // Invalid RPC
        chainId: 1001,
        blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
      },
      receiverChain: {
        rpc: 'http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc',
        chainId: 1002,
        blockchainId: '0xd9123a2d0e43bab99c87ee6a9bca849f161a97cfc66adeeb4b440fd7c906f092',
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
      }
    });
    
    await invalidWarp.getSenderBalance();
  } catch (error: any) {
    console.log(`✓ Network error caught: ${error.message}\n`);
  }

  // ============================================================
  // 4. Payment Verification Timeout
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4. Handling Payment Not Verified');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const paymentId = await warp.pay(ethers.parseEther('0.001'));
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const verified = await warp.verify(paymentId);
  if (!verified) {
    console.log('✓ Payment not yet verified (expected without relayer)');
    console.log('  Solution: Start ICM Relayer');
    console.log('  Command: avalanche interchain relayer start\n');
  }

  console.log('✅ Error handling examples complete!');
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
