// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {WarpSender} from "../src/WarpSender.sol";

contract ConfigureSender is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        // REPLACE WITH YOUR DEPLOYED SENDER ADDRESS
        address senderAddress = vm.envOr("SENDER_ADDRESS", address(0));
        require(senderAddress != address(0), "SENDER_ADDRESS env var not set");
        
        WarpSender sender = WarpSender(senderAddress);

        // REPLACE WITH YOUR DEPLOYED RECEIVER ADDRESS
        address receiverAddress = vm.envOr("RECEIVER_ADDRESS", address(0));
        require(receiverAddress != address(0), "RECEIVER_ADDRESS env var not set");

        // Subnet B Blockchain ID (Must be 32 bytes)
        // You must provide this via env var or hardcode it
        bytes32 remoteBlockchainId = vm.envBytes32("REMOTE_BLOCKCHAIN_ID");

        sender.setRemoteReceiver(
            remoteBlockchainId,
            receiverAddress
        );

        vm.stopBroadcast();
    }
}

