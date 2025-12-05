#!/usr/bin/env node

/**
 * Pre-build script to ensure ethers src.ts is moved before compilation
 */

const fs = require('fs');
const path = require('path');

const ethersSrcPath = path.join(__dirname, '../node_modules/ethers/src.ts');
const ethersBackupPath = path.join(__dirname, '../node_modules/ethers/src.ts.backup');

if (fs.existsSync(ethersSrcPath)) {
  try {
    fs.renameSync(ethersSrcPath, ethersBackupPath);
    console.log('✅ Moved ethers src.ts before build');
  } catch (error) {
    // Might already be moved
    if (!fs.existsSync(ethersBackupPath)) {
      console.warn('⚠️  Could not move ethers src.ts:', error.message);
    }
  }
}
