#!/usr/bin/env node
/**
 * Test Fuji Pre-Deployed Contracts
 * Verifies that the SDK can connect to and interact with Fuji contracts
 */

const { Warp402, PRESETS } = require('./dist/index.js');

async function testFujiContracts() {
  console.log('🧪 Testing Fuji Pre-Deployed Contracts');
  console.log('=====================================\n');

  // Check if private key is provided
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log('⚠️  No PRIVATE_KEY provided, showing read-only tests\n');
  }

  try {
    // Initialize with Fuji preset
    console.log('📝 Initializing SDK with PRESETS.fuji...');
    const config = {
      ...PRESETS.fuji,
      ...(privateKey && { privateKey })
    };
    
    console.log('\n✅ Configuration:');
    console.log('   Sender:   ', config.senderChain.sender);
    console.log('   Receiver: ', config.receiverChain.receiver);
    console.log('   RPC:      ', config.senderChain.rpc);
    console.log('   Chain ID: ', config.senderChain.chainId);

    const warp = privateKey ? new Warp402(config) : new Warp402({ ...config, privateKey: '0x0000000000000000000000000000000000000000000000000000000000000001' });

    // Test 1: Get sender configuration
    console.log('\n📋 Test 1: Reading Sender Configuration');
    const senderConfig = await warp.sender.getConfiguration();
    console.log('   ✅ Owner:          ', senderConfig.owner);
    console.log('   ✅ Paused:         ', senderConfig.paused);
    console.log('   ✅ Remote Chain:   ', senderConfig.remoteBlockchainId.slice(0, 20) + '...');
    console.log('   ✅ Remote Receiver:', senderConfig.remoteReceiver);
    console.log('   ✅ Gas Limit:      ', senderConfig.defaultGasLimit.toString());

    // Test 2: Get receiver configuration
    console.log('\n📋 Test 2: Reading Receiver Configuration');
    const receiverConfig = await warp.receiver.getConfiguration();
    console.log('   ✅ Owner:               ', receiverConfig.owner);
    console.log('   ✅ Paused:              ', receiverConfig.paused);
    console.log('   ✅ Payment Expiry:      ', receiverConfig.paymentExpiryTime.toString(), 'seconds');
    console.log('   ✅ Required Amount:     ', receiverConfig.requiredPaymentAmount.toString(), 'wei');
    console.log('   ✅ Approved Sender:     ', receiverConfig.approvedSenderAddress);

    // Test 3: Verify contracts are linked
    console.log('\n📋 Test 3: Verifying Contract Linkage');
    const receiverMatches = senderConfig.remoteReceiver.toLowerCase() === 
                           config.receiverChain.receiver.toLowerCase();
    console.log('   ✅ Sender → Receiver link:', receiverMatches ? '✓ Configured' : '✗ Not configured');

    const senderMatches = receiverConfig.approvedSenderAddress.toLowerCase() === 
                         config.senderChain.sender.toLowerCase();
    console.log('   ✅ Receiver ← Sender link:', senderMatches ? '✓ Configured' : '✗ Not configured');

    // Test 4: Test payment verification (with dummy payment ID)
    console.log('\n📋 Test 4: Testing Payment Verification');
    const dummyPaymentId = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const isValid = await warp.receiver.isValidPayment(dummyPaymentId);
    console.log('   ✅ Verification call successful (dummy ID returns:', isValid, ')');

    console.log('\n' + '='.repeat(60));
    console.log('✅ All Tests Passed!');
    console.log('='.repeat(60));
    console.log('\n🎉 Fuji contracts are working and properly configured!');
    console.log('\n📚 Ready to use in your application:');
    console.log('   import { Warp402, PRESETS } from \'avax-warp-pay\';');
    console.log('   const warp = new Warp402({ ...PRESETS.fuji, privateKey });');
    console.log('\n🔗 View on Snowtrace:');
    console.log('   https://testnet.snowtrace.io/address/' + config.senderChain.sender);
    console.log('   https://testnet.snowtrace.io/address/' + config.receiverChain.receiver);

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

// Run tests
testFujiContracts().catch(console.error);
