/**
 * Pre-configured network presets for Warp-402 SDK
 * Allows instant setup with pre-deployed contracts
 */

import type { Warp402Config } from '../types';

/**
 * Local development network preset
 * Uses locally deployed contracts on custom Avalanche subnets
 */
export const LOCAL_PRESET: Omit<Warp402Config, 'privateKey'> = {
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
 * ⚠️ For testing only - deploy your own contracts for production
 */
export const FUJI_PRESET: Omit<Warp402Config, 'privateKey'> = {
  senderChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'  // Pre-deployed WarpSender
  },
  receiverChain: {
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockchainId: '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922'  // Pre-deployed WarpReceiver
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
export const PRESETS = {
  /**
   * Local development network
   * For testing on local Avalanche network
   */
  local: LOCAL_PRESET,
  
  /**
   * Fuji testnet
   * For testing on public Avalanche testnet
   * 
   * ⚠️ These contracts are for testing only
   * Deploy your own for production use
   */
  fuji: FUJI_PRESET
} as const;

/**
 * Helper to create config with preset + private key
 * 
 * @example
 * ```typescript
 * const config = withPrivateKey(PRESETS.fuji, process.env.PRIVATE_KEY!);
 * const warp = new Warp402(config);
 * ```
 */
export function withPrivateKey(
  preset: Omit<Warp402Config, 'privateKey'>,
  privateKey: string
): Warp402Config {
  return {
    ...preset,
    privateKey
  };
}

/**
 * Pre-deployed contract addresses for reference
 */
export const DEPLOYED_CONTRACTS = {
  local: {
    sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922',
    receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922',
    network: 'Local Development Network',
    explorer: null
  },
  fuji: {
    sender: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922',
    receiver: '0x52C84043CD9c865236f11d9Fc9F56aa003c1f922',
    network: 'Avalanche Fuji Testnet',
    explorer: 'https://testnet.snowtrace.io'
  }
} as const;
