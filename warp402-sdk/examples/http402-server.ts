/**
 * HTTP 402 Payment Required Server
 * 
 * Demonstrates integration of Warp-402 SDK with HTTP 402 paywall
 * This shows how to protect API endpoints with cross-chain payments
 */

import express, { Request, Response } from 'express';
import { Warp402 } from '../src';
import { ethers } from 'ethers';

// SDK Configuration
const warpConfig = {
  privateKey: process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE',
  
  senderChain: {
    rpc: process.env.SENDER_RPC || 'http://localhost:9650/ext/bc/subnetA/rpc',
    chainId: parseInt(process.env.SENDER_CHAIN_ID || '12345'),
    blockchainId: process.env.SENDER_BLOCKCHAIN_ID || '0x' + '1'.repeat(64),
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: process.env.SENDER_CONTRACT || '0xYourWarpSenderAddress'
  },
  
  receiverChain: {
    rpc: process.env.RECEIVER_RPC || 'http://localhost:9650/ext/bc/subnetB/rpc',
    chainId: parseInt(process.env.RECEIVER_CHAIN_ID || '54321'),
    blockchainId: process.env.RECEIVER_BLOCKCHAIN_ID || '0x' + '2'.repeat(64),
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: process.env.RECEIVER_CONTRACT || '0xYourWarpReceiverAddress'
  }
};

// Initialize SDK
const warp = new Warp402(warpConfig);

// API pricing
const PRICES = {
  '/api/data': ethers.parseEther('0.01'),      // 0.01 tokens
  '/api/premium': ethers.parseEther('0.1'),    // 0.1 tokens
  '/api/exclusive': ethers.parseEther('1.0')   // 1.0 tokens
};

// Create Express app
const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Payment-Id, Content-Type');
  next();
});

/**
 * Middleware to verify payment
 */
async function requirePayment(price: bigint) {
  return async (req: Request, res: Response, next: Function) => {
    const paymentId = req.headers['x-payment-id'] as string;

    // No payment ID provided
    if (!paymentId) {
      return res.status(402).json({
        error: 'Payment Required',
        message: 'Please include X-Payment-Id header',
        price: price.toString(),
        priceFormatted: ethers.formatEther(price) + ' tokens',
        instructions: {
          step1: 'Send payment on sender chain',
          step2: 'Wait for cross-chain verification',
          step3: 'Include payment ID in X-Payment-Id header'
        }
      });
    }

    try {
      // Verify payment exists
      console.log(`Verifying payment: ${paymentId}`);
      const isValid = await warp.verify(paymentId);

      if (!isValid) {
        return res.status(402).json({
          error: 'Payment Invalid',
          message: 'Payment not found or already consumed',
          paymentId
        });
      }

      // Get receipt and check amount
      const receipt = await warp.getReceipt(paymentId);
      if (!receipt) {
        return res.status(402).json({
          error: 'Payment Invalid',
          message: 'Receipt not found',
          paymentId
        });
      }

      if (receipt.amount < price) {
        return res.status(402).json({
          error: 'Insufficient Payment',
          message: 'Payment amount is less than required',
          required: ethers.formatEther(price),
          provided: ethers.formatEther(receipt.amount)
        });
      }

      // Consume payment
      console.log(`Consuming payment: ${paymentId}`);
      await warp.consume(paymentId);

      // Payment successful, continue to route handler
      next();

    } catch (error: any) {
      console.error('Payment verification error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify payment'
      });
    }
  };
}

// Public endpoint (no payment required)
app.get('/api/public', (req, res) => {
  res.json({
    message: 'This is a public endpoint',
    timestamp: new Date().toISOString(),
    paid: false
  });
});

// Protected endpoint - Basic data (0.01 tokens)
app.get('/api/data', requirePayment(PRICES['/api/data']), (req, res) => {
  res.json({
    message: 'Protected data endpoint',
    data: {
      value: Math.random() * 100,
      timestamp: new Date().toISOString(),
      source: 'cross-chain-verified'
    },
    paid: true
  });
});

// Protected endpoint - Premium data (0.1 tokens)
app.get('/api/premium', requirePayment(PRICES['/api/premium']), (req, res) => {
  res.json({
    message: 'Premium data endpoint',
    data: {
      premiumValue: Math.random() * 1000,
      analytics: {
        trend: 'up',
        confidence: 0.95
      },
      timestamp: new Date().toISOString()
    },
    paid: true
  });
});

// Protected endpoint - Exclusive data (1.0 tokens)
app.get('/api/exclusive', requirePayment(PRICES['/api/exclusive']), (req, res) => {
  res.json({
    message: 'Exclusive data endpoint',
    data: {
      exclusiveInsight: 'Top secret information',
      predictions: [
        { date: '2025-12-06', value: 123.45 },
        { date: '2025-12-07', value: 125.67 }
      ],
      metadata: {
        source: 'proprietary-model',
        confidence: 0.99
      }
    },
    paid: true
  });
});

// Pricing information endpoint
app.get('/api/pricing', (req, res) => {
  res.json({
    endpoints: [
      {
        path: '/api/public',
        price: '0',
        description: 'Public endpoint, no payment required'
      },
      {
        path: '/api/data',
        price: ethers.formatEther(PRICES['/api/data']),
        priceWei: PRICES['/api/data'].toString(),
        description: 'Basic data access'
      },
      {
        path: '/api/premium',
        price: ethers.formatEther(PRICES['/api/premium']),
        priceWei: PRICES['/api/premium'].toString(),
        description: 'Premium analytics and insights'
      },
      {
        path: '/api/exclusive',
        price: ethers.formatEther(PRICES['/api/exclusive']),
        priceWei: PRICES['/api/exclusive'].toString(),
        description: 'Exclusive proprietary data'
      }
    ],
    instructions: 'Include X-Payment-Id header with your payment ID'
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Just check if SDK is initialized
    res.json({
      status: 'healthy',
      sdk: 'warp402',
      version: '1.0.0',
      message: 'Server is running and accepting payments'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'SDK connection failed'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3402;

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('💰 HTTP 402 Payment Server with Warp-402 SDK');
  console.log('='.repeat(60));
  console.log();
  console.log(`🚀 Server running on port ${PORT}`);
  console.log();
  console.log('Endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/public`);
  console.log(`   GET  http://localhost:${PORT}/api/data (0.01 tokens)`);
  console.log(`   GET  http://localhost:${PORT}/api/premium (0.1 tokens)`);
  console.log(`   GET  http://localhost:${PORT}/api/exclusive (1.0 tokens)`);
  console.log(`   GET  http://localhost:${PORT}/api/pricing`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log();
  console.log('Payment flow:');
  console.log('   1. Send payment on sender chain using SDK');
  console.log('   2. Wait for Teleporter to relay to receiver chain');
  console.log('   3. Include payment ID in X-Payment-Id header');
  console.log('='.repeat(60));
});
