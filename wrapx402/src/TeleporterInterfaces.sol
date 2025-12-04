// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ITeleporterMessenger {
    struct TeleporterFeeInfo {
        address feeTokenAddress;
        uint256 amount;
    }

    struct TeleporterMessageInput {
        bytes32 destinationBlockchainID;
        address destinationAddress;
        TeleporterFeeInfo feeInfo;
        uint256 requiredGasLimit;
        address[] allowedRelayerAddresses;
        bytes message;
    }

    function sendCrossChainMessage(
        TeleporterMessageInput calldata input
    ) external payable returns (bytes32);
}

interface ITeleporterReceiver {
    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external;
}


interface ITeleporterRegistry {
    function getLatestTeleporterMessenger() external view returns (ITeleporterMessenger);
}
