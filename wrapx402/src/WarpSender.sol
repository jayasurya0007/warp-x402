// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterMessenger} from "./TeleporterInterfaces.sol";

contract WarpSender {
    ITeleporterMessenger public immutable MESSENGER;
    
    // Configured remote destination
    bytes32 public remoteBlockchainId;
    address public remoteReceiver;

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

    constructor(address _messenger) {
        MESSENGER = ITeleporterMessenger(_messenger);
    }

    // Configure remote subnet receiver
    function setRemoteReceiver(bytes32 _remoteBlockchainId, address _remoteReceiver) external {
        remoteBlockchainId = _remoteBlockchainId;
        remoteReceiver = _remoteReceiver;
    }

    // Sends message to remote subnet
    function sendMessage(string calldata message) external payable {
        require(remoteReceiver != address(0), "Receiver not set");
        require(remoteBlockchainId != bytes32(0), "Remote Chain ID not set");

        ITeleporterMessenger.TeleporterMessageInput memory input = ITeleporterMessenger.TeleporterMessageInput({
            destinationBlockchainID: remoteBlockchainId,
            destinationAddress: remoteReceiver,
            feeInfo: ITeleporterMessenger.TeleporterFeeInfo({
                feeTokenAddress: address(0),
                amount: 0
            }),
            requiredGasLimit: 100000, // Default gas limit
            allowedRelayerAddresses: new address[](0),
            message: abi.encode(message)
        });

        MESSENGER.sendCrossChainMessage(input);
    }

    // Sends payment receipt to remote subnet
    function sendPayment(bytes32 paymentId) external payable {
        require(remoteReceiver != address(0), "Receiver not set");
        require(remoteBlockchainId != bytes32(0), "Remote Chain ID not set");
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(paymentId != bytes32(0), "Payment ID cannot be empty");

        // Create payment receipt
        PaymentReceipt memory receipt = PaymentReceipt({
            paymentId: paymentId,
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
            requiredGasLimit: 200000, // Higher gas limit for payment processing
            allowedRelayerAddresses: new address[](0),
            message: encodedReceipt
        });

        MESSENGER.sendCrossChainMessage(input);

        // Emit payment sent event
        emit PaymentSent(paymentId, msg.sender, msg.value, remoteBlockchainId, remoteReceiver);
    }
}

