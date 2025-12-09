/**
 * Configuration types for Warp402 SDK
 */

export interface ChainConfig {
  /** RPC endpoint URL */
  rpc: string;
  
  /** EVM chain ID (e.g., 43113 for Fuji C-Chain) */
  chainId: number;
  
  /** Avalanche blockchain ID (bytes32 format) */
  blockchainId: string;
  
  /** Teleporter Messenger contract address */
  messenger: string;
  
  /** WarpSender contract address (optional, for sender chain) */
  sender?: string;
  
  /** WarpReceiver contract address (optional, for receiver chain) */
  receiver?: string;
}

export interface Warp402Config {
  /** Configuration for the chain where payments are sent */
  senderChain: ChainConfig;
  
  /** Configuration for the chain where receipts are verified */
  receiverChain: ChainConfig;
  
  /** Private key for signing transactions (without 0x prefix) */
  privateKey: string;
}
