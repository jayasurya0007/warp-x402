#!/usr/bin/env node
"use strict";
/**
 * Warp402 CLI - Command line interface for contract deployment
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const Warp402Factory_1 = require("../src/deploy/Warp402Factory");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const program = new commander_1.Command();
program
    .name('avax-warp-pay')
    .description('CLI tool for Warp402 cross-chain payment system')
    .version('1.0.4');
program
    .command('deploy')
    .description('Deploy WarpSender and WarpReceiver contracts')
    .option('--private-key <key>', 'Private key for deployment')
    .option('--sender-rpc <url>', 'Sender chain RPC URL')
    .option('--sender-chain-id <id>', 'Sender chain ID', parseInt)
    .option('--sender-blockchain-id <id>', 'Sender blockchain ID (hex)')
    .option('--sender-messenger <address>', 'Sender ICM Messenger address (optional)')
    .option('--receiver-rpc <url>', 'Receiver chain RPC URL')
    .option('--receiver-chain-id <id>', 'Receiver chain ID', parseInt)
    .option('--receiver-blockchain-id <id>', 'Receiver blockchain ID (hex)')
    .option('--receiver-messenger <address>', 'Receiver ICM Messenger address (optional)')
    .option('--output <file>', 'Output file for deployment addresses (default: deployment-addresses.json)')
    .action(async (options) => {
    try {
        console.log('🚀 Warp402 Contract Deployment');
        console.log('━'.repeat(70));
        console.log('');
        // Validate required options
        const required = [
            'privateKey',
            'senderRpc',
            'senderChainId',
            'senderBlockchainId',
            'receiverRpc',
            'receiverChainId',
            'receiverBlockchainId'
        ];
        const missing = required.filter(key => !options[key]);
        if (missing.length > 0) {
            console.error('❌ Missing required options:');
            missing.forEach(key => {
                const flagName = '--' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
                console.error(`   ${flagName}`);
            });
            console.error('');
            console.error('Run: avax-warp-pay deploy --help');
            process.exit(1);
        }
        // Build deployment config
        const config = {
            privateKey: options.privateKey,
            senderChain: {
                rpc: options.senderRpc,
                chainId: options.senderChainId,
                blockchainId: options.senderBlockchainId,
                messenger: options.senderMessenger
            },
            receiverChain: {
                rpc: options.receiverRpc,
                chainId: options.receiverChainId,
                blockchainId: options.receiverBlockchainId,
                messenger: options.receiverMessenger
            }
        };
        console.log('📋 Configuration:');
        console.log('  Sender Chain ID:', config.senderChain.chainId);
        console.log('  Receiver Chain ID:', config.receiverChain.chainId);
        console.log('');
        const startTime = Date.now();
        // Deploy contracts
        const warp = await Warp402Factory_1.Warp402Factory.quickSetup(config);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        // Extract addresses (accessing internal config)
        const senderAddress = warp.config.senderChain.sender;
        const receiverAddress = warp.config.receiverChain.receiver;
        console.log('');
        console.log('━'.repeat(70));
        console.log('✅ DEPLOYMENT SUCCESSFUL!');
        console.log('━'.repeat(70));
        console.log('');
        console.log('⏱️  Time taken:', duration, 'seconds');
        console.log('');
        console.log('📍 Deployed Contract Addresses:');
        console.log('');
        console.log('  WarpSender:');
        console.log('   ', senderAddress);
        console.log('');
        console.log('  WarpReceiver:');
        console.log('   ', receiverAddress);
        console.log('');
        console.log('━'.repeat(70));
        console.log('');
        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            duration: `${duration}s`,
            sender: {
                chainId: config.senderChain.chainId,
                address: senderAddress,
                rpc: config.senderChain.rpc,
                blockchainId: config.senderChain.blockchainId
            },
            receiver: {
                chainId: config.receiverChain.chainId,
                address: receiverAddress,
                rpc: config.receiverChain.rpc,
                blockchainId: config.receiverChain.blockchainId
            }
        };
        const outputFile = options.output || 'deployment-addresses.json';
        fs.writeFileSync(outputFile, JSON.stringify(deploymentInfo, null, 2));
        console.log('💾 Deployment info saved to:', outputFile);
        console.log('');
        console.log('📝 Add these to your .env file:');
        console.log('');
        console.log(`SENDER_ADDRESS=${senderAddress}`);
        console.log(`RECEIVER_ADDRESS=${receiverAddress}`);
        console.log('');
        console.log('✅ You can now use these addresses in your application!');
        console.log('');
    }
    catch (error) {
        console.error('');
        console.error('━'.repeat(70));
        console.error('❌ DEPLOYMENT FAILED!');
        console.error('━'.repeat(70));
        console.error('');
        console.error('Error:', error.message);
        console.error('');
        process.exit(1);
    }
});
program
    .command('info')
    .description('Show deployment information from saved file')
    .option('-f, --file <path>', 'Path to deployment file', 'deployment-addresses.json')
    .action((options) => {
    try {
        const filePath = path.resolve(options.file);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            console.error('');
            console.error('Run deployment first: avax-warp-pay deploy');
            process.exit(1);
        }
        const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log('');
        console.log('📍 Deployment Information');
        console.log('━'.repeat(70));
        console.log('');
        console.log('📅 Deployed:', deployment.timestamp);
        console.log('⏱️  Duration:', deployment.duration);
        console.log('');
        console.log('🔗 Sender Chain:');
        console.log('  Chain ID:', deployment.sender.chainId);
        console.log('  Address:', deployment.sender.address);
        console.log('  RPC:', deployment.sender.rpc);
        console.log('');
        console.log('🔗 Receiver Chain:');
        console.log('  Chain ID:', deployment.receiver.chainId);
        console.log('  Address:', deployment.receiver.address);
        console.log('  RPC:', deployment.receiver.rpc);
        console.log('');
        console.log('📋 Environment Variables:');
        console.log('');
        console.log(`SENDER_ADDRESS=${deployment.sender.address}`);
        console.log(`RECEIVER_ADDRESS=${deployment.receiver.address}`);
        console.log('');
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map