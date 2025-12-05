import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3000;
const SUBNET_B_RPC_URL = process.env.SUBNET_B_RPC_URL;
const WARP_RECEIVER_ADDRESS = process.env.WARP_RECEIVER_ADDRESS;
const WARP_SENDER_ADDRESS = process.env.WARP_SENDER_ADDRESS;
const SUBNET_A_CHAIN_ID = process.env.SUBNET_A_CHAIN_ID;
const SUBNET_B_CHAIN_ID = process.env.SUBNET_B_CHAIN_ID;
const DEFAULT_PAYMENT_AMOUNT_WEI = process.env.DEFAULT_PAYMENT_AMOUNT_WEI;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Initialize ethers provider and contract
const provider = new ethers.JsonRpcProvider(SUBNET_B_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load WarpReceiver ABI
const warpReceiverABI = JSON.parse(
  readFileSync(join(__dirname, 'abi', 'WarpReceiver.json'), 'utf-8')
);

const warpReceiverContract = new ethers.Contract(
  WARP_RECEIVER_ADDRESS,
  warpReceiverABI,
  provider
);

const warpReceiverContractWithSigner = new ethers.Contract(
  WARP_RECEIVER_ADDRESS,
  warpReceiverABI,
  wallet
);

// In-memory storage for payment IDs (in production, use a database)
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

  // Store payment ID for tracking
  pendingPayments.set(paymentId, {
    created: Date.now(),
    status: 'pending'
  });

  // Return 402 with payment details
  res.status(402).json({
    error: 'Payment Required',
    message: 'This resource requires payment to access',
    paymentDetails: {
      paymentId: paymentId,
      price: DEFAULT_PAYMENT_AMOUNT_WEI,
      priceInEther: ethers.formatEther(DEFAULT_PAYMENT_AMOUNT_WEI),
      sender: WARP_SENDER_ADDRESS,
      chainId: SUBNET_A_CHAIN_ID,
      receiver: WARP_RECEIVER_ADDRESS,
      destinationChainId: SUBNET_B_CHAIN_ID
    },
    instructions: {
      step1: 'Send payment using WarpSender.sendPayment() on Subnet A',
      step2: 'Wait 5-10 seconds for ICM relayer to deliver the payment receipt',
      step3: 'Verify payment using GET /verify/:paymentId',
      step4: 'Access resource after payment confirmation'
    }
  });
});

/**
 * GET /verify/:paymentId
 * Verifies if a payment has been received and returns receipt details
 */
