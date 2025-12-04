// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterReceiver} from "./TeleporterInterfaces.sol";

contract WarpReceiver is ITeleporterReceiver {
    address public immutable MESSENGER;
    
    // Payment receipt structure
    struct PaymentReceipt {
        bytes32 paymentId;
        uint256 amount;
        address payer;
        uint256 timestamp;
        bool consumed;
    }

    // Stores last received message
    string public lastMessage;
    
    // Remote sender allowed to send messages to this receiver
    address public approvedSender;
    bytes32 public approvedSourceBlockchainId;

    // Payment storage
    mapping(bytes32 => PaymentReceipt) public payments;
    
    // Required payment amount for access
    uint256 public requiredPaymentAmount;

    // Events
    event PaymentReceived(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentConsumed(
        bytes32 indexed paymentId,
        address indexed consumer
    );

    constructor(address _messenger) {
        MESSENGER = _messenger;
        requiredPaymentAmount = 0; // Default: no minimum required
    }

    // Modifier to ensure only Teleporter can call
    modifier onlyTeleporter() {
        require(msg.sender == MESSENGER, "Unauthorized: Not Teleporter Messenger");
        _;
    }

    // Owner configures who can send messages
    function setApprovedSender(bytes32 _sourceBlockchainId, address _sender) external {
        approvedSourceBlockchainId = _sourceBlockchainId;
        approvedSender = _sender;
    }

    // Set required payment amount
    function setRequiredPaymentAmount(uint256 _amount) external {
        requiredPaymentAmount = _amount;
    }

    // Check if payment has been made
    function hasPaid(bytes32 paymentId) public view returns (bool) {
        return payments[paymentId].paymentId != bytes32(0);
    }

    // Get payment receipt
    function getReceipt(bytes32 paymentId) public view returns (PaymentReceipt memory) {
        require(hasPaid(paymentId), "Payment not found");
        return payments[paymentId];
    }

    // Check if payment has been consumed
    function isConsumed(bytes32 paymentId) public view returns (bool) {
        require(hasPaid(paymentId), "Payment not found");
        return payments[paymentId].consumed;
    }

    // Consume a payment (mark as used)
    function consumePayment(bytes32 paymentId) external {
        require(hasPaid(paymentId), "Payment not found");
        require(!isConsumed(paymentId), "Payment already consumed");
        
        payments[paymentId].consumed = true;
        
        emit PaymentConsumed(paymentId, msg.sender);
    }

    // Called by Teleporter Messenger when message arrives
    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override onlyTeleporter {
        // Validate origin chain ID matches approved source
        require(
            approvedSourceBlockchainId == bytes32(0) || originBlockchainID == approvedSourceBlockchainId,
            "Unauthorized: Invalid Source Chain"
        );

        // Validate sender address is approved
        require(
            approvedSender == address(0) || originSenderAddress == approvedSender,
            "Unauthorized: Invalid Sender"
        );

        // Try to decode as PaymentReceipt first
        try this.decodePaymentReceipt(message) returns (PaymentReceipt memory receipt) {
            // Validate payment ID is not duplicate
            require(!hasPaid(receipt.paymentId), "Duplicate payment ID");

            // Validate payment amount meets requirement
            if (requiredPaymentAmount > 0) {
                require(receipt.amount >= requiredPaymentAmount, "Insufficient payment amount");
            }

            // Store payment receipt
            payments[receipt.paymentId] = receipt;

            // Emit payment received event
            emit PaymentReceived(receipt.paymentId, receipt.payer, receipt.amount, receipt.timestamp);
        } catch {
            // If not a payment receipt, treat as regular message
            string memory decodedMessage = abi.decode(message, (string));
            lastMessage = decodedMessage;
        }
    }

    // External function to decode payment receipt (for try-catch)
    function decodePaymentReceipt(bytes calldata message) external pure returns (PaymentReceipt memory) {
        return abi.decode(message, (PaymentReceipt));
    }
}

