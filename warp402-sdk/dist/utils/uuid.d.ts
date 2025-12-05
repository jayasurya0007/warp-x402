/**
 * Generate a unique payment ID
 * @returns 32-byte hex string (without 0x prefix)
 */
export declare function generatePaymentId(): string;
/**
 * Validate payment ID format
 * @param paymentId Payment ID to validate
 * @returns true if valid 32-byte hex string
 */
export declare function isValidPaymentId(paymentId: string): boolean;
/**
 * Format payment ID with 0x prefix
 * @param paymentId Payment ID (with or without 0x)
 * @returns Payment ID with 0x prefix
 */
export declare function formatPaymentId(paymentId: string): string;