app.get('/verify/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Validate payment ID format
    if (!paymentId.startsWith('0x') || paymentId.length !== 66) {
      return res.status(400).json({
        error: 'Invalid payment ID format',
        message: 'Payment ID must be a 32-byte hex string (0x...)'
      });
    }

    // Check if payment exists on-chain
    const hasPaid = await warpReceiverContract.hasPaid(paymentId);

    if (!hasPaid) {
      return res.status(404).json({
        verified: false,
        message: 'Payment not found. It may still be in transit via ICM relayer.',
        paymentId: paymentId,
        suggestion: 'Wait a few more seconds and try again'
      });
    }

    // Get payment receipt details
    const receipt = await warpReceiverContract.getReceipt(paymentId);

    // Check if payment is consumed
    const isConsumed = await warpReceiverContract.isConsumed(paymentId);

    // Get required payment amount
    const requiredAmount = await warpReceiverContract.requiredPaymentAmount();

    // Validate payment amount
    const amountValid = receipt.amount >= requiredAmount;

    res.json({
      verified: true,
      valid: amountValid && !isConsumed,
      paymentId: paymentId,
      receipt: {
        paymentId: receipt.paymentId,
        amount: receipt.amount.toString(),
        amountInEther: ethers.formatEther(receipt.amount),
        payer: receipt.payer,
        timestamp: Number(receipt.timestamp),
        timestampDate: new Date(Number(receipt.timestamp) * 1000).toISOString(),
        consumed: receipt.consumed
      },
      validation: {
        amountValid: amountValid,
        requiredAmount: requiredAmount.toString(),
        requiredAmountInEther: ethers.formatEther(requiredAmount),
        consumed: isConsumed,
        canConsume: amountValid && !isConsumed
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

/**
 * POST /consume/:paymentId
 * Consumes a payment (marks it as used) to prevent replay attacks
 */
app.post('/consume/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Validate payment ID format
    if (!paymentId.startsWith('0x') || paymentId.length !== 66) {
      return res.status(400).json({
        error: 'Invalid payment ID format',
        message: 'Payment ID must be a 32-byte hex string (0x...)'
      });
    }

    // Check if payment exists
    const hasPaid = await warpReceiverContract.hasPaid(paymentId);
    if (!hasPaid) {
      return res.status(404).json({
        error: 'Payment not found',
        message: 'No payment receipt found for this payment ID'
      });
    }

    // Check if already consumed
    const isConsumed = await warpReceiverContract.isConsumed(paymentId);
    if (isConsumed) {
      return res.status(403).json({
        error: 'Payment already consumed',
        message: 'This payment has already been used and cannot be consumed again'
      });
    }

    // Get receipt to validate amount
    const receipt = await warpReceiverContract.getReceipt(paymentId);
    const requiredAmount = await warpReceiverContract.requiredPaymentAmount();

    if (receipt.amount < requiredAmount) {
      return res.status(403).json({
        error: 'Insufficient payment amount',
        message: `Payment amount ${ethers.formatEther(receipt.amount)} is less than required ${ethers.formatEther(requiredAmount)}`
      });
    }

    // Consume the payment
    console.log(`Consuming payment ${paymentId}...`);
    const tx = await warpReceiverContractWithSigner.consumePayment(paymentId);
    console.log(`Transaction sent: ${tx.hash}`);
    
    const txReceipt = await tx.wait();
    console.log(`Transaction confirmed in block ${txReceipt.blockNumber}`);

    // Update local tracking
    if (pendingPayments.has(paymentId)) {
      pendingPayments.get(paymentId).status = 'consumed';
    }

    res.json({
      success: true,
      message: 'Payment consumed successfully',
      paymentId: paymentId,
      transaction: {
        hash: tx.hash,
        blockNumber: txReceipt.blockNumber,
        gasUsed: txReceipt.gasUsed.toString()
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
    console.error('Error consuming payment:', error);
    
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
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    // Check RPC connection
    const blockNumber = await provider.getBlockNumber();
    
    // Check contract connection
    const requiredAmount = await warpReceiverContract.requiredPaymentAmount();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      blockchain: {
        connected: true,
        blockNumber: blockNumber,
        rpcUrl: SUBNET_B_RPC_URL
      },
      contracts: {
        warpReceiver: WARP_RECEIVER_ADDRESS,
        warpSender: WARP_SENDER_ADDRESS,
        requiredPaymentAmount: ethers.formatEther(requiredAmount)
      },
      config: {
        subnetAChainId: SUBNET_A_CHAIN_ID,
        subnetBChainId: SUBNET_B_CHAIN_ID
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

/**
 * GET /
 * API information
 */
app.get('/', (req, res) => {
  res.json({
    name: 'x402 Payment Server',
    version: '1.0.0',
    description: 'HTTP 402 Payment Required server for cross-chain Avalanche payments',
    endpoints: {
      'GET /resource': 'Request a protected resource (returns 402 with payment details)',
      'GET /verify/:paymentId': 'Verify a payment receipt',
      'POST /consume/:paymentId': 'Consume a payment and access the resource',
      'GET /health': 'Health check endpoint',
      'GET /': 'This information page'
    },
    documentation: 'See X402_SERVER.md for full documentation'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         x402 Payment Server - HTTP 402 Implementation     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📡 Configuration:');
  console.log(`   Subnet B RPC: ${SUBNET_B_RPC_URL}`);
  console.log(`   WarpReceiver: ${WARP_RECEIVER_ADDRESS}`);
  console.log(`   WarpSender:   ${WARP_SENDER_ADDRESS}`);
  console.log(`   Chain IDs:    ${SUBNET_A_CHAIN_ID} → ${SUBNET_B_CHAIN_ID}`);
  console.log('');
  console.log('📚 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/resource`);
  console.log(`   GET  http://localhost:${PORT}/verify/:paymentId`);
  console.log(`   POST http://localhost:${PORT}/consume/:paymentId`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log('');
  console.log('✨ Ready to accept payment requests!');
  console.log('');
});
