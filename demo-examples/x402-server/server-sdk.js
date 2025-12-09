/**
 * x402 Server - SDK-Powered Version
 * 
 * HTTP 402 Payment Required server using Warp-402 SDK
 * This demonstrates how the SDK simplifies cross-chain payment integration
 */

import express from 'express';
import { Warp402 } from 'avax-warp-pay';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Network configurations
const NETWORKS = {
  local: {
    name: 'Local Network',
    senderRpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
    receiverRpc: 'http://127.0.0.1:9650/ext/bc/krncd99BqvSYebiEuZk8NvYNiaS3zWaUtRg2mD3F8hQvroBR8/rpc',
    senderChainId: 1001,
    receiverChainId: 1002,
    senderBlockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
    receiverBlockchainId: '0x6395f92aaae85f30810132579df9b48133f6d28daf144ab633de2e3477a2f8da',
    receiverAddress: '0x4Ac1d98D9cEF99EC6546dEd4Bd550b0b287aaD6D',
    senderAddress: '0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00',
    description: 'Local Avalanche subnet deployment'
  },
  fuji: {
    name: 'Fuji Testnet',
    senderRpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    receiverRpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    senderChainId: 43113,
    receiverChainId: 43113,
    senderBlockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    receiverBlockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    receiverAddress: '0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f',
    senderAddress: '0x0d45537c1DA893148dBB113407698E20CfA2eE56',
    description: 'Fuji C-Chain testnet deployment'
  }
};

// Load configuration
const NETWORK_ENV = process.env.NETWORK || 'local';
const currentNetwork = NETWORKS[NETWORK_ENV];

