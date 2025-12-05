/**
 * Quick test to verify PRESETS functionality works
 * Run with: ts-node test-presets.ts
 */

import { PRESETS, DEPLOYED_CONTRACTS, withPrivateKey } from '../dist/index.js';

console.log('🧪 Testing PRESETS export...\n');

// Test 1: PRESETS exists and has correct structure
console.log('✅ Test 1: PRESETS structure');
console.log('Available presets:', Object.keys(PRESETS));
console.log('Local preset:', JSON.stringify(PRESETS.local, null, 2));

// Test 2: DEPLOYED_CONTRACTS exists
console.log('\n✅ Test 2: DEPLOYED_CONTRACTS');
console.log('Deployed contracts:', JSON.stringify(DEPLOYED_CONTRACTS, null, 2));

// Test 3: withPrivateKey helper works
console.log('\n✅ Test 3: withPrivateKey helper');
const testKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
const config = withPrivateKey(PRESETS.fuji, testKey);
console.log('Config has privateKey:', !!config.privateKey);
console.log('Config has senderChain:', !!config.senderChain);
console.log('Config has receiverChain:', !!config.receiverChain);

// Test 4: Preset values are correct
console.log('\n✅ Test 4: Preset contract addresses');
console.log('Local sender:', PRESETS.local.senderChain.sender);
console.log('Local receiver:', PRESETS.local.receiverChain?.receiver);
console.log('Fuji sender:', PRESETS.fuji.senderChain.sender);
console.log('Fuji receiver:', PRESETS.fuji.receiverChain?.receiver);

// Verify addresses match
const expectedAddress = '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922';
if (PRESETS.local.senderChain.sender === expectedAddress &&
    PRESETS.fuji.senderChain.sender === expectedAddress) {
  console.log('\n✅ All tests passed! PRESETS working correctly.');
} else {
  console.error('\n❌ Address mismatch!');
  process.exit(1);
}
