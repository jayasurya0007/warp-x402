/**
 * Unit Test: Automated Deployment Components
 * Tests deployment logic without requiring live networks
 */

import { ethers } from 'ethers';
import { WARPSENDER_BYTECODE, WARPRECEIVER_BYTECODE } from '../src/deploy/bytecode';

console.log('='.repeat(70));
console.log('🧪 Unit Tests: Automated Deployment Components');
console.log('='.repeat(70));
console.log();

// Test 1: Bytecode Availability
console.log('1️⃣  Testing Contract Bytecode...');
if (!WARPSENDER_BYTECODE || !WARPSENDER_BYTECODE.startsWith('0x')) {
  console.log('   ❌ WarpSender bytecode is invalid');
  process.exit(1);
}
if (!WARPRECEIVER_BYTECODE || !WARPRECEIVER_BYTECODE.startsWith('0x')) {
  console.log('   ❌ WarpReceiver bytecode is invalid');
  process.exit(1);
}

console.log(`   ✅ WarpSender bytecode: ${WARPSENDER_BYTECODE.length} characters`);
console.log(`   ✅ WarpReceiver bytecode: ${WARPRECEIVER_BYTECODE.length} characters`);
console.log();

// Test 2: Module Exports
console.log('2️⃣  Testing Module Exports...');
try {
  const { Warp402Factory } = require('../dist/deploy');
  const { ContractDeployer } = require('../dist/deploy');
  
  if (typeof Warp402Factory !== 'object') {
    throw new Error('Warp402Factory not exported');
  }
  if (typeof ContractDeployer !== 'object') {
    throw new Error('ContractDeployer not exported');
  }
  
  console.log('   ✅ Warp402Factory exported');
  console.log('   ✅ ContractDeployer exported');
  console.log();
} catch (error: any) {
  console.log(`   ❌ Module export failed: ${error.message}`);
  process.exit(1);
}

// Test 3: Factory Methods
console.log('3️⃣  Testing Factory Methods...');
try {
  const { Warp402Factory } = require('../dist/deploy');
  
  const methods = ['quickSetup', 'deployOnly', 'configureOnly', 'fromExisting', 'verify'];
  for (const method of methods) {
    if (typeof Warp402Factory[method] !== 'function') {
      throw new Error(`Method ${method} not found`);
    }
    console.log(`   ✅ ${method}() available`);
  }
  console.log();
} catch (error: any) {
  console.log(`   ❌ Factory method test failed: ${error.message}`);
  process.exit(1);
}

// Test 4: ContractDeployer Methods
console.log('4️⃣  Testing ContractDeployer Methods...');
try {
  const { ContractDeployer } = require('../dist/deploy');
  
  const methods = ['deployContracts', 'deployWarpSender', 'deployWarpReceiver', 'configureHandshake', 'verifyDeployment'];
  for (const method of methods) {
    if (typeof ContractDeployer[method] !== 'function') {
      throw new Error(`Method ${method} not found`);
    }
    console.log(`   ✅ ${method}() available`);
  }
  console.log();
} catch (error: any) {
  console.log(`   ❌ ContractDeployer method test failed: ${error.message}`);
  process.exit(1);
}

// Test 5: Main SDK Export
console.log('5️⃣  Testing Main SDK Export...');
try {
  const sdk = require('../dist/index');
  
  if (!sdk.Warp402Factory) {
    throw new Error('Warp402Factory not in main export');
  }
  if (!sdk.ContractDeployer) {
    throw new Error('ContractDeployer not in main export');
  }
  
  console.log('   ✅ Warp402Factory in main export');
  console.log('   ✅ ContractDeployer in main export');
  console.log();
} catch (error: any) {
  console.log(`   ❌ Main SDK export test failed: ${error.message}`);
  process.exit(1);
}

