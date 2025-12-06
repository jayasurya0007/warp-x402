/**
 * High-level factory for quick setup of Warp-402 SDK
 * Combines deployment, configuration, and initialization in one call
 */

import { Warp402 } from '../core/Warp402';
import { ContractDeployer, DeploymentConfig, DeploymentResult } from './ContractDeployer';
import { logger } from '../utils/logger';
import type { Warp402Config } from '../types';

const DEFAULT_MESSENGER = '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf';

/**
 * Factory class for easy Warp-402 setup
 * Provides convenience methods for deployment and initialization
 */
export class Warp402Factory {
  
  /**
   * Quick setup: Deploy, configure, and initialize SDK in one call
   * Perfect for hackathons, demos, and rapid prototyping
   * 
   * @example
   * ```typescript
   * const warp = await Warp402Factory.quickSetup({
   *   privateKey: process.env.PRIVATE_KEY!,
   *   senderChain: {
   *     rpc: "https://api.avax-test.network/ext/bc/C/rpc",
   *     chainId: 43113,
   *     blockchainId: "0x7fc93d85..."
   *   },
   *   receiverChain: {
   *     rpc: "http://127.0.0.1:9650/ext/bc/.../rpc",
   *     chainId: 1002,
   *     blockchainId: "0xc063de20..."
   *   }
   * });
   * 
   * // Ready to use immediately!
   * await warp.pay(ethers.parseEther("0.1"));
   * ```
   */
  static async quickSetup(config: DeploymentConfig): Promise<Warp402> {
    logger.info('🎯 Warp-402 Quick Setup');
    logger.info('=' .repeat(60));
    logger.info('This will:');
    logger.info('  1. Deploy WarpSender on sender chain');
    logger.info('  2. Deploy WarpReceiver on receiver chain');
    logger.info('  3. Configure cross-chain handshake');
    logger.info('  4. Return ready-to-use SDK instance\n');
    
    // Deploy and configure contracts
    const result = await ContractDeployer.deployContracts(config);
    
    logger.info('🎉 Setup Complete!');
    logger.info('=' .repeat(60));
    logger.info(`Sender:   ${result.senderAddress}`);
    logger.info(`Receiver: ${result.receiverAddress}`);
    logger.info('=' .repeat(60) + '\n');
    
    // Create and return SDK instance
    return new Warp402({
      privateKey: config.privateKey,
      senderChain: {
        rpc: config.senderChain.rpc,
        chainId: config.senderChain.chainId,
        blockchainId: config.senderChain.blockchainId,
        messenger: config.senderChain.messenger || DEFAULT_MESSENGER,
        sender: result.senderAddress
      },
      receiverChain: {
        rpc: config.receiverChain.rpc,
        chainId: config.receiverChain.chainId,
        blockchainId: config.receiverChain.blockchainId,
        messenger: config.receiverChain.messenger || DEFAULT_MESSENGER,
        receiver: result.receiverAddress
      }
    });
  }
  
  /**
   * Deploy contracts only (without initializing SDK)
   * Useful when you want to deploy contracts and configure later
   * 
   * @example
   * ```typescript
   * const result = await Warp402Factory.deployOnly({
   *   privateKey: process.env.PRIVATE_KEY!,
   *   senderChain: { ... },
   *   receiverChain: { ... }
   * });
   * 
   * console.log('Sender:', result.senderAddress);
   * console.log('Receiver:', result.receiverAddress);
   * ```
   */
  static async deployOnly(config: DeploymentConfig): Promise<DeploymentResult> {
    logger.info('📦 Deploying contracts only (no SDK initialization)\n');
    return await ContractDeployer.deployContracts(config);
  }
  
  /**
   * Configure existing contracts (useful for already-deployed contracts)
   * 
   * @example
   * ```typescript
   * await Warp402Factory.configureOnly({
   *   privateKey: process.env.PRIVATE_KEY!,
   *   senderAddress: "0x...",
   *   receiverAddress: "0x...",
   *   senderChain: { rpc: "...", blockchainId: "0x..." },
   *   receiverChain: { rpc: "...", blockchainId: "0x..." }
   * });
   * ```
   */
  static async configureOnly(params: {
    privateKey: string;
    senderAddress: string;
    receiverAddress: string;
    senderChain: { rpc: string; blockchainId: string };
    receiverChain: { rpc: string; blockchainId: string };
  }): Promise<{ senderConfig: string; receiverConfig: string }> {
    logger.info('🔧 Configuring existing contracts\n');
    return await ContractDeployer.configureHandshake(params);
  }
  
  /**
   * Initialize SDK with existing contracts (no deployment)
   * Use this when you already have deployed and configured contracts
   * 
   * @example
   * ```typescript
   * const warp = Warp402Factory.fromExisting({
   *   privateKey: process.env.PRIVATE_KEY!,
   *   senderChain: {
   *     rpc: "...",
   *     chainId: 43113,
   *     blockchainId: "0x...",
   *     sender: "0xYOUR_SENDER_ADDRESS"
   *   },
   *   receiverChain: {
   *     rpc: "...",
   *     chainId: 1002,
   *     blockchainId: "0x...",
   *     receiver: "0xYOUR_RECEIVER_ADDRESS"
   *   }
   * });
   * ```
   */
  static fromExisting(config: Warp402Config): Warp402 {
    logger.info('🔌 Connecting to existing contracts\n');
    return new Warp402(config);
  }
  
  /**
   * Verify deployment and configuration
   * 
   * @example
   * ```typescript
   * const isValid = await Warp402Factory.verify({
   *   senderAddress: "0x...",
   *   receiverAddress: "0x...",
   *   senderRpc: "...",
   *   receiverRpc: "..."
   * });
   * 
   * if (isValid) {
   *   console.log('✅ Deployment verified');
   * }
   * ```
   */
  static async verify(params: {
    senderAddress: string;
    receiverAddress: string;
    senderRpc: string;
    receiverRpc: string;
  }): Promise<boolean> {
    logger.info('🔍 Verifying deployment...\n');
    return await ContractDeployer.verifyDeployment(params);
  }
}
