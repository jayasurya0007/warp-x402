"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiverClient = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("../utils/contracts");
const encoding_1 = require("../utils/encoding");
const logger_1 = require("../utils/logger");
/**
 * Client for interacting with WarpReceiver contract
 */
class ReceiverClient {
    constructor(chain) {
        this.chain = chain;
        logger_1.logger.debug(`Initializing ReceiverClient for chain ${chain.chainId}`);
        // Initialize provider
        this.provider = new ethers_1.ethers.JsonRpcProvider(chain.rpc);
        // Initialize contract
        if (!chain.receiver) {
            throw new Error('Receiver contract address is required');
        }
        this.contract = new ethers_1.ethers.Contract(chain.receiver, contracts_1.WarpReceiverABI, this.provider);
        logger_1.logger.info(`ReceiverClient initialized on chain ${chain.chainId}`);
    }
    /**
     * Check if a payment has been received and verified
     * @param paymentId Payment identifier
     * @returns true if payment exists and is valid
     */
    async hasPaid(paymentId) {
        logger_1.logger.debug(`Checking payment status for ${paymentId}`);
        try {
            const paymentIdBytes32 = (0, encoding_1.toBytes32)(paymentId);
            const hasPaid = await this.contract.hasPaid(paymentIdBytes32);
            logger_1.logger.info(`Payment ${paymentId} status: ${hasPaid ? 'PAID' : 'NOT FOUND'}`);
            return hasPaid;
        }
        catch (error) {
            logger_1.logger.error(`Failed to check payment status: ${error.message}`);
            return false;
        }
    }
    /**
     * Get full payment receipt details
     * @param paymentId Payment identifier
     * @returns Payment receipt or null if not found
     */
    async getReceipt(paymentId) {
        logger_1.logger.debug(`Fetching receipt for payment ${paymentId}`);
        try {
            const paymentIdBytes32 = (0, encoding_1.toBytes32)(paymentId);
            const receipt = await this.contract.getReceipt(paymentIdBytes32);
            // Check if receipt exists (payer is not zero address)
            if (receipt.payer === ethers_1.ethers.ZeroAddress) {
                logger_1.logger.debug(`Receipt not found for payment ${paymentId}`);
                return null;
            }
            const paymentReceipt = {
                paymentId,
                amount: receipt.amount,
                payer: receipt.payer,
                timestamp: Number(receipt.timestamp),
                consumed: receipt.consumed
            };
            logger_1.logger.info(`Receipt found: ${ethers_1.ethers.formatEther(paymentReceipt.amount)} tokens from ${paymentReceipt.payer}`);
            return paymentReceipt;
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch receipt: ${error.message}`);
            return null;
        }
    }
    /**
     * Verify payment and get details
     * @param paymentId Payment identifier
     * @returns Payment verification result
     */
    async verify(paymentId) {
        const receipt = await this.getReceipt(paymentId);
        return {
            isValid: receipt !== null && !receipt.consumed,
            receipt: receipt || undefined
        };
    }
    /**
     * Consume a payment (mark as used)
     * @param paymentId Payment identifier
     * @param privateKey Private key for signing transaction
     * @returns Transaction result
     */
    async consume(paymentId, privateKey) {
        logger_1.logger.info(`Consuming payment ${paymentId}`);
        try {
            // Create signer
            const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
            const signer = new ethers_1.ethers.Wallet(formattedKey, this.provider);
            // Connect contract to signer
            const contractWithSigner = this.contract.connect(signer);
            // Format payment ID
            const paymentIdBytes32 = (0, encoding_1.toBytes32)(paymentId);
            // Send transaction
            const tx = await contractWithSigner.consumePayment(paymentIdBytes32, {
                gasLimit: 200000
            });
            logger_1.logger.debug(`Consumption transaction sent: ${tx.hash}`);
            // Wait for confirmation
            const receipt = await tx.wait();
            logger_1.logger.info(`Payment consumed successfully in block ${receipt.blockNumber}`);
            return {
                hash: receipt.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed,
                status: receipt.status
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to consume payment: ${error.message}`);
            throw new Error(`Consumption failed: ${error.message}`);
        }
    }
    /**
     * Get receiver contract configuration
     * @returns Contract configuration
     */
    async getConfiguration() {
        logger_1.logger.debug('Fetching receiver contract configuration');
        const [senderChainId, senderAddress, teleporterMessenger] = await Promise.all([
            this.contract.senderChainId(),
            this.contract.senderAddress(),
            this.contract.teleporterMessenger()
        ]);
        return {
            senderChainId,
            senderAddress,
            teleporterMessenger
        };
    }
    /**
     * Get chain configuration
     * @returns Chain configuration
     */
    getChainConfig() {
        return this.chain;
    }
}
exports.ReceiverClient = ReceiverClient;
