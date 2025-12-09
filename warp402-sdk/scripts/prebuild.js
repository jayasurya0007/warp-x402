#!/usr/bin/env node

/**
 * Pre-build script to ensure ethers src.ts is moved before compilation
 */

const fs = require('fs');
const path = require('path');

// Try local node_modules first, then parent
const locations = [
  path.join(__dirname, '../node_modules/ethers/src.ts'),
  path.join(__dirname, '../../node_modules/ethers/src.ts')
];

let moved = false;
for (const ethersSrcPath of locations) {
  if (fs.existsSync(ethersSrcPath)) {
    const ethersBackupPath = ethersSrcPath + '.backup';
    try {
      fs.renameSync(ethersSrcPath, ethersBackupPath);
      console.log('✅ Moved ethers src.ts before build');
      moved = true;
      break;
    } catch (error) {
      if (!fs.existsSync(ethersBackupPath)) {
        console.warn('⚠️  Could not move ethers src.ts:', error.message);
      } else {
        moved = true;
        break;
      }
    }
  }
}

if (!moved) {
  console.log('ℹ️  ethers src.ts already moved or not found');
}
