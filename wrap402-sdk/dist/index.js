"use strict";
/**
 * Warp402 SDK - Cross-chain payment receipts for Avalanche Subnets
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.Config = exports.ReceiverClient = exports.SenderClient = exports.Warp402 = void 0;
// Main SDK class
var Warp402_1 = require("./core/Warp402");
Object.defineProperty(exports, "Warp402", { enumerable: true, get: function () { return Warp402_1.Warp402; } });
// Client classes
var SenderClient_1 = require("./core/SenderClient");
Object.defineProperty(exports, "SenderClient", { enumerable: true, get: function () { return SenderClient_1.SenderClient; } });
var ReceiverClient_1 = require("./core/ReceiverClient");
Object.defineProperty(exports, "ReceiverClient", { enumerable: true, get: function () { return ReceiverClient_1.ReceiverClient; } });
var Config_1 = require("./core/Config");
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return Config_1.Config; } });
// Types
__exportStar(require("./types"), exports);
// Utilities
__exportStar(require("./utils"), exports);
// Version
exports.VERSION = '1.0.0';
//# sourceMappingURL=index.js.map