if (!currentNetwork) {
  console.error(`❌ Invalid NETWORK value: ${NETWORK_ENV}`);
  console.error(`   Available networks: ${Object.keys(NETWORKS).join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY environment variable is required');
  process.exit(1);
}

// Initialize Warp-402 SDK
console.log('🔧 Initializing Warp-402 SDK...');
const warp = new Warp402({
  privateKey: PRIVATE_KEY,
  senderChain: {
    rpc: currentNetwork.senderRpc,
    chainId: currentNetwork.senderChainId,
    blockchainId: currentNetwork.senderBlockchainId,
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: currentNetwork.senderAddress
  },
  receiverChain: {
    rpc: currentNetwork.receiverRpc,
    chainId: currentNetwork.receiverChainId,
    blockchainId: currentNetwork.receiverBlockchainId,
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: currentNetwork.receiverAddress
  }
});
console.log('✅ SDK initialized successfully!');

// Initialize Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Payment-Id'],
  credentials: true
}));
app.use(express.json());

// In-memory storage for payment tracking
const pendingPayments = new Map();

/**
 * GET /resource
 * Returns HTTP 402 Payment Required with payment details
 */
app.get('/resource', (req, res) => {
  // Generate unique payment ID
  const paymentId = ethers.keccak256(
    ethers.toUtf8Bytes(`payment-${Date.now()}-${Math.random()}`)
  );

  const requiredAmount = process.env.REQUIRED_PAYMENT_AMOUNT_WEI || '1000000000000000000';

  // Store payment request
  pendingPayments.set(paymentId, {
    id: paymentId,
    amount: requiredAmount,
    status: 'pending',
    createdAt: Date.now()
  });

  // Return HTTP 402 Payment Required
  res.status(402).json({
    error: 'Payment Required',
    message: 'This resource requires payment to access',
    payment: {
      paymentId: paymentId,
      amount: requiredAmount,
      amountFormatted: ethers.formatEther(requiredAmount) + ' AVAX',
      senderChainId: currentNetwork.senderChainId,
      receiverChainId: currentNetwork.receiverChainId,
      senderBlockchainId: currentNetwork.senderBlockchainId,
      receiverBlockchainId: currentNetwork.receiverBlockchainId,
      senderContract: currentNetwork.senderAddress,
      receiverContract: currentNetwork.receiverAddress
    },
    instructions: [
      `1. Send payment on ${currentNetwork.name} (Sender Chain)`,
      '2. Use the payment ID above',
      '3. Wait ~10-15 seconds for Teleporter relay',
      '4. Verify payment with GET /verify/:paymentId',
      '5. Consume payment with POST /consume/:paymentId'
    ]
  });
});

/**
 * GET /verify/:paymentId
 * Verify if a payment has been received
 */
app.get('/verify/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    console.log(`🔍 Verifying payment: ${paymentId}`);

    // Use SDK to verify payment (now checks expiry too!)
    const isVerified = await warp.verify(paymentId);

    if (!isVerified) {
      // Check if payment exists but is expired or consumed
      const hasPaid = await warp.receiver.hasPaid(paymentId);
      
      if (hasPaid) {
        const isExpired = await warp.receiver.isExpired(paymentId);
        const isConsumed = await warp.receiver.isConsumed(paymentId);
        
        if (isExpired) {
          return res.status(403).json({
            verified: false,
            message: 'Payment has expired',
            paymentId: paymentId,
            reason: 'expired'
          });
        }
        
        if (isConsumed) {
          return res.status(403).json({
            verified: false,
            message: 'Payment already consumed',
            paymentId: paymentId,
            reason: 'consumed'
          });
        }
      }
      
      return res.json({
        verified: false,
        message: 'Payment not found or not yet relayed',
        paymentId: paymentId,
        suggestion: 'Wait a few more seconds for Teleporter relay'
      });
    }

    // Get full receipt details using SDK
    const receipt = await warp.getReceipt(paymentId);

    // Update local tracking
    if (pendingPayments.has(paymentId)) {
      pendingPayments.get(paymentId).status = 'verified';
    }

    res.json({
      verified: true,
      message: 'Payment verified successfully',
      receipt: {
        paymentId: receipt.paymentId,
        payer: receipt.payer,
        amount: receipt.amount.toString(),
        amountFormatted: ethers.formatEther(receipt.amount) + ' AVAX',
        timestamp: receipt.timestamp.toString(),
        consumed: receipt.consumed,
        senderChainId: currentNetwork.senderChainId,
        receiverChainId: currentNetwork.receiverChainId
      }
    });

  } catch (error) {
    console.error('❌ Verification error:', error.message);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

/**
 * POST /consume/:paymentId
 * Consume a verified payment and grant access to the resource
 */
app.post('/consume/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    console.log(`💳 Consuming payment: ${paymentId}`);

    // Use enhanced validation - checks exist + not consumed + not expired
    const isValid = await warp.receiver.isValidPayment(paymentId);

    if (!isValid) {
      // Detailed error checking
      const hasPaid = await warp.receiver.hasPaid(paymentId);
      
      if (!hasPaid) {
        return res.status(403).json({
          error: 'Payment not found',
          message: 'No payment found with this ID'
        });
      }
      
      const isExpired = await warp.receiver.isExpired(paymentId);
      if (isExpired) {
        return res.status(403).json({
          error: 'Payment expired',
          message: 'This payment has expired and cannot be consumed'
        });
      }
      
      const isConsumed = await warp.receiver.isConsumed(paymentId);
      if (isConsumed) {
        return res.status(403).json({
          error: 'Payment already consumed',
          message: 'This payment has already been used'
        });
      }
      
      return res.status(403).json({
        error: 'Invalid payment',
        message: 'Payment is not valid for consumption'
      });
    }

    // Get receipt to check amount
    const receipt = await warp.getReceipt(paymentId);
    const requiredAmount = BigInt(process.env.REQUIRED_PAYMENT_AMOUNT_WEI || '1000000000000000000');

    if (receipt.amount < requiredAmount) {
      return res.status(403).json({
        error: 'Insufficient payment amount',
        message: `Payment amount ${ethers.formatEther(receipt.amount)} is less than required ${ethers.formatEther(requiredAmount)}`
      });
    }

    // Consume the payment using SDK (contract enforces expiry check)
    console.log(`🔒 Consuming payment on-chain...`);
    const result = await warp.consume(paymentId);
    console.log(`✅ Payment consumed! TX: ${result.hash}`);

    // Update local tracking
    if (pendingPayments.has(paymentId)) {
      pendingPayments.get(paymentId).status = 'consumed';
    }

    res.json({
      success: true,
      message: 'Payment consumed successfully',
      paymentId: paymentId,
      transaction: {
        hash: result.hash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed?.toString()
      },
      resource: {
        message: 'Access granted! Here is your protected resource.',
        data: {
          content: 'This is the premium content that required payment.',
          timestamp: new Date().toISOString(),
          paymentAmount: ethers.formatEther(receipt.amount)
        }
      }
    });

  } catch (error) {
    console.error('❌ Consumption error:', error.message);

    // Handle specific error cases
    if (error.message.includes('Payment already consumed')) {
      return res.status(403).json({
        error: 'Payment already consumed',
        message: 'This payment has already been used'
      });
    }

    res.status(500).json({
      error: 'Consumption failed',
      message: error.message
    });
  }
});

/**
 * GET /health
 * Health check endpoint with network information
 */
app.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      sdk: {
        name: 'warp402-sdk',
        version: '1.0.0',
        initialized: true
      },
      network: {
        environment: NETWORK_ENV,
        name: currentNetwork.name,
        description: currentNetwork.description,
        senderChainId: currentNetwork.senderChainId,
        receiverChainId: currentNetwork.receiverChainId
      },
      contracts: {
        sender: currentNetwork.senderAddress,
        receiver: currentNetwork.receiverAddress
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      network: {
        environment: NETWORK_ENV,
        name: currentNetwork.name
      }
    });
  }
});

/**
 * GET /contract-status
 * Get detailed contract configuration and status
 */
app.get('/contract-status', async (req, res) => {
  try {
    console.log('📊 Fetching contract status...');

    // Get sender contract configuration
    const senderConfig = await warp.sender.getConfiguration();
    const contractBalance = await warp.sender.getContractBalance();
    
    // Get receiver contract configuration
    const receiverConfig = await warp.receiver.getConfiguration();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      sender: {
        address: currentNetwork.senderAddress,
        chainId: currentNetwork.senderChainId,
        owner: senderConfig.owner,
        paused: senderConfig.paused,
        balance: {
          wei: contractBalance.toString(),
          formatted: ethers.formatEther(contractBalance) + ' AVAX'
        },
        gasLimits: {
          message: senderConfig.messageGasLimit.toString(),
          payment: senderConfig.defaultGasLimit.toString()
        },
        remoteReceiver: senderConfig.remoteReceiver,
        remoteBlockchainId: senderConfig.remoteBlockchainId
      },
      receiver: {
        address: currentNetwork.receiverAddress,
        chainId: currentNetwork.receiverChainId,
        owner: receiverConfig.owner,
        paused: receiverConfig.paused,
        approvedSender: receiverConfig.approvedSender,
        approvedSourceBlockchainId: receiverConfig.approvedSourceBlockchainId,
        requiredPaymentAmount: {
          wei: receiverConfig.requiredPaymentAmount.toString(),
          formatted: ethers.formatEther(receiverConfig.requiredPaymentAmount) + ' AVAX'
        },
        paymentExpiryTime: {
          seconds: receiverConfig.paymentExpiryTime.toString(),
          formatted: formatSeconds(Number(receiverConfig.paymentExpiryTime))
        }
      }
    });

  } catch (error) {
    console.error('❌ Contract status error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch contract status',
      message: error.message
    });
  }
});

// Helper function to format seconds
function formatSeconds(seconds) {
  if (seconds === 0) return 'Never expires';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.length > 0 ? parts.join(' ') : `${seconds}s`;
}

/**
 * GET /
 * API information
 */
app.get('/', (req, res) => {
  res.json({
    name: 'x402 Payment Server (SDK-Powered)',
    version: '2.0.0',
    description: 'HTTP 402 Payment Required server using Warp-402 SDK',
    sdk: 'warp402-sdk v1.0.0',
    network: {
      environment: NETWORK_ENV,
      name: currentNetwork.name,
      description: currentNetwork.description
    },
    endpoints: {
      'GET /resource': 'Request a protected resource (returns 402 with payment details)',
      'GET /verify/:paymentId': 'Verify a payment receipt',
      'POST /consume/:paymentId': 'Consume a payment and access the resource',
      'GET /health': 'Health check endpoint',
      'GET /contract-status': 'Get detailed contract configuration and status',
      'GET /': 'This information page'
    },
    features: [
      '✅ Powered by Warp-402 SDK',
      '✅ Cross-chain payment receipts',
      '✅ Teleporter integration',
      '✅ Type-safe with full error handling',
      '✅ Production-ready with security features',
      '✅ Payment expiry validation',
      '✅ Enhanced error reporting'
    ],
    documentation: 'See X402_SERVER.md for full documentation'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     x402 Payment Server - SDK-Powered Version 2.0        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('🌐 Network Configuration:');
  console.log(`   Environment:  ${NETWORK_ENV.toUpperCase()}`);
  console.log(`   Network:      ${currentNetwork.name}`);
  console.log(`   Description:  ${currentNetwork.description}`);
  console.log('');
  console.log('📦 SDK Configuration:');
  console.log('   Using:        Warp-402 SDK v1.0.0');
  console.log(`   Sender:       ${currentNetwork.senderAddress}`);
  console.log(`   Receiver:     ${currentNetwork.receiverAddress}`);
  console.log(`   Chain IDs:    ${currentNetwork.senderChainId} → ${currentNetwork.receiverChainId}`);
  console.log('');
  console.log('📚 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/resource`);
  console.log(`   GET  http://localhost:${PORT}/verify/:paymentId`);
  console.log(`   POST http://localhost:${PORT}/consume/:paymentId`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/contract-status`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log('');
  console.log('✨ SDK Benefits:');
  console.log('   • No ABI management');
  console.log('   • Simple verify/consume API');
  console.log('   • Built-in error handling');
  console.log('   • Production-ready code');
  console.log('   • Payment expiry validation');
  console.log('   • Enhanced security features');
  console.log('');
  console.log('✅ Ready to accept payment requests!');
  console.log('');
});