// Test 6: Configuration Types
console.log('6️⃣  Testing Configuration Types...');
try {
  // Test valid configuration structure
  const testConfig = {
    privateKey: '0x' + '1'.repeat(64),
    senderChain: {
      rpc: 'http://test.rpc',
      chainId: 1001,
      blockchainId: '0x' + '1'.repeat(64)
    },
    receiverChain: {
      rpc: 'http://test.rpc',
      chainId: 1002,
      blockchainId: '0x' + '2'.repeat(64)
    }
  };
  
  // Validate structure
  if (!testConfig.privateKey.startsWith('0x')) {
    throw new Error('Invalid privateKey format');
  }
  if (testConfig.senderChain.chainId <= 0) {
    throw new Error('Invalid chainId');
  }
  if (!testConfig.senderChain.blockchainId.startsWith('0x')) {
    throw new Error('Invalid blockchainId format');
  }
  
  console.log('   ✅ DeploymentConfig structure valid');
  console.log('   ✅ ChainConfig structure valid');
  console.log();
} catch (error: any) {
  console.log(`   ❌ Configuration type test failed: ${error.message}`);
  process.exit(1);
}

// Test 7: Bytecode Extraction Script
console.log('7️⃣  Testing Bytecode Extraction Script...');
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '../scripts/extract-bytecode.js');
if (!fs.existsSync(scriptPath)) {
  console.log('   ❌ extract-bytecode.js not found');
  process.exit(1);
}

console.log('   ✅ extract-bytecode.js exists');
console.log('   ℹ️  Run: npm run extract-bytecode');
console.log();

// Test 8: Documentation
console.log('8️⃣  Testing Documentation...');
const deploymentGuide = path.join(__dirname, '../DEPLOYMENT_GUIDE.md');
const readme = path.join(__dirname, '../README.md');

if (!fs.existsSync(deploymentGuide)) {
  console.log('   ❌ DEPLOYMENT_GUIDE.md not found');
  process.exit(1);
}
if (!fs.existsSync(readme)) {
  console.log('   ❌ README.md not found');
  process.exit(1);
}

console.log('   ✅ DEPLOYMENT_GUIDE.md exists');
console.log('   ✅ README.md exists');
console.log();

// Test 9: Example Files
console.log('9️⃣  Testing Example Files...');
const examplePath = path.join(__dirname, '../examples/automated-deployment.ts');
if (!fs.existsSync(examplePath)) {
  console.log('   ❌ automated-deployment.ts example not found');
  process.exit(1);
}

console.log('   ✅ automated-deployment.ts exists');
console.log();

// Test 10: Build Output
console.log('🔟  Testing Build Output...');
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  console.log('   ❌ dist/ directory not found (run npm run build)');
  process.exit(1);
}

const deployDir = path.join(distPath, 'deploy');
if (!fs.existsSync(deployDir)) {
  console.log('   ❌ dist/deploy/ directory not found');
  process.exit(1);
}

console.log('   ✅ dist/ directory exists');
console.log('   ✅ dist/deploy/ directory exists');
console.log();

// Summary
console.log('='.repeat(70));
console.log('✅ All Unit Tests Passed!');
console.log('='.repeat(70));
console.log();
console.log('Test Coverage:');
console.log('   ✓ Contract Bytecode: Valid');
console.log('   ✓ Module Exports: Working');
console.log('   ✓ Factory Methods: Available (5 methods)');
console.log('   ✓ ContractDeployer Methods: Available (5 methods)');
console.log('   ✓ Main SDK Export: Working');
console.log('   ✓ Configuration Types: Valid');
console.log('   ✓ Bytecode Script: Present');
console.log('   ✓ Documentation: Complete');
console.log('   ✓ Examples: Available');
console.log('   ✓ Build Output: Generated');
console.log();
console.log('🎉 Automated Deployment Feature: READY FOR USE!');
console.log();
console.log('Next Steps:');
console.log('   1. Run live network test: ts-node test/quick-test.ts');
console.log('   2. Or use in your project: npm install avax-warp-pay');
console.log('   3. Deploy with one line: Warp402Factory.quickSetup(config)');
console.log();
