/**
 * Pre-configured network presets for Warp-402 SDK
 * Allows instant setup with pre-deployed contracts
 */
import type { Warp402Config } from '../types';
/**
 * Local development network preset
 * Uses locally deployed contracts on custom Avalanche subnets
 */
export declare const LOCAL_PRESET: Omit<Warp402Config, 'privateKey'>;
/**
 * Fuji testnet preset
 * Uses officially deployed contracts on Avalanche Fuji C-Chain
 *
 * ⚠️ For testing only - deploy your own contracts for production
 */
export declare const FUJI_PRESET: Omit<Warp402Config, 'privateKey'>;
/**
 * All available presets
 * Use these for instant setup without deploying contracts
 *
 * @example
 * ```typescript
 * import { Warp402, PRESETS } from 'avax-warp-pay';
 *
 * const warp = new Warp402({
 *   ...PRESETS.local,
 *   privateKey: process.env.PRIVATE_KEY
 * });
 * ```
 */
export declare const PRESETS: {
    /**
     * Local development network
     * For testing on local Avalanche network
     */
    readonly local: Omit<Warp402Config, "privateKey">;
    /**
     * Fuji testnet
     * For testing on public Avalanche testnet
     *
     * ⚠️ These contracts are for testing only
     * Deploy your own for production use
     */
    readonly fuji: Omit<Warp402Config, "privateKey">;
};
/**
 * Helper to create config with preset + private key
 *
 * @example
 * ```typescript
 * const config = withPrivateKey(PRESETS.fuji, process.env.PRIVATE_KEY!);
 * const warp = new Warp402(config);
 * ```
 */
export declare function withPrivateKey(preset: Omit<Warp402Config, 'privateKey'>, privateKey: string): Warp402Config;
/**
 * Pre-deployed contract addresses for reference
 */
export declare const DEPLOYED_CONTRACTS: {
    readonly local: {
        readonly sender: "0x52C84043CD9c865236f11d9Fc9F56aa003c1f922";
        readonly receiver: "0x52C84043CD9c865236f11d9Fc9F56aa003c1f922";
        readonly network: "Local Development Network";
        readonly explorer: null;
    };
    readonly fuji: {
        readonly sender: "0x52C84043CD9c865236f11d9Fc9F56aa003c1f922";
        readonly receiver: "0x52C84043CD9c865236f11d9Fc9F56aa003c1f922";
        readonly network: "Avalanche Fuji Testnet";
        readonly explorer: "https://testnet.snowtrace.io";
    };
};
//# sourceMappingURL=presets.d.ts.map