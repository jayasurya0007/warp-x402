// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterMessenger} from "./TeleporterInterfaces.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WarpSender is Ownable, Pausable, ReentrancyGuard {
    ITeleporterMessenger public immutable MESSENGER;
    
    // Configured remote destination
    bytes32 public remoteBlockchainId;
    address public remoteReceiver;
    
    // Configurable gas limit for cross-chain messages
    uint256 public defaultGasLimit = 200000;
    uint256 public messageGasLimit = 100000;

    // Payment receipt structure
    struct PaymentReceipt {
        bytes32 paymentId;
        uint256 amount;
        address payer;
        uint256 timestamp;
        bool consumed;
    }

    // Events
    event PaymentSent(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount,
        bytes32 destinationChainId,
        address destinationReceiver
    );
    
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event GasLimitUpdated(uint256 messageGasLimit, uint256 paymentGasLimit);
    event RemoteReceiverUpdated(bytes32 blockchainId, address receiver);

    constructor(address _messenger) Ownable(msg.sender) {
        MESSENGER = ITeleporterMessenger(_messenger);
    }

    // Configure remote subnet receiver (owner only)
    function setRemoteReceiver(bytes32 _remoteBlockchainId, address _remoteReceiver) external onlyOwner {
        require(_remoteReceiver != address(0), "Invalid receiver address");
        require(_remoteBlockchainId != bytes32(0), "Invalid blockchain ID");
        remoteBlockchainId = _remoteBlockchainId;
        remoteReceiver = _remoteReceiver;
        emit RemoteReceiverUpdated(_remoteBlockchainId, _remoteReceiver);
    }
    
    // Configure gas limits (owner only)
    function setGasLimits(uint256 _messageGasLimit, uint256 _paymentGasLimit) external onlyOwner {
        require(_messageGasLimit > 0 && _messageGasLimit <= 1000000, "Invalid message gas limit");
        require(_paymentGasLimit > 0 && _paymentGasLimit <= 1000000, "Invalid payment gas limit");
        messageGasLimit = _messageGasLimit;
        defaultGasLimit = _paymentGasLimit;
        emit GasLimitUpdated(_messageGasLimit, _paymentGasLimit);
    }
    
    // Withdraw collected payments (owner only)
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), balance);
    }
    
    // Withdraw specific amount (owner only)
    function withdrawAmount(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), amount);
    }
    
    // Emergency pause (owner only)
    function pause() external onlyOwner {
        _pause();
    }
    
    // Unpause (owner only)
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Sends message to remote subnet
    function sendMessage(string calldata message) external payable whenNotPaused {
        require(remoteReceiver != address(0), "Receiver not set");
        require(remoteBlockchainId != bytes32(0), "Remote Chain ID not set");

        ITeleporterMessenger.TeleporterMessageInput memory input = ITeleporterMessenger.TeleporterMessageInput({
            destinationBlockchainID: remoteBlockchainId,
            destinationAddress: remoteReceiver,
            feeInfo: ITeleporterMessenger.TeleporterFeeInfo({
                feeTokenAddress: address(0),
                amount: 0
            }),
            requiredGasLimit: messageGasLimit,
            allowedRelayerAddresses: new address[](0),
            message: abi.encode(message)
        });

        MESSENGER.sendCrossChainMessage(input);
    }

    // Sends payment receipt to remote subnet
    function sendPayment(bytes32 paymentId) external payable whenNotPaused nonReentrant {
        require(remoteReceiver != address(0), "Receiver not set");
        require(remoteBlockchainId != bytes32(0), "Remote Chain ID not set");
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(paymentId != bytes32(0), "Payment ID cannot be empty");
        
        // Bind payment ID to payer to prevent replay attacks
        bytes32 securePaymentId = keccak256(abi.encodePacked(paymentId, msg.sender, block.timestamp));

        // Create payment receipt with secure ID
        PaymentReceipt memory receipt = PaymentReceipt({
            paymentId: securePaymentId,
            amount: msg.value,
            payer: msg.sender,
            timestamp: block.timestamp,
            consumed: false
        });

        // Encode payment receipt
        bytes memory encodedReceipt = abi.encode(receipt);

        ITeleporterMessenger.TeleporterMessageInput memory input = ITeleporterMessenger.TeleporterMessageInput({
            destinationBlockchainID: remoteBlockchainId,
            destinationAddress: remoteReceiver,
            feeInfo: ITeleporterMessenger.TeleporterFeeInfo({
                feeTokenAddress: address(0),
                amount: 0
            }),
            requiredGasLimit: defaultGasLimit,
            allowedRelayerAddresses: new address[](0),
            message: encodedReceipt
        });

        MESSENGER.sendCrossChainMessage(input);

        // Emit payment sent event with secure ID
        emit PaymentSent(securePaymentId, msg.sender, msg.value, remoteBlockchainId, remoteReceiver);
    }
    
    // Receive function to accept native tokens
    receive() external payable {}
}

