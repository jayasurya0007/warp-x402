/**
 * Network and transaction types
 */
export interface TransactionResult {
    /** Transaction hash */
    hash: string;
    /** Block number where transaction was included */
    blockNumber: number;
    /** Gas used */
    gasUsed: bigint;
    /** Transaction status (1 = success, 0 = failure) */
    status: number;
}
export interface NetworkInfo {
    /** Chain ID */
    chainId: number;
    /** Blockchain ID */
    blockchainId: string;
    /** Current block number */
    blockNumber: number;
    /** Network is responding */
    isConnected: boolean;
}
//# sourceMappingURL=network.d.ts.map