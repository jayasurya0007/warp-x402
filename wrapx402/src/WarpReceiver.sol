// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterReceiver} from "./TeleporterInterfaces.sol";

contract WarpReceiver is ITeleporterReceiver {
    address public immutable MESSENGER;
    
    // Stores last received message
    string public lastMessage;
    
    // Remote sender allowed to send messages to this receiver
    address public approvedSender;
    bytes32 public approvedSourceBlockchainId;

    constructor(address _messenger) {
        MESSENGER = _messenger;
    }

    // Owner configures who can send messages
    function setApprovedSender(bytes32 _sourceBlockchainId, address _sender) external {
        approvedSourceBlockchainId = _sourceBlockchainId;
        approvedSender = _sender;
    }

    // Called by Teleporter Messenger when message arrives
    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override {
        // Verify the caller is the Teleporter Messenger
        require(msg.sender == MESSENGER, "Unauthorized: Not Teleporter Messenger");

        // Verify the source chain and sender
        // require(originBlockchainID == approvedSourceBlockchainId, "Unauthorized: Invalid Source Chain");
        // require(originSenderAddress == approvedSender, "Unauthorized: Invalid Sender");

        // Decode the message (matching abi.encode in Sender)
        string memory decodedMessage = abi.decode(message, (string));
        
        lastMessage = decodedMessage;
    }
}

