#!/usr/bin/env node
/**
 * CLI tool for deploying Warp-402 contracts
 * Provides an easy command-line interface for contract deployment
 */

import { Warp402Factory } from '../deploy/Warp402Factory';
import { DeploymentConfig } from '../deploy/ContractDeployer';

interface CliArgs {
  senderRpc?: string;
  senderChainId?: string;
  senderBlockchainId?: string;
  receiverRpc?: string;
  receiverChainId?: string;
  receiverBlockchainId?: string;
  privateKey?: string;
  messenger?: string;
  help?: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];

    switch (arg) {
      case '--sender-rpc':
        args.senderRpc = nextArg;
        i++;
        break;
      case '--sender-chain-id':
        args.senderChainId = nextArg;
        i++;
        break;
      case '--sender-blockchain-id':
        args.senderBlockchainId = nextArg;
        i++;
        break;
      case '--receiver-rpc':
        args.receiverRpc = nextArg;
        i++;
        break;
      case '--receiver-chain-id':
        args.receiverChainId = nextArg;
        i++;
        break;
      case '--receiver-blockchain-id':
        args.receiverBlockchainId = nextArg;
        i++;
        break;
      case '--private-key':
        args.privateKey = nextArg;
        i++;
        break;
      case '--messenger':
        args.messenger = nextArg;
        i++;
        break;
      case '-h':
      case '--help':
        args.help = true;
        break;
    }
  }

  return args;
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║              Warp-402 Contract Deployment CLI                      ║
╚════════════════════════════════════════════════════════════════════╝

Deploy Warp-402 contracts to Avalanche subnets with a single command.

USAGE:
  npx avax-warp-pay deploy [options]

OPTIONS:
  --sender-rpc <url>              Sender chain RPC URL
  --sender-chain-id <id>          Sender chain ID
  --sender-blockchain-id <id>     Sender blockchain ID (hex)
  --receiver-rpc <url>            Receiver chain RPC URL
  --receiver-chain-id <id>        Receiver chain ID
  --receiver-blockchain-id <id>   Receiver blockchain ID (hex)
  --private-key <key>             Private key for deployment
  --messenger <address>           ICM Messenger address (optional)
  -h, --help                      Show this help message

ENVIRONMENT VARIABLES:
  PRIVATE_KEY                     Private key (alternative to --private-key)
  SENDER_RPC                      Sender RPC (alternative to --sender-rpc)
  RECEIVER_RPC                    Receiver RPC (alternative to --receiver-rpc)

EXAMPLES:

  # Deploy to local network
  npx avax-warp-pay deploy \\
    --sender-rpc http://127.0.0.1:9650/ext/bc/C/rpc \\
    --sender-chain-id 43112 \\
    --sender-blockchain-id 0x7fc93d85... \\
    --receiver-rpc http://127.0.0.1:9650/ext/bc/subnet/rpc \\
    --receiver-chain-id 99999 \\
    --receiver-blockchain-id 0xc063de20... \\
    --private-key $PRIVATE_KEY

  # Deploy to Fuji testnet
  npx avax-warp-pay deploy \\
    --sender-rpc https://api.avax-test.network/ext/bc/C/rpc \\
    --sender-chain-id 43113 \\
    --sender-blockchain-id 0x7fc93d85... \\
    --receiver-rpc https://subnets.avax.network/mysubnet/rpc \\
    --receiver-chain-id 1002 \\
    --receiver-blockchain-id 0xabc123... \\
    --private-key $PRIVATE_KEY

OUTPUT:
  Deployment will output contract addresses to save in your .env file:
    SENDER_ADDRESS=0x...
    RECEIVER_ADDRESS=0x...

