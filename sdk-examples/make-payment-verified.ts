/**
 * This example shows the COMPLETE flow to get verify() to return TRUE
 * 
 * Steps:
 * 1. Send a payment from sender chain
 * 2. Wait for ICM Relayer to deliver the message
 * 3. Manually call receiveTokens() on the receiver contract
 * 4. Now verify() will return TRUE
 */

import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║    How to Make verify() Return TRUE                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Step 1: Deploy fresh contracts and send payment
  console.log('━━━ STEP 1: Send Payment ━━━\n');
  
  const warp = await Warp402Factory.quickSetup({
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
  });

  const paymentId = await warp.pay(ethers.parseEther('0.001'));
  console.log(`✅ Payment sent: ${paymentId}\n`);

  // Step 2: Wait for relayer
  console.log('━━━ STEP 2: Wait for ICM Relayer ━━━\n');
  console.log('Waiting 10 seconds for cross-chain delivery...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('✅ Wait complete\n');

  // Step 3: Check verification (should be false)
  console.log('━━━ STEP 3: Verify Before Consuming ━━━\n');
  let verified = await warp.verify(paymentId);
  console.log(`Verified: ${verified}`);
  console.log('❌ Returns FALSE because payment not consumed yet\n');

  // Step 4: Consume the payment on receiver chain
  console.log('━━━ STEP 4: Consume Payment on Receiver ━━━\n');
  console.log('Calling receiveTokens() on WarpReceiver contract...');
  
  try {
    // Access the receiver contract directly
    const receiverContract = (warp as any).receiver;
    const tx = await receiverContract.receiveTokens(paymentId);
    console.log(`Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}\n`);
  } catch (error: any) {
    if (error.message.includes('Payment already consumed')) {
      console.log('⚠️  Payment was already consumed\n');
    } else {
      console.log(`⚠️  Could not consume: ${error.message}\n`);
    }
  }

  // Step 5: Verify again (should be true now!)
  console.log('━━━ STEP 5: Verify After Consuming ━━━\n');
  verified = await warp.verify(paymentId);
  console.log(`Verified: ${verified}`);
  
  if (verified) {
    console.log('✅ SUCCESS! verify() now returns TRUE!\n');
    
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                   EXPLANATION                            ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('verify() returns TRUE when:');
    console.log('  1. Payment was sent on sender chain ✓');
    console.log('  2. ICM Relayer delivered message to receiver ✓');
    console.log('  3. receiveTokens() was called on receiver ✓');
    console.log('');
    console.log('The SDK checks if the payment is in the');
    console.log('receivedPayments mapping on the receiver contract.');
    console.log('');
  } else {
    console.log('❌ Still not verified\n');
    console.log('This can happen if:');
    console.log('  - Relayer hasn\'t delivered the message yet');
    console.log('  - receiveTokens() call failed');
    console.log('  - Network issue occurred');
  }
}

main().catch(console.error);
