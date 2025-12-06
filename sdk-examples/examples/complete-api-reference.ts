/**
 * Complete SDK API Reference - All Methods Demonstrated
 * 
 * This example shows every available method in the Warp402 SDK
 */

import { Warp402Factory, Warp402, LogLevel } from 'avax-warp-pay';
import { ethers } from 'ethers';

// Configuration
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
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Warp-402 SDK - Complete API Reference Demo          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ============================================================
  // 1. FACTORY METHODS - Creating SDK Instances
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. FACTORY METHODS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Method 1: quickSetup() - Deploy contracts and return SDK instance
  console.log('📦 Warp402Factory.quickSetup()');
  console.log('   Purpose: Deploy contracts + Initialize SDK');
  const warp = await Warp402Factory.quickSetup(config);
  console.log('   ✓ Contracts deployed and SDK ready\n');

  // Method 2: deployOnly() - Just deploy contracts, get addresses
  console.log('📦 Warp402Factory.deployOnly()');
  console.log('   Purpose: Deploy contracts, return addresses only');
  const deployment = await Warp402Factory.deployOnly(config);
  console.log(`   ✓ Sender: ${deployment.senderAddress}`);
  console.log(`   ✓ Receiver: ${deployment.receiverAddress}`);
  console.log(`   ✓ Sender TX: ${deployment.senderTxHash}`);
  console.log(`   ✓ Receiver TX: ${deployment.receiverTxHash}\n`);

  // Method 3: fromExisting() - Connect to already deployed contracts
  console.log('📦 Warp402Factory.fromExisting()');
  console.log('   Purpose: Connect to existing deployed contracts');
  const warp2 = Warp402Factory.fromExisting({
    ...config,
    senderChain: { ...config.senderChain, sender: deployment.senderAddress },
    receiverChain: { ...config.receiverChain, receiver: deployment.receiverAddress }
  });
  console.log('   ✓ Connected to existing contracts\n');

  // ============================================================
  // 2. CONFIGURATION METHODS
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2. CONFIGURATION METHODS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Set log level
  console.log('🔧 warp.setLogLevel()');
  console.log('   Purpose: Control logging verbosity');
  console.log('   Available: LogLevel.DEBUG, INFO, WARN, ERROR');
  warp.setLogLevel(LogLevel.INFO);
  console.log('   ✓ Log level set to INFO\n');

  // ============================================================
  // 3. WALLET METHODS
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3. WALLET METHODS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get sender address
  console.log('👤 warp.getSenderAddress()');
  console.log('   Purpose: Get wallet address used for sending');
  const senderAddress = warp.getSenderAddress();
  console.log(`   ✓ Address: ${senderAddress}\n`);

  // Get sender balance
  console.log('💰 warp.getSenderBalance()');
  console.log('   Purpose: Check wallet balance on sender chain');
  const balance = await warp.getSenderBalance();
  console.log(`   ✓ Balance: ${ethers.formatEther(balance)} tokens\n`);

  // ============================================================
  // 4. PAYMENT METHODS - Core Functionality
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4. PAYMENT METHODS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Send payment
  console.log('💸 warp.pay()');
  console.log('   Purpose: Send cross-chain payment');
  const amount = ethers.parseEther('0.001');
  console.log(`   Sending: ${ethers.formatEther(amount)} tokens`);
  const paymentId = await warp.pay(amount);
  console.log(`   ✓ Payment ID: ${paymentId}\n`);

  // Wait for relay
  console.log('⏳ Waiting 5 seconds for cross-chain relay...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Verify payment
  console.log('🔍 warp.verify()');
  console.log('   Purpose: Check if payment was received on receiver chain');
  console.log(`   Checking: ${paymentId}`);
  const isVerified = await warp.verify(paymentId);
  console.log(`   ✓ Verified: ${isVerified}\n`);

  // Consume payment
  if (isVerified) {
    console.log('✅ warp.consume()');
    console.log('   Purpose: Mark payment as consumed (prevent reuse)');
    await warp.consume(paymentId);
    console.log('   ✓ Payment consumed\n');
  }

  // ============================================================
  // 5. UTILITY FUNCTIONS
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('5. UTILITY FUNCTIONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { 
    generatePaymentId, 
    isValidPaymentId, 
    formatPaymentId
  } = await import('avax-warp-pay');

  // Generate payment ID
  console.log('🔑 generatePaymentId()');
  console.log('   Purpose: Generate unique 32-byte payment ID');
  const testId = generatePaymentId();
  console.log(`   ✓ Generated: ${testId}\n`);

  // Validate payment ID
  console.log('✓ isValidPaymentId()');
  console.log('   Purpose: Validate payment ID format');
  const valid = isValidPaymentId(testId);
  console.log(`   ✓ Valid: ${valid}\n`);

  // Format payment ID
  console.log('📝 formatPaymentId()');
  console.log('   Purpose: Format payment ID for display');
  const formatted = formatPaymentId(testId);
  console.log(`   ✓ Formatted: ${formatted}\n`);

  // Format amount (using ethers)
  console.log('💵 Amount Formatting');
  console.log('   Purpose: Format amounts for display');
  const amountWei = ethers.parseEther('1.5');
  const amountFormatted = ethers.formatEther(amountWei);
  console.log(`   ✓ 1.5 ETH = ${amountWei.toString()} Wei`);
  console.log(`   ✓ ${amountWei.toString()} Wei = ${amountFormatted} ETH\n`);

  // ============================================================
  // 6. ADVANCED USAGE - Contract Access
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('6. ADVANCED - Direct Contract Access');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('⚙️  Direct contract access (advanced users)');
  console.log('   SDK provides access to underlying contracts:');
  console.log('   • warp.sender - WarpSender contract instance');
  console.log('   • warp.receiver - WarpReceiver contract instance');
  console.log('   Note: Private properties, for advanced use only\n');

  // ============================================================
  // 7. EXAMPLE WORKFLOW
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('7. COMPLETE PAYMENT WORKFLOW');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Example: Complete payment flow');
  console.log('1. Check balance → 2. Send payment → 3. Verify → 4. Consume\n');

  const workflowBalance = await warp.getSenderBalance();
  console.log(`   Balance: ${ethers.formatEther(workflowBalance)} tokens`);
  
  const workflowAmount = ethers.parseEther('0.001');
  const workflowPaymentId = await warp.pay(workflowAmount);
  console.log(`   Sent: ${ethers.formatEther(workflowAmount)} tokens`);
  console.log(`   Payment ID: ${workflowPaymentId}`);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  const workflowVerified = await warp.verify(workflowPaymentId);
  console.log(`   Verified: ${workflowVerified}`);
  
  if (workflowVerified) {
    await warp.consume(workflowPaymentId);
    console.log('   Consumed: true\n');
  } else {
    console.log('   Note: Start ICM Relayer for cross-chain verification\n');
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                 API REFERENCE COMPLETE                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log('📚 Methods Demonstrated:');
  console.log('   Factory: quickSetup(), deployOnly(), fromExisting()');
  console.log('   Config:  setLogLevel()');
  console.log('   Wallet:  getSenderAddress(), getSenderBalance()');
  console.log('   Payment: pay(), verify(), consume()');
  console.log('   Utils:   generatePaymentId(), isValidPaymentId(), etc.\n');

  console.log('✅ All SDK methods have been demonstrated!');
}

main().catch(console.error);
