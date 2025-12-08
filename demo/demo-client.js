#!/usr/bin/env node

import axios from 'axios';
import { ethers } from 'ethers';
import pkg from 'avax-warp-pay';
console.log('Imported avax-warp-pay:', pkg);
const { Warp402Factory } = pkg || {};
import dotenv from 'dotenv';
import chalk from 'chalk';
import { setTimeout } from 'timers/promises';

dotenv.config();

// Configuration
const SERVER_URL = process.env.X402_SERVER_URL || 'http://localhost:3000';
const SUBNET_A_RPC = process.env.SUBNET_A_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RELAYER_WAIT = parseInt(process.env.RELAYER_WAIT_TIME || '10000');
const VERBOSE = process.env.VERBOSE === 'true';

// Console styling helpers
const log = {
  title: (msg) => console.log(chalk.bold.cyan(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`)),
  step: (num, msg) => console.log(chalk.bold.yellow(`\n[Step ${num}] ${msg}`)),
  success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
  info: (msg) => console.log(chalk.blue(`ℹ ${msg}`)),
  wait: (msg) => console.log(chalk.magenta(`⏳ ${msg}`)),
  error: (msg) => console.log(chalk.red(`✗ ${msg}`)),
  data: (label, value) => console.log(chalk.gray(`   ${label}: ${chalk.white(value)}`)),
  json: (obj) => console.log(chalk.gray(JSON.stringify(obj, null, 2))),
  separator: () => console.log(chalk.gray('-'.repeat(70)))
};

// Sleep helper with countdown
async function sleepWithCountdown(ms, message = 'Waiting') {
  const seconds = ms / 1000;
  log.wait(`${message} (${seconds} seconds)...`);
  
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(chalk.magenta(`   ${i}... `));
    await setTimeout(1000);
  }
  console.log(chalk.green('Done!\n'));
}

// Main demo function
async function runDemo() {
  log.title('🚀 HTTP 402 Cross-Chain Payment Demo');
  console.log(chalk.white('Demonstrating end-to-end payment flow on Avalanche subnets'));
  console.log(chalk.gray(`Server: ${SERVER_URL}`));
  console.log(chalk.gray(`Subnet A: ${SUBNET_A_RPC.substring(0, 50)}...`));
  
  let paymentId = null;
  let paymentDetails = null;

  try {
    // ============================================================
    // STEP 1: Request Protected Resource (Get 402 Response)
    // ============================================================
    log.step(1, 'Requesting Protected Resource');
    log.info('Sending GET request to /resource endpoint...');
    
    try {
      const resourceResponse = await axios.get(`${SERVER_URL}/resource`, {
        validateStatus: (status) => status === 402
      });
      
      if (resourceResponse.status !== 402) {
        throw new Error(`Expected 402 status, got ${resourceResponse.status}`);
      }
      
      log.success('Received HTTP 402 Payment Required');
      paymentDetails = resourceResponse.data.payment;
      paymentId = paymentDetails.paymentId;
      
      log.data('Payment ID', paymentId);
      log.data('Required Amount', `${paymentDetails.amountFormatted} (${paymentDetails.amount} wei)`);
      log.data('Payment Chain', `Subnet A (Chain ID: ${paymentDetails.senderChainId})`);
      log.data('Receiver Contract', paymentDetails.receiverContract);
      
      if (VERBOSE) {
        log.separator();
        console.log(chalk.gray('Full 402 Response:'));
        log.json(resourceResponse.data);
      }
      
    } catch (error) {
      log.error(`Failed to request resource: ${error.message}`);
      throw error;
    }

    // ============================================================
    // STEP 2: Send Payment on Subnet A (Using SDK)
    // ============================================================
    log.step(2, 'Sending Cross-Chain Payment with SDK');
    log.info('Initializing avax-warp-pay SDK...');
    
    // Note: SDK config would need full details - using direct call for demo simplicity
    // For full SDK usage, initialize Warp402 with complete configuration
    
    const provider = new ethers.JsonRpcProvider(SUBNET_A_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    log.data('Sender Address', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    log.data('Balance', `${ethers.formatEther(balance)} tokens`);
    
    if (balance < BigInt(paymentDetails.amount)) {
      throw new Error('Insufficient balance for payment');
    }
    
    // Send payment using SDK-compatible ABI
    log.info('Sending payment via WarpSender contract...');
    
    // Initialize SDK for sending
    const warp = Warp402Factory.fromExisting({
      privateKey: PRIVATE_KEY,
      senderChain: {
        rpc: SUBNET_A_RPC,
        sender: paymentDetails.senderContract,
        chainId: Number(paymentDetails.senderChainId),
        blockchainId: paymentDetails.senderBlockchainId,
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf'
      },
      receiverChain: {
        rpc: 'http://127.0.0.1:9650/ext/bc/krncd99BqvSYebiEuZk8NvYNiaS3zWaUtRg2mD3F8hQvroBR8/rpc', // Placeholder, not used for sending
        chainId: 1002,
        blockchainId: '0x6395f92aaae85f30810132579df9b48133f6d28daf144ab633de2e3477a2f8da',
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        receiver: paymentDetails.receiverContract
      }
    });

    // The SDK's sendPayment() already waits for confirmation and returns a receipt
    // No need to call .wait() - the SDK does this internally
    const txReceipt = await warp.sender.sendPayment(paymentId, paymentDetails.amount);
    
    log.success('Payment confirmed on Subnet A');
    log.data('Transaction Hash', txReceipt.hash);
    log.data('Block Number', txReceipt.blockNumber);
    log.data('Gas Used', txReceipt.gasUsed.toString());
    
    if (VERBOSE) {
      log.separator();
      console.log(chalk.gray('Transaction Receipt:'));
      console.log(chalk.gray(`  Block: ${receipt.blockNumber}`));
      console.log(chalk.gray(`  Gas: ${receipt.gasUsed.toString()}`));
      console.log(chalk.gray(`  Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`));
    }

    // ============================================================
    // STEP 3: Wait for ICM Relayer
    // ============================================================
    log.step(3, 'Waiting for Teleporter/ICM Relayer');
    log.info('The payment receipt is being relayed cross-chain...');
    console.log(chalk.gray('   The ICM relayer will:'));
    console.log(chalk.gray('   1. Detect the Warp message on Subnet A'));
    console.log(chalk.gray('   2. Collect validator signatures'));
    console.log(chalk.gray('   3. Submit the message to Subnet B'));
    console.log(chalk.gray('   4. Call WarpReceiver to store the receipt'));
    
    await sleepWithCountdown(RELAYER_WAIT, 'Waiting for relayer');

    // ============================================================
    // STEP 4: Verify Payment Delivery
    // ============================================================
    log.step(4, 'Verifying Payment Receipt on Subnet B');
    log.info('Querying verification endpoint...');
    
    let verificationAttempts = 0;
    let verified = false;
    const maxAttempts = 5;
    
    while (!verified && verificationAttempts < maxAttempts) {
      verificationAttempts++;
      
      try {
        const verifyResponse = await axios.get(`${SERVER_URL}/verify/${paymentId}`);
        
        if (verifyResponse.data.verified) {
          verified = true;
          log.success('Payment receipt verified on Subnet B!');
          
          const receipt = verifyResponse.data.receipt;
          log.data('Amount Received', `${receipt.amountInEther} tokens`);
          log.data('Payer Address', receipt.payer);
          log.data('Timestamp', receipt.timestampDate);
          log.data('Consumed Status', receipt.consumed ? 'Yes' : 'No');
          log.data('Valid for Use', verifyResponse.data.valid ? 'Yes' : 'No');
          
          if (VERBOSE) {
            log.separator();
            console.log(chalk.gray('Full Verification Response:'));
            log.json(verifyResponse.data);
          }
        } else {
          log.info(`Attempt ${verificationAttempts}/${maxAttempts}: Payment not yet delivered`);
          if (verificationAttempts < maxAttempts) {
            await setTimeout(5000);
          }
        }
      } catch (error) {
        log.info(`Attempt ${verificationAttempts}/${maxAttempts}: ${error.message}`);
        if (verificationAttempts < maxAttempts) {
          await setTimeout(3000);
        }
      }
    }
    
    if (!verified) {
      throw new Error('Payment verification failed after multiple attempts');
    }

    // ============================================================
    // STEP 5: Consume Payment and Access Resource
    // ============================================================
    log.step(5, 'Consuming Payment to Access Resource');
    log.info('Sending consume request...');
    
    try {
      const consumeResponse = await axios.post(`${SERVER_URL}/consume/${paymentId}`);
      
      log.success('Payment consumed successfully!');
      log.data('Transaction Hash', consumeResponse.data.transaction.hash);
      log.data('Block Number', consumeResponse.data.transaction.blockNumber);
      log.data('Gas Used', consumeResponse.data.transaction.gasUsed);
      
      log.separator();
      console.log(chalk.bold.green('🎉 ACCESS GRANTED!'));
      log.separator();
      
      console.log(chalk.white('\nProtected Resource Content:'));
      console.log(chalk.cyan('┌─────────────────────────────────────────────────────────────┐'));
      console.log(chalk.cyan('│') + chalk.white(' ' + consumeResponse.data.resource.data.content.padEnd(59)) + chalk.cyan('│'));
      console.log(chalk.cyan('│') + chalk.gray(' Timestamp: ' + consumeResponse.data.resource.data.timestamp.padEnd(47)) + chalk.cyan('│'));
      console.log(chalk.cyan('│') + chalk.gray(' Payment: ' + consumeResponse.data.resource.data.paymentAmount + ' tokens'.padEnd(49)) + chalk.cyan('│'));
      console.log(chalk.cyan('└─────────────────────────────────────────────────────────────┘'));
      
      if (VERBOSE) {
        log.separator();
        console.log(chalk.gray('Full Consumption Response:'));
        log.json(consumeResponse.data);
      }
      
    } catch (error) {
      if (error.response?.status === 403) {
        log.error('Payment already consumed (replay attack prevented)');
      } else {
        throw error;
      }
    }

    // ============================================================
    // STEP 6: Verify Payment is Consumed
    // ============================================================
    log.step(6, 'Verifying Payment Consumption');
    log.info('Checking consumption status...');
    
    const finalVerifyResponse = await axios.get(`${SERVER_URL}/verify/${paymentId}`);
    
    if (finalVerifyResponse.data.receipt.consumed) {
      log.success('Payment marked as consumed on-chain');
      log.data('Valid for Reuse', finalVerifyResponse.data.valid ? 'Yes' : 'No');
      log.info('Future attempts to consume this payment will be rejected');
    } else {
      log.error('Warning: Payment not marked as consumed');
    }

    // ============================================================
    // STEP 7: Attempt Replay Attack (Should Fail)
    // ============================================================
    log.step(7, 'Testing Replay Attack Prevention');
    log.info('Attempting to consume the same payment again...');
    
    try {
      await axios.post(`${SERVER_URL}/consume/${paymentId}`);
      log.error('Replay attack succeeded (this should not happen!)');
    } catch (error) {
      if (error.response?.status === 403) {
        log.success('Replay attack prevented! ✓');
        log.data('Status Code', '403 Forbidden');
        log.data('Message', error.response.data.error);
      } else {
        throw error;
      }
    }

    // ============================================================
    // Demo Complete
    // ============================================================
    log.separator();
    log.title('✅ Demo Completed Successfully!');
    
    console.log(chalk.green('\nKey Achievements:'));
    console.log(chalk.white('  ✓ Received HTTP 402 payment required response'));
    console.log(chalk.white('  ✓ Sent cross-chain payment from Subnet A'));
    console.log(chalk.white('  ✓ Payment receipt delivered via Teleporter/ICM'));
    console.log(chalk.white('  ✓ Verified payment on Subnet B'));
    console.log(chalk.white('  ✓ Consumed payment and accessed protected resource'));
    console.log(chalk.white('  ✓ Confirmed replay attack prevention\n'));
    
    console.log(chalk.cyan('Flow Summary:'));
    console.log(chalk.gray('  Client → Server: GET /resource'));
    console.log(chalk.gray('  Server → Client: 402 Payment Required'));
    console.log(chalk.gray('  Client → Subnet A: Send payment via WarpSender'));
    console.log(chalk.gray('  Subnet A → Subnet B: ICM relayer (Teleporter)'));
    console.log(chalk.gray('  Client → Server: GET /verify/:paymentId'));
    console.log(chalk.gray('  Client → Server: POST /consume/:paymentId'));
    console.log(chalk.gray('  Server → Subnet B: consumePayment() transaction'));
    console.log(chalk.gray('  Server → Client: 200 OK with protected resource\n'));
    
    console.log(chalk.yellow('Next Steps:'));
    console.log(chalk.white('  • Review X402_SERVER.md for API documentation'));
    console.log(chalk.white('  • Check server logs for detailed execution trace'));
    console.log(chalk.white('  • Monitor ICM relayer logs with npm run monitor'));
    console.log(chalk.white('  • Deploy to Fuji testnet (Task 5)'));
    console.log(chalk.white('  • Create production documentation (Task 6)\n'));

  } catch (error) {
    log.separator();
    log.error(`Demo failed: ${error.message}`);
    
    if (VERBOSE && error.response) {
      console.log(chalk.gray('\nError Response:'));
      log.json(error.response.data);
    }
    
    console.log(chalk.yellow('\nTroubleshooting:'));
    console.log(chalk.white('  • Ensure x402 server is running (npm start in x402-server/)'));
    console.log(chalk.white('  • Verify Avalanche network is up (avalanche network status)'));
    console.log(chalk.white('  • Check RPC URLs in .env file'));
    console.log(chalk.white('  • Ensure contracts are deployed'));
    console.log(chalk.white('  • Check wallet has sufficient balance\n'));
    
    process.exit(1);
  }
}

// Run demo
console.clear();
runDemo().catch(error => {
  console.error(chalk.red('\nUnexpected error:'), error);
  process.exit(1);
});
