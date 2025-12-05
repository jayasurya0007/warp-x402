/**
 * Convert chain ID to blockchain ID (bytes32)
 * @param chainId Numeric chain ID
 * @returns Blockchain ID as bytes32 hex string
 */
export declare function encodeBlockchainId(chainId: number): string;
/**
 * Convert blockchain ID (bytes32) to chain ID
 * @param blockchainId Blockchain ID as bytes32 hex string
 * @returns Numeric chain ID
 */
export declare function decodeBlockchainId(blockchainId: string): number;
/**
 * Convert payment ID to bytes32 format
 * @param paymentId Payment ID (hex string)
 * @returns Payment ID as bytes32
 */
export declare function toBytes32(paymentId: string): string;
/**
 * Format wei amount to human-readable string
 * @param amount Amount in wei
 * @param decimals Number of decimals (default 18)
 * @returns Formatted amount
 */
export declare function formatAmount(amount: bigint, decimals?: number): string;
/**
 * Parse human-readable amount to wei
 * @param amount Amount as string
 * @param decimals Number of decimals (default 18)
 * @returns Amount in wei
 */
export declare function parseAmount(amount: string, decimals?: number): bigint;
