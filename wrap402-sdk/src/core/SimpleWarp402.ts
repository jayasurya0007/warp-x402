/**
 * SimpleWarp402 - Ultra-simple wrapper around Warp402
 * 
 * Makes the SDK as easy as possible for beginners.
 * Advanced users can still use the full Warp402 class.
 */

import { Warp402 } from './Warp402';
import { PRESETS } from '../utils/presets';
import { ethers } from 'ethers';

export interface SimpleConfig {
  /** Private key (required) */
  privateKey: string;
  /** Network preset: 'local' | 'fuji' | 'mainnet' */
  network?: 'local' | 'fuji' | 'mainnet';
  /** Auto-wait for cross-chain messages (default: true) */
  autoWait?: boolean;
  /** Wait time in seconds (default: 15) */
  waitTime?: number;
}

export interface PaymentResult {
  /** Payment ID */
  id: string;
  /** Transaction hash */
  txHash: string;
  /** Amount paid (in AVAX as string) */
  amount: string;
  /** Verification result (if autoWait is true) */
  verified?: boolean;
}

/**
 * SimpleWarp402 - The easiest way to use Warp-402
 * 
 * @example
 * ```typescript
 * const warp = new SimpleWarp402({ privateKey: "0x..." });
 * 
 * // Send 0.1 AVAX
 * const payment = await warp.pay("0.1");
 * console.log(payment.verified); // true (auto-verified!)
 * ```
 */
export class SimpleWarp402 {
  private warp: Warp402;
  private autoWait: boolean;
  private waitTime: number;

  constructor(config: SimpleConfig) {
    const network = config.network || 'fuji';
    const preset = PRESETS[network];
    
    if (!preset) {
      throw new Error(`Unknown network: ${network}. Use 'local', 'fuji', or 'mainnet'`);
    }

    this.warp = new Warp402({
      ...preset,
      privateKey: config.privateKey
    });

    this.autoWait = config.autoWait ?? true;
    this.waitTime = config.waitTime || 15;
  }

  /**
   * Send a payment (amount in AVAX as string)
   * 
   * @example
   * ```typescript
   * const payment = await warp.pay("0.1"); // 0.1 AVAX
   * console.log(payment.id);
   * console.log(payment.verified); // true if autoWait
   * ```
   */
  async pay(amountInAVAX: string): Promise<PaymentResult> {
    // Convert string to wei
    const amountWei = ethers.parseEther(amountInAVAX);
    
    // Send payment
    const paymentId = await this.warp.pay(amountWei);
    
    const result: PaymentResult = {
      id: paymentId,
      txHash: paymentId, // Could track actual tx hash
      amount: amountInAVAX
    };

    // Auto-wait for cross-chain verification
    if (this.autoWait) {
      console.log(`⏳ Waiting ${this.waitTime}s for cross-chain delivery...`);
      await this.sleep(this.waitTime * 1000);
      
      const receipt = await this.warp.verify(paymentId);
      result.verified = receipt.paid;
      
      if (result.verified) {
        console.log('✅ Payment verified on destination chain!');
      } else {
        console.log('⚠️ Payment not verified yet. Try verifying again later.');
      }
    }

    return result;
  }

  /**
   * Verify a payment by ID
   * 
   * @example
   * ```typescript
   * const isValid = await warp.isValid(paymentId);
   * ```
   */
  async isValid(paymentId: string): Promise<boolean> {
    const receipt = await this.warp.verify(paymentId);
    return receipt.paid && !receipt.consumed;
  }

  /**
   * Use/consume a payment
   * 
   * @example
   * ```typescript
   * await warp.use(paymentId);
   * ```
   */
  async use(paymentId: string): Promise<void> {
    await this.warp.consume(paymentId);
    console.log('✅ Payment consumed');
  }

  /**
   * Check payment status with friendly output
   * 
   * @example
   * ```typescript
   * const status = await warp.status(paymentId);
   * console.log(status); // "valid" | "consumed" | "expired" | "not-found"
   * ```
   */
  async status(paymentId: string): Promise<string> {
    try {
      const receipt = await this.warp.verify(paymentId);
      
      if (!receipt.paid) return 'not-found';
      if (receipt.expired) return 'expired';
      if (receipt.consumed) return 'consumed';
      return 'valid';
    } catch (error) {
      return 'not-found';
    }
  }

  /**
   * Get full payment details
   */
  async details(paymentId: string) {
    const receipt = await this.warp.verify(paymentId);
    return {
      id: paymentId,
      paid: receipt.paid,
      amount: ethers.formatEther(receipt.amount),
      sender: receipt.sender,
      consumed: receipt.consumed,
      expired: receipt.expired,
      timestamp: new Date(Number(receipt.timestamp) * 1000).toLocaleString()
    };
  }

  /**
   * Access the underlying Warp402 instance for advanced usage
   */
  get advanced(): Warp402 {
    return this.warp;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Quick helper function for one-off payments
 * 
 * @example
 * ```typescript
 * import { quickPay } from 'avax-warp-pay';
 * 
 * const payment = await quickPay({
 *   privateKey: "0x...",
 *   amount: "0.1"
 * });
 * 
 * console.log(payment.verified); // true
 * ```
 */
export async function quickPay(options: {
  privateKey: string;
  amount: string;
  network?: 'local' | 'fuji' | 'mainnet';
}): Promise<PaymentResult> {
  const warp = new SimpleWarp402({
    privateKey: options.privateKey,
    network: options.network
  });
  
  return await warp.pay(options.amount);
}