For more information: https://github.com/jayasurya0007/wrap-x402
  `);
}

async function deploy() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║         🚀 Warp-402 Contract Deployment CLI                       ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('');

  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Get configuration from args or environment
  const privateKey = args.privateKey || process.env.PRIVATE_KEY;
  const senderRpc = args.senderRpc || process.env.SENDER_RPC;
  const receiverRpc = args.receiverRpc || process.env.RECEIVER_RPC;
  const senderChainId = args.senderChainId || process.env.SENDER_CHAIN_ID;
  const senderBlockchainId = args.senderBlockchainId || process.env.SENDER_BLOCKCHAIN_ID;
  const receiverChainId = args.receiverChainId || process.env.RECEIVER_CHAIN_ID;
  const receiverBlockchainId = args.receiverBlockchainId || process.env.RECEIVER_BLOCKCHAIN_ID;
  const messenger = args.messenger || process.env.MESSENGER || '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf';

  // Validate required parameters
  const missing: string[] = [];
  if (!privateKey) missing.push('--private-key');
  if (!senderRpc) missing.push('--sender-rpc');
  if (!senderChainId) missing.push('--sender-chain-id');
  if (!senderBlockchainId) missing.push('--sender-blockchain-id');
  if (!receiverRpc) missing.push('--receiver-rpc');
  if (!receiverChainId) missing.push('--receiver-chain-id');
  if (!receiverBlockchainId) missing.push('--receiver-blockchain-id');

  if (missing.length > 0) {
    console.error('❌ Missing required parameters:');
    missing.forEach(param => console.error(`   ${param}`));
    console.error('');
    console.error('Run with --help for usage information.');
    console.error('');
    process.exit(1);
  }

  // Build configuration
  const config: DeploymentConfig = {
    privateKey: privateKey!,
    senderChain: {
      rpc: senderRpc!,
      chainId: parseInt(senderChainId!),
      blockchainId: senderBlockchainId!,
      messenger: messenger
    },
    receiverChain: {
      rpc: receiverRpc!,
      chainId: parseInt(receiverChainId!),
      blockchainId: receiverBlockchainId!,
      messenger: messenger
    }
  };

  console.log('📋 Configuration:');
  console.log(`   Sender Chain:   Chain ID ${config.senderChain.chainId}`);
  console.log(`   Receiver Chain: Chain ID ${config.receiverChain.chainId}`);
  console.log('');

  try {
    const startTime = Date.now();

    console.log('🎯 Starting deployment...');
    console.log('');

    const warp = await Warp402Factory.quickSetup(config);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Extract addresses
    const senderAddress = (warp as any).config.senderChain.sender;
    const receiverAddress = (warp as any).config.receiverChain.receiver;

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ DEPLOYMENT SUCCESSFUL!                       ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`⏱️  Deployment time: ${duration}s`);
    console.log('');
    console.log('📍 Contract Addresses:');
    console.log('');
    console.log('   WarpSender:');
    console.log(`   ${senderAddress}`);
    console.log('');
    console.log('   WarpReceiver:');
    console.log(`   ${receiverAddress}`);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');
    console.log('💾 Add these to your .env file:');
    console.log('');
    console.log(`SENDER_ADDRESS=${senderAddress}`);
    console.log(`RECEIVER_ADDRESS=${receiverAddress}`);
    console.log('');
    console.log('─'.repeat(70));
    console.log('');
    console.log('🎉 You can now use these contracts in your application!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Save the addresses to your .env file');
    console.log('  2. Use the SDK to connect to existing contracts:');
    console.log('');
    console.log('     import { Warp402 } from "avax-warp-pay";');
    console.log('');
    console.log('     const warp = new Warp402({');
    console.log('       privateKey: process.env.PRIVATE_KEY,');
    console.log('       senderChain: {');
    console.log('         rpc: "...",');
    console.log('         chainId: 1001,');
    console.log('         blockchainId: "0x...",');
    console.log('         messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",');
    console.log('         sender: process.env.SENDER_ADDRESS');
    console.log('       },');
    console.log('       receiverChain: {');
    console.log('         rpc: "...",');
    console.log('         chainId: 1002,');
    console.log('         blockchainId: "0x...",');
    console.log('         messenger: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",');
    console.log('         receiver: process.env.RECEIVER_ADDRESS');
    console.log('       }');
    console.log('     });');
    console.log('');

    process.exit(0);

  } catch (error: any) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════════════════╗');
    console.error('║                     ❌ DEPLOYMENT FAILED!                          ║');
    console.error('╚════════════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('insufficient funds')) {
      console.error('💡 Tip: Make sure your account has enough AVAX for deployment');
      console.error('   Estimated cost: ~$4.55 (gas fees)');
    } else if (error.message.includes('could not detect network')) {
      console.error('💡 Tip: Check that your RPC URLs are correct and accessible');
    }
    
    console.error('');
    process.exit(1);
  }
}

// Run deployment
deploy();
