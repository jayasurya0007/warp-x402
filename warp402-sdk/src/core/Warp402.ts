import { Warp402Config } from '../types/config';
import { PaymentReceipt, PaymentVerification } from '../types/receipt';
import { TransactionResult } from '../types/network';
import { SenderClient } from './SenderClient';
import { ReceiverClient } from './ReceiverClient';
import { Config } from './Config';
import { generatePaymentId } from '../utils/uuid';
import { logger, LogLevel } from '../utils/logger';

/**
 * Main Warp402 SDK class
 * 
 * Provides a high-level interface for cross-chain payment receipts
 * using Avalanche Teleporter messaging.
 */
export class Warp402 {
  private sender: SenderClient;
  private receiver: ReceiverClient;

  /**
   * Create a new Warp402 instance
   * @param config SDK configuration
   */
  constructor(private config: Warp402Config) {
    // Validate configuration
    Config.validate(config);

    // Initialize clients
    this.sender = new SenderClient(config.senderChain, config.privateKey);
    this.receiver = new ReceiverClient(config.receiverChain);

    logger.info('Warp402 SDK initialized successfully');
  }

  /**
   * Send a payment and generate a unique payment ID
   * @param amount Amount to pay in wei
   * @param customPaymentId Optional custom payment ID (must be 32-byte hex)
   * @returns Payment ID
   */
  async pay(amount: bigint, customPaymentId?: string): Promise<string> {
    const paymentId = customPaymentId || generatePaymentId();
    
    logger.info(`Initiating payment: ${paymentId}`);
    
    await this.sender.sendPayment(paymentId, amount);
    
    return paymentId;
  }

  /**
   * Verify if a payment has been received on the receiver chain
   * @param paymentId Payment identifier
   * @returns true if payment is verified
   */
  async verify(paymentId: string): Promise<boolean> {
    logger.info(`Verifying payment: ${paymentId}`);
    return await this.receiver.hasPaid(paymentId);
  }

  /**
   * Get full payment verification details
   * @param paymentId Payment identifier
   * @returns Payment verification result with receipt details
   */
  async getVerification(paymentId: string): Promise<PaymentVerification> {
    logger.info(`Getting verification details for: ${paymentId}`);
    return await this.receiver.verify(paymentId);
  }

  /**
   * Get payment receipt details
   * @param paymentId Payment identifier
   * @returns Payment receipt or null if not found
   */
  async getReceipt(paymentId: string): Promise<PaymentReceipt | null> {
    logger.info(`Fetching receipt for: ${paymentId}`);
    return await this.receiver.getReceipt(paymentId);
  }

  /**
   * Consume a payment (mark as used, preventing replay)
   * @param paymentId Payment identifier
   * @returns Transaction result
   */
  async consume(paymentId: string): Promise<TransactionResult> {
    logger.info(`Consuming payment: ${paymentId}`);
    return await this.receiver.consume(paymentId, this.config.privateKey);
  }

  /**
   * Send payment and wait for cross-chain verification
   * @param amount Amount to pay in wei
   * @param timeout Maximum time to wait in milliseconds (default: 60000)
   * @param pollInterval Polling interval in milliseconds (default: 2000)
   * @returns Payment ID if verified, throws error if timeout
   */
  async payAndWait(
    amount: bigint, 
    timeout: number = 60000, 
    pollInterval: number = 2000
  ): Promise<string> {
    const paymentId = await this.pay(amount);
    
    logger.info(`Waiting for cross-chain verification (timeout: ${timeout}ms)`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const verified = await this.verify(paymentId);
      
      if (verified) {
        logger.info(`Payment verified after ${Date.now() - startTime}ms`);
        return paymentId;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Payment verification timeout after ${timeout}ms`);
  }

  /**
   * Get sender wallet balance
   * @returns Balance in wei
   */
  async getSenderBalance(): Promise<bigint> {
    return await this.sender.getBalance();
  }

  /**
   * Get sender wallet address
   * @returns Wallet address
   */
  getSenderAddress(): string {
    return this.sender.getAddress();
  }

  /**
   * Get sender contract configuration
   * @returns Sender configuration
   */
  async getSenderConfig() {
    return await this.sender.getConfiguration();
  }

  /**
   * Get receiver contract configuration
   * @returns Receiver configuration
   */
  async getReceiverConfig() {
    return await this.receiver.getConfiguration();
  }

  /**
   * Set SDK log level
   * @param level Log level
   */
  setLogLevel(level: LogLevel): void {
    logger.setLevel(level);
  }
}
