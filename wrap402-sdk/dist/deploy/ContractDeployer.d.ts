/**
 * Automated contract deployment and configuration
 * Simplifies the deployment process for developers
 */
export interface DeploymentConfig {
    privateKey: string;
    senderChain: {
        rpc: string;
        chainId: number;
        blockchainId: string;
        messenger?: string;
    };
    receiverChain: {
        rpc: string;
        chainId: number;
        blockchainId: string;
        messenger?: string;
    };
}
export interface DeploymentResult {
    senderAddress: string;
    receiverAddress: string;
    senderTxHash: string;
    receiverTxHash: string;
    configTxHashes: {
        senderConfig: string;
        receiverConfig: string;
    };
}
/**
 * Contract deployer class
 * Handles automated deployment and configuration of WarpSender and WarpReceiver
 */
export declare class ContractDeployer {
    /**
     * Deploy WarpSender and WarpReceiver contracts
     * @param config Deployment configuration
     * @returns Deployed contract addresses and transaction hashes
     */
    static deployContracts(config: DeploymentConfig): Promise<DeploymentResult>;
    /**
     * Deploy WarpSender contract
     */
    private static deployWarpSender;
    /**
     * Deploy WarpReceiver contract
     */
    private static deployWarpReceiver;
    /**
     * Configure cross-chain handshake between contracts
     */
    static configureHandshake(params: {
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
     * Verify deployment by checking contract configuration
     */
    static verifyDeployment(params: {
        senderAddress: string;
        receiverAddress: string;
        senderRpc: string;
        receiverRpc: string;
    }): Promise<boolean>;
}
//# sourceMappingURL=ContractDeployer.d.ts.map