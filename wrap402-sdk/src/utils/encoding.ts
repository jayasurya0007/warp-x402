import { ethers } from 'ethers';

/**
 * Convert chain ID to blockchain ID (bytes32)
 * @param chainId Numeric chain ID
 * @returns Blockchain ID as bytes32 hex string
 */
export function encodeBlockchainId(chainId: number): string {
  return ethers.zeroPadValue(ethers.toBeHex(chainId), 32);
}

/**
 * Convert blockchain ID (bytes32) to chain ID
 * @param blockchainId Blockchain ID as bytes32 hex string
 * @returns Numeric chain ID
 */
export function decodeBlockchainId(blockchainId: string): number {
  return parseInt(blockchainId, 16);
}

/**
 * Convert payment ID to bytes32 format
 * @param paymentId Payment ID (hex string)
 * @returns Payment ID as bytes32
 */
export function toBytes32(paymentId: string): string {
  const cleaned = paymentId.startsWith('0x') ? paymentId.slice(2) : paymentId;
  return '0x' + cleaned.padStart(64, '0');
}

/**
 * Format wei amount to human-readable string
 * @param amount Amount in wei
 * @param decimals Number of decimals (default 18)
 * @returns Formatted amount
 */
export function formatAmount(amount: bigint, decimals: number = 18): string {
  return ethers.formatUnits(amount, decimals);
}

/**
 * Parse human-readable amount to wei
 * @param amount Amount as string
 * @param decimals Number of decimals (default 18)
 * @returns Amount in wei
 */
export function parseAmount(amount: string, decimals: number = 18): bigint {
  return ethers.parseUnits(amount, decimals);
}
