#!/usr/bin/env node

/**
 * End-to-End SDK Test
 * Full payment flow test: request → pay → verify → consume
 */

import axios from 'axios';
import { ethers } from 'ethers';
import chalk from 'chalk';

const SERVER_URL = 'http://localhost:3000';
const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027';

console.log(chalk.bold.cyan('\n🧪 End-to-End SDK Test - Full Payment Flow\n'));

async function runE2ETest() {
  let paymentId;
  
  try {
    // Step 1: Request resource and get payment ID
    console.log(chalk.yellow('Step 1: Request protected resource...'));
    try {
      await axios.get(`${SERVER_URL}/resource`);
      console.log(chalk.red('   ❌ Expected 402, got 200'));
      return false;
    } catch (error) {
      if (error.response && error.response.status === 402) {
        const payment = error.response.data.payment;
        paymentId = payment.paymentId;
        console.log(chalk.green('   ✅ Received HTTP 402 Payment Required'));
        console.log(chalk.gray('   → Payment ID: ' + paymentId));
        console.log(chalk.gray('   → Amount: ' + payment.amountFormatted));
        console.log(chalk.gray('   → Sender Contract: ' + payment.senderContract));
      } else {
        throw error;
      }
    }

    // Step 2: Send payment on-chain
    console.log(chalk.yellow('\nStep 2: Sending payment on Fuji testnet...'));
    const provider = new ethers.JsonRpcProvider(FUJI_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(chalk.gray('   → Wallet: ' + wallet.address));
    console.log(chalk.gray('   → Balance: ' + ethers.formatEther(balance) + ' AVAX'));
    
    if (balance < ethers.parseEther('0.01')) {
      console.log(chalk.red('   ❌ Insufficient balance. Need testnet AVAX from https://faucet.avax.network/'));
      return false;
    }

    // Get sender contract from server health
    const health = await axios.get(`${SERVER_URL}/health`);
    const senderAddress = health.data.contracts.sender;
    
    // WarpSender ABI - just the sendPayment function
    const warpSenderABI = [
      'function sendPayment(bytes32 paymentId) external payable'
    ];
    
    const senderContract = new ethers.Contract(senderAddress, warpSenderABI, wallet);
    
    console.log(chalk.gray('   → Calling WarpSender.sendPayment()...'));
    const tx = await senderContract.sendPayment(paymentId, {
      value: ethers.parseEther('1')
    });
    
    console.log(chalk.green('   ✅ Transaction sent: ' + tx.hash));
    console.log(chalk.gray('   → Waiting for confirmation...'));
    
    const receipt = await tx.wait();
    console.log(chalk.green('   ✅ Transaction confirmed in block ' + receipt.blockNumber));

    // Step 3: Wait for Teleporter relay
    console.log(chalk.yellow('\nStep 3: Waiting for Teleporter cross-chain relay...'));
    console.log(chalk.gray('   → This takes ~30 seconds on Fuji testnet'));
    
    for (let i = 30; i > 0; i--) {
      process.stdout.write(chalk.gray(`   → ${i} seconds remaining...\r`));
      await new Promise(r => setTimeout(r, 1000));
    }
    console.log(chalk.green('   ✅ Wait complete                           '));

    // Step 4: Verify payment
    console.log(chalk.yellow('\nStep 4: Verifying payment on receiver chain...'));
    const verify = await axios.get(`${SERVER_URL}/verify/${paymentId}`);
    
    if (verify.data.verified) {
      console.log(chalk.green('   ✅ Payment verified on-chain!'));
      console.log(chalk.gray('   → Receipt found: ' + verify.data.receipt.paymentId));
      console.log(chalk.gray('   → Amount: ' + ethers.formatEther(verify.data.receipt.amount) + ' AVAX'));
      console.log(chalk.gray('   → Payer: ' + verify.data.receipt.payer));
      console.log(chalk.gray('   → Consumed: ' + verify.data.receipt.consumed));
    } else {
      console.log(chalk.red('   ❌ Payment not verified'));
      console.log(chalk.yellow('   → This might mean the cross-chain message is still in transit'));
      console.log(chalk.yellow('   → Try checking again in a few seconds'));
      return false;
    }

    // Step 5: Consume payment and get resource
    console.log(chalk.yellow('\nStep 5: Consuming payment and accessing resource...'));
    const consume = await axios.post(`${SERVER_URL}/consume/${paymentId}`);
    
    if (consume.data.success) {
      console.log(chalk.green('   ✅ Payment consumed successfully!'));
      console.log(chalk.gray('   → Transaction: ' + consume.data.transaction.hash));
      console.log(chalk.green('   ✅ Resource accessed!'));
      console.log(chalk.cyan('\n   📄 Protected Content:'));
      console.log(chalk.white('   ' + consume.data.content.data));
    } else {
      console.log(chalk.red('   ❌ Failed to consume payment'));
      return false;
    }

    // Step 6: Verify payment cannot be reused
    console.log(chalk.yellow('\nStep 6: Verifying payment cannot be reused...'));
    try {
      await axios.post(`${SERVER_URL}/consume/${paymentId}`);
      console.log(chalk.red('   ❌ Payment was reused (this should not happen!)'));
      return false;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(chalk.green('   ✅ Payment already consumed - cannot be reused'));
        console.log(chalk.gray('   → Error: ' + error.response.data.error));
      } else {
        throw error;
      }
    }

    // Summary
    console.log(chalk.bold.green('\n✅ END-TO-END TEST PASSED!\n'));
    console.log(chalk.bold.white('📊 Test Summary:'));
    console.log(chalk.white('   ✅ 1. Request resource → HTTP 402'));
    console.log(chalk.white('   ✅ 2. Send payment → Transaction confirmed'));
    console.log(chalk.white('   ✅ 3. Cross-chain relay → Message delivered'));
    console.log(chalk.white('   ✅ 4. Verify payment → Receipt validated'));
    console.log(chalk.white('   ✅ 5. Consume payment → Resource accessed'));
    console.log(chalk.white('   ✅ 6. Security check → Payment cannot be reused'));
    
    console.log(chalk.bold.cyan('\n🎉 SDK is working perfectly for cross-chain payments!\n'));
    
    return true;

  } catch (error) {
    console.log(chalk.red('\n❌ Test failed: ' + error.message));
    if (error.response) {
      console.log(chalk.red('   → Status: ' + error.response.status));
      console.log(chalk.red('   → Data: ' + JSON.stringify(error.response.data, null, 2)));
    }
    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.yellow('   → Server not running. Start it with: npm run start:sdk'));
    }
    return false;
  }
}

runE2ETest().then(success => {
  process.exit(success ? 0 : 1);
});
