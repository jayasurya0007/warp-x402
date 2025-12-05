"use strict";
/**
 * Smart contract ABIs for Warp402
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeleporterMessengerABI = exports.WarpReceiverABI = exports.WarpSenderABI = void 0;
exports.WarpSenderABI = [
    "function sendPayment(bytes32 paymentId, uint256 amount) payable returns (bytes32)",
    "function receiverChainId() view returns (bytes32)",
    "function receiverAddress() view returns (address)",
    "function teleporterMessenger() view returns (address)",
    "event PaymentSent(bytes32 indexed paymentId, address indexed payer, uint256 amount, bytes32 teleporterMessageId)"
];
exports.WarpReceiverABI = [
    "function hasPaid(bytes32 paymentId) view returns (bool)",
    "function getReceipt(bytes32 paymentId) view returns (address payer, uint256 amount, uint256 timestamp, bool consumed)",
    "function consumePayment(bytes32 paymentId) returns (bool)",
    "function senderChainId() view returns (bytes32)",
    "function senderAddress() view returns (address)",
    "function teleporterMessenger() view returns (address)",
    "event PaymentReceived(bytes32 indexed paymentId, address indexed payer, uint256 amount, uint256 timestamp)",
    "event PaymentConsumed(bytes32 indexed paymentId, address indexed consumer)"
];
exports.TeleporterMessengerABI = [
    "function sendCrossChainMessage(tuple(bytes32 destinationBlockchainID, address destinationAddress, address feeInfo, uint256 requiredGasLimit, address[] allowedRelayerAddresses, bytes message) messageInput) returns (bytes32)",
    "function receiveCrossChainMessage(uint256 messageIndex, address relayerRewardAddress) external",
    "event SendCrossChainMessage(bytes32 indexed messageID, bytes32 indexed destinationBlockchainID, tuple(bytes32 messageID, address senderAddress, bytes32 destinationBlockchainID, address destinationAddress, uint256 requiredGasLimit, bytes message) message, address feeTokenAddress, uint256 feeAmount)"
];
