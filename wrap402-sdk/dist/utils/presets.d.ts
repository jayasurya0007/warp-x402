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
 * ✅ Production-ready contracts deployed and verified
 * ✅ Free to use for testing
 * ⚠️ For mainnet, deploy your own contracts for full control
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
        readonly sender: "0x0d45537c1DA893148dBB113407698E20CfA2eE56";
        readonly receiver: "0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f";
        readonly network: "Avalanche Fuji Testnet (C-Chain)";
        readonly explorer: "https://testnet.snowtrace.io";
        readonly senderUrl: "https://testnet.snowtrace.io/address/0x0d45537c1DA893148dBB113407698E20CfA2eE56";
        readonly receiverUrl: "https://testnet.snowtrace.io/address/0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f";
    };
};
//# sourceMappingURL=presets.d.ts.map