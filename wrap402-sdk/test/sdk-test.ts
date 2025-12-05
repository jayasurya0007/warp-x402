/**
 * SDK Test Script
 * 
 * Tests basic SDK functionality without blockchain interaction
 * Validates types, configuration, and class initialization
 */

import { Warp402, Config, generatePaymentId, isValidPaymentId, formatPaymentId } from '../src';
import { LogLevel } from '../src/utils/logger';

console.log('='.repeat(60));
console.log('🧪 Warp-402 SDK Test Suite');
console.log('='.repeat(60));
console.log();

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error: any) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: Payment ID generation
test('Generate payment ID', () => {
  const id = generatePaymentId();
  if (id.length !== 64) throw new Error('Invalid length');
  if (!/^[0-9a-f]{64}$/.test(id)) throw new Error('Invalid format');
});

// Test 2: Payment ID validation
test('Validate payment ID', () => {
  const validId = '1'.repeat(64);
  const invalidId = '1'.repeat(63);
  
  if (!isValidPaymentId(validId)) throw new Error('Should be valid');
  if (isValidPaymentId(invalidId)) throw new Error('Should be invalid');
});

// Test 3: Payment ID formatting
test('Format payment ID', () => {
  const id = '1'.repeat(64);
  const formatted = formatPaymentId(id);
  
  if (!formatted.startsWith('0x')) throw new Error('Should have 0x prefix');
  if (formatted.length !== 66) throw new Error('Invalid length with prefix');
});

// Test 4: Configuration validation - valid config
test('Valid configuration', () => {
  const config = {
    privateKey: '1'.repeat(64),
    senderChain: {
      rpc: 'http://localhost:9650',
      chainId: 12345,
      blockchainId: '0x' + '1'.repeat(64),
      messenger: '0x' + '1'.repeat(40),
      sender: '0x' + '2'.repeat(40)
    },
    receiverChain: {
      rpc: 'http://localhost:9650',
      chainId: 54321,
      blockchainId: '0x' + '2'.repeat(64),
      messenger: '0x' + '1'.repeat(40),
      receiver: '0x' + '3'.repeat(40)
    }
  };
  
  Config.validate(config);
});

// Test 5: Configuration validation - missing private key
test('Invalid config - missing private key', () => {
  const config = {
    privateKey: '',
    senderChain: {
      rpc: 'http://localhost:9650',
      chainId: 12345,
      blockchainId: '0x1',
      messenger: '0x' + '1'.repeat(40),
      sender: '0x' + '2'.repeat(40)
    },
    receiverChain: {
      rpc: 'http://localhost:9650',
      chainId: 54321,
      blockchainId: '0x2',
      messenger: '0x' + '1'.repeat(40),
      receiver: '0x' + '3'.repeat(40)
    }
  };
  
  try {
    Config.validate(config);
    throw new Error('Should have thrown');
  } catch (error: any) {
    if (!error.message.includes('Private key')) throw error;
  }
});

// Test 6: Configuration validation - invalid RPC
test('Invalid config - bad RPC URL', () => {
  const config = {
    privateKey: '1'.repeat(64),
    senderChain: {
      rpc: 'not-a-url',
      chainId: 12345,
      blockchainId: '0x1',
      messenger: '0x' + '1'.repeat(40),
      sender: '0x' + '2'.repeat(40)
    },
    receiverChain: {
      rpc: 'http://localhost:9650',
      chainId: 54321,
      blockchainId: '0x2',
      messenger: '0x' + '1'.repeat(40),
      receiver: '0x' + '3'.repeat(40)
    }
  };
  
  try {
    Config.validate(config);
    throw new Error('Should have thrown');
  } catch (error: any) {
    if (!error.message.includes('RPC')) throw error;
  }
});

// Test 7: Configuration validation - missing sender address
test('Invalid config - missing sender address', () => {
  const config = {
    privateKey: '1'.repeat(64),
    senderChain: {
      rpc: 'http://localhost:9650',
      chainId: 12345,
      blockchainId: '0x1',
      messenger: '0x' + '1'.repeat(40)
      // missing sender
    },
    receiverChain: {
      rpc: 'http://localhost:9650',
      chainId: 54321,
      blockchainId: '0x2',
      messenger: '0x' + '1'.repeat(40),
      receiver: '0x' + '3'.repeat(40)
    }
  };
  
  try {
    Config.validate(config);
    throw new Error('Should have thrown');
  } catch (error: any) {
    if (!error.message.includes('sender contract')) throw error;
  }
});

// Test 8: SDK initialization with valid config
test('Initialize SDK', () => {
  const config = {
    privateKey: '1'.repeat(64),
    senderChain: {
      rpc: 'http://localhost:9650',
      chainId: 12345,
      blockchainId: '0x' + '1'.repeat(64),
      messenger: '0x' + '1'.repeat(40),
      sender: '0x' + '2'.repeat(40)
    },
    receiverChain: {
      rpc: 'http://localhost:9650',
      chainId: 54321,
      blockchainId: '0x' + '2'.repeat(64),
      messenger: '0x' + '1'.repeat(40),
      receiver: '0x' + '3'.repeat(40)
    }
  };
  
  const warp = new Warp402(config);
  warp.setLogLevel(LogLevel.ERROR); // Suppress logs for test
  
  // Test getter methods
  const address = warp.getSenderAddress();
  if (!address) throw new Error('No sender address');
});

// Test 9: Export verification
test('All exports available', () => {
  const exports = [
    'Warp402',
    'Config',
    'generatePaymentId',
    'isValidPaymentId',
    'formatPaymentId'
  ];
  
  // All exports should be available (not undefined)
  if (typeof Warp402 === 'undefined') throw new Error('Warp402 not exported');
  if (typeof Config === 'undefined') throw new Error('Config not exported');
  if (typeof generatePaymentId === 'undefined') throw new Error('generatePaymentId not exported');
});

// Test 10: TypeScript compilation
test('TypeScript types available', () => {
  // This test passes if TypeScript compilation succeeds
  // Types are checked at compile time
});

console.log();
console.log('='.repeat(60));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}
