/**
 * High-level factory for quick setup of Warp-402 SDK
 * Combines deployment, configuration, and initialization in one call
 */
import { Warp402 } from '../core/Warp402';
import { DeploymentConfig, DeploymentResult } from './ContractDeployer';
import type { Warp402Config } from '../types';
/**
 * Factory class for easy Warp-402 setup
 * Provides convenience methods for deployment and initialization
 */
export declare class Warp402Factory {
    /**
     * Quick setup: Deploy, configure, and initialize SDK in one call
     * Perfect for hackathons, demos, and rapid prototyping
     *
     * @example
     * ```typescript
     * const warp = await Warp402Factory.quickSetup({
     *   privateKey: process.env.PRIVATE_KEY!,
     *   senderChain: {
     *     rpc: "https://api.avax-test.network/ext/bc/C/rpc",
     *     chainId: 43113,
     *     blockchainId: "0x7fc93d85..."
     *   },
     *   receiverChain: {
     *     rpc: "http://127.0.0.1:9650/ext/bc/.../rpc",
     *     chainId: 1002,
     *     blockchainId: "0xc063de20..."
     *   }
     * });
     *
     * // Ready to use immediately!
     * await warp.pay(ethers.parseEther("0.1"));
     * ```
     */
    static quickSetup(config: DeploymentConfig): Promise<Warp402>;
    /**
     * Deploy contracts only (without initializing SDK)
     * Useful when you want to deploy contracts and configure later
     *
     * @example
     * ```typescript
     * const result = await Warp402Factory.deployOnly({
     *   privateKey: process.env.PRIVATE_KEY!,
     *   senderChain: { ... },
     *   receiverChain: { ... }
     * });
     *
     * console.log('Sender:', result.senderAddress);
     * console.log('Receiver:', result.receiverAddress);
     * ```
     */
    static deployOnly(config: DeploymentConfig): Promise<DeploymentResult>;
    /**
     * Configure existing contracts (useful for already-deployed contracts)
     *
     * @example
     * ```typescript
     * await Warp402Factory.configureOnly({
     *   privateKey: process.env.PRIVATE_KEY!,
     *   senderAddress: "0x...",
     *   receiverAddress: "0x...",
     *   senderChain: { rpc: "...", blockchainId: "0x..." },
     *   receiverChain: { rpc: "...", blockchainId: "0x..." }
     * });
     * ```
     */
    static configureOnly(params: {
        privateKey: string;
        senderAddress: string;
        receiverAddress: string;
        senderChain: {
            rpc: string;
            blockchainId: string;
        };
        receiverChain: {
            rpc: string;
            blockchainId: string;
        };
    }): Promise<{
        senderConfig: string;
        receiverConfig: string;
    }>;
    /**
     * Initialize SDK with existing contracts (no deployment)
     * Use this when you already have deployed and configured contracts
     *
     * @example
     * ```typescript
     * const warp = Warp402Factory.fromExisting({
     *   privateKey: process.env.PRIVATE_KEY!,
     *   senderChain: {
     *     rpc: "...",
     *     chainId: 43113,
     *     blockchainId: "0x...",
     *     sender: "0xYOUR_SENDER_ADDRESS"
     *   },
     *   receiverChain: {
     *     rpc: "...",
     *     chainId: 1002,
     *     blockchainId: "0x...",
     *     receiver: "0xYOUR_RECEIVER_ADDRESS"
     *   }
     * });
     * ```
     */
    static fromExisting(config: Warp402Config): Warp402;
    /**
     * Verify deployment and configuration
     *
     * @example
     * ```typescript
     * const isValid = await Warp402Factory.verify({
     *   senderAddress: "0x...",
     *   receiverAddress: "0x...",
     *   senderRpc: "...",
     *   receiverRpc: "..."
     * });
     *
     * if (isValid) {
     *   console.log('✅ Deployment verified');
     * }
     * ```
     */
    static verify(params: {
        senderAddress: string;
        receiverAddress: string;
        senderRpc: string;
        receiverRpc: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=Warp402Factory.d.ts.map