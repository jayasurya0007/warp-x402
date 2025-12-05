"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBlockchainId = encodeBlockchainId;
exports.decodeBlockchainId = decodeBlockchainId;
exports.toBytes32 = toBytes32;
exports.formatAmount = formatAmount;
exports.parseAmount = parseAmount;
const ethers_1 = require("ethers");
/**
 * Convert chain ID to blockchain ID (bytes32)
 * @param chainId Numeric chain ID
 * @returns Blockchain ID as bytes32 hex string
 */
function encodeBlockchainId(chainId) {
    return ethers_1.ethers.zeroPadValue(ethers_1.ethers.toBeHex(chainId), 32);
}
/**
 * Convert blockchain ID (bytes32) to chain ID
 * @param blockchainId Blockchain ID as bytes32 hex string
 * @returns Numeric chain ID
 */
function decodeBlockchainId(blockchainId) {
    return parseInt(blockchainId, 16);
}
/**
 * Convert payment ID to bytes32 format
 * @param paymentId Payment ID (hex string)
 * @returns Payment ID as bytes32
 */
function toBytes32(paymentId) {
    const cleaned = paymentId.startsWith('0x') ? paymentId.slice(2) : paymentId;
    return '0x' + cleaned.padStart(64, '0');
}
/**
 * Format wei amount to human-readable string
 * @param amount Amount in wei
 * @param decimals Number of decimals (default 18)
 * @returns Formatted amount
 */
function formatAmount(amount, decimals = 18) {
    return ethers_1.ethers.formatUnits(amount, decimals);
}
/**
 * Parse human-readable amount to wei
 * @param amount Amount as string
 * @param decimals Number of decimals (default 18)
 * @returns Amount in wei
 */
function parseAmount(amount, decimals = 18) {
    return ethers_1.ethers.parseUnits(amount, decimals);
}
