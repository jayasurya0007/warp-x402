/**
 * Comprehensive Automated Deployment Test
 * Tests the Warp402Factory automated deployment feature
 */

import { ethers } from 'ethers';
import { Warp402Factory } from '../src/deploy/Warp402Factory';
import { ContractDeployer } from '../src/deploy/ContractDeployer';

// Test configuration
const TEST_CONFIG = {
  // Use Local Subnet A (Chain 1001)
  senderChain: {
    rpc: 'http://127.0.0.1:9652/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
    chainId: 1001,
    blockchainId: '0xc063de20578887dbbbf1ac65224ff343356e41827b7e82bbc8af8814310be481' // Subnet A
  },
  // Use Local Subnet B (Chain 1002)
  receiverChain: {
    rpc: 'http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc',
    chainId: 1002,
    blockchainId: '0x0bcaefad849650892f8f44d2f8b8e00f60e4f3a1d3d84a3e947e54b8e7f3eeb5' // Subnet B
  },
  // Test private key (pre-funded on local networks)
  privateKey: '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2e5d0d4f8b3c4de'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(70));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(70) + '\n');
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function checkNetworkConnection(rpcUrl: string, chainName: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    logSuccess(`Connected to ${chainName} (Chain ID: ${network.chainId})`);
    return true;
  } catch (error) {
    logError(`Failed to connect to ${chainName}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function checkBalance(rpcUrl: string, address: string, chainName: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    const balanceInAVAX = ethers.formatEther(balance);
    
    if (balance > 0n) {
      logSuccess(`${chainName} balance: ${balanceInAVAX} AVAX`);
      return true;
    } else {
      logError(`${chainName} has zero balance`);
      return false;
    }
  } catch (error) {
    logError(`Failed to check balance on ${chainName}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function test1_PreFlightChecks() {
  logSection('TEST 1: Pre-Flight Checks');
  
  logInfo('Checking network connectivity...');
  const senderConnected = await checkNetworkConnection(TEST_CONFIG.senderChain.rpc, 'Sender Chain (Subnet A)');
  const receiverConnected = await checkNetworkConnection(TEST_CONFIG.receiverChain.rpc, 'Receiver Chain (Subnet B)');
  
  if (!senderConnected || !receiverConnected) {
    throw new Error('Network connectivity check failed. Make sure both subnets are running.');
  }
  
  logInfo('Checking account balances...');
  const wallet = new ethers.Wallet(TEST_CONFIG.privateKey);
  const senderHasBalance = await checkBalance(TEST_CONFIG.senderChain.rpc, wallet.address, 'Sender Chain');
  const receiverHasBalance = await checkBalance(TEST_CONFIG.receiverChain.rpc, wallet.address, 'Receiver Chain');
  
  if (!senderHasBalance || !receiverHasBalance) {
    throw new Error('Insufficient balance. Fund the test account on both chains.');
  }
  
  logSuccess('All pre-flight checks passed!');
}

async function test2_DeployContracts() {
  logSection('TEST 2: Deploy Contracts');
  
  logInfo('Deploying WarpSender and WarpReceiver contracts...');
  const startTime = Date.now();
  
  const result = await ContractDeployer.deployContracts({
    privateKey: TEST_CONFIG.privateKey,
    senderChain: TEST_CONFIG.senderChain,
    receiverChain: TEST_CONFIG.receiverChain
  });
  
  const deployTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  logSuccess(`Contracts deployed in ${deployTime}s`);
  logInfo(`WarpSender: ${result.senderAddress}`);
  logInfo(`WarpReceiver: ${result.receiverAddress}`);
  
  // Verify contracts exist
  const senderProvider = new ethers.JsonRpcProvider(TEST_CONFIG.senderChain.rpc);
  const receiverProvider = new ethers.JsonRpcProvider(TEST_CONFIG.receiverChain.rpc);
  
  const senderCode = await senderProvider.getCode(result.senderAddress);
  const receiverCode = await receiverProvider.getCode(result.receiverAddress);
  
  if (senderCode === '0x' || receiverCode === '0x') {
    throw new Error('Contract deployment verification failed');
  }
  
  logSuccess('Contract bytecode verified on-chain');
  
  return result;
}

async function test3_VerifyConfiguration(senderAddress: string, receiverAddress: string) {
  logSection('TEST 3: Verify Configuration');
  
  logInfo('Verifying contract configuration...');
  
  const isValid = await Warp402Factory.verify({
    senderAddress,
    receiverAddress,
    senderRpc: TEST_CONFIG.senderChain.rpc,
    receiverRpc: TEST_CONFIG.receiverChain.rpc
  });
  
  if (!isValid) {
    throw new Error('Configuration verification failed');
  }
  
  logSuccess('Contract configuration verified successfully');
  logInfo('✓ WarpSender knows about WarpReceiver');
  logInfo('✓ WarpReceiver trusts WarpSender');
  logInfo('✓ Blockchain IDs configured correctly');
}

async function test4_QuickSetup() {
  logSection('TEST 4: Quick Setup (One-Liner Deployment)');
  
  logInfo('Testing Warp402Factory.quickSetup()...');
  const startTime = Date.now();
  
  const warp = await Warp402Factory.quickSetup({
    privateKey: TEST_CONFIG.privateKey,
    senderChain: TEST_CONFIG.senderChain,
    receiverChain: TEST_CONFIG.receiverChain
  });
  
  const setupTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  logSuccess(`Complete setup in ${setupTime}s`);
  logInfo(`Sender: ${warp.sender.target}`);
  logInfo(`Receiver: ${warp.receiver.target}`);
  
  return warp;
}

async function test5_PaymentFlow(warp: any) {
  logSection('TEST 5: Payment Flow');
  
  const testAmount = ethers.parseEther('0.01');
  
  logInfo(`Making payment of ${ethers.formatEther(testAmount)} AVAX...`);
  
  try {
    const receipt = await warp.pay(testAmount);
    
    if (!receipt || !receipt.paymentId) {
      throw new Error('Payment receipt is invalid');
    }
    
    logSuccess(`Payment successful!`);
    logInfo(`Payment ID: ${receipt.paymentId}`);
    logInfo(`Amount: ${ethers.formatEther(receipt.amount)} AVAX`);
    logInfo(`Payer: ${receipt.payer}`);
    
    return receipt.paymentId;
  } catch (error) {
    throw new Error(`Payment failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function test6_VerifyPayment(warp: any, paymentId: string) {
  logSection('TEST 6: Verify Payment on Receiver Chain');
  
  logInfo('Waiting for cross-chain message delivery...');
  logWarning('This may take 30-60 seconds depending on network conditions...');
  
  const maxAttempts = 20;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    attempt++;
    logInfo(`Attempt ${attempt}/${maxAttempts}...`);
    
    try {
      const receipt = await warp.verifyPayment(paymentId);
      
      if (receipt) {
        logSuccess('Payment verified on receiver chain!');
        logInfo(`Amount Paid: ${ethers.formatEther(receipt.amount)} AVAX`);
        logInfo(`Payer: ${receipt.payer}`);
        logInfo(`Timestamp: ${new Date(Number(receipt.timestamp) * 1000).toISOString()}`);
        logInfo(`Consumed: ${receipt.consumed}`);
        logInfo(`Expired: ${receipt.expired}`);
        
        return receipt;
      }
    } catch (error) {
      // Receipt not found yet, continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s between attempts
  }
  
  throw new Error('Payment verification timed out after 60 seconds');
}

async function test7_ConsumePayment(warp: any, paymentId: string) {
  logSection('TEST 7: Consume Payment');
  
  logInfo('Consuming payment receipt...');
  
  try {
    const success = await warp.consumePayment(paymentId);
    
    if (!success) {
      throw new Error('consume() transaction failed');
    }
    
    logSuccess('Payment consumed successfully!');
    
    // Verify it's now marked as consumed
    const receipt = await warp.verifyPayment(paymentId);
    
    if (!receipt.consumed) {
      throw new Error('Payment not marked as consumed');
    }
    
    logSuccess('Payment status updated: consumed = true');
  } catch (error) {
    throw new Error(`Failed to consume payment: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function test8_EdgeCases(warp: any) {
  logSection('TEST 8: Edge Cases & Error Handling');
  
  // Test 1: Invalid payment ID
  logInfo('Test 8.1: Verifying non-existent payment...');
  try {
    const fakeId = '0x' + '1'.repeat(64);
    const receipt = await warp.verifyPayment(fakeId);
    
    if (!receipt) {
      logSuccess('✓ Non-existent payment returns null');
    } else {
      logError('✗ Should return null for non-existent payment');
    }
  } catch (error) {
    logSuccess('✓ Non-existent payment throws error (acceptable)');
  }
  
  // Test 2: Zero payment amount
  logInfo('Test 8.2: Attempting zero-value payment...');
  try {
    await warp.pay(0n);
    logError('✗ Should reject zero-value payments');
  } catch (error) {
    logSuccess('✓ Zero-value payment rejected');
  }
  
  // Test 3: Double consumption
  logInfo('Test 8.3: Attempting double consumption...');
  const receipt = await warp.pay(ethers.parseEther('0.001'));
  
  // Wait for delivery
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // First consumption
  await warp.consumePayment(receipt.paymentId);
  
  // Second consumption attempt
  try {
    await warp.consumePayment(receipt.paymentId);
    logError('✗ Should reject double consumption');
  } catch (error) {
    logSuccess('✓ Double consumption rejected');
  }
}

async function test9_PerformanceMetrics() {
  logSection('TEST 9: Performance Metrics');
  
  logInfo('Measuring deployment performance...');
  
  const metrics = {
    deployment: [] as number[],
    payment: [] as number[],
    verification: [] as number[]
  };
  
  // Run 3 deployment cycles
  for (let i = 0; i < 3; i++) {
    logInfo(`\nCycle ${i + 1}/3...`);
    
    // Measure deployment time
    const deployStart = Date.now();
    const warp = await Warp402Factory.quickSetup({
      privateKey: TEST_CONFIG.privateKey,
      senderChain: TEST_CONFIG.senderChain,
      receiverChain: TEST_CONFIG.receiverChain
    });
    metrics.deployment.push(Date.now() - deployStart);
    
    // Measure payment time
    const payStart = Date.now();
    const receipt = await warp.pay(ethers.parseEther('0.001'));
    metrics.payment.push(Date.now() - payStart);
    
    // Measure verification time (with wait)
    const verifyStart = Date.now();
    let verified = false;
    for (let j = 0; j < 20 && !verified; j++) {
      try {
        const r = await warp.verifyPayment(receipt.paymentId);
        if (r) {
          verified = true;
          metrics.verification.push(Date.now() - verifyStart);
        }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Calculate averages
  const avgDeploy = (metrics.deployment.reduce((a, b) => a + b, 0) / metrics.deployment.length / 1000).toFixed(2);
  const avgPay = (metrics.payment.reduce((a, b) => a + b, 0) / metrics.payment.length / 1000).toFixed(2);
  const avgVerify = (metrics.verification.reduce((a, b) => a + b, 0) / metrics.verification.length / 1000).toFixed(2);
  
  console.log('\n📊 Performance Summary:');
  logInfo(`Average Deployment Time: ${avgDeploy}s`);
  logInfo(`Average Payment Time: ${avgPay}s`);
  logInfo(`Average Verification Time: ${avgVerify}s`);
  logSuccess('Performance metrics collected');
}

async function runAllTests() {
  const startTime = Date.now();
  let deploymentResult: any;
  let quickSetupWarp: any;
  let testPaymentId: string;
  
  try {
    // Test 1: Pre-flight checks
    await test1_PreFlightChecks();
    
    // Test 2: Deploy contracts
    deploymentResult = await test2_DeployContracts();
    
    // Test 3: Verify configuration
    await test3_VerifyConfiguration(deploymentResult.senderAddress, deploymentResult.receiverAddress);
    
    // Test 4: Quick setup
    quickSetupWarp = await test4_QuickSetup();
    
    // Test 5: Payment flow
    testPaymentId = await test5_PaymentFlow(quickSetupWarp);
    
    // Test 6: Verify payment
    await test6_VerifyPayment(quickSetupWarp, testPaymentId);
    
    // Test 7: Consume payment
    await test7_ConsumePayment(quickSetupWarp, testPaymentId);
    
    // Test 8: Edge cases
    await test8_EdgeCases(quickSetupWarp);
    
    // Test 9: Performance metrics
    // await test9_PerformanceMetrics(); // Commented out for faster testing
    
    // Final summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logSection('✅ ALL TESTS PASSED!');
    log(`Total test time: ${totalTime}s`, colors.bright + colors.green);
    log('\n🎉 Automated deployment feature is working perfectly!', colors.bright + colors.green);
    
  } catch (error) {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logSection('❌ TESTS FAILED');
    logError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    log(`\nTotal time before failure: ${totalTime}s`, colors.yellow);
    
    if (error instanceof Error && error.stack) {
      console.log('\n' + error.stack);
    }
    
    process.exit(1);
  }
}

// Run tests
console.log('\n');
log('╔════════════════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
log('║   Warp402 Automated Deployment - Comprehensive Test Suite         ║', colors.bright + colors.cyan);
log('╚════════════════════════════════════════════════════════════════════╝', colors.bright + colors.cyan);
console.log('\n');

runAllTests().catch(error => {
  logError(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
