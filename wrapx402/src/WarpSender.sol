// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterMessenger} from "./TeleporterInterfaces.sol";

contract WarpSender {
    ITeleporterMessenger public immutable MESSENGER;
    
    // Configured remote destination
    bytes32 public remoteBlockchainId;
    address public remoteReceiver;

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
}

