"use strict";
/**
 * High-level factory for quick setup of Warp-402 SDK
 * Combines deployment, configuration, and initialization in one call
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warp402Factory = void 0;
const Warp402_1 = require("../core/Warp402");
const ContractDeployer_1 = require("./ContractDeployer");
const logger_1 = require("../utils/logger");
const DEFAULT_MESSENGER = '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf';
/**
 * Factory class for easy Warp-402 setup
 * Provides convenience methods for deployment and initialization
 */
class Warp402Factory {
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
    static async quickSetup(config) {
        logger_1.logger.info('🎯 Warp-402 Quick Setup');
        logger_1.logger.info('='.repeat(60));
        logger_1.logger.info('This will:');
        logger_1.logger.info('  1. Deploy WarpSender on sender chain');
        logger_1.logger.info('  2. Deploy WarpReceiver on receiver chain');
        logger_1.logger.info('  3. Configure cross-chain handshake');
        logger_1.logger.info('  4. Return ready-to-use SDK instance\n');
        // Deploy and configure contracts
        const result = await ContractDeployer_1.ContractDeployer.deployContracts(config);
        logger_1.logger.info('🎉 Setup Complete!');
        logger_1.logger.info('='.repeat(60));
        logger_1.logger.info(`Sender:   ${result.senderAddress}`);
        logger_1.logger.info(`Receiver: ${result.receiverAddress}`);
        logger_1.logger.info('='.repeat(60) + '\n');
        // Create and return SDK instance
        return new Warp402_1.Warp402({
            privateKey: config.privateKey,
            senderChain: {
                rpc: config.senderChain.rpc,
                chainId: config.senderChain.chainId,
                blockchainId: config.senderChain.blockchainId,
                messenger: config.senderChain.messenger || DEFAULT_MESSENGER,
                sender: result.senderAddress
            },
            receiverChain: {
                rpc: config.receiverChain.rpc,
                chainId: config.receiverChain.chainId,
                blockchainId: config.receiverChain.blockchainId,
                messenger: config.receiverChain.messenger || DEFAULT_MESSENGER,
                receiver: result.receiverAddress
            }
        });
    }
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
    static async deployOnly(config) {
        logger_1.logger.info('📦 Deploying contracts only (no SDK initialization)\n');
        return await ContractDeployer_1.ContractDeployer.deployContracts(config);
    }
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
    static async configureOnly(params) {
        logger_1.logger.info('🔧 Configuring existing contracts\n');
        return await ContractDeployer_1.ContractDeployer.configureHandshake(params);
    }
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
    static fromExisting(config) {
        logger_1.logger.info('🔌 Connecting to existing contracts\n');
        return new Warp402_1.Warp402(config);
    }
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
    static async verify(params) {
        logger_1.logger.info('🔍 Verifying deployment...\n');
        return await ContractDeployer_1.ContractDeployer.verifyDeployment(params);
    }
}
exports.Warp402Factory = Warp402Factory;
//# sourceMappingURL=Warp402Factory.js.map