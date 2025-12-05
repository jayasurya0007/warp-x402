#!/usr/bin/env node

/**
 * Workaround for ethers v6 TypeScript compilation issues
 * Temporarily renames src.ts directory to prevent TypeScript from compiling it
 */

const fs = require('fs');
const path = require('path');

const ethersSrcPath = path.join(__dirname, '../node_modules/ethers/src.ts');
const ethersBackupPath = path.join(__dirname, '../node_modules/ethers/src.ts.backup');

if (fs.existsSync(ethersSrcPath) && !fs.existsSync(ethersBackupPath)) {
  try {
    fs.renameSync(ethersSrcPath, ethersBackupPath);
    console.log('✅ Moved ethers src.ts to prevent TypeScript compilation issues');
  } catch (error) {
    console.warn('⚠️  Could not move ethers src.ts:', error.message);
  }
}
