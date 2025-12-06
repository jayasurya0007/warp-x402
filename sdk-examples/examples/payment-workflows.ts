/**
 * Payment Workflows - Real-world usage patterns
 */

import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

// Helper to wait between transactions to avoid nonce conflicts
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

async function main() {
  console.log('Payment Workflow Examples\n');

  // Deploy fresh contracts for this demo
  console.log('[INFO] 📦 Deploying contracts for workflows demo...\n');
  const warp = await Warp402Factory.quickSetup(config);
  console.log('[INFO] ✅ Contracts deployed and ready\n');

  // ============================================================
  // Workflow 1: Simple Payment
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Workflow 1: Simple Payment');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const amount = ethers.parseEther('0.01');
  const paymentId = await warp.pay(amount);
  console.log(`✓ Payment sent: ${paymentId}\n`);

  // ============================================================
  // Workflow 2: Payment with Balance Check
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Workflow 2: Payment with Balance Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const balance = await warp.getSenderBalance();
  const payAmount = ethers.parseEther('0.01');

  if (balance >= payAmount) {
    const pid = await warp.pay(payAmount);
    console.log(`✓ Payment sent: ${pid}`);
  } else {
    console.log('✗ Insufficient balance');
  }
  console.log();

  // ============================================================
  // Workflow 3: Payment with Verification
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Workflow 3: Payment with Verification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const pid3 = await warp.pay(ethers.parseEther('0.01'));
  console.log(`Payment ID: ${pid3}`);
  
  // Wait for relay
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const verified = await warp.verify(pid3);
  console.log(`Verified: ${verified}\n`);

  // ============================================================
  // Workflow 4: Complete Flow with Consumption
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Workflow 4: Complete Flow (Pay → Verify → Consume)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const pid4 = await warp.pay(ethers.parseEther('0.01'));
  console.log(`1. Payment sent: ${pid4}`);
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const verified4 = await warp.verify(pid4);
  console.log(`2. Verified: ${verified4}`);
  
  if (verified4) {
    await warp.consume(pid4);
    console.log('3. Consumed: true');
  }
  console.log();

  // ============================================================
  // Workflow 5: Batch Payments
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Workflow 5: Batch Payments');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const payments = [
    ethers.parseEther('0.01'),
    ethers.parseEther('0.02'),
    ethers.parseEther('0.03')
  ];

  const paymentIds = [];
  for (let i = 0; i < payments.length; i++) {
    const amt = payments[i];
    try {
      const pid = await warp.pay(amt);
      paymentIds.push(pid);
      console.log(`✓ Sent ${ethers.formatEther(amt)} tokens: ${pid.substring(0, 16)}...`);
      
      // Wait 2 seconds between transactions to allow nonce to update
      if (i < payments.length - 1) {
        await delay(2000);
      }
    } catch (error) {
      console.error(`✗ Payment ${i + 1} failed:`, (error as Error).message);
    }
  }
  console.log(`\nTotal successful payments: ${paymentIds.length}\n`);

  console.log('✅ All workflows completed!');
}

main().catch(console.error);
