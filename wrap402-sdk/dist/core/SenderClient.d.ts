import { ChainConfig } from '../types/config';
import { TransactionResult } from '../types/network';
/**
 * Client for interacting with WarpSender contract
 */
export declare class SenderClient {
    private chain;
    private provider;
    private wallet;
    private contract;
    constructor(chain: ChainConfig, privateKey: string);
    /**
     * Send a payment and generate cross-chain receipt
     * @param paymentId Unique payment identifier (32-byte hex string)
     * @param amount Amount to pay in wei
     * @returns Transaction result
     */
    sendPayment(paymentId: string, amount: bigint): Promise<TransactionResult>;
    /**
     * Get wallet balance
     * @returns Balance in wei
     */
    getBalance(): Promise<bigint>;
    /**
     * Get sender contract configuration
     * @returns Contract configuration
     */
    getConfiguration(): Promise<{
        remoteBlockchainId: string;
        remoteReceiver: string;
        messenger: string;
        owner: string;
        paused: boolean;
        defaultGasLimit: bigint;
        messageGasLimit: bigint;
    }>;
    /**
     * Get contract balance (for owner to check before withdrawing)
     * @returns Balance in wei
     */
    getContractBalance(): Promise<bigint>;
    /**
     * Get wallet address
     * @returns Wallet address
     */
    getAddress(): string;
    /**
     * Get chain configuration
     * @returns Chain configuration
     */
    getChainConfig(): ChainConfig;
}
//# sourceMappingURL=SenderClient.d.ts.map