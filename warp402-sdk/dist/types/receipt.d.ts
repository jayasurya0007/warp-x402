/**
 * Payment receipt types
 */
export interface PaymentReceipt {
    /** Unique payment identifier */
    paymentId: string;
    /** Amount paid in wei */
    amount: bigint;
    /** Address that made the payment */
    payer: string;
    /** Timestamp when payment was made */
    timestamp: number;
    /** Whether the payment has been consumed */
    consumed: boolean;
}
export interface PaymentVerification {
    /** Whether the payment exists and is valid */
    isValid: boolean;
    /** Payment receipt details (if valid) */
    receipt?: PaymentReceipt;
}
//# sourceMappingURL=receipt.d.ts.map