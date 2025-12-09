"use strict";
/**
 * Automated contract deployment and configuration
 * Simplifies the deployment process for developers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractDeployer = void 0;
const ethers_1 = require("ethers");
const contracts_1 = require("../utils/contracts");
const bytecode_1 = require("./bytecode");
const logger_1 = require("../utils/logger");
const DEFAULT_MESSENGER = '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf';
/**
 * Contract deployer class
 * Handles automated deployment and configuration of WarpSender and WarpReceiver
 */
class ContractDeployer {
    /**
     * Deploy WarpSender and WarpReceiver contracts
     * @param config Deployment configuration
     * @returns Deployed contract addresses and transaction hashes
     */
    static async deployContracts(config) {
        logger_1.logger.info('🚀 Starting contract deployment...\n');
        const senderMessenger = config.senderChain.messenger || DEFAULT_MESSENGER;
        const receiverMessenger = config.receiverChain.messenger || DEFAULT_MESSENGER;
        // Deploy WarpSender
        logger_1.logger.info('📤 Deploying WarpSender...');
        const { address: senderAddress, txHash: senderTxHash } = await this.deployWarpSender(config.privateKey, config.senderChain.rpc, senderMessenger);
        logger_1.logger.info(`✅ WarpSender deployed at: ${senderAddress}`);
        logger_1.logger.info(`   Transaction: ${senderTxHash}\n`);
        // Deploy WarpReceiver
        logger_1.logger.info('📥 Deploying WarpReceiver...');
        const { address: receiverAddress, txHash: receiverTxHash } = await this.deployWarpReceiver(config.privateKey, config.receiverChain.rpc, receiverMessenger);
        logger_1.logger.info(`✅ WarpReceiver deployed at: ${receiverAddress}`);
        logger_1.logger.info(`   Transaction: ${receiverTxHash}\n`);
        // Configure handshake
        logger_1.logger.info('🔗 Configuring cross-chain handshake...');
        const configTxHashes = await this.configureHandshake({
            privateKey: config.privateKey,
            senderAddress,
            receiverAddress,
            senderChain: config.senderChain,
            receiverChain: config.receiverChain
        });
        logger_1.logger.info(`✅ Configuration complete\n`);
        return {
            senderAddress,
            receiverAddress,
            senderTxHash,
            receiverTxHash,
            configTxHashes
        };
    }
    /**
     * Deploy WarpSender contract
     */
    static async deployWarpSender(privateKey, rpc, messengerAddress) {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpc);
        const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
        // Create contract factory
        const factory = new ethers_1.ethers.ContractFactory(contracts_1.WarpSenderABI, bytecode_1.WARPSENDER_BYTECODE, wallet);
        // Deploy contract
        const contract = await factory.deploy(messengerAddress);
        const deployTx = contract.deploymentTransaction();
        if (!deployTx) {
            throw new Error('Deployment transaction not found');
        }
        // Wait for deployment
        await contract.waitForDeployment();
        const address = await contract.getAddress();
        return {
            address,
            txHash: deployTx.hash
        };
    }
    /**
     * Deploy WarpReceiver contract
     */
    static async deployWarpReceiver(privateKey, rpc, messengerAddress) {
        const provider = new ethers_1.ethers.JsonRpcProvider(rpc);
        const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
        // Create contract factory
        const factory = new ethers_1.ethers.ContractFactory(contracts_1.WarpReceiverABI, bytecode_1.WARPRECEIVER_BYTECODE, wallet);
        // Deploy contract
        const contract = await factory.deploy(messengerAddress);
        const deployTx = contract.deploymentTransaction();
        if (!deployTx) {
            throw new Error('Deployment transaction not found');
        }
        // Wait for deployment
        await contract.waitForDeployment();
        const address = await contract.getAddress();
        return {
            address,
            txHash: deployTx.hash
        };
    }
    /**
     * Configure cross-chain handshake between contracts
     */
    static async configureHandshake(params) {
        // Configure sender -> receiver
        logger_1.logger.info('  → Setting remote receiver on sender...');
        const senderProvider = new ethers_1.ethers.JsonRpcProvider(params.senderChain.rpc);
        const senderWallet = new ethers_1.ethers.Wallet(params.privateKey, senderProvider);
        const senderContract = new ethers_1.ethers.Contract(params.senderAddress, contracts_1.WarpSenderABI, senderWallet);
        const tx1 = await senderContract.setRemoteReceiver(params.receiverChain.blockchainId, params.receiverAddress);
        await tx1.wait();
        logger_1.logger.info(`    ✓ Sender configured (${tx1.hash})`);
        // Configure receiver -> sender
        logger_1.logger.info('  → Setting approved sender on receiver...');
        const receiverProvider = new ethers_1.ethers.JsonRpcProvider(params.receiverChain.rpc);
        const receiverWallet = new ethers_1.ethers.Wallet(params.privateKey, receiverProvider);
        const receiverContract = new ethers_1.ethers.Contract(params.receiverAddress, contracts_1.WarpReceiverABI, receiverWallet);
        const tx2 = await receiverContract.setApprovedSender(params.senderChain.blockchainId, params.senderAddress);
        await tx2.wait();
        logger_1.logger.info(`    ✓ Receiver configured (${tx2.hash})`);
        return {
            senderConfig: tx1.hash,
            receiverConfig: tx2.hash
        };
    }
    /**
     * Verify deployment by checking contract configuration
     */
    static async verifyDeployment(params) {
        try {
            const senderProvider = new ethers_1.ethers.JsonRpcProvider(params.senderRpc);
            const senderContract = new ethers_1.ethers.Contract(params.senderAddress, contracts_1.WarpSenderABI, senderProvider);
            const receiverProvider = new ethers_1.ethers.JsonRpcProvider(params.receiverRpc);
            const receiverContract = new ethers_1.ethers.Contract(params.receiverAddress, contracts_1.WarpReceiverABI, receiverProvider);
            // Check sender configuration
            const remoteReceiver = await senderContract.remoteReceiver();
            if (remoteReceiver.toLowerCase() !== params.receiverAddress.toLowerCase()) {
                logger_1.logger.error('❌ Sender not configured correctly');
                return false;
            }
            // Check receiver configuration
            const approvedSender = await receiverContract.approvedSender();
            if (approvedSender.toLowerCase() !== params.senderAddress.toLowerCase()) {
                logger_1.logger.error('❌ Receiver not configured correctly');
                return false;
            }
            logger_1.logger.info('✅ Deployment verified successfully');
            return true;
        }
        catch (error) {
            logger_1.logger.error(`❌ Verification failed: ${error}`);
            return false;
        }
    }
}
exports.ContractDeployer = ContractDeployer;
//# sourceMappingURL=ContractDeployer.js.map