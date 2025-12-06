/**
 * Automated contract deployment and configuration
 * Simplifies the deployment process for developers
 */

import { ethers } from 'ethers';
import { WarpSenderABI, WarpReceiverABI } from '../utils/contracts';
import { WARPSENDER_BYTECODE, WARPRECEIVER_BYTECODE } from './bytecode';
import { logger } from '../utils/logger';

export interface DeploymentConfig {
  privateKey: string;
  senderChain: {
    rpc: string;
    chainId: number;
    blockchainId: string;
    messenger?: string;
  };
  receiverChain: {
    rpc: string;
    chainId: number;
    blockchainId: string;
    messenger?: string;
  };
}

export interface DeploymentResult {
  senderAddress: string;
  receiverAddress: string;
  senderTxHash: string;
  receiverTxHash: string;
  configTxHashes: {
    senderConfig: string;
    receiverConfig: string;
  };
}

const DEFAULT_MESSENGER = '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf';

/**
 * Contract deployer class
 * Handles automated deployment and configuration of WarpSender and WarpReceiver
 */
export class ContractDeployer {
  
  /**
   * Deploy WarpSender and WarpReceiver contracts
   * @param config Deployment configuration
   * @returns Deployed contract addresses and transaction hashes
   */
  static async deployContracts(config: DeploymentConfig): Promise<DeploymentResult> {
    logger.info('🚀 Starting contract deployment...\n');
    
    const senderMessenger = config.senderChain.messenger || DEFAULT_MESSENGER;
    const receiverMessenger = config.receiverChain.messenger || DEFAULT_MESSENGER;
    
    // Deploy WarpSender
    logger.info('📤 Deploying WarpSender...');
    const { address: senderAddress, txHash: senderTxHash } = 
      await this.deployWarpSender(
        config.privateKey,
        config.senderChain.rpc,
        senderMessenger
      );
    logger.info(`✅ WarpSender deployed at: ${senderAddress}`);
    logger.info(`   Transaction: ${senderTxHash}\n`);
    
    // Deploy WarpReceiver
    logger.info('📥 Deploying WarpReceiver...');
    const { address: receiverAddress, txHash: receiverTxHash } = 
      await this.deployWarpReceiver(
        config.privateKey,
        config.receiverChain.rpc,
        receiverMessenger
      );
    logger.info(`✅ WarpReceiver deployed at: ${receiverAddress}`);
    logger.info(`   Transaction: ${receiverTxHash}\n`);
    
    // Configure handshake
    logger.info('🔗 Configuring cross-chain handshake...');
    const configTxHashes = await this.configureHandshake({
      privateKey: config.privateKey,
      senderAddress,
      receiverAddress,
      senderChain: config.senderChain,
      receiverChain: config.receiverChain
    });
    logger.info(`✅ Configuration complete\n`);
    
    return {
      senderAddress,
      receiverAddress,
      senderTxHash,
      receiverTxHash,
      configTxHashes
    };
  }
  
  /**
   * Deploy WarpSender contract
   */
  private static async deployWarpSender(
    privateKey: string,
    rpc: string,
    messengerAddress: string
  ): Promise<{ address: string; txHash: string }> {
    
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Create contract factory
    const factory = new ethers.ContractFactory(
      WarpSenderABI,
      WARPSENDER_BYTECODE,
      wallet
    );
    
    // Deploy contract
    const contract = await factory.deploy(messengerAddress);
    const deployTx = contract.deploymentTransaction();
    
    if (!deployTx) {
      throw new Error('Deployment transaction not found');
    }
    
    // Wait for deployment
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    return {
      address,
      txHash: deployTx.hash
    };
  }
  
  /**
   * Deploy WarpReceiver contract
   */
  private static async deployWarpReceiver(
    privateKey: string,
    rpc: string,
    messengerAddress: string
  ): Promise<{ address: string; txHash: string }> {
    
    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Create contract factory
    const factory = new ethers.ContractFactory(
      WarpReceiverABI,
      WARPRECEIVER_BYTECODE,
      wallet
    );
    
    // Deploy contract
    const contract = await factory.deploy(messengerAddress);
    const deployTx = contract.deploymentTransaction();
    
    if (!deployTx) {
      throw new Error('Deployment transaction not found');
    }
    
    // Wait for deployment
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    return {
      address,
      txHash: deployTx.hash
    };
  }
  
  /**
   * Configure cross-chain handshake between contracts
   */
  static async configureHandshake(params: {
    privateKey: string;
    senderAddress: string;
    receiverAddress: string;
    senderChain: { rpc: string; blockchainId: string };
    receiverChain: { rpc: string; blockchainId: string };
  }): Promise<{ senderConfig: string; receiverConfig: string }> {
    
    // Configure sender -> receiver
    logger.info('  → Setting remote receiver on sender...');
    const senderProvider = new ethers.JsonRpcProvider(params.senderChain.rpc);
    const senderWallet = new ethers.Wallet(params.privateKey, senderProvider);
    const senderContract = new ethers.Contract(
      params.senderAddress,
      WarpSenderABI,
      senderWallet
    );
    
    const tx1 = await senderContract.setRemoteReceiver(
      params.receiverChain.blockchainId,
      params.receiverAddress
    );
    await tx1.wait();
    logger.info(`    ✓ Sender configured (${tx1.hash})`);
    
    // Configure receiver -> sender
    logger.info('  → Setting approved sender on receiver...');
    const receiverProvider = new ethers.JsonRpcProvider(params.receiverChain.rpc);
    const receiverWallet = new ethers.Wallet(params.privateKey, receiverProvider);
    const receiverContract = new ethers.Contract(
      params.receiverAddress,
      WarpReceiverABI,
      receiverWallet
    );
    
    const tx2 = await receiverContract.setApprovedSender(
      params.senderChain.blockchainId,
      params.senderAddress
    );
    await tx2.wait();
    logger.info(`    ✓ Receiver configured (${tx2.hash})`);
    
    return {
      senderConfig: tx1.hash,
      receiverConfig: tx2.hash
    };
  }
  
  /**
   * Verify deployment by checking contract configuration
   */
  static async verifyDeployment(params: {
    senderAddress: string;
    receiverAddress: string;
    senderRpc: string;
    receiverRpc: string;
  }): Promise<boolean> {
    
    try {
      const senderProvider = new ethers.JsonRpcProvider(params.senderRpc);
      const senderContract = new ethers.Contract(
        params.senderAddress,
        WarpSenderABI,
        senderProvider
      );
      
      const receiverProvider = new ethers.JsonRpcProvider(params.receiverRpc);
      const receiverContract = new ethers.Contract(
        params.receiverAddress,
        WarpReceiverABI,
        receiverProvider
      );
      
      // Check sender configuration
      const remoteReceiver = await senderContract.remoteReceiver();
      if (remoteReceiver.toLowerCase() !== params.receiverAddress.toLowerCase()) {
        logger.error('❌ Sender not configured correctly');
        return false;
      }
      
      // Check receiver configuration
      const approvedSender = await receiverContract.approvedSender();
      if (approvedSender.toLowerCase() !== params.senderAddress.toLowerCase()) {
        logger.error('❌ Receiver not configured correctly');
        return false;
      }
      
      logger.info('✅ Deployment verified successfully');
      return true;
      
    } catch (error) {
      logger.error(`❌ Verification failed: ${error}`);
      return false;
    }
  }
}
