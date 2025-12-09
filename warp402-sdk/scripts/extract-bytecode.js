#!/usr/bin/env node
/**
 * Extract contract bytecode from Foundry compilation
 * Run this script to update the bytecode in src/deploy/bytecode.ts
 * 
 * Usage: node scripts/extract-bytecode.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONTRACTS_DIR = path.join(__dirname, '../../wrapx402');
const BYTECODE_FILE = path.join(__dirname, '../src/deploy/bytecode.ts');

console.log('🔨 Extracting contract bytecode...\n');

try {
  // Change to contracts directory
  process.chdir(CONTRACTS_DIR);
  
  // Build contracts
  console.log('📦 Building contracts...');
  execSync('forge build', { stdio: 'inherit' });
  console.log('✅ Contracts built\n');
  
  // Extract WarpSender bytecode
  console.log('📤 Extracting WarpSender bytecode...');
  const senderBytecode = execSync(
    'forge inspect src/WarpSender.sol:WarpSender bytecode',
    { encoding: 'utf-8' }
  ).trim();
  console.log(`   Length: ${senderBytecode.length} characters`);
  
  // Extract WarpReceiver bytecode
  console.log('📥 Extracting WarpReceiver bytecode...');
  const receiverBytecode = execSync(
    'forge inspect src/WarpReceiver.sol:WarpReceiver bytecode',
    { encoding: 'utf-8' }
  ).trim();
  console.log(`   Length: ${receiverBytecode.length} characters\n`);
  
  // Generate bytecode.ts file
  const content = `/**
 * Contract bytecode for deployment
 * Generated from compiled Solidity contracts
 * 
 * DO NOT EDIT MANUALLY!
 * Run: npm run extract-bytecode to regenerate
 */

export const WARPSENDER_BYTECODE = '${senderBytecode}';

export const WARPRECEIVER_BYTECODE = '${receiverBytecode}';

/**
 * Get contract bytecode
 */
export function getBytecode(contractName: 'WarpSender' | 'WarpReceiver'): string {
  if (contractName === 'WarpSender') {
    return WARPSENDER_BYTECODE;
  }
  return WARPRECEIVER_BYTECODE;
}
`;
  
  // Write to file
  fs.writeFileSync(BYTECODE_FILE, content, 'utf-8');
  console.log(`✅ Bytecode written to: ${path.relative(process.cwd(), BYTECODE_FILE)}`);
  console.log('\n🎉 Bytecode extraction complete!');
  
} catch (error) {
  console.error('❌ Error extracting bytecode:', error.message);
  process.exit(1);
}
