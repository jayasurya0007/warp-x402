import { ethers } from 'ethers';
import { ChainConfig } from '../types/config';
import { PaymentReceipt, PaymentVerification } from '../types/receipt';
import { TransactionResult } from '../types/network';
import { WarpReceiverABI } from '../utils/contracts';
import { toBytes32 } from '../utils/encoding';
import { logger } from '../utils/logger';

/**
 * Client for interacting with WarpReceiver contract
 */
export class ReceiverClient {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(private chain: ChainConfig) {
    logger.debug(`Initializing ReceiverClient for chain ${chain.chainId}`);
    
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(chain.rpc);
    
    // Initialize contract
    if (!chain.receiver) {
      throw new Error('Receiver contract address is required');
    }
    this.contract = new ethers.Contract(chain.receiver, WarpReceiverABI, this.provider);
    
    logger.info(`ReceiverClient initialized on chain ${chain.chainId}`);
  }

  /**
   * Check if a payment has been received and verified
   * @param paymentId Payment identifier
   * @returns true if payment exists and is valid
   */
  async hasPaid(paymentId: string): Promise<boolean> {
    logger.debug(`Checking payment status for ${paymentId}`);

    try {
      const paymentIdBytes32 = toBytes32(paymentId);
      const hasPaid = await this.contract.hasPaid(paymentIdBytes32);
      
      logger.info(`Payment ${paymentId} status: ${hasPaid ? 'PAID' : 'NOT FOUND'}`);
      return hasPaid;
    } catch (error: any) {
      logger.error(`Failed to check payment status: ${error.message}`);
      return false;
    }
  }

  /**
   * Get full payment receipt details
   * @param paymentId Payment identifier
   * @returns Payment receipt or null if not found
   */
  async getReceipt(paymentId: string): Promise<PaymentReceipt | null> {
    logger.debug(`Fetching receipt for payment ${paymentId}`);

    try {
      const paymentIdBytes32 = toBytes32(paymentId);
      const receipt = await this.contract.getReceipt(paymentIdBytes32);

      // Check if receipt exists (payer is not zero address)
      if (receipt.payer === ethers.ZeroAddress) {
        logger.debug(`Receipt not found for payment ${paymentId}`);
        return null;
      }

      const paymentReceipt: PaymentReceipt = {
        paymentId,
        amount: receipt.amount,
        payer: receipt.payer,
        timestamp: Number(receipt.timestamp),
        consumed: receipt.consumed
      };

      logger.info(`Receipt found: ${ethers.formatEther(paymentReceipt.amount)} tokens from ${paymentReceipt.payer}`);
      return paymentReceipt;
    } catch (error: any) {
      logger.error(`Failed to fetch receipt: ${error.message}`);
      return null;
    }
  }

  /**
   * Verify payment and get details
   * @param paymentId Payment identifier
   * @returns Payment verification result
   */
  async verify(paymentId: string): Promise<PaymentVerification> {
    const receipt = await this.getReceipt(paymentId);
    
    return {
      isValid: receipt !== null && !receipt.consumed,
      receipt: receipt || undefined
    };
  }

  /**
   * Consume a payment (mark as used)
   * @param paymentId Payment identifier
   * @param privateKey Private key for signing transaction
   * @returns Transaction result
   */
  async consume(paymentId: string, privateKey: string): Promise<TransactionResult> {
    logger.info(`Consuming payment ${paymentId}`);

    try {
      // Create signer
      const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
      const signer = new ethers.Wallet(formattedKey, this.provider);
      
      // Connect contract to signer
      const contractWithSigner = this.contract.connect(signer) as ethers.Contract;
      
      // Format payment ID
      const paymentIdBytes32 = toBytes32(paymentId);
      
      // Send transaction
      const tx = await contractWithSigner.consumePayment(paymentIdBytes32, {
        gasLimit: 200000
      });

      logger.debug(`Consumption transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      logger.info(`Payment consumed successfully in block ${receipt.blockNumber}`);

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status
      };
    } catch (error: any) {
      logger.error(`Failed to consume payment: ${error.message}`);
      throw new Error(`Consumption failed: ${error.message}`);
    }
  }

  /**
   * Get receiver contract configuration
   * @returns Contract configuration
   */
  async getConfiguration(): Promise<{
    senderChainId: string;
    senderAddress: string;
    teleporterMessenger: string;
  }> {
    logger.debug('Fetching receiver contract configuration');

    const [senderChainId, senderAddress, teleporterMessenger] = await Promise.all([
      this.contract.senderChainId(),
      this.contract.senderAddress(),
      this.contract.teleporterMessenger()
    ]);

    return {
      senderChainId,
      senderAddress,
      teleporterMessenger
    };
  }

  /**
   * Get chain configuration
   * @returns Chain configuration
   */
  getChainConfig(): ChainConfig {
    return this.chain;
  }
}
