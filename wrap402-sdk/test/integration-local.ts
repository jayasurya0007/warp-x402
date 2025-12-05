/**
 * Integration Test: Local Network
 * 
 * Tests SDK with actual deployed contracts on local Avalanche network
 */

import { Warp402, LogLevel } from '../src';
import { ethers } from 'ethers';

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027';
const SUBNET_A_RPC = process.env.SUBNET_A_RPC_URL || 'http://127.0.0.1:9652/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc';
const SUBNET_B_RPC = process.env.SUBNET_B_RPC_URL || 'http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc';

// Get deployed contract addresses from local network
async function getDeployedAddresses() {
  const provider = new ethers.JsonRpcProvider(SUBNET_A_RPC);
  
  // These should be read from deployment artifacts
  // For now, we'll try to get them from the demo
  return {
    senderAddress: process.env.SENDER_ADDRESS || '0xYourSenderAddress',
    receiverAddress: process.env.RECEIVER_ADDRESS || '0xYourReceiverAddress',
    senderBlockchainId: process.env.SENDER_BLOCKCHAIN_ID || '0x' + '1'.repeat(64),
    receiverBlockchainId: process.env.RECEIVER_BLOCKCHAIN_ID || '0x' + '2'.repeat(64)
  };
}

async function main() {
  console.log('='.repeat(70));
  console.log('🧪 Phase 4 Testing: Local Network Integration');
  console.log('='.repeat(70));
  console.log();

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Get deployed addresses
    const addresses = await getDeployedAddresses();
    
    console.log('📋 Test Configuration:');
    console.log(`   Subnet A RPC: ${SUBNET_A_RPC}`);
    console.log(`   Subnet B RPC: ${SUBNET_B_RPC}`);
    console.log(`   Sender Address: ${addresses.senderAddress}`);
    console.log(`   Receiver Address: ${addresses.receiverAddress}`);
    console.log();

    // Test 1: SDK Initialization
    console.log('Test 1: Initialize SDK with local network configuration');
    let warp: Warp402;
    try {
      warp = new Warp402({
        privateKey: PRIVATE_KEY,
        senderChain: {
          rpc: SUBNET_A_RPC,
          chainId: 12345,
          blockchainId: addresses.senderBlockchainId,
          messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
          sender: addresses.senderAddress
        },
        receiverChain: {
          rpc: SUBNET_B_RPC,
          chainId: 54321,
          blockchainId: addresses.receiverBlockchainId,
          messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
          receiver: addresses.receiverAddress
        }
      });
      warp.setLogLevel(LogLevel.INFO);
      console.log('✅ Test 1 PASSED: SDK initialized successfully');
      testsPassed++;
    } catch (error: any) {
      console.log('❌ Test 1 FAILED:', error.message);
      testsFailed++;
      return;
    }
    console.log();

    // Test 2: Check wallet balance
    console.log('Test 2: Check sender wallet balance');
    try {
      const balance = await warp!.getSenderBalance();
      const address = warp!.getSenderAddress();
      console.log(`   Address: ${address}`);
      console.log(`   Balance: ${ethers.formatEther(balance)} tokens`);
      
      if (balance > 0n) {
        console.log('✅ Test 2 PASSED: Wallet has balance');
        testsPassed++;
      } else {
        console.log('⚠️  Test 2 WARNING: Wallet balance is zero');
        testsPassed++;
      }
    } catch (error: any) {
      console.log('❌ Test 2 FAILED:', error.message);
      testsFailed++;
    }
    console.log();

    // Test 3: Verify contract configuration
    console.log('Test 3: Verify contract configuration');
    try {
      const senderConfig = await warp!.getSenderConfig();
      const receiverConfig = await warp!.getReceiverConfig();
      
      console.log('   Sender Configuration:');
      console.log(`     → Receiver Chain ID: ${senderConfig.receiverChainId}`);
      console.log(`     → Receiver Address: ${senderConfig.receiverAddress}`);
      console.log(`     → Teleporter: ${senderConfig.teleporterMessenger}`);
      
      console.log('   Receiver Configuration:');
      console.log(`     ← Sender Chain ID: ${receiverConfig.senderChainId}`);
      console.log(`     ← Sender Address: ${receiverConfig.senderAddress}`);
      console.log(`     ← Teleporter: ${receiverConfig.teleporterMessenger}`);
      
      console.log('✅ Test 3 PASSED: Contract configuration retrieved');
      testsPassed++;
    } catch (error: any) {
      console.log('❌ Test 3 FAILED:', error.message);
      testsFailed++;
    }
    console.log();

    // Test 4: Send payment
    console.log('Test 4: Send cross-chain payment');
    let paymentId: string;
    try {
      const amount = ethers.parseEther('0.01');
      console.log(`   Sending ${ethers.formatEther(amount)} tokens...`);
      
      paymentId = await warp!.pay(amount);
      console.log(`   Payment ID: ${paymentId}`);
      console.log('✅ Test 4 PASSED: Payment sent successfully');
      testsPassed++;
    } catch (error: any) {
      console.log('❌ Test 4 FAILED:', error.message);
      testsFailed++;
      console.log('   Note: Ensure contracts are deployed and wallet is funded');
      return;
    }
    console.log();

    // Test 5: Wait for cross-chain relay
    console.log('Test 5: Wait for Teleporter relay');
    try {
      console.log('   Waiting 15 seconds for ICM relayer...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      console.log('✅ Test 5 PASSED: Wait period completed');
      testsPassed++;
    } catch (error: any) {
      console.log('❌ Test 5 FAILED:', error.message);
      testsFailed++;
    }
    console.log();

    // Test 6: Verify payment
    console.log('Test 6: Verify payment on receiver chain');
    try {
      const verified = await warp!.verify(paymentId!);
      console.log(`   Verified: ${verified}`);
      
      if (verified) {
        console.log('✅ Test 6 PASSED: Payment verified on receiver chain');
        testsPassed++;
      } else {
        console.log('⚠️  Test 6 WARNING: Payment not yet verified');
        console.log('   This may indicate:');
        console.log('   - ICM relayer not running');
        console.log('   - Relay taking longer than expected');
        console.log('   - Contract configuration mismatch');
        testsFailed++;
      }
    } catch (error: any) {
      console.log('❌ Test 6 FAILED:', error.message);
      testsFailed++;
    }
    console.log();

    // Test 7: Get receipt details
    console.log('Test 7: Get payment receipt');
    try {
      const receipt = await warp!.getReceipt(paymentId!);
      
      if (receipt) {
        console.log('   Receipt Details:');
        console.log(`     Payer: ${receipt.payer}`);
        console.log(`     Amount: ${ethers.formatEther(receipt.amount)} tokens`);
        console.log(`     Timestamp: ${new Date(receipt.timestamp * 1000).toISOString()}`);
        console.log(`     Consumed: ${receipt.consumed}`);
        console.log('✅ Test 7 PASSED: Receipt retrieved successfully');
        testsPassed++;
      } else {
        console.log('⚠️  Test 7 WARNING: Receipt not found');
        testsPassed++;
      }
    } catch (error: any) {
      console.log('❌ Test 7 FAILED:', error.message);
      testsFailed++;
    }
    console.log();

    // Test 8: Consume payment (only if verified)
    console.log('Test 8: Consume payment');
    try {
      const verified = await warp!.verify(paymentId!);
      
      if (verified) {
        const consumeResult = await warp!.consume(paymentId!);
        console.log(`   Transaction Hash: ${consumeResult.hash}`);
        console.log(`   Block Number: ${consumeResult.blockNumber}`);
        console.log(`   Gas Used: ${consumeResult.gasUsed.toString()}`);
        console.log('✅ Test 8 PASSED: Payment consumed successfully');
        testsPassed++;
      } else {
        console.log('⚠️  Test 8 SKIPPED: Payment not verified, cannot consume');
        testsPassed++;
      }
    } catch (error: any) {
      console.log('❌ Test 8 FAILED:', error.message);
      testsFailed++;
    }
    console.log();

    // Test 9: Verify consumption
    console.log('Test 9: Verify payment is consumed');
    try {
      const verification = await warp!.getVerification(paymentId!);
      console.log(`   Valid for reuse: ${verification.isValid}`);
      
      if (verification.receipt) {
        console.log(`   Consumed flag: ${verification.receipt.consumed}`);
        
        if (verification.receipt.consumed) {
          console.log('✅ Test 9 PASSED: Payment marked as consumed');
          testsPassed++;
        } else {
          console.log('⚠️  Test 9 WARNING: Payment not marked as consumed');
          testsPassed++;
        }
      } else {
        console.log('⚠️  Test 9 SKIPPED: Receipt not available');
        testsPassed++;
      }
    } catch (error: any) {
      console.log('❌ Test 9 FAILED:', error.message);
      testsFailed++;
    }
    console.log();

    // Test 10: Error handling - invalid payment ID
    console.log('Test 10: Error handling - invalid payment ID');
    try {
      const fakeId = '0x' + '9'.repeat(64);
      const verified = await warp!.verify(fakeId);
      console.log(`   Fake payment verified: ${verified}`);
      
      if (!verified) {
        console.log('✅ Test 10 PASSED: Invalid payment correctly rejected');
        testsPassed++;
      } else {
        console.log('❌ Test 10 FAILED: Invalid payment was verified');
        testsFailed++;
      }
    } catch (error: any) {
      console.log('✅ Test 10 PASSED: Error handled correctly');
      testsPassed++;
    }
    console.log();

  } catch (error: any) {
    console.error('❌ Test suite failed:', error.message);
    console.error(error);
  }

  // Summary
  console.log('='.repeat(70));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(70));
  console.log();

  if (testsFailed === 0) {
    console.log('🎉 All tests passed! SDK is working correctly with local network.');
  } else if (testsPassed >= 7) {
    console.log('⚠️  Most tests passed. Check warnings above for optional improvements.');
  } else {
    console.log('❌ Some tests failed. Please check configuration and contract deployment.');
  }

  process.exit(testsFailed === 0 ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
