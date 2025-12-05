import { ChainConfig } from '../types/config';
import { PaymentReceipt, PaymentVerification } from '../types/receipt';
import { TransactionResult } from '../types/network';
/**
 * Client for interacting with WarpReceiver contract
 */
export declare class ReceiverClient {
    private chain;
    private provider;
    private contract;
    constructor(chain: ChainConfig);
    /**
     * Check if a payment has been received and verified
     * @param paymentId Payment identifier
     * @returns true if payment exists and is valid
     */
    hasPaid(paymentId: string): Promise<boolean>;
    /**
     * Get full payment receipt details
     * @param paymentId Payment identifier
     * @returns Payment receipt or null if not found
     */
    getReceipt(paymentId: string): Promise<PaymentReceipt | null>;
    /**
     * Check if payment is consumed
     * @param paymentId Payment identifier
     * @returns true if consumed
     */
    isConsumed(paymentId: string): Promise<boolean>;
    /**
     * Check if payment is expired
     * @param paymentId Payment identifier
     * @returns true if expired
     */
    isExpired(paymentId: string): Promise<boolean>;
    /**
     * Check if payment is valid (exists, not consumed, not expired)
     * @param paymentId Payment identifier
     * @returns true if valid
     */
    isValidPayment(paymentId: string): Promise<boolean>;
    /**
     * Verify payment and get details
     * @param paymentId Payment identifier
     * @returns Payment verification result
     */
    verify(paymentId: string): Promise<PaymentVerification>;
    /**
     * Consume a payment (mark as used)
     * @param paymentId Payment identifier
     * @param privateKey Private key for signing transaction
     * @returns Transaction result
     */
    consume(paymentId: string, privateKey: string): Promise<TransactionResult>;
    /**
     * Get receiver contract configuration
     * @returns Contract configuration
     */
    getConfiguration(): Promise<{
        approvedSender: string;
        approvedSourceBlockchainId: string;
        messenger: string;
        owner: string;
        paused: boolean;
        requiredPaymentAmount: bigint;
        paymentExpiryTime: bigint;
    }>;
    /**
     * Get chain configuration
     * @returns Chain configuration
     */
    getChainConfig(): ChainConfig;
}
//# sourceMappingURL=ReceiverClient.d.ts.map