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

      // Receipt is now returned as a tuple struct
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
   * Check if payment is consumed
   * @param paymentId Payment identifier
   * @returns true if consumed
   */
  async isConsumed(paymentId: string): Promise<boolean> {
    logger.debug(`Checking if payment ${paymentId} is consumed`);
    try {
      const paymentIdBytes32 = toBytes32(paymentId);
      return await this.contract.isConsumed(paymentIdBytes32);
    } catch (error: any) {
      logger.error(`Failed to check consumed status: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Check if payment is expired
   * @param paymentId Payment identifier
   * @returns true if expired
   */
  async isExpired(paymentId: string): Promise<boolean> {
    logger.debug(`Checking if payment ${paymentId} is expired`);
    try {
      const paymentIdBytes32 = toBytes32(paymentId);
      return await this.contract.isExpired(paymentIdBytes32);
    } catch (error: any) {
      logger.error(`Failed to check expired status: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Check if payment is valid (exists, not consumed, not expired)
   * @param paymentId Payment identifier
   * @returns true if valid
   */
  async isValidPayment(paymentId: string): Promise<boolean> {
    logger.debug(`Checking if payment ${paymentId} is valid`);
    try {
      const paymentIdBytes32 = toBytes32(paymentId);
      return await this.contract.isValidPayment(paymentIdBytes32);
    } catch (error: any) {
      logger.error(`Failed to check payment validity: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify payment and get details
   * @param paymentId Payment identifier
   * @returns Payment verification result
   */
  async verify(paymentId: string): Promise<PaymentVerification> {
    const receipt = await this.getReceipt(paymentId);
    const isValid = await this.isValidPayment(paymentId);
    
    return {
      isValid: isValid && receipt !== null,
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
    approvedSender: string;
    approvedSourceBlockchainId: string;
    messenger: string;
    owner: string;
    paused: boolean;
    requiredPaymentAmount: bigint;
    paymentExpiryTime: bigint;
  }> {
    logger.debug('Fetching receiver contract configuration');

    const [approvedSender, approvedSourceBlockchainId, messenger, owner, paused, requiredPaymentAmount, paymentExpiryTime] = await Promise.all([
      this.contract.approvedSender(),
      this.contract.approvedSourceBlockchainId(),
      this.contract.MESSENGER(),
      this.contract.owner(),
      this.contract.paused(),
      this.contract.requiredPaymentAmount(),
      this.contract.paymentExpiryTime()
    ]);

    return {
      approvedSender,
      approvedSourceBlockchainId,
      messenger,
      owner,
      paused,
      requiredPaymentAmount,
      paymentExpiryTime
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
