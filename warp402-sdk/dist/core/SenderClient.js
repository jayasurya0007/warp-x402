"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderClient = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("../utils/contracts");
const encoding_1 = require("../utils/encoding");
const logger_1 = require("../utils/logger");
/**
 * Client for interacting with WarpSender contract
 */
class SenderClient {
    constructor(chain, privateKey) {
        this.chain = chain;
        logger_1.logger.debug(`Initializing SenderClient for chain ${chain.chainId}`);
        // Initialize provider
        this.provider = new ethers_1.ethers.JsonRpcProvider(chain.rpc);
        // Initialize wallet
        const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        this.wallet = new ethers_1.ethers.Wallet(formattedKey, this.provider);
        // Initialize contract
        if (!chain.sender) {
            throw new Error('Sender contract address is required');
        }
        this.contract = new ethers_1.ethers.Contract(chain.sender, contracts_1.WarpSenderABI, this.wallet);
        logger_1.logger.info(`SenderClient initialized on chain ${chain.chainId}`);
    }
    /**
     * Send a payment and generate cross-chain receipt
     * @param paymentId Unique payment identifier (32-byte hex string)
     * @param amount Amount to pay in wei
     * @returns Transaction result
     */
    async sendPayment(paymentId, amount) {
        logger_1.logger.info(`Sending payment ${paymentId} for ${ethers_1.ethers.formatEther(amount)} tokens`);
        try {
            // Format payment ID to bytes32
            const paymentIdBytes32 = (0, encoding_1.toBytes32)(paymentId);
            // Send transaction
            const tx = await this.contract.sendPayment(paymentIdBytes32, amount, {
                value: amount,
                gasLimit: 500000
            });
            logger_1.logger.debug(`Transaction sent: ${tx.hash}`);
            // Wait for confirmation
            const receipt = await tx.wait();
            logger_1.logger.info(`Payment sent successfully in block ${receipt.blockNumber}`);
            return {
                hash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed,
                status: receipt.status
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to send payment: ${error.message}`);
            throw new Error(`Payment failed: ${error.message}`);
        }
    }
    /**
     * Get wallet balance
     * @returns Balance in wei
     */
    async getBalance() {
        const balance = await this.provider.getBalance(this.wallet.address);
        logger_1.logger.debug(`Wallet balance: ${ethers_1.ethers.formatEther(balance)} tokens`);
        return balance;
    }
    /**
     * Get sender contract configuration
     * @returns Contract configuration
     */
    async getConfiguration() {
        logger_1.logger.debug('Fetching sender contract configuration');
        const [receiverChainId, receiverAddress, teleporterMessenger] = await Promise.all([
            this.contract.receiverChainId(),
            this.contract.receiverAddress(),
            this.contract.teleporterMessenger()
        ]);
        return {
            receiverChainId,
            receiverAddress,
            teleporterMessenger
        };
    }
    /**
     * Get wallet address
     * @returns Wallet address
     */
    getAddress() {
        return this.wallet.address;
    }
    /**
     * Get chain configuration
     * @returns Chain configuration
     */
    getChainConfig() {
        return this.chain;
    }
}
exports.SenderClient = SenderClient;
