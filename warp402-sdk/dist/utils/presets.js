"use strict";
/**
 * Pre-configured network presets for Warp-402 SDK
 * Allows instant setup with pre-deployed contracts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEPLOYED_CONTRACTS = exports.PRESETS = exports.FUJI_PRESET = exports.LOCAL_PRESET = void 0;
exports.withPrivateKey = withPrivateKey;
/**
 * Local development network preset
 * Uses locally deployed contracts on custom Avalanche subnets
 */
exports.LOCAL_PRESET = {
    senderChain: {
        rpc: 'http://127.0.0.1:9650/ext/bc/YOUR_SUBNET_A_ID/rpc',
        chainId: 1001,
        blockchainId: '0x' + '1'.repeat(64),
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
    },
    receiverChain: {
        rpc: 'http://127.0.0.1:9650/ext/bc/2fEmFBdd2Dfjh6nmrTjGTGNbnCb86moNHvCtrdP5bJxpftSEXA/rpc',
        chainId: 1002,
        blockchainId: '0x' + '2'.repeat(64),
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'
    }
};
/**
 * Fuji testnet preset
 * Uses officially deployed contracts on Avalanche Fuji C-Chain
 *
 * ✅ Production-ready contracts deployed and verified
 * ✅ Free to use for testing
 * ⚠️ For mainnet, deploy your own contracts for full control
 */
exports.FUJI_PRESET = {
    senderChain: {
        rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
        chainId: 43113,
        blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        sender: '0x0d45537c1DA893148dBB113407698E20CfA2eE56' // Deployed WarpSender on Fuji
    },
    receiverChain: {
        rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
        chainId: 43113,
        blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
        messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
        receiver: '0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f' // Deployed WarpReceiver on Fuji
    }
};
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
exports.PRESETS = {
    /**
     * Local development network
     * For testing on local Avalanche network
     */
    local: exports.LOCAL_PRESET,
    /**
     * Fuji testnet
     * For testing on public Avalanche testnet
     *
     * ⚠️ These contracts are for testing only
     * Deploy your own for production use
     */
    fuji: exports.FUJI_PRESET
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
function withPrivateKey(preset, privateKey) {
    return {
        ...preset,
        privateKey
    };
}
/**
 * Pre-deployed contract addresses for reference
 */
exports.DEPLOYED_CONTRACTS = {
    local: {
        sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922',
        receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922',
        network: 'Local Development Network',
        explorer: null
    },
    fuji: {
        sender: '0x0d45537c1DA893148dBB113407698E20CfA2eE56',
        receiver: '0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f',
        network: 'Avalanche Fuji Testnet (C-Chain)',
        explorer: 'https://testnet.snowtrace.io',
        senderUrl: 'https://testnet.snowtrace.io/address/0x0d45537c1DA893148dBB113407698E20CfA2eE56',
        receiverUrl: 'https://testnet.snowtrace.io/address/0x2A3E54D66c78cB58052B8eAb677c973814Bc8A3f'
    }
};
//# sourceMappingURL=presets.js.map