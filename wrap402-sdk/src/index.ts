/**
 * Warp402 SDK - Cross-chain payment receipts for Avalanche Subnets
 * 
 * @packageDocumentation
 */

// Main SDK class
export { Warp402 } from './core/Warp402';

// Client classes
export { SenderClient } from './core/SenderClient';
export { ReceiverClient } from './core/ReceiverClient';
export { Config } from './core/Config';

// Types
export * from './types';

// Utilities
export * from './utils';

// Pre-configured network presets
export { PRESETS, DEPLOYED_CONTRACTS, withPrivateKey } from './utils/presets';

// Version
export const VERSION = '1.0.3';
