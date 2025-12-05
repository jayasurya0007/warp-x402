#!/usr/bin/env node

import { readFileSync, existsSync, statSync, watch } from 'fs';
import { spawn } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';

const log = {
  title: (msg) => console.log(chalk.bold.cyan(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`)),
  info: (msg) => console.log(chalk.blue(`ℹ ${msg}`)),
  success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
  error: (msg) => console.log(chalk.red(`✗ ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
  data: (label, value) => console.log(chalk.gray(`   ${label}: ${chalk.white(value)}`)),
  
  // Log message styling based on content
  relayer: (line) => {
    if (line.includes('error') || line.includes('ERROR')) {
      console.log(chalk.red(line));
    } else if (line.includes('warning') || line.includes('WARN')) {
      console.log(chalk.yellow(line));
    } else if (line.includes('success') || line.includes('delivered') || line.includes('submitted')) {
      console.log(chalk.green(line));
    } else if (line.includes('processing') || line.includes('relaying')) {
      console.log(chalk.cyan(line));
    } else if (line.includes('warp') || line.includes('message')) {
      console.log(chalk.magenta(line));
    } else {
      console.log(chalk.gray(line));
    }
  }
};

// Find ICM relayer log files
function findRelayerLogs() {
  const baseDir = join(homedir(), '.avalanche-cli', 'runs');
  
  if (!existsSync(baseDir)) {
    return null;
  }
  
  // Find the most recent network directory
  const networkDirs = [];
  try {
    const entries = readFileSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('network_')) {
        const dirPath = join(baseDir, entry.name);
        const stat = statSync(dirPath);
        networkDirs.push({ path: dirPath, mtime: stat.mtime });
      }
    }
  } catch (error) {
    return null;
  }
  
  if (networkDirs.length === 0) {
    return null;
  }
  
  // Sort by modification time (most recent first)
  networkDirs.sort((a, b) => b.mtime - a.mtime);
  
  // Look for ICM relayer logs
  const relayerDir = join(networkDirs[0].path, 'icm-relayer-storage');
  
  if (existsSync(relayerDir)) {
    return relayerDir;
  }
  
  return null;
}

// Monitor relayer logs
function monitorLogs() {
  log.title('📡 ICM Relayer Log Monitor');
  
  const logDir = findRelayerLogs();
  
  if (!logDir) {
    log.error('ICM relayer logs not found');
    log.info('Expected location: ~/.avalanche-cli/runs/network_*/icm-relayer-storage/');
    log.warning('Make sure Avalanche local network is running');
    console.log('\nTo start the network:');
    console.log(chalk.white('  avalanche network start'));
    process.exit(1);
  }
  
  log.success('Found ICM relayer logs');
  log.data('Directory', logDir);
  
  console.log(chalk.gray('\nMonitoring for new log entries...'));
  console.log(chalk.gray('Press Ctrl+C to stop\n'));
  
  // Use tail -f to follow all log files
  const tail = spawn('tail', ['-f', join(logDir, '*.log')], {
    shell: true
  });
  
  let lineBuffer = '';
  
  tail.stdout.on('data', (data) => {
    lineBuffer += data.toString();
    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop(); // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (line.trim()) {
        const timestamp = new Date().toISOString().substring(11, 19);
        console.log(chalk.dim(`[${timestamp}]`), line);
      }
    }
  });
  
  tail.stderr.on('data', (data) => {
    log.error(data.toString().trim());
  });
  
  tail.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log.error(`Monitoring stopped with code ${code}`);
    }
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n');
    log.info('Stopping monitor...');
    tail.kill();
    process.exit(0);
  });
}

// Alternative: Show recent logs
function showRecentLogs() {
  log.title('📡 Recent ICM Relayer Logs');
  
  const logDir = findRelayerLogs();
  
  if (!logDir) {
    log.error('ICM relayer logs not found');
    process.exit(1);
  }
  
  log.success('Found ICM relayer logs');
  log.data('Directory', logDir);
  console.log('');
  
  // Show last 50 lines
  const tail = spawn('tail', ['-n', '50', join(logDir, '*.log')], {
    shell: true
  });
  
  tail.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        log.relayer(line);
      }
    }
  });
  
  tail.on('close', () => {
    console.log('');
    log.info('Use "npm run monitor" for live monitoring');
  });
}

// Main
const command = process.argv[2];

console.clear();

if (command === 'recent') {
  showRecentLogs();
} else {
  monitorLogs();
}
