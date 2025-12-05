"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const logger_1 = require("../utils/logger");
/**
 * Configuration validation and management
 */
class Config {
    /**
     * Validate Warp402 configuration
     * @param config Configuration to validate
     * @throws Error if configuration is invalid
     */
    static validate(config) {
        // Validate private key
        if (!config.privateKey) {
            throw new Error('Private key is required');
        }
        const cleanKey = config.privateKey.startsWith('0x')
            ? config.privateKey.slice(2)
            : config.privateKey;
        if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
            throw new Error('Invalid private key format');
        }
        // Validate sender chain
        this.validateChainConfig(config.senderChain, 'sender');
        if (!config.senderChain.sender) {
            throw new Error('Sender chain must have sender contract address');
        }
        // Validate receiver chain
        this.validateChainConfig(config.receiverChain, 'receiver');
        if (!config.receiverChain.receiver) {
            throw new Error('Receiver chain must have receiver contract address');
        }
        // Validate chains are different
        if (config.senderChain.blockchainId === config.receiverChain.blockchainId) {
            logger_1.logger.warn('Sender and receiver chains have the same blockchain ID. Cross-chain messaging may not work.');
        }
        logger_1.logger.info('Configuration validated successfully');
    }
    /**
     * Validate individual chain configuration
     * @param chain Chain configuration
     * @param name Chain name for error messages
     */
    static validateChainConfig(chain, name) {
        if (!chain.rpc) {
            throw new Error(`${name} chain RPC is required`);
        }
        if (!chain.rpc.startsWith('http://') && !chain.rpc.startsWith('https://')) {
            throw new Error(`${name} chain RPC must be a valid HTTP(S) URL`);
        }
        if (!chain.chainId || chain.chainId <= 0) {
            throw new Error(`${name} chain ID must be a positive number`);
        }
        if (!chain.blockchainId) {
            throw new Error(`${name} chain blockchain ID is required`);
        }
        if (!chain.messenger) {
            throw new Error(`${name} chain Teleporter messenger address is required`);
        }
        if (!this.isValidAddress(chain.messenger)) {
            throw new Error(`${name} chain messenger address is invalid`);
        }
    }
    /**
     * Validate Ethereum address format
     * @param address Address to validate
     * @returns true if valid
     */
    static isValidAddress(address) {
        return /^0x[0-9a-fA-F]{40}$/.test(address);
    }
    /**
     * Format private key with 0x prefix
     * @param privateKey Private key (with or without 0x)
     * @returns Private key with 0x prefix
     */
    static formatPrivateKey(privateKey) {
        return privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    }
}
exports.Config = Config;
