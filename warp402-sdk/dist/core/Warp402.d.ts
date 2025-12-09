import { Warp402Config } from '../types/config';
import { PaymentReceipt, PaymentVerification } from '../types/receipt';
import { TransactionResult } from '../types/network';
import { LogLevel } from '../utils/logger';
/**
 * Main Warp402 SDK class
 *
 * Provides a high-level interface for cross-chain payment receipts
 * using Avalanche Teleporter messaging.
 */
export declare class Warp402 {
    private config;
    private sender;
    private receiver;
    /**
     * Create a new Warp402 instance
     * @param config SDK configuration
     */
    constructor(config: Warp402Config);
    /**
     * Send a payment and generate a unique payment ID
     * @param amount Amount to pay in wei
     * @param customPaymentId Optional custom payment ID (must be 32-byte hex)
     * @returns Payment ID
     */
    pay(amount: bigint, customPaymentId?: string): Promise<string>;
    /**
     * Verify if a payment has been received on the receiver chain
     * @param paymentId Payment identifier
     * @returns true if payment is verified
     */
    verify(paymentId: string): Promise<boolean>;
    /**
     * Get full payment verification details
     * @param paymentId Payment identifier
     * @returns Payment verification result with receipt details
     */
    getVerification(paymentId: string): Promise<PaymentVerification>;
    /**
     * Get payment receipt details
     * @param paymentId Payment identifier
     * @returns Payment receipt or null if not found
     */
    getReceipt(paymentId: string): Promise<PaymentReceipt | null>;
    /**
     * Consume a payment (mark as used, preventing replay)
     * @param paymentId Payment identifier
     * @returns Transaction result
     */
    consume(paymentId: string): Promise<TransactionResult>;
    /**
     * Send payment and wait for cross-chain verification
     * @param amount Amount to pay in wei
     * @param timeout Maximum time to wait in milliseconds (default: 60000)
     * @param pollInterval Polling interval in milliseconds (default: 2000)
     * @returns Payment ID if verified, throws error if timeout
     */
    payAndWait(amount: bigint, timeout?: number, pollInterval?: number): Promise<string>;
    /**
     * Get sender wallet balance
     * @returns Balance in wei
     */
    getSenderBalance(): Promise<bigint>;
    /**
     * Get sender wallet address
     * @returns Wallet address
     */
    getSenderAddress(): string;
    /**
     * Get sender contract configuration
     * @returns Sender configuration
     */
    getSenderConfig(): Promise<{
        remoteBlockchainId: string;
        remoteReceiver: string;
        messenger: string;
        owner: string;
        paused: boolean;
        defaultGasLimit: bigint;
        messageGasLimit: bigint;
    }>;
    /**
     * Get receiver contract configuration
     * @returns Receiver configuration
     */
    getReceiverConfig(): Promise<{
        approvedSender: string;
        approvedSourceBlockchainId: string;
        messenger: string;
        owner: string;
        paused: boolean;
        requiredPaymentAmount: bigint;
        paymentExpiryTime: bigint;
    }>;
    /**
     * Set SDK log level
     * @param level Log level
     */
    setLogLevel(level: LogLevel): void;
}
//# sourceMappingURL=Warp402.d.ts.map