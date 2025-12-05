import { ethers } from 'ethers';
import { ChainConfig } from '../types/config';
import { TransactionResult } from '../types/network';
import { WarpSenderABI } from '../utils/contracts';
import { toBytes32 } from '../utils/encoding';
import { logger } from '../utils/logger';

/**
 * Client for interacting with WarpSender contract
 */
export class SenderClient {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private chain: ChainConfig, privateKey: string) {
    logger.debug(`Initializing SenderClient for chain ${chain.chainId}`);
    
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(chain.rpc);
    
    // Initialize wallet
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    this.wallet = new ethers.Wallet(formattedKey, this.provider);
    
    // Initialize contract
    if (!chain.sender) {
      throw new Error('Sender contract address is required');
    }
    this.contract = new ethers.Contract(chain.sender, WarpSenderABI, this.wallet);
    
    logger.info(`SenderClient initialized on chain ${chain.chainId}`);
  }

  /**
   * Send a payment and generate cross-chain receipt
   * @param paymentId Unique payment identifier (32-byte hex string)
   * @param amount Amount to pay in wei
   * @returns Transaction result
   */
  async sendPayment(paymentId: string, amount: bigint): Promise<TransactionResult> {
    logger.info(`Sending payment ${paymentId} for ${ethers.formatEther(amount)} tokens`);

    try {
      // Format payment ID to bytes32
      const paymentIdBytes32 = toBytes32(paymentId);
      
      // Send transaction with new signature (paymentId only, value in msg.value)
      // The contract now binds this to payer address and timestamp for security
      const tx = await this.contract.sendPayment(
        paymentIdBytes32,
        {
          value: amount,
          gasLimit: 500000
        }
      );

      logger.debug(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      logger.info(`Payment sent successfully in block ${receipt.blockNumber}`);

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status
      };
    } catch (error: any) {
      logger.error(`Failed to send payment: ${error.message}`);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Get wallet balance
   * @returns Balance in wei
   */
  async getBalance(): Promise<bigint> {
    const balance = await this.provider.getBalance(this.wallet.address);
    logger.debug(`Wallet balance: ${ethers.formatEther(balance)} tokens`);
    return balance;
  }

  /**
   * Get sender contract configuration
   * @returns Contract configuration
   */
  async getConfiguration(): Promise<{
    remoteBlockchainId: string;
    remoteReceiver: string;
    messenger: string;
    owner: string;
    paused: boolean;
    defaultGasLimit: bigint;
    messageGasLimit: bigint;
  }> {
    logger.debug('Fetching sender contract configuration');

    const [remoteBlockchainId, remoteReceiver, messenger, owner, paused, defaultGasLimit, messageGasLimit] = await Promise.all([
      this.contract.remoteBlockchainId(),
      this.contract.remoteReceiver(),
      this.contract.MESSENGER(),
      this.contract.owner(),
      this.contract.paused(),
      this.contract.defaultGasLimit(),
      this.contract.messageGasLimit()
    ]);

    return {
      remoteBlockchainId,
      remoteReceiver,
      messenger,
      owner,
      paused,
      defaultGasLimit,
      messageGasLimit
    };
  }
  
  /**
   * Get contract balance (for owner to check before withdrawing)
   * @returns Balance in wei
   */
  async getContractBalance(): Promise<bigint> {
    const balance = await this.contract.getBalance();
    logger.debug(`Contract balance: ${ethers.formatEther(balance)} tokens`);
    return balance;
  }

  /**
   * Get wallet address
   * @returns Wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get chain configuration
   * @returns Chain configuration
   */
  getChainConfig(): ChainConfig {
    return this.chain;
  }
}
