"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentId = generatePaymentId;
exports.isValidPaymentId = isValidPaymentId;
exports.formatPaymentId = formatPaymentId;
const crypto_1 = require("crypto");
/**
 * Generate a unique payment ID
 * @returns 32-byte hex string (without 0x prefix)
 */
function generatePaymentId() {
    return (0, crypto_1.randomBytes)(32).toString('hex');
}
/**
 * Validate payment ID format
 * @param paymentId Payment ID to validate
 * @returns true if valid 32-byte hex string
 */
function isValidPaymentId(paymentId) {
    // Remove 0x prefix if present
    const cleaned = paymentId.startsWith('0x') ? paymentId.slice(2) : paymentId;
    // Check if it's a valid 32-byte (64 character) hex string
    return /^[0-9a-fA-F]{64}$/.test(cleaned);
}
/**
 * Format payment ID with 0x prefix
 * @param paymentId Payment ID (with or without 0x)
 * @returns Payment ID with 0x prefix
 */
function formatPaymentId(paymentId) {
    return paymentId.startsWith('0x') ? paymentId : `0x${paymentId}`;
}
//# sourceMappingURL=uuid.js.map