import { Warp402Config } from '../types/config';
/**
 * Configuration validation and management
 */
export declare class Config {
    /**
     * Validate Warp402 configuration
     * @param config Configuration to validate
     * @throws Error if configuration is invalid
     */
    static validate(config: Warp402Config): void;
    /**
     * Validate individual chain configuration
     * @param chain Chain configuration
     * @param name Chain name for error messages
     */
    private static validateChainConfig;
    /**
     * Validate Ethereum address format
     * @param address Address to validate
     * @returns true if valid
     */
    private static isValidAddress;
    /**
     * Format private key with 0x prefix
     * @param privateKey Private key (with or without 0x)
     * @returns Private key with 0x prefix
     */
    static formatPrivateKey(privateKey: string): string;
}
//# sourceMappingURL=Config.d.ts.map