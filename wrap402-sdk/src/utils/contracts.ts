/**
 * Smart contract ABIs for Warp402
 */

export const WarpSenderABI = [
  // Constructor
  "constructor(address _messenger)",
  
  // Core payment functions
  "function sendPayment(bytes32 paymentId) payable",
  "function sendMessage(string message) payable",
  
  // Configuration functions (owner only)
  "function setRemoteReceiver(bytes32 _remoteBlockchainId, address _remoteReceiver)",
  
  // Fund management (owner only)
  "function withdraw()",
  "function withdrawAmount(uint256 amount)",
  "function getBalance() view returns (uint256)",
  
  // Emergency controls (owner only)
  "function pause()",
  "function unpause()",
  
  // View functions
  "function remoteBlockchainId() view returns (bytes32)",
  "function remoteReceiver() view returns (address)",
  "function MESSENGER() view returns (address)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function defaultGasLimit() view returns (uint256)",
  "function messageGasLimit() view returns (uint256)",
  
  // Events
  "event PaymentSent(bytes32 indexed paymentId, address indexed payer, uint256 amount, bytes32 destinationChainId, address destinationReceiver)",
  "event FundsWithdrawn(address indexed owner, uint256 amount)",
  "event GasLimitUpdated(uint256 messageGasLimit, uint256 paymentGasLimit)",
  "event RemoteReceiverUpdated(bytes32 blockchainId, address receiver)"
];

export const WarpReceiverABI = [
  // Constructor
  "constructor(address _messenger)",
  
  // Payment query functions
  "function hasPaid(bytes32 paymentId) view returns (bool)",
  "function getReceipt(bytes32 paymentId) view returns (tuple(bytes32 paymentId, uint256 amount, address payer, uint256 timestamp, bool consumed))",
  "function isConsumed(bytes32 paymentId) view returns (bool)",
  "function isExpired(bytes32 paymentId) view returns (bool)",
  "function isValidPayment(bytes32 paymentId) view returns (bool)",
  
  // Payment consumption
  "function consumePayment(bytes32 paymentId)",
  
  // Configuration functions (owner only)
  "function setApprovedSender(bytes32 _sourceBlockchainId, address _sender)",
  "function setRequiredPaymentAmount(uint256 _amount)",
  "function setPaymentExpiryTime(uint256 _expiryTime)",
  
  // Emergency controls (owner only)
  "function pause()",
  "function unpause()",
  
  // View functions
  "function approvedSender() view returns (address)",
  "function approvedSourceBlockchainId() view returns (bytes32)",
  "function MESSENGER() view returns (address)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function requiredPaymentAmount() view returns (uint256)",
  "function paymentExpiryTime() view returns (uint256)",
  "function lastMessage() view returns (string)",
  
  // Events
  "event PaymentReceived(bytes32 indexed paymentId, address indexed payer, uint256 amount, uint256 timestamp)",
  "event PaymentConsumed(bytes32 indexed paymentId, address indexed consumer)",
  "event ApprovedSenderUpdated(bytes32 blockchainId, address sender)",
  "event RequiredAmountUpdated(uint256 newAmount)",
  "event PaymentExpiryUpdated(uint256 newExpiry)"
];

export const TeleporterMessengerABI = [
  "function sendCrossChainMessage(tuple(bytes32 destinationBlockchainID, address destinationAddress, address feeInfo, uint256 requiredGasLimit, address[] allowedRelayerAddresses, bytes message) messageInput) returns (bytes32)",
  "function receiveCrossChainMessage(uint256 messageIndex, address relayerRewardAddress) external",
  "event SendCrossChainMessage(bytes32 indexed messageID, bytes32 indexed destinationBlockchainID, tuple(bytes32 messageID, address senderAddress, bytes32 destinationBlockchainID, address destinationAddress, uint256 requiredGasLimit, bytes message) message, address feeTokenAddress, uint256 feeAmount)"
];
