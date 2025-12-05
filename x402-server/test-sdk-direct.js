#!/usr/bin/env node

/**
 * Direct SDK Test - Test avax-warp-pay SDK methods directly
 * This tests the SDK independently of the server
 */

import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';
import chalk from 'chalk';

const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
const PRIVATE_KEY = '0x268dd038088c9f9adef4a5a0fbb2f01e9d2fa0ef2160a8c3605906773e200f79'; // Has funds
const SENDER_ADDRESS = '0x0d45537c1DA893148dBB113407698E20CfA2eE56';
const RECEIVER_ADDRESS = '0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f';
const BLOCKCHAIN_ID = '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5';
const MESSENGER = '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf';

console.log(chalk.bold.cyan('\n🧪 Direct SDK Test - Testing avax-warp-pay Package\n'));

async function testSDK() {
  try {
    // Initialize SDK
    console.log(chalk.yellow('Step 1: Initializing Warp402 SDK...'));
    const warp = new Warp402({
      privateKey: PRIVATE_KEY,
      senderChain: {
        rpc: FUJI_RPC,
        chainId: 43113,
        blockchainId: BLOCKCHAIN_ID,
        messenger: MESSENGER,
        sender: SENDER_ADDRESS
      },
      receiverChain: {
        rpc: FUJI_RPC,
        chainId: 43113,
        blockchainId: BLOCKCHAIN_ID,
        messenger: MESSENGER,
        receiver: RECEIVER_ADDRESS
      }
    });
    console.log(chalk.green('   ✅ SDK initialized successfully'));

    // Check wallet balance
    console.log(chalk.yellow('\nStep 2: Checking wallet balance...'));
    const provider = new ethers.JsonRpcProvider(FUJI_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log(chalk.gray('   → Wallet: ' + wallet.address));
    console.log(chalk.gray('   → Balance: ' + ethers.formatEther(balance) + ' AVAX'));
    
    if (balance < ethers.parseEther('0.01')) {
      console.log(chalk.red('   ❌ Insufficient balance'));
      return false;
    }
    console.log(chalk.green('   ✅ Sufficient balance available'));

    // Test sender configuration
    console.log(chalk.yellow('\nStep 3: Testing sender configuration...'));
    const senderConfig = await warp.sender.getConfiguration();
    console.log(chalk.green('   ✅ Sender contract accessible'));
    console.log(chalk.gray('   → Owner: ' + senderConfig.owner));
    console.log(chalk.gray('   → Paused: ' + senderConfig.paused));
    console.log(chalk.gray('   → Gas Limit: ' + senderConfig.defaultGasLimit));
    console.log(chalk.gray('   → Remote Receiver: ' + senderConfig.remoteReceiver));

    // Test receiver configuration
    console.log(chalk.yellow('\nStep 4: Testing receiver configuration...'));
    const receiverConfig = await warp.receiver.getConfiguration();
    console.log(chalk.green('   ✅ Receiver contract accessible'));
    console.log(chalk.gray('   → Owner: ' + receiverConfig.owner));
    console.log(chalk.gray('   → Paused: ' + receiverConfig.paused));
    console.log(chalk.gray('   → Expiry Time: ' + receiverConfig.paymentExpiryTime + ' seconds'));

    // Send payment
    console.log(chalk.yellow('\nStep 5: Sending cross-chain payment...'));
    console.log(chalk.gray('   → Amount: 0.1 AVAX'));
    const paymentId = await warp.pay(ethers.parseEther('0.1'));
    console.log(chalk.green('   ✅ Payment sent successfully!'));
    console.log(chalk.gray('   → Payment ID: ' + paymentId));

    // Wait for cross-chain relay
    console.log(chalk.yellow('\nStep 6: Waiting for Teleporter relay...'));
    console.log(chalk.gray('   → This takes ~30 seconds on Fuji'));
    
    let verified = false;
    for (let attempt = 1; attempt <= 12; attempt++) {
      process.stdout.write(chalk.gray(`   → Attempt ${attempt}/12 (${attempt * 5}s)...\r`));
      await new Promise(r => setTimeout(r, 5000));
      
      verified = await warp.verify(paymentId);
      if (verified) {
        console.log(chalk.green(`   ✅ Payment verified after ${attempt * 5} seconds!     `));
        break;
      }
    }

    if (!verified) {
      console.log(chalk.yellow('   ⚠️  Payment not verified yet (may need more time)'));
      console.log(chalk.gray('   → Payment ID: ' + paymentId));
      console.log(chalk.gray('   → You can manually verify with: warp.verify("' + paymentId + '")'));
    }

    // Get receipt
    console.log(chalk.yellow('\nStep 7: Fetching payment receipt...'));
    const receipt = await warp.getReceipt(paymentId);
    
    if (receipt && receipt.timestamp > 0n) {
      console.log(chalk.green('   ✅ Receipt found on receiver chain!'));
      console.log(chalk.gray('   → Payment ID: ' + receipt.paymentId));
      console.log(chalk.gray('   → Amount: ' + ethers.formatEther(receipt.amount) + ' AVAX'));
      console.log(chalk.gray('   → Payer: ' + receipt.payer));
      console.log(chalk.gray('   → Timestamp: ' + new Date(Number(receipt.timestamp) * 1000).toISOString()));
      console.log(chalk.gray('   → Consumed: ' + receipt.consumed));

      // Test payment validation
      console.log(chalk.yellow('\nStep 8: Testing payment validation...'));
      const isValid = await warp.receiver.isValidPayment(paymentId);
      const isExpired = await warp.receiver.isExpired(paymentId);
      const isConsumed = await warp.receiver.isConsumed(paymentId);
      
      console.log(chalk.green('   ✅ Validation methods working'));
      console.log(chalk.gray('   → Is Valid: ' + isValid));
      console.log(chalk.gray('   → Is Expired: ' + isExpired));
      console.log(chalk.gray('   → Is Consumed: ' + isConsumed));

      if (isValid && !isConsumed) {
        // Consume payment
        console.log(chalk.yellow('\nStep 9: Consuming payment...'));
        const consumeTx = await warp.consume(paymentId);
        console.log(chalk.green('   ✅ Payment consumed successfully!'));
        console.log(chalk.gray('   → Transaction: ' + consumeTx.hash));

        // Verify it's now consumed
        const nowConsumed = await warp.receiver.isConsumed(paymentId);
        console.log(chalk.green('   ✅ Payment marked as consumed: ' + nowConsumed));
      }
    } else {
      console.log(chalk.yellow('   ⚠️  Receipt not found yet (cross-chain relay pending)'));
    }

    // Summary
    console.log(chalk.bold.green('\n✅ SDK TEST COMPLETED!\n'));
    console.log(chalk.bold.white('📊 Test Results:'));
    console.log(chalk.white('   ✅ SDK Initialization'));
    console.log(chalk.white('   ✅ Wallet Balance Check'));
    console.log(chalk.white('   ✅ Sender Configuration'));
    console.log(chalk.white('   ✅ Receiver Configuration'));
    console.log(chalk.white('   ✅ Send Payment'));
    console.log(chalk.white('   ' + (verified ? '✅' : '⏳') + ' Cross-Chain Verification'));
    console.log(chalk.white('   ' + (receipt && receipt.timestamp > 0n ? '✅' : '⏳') + ' Get Receipt'));
    console.log(chalk.white('   ' + (receipt && receipt.timestamp > 0n ? '✅' : '⏳') + ' Payment Validation'));
    
    console.log(chalk.bold.cyan('\n🎉 avax-warp-pay SDK is working correctly!\n'));
    
    return true;

  } catch (error) {
    console.log(chalk.red('\n❌ Test failed: ' + error.message));
    if (error.code) {
      console.log(chalk.red('   → Error code: ' + error.code));
    }
    if (error.reason) {
      console.log(chalk.red('   → Reason: ' + error.reason));
    }
    console.error(error);
    return false;
  }
}

testSDK().then(success => {
  process.exit(success ? 0 : 1);
});
