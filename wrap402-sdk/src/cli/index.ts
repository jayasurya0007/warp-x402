#!/usr/bin/env node
/**
 * Main CLI entry point for avax-warp-pay
 */

const command = process.argv[2];

if (!command || command === 'deploy') {
  require('./deploy');
} else if (command === '--help' || command === '-h') {
  console.log(`
avax-warp-pay - Avalanche Warp-402 Payment SDK

COMMANDS:
  deploy    Deploy Warp-402 contracts to subnets

USAGE:
  npx avax-warp-pay deploy [options]

Run 'npx avax-warp-pay deploy --help' for more information.
  `);
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Run "npx avax-warp-pay --help" for usage information.');
  process.exit(1);
}
